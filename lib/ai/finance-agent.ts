import { supabaseAdmin } from '@/lib/supabase/server';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AgentMessage = {
  role: 'user' | 'model';
  parts: Array<{ text?: string; functionCall?: any; functionResponse?: any }>;
};

export type AgentContext = {
  companyId: string;
  userId: string;
  userRole: string;
  userName: string;
};

export type ToolCallEvent = {
  type: 'tool_start' | 'tool_done' | 'text' | 'error';
  toolName?: string;
  text?: string;
};

export type ReportItem = { text: string; page?: string };

export type FinanceReport = {
  generated_at: string;
  attention_level: 'low' | 'medium' | 'high';
  summary: string;
  highlights: Array<{ label: string; value: string; alert?: boolean }>;
  priorities: ReportItem[];
  actions_taken: string[];
  next_steps: ReportItem[];
};

// ─── Tool Declarations ───────────────────────────────────────────────────────

const TOOL_DECLARATIONS = [
  {
    name: 'get_financial_summary',
    description: 'احصل على ملخص مالي شامل: الرصيد البنكي، الإيرادات، المصروفات، وصافي الربح.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_unclassified_transactions',
    description: 'احصل على المعاملات البنكية غير المصنفة التي تحتاج مراجعة.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_pending_approvals',
    description: 'احصل على الموافقات المعلقة على القوائم المالية والإيداعات.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_statements_status',
    description: 'احصل على حالة القوائم المالية: مسودة، قيد المراجعة، معتمدة، أو مودعة.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_filings_status',
    description: 'احصل على حالة الإيداعات الرسمية لدى وزارة التجارة وهيئة الزكاة.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_journal_entries',
    description: 'احصل على آخر قيود دفتر اليومية المحاسبية.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: { type: 'NUMBER', description: 'عدد القيود (افتراضي: 10)' },
      },
    },
  },
  {
    name: 'classify_transaction',
    description: 'صنّف معاملة بنكية غير مصنفة بتحديد فئتها والحساب المحاسبي.',
    parameters: {
      type: 'OBJECT',
      properties: {
        transaction_id: { type: 'STRING', description: 'معرف المعاملة' },
        category: { type: 'STRING', description: 'فئة المعاملة (مثل: إيرادات الخدمات، رواتب، مصروفات إدارية)' },
        account_code: { type: 'STRING', description: 'رمز الحساب المحاسبي' },
      },
      required: ['transaction_id', 'category'],
    },
  },
  {
    name: 'create_journal_entry',
    description: 'أنشئ قيد محاسبي جديد في دفتر اليومية.',
    parameters: {
      type: 'OBJECT',
      properties: {
        description: { type: 'STRING', description: 'وصف القيد' },
        debit_account: { type: 'STRING', description: 'الحساب المدين' },
        credit_account: { type: 'STRING', description: 'الحساب الدائن' },
        amount: { type: 'NUMBER', description: 'مبلغ القيد' },
        entry_date: { type: 'STRING', description: 'تاريخ القيد (YYYY-MM-DD)' },
      },
      required: ['description', 'debit_account', 'credit_account', 'amount'],
    },
  },
  {
    name: 'generate_income_statement',
    description: 'أنشئ مسودة قائمة دخل للفترة المحددة.',
    parameters: {
      type: 'OBJECT',
      properties: {
        period_start: { type: 'STRING', description: 'بداية الفترة (YYYY-MM-DD)' },
        period_end: { type: 'STRING', description: 'نهاية الفترة (YYYY-MM-DD)' },
      },
      required: ['period_start', 'period_end'],
    },
  },
];

// ─── Tool Executors ──────────────────────────────────────────────────────────

async function execGetFinancialSummary(ctx: AgentContext) {
  const [txRes, stmtRes, approvalRes, filingRes] = await Promise.all([
    supabaseAdmin
      .from('bank_transactions')
      .select('amount, type, is_reconciled')
      .eq('company_id', ctx.companyId),
    supabaseAdmin
      .from('financial_statements')
      .select('status')
      .eq('company_id', ctx.companyId),
    supabaseAdmin
      .from('approvals')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', ctx.companyId)
      .in('status', ['pending', 'in_review']),
    supabaseAdmin
      .from('filings')
      .select('status')
      .eq('company_id', ctx.companyId),
  ]);

  const transactions = txRes.data || [];
  const totalCredit = transactions.filter((t: any) => t.type === 'credit').reduce((s: number, t: any) => s + t.amount, 0);
  const totalDebit = transactions.filter((t: any) => t.type === 'debit').reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
  const unclassified = transactions.filter((t: any) => !t.is_reconciled).length;

  const stmts = stmtRes.data || [];
  const filings = filingRes.data || [];

  return {
    total_credit: totalCredit,
    total_debit: totalDebit,
    net: totalCredit - totalDebit,
    unclassified_transactions: unclassified,
    total_transactions: transactions.length,
    pending_approvals: approvalRes.count || 0,
    statements: {
      total: stmts.length,
      draft: stmts.filter((s: any) => s.status === 'draft').length,
      pending_review: stmts.filter((s: any) => s.status === 'pending_review').length,
      approved: stmts.filter((s: any) => s.status === 'approved').length,
      filed: stmts.filter((s: any) => s.status === 'filed').length,
    },
    filings: {
      total: filings.length,
      pending: filings.filter((f: any) => f.status === 'pending').length,
      submitted: filings.filter((f: any) => f.status === 'submitted').length,
      acknowledged: filings.filter((f: any) => f.status === 'acknowledged').length,
    },
  };
}

async function execGetUnclassifiedTransactions(ctx: AgentContext) {
  const { data } = await supabaseAdmin
    .from('bank_transactions')
    .select('id, transaction_date, description, amount, type')
    .eq('company_id', ctx.companyId)
    .eq('is_reconciled', false)
    .order('transaction_date', { ascending: false })
    .limit(10);

  return {
    unclassified: (data || []).map((t: any) => ({
      id: t.id,
      date: t.transaction_date,
      description: t.description,
      amount: t.amount,
      type: t.type,
    })),
  };
}

async function execGetPendingApprovals(ctx: AgentContext) {
  const { data } = await supabaseAdmin
    .from('approvals')
    .select('id, title, entity_type, status, priority, created_at')
    .eq('company_id', ctx.companyId)
    .in('status', ['pending', 'in_review'])
    .order('created_at', { ascending: true })
    .limit(10);

  return { pending_approvals: data || [] };
}

async function execGetStatementsStatus(ctx: AgentContext) {
  const { data } = await supabaseAdmin
    .from('financial_statements')
    .select('id, statement_type, period_start, period_end, status, created_at')
    .eq('company_id', ctx.companyId)
    .order('created_at', { ascending: false })
    .limit(10);

  return { statements: data || [] };
}

async function execGetFilingsStatus(ctx: AgentContext) {
  const { data } = await supabaseAdmin
    .from('filings')
    .select('id, filing_type, status, reference_number, filed_at, acknowledged_at')
    .eq('company_id', ctx.companyId)
    .order('created_at', { ascending: false });

  return { filings: data || [] };
}

async function execGetJournalEntries(ctx: AgentContext, limit = 10) {
  const { data } = await supabaseAdmin
    .from('journal_entries')
    .select('id, entry_date, description, debit_account, credit_account, amount, auto_generated')
    .eq('company_id', ctx.companyId)
    .order('entry_date', { ascending: false })
    .limit(limit);

  return { journal_entries: data || [] };
}

async function execClassifyTransaction(ctx: AgentContext, transactionId: string, category: string, accountCode?: string) {
  const { error } = await supabaseAdmin
    .from('bank_transactions')
    .update({
      category,
      account_code: accountCode || null,
      is_reconciled: true,
      classified_by_ai: true,
      classified_at: new Date().toISOString(),
    })
    .eq('id', transactionId)
    .eq('company_id', ctx.companyId);

  if (error) throw error;
  return { classified: true, transaction_id: transactionId, category };
}

async function execCreateJournalEntry(
  ctx: AgentContext,
  description: string,
  debitAccount: string,
  creditAccount: string,
  amount: number,
  entryDate?: string
) {
  const { data, error } = await supabaseAdmin
    .from('journal_entries')
    .insert({
      company_id: ctx.companyId,
      entry_date: entryDate || new Date().toISOString().slice(0, 10),
      description,
      debit_account: debitAccount,
      credit_account: creditAccount,
      amount,
      auto_generated: true,
      created_by: ctx.userId,
    })
    .select('id')
    .single();

  if (error) throw error;
  return { created: true, entry_id: (data as any).id, description };
}

async function execGenerateIncomeStatement(ctx: AgentContext, periodStart: string, periodEnd: string) {
  const { data: transactions } = await supabaseAdmin
    .from('bank_transactions')
    .select('amount, type, category')
    .eq('company_id', ctx.companyId)
    .gte('transaction_date', periodStart)
    .lte('transaction_date', periodEnd)
    .eq('is_reconciled', true);

  const revenues: Record<string, number> = {};
  const expenses: Record<string, number> = {};

  (transactions || []).forEach((t: any) => {
    const cat = t.category || 'غير مصنف';
    if (t.type === 'credit') {
      revenues[cat] = (revenues[cat] || 0) + t.amount;
    } else {
      expenses[cat] = (expenses[cat] || 0) + Math.abs(t.amount);
    }
  });

  const totalRevenue = Object.values(revenues).reduce((s, v) => s + v, 0);
  const totalExpenses = Object.values(expenses).reduce((s, v) => s + v, 0);

  const { data: stmt, error } = await supabaseAdmin
    .from('financial_statements')
    .insert({
      company_id: ctx.companyId,
      statement_type: 'income_statement',
      period_start: periodStart,
      period_end: periodEnd,
      status: 'draft',
      data: { revenues, expenses },
      ai_generated: true,
      created_by: ctx.userId,
    })
    .select('id')
    .single();

  if (error) throw error;

  return {
    created: true,
    statement_id: (stmt as any).id,
    period: `${periodStart} إلى ${periodEnd}`,
    total_revenue: totalRevenue,
    total_expenses: totalExpenses,
    net_profit: totalRevenue - totalExpenses,
  };
}

// ─── Tool Dispatcher ─────────────────────────────────────────────────────────

async function executeTool(name: string, args: any, ctx: AgentContext): Promise<any> {
  switch (name) {
    case 'get_financial_summary':       return execGetFinancialSummary(ctx);
    case 'get_unclassified_transactions': return execGetUnclassifiedTransactions(ctx);
    case 'get_pending_approvals':       return execGetPendingApprovals(ctx);
    case 'get_statements_status':       return execGetStatementsStatus(ctx);
    case 'get_filings_status':          return execGetFilingsStatus(ctx);
    case 'get_journal_entries':         return execGetJournalEntries(ctx, args?.limit ?? 10);
    case 'classify_transaction':        return execClassifyTransaction(ctx, args.transaction_id, args.category, args.account_code);
    case 'create_journal_entry':        return execCreateJournalEntry(ctx, args.description, args.debit_account, args.credit_account, args.amount, args.entry_date);
    case 'generate_income_statement':   return execGenerateIncomeStatement(ctx, args.period_start, args.period_end);
    default:                            return { error: `أداة غير معروفة: ${name}` };
  }
}

// ─── System Prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: AgentContext) {
  const roleLabel: Record<string, string> = {
    company_admin: 'مدير الشركة',
    accountant: 'المحاسب',
    auditor: 'مدقق الحسابات',
    super_admin: 'المدير العام',
  };

  return `أنت مساعد مالي ذكي متخصص في المحاسبة والقوائم المالية. تعمل لصالح ${ctx.userName}، ${roleLabel[ctx.userRole] || 'مستخدم النظام'}.

صلاحياتك الكاملة:
- قراءة جميع البيانات المالية للشركة (معاملات بنكية، قيود، قوائم، إيداعات)
- تصنيف المعاملات البنكية تلقائياً
- إنشاء قيود محاسبية جديدة
- إنشاء مسودات القوائم المالية
- تحليل الوضع المالي وتقديم توصيات

كيف تعمل:
1. اجمع البيانات الفعلية أولاً بالأدوات المتاحة
2. حلّل الوضع المالي وحدد الأولويات
3. اتخذ الإجراءات التلقائية الآمنة (تصنيف، قيود)
4. أبلغ المستخدم بالنتائج والتوصيات بوضوح

قواعد مهمة:
- لا تخترع أرقاماً — كل تحليل مبني على بيانات فعلية
- اكتب بالعربية المهنية الواضحة
- الأرقام والتواريخ دائماً بأرقام إنجليزية (1234 وليس ١٢٣٤)
- عند تنفيذ إجراء، أخبر المستخدم بما تم بالضبط
- ركز على البيانات المالية للشركة فقط

التاريخ اليوم: ${new Date().toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
}

// ─── Main Agent Loop ─────────────────────────────────────────────────────────

export async function runAgent(
  userMessage: string,
  history: AgentMessage[],
  ctx: AgentContext,
  onEvent?: (e: ToolCallEvent) => void
): Promise<string> {
  const apiKey = process.env.GEMENI_KEY || process.env.GEMINI_KEY;
  if (!apiKey) return 'المساعد الذكي غير متاح حالياً. يرجى إضافة GEMINI_KEY في ملف .env.local';

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const systemPrompt = buildSystemPrompt(ctx);

  const contents: any[] =
    history.length === 0
      ? [{ role: 'user', parts: [{ text: systemPrompt + '\n\n---\n\n' + userMessage }] }]
      : [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n---\n\n' + history[0]?.parts[0]?.text }] },
          ...history.slice(1, -1),
          { role: 'user', parts: [{ text: userMessage }] },
        ];

  const body = {
    contents,
    tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
    toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  };

  let maxIterations = 8;

  while (maxIterations-- > 0) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error ${res.status}: ${err}`);
    }

    const json = await res.json();
    const candidate = json?.candidates?.[0];
    if (!candidate) throw new Error('No candidate in Gemini response');

    const parts = candidate.content?.parts || [];
    const textPart = parts.find((p: any) => p.text);
    const funcCalls = parts.filter((p: any) => p.functionCall);

    if (funcCalls.length === 0) {
      const text = textPart?.text?.trim() || 'لم أتمكن من الإجابة. حاول مرة أخرى.';
      onEvent?.({ type: 'text', text });
      return text;
    }

    body.contents.push({ role: 'model', parts });

    const functionResponses: any[] = [];
    for (const fc of funcCalls) {
      const { name, args } = fc.functionCall;
      onEvent?.({ type: 'tool_start', toolName: name });
      try {
        const result = await executeTool(name, args, ctx);
        functionResponses.push({ functionResponse: { name, response: result } });
      } catch (err: any) {
        functionResponses.push({ functionResponse: { name, response: { error: err.message } } });
      }
      onEvent?.({ type: 'tool_done', toolName: name });
    }

    body.contents.push({ role: 'user', parts: functionResponses });
  }

  return 'انتهت الجلسة بدون إجابة كافية. حاول مرة أخرى.';
}

// ─── Structured Daily Report ─────────────────────────────────────────────────

export async function generateFinanceReport(ctx: AgentContext): Promise<FinanceReport> {
  const fallback: FinanceReport = {
    generated_at: new Date().toISOString(),
    attention_level: 'low',
    summary: 'تعذّر تحميل التقرير. يرجى المحاولة مرة أخرى.',
    highlights: [],
    priorities: [],
    actions_taken: [],
    next_steps: [],
  };

  let summary: any = {};
  let unclassified: any = {};
  let approvals: any = {};
  let statements: any = {};
  let filings: any = {};
  const actionsTaken: string[] = [];

  try {
    [summary, unclassified, approvals, statements, filings] = await Promise.all([
      execGetFinancialSummary(ctx),
      execGetUnclassifiedTransactions(ctx),
      execGetPendingApprovals(ctx),
      execGetStatementsStatus(ctx),
      execGetFilingsStatus(ctx),
    ]);
  } catch {
    // Continue with partial data
  }

  const apiKey = process.env.GEMENI_KEY || process.env.GEMINI_KEY;
  if (!apiKey) return fallback;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const today = new Date().toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `أنت مساعد مالي ذكي. بيانات الشركة المالية:

${JSON.stringify({ summary, unclassified_count: unclassified.unclassified?.length || 0, approvals: approvals.pending_approvals?.length || 0, statements, filings, date: today })}

أنتج JSON فقط بالشكل التالي (بدون أي نص خارج الـ JSON):
{
  "attention_level": "low|medium|high",
  "summary": "جملة أو جملتان عن الوضع المالي الحالي",
  "highlights": [{"label": "...", "value": "...", "alert": false}],
  "priorities": [{"text": "...", "page": "bank"}],
  "actions_taken": [],
  "next_steps": [{"text": "...", "page": "statements"}]
}

قواعد:
- attention_level: high إذا وجدت معاملات غير مصنفة كثيرة أو موافقات معلقة عاجلة، medium إذا توجد قوائم قيد المراجعة أو إيداعات معلقة، low إذا كل شيء على ما يرام
- highlights: 4 أرقام مهمة (الرصيد الصافي، المعاملات غير المصنفة، الموافقات المعلقة، القوائم الجاهزة للإيداع) — alert: true على المقلقة
- priorities: ما يحتاج تدخلاً فورياً (2 إلى 4 نقاط) — page من: bank, accounting, statements, approvals, filings
- actions_taken: اتركها فارغة []
- next_steps: خطوات عملية (2 إلى 3 نقاط) — page من: bank, accounting, statements, approvals, filings
- الأرقام بالإنجليزية دائماً
- اكتب بالعربية المهنية الواضحة بدون رموز تنسيق`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 },
        }),
      }
    );

    if (!res.ok) return fallback;

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
    if (!text) return fallback;

    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const raw = (fenced ? fenced[1] : text).trim();
    const parsed = JSON.parse(raw) as any;

    const toItems = (arr: any[]): ReportItem[] =>
      arr.map((i) => (typeof i === 'string' ? { text: i } : { text: i.text, page: i.page }));

    return {
      generated_at: new Date().toISOString(),
      attention_level: ['low', 'medium', 'high'].includes(parsed.attention_level) ? parsed.attention_level : 'low',
      summary: parsed.summary || fallback.summary,
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 4) : [],
      priorities: Array.isArray(parsed.priorities) ? toItems(parsed.priorities).slice(0, 4) : [],
      actions_taken: Array.isArray(parsed.actions_taken) ? parsed.actions_taken : actionsTaken,
      next_steps: Array.isArray(parsed.next_steps) ? toItems(parsed.next_steps).slice(0, 3) : [],
    };
  } catch {
    return { ...fallback, actions_taken: actionsTaken };
  }
}
