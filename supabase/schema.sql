-- FinStream Database Schema
-- Open Banking + Accounting + Financial Statements + Official Filing

-- Enums
create type user_role as enum ('super_admin', 'company_admin', 'accountant', 'auditor');
create type user_status as enum ('active', 'inactive', 'suspended');
create type transaction_type as enum ('credit', 'debit');
create type statement_status as enum ('draft', 'pending_review', 'approved', 'filed');
create type approval_status as enum ('pending', 'in_review', 'approved', 'rejected');
create type filing_status as enum ('pending', 'submitted', 'acknowledged', 'rejected');
create type filing_type as enum ('ministry_of_commerce', 'zakat_tax', 'other');
create type statement_type as enum ('income_statement', 'balance_sheet', 'cash_flow');

-- Companies
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text not null,
  commercial_registration text unique not null,
  tax_number text,
  bank_account_iban text,
  bank_name text,
  bank_account_number text,
  logo_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Users
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  first_name text not null,
  last_name text not null,
  role user_role not null default 'accountant',
  status user_status not null default 'active',
  avatar_url text,
  company_id uuid references companies(id) on delete set null,
  created_at timestamptz default now()
);

-- Bank Transactions (imported from Open Banking)
create table bank_transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  transaction_date date not null,
  description text not null,
  amount decimal(15,2) not null,
  type transaction_type not null,
  balance_after decimal(15,2),
  reference_number text,
  category text,                    -- AI-assigned accounting category
  account_code text,                -- Mapped accounting account code
  is_reconciled boolean default false,
  classified_by_ai boolean default false,
  classified_at timestamptz,
  created_at timestamptz default now()
);

-- Journal Entries (double-entry accounting)
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  entry_date date not null,
  description text not null,
  debit_account text not null,
  credit_account text not null,
  amount decimal(15,2) not null,
  transaction_id uuid references bank_transactions(id) on delete set null,
  auto_generated boolean default false,  -- true = AI-generated from bank transaction
  created_by uuid references users(id),
  created_at timestamptz default now()
);

-- Financial Statements
create table financial_statements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  statement_type statement_type not null,
  period_start date not null,
  period_end date not null,
  status statement_status not null default 'draft',
  data jsonb not null default '{}',    -- Full statement data as JSON
  ai_generated boolean default false,
  created_by uuid references users(id),
  approved_by uuid references users(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- Approvals
create table approvals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  title text not null,
  description text,
  entity_type text not null,         -- 'statement' | 'filing' | 'transaction'
  entity_id uuid not null,
  status approval_status not null default 'pending',
  priority text default 'normal',
  requested_by uuid references users(id),
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- Filings (official government submissions)
create table filings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  statement_id uuid references financial_statements(id) on delete set null,
  filing_type filing_type not null default 'ministry_of_commerce',
  status filing_status not null default 'pending',
  reference_number text,             -- Government reference number
  filed_at timestamptz,
  acknowledged_at timestamptz,
  rejection_reason text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

-- RLS Policies
alter table companies enable row level security;
alter table users enable row level security;
alter table bank_transactions enable row level security;
alter table journal_entries enable row level security;
alter table financial_statements enable row level security;
alter table approvals enable row level security;
alter table filings enable row level security;

-- Users can read their own data
create policy "users_read_own" on users for select using (auth.uid() = id);
create policy "users_update_own" on users for update using (auth.uid() = id);

-- Company-scoped access for all tables
create policy "company_data_access" on bank_transactions for all
  using (company_id = (select company_id from users where id = auth.uid()));

create policy "company_journal_access" on journal_entries for all
  using (company_id = (select company_id from users where id = auth.uid()));

create policy "company_statements_access" on financial_statements for all
  using (company_id = (select company_id from users where id = auth.uid()));

create policy "company_approvals_access" on approvals for all
  using (company_id = (select company_id from users where id = auth.uid()));

create policy "company_filings_access" on filings for all
  using (company_id = (select company_id from users where id = auth.uid()));

create policy "company_read_access" on companies for select
  using (id = (select company_id from users where id = auth.uid()));

-- Indexes for performance
create index idx_bank_transactions_company_date on bank_transactions(company_id, transaction_date desc);
create index idx_bank_transactions_status on bank_transactions(company_id, is_reconciled);
create index idx_journal_entries_company_date on journal_entries(company_id, entry_date desc);
create index idx_financial_statements_company on financial_statements(company_id, status);
create index idx_approvals_company_status on approvals(company_id, status);
create index idx_filings_company_status on filings(company_id, status);

-- No trigger: user profiles are created manually by the API routes
-- (register route and users/create route) to avoid duplicate key conflicts.
