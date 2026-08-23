const ZAR_FORMATTER = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Format an amount (in cents) as ZAR currency.
 */
export function formatCurrency(amountInCents: number): string {
  return ZAR_FORMATTER.format(amountInCents / 100);
}

/**
 * Format a date as a short human-readable string.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
