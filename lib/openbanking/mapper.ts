export interface SingleViewTransaction {
  transactionId: string;
  transactionDateTime: string;
  transactionInformation?: string;
  creditDebitIndicator: 'CRDT' | 'DBIT';
  amount: { amount: string; currency: string };
  balance?: { amount: { amount: string } };
  merchantDetails?: { merchantName?: string };
}

export interface InsertBankTransaction {
  reference_number: string;
  transaction_date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance_after: number;
  is_reconciled: boolean;
  classified_by_ai: boolean;
}

export function mapSingleViewTransaction(svTx: SingleViewTransaction): InsertBankTransaction {
  return {
    reference_number: svTx.transactionId,
    transaction_date: svTx.transactionDateTime.slice(0, 10),
    description:
      svTx.transactionInformation ||
      svTx.merchantDetails?.merchantName ||
      'معاملة بنكية',
    amount: Math.abs(parseFloat(svTx.amount.amount)),
    type: svTx.creditDebitIndicator === 'CRDT' ? 'credit' : 'debit',
    balance_after: parseFloat(svTx.balance?.amount?.amount ?? '0'),
    is_reconciled: false,
    classified_by_ai: false,
  };
}

// 15 realistic mock transactions used when OSV_BASE_URL is not set
export const MOCK_TRANSACTIONS: InsertBankTransaction[] = [
  { reference_number: 'TRN-2026-0001', transaction_date: '2026-06-03', description: 'تحويل وارد - شركة النخيل للتجارة', amount: 250000, type: 'credit', balance_after: 1840000, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0002', transaction_date: '2026-06-01', description: 'رواتب موظفين - يونيو 2026', amount: 92000, type: 'debit', balance_after: 1590000, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0003', transaction_date: '2026-05-31', description: 'سداد فاتورة استضافة سحابية - AWS', amount: 3200, type: 'debit', balance_after: 1682000, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0004', transaction_date: '2026-05-30', description: 'إيراد خدمات استشارية - شركة الفجر', amount: 65000, type: 'credit', balance_after: 1685200, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0005', transaction_date: '2026-05-29', description: 'إيجار مكتب الرياض - مايو 2026', amount: 28000, type: 'debit', balance_after: 1620200, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0006', transaction_date: '2026-05-28', description: 'عمولة بنكية شهرية', amount: 450, type: 'debit', balance_after: 1648200, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0007', transaction_date: '2026-05-27', description: 'دفعة مقدمة مشروع جدة - الدفعة الأولى', amount: 120000, type: 'credit', balance_after: 1648650, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0008', transaction_date: '2026-05-26', description: 'فاتورة موردين - شركة التقنية المتقدمة', amount: 45000, type: 'debit', balance_after: 1528650, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0009', transaction_date: '2026-05-25', description: 'إيراد مبيعات - الربع الثاني', amount: 380000, type: 'credit', balance_after: 1573650, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0010', transaction_date: '2026-05-24', description: 'مصروفات سفر وانتقال - اجتماع الرياض', amount: 8500, type: 'debit', balance_after: 1193650, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0011', transaction_date: '2026-05-23', description: 'قسط سيارة الشركة - مايو', amount: 12000, type: 'debit', balance_after: 1202150, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0012', transaction_date: '2026-05-22', description: 'اشتراك برامج وتراخيص - Microsoft 365', amount: 4800, type: 'debit', balance_after: 1214150, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0013', transaction_date: '2026-05-21', description: 'إيراد تدريب وورش عمل', amount: 22000, type: 'credit', balance_after: 1218950, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0014', transaction_date: '2026-05-20', description: 'مصروفات قرطاسية ومستلزمات مكتبية', amount: 1200, type: 'debit', balance_after: 1196950, is_reconciled: false, classified_by_ai: false },
  { reference_number: 'TRN-2026-0015', transaction_date: '2026-05-19', description: 'مكافآت نهاية الخدمة - موظف مستقيل', amount: 18500, type: 'debit', balance_after: 1198150, is_reconciled: false, classified_by_ai: false },
];
