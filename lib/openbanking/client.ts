// SingleView Open Banking API client
// Docs: https://docs.onesingleview.com/docs/open-banking-api-access-token

const BASE_URL = process.env.OSV_BASE_URL || '';
const CLIENT_ID = process.env.OSV_CLIENT_ID || '';
const CLIENT_CODE = process.env.OSV_CLIENT_CODE || '';
const MERCHANT_ID = process.env.OSV_MERCHANT_ID || '';

const MOCK_MODE = !BASE_URL;

// Module-level token cache (55 min TTL — API gives 60)
let _cachedToken: string | null = null;
let _tokenExpiry = 0;

export async function getToken(): Promise<string> {
  if (MOCK_MODE) return 'MOCK_TOKEN';
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  const res = await fetch(`${BASE_URL}/v1/api/observice/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      clientCode: CLIENT_CODE,
      merchantId: MERCHANT_ID,
      grantType: 'Client_Credentials',
    }),
  });

  if (!res.ok) throw new Error(`OSV token error ${res.status}`);
  const json = await res.json();
  _cachedToken = json.payload.access_token;
  _tokenExpiry = Date.now() + 55 * 60 * 1000;
  return _cachedToken!;
}

export async function createConsent(accessToken: string, redirectUrl: string) {
  if (MOCK_MODE) {
    return {
      consentId: `MOCK-CONSENT-${Date.now()}`,
      bankRedirectUrl: '/bank/connecting',
    };
  }

  const res = await fetch(`${BASE_URL}/v1/api/observice/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      clientId: CLIENT_ID,
      clientCode: CLIENT_CODE,
    },
    body: JSON.stringify({
      dateTimeStamp: new Date().toISOString(),
      requestID: crypto.randomUUID(),
      merchantId: MERCHANT_ID,
      useCaseType: 'AISP',
      redirectUrl,
      banks: [
        {
          code: 'SVMB01',
          permissions: ['ReadAccountsBasic', 'ReadBalances', 'ReadTransactionsBasic', 'ReadTransactionsCredits', 'ReadTransactionsDebits'],
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          txnFromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          txnToDate: new Date().toISOString(),
          accountType: 'corporate',
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OSV consent error ${res.status}`);
  const json = await res.json();
  return {
    consentId: json.payload?.consentId,
    bankRedirectUrl: json.payload?.bankRedirectUrl,
  };
}

export async function getBalance(
  accessToken: string,
  consentId: string,
  accountId: string,
  bankCode: string
) {
  if (MOCK_MODE) return { amount: '1840000.00', currency: 'SAR' };

  const res = await fetch(`${BASE_URL}/v1/api/observice/balanceById`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      clientId: CLIENT_ID,
      clientCode: CLIENT_CODE,
    },
    body: JSON.stringify({
      dateTimeStamp: new Date().toISOString(),
      requestID: crypto.randomUUID(),
      merchantId: MERCHANT_ID,
      banks: [{ code: bankCode, consentId, accountId }],
    }),
  });

  if (!res.ok) throw new Error(`OSV balance error ${res.status}`);
  const json = await res.json();
  const balanceData = json.payload?.[0]?.data?.balance?.[0];
  return {
    amount: balanceData?.amount?.amount ?? '0',
    currency: balanceData?.amount?.currency ?? 'SAR',
  };
}

export async function getTransactions(
  accessToken: string,
  consentId: string,
  accountId: string,
  bankCode: string,
  fromDate: string,
  toDate: string
) {
  if (MOCK_MODE) return null; // caller uses MOCK_TRANSACTIONS

  const res = await fetch(`${BASE_URL}/v1/api/observice/transactionsById`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      clientId: CLIENT_ID,
      clientCode: CLIENT_CODE,
    },
    body: JSON.stringify({
      dateTimeStamp: new Date().toISOString(),
      requestID: crypto.randomUUID(),
      merchantId: MERCHANT_ID,
      fromDate,
      toDate,
      banks: [{ code: bankCode, consentId, accountId }],
    }),
  });

  if (!res.ok) throw new Error(`OSV transactions error ${res.status}`);
  const json = await res.json();
  return json.payload?.[0]?.data?.transaction ?? [];
}
