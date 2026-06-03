-- Add Open Banking connection fields to companies table
alter table companies
  add column if not exists consent_id text,
  add column if not exists bank_code text default 'SVMB01',
  add column if not exists bank_account_id text,
  add column if not exists bank_connected_at timestamptz;
