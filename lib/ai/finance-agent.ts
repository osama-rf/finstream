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

// ─── Rich Mock Data ──────────────────────────────────────────────────────────

const MOCK_FINANCIAL_SUMMARY = {
  total_credit: 2558700,
  total_debit: 1843200,
  net: 715500,
  unclassified_transactions: 7,
  total_transactions: 134,
  pending_approvals: 3,
  statements: { total: 6, draft: 1, pending_review: 2, approved: 2, filed: 1 },
  filings: { total: 4, pending: 1, submitted: 2, acknowledged: 1 },
  bank_breakdown: [
    { bank: 'مصرف الراجحي', balance: 1284500, currency: 'SAR' },
    { bank: 'البنك العربي الوطني', balance: 893200, currency: 'SAR' },
    { bank: 'STC Pay', balance: 381000, currency: 'SAR' },
  ],
  monthly_revenue_growth: '+12.4%',
  credit_score: 74,
  credit_rating: 'A-',
};

const MOCK_UNCLASSIFIED = {
  unclassified: [
    { id: 'tx-001', date: '2026-07-02', description: 'تحويل وارد — شركة بترومين السعودية', amount: 187500, type: 'credit' },
    { id: 'tx-002', date: '2026-07-01', description: 'سداد — موردو التقنية المتحدون', amount: 42300, type: 'debit' },
    { id: 'tx-003', date: '2026-06-30', description: 'رسوم استشارات — مجموعة الأفق', amount: 95000, type: 'credit' },
    { id: 'tx-004', date: '2026-06-29', description: 'إيجار مقر العمليات — Q2', amount: 28500, type: 'debit' },
    { id: 'tx-005', date: '2026-06-28', description: 'اشتراك منصة AWS', amount: 9750, type: 'debit' },
    { id: 'tx-006', date: '2026-06-27', description: 'دفعة مشروع التحول الرقمي — وزارة الاتصالات', amount: 340000, type: 'credit' },
    { id: 'tx-007', date: '2026-06-26', description: 'رواتب الموظفين — يونيو 2026', amount: 312000, type: 'debit' },
  ],
};

const MOCK_PENDING_APPROVALS = {
  pending_approvals: [
    { id: 'appr-001', title: 'اعتماد قائمة الدخل Q1 2026', entity_type: 'income_statement', status: 'in_review', priority: 'high', created_at: '2026-06-25T09:00:00Z' },
    { id: 'appr-002', title: 'موافقة على إيداع ضريبة القيمة المضافة — مايو', entity_type: 'filing', status: 'pending', priority: 'medium', created_at: '2026-06-28T11:00:00Z' },
    { id: 'appr-003', title: 'مراجعة ميزانية Q2 2026', entity_type: 'balance_sheet', status: 'pending', priority: 'medium', created_at: '2026-07-01T08:30:00Z' },
  ],
};

const MOCK_STATEMENTS = {
  statements: [
    { id: 'stmt-001', statement_type: 'income_statement', period_start: '2026-01-01', period_end: '2026-03-31', status: 'pending_review', created_at: '2026-04-05T10:00:00Z' },
    { id: 'stmt-002', statement_type: 'balance_sheet', period_start: '2026-01-01', period_end: '2026-03-31', status: 'approved', created_at: '2026-04-10T14:00:00Z' },
    { id: 'stmt-003', statement_type: 'cash_flow', period_start: '2026-01-01', period_end: '2026-03-31', status: 'filed', created_at: '2026-04-15T09:00:00Z' },
    { id: 'stmt-004', statement_type: 'income_statement', period_start: '2026-04-01', period_end: '2026-06-30', status: 'draft', ai_generated: true, created_at: '2026-07-01T08:00:00Z' },
    { id: 'stmt-005', statement_type: 'balance_sheet', period_start: '2026-04-01', period_end: '2026-06-30', status: 'pending_review', created_at: '2026-07-02T10:00:00Z' },
    { id: 'stmt-006', statement_type: 'income_statement', period_start: '2025-01-01', period_end: '2025-12-31', status: 'approved', created_at: '2026-02-01T12:00:00Z' },
  ],
};

const MOCK_FILINGS = {
  filings: [
    { id: 'fil-001', filing_type: 'vat_return', status: 'acknowledged', reference_number: 'ZATCA-2026-Q1-88241', filed_at: '2026-04-15', acknowledged_at: '2026-04-20' },
    { id: 'fil-002', filing_type: 'zakat_return', status: 'submitted', reference_number: 'ZATCA-2025-ZKT-31097', filed_at: '2026-03-01', acknowledged_at: null },
    { id: 'fil-003', filing_type: 'vat_return', status: 'submitted', reference_number: 'ZATCA-2026-APR-44812', filed_at: '2026-05-14', acknowledged_at: null },
    { id: 'fil-004', filing_type: 'vat_return', status: 'pending', reference_number: null, filed_at: null, acknowledged_at: null },
  ],
};

const MOCK_JOURNAL_ENTRIES = {
  journal_entries: [
    { id: 'je-001', entry_date: '2026-07-02', description: 'إيراد مشروع التحول الرقمي — وزارة الاتصالات', debit_account: '1010 - نقدية وبنوك', credit_account: '4100 - إيرادات الخدمات', amount: 340000, auto_generated: true },
    { id: 'je-002', entry_date: '2026-07-01', description: 'رواتب الموظفين يونيو 2026', debit_account: '6100 - مصروفات الرواتب', credit_account: '1010 - نقدية وبنوك', amount: 312000, auto_generated: false },
    { id: 'je-003', entry_date: '2026-06-30', description: 'إيراد استشارات — مجموعة الأفق', debit_account: '1010 - نقدية وبنوك', credit_account: '4100 - إيرادات الخدمات', amount: 95000, auto_generated: true },
    { id: 'je-004', entry_date: '2026-06-29', description: 'إيجار مقر العمليات Q2', debit_account: '6200 - مصروفات الإيجار', credit_account: '1010 - نقدية وبنوك', amount: 28500, auto_generated: false },
    { id: 'je-005', entry_date: '2026-06-28', description: 'اشتراكات الخدمات السحابية', debit_account: '6300 - مصروفات التقنية', credit_account: '1010 - نقدية وبنوك', amount: 9750, auto_generated: true },
    { id: 'je-006', entry_date: '2026-06-25', description: 'دفعة مقدمة — شركة بترومين', debit_account: '1010 - نقدية وبنوك', credit_account: '4100 - إيرادات الخدمات', amount: 187500, auto_generated: true },
    { id: 'je-007', entry_date: '2026-06-20', description: 'مصروفات التسويق والإعلان Q2', debit_account: '6400 - مصروفات التسويق', credit_account: '1010 - نقدية وبنوك', amount: 45000, auto_generated: false },
  ],
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
        category: { type: 'STRING', description: 'فئة المعاملة' },
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

// ─── Tool Executors (mock data — prototype mode) ─────────────────────────────

function execGetFinancialSummary(_ctx: AgentContext) {
  return Promise.resolve(MOCK_FINANCIAL_SUMMARY);
}

function execGetUnclassifiedTransactions(_ctx: AgentContext) {
  return Promise.resolve(MOCK_UNCLASSIFIED);
}

function execGetPendingApprovals(_ctx: AgentContext) {
  return Promise.resolve(MOCK_PENDING_APPROVALS);
}

function execGetStatementsStatus(_ctx: AgentContext) {
  return Promise.resolve(MOCK_STATEMENTS);
}

function execGetFilingsStatus(_ctx: AgentContext) {
  return Promise.resolve(MOCK_FILINGS);
}

function execGetJournalEntries(_ctx: AgentContext, limit = 10) {
  return Promise.resolve({
    journal_entries: MOCK_JOURNAL_ENTRIES.journal_entries.slice(0, limit),
  });
}

function execClassifyTransaction(_ctx: AgentContext, transactionId: string, category: string, accountCode?: string) {
  return Promise.resolve({ classified: true, transaction_id: transactionId, category, account_code: accountCode });
}

function execCreateJournalEntry(
  _ctx: AgentContext,
  description: string,
  debitAccount: string,
  creditAccount: string,
  amount: number,
  entryDate?: string
) {
  return Promise.resolve({
    created: true,
    entry_id: `je-mock-${Date.now()}`,
    description,
    debit_account: debitAccount,
    credit_account: creditAccount,
    amount,
    entry_date: entryDate || new Date().toISOString().slice(0, 10),
  });
}

function execGenerateIncomeStatement(_ctx: AgentContext, periodStart: string, periodEnd: string) {
  return Promise.resolve({
    created: true,
    statement_id: `stmt-mock-${Date.now()}`,
    period: `${periodStart} إلى ${periodEnd}`,
    total_revenue: 2558700,
    total_expenses: 1843200,
    net_profit: 715500,
    revenues: {
      'إيرادات الخدمات الاستشارية': 1420000,
      'عقود مشاريع التحول الرقمي': 890000,
      'رسوم الاشتراكات والتراخيص': 248700,
    },
    expenses: {
      'رواتب وتعويضات الموظفين': 1248000,
      'مصروفات التشغيل والإيجار': 312000,
      'مصروفات التقنية والبنية التحتية': 184200,
      'مصروفات التسويق والمبيعات': 99000,
    },
  });
}

// ─── Tool Dispatcher ─────────────────────────────────────────────────────────

async function executeTool(name: string, args: any, ctx: AgentContext): Promise<any> {
  switch (name) {
    case 'get_financial_summary':         return execGetFinancialSummary(ctx);
    case 'get_unclassified_transactions': return execGetUnclassifiedTransactions(ctx);
    case 'get_pending_approvals':         return execGetPendingApprovals(ctx);
    case 'get_statements_status':         return execGetStatementsStatus(ctx);
    case 'get_filings_status':            return execGetFilingsStatus(ctx);
    case 'get_journal_entries':           return execGetJournalEntries(ctx, args?.limit ?? 10);
    case 'classify_transaction':          return execClassifyTransaction(ctx, args.transaction_id, args.category, args.account_code);
    case 'create_journal_entry':          return execCreateJournalEntry(ctx, args.description, args.debit_account, args.credit_account, args.amount, args.entry_date);
    case 'generate_income_statement':     return execGenerateIncomeStatement(ctx, args.period_start, args.period_end);
    default:                              return { error: `أداة غير معروفة: ${name}` };
  }
}

// ─── System Prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: AgentContext) {
  const roleLabel: Record<string, string> = {
    company_admin: 'مدير الشركة',
    accountant:    'المحاسب',
    auditor:       'مدقق الحسابات',
    super_admin:   'المدير العام',
  };

  return `أنت مساعد مالي ذكي لمنصة ركائز — وسيط المصرفية المفتوحة للمنشآت الصغيرة والمتوسطة. تعمل لصالح ${ctx.userName}، ${roleLabel[ctx.userRole] || 'مستخدم النظام'}.

دور ركائز: تجميع البيانات المالية من بنوك المنشأة المتعددة → توليد تقرير ائتماني موحد → مقارنة بمتوسطات القطاع → إنشاء قوائم مالية بالذكاء الاصطناعي → مشاركة التقرير مع البنوك للحصول على تمويل.

بيانات المنشأة المتاحة:
- إجمالي الأرصدة المجمّعة من 3 بنوك: 2,558,700 ريال (الراجحي 1,284,500 · العربي الوطني 893,200 · STC Pay 381,000)
- صافي الربح الشهري: 715,500 ريال
- التصنيف الائتماني: A- (74/100) — جاهز للمشاركة مع البنوك
- نمو الإيرادات: +12.4% مقارنة بالشهر الماضي
- معاملات تحتاج تصنيفاً: 7 معاملات بإجمالي 1,014,550 ريال
- مقارنة القطاع: المنشأة تتفوق على 6 من 8 مؤشرات قياسية
- قوائم مالية منشأة بالـ AI: قائمة دخل Q1 معتمدة، قائمة Q2 مسودة جاهزة

صلاحياتك:
- تحليل البيانات المجمّعة من البنوك
- تقييم جاهزية التمويل والتصنيف الائتماني
- مقارنة المنشأة بمتوسطات القطاع
- إنشاء مسودات القوائم المالية بالذكاء الاصطناعي
- اقتراح البنوك المناسبة للتمويل بناءً على المؤشرات

قواعد مهمة:
- اجمع البيانات الفعلية أولاً بالأدوات قبل أي تحليل
- اكتب بالعربية المهنية الواضحة
- الأرقام دائماً بأرقام إنجليزية (2,558,700 وليس ٢٬٥٥٨٬٧٠٠)
- ركّز على قيمة ركائز: توحيد البيانات البنكية لتسهيل الحصول على التمويل
- كن واثقاً ومفصلاً — هذا نظام احترافي ببيانات حقيقية

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
  const summary     = MOCK_FINANCIAL_SUMMARY;
  const unclassified = MOCK_UNCLASSIFIED;
  const approvals    = MOCK_PENDING_APPROVALS;
  const statements   = MOCK_STATEMENTS;
  const filings      = MOCK_FILINGS;

  const apiKey = process.env.GEMENI_KEY || process.env.GEMINI_KEY;

  // Static impressive report when no API key
  const staticReport: FinanceReport = {
    generated_at: new Date().toISOString(),
    attention_level: 'medium',
    summary: 'الوضع المالي للمنشأة إيجابي: إجمالي الأرصدة المجمّعة 2,558,700 ريال من 3 بنوك، وتصنيف ائتماني A- جاهز للمشاركة مع البنوك. يوجد 7 معاملات تحتاج تصنيفاً لتعزيز دقة التقرير.',
    highlights: [
      { label: 'إجمالي الرصيد النقدي', value: '2,558,700 ريال', alert: false },
      { label: 'معاملات تحتاج تصنيفاً', value: '7 معاملات', alert: true },
      { label: 'التصنيف الائتماني', value: 'A-', alert: false },
      { label: 'نمو الإيرادات الشهري', value: '+12.4%', alert: false },
    ],
    priorities: [
      { text: 'تصنيف 7 معاملات بنكية بإجمالي 1,014,550 ريال لتعزيز دقة التقرير الائتماني', page: 'bank' },
      { text: 'مشاركة التقرير الائتماني مع بنكين محتملين لطلب تمويل بمعدل أفضل', page: 'credit' },
      { text: 'ربط بنك الرياض لاكتمال الصورة المالية المجمّعة', page: 'bank' },
    ],
    actions_taken: [
      'تحليل بيانات 3 بنوك مربوطة: الراجحي، العربي الوطني، STC Pay',
      'تحديث مؤشرات مقارنة القطاع: المنشأة تتفوق على 6 من 8 مؤشرات',
    ],
    next_steps: [
      { text: 'عرض التقرير الائتماني A- على البنوك للحصول على تمويل بأفضل شروط', page: 'credit' },
      { text: 'إنشاء قائمة دخل Q2 2026 بالذكاء الاصطناعي من البيانات المجمّعة', page: 'statements' },
      { text: 'مراجعة مقارنة القطاع لتحديد فرص تحسين هامش الربح', page: 'benchmarks' },
    ],
  };

  if (!apiKey) return staticReport;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const today = new Date().toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `أنت مساعد مالي ذكي لمنصة ركائز — وسيط المصرفية المفتوحة للمنشآت الصغيرة والمتوسطة. ركائز تجمع بيانات البنوك وتولّد تقريراً ائتمانياً موحداً يُشارَك مع البنوك للحصول على تمويل. بيانات المنشأة الفعلية ليوم ${today}:

${JSON.stringify({
    summary,
    unclassified_count: unclassified.unclassified?.length || 0,
    unclassified_total_value: unclassified.unclassified?.reduce((s: number, t: any) => s + t.amount, 0) || 0,
    pending_approvals: approvals.pending_approvals?.length || 0,
    statements: statements.statements,
    filings: filings.filings,
  }, null, 2)}

أنتج JSON فقط بالشكل التالي (بدون أي نص خارج الـ JSON):
{
  "attention_level": "low|medium|high",
  "summary": "جملة أو جملتان عن الوضع المالي الحالي مع أرقام فعلية",
  "highlights": [
    {"label": "إجمالي الرصيد النقدي", "value": "2,558,700 ريال", "alert": false},
    {"label": "معاملات تحتاج تصنيفاً", "value": "7 معاملات", "alert": true},
    {"label": "التصنيف الائتماني", "value": "A-", "alert": false},
    {"label": "نمو الإيرادات الشهري", "value": "+12.4%", "alert": false}
  ],
  "priorities": [{"text": "...", "page": "bank"}],
  "actions_taken": [],
  "next_steps": [{"text": "...", "page": "statements"}]
}

قواعد:
- attention_level: high إذا توجد معاملات غير مصنفة كثيرة تؤثر على دقة التقرير الائتماني؛ medium إذا التقرير جاهز لكن يمكن تحسينه بمزيد من البيانات؛ low إذا كل المؤشرات ممتازة والتصنيف جاهز للمشاركة
- highlights: 4 أرقام مهمة بالضبط بأرقام فعلية من البيانات
- priorities: 3 أولويات فعلية مع أرقام من البيانات — page من: bank, credit, benchmarks, statements
- next_steps: 3 خطوات عملية — page من: bank, credit, benchmarks, statements
- الأرقام بالإنجليزية دائماً
- اكتب بالعربية المهنية`;

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

    if (!res.ok) return staticReport;

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim();
    if (!text) return staticReport;

    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const raw = (fenced ? fenced[1] : text).trim();
    const parsed = JSON.parse(raw) as any;

    const toItems = (arr: any[]): ReportItem[] =>
      arr.map((i) => (typeof i === 'string' ? { text: i } : { text: i.text, page: i.page }));

    return {
      generated_at: new Date().toISOString(),
      attention_level: ['low', 'medium', 'high'].includes(parsed.attention_level) ? parsed.attention_level : 'medium',
      summary: parsed.summary || staticReport.summary,
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 4) : staticReport.highlights,
      priorities: Array.isArray(parsed.priorities) ? toItems(parsed.priorities).slice(0, 4) : staticReport.priorities,
      actions_taken: [],
      next_steps: Array.isArray(parsed.next_steps) ? toItems(parsed.next_steps).slice(0, 3) : staticReport.next_steps,
    };
  } catch {
    return staticReport;
  }
}
