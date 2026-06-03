// Dates: Arabic month/weekday names, Gregorian calendar, English digits (u-nu-latn)
// Currency: English digits, SAR symbol

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA-u-nu-latn', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn-ca-gregory', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn-ca-gregory', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateStr));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
