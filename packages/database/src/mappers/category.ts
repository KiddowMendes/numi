import type { Category } from '@numi/domain';

export interface CategoryRow {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_default: number;
  created_at: string;
}

export function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    is_default: row.is_default === 1,
    created_at: new Date(row.created_at),
  };
}

export function toCategoryRow(category: Category): CategoryRow {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    icon: category.icon,
    is_default: category.is_default ? 1 : 0,
    created_at: category.created_at.toISOString(),
  };
}
