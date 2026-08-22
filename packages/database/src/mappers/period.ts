import type { Period } from '@numi/domain';

export interface PeriodRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: number;
  created_at: string;
}

export function toPeriod(row: PeriodRow): Period {
  return {
    id: row.id,
    name: row.name,
    start_date: new Date(row.start_date),
    end_date: new Date(row.end_date),
    is_active: row.is_active === 1,
    created_at: new Date(row.created_at),
  };
}

export function toPeriodRow(period: Period): PeriodRow {
  return {
    id: period.id,
    name: period.name,
    start_date: period.start_date.toISOString(),
    end_date: period.end_date.toISOString(),
    is_active: period.is_active ? 1 : 0,
    created_at: period.created_at.toISOString(),
  };
}
