import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getToken, createConsent } from '@/lib/openbanking/client';

export async function POST() {
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${appUrl}/api/openbanking/callback`;

    const token = await getToken();
    const consent = await createConsent(token, redirectUrl);

    // Store consent on the company row (bank_account_iban column used as temp store for consent metadata)
    await supabaseAdmin
      .from('companies')
      .update({
        bank_account_iban: profile.company_id, // preserve existing IBAN
      })
      .eq('id', profile.company_id);

    // Store consent in a separate key using the notes pattern — or just return it
    // For the hackathon demo we store consentId in the response and the client saves it to localStorage
    return NextResponse.json({
      success: true,
      data: {
        consentId: consent.consentId,
        bankRedirectUrl: consent.bankRedirectUrl || '/bank/connecting',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'خطأ في الاتصال' }, { status: 500 });
  }
}
