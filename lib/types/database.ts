export type UserRole = 'super_admin' | 'company_admin' | 'accountant' | 'auditor';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type TransactionType = 'credit' | 'debit';
export type StatementStatus = 'draft' | 'pending_review' | 'approved' | 'filed';
export type ApprovalStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type FilingStatus = 'pending' | 'submitted' | 'acknowledged' | 'rejected';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string | null;
  avatar_emoji?: string | null;
  company_id?: string | null;
  companies?: Company | null;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  name_ar: string;
  commercial_registration: string;
  tax_number?: string | null;
  bank_account_iban?: string | null;
  logo_url?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BankTransaction {
  id: string;
  company_id: string;
  transaction_date: string;
  description: string;
  amount: number;
  type: TransactionType;
  balance_after: number;
  reference_number?: string | null;
  category?: string | null;
  account_code?: string | null;
  is_reconciled: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  company_id: string;
  entry_date: string;
  description: string;
  debit_account: string;
  credit_account: string;
  amount: number;
  transaction_id?: string | null;
  created_by: string;
  created_at: string;
}

export interface FinancialStatement {
  id: string;
  company_id: string;
  statement_type: 'income_statement' | 'balance_sheet' | 'cash_flow';
  period_start: string;
  period_end: string;
  status: StatementStatus;
  data: Record<string, any>;
  created_by: string;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
}

export interface Approval {
  id: string;
  company_id: string;
  title: string;
  description?: string | null;
  entity_type: 'statement' | 'filing' | 'transaction';
  entity_id: string;
  status: ApprovalStatus;
  requested_by: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Filing {
  id: string;
  company_id: string;
  statement_id: string;
  filing_type: 'ministry_of_commerce' | 'zakat_tax' | 'other';
  status: FilingStatus;
  reference_number?: string | null;
  filed_at?: string | null;
  acknowledged_at?: string | null;
  created_by: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      companies: { Row: Company; Insert: Partial<Company>; Update: Partial<Company> };
      bank_transactions: { Row: BankTransaction; Insert: Partial<BankTransaction>; Update: Partial<BankTransaction> };
      journal_entries: { Row: JournalEntry; Insert: Partial<JournalEntry>; Update: Partial<JournalEntry> };
      financial_statements: { Row: FinancialStatement; Insert: Partial<FinancialStatement>; Update: Partial<FinancialStatement> };
      approvals: { Row: Approval; Insert: Partial<Approval>; Update: Partial<Approval> };
      filings: { Row: Filing; Insert: Partial<Filing>; Update: Partial<Filing> };
    };
  };
}
