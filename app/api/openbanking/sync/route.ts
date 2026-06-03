import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getToken, getTransactions, getBalance } from '@/lib/openbanking/client';
import { MOCK_TRANSACTIONS, mapSingleViewTransaction } from '@/lib/openbanking/mapper';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('company_id')
      .eq('id', authUser.id)
      .single() as { data: any };

    if (!profile?.company_id) return NextResponse.json({ success: false, error: 'لا توجد شركة مرتبطة' }, { status: 400 });

    const companyId = profile.company_id;
    const body = await req.json().catch(() => ({}));
    const consentId = body.consentId || 'MOCK-CONSENT-001';
    const bankCode = body.bankCode || 'SVMB01';
    const accountId = body.accountId || 'MOCK-ACCOUNT-001';

    // Try real API, fallback to mock
    const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = new Date().toISOString();

    let rawTransactions: any[] | null = null;
    let balance = 1840000;

    try {
      const token = await getToken();
      rawTransactions = await getTransactions(token, consentId, accountId, bankCode, fromDate, toDate);
      const balanceData = await getBalance(token, consentId, accountId, bankCode);
      balance = parseFloat(balanceData.amount);
    } catch {
      // Fall through to mock
    }

    const transactions = rawTransactions
      ? rawTransactions.map(mapSingleViewTransaction)
      : MOCK_TRANSACTIONS;

    // Upsert — skip duplicates by reference_number
    let synced = 0;
    let duplicates = 0;

    for (const tx of transactions) {
      const { data: existing } = await supabaseAdmin
        .from('bank_transactions')
        .select('id')
        .eq('company_id', companyId)
        .eq('reference_number', tx.reference_number)
        .single();

      if (existing) {
        duplicates++;
        continue;
      }

      await supabaseAdmin.from('bank_transactions').insert({
        ...tx,
        company_id: companyId,
      });
      synced++;
    }

    // Fetch updated list
    const { data: allTransactions } = await supabaseAdmin
      .from('bank_transactions')
      .select('*')
      .eq('company_id', companyId)
      .order('transaction_date', { ascending: false });

    return NextResponse.json({
      success: true,
      data: { synced, duplicates, balance, transactions: allTransactions || [] },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'خطأ في المزامنة' }, { status: 500 });
  }
}
