import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('*, companies(*)')
      .eq('id', authData.user.id)
      .single() as { data: any };

    const response = NextResponse.json({ success: true, data: userData });

    response.cookies.set('user_role', userData?.role || '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 });
  }
}
