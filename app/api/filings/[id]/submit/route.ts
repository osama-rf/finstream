import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Get company CR for reference number
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('commercial_registration')
      .eq('id', profile?.company_id)
      .single() as { data: any };

    const cr = (company?.commercial_registration || '0000').slice(-4);
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 9000 + 1000);
    const referenceNumber = `MC-${year}-${cr}-${rand}`;

    const { data: filing, error } = await supabaseAdmin
      .from('filings')
      .update({
        status: 'submitted',
        reference_number: referenceNumber,
        filed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', profile?.company_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: { filing, reference_number: referenceNumber } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
