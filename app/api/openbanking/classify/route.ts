import { createRouteHandlerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { classifyTransactionWithGemini } from '@/lib/ai/finance-agent';

export async function POST() {
  const supabase = await createRouteHandlerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return new Response(JSON.stringify({ error: 'غير مصرح' }), { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('company_id, id')
    .eq('id', authUser.id)
    .single() as { data: any };

  if (!profile?.company_id) return new Response(JSON.stringify({ error: 'لا توجد شركة' }), { status: 400 });

  const companyId = profile.company_id;
  const userId = profile.id;

  // Fetch all unclassified transactions
  const { data: transactions } = await supabaseAdmin
    .from('bank_transactions')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_reconciled', false)
    .order('transaction_date', { ascending: false });

  const txList = (transactions || []) as any[];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      send({ type: 'start', total: txList.length, message: 'الوكيل يبدأ تحليل المعاملات...' });

      let classified = 0;
      let journalEntries = 0;

      // Process in batches of 3 for speed
      for (let i = 0; i < txList.length; i += 3) {
        const batch = txList.slice(i, i + 3);

        // Emit thinking for all in batch
        for (const tx of batch) {
          send({ type: 'thinking', transactionId: tx.id, description: tx.description });
        }

        // Classify all in batch concurrently
        const results = await Promise.all(
          batch.map(async (tx) => {
            try {
              const result = await classifyTransactionWithGemini(tx);
              return { tx, result, error: null };
            } catch (err: any) {
              return { tx, result: null, error: err.message };
            }
          })
        );

        for (const { tx, result, error } of results) {
          if (error || !result) {
            send({ type: 'error', transactionId: tx.id, message: error || 'فشل التصنيف' });
            continue;
          }

          // Update transaction in DB
          await supabaseAdmin
            .from('bank_transactions')
            .update({
              category: result.category,
              account_code: result.account_code,
              is_reconciled: true,
              classified_by_ai: true,
              classified_at: new Date().toISOString(),
            })
            .eq('id', tx.id)
            .eq('company_id', companyId);

          // Create journal entry
          const { data: entry } = await supabaseAdmin
            .from('journal_entries')
            .insert({
              company_id: companyId,
              entry_date: tx.transaction_date,
              description: tx.description,
              debit_account: result.debit_account,
              credit_account: result.credit_account,
              amount: tx.amount,
              transaction_id: tx.id,
              auto_generated: true,
              created_by: userId,
            })
            .select('id')
            .single() as { data: any };

          classified++;
          journalEntries++;

          send({
            type: 'classified',
            transactionId: tx.id,
            description: tx.description,
            category: result.category,
            confidence: result.confidence,
            debitAccount: result.debit_account,
            creditAccount: result.credit_account,
            amount: tx.amount,
            txType: tx.type,
            journalEntryId: entry?.id ?? null,
            reasoning: result.reasoning,
          });
        }
      }

      send({
        type: 'complete',
        classified,
        journalEntries,
        message: `اكتمل التصنيف — صُنّفت ${classified} معاملة وأُنشئت ${journalEntries} قيد محاسبي`,
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
