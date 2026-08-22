import { describe, it, expect } from 'vitest';
import { calculateDaysRemaining } from '../../src/calculations/days-remaining.js';
import { factories } from '../factories/index.js';

describe('C4 - Days Remaining in Active Period', () => {
  it('should return null if no active period', () => {
    const result = calculateDaysRemaining(null, new Date());
    expect(result).toBeNull();
  });

  it('should return 0 if today is the end date', () => {
    const today = new Date(2026, 0, 15);
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 15),
    });
    const result = calculateDaysRemaining(period, today);
    expect(result).toBe(0);
  });

  it('should return 0 if today is past end date', () => {
    const today = new Date(2026, 0, 20);
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 15),
    });
    const result = calculateDaysRemaining(period, today);
    expect(result).toBe(0);
  });

  it('should calculate days remaining correctly', () => {
    const today = new Date(2026, 0, 10);
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 20),
    });
    const result = calculateDaysRemaining(period, today);
    expect(result).toBe(10);
  });

  it('should return 1 for tomorrow', () => {
    const today = new Date(2026, 0, 14);
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 15),
    });
    const result = calculateDaysRemaining(period, today);
    expect(result).toBe(1);
  });
});
