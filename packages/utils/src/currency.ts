/**
 * Convert cents (integer) to Rand display string.
 * e.g. 12345 → "R123.45", 100 → "R1.00", 5 → "R0.05"
 */
export function centsToRand(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const rands = Math.floor(abs / 100);
  const remainder = abs % 100;
  const centsStr = remainder.toString().padStart(2, '0');
  return `${sign}R${rands}.${centsStr}`;
}

/**
 * Convert Rand string or number to cents (integer).
 * e.g. "R123.45" → 12345, 1.5 → 150, "10" → 1000
 */
export function randToCents(rand: number | string): number {
  if (typeof rand === 'number') {
    return Math.round(rand * 100);
  }
  const cleaned = rand.replace(/[^0-9.\-]/g, '');
  return Math.round(parseFloat(cleaned) * 100);
}

/**
 * Format cents as a compact Rand display.
 * e.g. 1234500 → "R12,345", 100 → "R1"
 */
export function formatRandCompact(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const rands = Math.floor(abs / 100);
  return `${sign}R${rands.toLocaleString('en-ZA')}`;
}
