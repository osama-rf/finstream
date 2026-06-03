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
        data: {
          stage1: { status: 'pending', count: 0, total: 0 },
          stage2: { status: 'pending', count: 0, total: 0 },
          stage3: { status: 'pending', count: 0, total: 0 },
          stage4: { status: 'pending', count: 0, total: 0 },
          stage5: { status: 'pending', count: 0, total: 0 },
        },
      });
    }

    const companyId = profile.company_id;

    const [txTotal, txClassified, stmts, approvals, filings] = await Promise.all([
      supabaseAdmin.from('bank_transactions').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
      supabaseAdmin.from('bank_transactions').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('is_reconciled', true),
      supabaseAdmin.from('financial_statements').select('id, status').eq('company_id', companyId),
      supabaseAdmin.from('approvals').select('id, status').eq('company_id', companyId),
      supabaseAdmin.from('filings').select('id, status').eq('company_id', companyId),
    ]);

    const totalTx = txTotal.count ?? 0;
    const classifiedTx = txClassified.count ?? 0;
    const stmtList = (stmts.data || []) as any[];
    const approvalList = (approvals.data || []) as any[];
    const filingList = (filings.data || []) as any[];

    const approvedApprovals = approvalList.filter((a) => a.status === 'approved').length;
    const totalApprovals = approvalList.length;

    // Stage 1: Bank connected (has transactions)
    const stage1Status = totalTx > 0 ? 'complete' : 'pending';

    // Stage 2: AI Agent classified transactions
    const stage2Status =
      totalTx === 0 ? 'pending' :
      classifiedTx === totalTx ? 'complete' :
      classifiedTx > 0 ? 'in_progress' : 'pending';

    // Stage 3: Financial statements generated
    const stage3Status =
      stmtList.length === 0 ? 'pending' :
      stmtList.some((s) => s.status === 'approved' || s.status === 'filed') ? 'complete' :
      'in_progress';

    // Stage 4: Approvals
    const stage4Status =
      totalApprovals === 0 ? 'pending' :
      approvedApprovals === totalApprovals ? 'complete' :
      approvedApprovals > 0 ? 'in_progress' : 'pending';

    // Stage 5: Filings
    const acknowledgedFilings = filingList.filter((f) => f.status === 'acknowledged' || f.status === 'submitted').length;
    const stage5Status =
      filingList.length === 0 ? 'pending' :
      acknowledgedFilings > 0 ? 'complete' : 'in_progress';

    return NextResponse.json({
      success: true,
      data: {
        stage1: { status: stage1Status, count: totalTx, total: totalTx },
        stage2: { status: stage2Status, count: classifiedTx, total: totalTx },
        stage3: { status: stage3Status, count: stmtList.filter((s) => s.status !== 'draft').length, total: stmtList.length },
        stage4: { status: stage4Status, count: approvedApprovals, total: totalApprovals },
        stage5: { status: stage5Status, count: acknowledgedFilings, total: filingList.length },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
