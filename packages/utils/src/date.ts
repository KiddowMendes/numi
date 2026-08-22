/**
 * Get the start of day (00:00:00) in local timezone.
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Check if two dates are the same calendar day in local timezone.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Calculate whole days remaining from today to target date.
 * Returns NULL if no target. Returns 0 if target is in the past or today.
 */
export function daysRemaining(endDate: Date | null, today: Date): number | null {
  if (endDate === null) return null;

  const todayStart = startOfDay(today);
  const endStart = startOfDay(endDate);

  const diffMs = endStart.getTime() - todayStart.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays <= 0 ? 0 : diffDays;
}

/**
 * Get today's date at midnight (local timezone).
 */
export function today(): Date {
  return startOfDay(new Date());
}

/**
 * Get the number of whole days between two dates.
 * Returns 0 if same day or if end is before start.
 */
export function daysBetween(start: Date, end: Date): number {
  const startMs = startOfDay(start).getTime();
  const endMs = startOfDay(end).getTime();
  const diffMs = endMs - startMs;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Check if a date falls within an inclusive range [start, end].
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = startOfDay(date).getTime();
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  return d >= s && d <= e;
}
