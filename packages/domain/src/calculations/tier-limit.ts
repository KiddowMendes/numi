import type { User, UserTier } from "../entities/User";

const WALLET_LIMITS: Record<UserTier, number> = {
  free: 1,
  freemium: 3,
  premium: Infinity,
};

const GOAL_LIMITS: Record<UserTier, number> = {
  free: 0,
  freemium: 3,
  premium: Infinity,
};

/**
 * C13. Tier Limit Check.
 * Checks if creating a wallet or goal would exceed tier limits.
 */
export function canCreateWallet(user: User, currentCount: number): boolean {
  return currentCount < WALLET_LIMITS[user.tier];
}

export function canCreateGoal(user: User, currentCount: number): boolean {
  return currentCount < GOAL_LIMITS[user.tier];
}
