export type UserTier = 'free' | 'freemium' | 'premium';

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; errors: E[] };

export type EngineError =
  | { code: 'INSUFFICIENT_BALANCE'; message: string }
  | { code: 'TIER_LIMIT_EXCEEDED'; message: string }
  | { code: 'INVALID_STATE'; message: string }
  | { code: 'DATA_CORRUPTION'; message: string }
  | { code: 'NOT_FOUND'; message: string };

export type UserContext = {
  userId: string;
  tier: UserTier;
};

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(errors: E[]): Result<never, E> {
  return { ok: false, errors };
}
