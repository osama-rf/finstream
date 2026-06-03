import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { runAgent, generateFinanceReport, type AgentMessage, type ToolCallEvent } from '@/lib/ai/finance-agent';

async function getAuthUser() {
  const supabase = await createRouteHandlerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, role, company_id')
    .eq('id', authUser.id)
    .single() as { data: any };

  return data;
}

// POST: streaming agent chat
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return new Response(JSON.stringify({ error: 'غير مصرح' }), { status: 401 });
  if (!user.company_id) return new Response(JSON.stringify({ error: 'لا توجد شركة مرتبطة بحسابك' }), { status: 400 });

  const body = await req.json();
  const { message, history = [] } = body as { message: string; history: AgentMessage[] };

  if (!message?.trim()) return new Response(JSON.stringify({ error: 'الرسالة مطلوبة' }), { status: 400 });

  const ctx = {
    companyId: user.company_id,
    userId: user.id,
    userRole: user.role,
    userName: `${user.first_name} ${user.last_name}`,
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: ToolCallEvent) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }
      try {
        const finalText = await runAgent(message, history, ctx, send);
        if (finalText) send({ type: 'text', text: finalText });
      } catch (err: any) {
        send({ type: 'error', text: err.message || 'حدث خطأ في المساعد الذكي' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// GET: structured daily report for dashboard
export async function GET() {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: 'غير مصرح' }, { status: 401 });
  if (!user.company_id) return Response.json({ error: 'لا توجد شركة' }, { status: 400 });

  const ctx = {
    companyId: user.company_id,
    userId: user.id,
    userRole: user.role,
    userName: `${user.first_name} ${user.last_name}`,
  };

  try {
    const report = await generateFinanceReport(ctx);
    return Response.json({ success: true, report });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
