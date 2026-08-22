import type { Period } from '../entities/Period.js';
import { daysRemaining as calcDaysRemaining } from '@numi/utils';

/**
 * C4. Days Remaining in Active Period.
 * Returns NULL if no active period. Returns 0 if today >= end_date.
 */
export function calculateDaysRemaining(activePeriod: Period | null, today: Date): number | null {
  if (!activePeriod) return null;
  return calcDaysRemaining(activePeriod.end_date, today);
}
