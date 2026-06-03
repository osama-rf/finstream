import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createRouteHandlerClient();
    await supabase.auth.signOut();

    const response = NextResponse.json({ success: true });
    response.cookies.delete('user_role');
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 });
  }
}
