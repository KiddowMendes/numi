export type UserTier = 'free' | 'freemium' | 'premium';

export interface User {
  id: string;
  tier: UserTier;
}
