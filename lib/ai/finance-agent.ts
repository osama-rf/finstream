import { BANKS, BANKING_SUMMARY } from '@/lib/mock/banking';
import { CREDIT_REPORT, CREDIT_RATIOS } from '@/lib/mock/credit';
import { STATEMENTS_BY_QUARTER } from '@/lib/mock/statements';
import { ANALYTICS_OVERVIEW } from '@/lib/mock/analytics';

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

export type CreditRatio = {
  key: string;
  label: string;
  value: number;
  unit: string;
  benchmark: number;
  benchmarkLabel: string;
  status: 'good' | 'warning' | 'bad';
  description: string;
};

export type CreditReport = {
  generated_at: string;
  score: number;
  letter: string;
  rating: string;
  percentile: number;
  visual_pct: number;
  valid_until: string;
  strengths: string[];
  risks: string[];
  recommendations: string[];
  ratios: CreditRatio[];
};

export type FinanceReport = {
  generated_at: string;
  attention_level: 'low' | 'medium' | 'high';
  summary: string;
  highlights: Array<{ label: string; value: string; alert?: boolean }>;
  priorities: ReportItem[];
  actions_taken: string[];
  next_steps: ReportItem[];
};

// ─── Canonical platform data (single source of truth) ───────────────────────
// Sourced from lib/mock — the same data the UI pages render — so the AI
// agent's answers never drift from what's shown on screen.

const PLATFORM_DATA = {
  banks: BANKS.map(b => ({
    name: b.name, balance: b.balance, monthlyIn: b.monthlyIn, monthlyOut: b.monthlyOut, status: b.status,
  })),

  totalBalance: BANKING_SUMMARY.totalBalance,
  totalMonthlyIn: BANKING_SUMMARY.totalMonthlyIn,
  totalMonthlyOut: BANKING_SUMMARY.totalMonthlyOut,
  netMonthly: BANKING_SUMMARY.totalMonthlyIn - BANKING_SUMMARY.totalMonthlyOut,
  revenueGrowth: '+18.4%',
  unclassifiedTxCount: 7,
  unclassifiedTxValue: 1_014_550,

  simahScore: CREDIT_REPORT.score,
  simahRating: CREDIT_REPORT.letter,
  simahLabel: CREDIT_REPORT.rating,
  simahSource: 'تصنيف ائتماني معتمد',
  simahPercentile: CREDIT_REPORT.percentile,
  creditValidUntil: '2026-08-01',

  ratios: {
    profitMargin: findRatio('profit_margin'),
    currentRatio: findRatio('current_ratio'),
    debtEquity: findRatio('debt_equity'),
    dso: findRatio('dso'),
    revenueGrowth: findRatio('revenue_growth'),
    cashCoverage: findRatio('cash_coverage'),
  },

  benchmarks: {
    aboveAverage: CREDIT_REPORT.benchmarkSummary.aboveAverage,
    total: CREDIT_REPORT.benchmarkSummary.total,
    sector: CREDIT_REPORT.benchmarkSummary.sector,
    region: CREDIT_REPORT.benchmarkSummary.region,
  },

  statements: STATEMENTS_BY_QUARTER['Q1 2026'].map(s => ({
    type: s.title, period: s.period, status: s.status, aiGenerated: s.aiGenerated,
  })).concat(STATEMENTS_BY_QUARTER['Q2 2026'].map(s => ({
    type: s.title, period: s.period, status: s.status, aiGenerated: s.aiGenerated,
  }))),

  analytics: {
    totalRevenue: ANALYTICS_OVERVIEW.totalRevenueQuarter + 1_435_000,
    totalExpenses: 2_343_200,
    netProfit: 1_939_300,
    profitMarginPct: 45.3,
    topRevenueSource: 'خدمات استشارية (44%)',
    topExpenseCategory: 'تكلفة الخدمات (42%)',
  },

  financingOffers: [
    { bank: 'البنك الأهلي السعودي', product: 'تمويل رأس المال العامل', maxAmount: 3_000_000, rate: '6.5%' },
    { bank: 'بنك الراجحي',          product: 'تمويل المشاريع الصغيرة', maxAmount: 2_500_000, rate: '6.9%' },
    { bank: 'مصرف الإنماء',         product: 'خط ائتمان متجدد',        maxAmount: 1_500_000, rate: '7.2%' },
  ],
};

function findRatio(key: string) {
  const r = CREDIT_RATIOS.find(r => r.key === key)!;
  return { value: r.value, unit: r.unit, benchmark: r.benchmark, status: r.status };
}

// ─── Tool Declarations ───────────────────────────────────────────────────────

const TOOL_DECLARATIONS = [
  {
    name: 'get_aggregated_banking_data',
    description: 'احصل على البيانات المجمّعة من جميع البنوك المربوطة: الأرصدة، التدفقات الشهرية، وعدد المعاملات غير المصنفة.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_credit_report',
    description: 'احصل على التصنيف الائتماني المعتمد: الدرجة، التقييم، المؤشرات المالية، وجاهزية التمويل.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_sector_benchmarks',
    description: 'احصل على مقارنة مؤشرات المنشأة بمتوسطات القطاع عالمياً وقطاع دول الخليج.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_financial_statements',
    description: 'احصل على حالة القوائم المالية المنشأة بالذكاء الاصطناعي من البيانات البنكية.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_analytics_summary',
    description: 'احصل على ملخص التحليل المالي: الإيرادات، المصروفات، صافي الربح، وتوزيع المصادر.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_financing_opportunities',
    description: 'احصل على عروض التمويل المتاحة من البنوك بناءً على التصنيف الائتماني الحالي.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'generate_ai_financial_statement',
    description: 'أنشئ مسودة قائمة مالية بالذكاء الاصطناعي من البيانات المجمّعة للبنوك.',
    parameters: {
      type: 'OBJECT',
      properties: {
        type: { type: 'STRING', description: 'نوع القائمة: income | balance | cashflow' },
        period: { type: 'STRING', description: 'الفترة المالية مثل Q2 2026' },
      },
      required: ['type', 'period'],
    },
  },
  {
    name: 'classify_bank_transaction',
    description: 'صنّف معاملة بنكية غير مصنفة لتحسين دقة التقرير الائتماني.',
    parameters: {
      type: 'OBJECT',
      properties: {
        transaction_id: { type: 'STRING', description: 'معرف المعاملة' },
        category: { type: 'STRING', description: 'تصنيف المعاملة: إيرادات خدمات | رواتب | إيجار | تقنية | تسويق | أخرى' },
      },
      required: ['transaction_id', 'category'],
    },
  },
];

// ─── Tool Executors ──────────────────────────────────────────────────────────

function execGetAggregatedBankingData() {
  const d = PLATFORM_DATA;
  return Promise.resolve({
    connected_banks: d.banks.filter(b => b.status === 'connected').length,
    disconnected_banks: d.banks.filter(b => b.status === 'disconnected').map(b => b.name),
    banks: d.banks,
    total_balance: d.totalBalance,
    total_monthly_inflow: d.totalMonthlyIn,
    total_monthly_outflow: d.totalMonthlyOut,
    net_monthly: d.netMonthly,
    revenue_growth: d.revenueGrowth,
    unclassified_transactions: { count: d.unclassifiedTxCount, total_value: d.unclassifiedTxValue },
    note: `${d.unclassifiedTxCount} معاملة غير مصنفة بإجمالي ${d.unclassifiedTxValue.toLocaleString()} ريال — تصنيفها يحسّن دقة التقرير الائتماني`,
  });
}

function execGetCreditReport() {
  const d = PLATFORM_DATA;
  return Promise.resolve({
    source: d.simahSource,
    score: d.simahScore,
    score_range: '300–900',
    rating: d.simahRating,
    label: d.simahLabel,
    percentile: `أعلى من ${d.simahPercentile}% من شركات القطاع`,
    valid_until: d.creditValidUntil,
    ratios: d.ratios,
    financing_readiness: 'جاهز — التصنيف يؤهّل للحصول على تمويل حتى 3,000,000 ريال',
    improvement_tip: 'تقليل فترة التحصيل (DSO) من 42 إلى 35 يوماً سيرفع التصنيف إلى A-',
  });
}

function execGetSectorBenchmarks() {
  const d = PLATFORM_DATA;
  return Promise.resolve({
    sector: d.benchmarks.sector,
    region: d.benchmarks.region,
    above_average: d.benchmarks.aboveAverage,
    total_metrics: d.benchmarks.total,
    summary: `المنشأة تتفوق على ${d.benchmarks.aboveAverage} من أصل ${d.benchmarks.total} مؤشرات في ${d.benchmarks.sector}`,
    strengths: ['هامش الربح الصافي 32.5% (المتوسط 24%)', 'نمو الإيرادات 18.4% (المتوسط 12.3%)', 'نسبة السيولة 1.8x (المعيار ≥1.5)'],
    areas_to_improve: ['فترة التحصيل DSO: 42 يوم (المتوسط 35 يوم)'],
  });
}

function execGetFinancialStatements() {
  return Promise.resolve({
    statements: PLATFORM_DATA.statements,
    ai_generated_count: PLATFORM_DATA.statements.filter(s => s.aiGenerated).length,
    pending_count: PLATFORM_DATA.statements.filter(s => s.status === 'pending_review').length,
    draft_count: PLATFORM_DATA.statements.filter(s => s.status === 'draft').length,
    note: 'القوائم تُنشأ تلقائياً بالذكاء الاصطناعي من البيانات المجمّعة للبنوك المربوطة',
  });
}

function execGetAnalyticsSummary() {
  const d = PLATFORM_DATA.analytics;
  return Promise.resolve({
    ...d,
    period: 'Q1 2026',
    note: `صافي الربح ${d.netProfit.toLocaleString()} ريال بهامش ${d.profitMarginPct}% — أعلى من متوسط القطاع`,
  });
}

function execGetFinancingOpportunities() {
  return Promise.resolve({
    credit_rating: `${PLATFORM_DATA.simahScore}/900 — ${PLATFORM_DATA.simahRating}`,
    offers: PLATFORM_DATA.financingOffers,
    max_financing: 3_000_000,
    best_rate: '6.5%',
    recommendation: 'شارك تقريرك الائتماني مع البنك الأهلي للحصول على 3,000,000 ريال بمعدل 6.5%',
  });
}

function execGenerateAiStatement(type: string, period: string) {
  const typeMap: Record<string, string> = {
    income: 'قائمة الدخل', balance: 'الميزانية العمومية', cashflow: 'قائمة التدفقات النقدية',
  };
  const label = typeMap[type] || type;
  const d = PLATFORM_DATA.analytics;
  return Promise.resolve({
    created: true,
    statement_type: label,
    period,
    ai_generated: true,
    source: 'بيانات 3 بنوك مربوطة عبر Open Banking',
    summary: {
      total_revenue: d.totalRevenue,
      total_expenses: d.totalExpenses,
      net_profit: d.netProfit,
      profit_margin: `${d.profitMarginPct}%`,
    },
    next_step: `اذهب إلى صفحة القوائم المالية لمعاينة ${label} وإرسالها للبنوك`,
  });
}

function execClassifyTransaction(txId: string, category: string) {
  return Promise.resolve({
    classified: true,
    transaction_id: txId,
    category,
    impact: 'سيتحسن دقة التقرير الائتماني — تبقى 6 معاملات تحتاج تصنيفاً',
  });
}

// ─── Tool Dispatcher ─────────────────────────────────────────────────────────

async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'get_aggregated_banking_data':  return execGetAggregatedBankingData();
    case 'get_credit_report':            return execGetCreditReport();
    case 'get_sector_benchmarks':        return execGetSectorBenchmarks();
    case 'get_financial_statements':     return execGetFinancialStatements();
    case 'get_analytics_summary':        return execGetAnalyticsSummary();
    case 'get_financing_opportunities':  return execGetFinancingOpportunities();
    case 'generate_ai_financial_statement': return execGenerateAiStatement(args?.type, args?.period);
    case 'classify_bank_transaction':    return execClassifyTransaction(args?.transaction_id, args?.category);
    default: return { error: `أداة غير معروفة: ${name}` };
  }
}

// ─── System Prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: AgentContext) {
  const d = PLATFORM_DATA;
  const roleLabel: Record<string, string> = {
    company_admin: 'مدير الشركة',
    accountant:    'المحاسب',
    auditor:       'مدقق الحسابات',
    super_admin:   'المدير العام',
  };

  return `أنت مساعد مالي ذكي لمنصة ركائز — وسيط المصرفية المفتوحة للمنشآت الصغيرة والمتوسطة في المملكة العربية السعودية.
تعمل لصالح ${ctx.userName}، ${roleLabel[ctx.userRole] || 'مستخدم النظام'}.

دور ركائز (من عرض هاكاثون امد):
ركائز تجمع بيانات المنشأة من بنوكها المتعددة وبوابات الدفع عبر Open Banking المعتمد من ساما، وتصبّها في تقرير ائتماني موحد معتمد، يُتيح للبنوك تحليل المؤشرات المالية بهدف الإقراض. كما تتيح للمنشأة مقارنة مؤشراتها بمتوسط القطاع عالمياً، وإنشاء قوائم مالية بالذكاء الاصطناعي لإيداعها أو مشاركتها مع البنوك — كل ذلك من لوحة تحكم واحدة.

بيانات المنشأة الحالية (مجمّعة من البنوك المربوطة):
- إجمالي الأرصدة: ${d.totalBalance.toLocaleString()} ريال من 3 بنوك (الراجحي · الأهلي · STC Pay)
- بنك الرياض: غير مربوط — ربطه يحسّن الصورة المالية
- التدفق الشهري الوارد: ${d.totalMonthlyIn.toLocaleString()} ريال | الصادر: ${d.totalMonthlyOut.toLocaleString()} ريال
- نمو الإيرادات: ${d.revenueGrowth} مقارنة بالعام الماضي
- معاملات غير مصنفة: ${d.unclassifiedTxCount} معاملات بإجمالي ${d.unclassifiedTxValue.toLocaleString()} ريال — تصنيفها يرفع دقة التقرير
- التصنيف الائتماني المعتمد: ${d.simahScore}/900 — ${d.simahRating} "${d.simahLabel}"
- المنشأة أعلى من ${d.simahPercentile}% من شركات القطاع
- التصنيف يؤهل للحصول على تمويل حتى 3,000,000 ريال بمعدل 6.5%
- مقارنة القطاع: تتفوق على ${d.benchmarks.aboveAverage} من ${d.benchmarks.total} مؤشرات
- صافي الربح Q1 2026: ${d.analytics.netProfit.toLocaleString()} ريال بهامش ${d.analytics.profitMarginPct}%

أدواتك:
- get_aggregated_banking_data: بيانات البنوك والأرصدة والمعاملات
- get_credit_report: التصنيف الائتماني المعتمد والمؤشرات
- get_sector_benchmarks: مقارنة القطاع
- get_financial_statements: حالة القوائم المالية
- get_analytics_summary: التحليل المالي والإيرادات
- get_financing_opportunities: عروض التمويل المتاحة
- generate_ai_financial_statement: إنشاء قائمة مالية بالـ AI
- classify_bank_transaction: تصنيف معاملة بنكية

قواعد أساسية:
- دائماً استخدم الأدوات أولاً لجلب البيانات قبل التحليل
- الأرقام بالإنجليزية (2,558,700 لا ٢٬٥٥٨٬٧٠٠)
- لا تخترع أرقاماً — استخدم البيانات المجمّعة فقط
- ركّز على قيمة ركائز: توحيد البيانات البنكية → تصنيف ائتماني → تمويل أفضل
- التاريخ اليوم: ${new Date().toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
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
        const result = await executeTool(name, args);
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
  const d = PLATFORM_DATA;

  // Static report — numbers match the UI exactly
  const staticReport: FinanceReport = {
    generated_at: new Date().toISOString(),
    attention_level: 'medium',
    summary: `الوضع المالي للمنشأة إيجابي: إجمالي الأرصدة المجمّعة ${d.totalBalance.toLocaleString()} ريال من 3 بنوك. التصنيف الائتماني ${d.simahScore}/900 (${d.simahRating}) جاهز للمشاركة مع البنوك. يوجد ${d.unclassifiedTxCount} معاملات تحتاج تصنيفاً لتعزيز دقة التقرير.`,
    highlights: [
      { label: 'إجمالي الرصيد المجمّع', value: `${d.totalBalance.toLocaleString()} ريال`, alert: false },
      { label: 'التصنيف الائتماني',      value: `${d.simahScore}/900 — ${d.simahRating}`,   alert: false },
      { label: 'معاملات تحتاج تصنيفاً',  value: `${d.unclassifiedTxCount} معاملات`,           alert: true  },
      { label: 'نمو الإيرادات السنوي',    value: d.revenueGrowth,                               alert: false },
    ],
    priorities: [
      { text: `تصنيف ${d.unclassifiedTxCount} معاملات بنكية بإجمالي ${d.unclassifiedTxValue.toLocaleString()} ريال لتعزيز دقة التقرير الائتماني`, page: 'bank' },
      { text: 'مشاركة التقرير الائتماني مع البنك الأهلي للحصول على تمويل بمعدل 6.5%', page: 'credit' },
      { text: 'ربط بنك الرياض لاكتمال الصورة المالية المجمّعة وتحسين التصنيف', page: 'bank' },
    ],
    actions_taken: [
      `تحليل بيانات 3 بنوك مربوطة: الراجحي (${(1_840_000).toLocaleString()} ر.س) · الأهلي (${(620_500).toLocaleString()} ر.س) · STC Pay (${(98_200).toLocaleString()} ر.س)`,
      `استرداد التصنيف الائتماني: ${d.simahScore}/900 — أعلى من ${d.simahPercentile}% من شركات ${d.benchmarks.sector}`,
    ],
    next_steps: [
      { text: `مشاركة التقرير الائتماني ${d.simahRating} مع البنوك للحصول على تمويل حتى 3,000,000 ريال`, page: 'credit' },
      { text: 'إنشاء قائمة دخل Q2 2026 بالذكاء الاصطناعي من البيانات المجمّعة', page: 'statements' },
      { text: `مراجعة مقارنة القطاع — تتفوق على ${d.benchmarks.aboveAverage} من ${d.benchmarks.total} مؤشرات`, page: 'benchmarks' },
    ],
  };

  const apiKey = process.env.GEMENI_KEY || process.env.GEMINI_KEY;
  if (!apiKey) return staticReport;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const today = new Date().toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `أنت مساعد مالي لمنصة ركائز (وسيط Open Banking للمنشآت الصغيرة والمتوسطة في السعودية). اليوم ${today}.

بيانات المنشأة الفعلية المجمّعة من البنوك المربوطة:
${JSON.stringify({
  banks: d.banks,
  total_balance_sar: d.totalBalance,
  monthly_inflow: d.totalMonthlyIn,
  monthly_outflow: d.totalMonthlyOut,
  revenue_growth: d.revenueGrowth,
  unclassified_transactions: { count: d.unclassifiedTxCount, total_value_sar: d.unclassifiedTxValue },
  credit_score: { score: d.simahScore, out_of: 900, rating: d.simahRating, label: d.simahLabel, percentile: d.simahPercentile },
  sector_benchmarks: { above_average: d.benchmarks.aboveAverage, total: d.benchmarks.total, sector: d.benchmarks.sector },
  statements: d.statements,
  analytics: d.analytics,
  financing_offers: d.financingOffers,
}, null, 2)}

أنتج JSON فقط (بدون نص خارج الـ JSON):
{
  "attention_level": "low|medium|high",
  "summary": "جملتان عن الوضع الفعلي مع أرقام من البيانات",
  "highlights": [
    {"label": "إجمالي الرصيد المجمّع", "value": "X ريال", "alert": false},
    {"label": "التصنيف الائتماني", "value": "720/900 — B+", "alert": false},
    {"label": "معاملات تحتاج تصنيفاً", "value": "7 معاملات", "alert": true},
    {"label": "نمو الإيرادات السنوي", "value": "+18.4%", "alert": false}
  ],
  "priorities": [{"text": "...", "page": "bank|credit|benchmarks|statements|analytics"}],
  "actions_taken": ["..."],
  "next_steps": [{"text": "...", "page": "bank|credit|benchmarks|statements|analytics"}]
}

قواعد:
- attention_level: high إذا معاملات غير مصنفة كثيرة؛ medium إذا التصنيف جيد لكن يمكن تحسينه؛ low إذا كل شيء ممتاز
- استخدم الأرقام الفعلية من البيانات فقط — لا تخترع أرقاماً
- الأرقام بالإنجليزية، العبارات بالعربية المهنية`;

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
      arr.map(i => (typeof i === 'string' ? { text: i } : { text: i.text, page: i.page }));

    return {
      generated_at: new Date().toISOString(),
      attention_level: ['low', 'medium', 'high'].includes(parsed.attention_level) ? parsed.attention_level : 'medium',
      summary: parsed.summary || staticReport.summary,
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 4) : staticReport.highlights,
      priorities: Array.isArray(parsed.priorities) ? toItems(parsed.priorities).slice(0, 4) : staticReport.priorities,
      actions_taken: Array.isArray(parsed.actions_taken) ? parsed.actions_taken : staticReport.actions_taken,
      next_steps: Array.isArray(parsed.next_steps) ? toItems(parsed.next_steps).slice(0, 3) : staticReport.next_steps,
    };
  } catch {
    return staticReport;
  }
}

// ─── AI Credit Report ────────────────────────────────────────────────────────

export async function generateCreditReport(): Promise<CreditReport> {
  const d = PLATFORM_DATA;

  const staticRatios: CreditRatio[] = [
    { key: 'profit_margin',  label: 'هامش الربح الصافي',           value: d.ratios.profitMargin.value,  unit: '%',    benchmark: d.ratios.profitMargin.benchmark,  benchmarkLabel: `متوسط القطاع: ${d.ratios.profitMargin.benchmark}%`,     status: d.ratios.profitMargin.status  as CreditRatio['status'], description: 'نسبة الربح الصافي من إجمالي الإيرادات' },
    { key: 'current_ratio',  label: 'نسبة السيولة الجارية',         value: d.ratios.currentRatio.value,  unit: 'x',    benchmark: d.ratios.currentRatio.benchmark,  benchmarkLabel: `معيار البنوك: ≥ ${d.ratios.currentRatio.benchmark}`,    status: d.ratios.currentRatio.status  as CreditRatio['status'], description: 'قدرة الشركة على تغطية التزاماتها قصيرة الأجل' },
    { key: 'debt_equity',    label: 'نسبة الدين إلى حقوق الملكية',  value: d.ratios.debtEquity.value,    unit: 'x',    benchmark: d.ratios.debtEquity.benchmark,    benchmarkLabel: `معيار البنوك: ≤ ${d.ratios.debtEquity.benchmark}`,     status: d.ratios.debtEquity.status    as CreditRatio['status'], description: 'مستوى الرافعة المالية للشركة' },
    { key: 'dso',            label: 'متوسط فترة التحصيل',           value: d.ratios.dso.value,           unit: 'يوم',  benchmark: d.ratios.dso.benchmark,           benchmarkLabel: `متوسط القطاع: ${d.ratios.dso.benchmark} يوم`,          status: d.ratios.dso.status           as CreditRatio['status'], description: 'متوسط الأيام اللازمة لتحصيل المستحقات' },
    { key: 'revenue_growth', label: 'نمو الإيرادات (سنوي)',          value: d.ratios.revenueGrowth.value, unit: '%',    benchmark: d.ratios.revenueGrowth.benchmark, benchmarkLabel: `متوسط القطاع: ${d.ratios.revenueGrowth.benchmark}%`,   status: d.ratios.revenueGrowth.status as CreditRatio['status'], description: 'معدل نمو الإيرادات مقارنةً بالعام الماضي' },
    { key: 'cash_coverage',  label: 'نسبة تغطية النقد',             value: d.ratios.cashCoverage.value,  unit: 'x',    benchmark: d.ratios.cashCoverage.benchmark,  benchmarkLabel: `معيار البنوك: ≥ ${d.ratios.cashCoverage.benchmark}`,   status: d.ratios.cashCoverage.status  as CreditRatio['status'], description: 'قدرة التدفقات النقدية على تغطية خدمة الدين' },
  ];

  const staticReport: CreditReport = {
    generated_at: new Date().toISOString(),
    score:       d.simahScore,
    letter:      'B+',
    rating:      d.simahLabel,
    percentile:  d.simahPercentile,
    visual_pct:  Math.round(((d.simahScore - 300) / 600) * 100),
    valid_until: d.creditValidUntil,
    ratios:      staticRatios,
    strengths: [
      `هامش ربح ${d.ratios.profitMargin.value}% يتجاوز متوسط القطاع ${d.ratios.profitMargin.benchmark}%`,
      `نمو إيرادات ${d.ratios.revenueGrowth.value}% مقابل متوسط قطاعي ${d.ratios.revenueGrowth.benchmark}%`,
      `نسبة سيولة ${d.ratios.currentRatio.value}x تتجاوز متطلبات البنوك ${d.ratios.currentRatio.benchmark}x`,
    ],
    risks: [
      `فترة تحصيل ${d.ratios.dso.value} يوماً أعلى من متوسط القطاع ${d.ratios.dso.benchmark} يوماً`,
      'تركز الإيرادات في عدد محدود من العملاء يرفع مخاطر الائتمان',
    ],
    recommendations: [
      `تطبيق سياسة تحصيل أكثر صرامة لخفض DSO من ${d.ratios.dso.value} إلى ${d.ratios.dso.benchmark} يوماً`,
      'تنويع قاعدة العملاء لتقليل مخاطر التركز',
      'توثيق العقود متعددة السنوات لتعزيز ثقة البنوك',
    ],
  };

  const apiKey = process.env.GEMENI_KEY || process.env.GEMINI_KEY;
  if (!apiKey) return staticReport;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const inputData = {
    total_balance_sar:       d.totalBalance,
    monthly_inflow:          d.totalMonthlyIn,
    monthly_outflow:         d.totalMonthlyOut,
    net_monthly:             d.netMonthly,
    revenue_growth:          d.revenueGrowth,
    unclassified_tx:         d.unclassifiedTxCount,
    credit_score:            d.simahScore,
    credit_rating:           d.simahLabel,
    percentile:              d.simahPercentile,
    sector:                  d.benchmarks.sector,
    above_sector_avg:        `${d.benchmarks.aboveAverage}/${d.benchmarks.total}`,
    net_profit_q1:           d.analytics.netProfit,
    profit_margin_pct:       d.analytics.profitMarginPct,
    ratios: {
      profit_margin:   { actual: d.ratios.profitMargin.value,  sector_avg: d.ratios.profitMargin.benchmark,  unit: '%'   },
      current_ratio:   { actual: d.ratios.currentRatio.value,  bank_min: d.ratios.currentRatio.benchmark,    unit: 'x'   },
      debt_equity:     { actual: d.ratios.debtEquity.value,    bank_max: d.ratios.debtEquity.benchmark,      unit: 'x'   },
      dso_days:        { actual: d.ratios.dso.value,           sector_avg: d.ratios.dso.benchmark,           unit: 'day' },
      revenue_growth:  { actual: d.ratios.revenueGrowth.value, sector_avg: d.ratios.revenueGrowth.benchmark, unit: '%'   },
      cash_coverage:   { actual: d.ratios.cashCoverage.value,  bank_min: d.ratios.cashCoverage.benchmark,    unit: 'x'   },
    },
  };

  const prompt = `أنت محلل ائتماني لمنشأة في السعودية. بناءً على البيانات التالية، أنتج تقريراً ائتمانياً ديناميكياً.

${JSON.stringify(inputData, null, 2)}

أنتج JSON فقط بهذا الشكل بالضبط:
{
  "ratios": [
    {
      "key": "profit_margin",
      "label": "هامش الربح الصافي",
      "value": 32.5,
      "unit": "%",
      "benchmark": 24,
      "benchmarkLabel": "متوسط القطاع: 24%",
      "status": "good",
      "description": "جملة تحليلية قصيرة تذكر الرقم الفعلي ومقارنته بالمعيار"
    }
  ],
  "strengths": ["نقطة قوة مع رقم فعلي"],
  "risks": ["خطر مع رقم فعلي"],
  "recommendations": ["توصية عملية قصيرة"]
}

قواعد صارمة:
- ratios: 6 مؤشرات بنفس الـ keys: profit_margin, current_ratio, debt_equity, dso, revenue_growth, cash_coverage
- القيم (value, benchmark) أرقام فعلية من البيانات — لا تغيّر الأرقام
- status: "good" إذا كان الأداء أفضل من المعيار، "warning" إذا كان أسوأ، "bad" إذا كان سيئاً جداً
- description: جملة واحدة تحليلية قصيرة تذكر الرقم الفعلي
- strengths: 3 نقاط | risks: 2-3 نقاط | recommendations: 3 نقاط
- الأرقام بالإنجليزية، العبارات بالعربية المهنية`;

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
    const parsed = JSON.parse((fenced ? fenced[1] : text).trim());

    const validStatuses = ['good', 'warning', 'bad'];
    const aiRatios: CreditRatio[] = Array.isArray(parsed.ratios)
      ? parsed.ratios.slice(0, 6).map((r: any, i: number) => ({
          key:            r.key            || staticRatios[i]?.key || `ratio_${i}`,
          label:          r.label          || staticRatios[i]?.label || '',
          value:          typeof r.value === 'number' ? r.value : staticRatios[i]?.value ?? 0,
          unit:           r.unit           || staticRatios[i]?.unit || '',
          benchmark:      typeof r.benchmark === 'number' ? r.benchmark : staticRatios[i]?.benchmark ?? 0,
          benchmarkLabel: r.benchmarkLabel || staticRatios[i]?.benchmarkLabel || '',
          status:         validStatuses.includes(r.status) ? r.status : staticRatios[i]?.status ?? 'good',
          description:    r.description   || staticRatios[i]?.description || '',
        }))
      : staticRatios;

    return {
      ...staticReport,
      ratios:          aiRatios,
      strengths:       Array.isArray(parsed.strengths)       ? parsed.strengths.slice(0, 4)       : staticReport.strengths,
      risks:           Array.isArray(parsed.risks)           ? parsed.risks.slice(0, 3)           : staticReport.risks,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 4) : staticReport.recommendations,
    };
  } catch {
    return staticReport;
  }
}
