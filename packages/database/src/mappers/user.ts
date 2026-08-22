import type { User } from '@numi/domain';

export interface UserRow {
  id: string;
  tier: string;
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    tier: row.tier as User['tier'],
  };
}

export function toUserRow(user: User): UserRow {
  return {
    id: user.id,
    tier: user.tier,
  };
}
