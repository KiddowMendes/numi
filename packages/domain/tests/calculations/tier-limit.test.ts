import { describe, it, expect } from 'vitest';
import { canCreateWallet, canCreateGoal } from '../../src/calculations/tier-limit.js';
import { factories } from '../factories/index.js';

describe('C13 - Tier Limit Check', () => {
  describe('canCreateWallet', () => {
    it('should allow free user with 0 wallets', () => {
      const user = factories.createUser({ tier: 'free' });
      expect(canCreateWallet(user, 0)).toBe(true);
    });

    it('should reject free user with 1 wallet', () => {
      const user = factories.createUser({ tier: 'free' });
      expect(canCreateWallet(user, 1)).toBe(false);
    });

    it('should allow freemium user with 2 wallets', () => {
      const user = factories.createUser({ tier: 'freemium' });
      expect(canCreateWallet(user, 2)).toBe(true);
    });

    it('should reject freemium user with 3 wallets', () => {
      const user = factories.createUser({ tier: 'freemium' });
      expect(canCreateWallet(user, 3)).toBe(false);
    });

    it('should allow premium user unlimited', () => {
      const user = factories.createUser({ tier: 'premium' });
      expect(canCreateWallet(user, 100)).toBe(true);
    });
  });

  describe('canCreateGoal', () => {
    it('should reject free user with 0 goals', () => {
      const user = factories.createUser({ tier: 'free' });
      expect(canCreateGoal(user, 0)).toBe(false);
    });

    it('should allow freemium user with 2 goals', () => {
      const user = factories.createUser({ tier: 'freemium' });
      expect(canCreateGoal(user, 2)).toBe(true);
    });

    it('should reject freemium user with 3 goals', () => {
      const user = factories.createUser({ tier: 'freemium' });
      expect(canCreateGoal(user, 3)).toBe(false);
    });

    it('should allow premium user unlimited', () => {
      const user = factories.createUser({ tier: 'premium' });
      expect(canCreateGoal(user, 100)).toBe(true);
    });
  });
});
