import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    // Use admin client to bypass RLS — profile is already auth-gated above
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*, companies(*)')
      .eq('id', authUser.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: userData });
  } catch {
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 });
  }
}
