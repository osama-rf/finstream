import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createRouteHandlerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('company_id')
      .eq('id', authUser.id)
      .single() as { data: any };

    const body = await req.json();
    const { status, notes } = body;

    const validStatuses = ['pending', 'in_review', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'حالة غير صالحة' }, { status: 400 });
    }

    const updateData: any = { status };
    if (status === 'approved' || status === 'rejected') {
      updateData.reviewed_by = authUser.id;
      updateData.reviewed_at = new Date().toISOString();
    }
    if (notes) updateData.notes = notes;

    const { data: approval, error } = await supabaseAdmin
      .from('approvals')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', profile?.company_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: approval });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
