import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    // Use admin to bypass RLS when reading caller profile
    const { data: callerProfile } = await supabaseAdmin
      .from('users')
      .select('role, company_id')
      .eq('id', authUser.id)
      .single() as { data: any };

    if (!callerProfile || (callerProfile.role !== 'company_admin' && callerProfile.role !== 'super_admin')) {
      return NextResponse.json({ success: false, error: 'غير مصرح — فقط مدير الشركة يمكنه إضافة أعضاء' }, { status: 403 });
    }

    const { first_name, last_name, email, password, role } = await req.json();

    if (!first_name || !email || !password) {
      return NextResponse.json({ success: false, error: 'يرجى ملء جميع الحقول المطلوبة' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 });
    }

    const allowedRoles = ['accountant', 'auditor', 'company_admin'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'صلاحية غير صالحة' }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ success: false, error: 'فشل إنشاء الحساب' }, { status: 400 });
    }

    const { data: newUser, error: userError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      email,
      first_name,
      last_name: last_name || '',
      role,
      status: 'active',
      company_id: callerProfile.company_id,
    }).select().single();

    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'خطأ في الخادم' }, { status: 500 });
  }
}
