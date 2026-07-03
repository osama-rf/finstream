import { generateCreditReport } from '@/lib/ai/finance-agent';

export async function GET() {
  try {
    const report = await generateCreditReport();
    return Response.json({ success: true, report });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
