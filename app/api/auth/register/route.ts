import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_name_ar, company_name_en, commercial_registration, first_name, last_name, email, password } = body;

    if (!company_name_ar || !commercial_registration || !first_name || !email || !password) {
      return NextResponse.json({ success: false, error: 'يرجى ملء جميع الحقول المطلوبة' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 });
    }

    // Check email not already used
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
    }

    // Check commercial registration not already used
    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('commercial_registration', commercial_registration)
      .single();

    if (existingCompany) {
      return NextResponse.json({ success: false, error: 'رقم السجل التجاري مسجل بالفعل' }, { status: 409 });
    }

    // Create company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: company_name_en || company_name_ar,
        name_ar: company_name_ar,
        commercial_registration,
        is_active: true,
      })
      .select()
      .single();

    if (companyError) throw companyError;

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      await supabaseAdmin.from('companies').delete().eq('id', company.id);
      return NextResponse.json({ success: false, error: 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.' }, { status: 400 });
    }

    // Create user profile
    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      email,
      first_name,
      last_name: last_name || '',
      role: 'company_admin',
      status: 'active',
      company_id: company.id,
    });

    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      await supabaseAdmin.from('companies').delete().eq('id', company.id);
      throw userError;
    }

    return NextResponse.json({ success: true, data: { company_id: company.id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'خطأ في الخادم' }, { status: 500 });
  }
}
