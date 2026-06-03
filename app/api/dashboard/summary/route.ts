import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('company_id')
      .eq('id', authUser.id)
      .single() as { data: any };

    if (!profile?.company_id) {
      return NextResponse.json({
        success: true,
        data: { current_balance: 0, total_revenue: 0, total_expenses: 0, net_profit: 0, unclassified_count: 0, recent_transactions: [] },
      });
    }

    const companyId = profile.company_id;

    const [latestTx, allTx, recentTx] = await Promise.all([
      supabaseAdmin
        .from('bank_transactions')
        .select('balance_after')
        .eq('company_id', companyId)
        .order('transaction_date', { ascending: false })
        .limit(1)
        .single(),
      supabaseAdmin
        .from('bank_transactions')
        .select('amount, type, is_reconciled')
        .eq('company_id', companyId),
      supabaseAdmin
        .from('bank_transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('transaction_date', { ascending: false })
        .limit(5),
    ]);

    const txList = (allTx.data || []) as any[];
    const totalRevenue = txList.filter((t) => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = txList.filter((t) => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0);
    const unclassifiedCount = txList.filter((t) => !t.is_reconciled).length;

    return NextResponse.json({
      success: true,
      data: {
        current_balance: Number((latestTx.data as any)?.balance_after ?? 0),
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_profit: totalRevenue - totalExpenses,
        unclassified_count: unclassifiedCount,
        recent_transactions: recentTx.data || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
