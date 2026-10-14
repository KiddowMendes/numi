import { create } from "zustand";

import type {
  AppState,
  EngineAPI,
  Transaction,
  Assignment,
} from "@numi/domain";
import { randToCents } from "@numi/utils";

import {
  defaultThemePreference,
  type ThemePreferenceValue,
} from "@numi/design-system";

import { hasPin } from "@/lib/pin";

type TransactionDraft = {
  type: "income" | "expense";
  amount: string;
  categoryId: string | null;
  walletId: string | null;
  note: string;
  date: Date;
};

type TransactionResult =
  | { ok: true; value: Transaction }
  | { ok: false; errors: { code: string; message: string }[] };

/** The transient form the assignment sheet edits, add mode or edit mode. */
type AssignmentDraft = {
  categoryId: string | null;
  walletId: string | null;
  amount: string;
};

/** Which mode the assignment sheet is in. `closed` hides it but keeps the draft. */
export type AssignmentSheetMode = "closed" | "add" | "edit";

type AssignmentResult =
  | { ok: true; value: Assignment }
  | { ok: false; errors: { code: string; message: string }[] };

type AssignmentDeleteResult =
  | { ok: true }
  | { ok: false; errors: { code: string; message: string }[] };

/** What `all-set` shows, and what it would show if the user backed out of it. */
export type OnboardingSummary = {
  walletCount: number;
  budgetCount: number;
  lines: string[];
};

function generateId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type StoreState = {
  /** Current app state snapshot — synced from Engine on every mutation */
  appState: AppState;
  /** Reference to the Engine instance — set once on mount */
  engine: EngineAPI | null;
  /**
   * Whether the user finished `all-set`. Explicit, never derived.
   *
   * It used to be computed in `setEngine` as
   * `!!activePeriod && (assignments || transactions)`, which cannot express the
   * ADR-0002 flow: `quick-setup` is skippable, so onboarding completes with no
   * period and no assignments at all.
   */
  isOnboarded: boolean;
  /** Display name captured on `welcome`. Trimmed before it is stored. */
  userName: string;
  /**
   * Mirrors the keychain, not the source of truth for it.
   *
   * Only ever set after `SecureStore.setItemAsync` resolves. An optimistic flip
   * would strand a user on an `unlock` screen they cannot pass, because the
   * hash was never written. See `Edge_Cases.md` EC19.
   */
  pinSet: boolean;
  /**
   * The durable half of the lock: has the keychain entry been read yet, and is
   * a PIN stored?
   *
   * `null` means "not read yet" and gates the bootstrap render, because a
   * routing decision taken before the read is the decision to show onboarding
   * to someone who has a PIN. Lives in the store rather than in `_layout`
   * local state so `resetForNewUser` can invalidate it — a mount-only read
   * kept claiming a PIN was set after "Forgot PIN?" had deleted it, which
   * stranded the user on an unlock screen with no way past it.
   */
  keychainPinSet: boolean | null;
  /** Cleared on a cold launch, and re-earned by passing `unlock`. */
  isUnlocked: boolean;
  /** Written by `quick-setup`, read by `all-set`. */
  onboardingSummary: OnboardingSummary | null;
  /** Transient draft for the transaction entry form */
  draft: TransactionDraft;
  /**
   * Transient draft for the assignment sheet, shared by add and edit.
   *
   * It survives the sheet being dismissed and tab switches, and clears only on a
   * successful confirm or an app reset — so a half-typed budget is not lost when
   * the user glances at another tab.
   */
  assignmentDraft: AssignmentDraft;
  /** Which mode the assignment sheet is in. `closed` hides it. */
  assignmentSheetMode: AssignmentSheetMode;
  /** The row the sheet is editing, or null in add mode. */
  editingAssignmentId: string | null;
  /** Light/dark choice. Never defaults to `system`. */
  themePreference: ThemePreferenceValue;
};

type StoreActions = {
  /** Called once after Engine is initialized */
  setEngine: (engine: EngineAPI) => void;
  /** Sync store.appState from engine.getState() after a mutation */
  syncFromEngine: () => void;
  /** Complete the onboarding flow and show main tabs */
  completeOnboarding: () => void;
  setUserName: (name: string) => void;
  /** Call only after the keychain write resolves. */
  markPinSet: () => void;
  /** Re-read the keychain and update `keychainPinSet`. */
  refreshKeychainPin: () => Promise<void>;
  markUnlocked: () => void;
  setOnboardingSummary: (summary: OnboardingSummary) => void;
  /**
   * Wipe the store back to its first-launch shape.
   *
   * Backs "Forgot PIN? Reset app". The caller is also responsible for
   * `resetEngine()` from `useEngine()` — the engine and the store are separate
   * owners, and stale wallets left in the engine would make the next
   * `createWallet` return TIER_LIMIT_EXCEEDED against a wallet the user can no
   * longer see.
   *
   * `isOnboarded` is cleared too, so the bootstrap gate returns the user to
   * `welcome` rather than onto the empty Home they just reset.
   */
  resetForNewUser: () => void;
  /** Update a single field on the transaction draft */
  setDraftField: <K extends keyof TransactionDraft>(
    key: K,
    value: TransactionDraft[K],
  ) => void;
  /** Reset the draft to its initial state */
  clearDraft: () => void;
  /** Log a transaction from the current draft, sync engine, return result */
  logTransaction: () => TransactionResult;
  /** Update a single field on the assignment draft */
  setAssignmentDraftField: <K extends keyof AssignmentDraft>(
    key: K,
    value: AssignmentDraft[K],
  ) => void;
  /** Reset the assignment draft to its initial state */
  clearAssignmentDraft: () => void;
  /** Open the sheet in add mode. Keeps any draft; clears the edit id. */
  openAddAssignmentSheet: () => void;
  /** Open the sheet in edit mode, prefilled from the given row. */
  openEditAssignmentSheet: (id: string) => void;
  /** Close the sheet. Keeps the draft so it survives the dismissal. */
  closeAssignmentSheet: () => void;
  /** Pick a category in add mode; a duplicate row routes to edit instead. */
  selectAssignmentCategory: (categoryId: string) => void;
  /** Create the drafted assignment. Refuses without an active period. */
  addAssignment: () => AssignmentResult;
  /** Update the editing row's amount. Refuses without an active period. */
  updateAssignment: () => AssignmentResult;
  /** Delete the editing row. */
  deleteAssignment: () => AssignmentDeleteResult;
  /** Set the light/dark choice. Called from Settings. */
  setThemePreference: (preference: ThemePreferenceValue) => void;
};

const INITIAL_DRAFT: TransactionDraft = {
  type: "expense",
  amount: "",
  categoryId: null,
  walletId: null,
  note: "",
  date: new Date(),
};

const INITIAL_ASSIGNMENT_DRAFT: AssignmentDraft = {
  categoryId: null,
  walletId: null,
  amount: "",
};

/**
 * Cents to the bare decimal string the amount keypad edits, e.g. 50000 →
 * "500.00". The currency helpers stay out of the draft and apply at display and
 * submit only.
 */
function centsToDraftAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * The one row per (active period, category, wallet) rule, as a lookup. Used to
 * route a duplicate category pick to edit instead of creating a second row.
 */
function findDuplicateAssignment(
  appState: AppState,
  categoryId: string,
  walletId: string,
): Assignment | undefined {
  const periodId = appState.activePeriod?.id;
  if (!periodId) return undefined;
  return appState.assignments.find(
    (a) =>
      a.period_id === periodId &&
      a.category_id === categoryId &&
      a.wallet_id === walletId,
  );
}

const INITIAL_APP_STATE: AppState = {
  user: { id: "", tier: "free" },
  activePeriod: null,
  periods: [],
  wallets: [],
  categories: [],
  goals: [],
  assignments: [],
  transactions: [],
};

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  appState: INITIAL_APP_STATE,
  engine: null,
  isOnboarded: false,
  userName: "",
  pinSet: false,
  keychainPinSet: null,
  isUnlocked: false,
  onboardingSummary: null,
  draft: { ...INITIAL_DRAFT },
  assignmentDraft: { ...INITIAL_ASSIGNMENT_DRAFT },
  assignmentSheetMode: "closed",
  editingAssignmentId: null,
  themePreference: defaultThemePreference,

  setEngine: (engine) => {
    // `isOnboarded` is deliberately not touched here. It is set by
    // `completeOnboarding` and cleared by `resetForNewUser`, and nothing else.
    set({ engine, appState: engine.getState() });
  },

  syncFromEngine: () => {
    const { engine } = get();
    if (engine) {
      set({ appState: engine.getState() });
    }
  },

  completeOnboarding: () => {
    set({ isOnboarded: true });
  },

  setUserName: (name) => {
    set({ userName: name.trim() });
  },

  markPinSet: () => {
    set({ pinSet: true });
  },

  refreshKeychainPin: async () => {
    try {
      set({ keychainPinSet: await hasPin() });
    } catch (error: unknown) {
      console.error("[Store] Keychain read failed:", error);
      // Fail open, as the bootstrap did before this moved into the store. An
      // unreadable keychain is no reason to strand someone on a splash, and
      // refusing entry when no PIN is set locks out every first launch.
      set({ keychainPinSet: false });
    }
  },

  markUnlocked: () => {
    set({ isUnlocked: true });
  },

  setOnboardingSummary: (summary) => {
    set({ onboardingSummary: summary });
  },

  resetForNewUser: () => {
    set({
      appState: INITIAL_APP_STATE,
      isOnboarded: false,
      userName: "",
      isUnlocked: false,
      // The caller has just deleted the stored hash, so a stale `true` here
      // would keep demanding a PIN that no longer exists. `null` forces the
      // next bootstrap to read the keychain again.
      pinSet: false,
      keychainPinSet: null,
      onboardingSummary: null,
      draft: { ...INITIAL_DRAFT, date: new Date() },
      // A stale assignment draft must not survive "Forgot PIN? Reset app".
      assignmentDraft: { ...INITIAL_ASSIGNMENT_DRAFT },
      assignmentSheetMode: "closed",
      editingAssignmentId: null,
    });
  },

  setThemePreference: (preference) => {
    set({ themePreference: preference });
  },

  setDraftField: (key, value) => {
    set((state) => ({
      draft: { ...state.draft, [key]: value },
    }));
  },

  clearDraft: () => {
    set({ draft: { ...INITIAL_DRAFT, date: new Date() } });
  },

  logTransaction: () => {
    const { engine, draft, appState } = get();
    if (!engine) {
      return {
        ok: false,
        errors: [{ code: "INVALID_STATE", message: "Engine not initialized" }],
      };
    }

    const walletId = draft.walletId || appState.wallets[0]?.id;
    if (!walletId) {
      return {
        ok: false,
        errors: [{ code: "NOT_FOUND", message: "No wallet available" }],
      };
    }

    const amountCents = randToCents(draft.amount);
    if (amountCents <= 0) {
      return {
        ok: false,
        errors: [
          {
            code: "INVALID_STATE",
            message: "Amount must be greater than zero",
          },
        ],
      };
    }

    const tx: Transaction = {
      id: generateId(),
      amount: amountCents,
      type: draft.type,
      date: new Date(
        draft.date.getFullYear(),
        draft.date.getMonth(),
        draft.date.getDate(),
      ),
      category_id: draft.type === "expense" ? draft.categoryId : null,
      wallet_id: walletId,
      to_wallet_id: null,
      note: draft.note.trim() || null,
      created_at: new Date(),
    };

    const result = engine.recordTransaction(tx);

    if (result.ok) {
      get().syncFromEngine();
      get().clearDraft();
    }

    return result;
  },

  setAssignmentDraftField: (key, value) => {
    set((state) => ({
      assignmentDraft: { ...state.assignmentDraft, [key]: value },
    }));
  },

  clearAssignmentDraft: () => {
    set({ assignmentDraft: { ...INITIAL_ASSIGNMENT_DRAFT } });
  },

  openAddAssignmentSheet: () => {
    const { appState, assignmentDraft } = get();
    set({
      assignmentSheetMode: "add",
      editingAssignmentId: null,
      // Default the wallet to the first one; keep a wallet the user already
      // picked, since the draft survives a dismissal.
      assignmentDraft: {
        ...assignmentDraft,
        walletId: assignmentDraft.walletId ?? appState.wallets[0]?.id ?? null,
      },
    });
  },

  openEditAssignmentSheet: (id) => {
    const { appState } = get();
    const assignment = appState.assignments.find((a) => a.id === id);
    if (!assignment) return;
    set({
      assignmentSheetMode: "edit",
      editingAssignmentId: id,
      assignmentDraft: {
        categoryId: assignment.category_id,
        walletId: assignment.wallet_id,
        amount: centsToDraftAmount(assignment.amount),
      },
    });
  },

  closeAssignmentSheet: () => {
    set({ assignmentSheetMode: "closed" });
  },

  selectAssignmentCategory: (categoryId) => {
    const { assignmentSheetMode, assignmentDraft, appState } = get();

    if (assignmentSheetMode === "add") {
      const walletId =
        assignmentDraft.walletId ?? appState.wallets[0]?.id ?? null;
      const duplicate = walletId
        ? findDuplicateAssignment(appState, categoryId, walletId)
        : undefined;

      if (duplicate) {
        // One budget per category and wallet: route the pick to edit and drop
        // the half-typed add amount for the row's own.
        set({
          assignmentSheetMode: "edit",
          editingAssignmentId: duplicate.id,
          assignmentDraft: {
            categoryId: duplicate.category_id,
            walletId: duplicate.wallet_id,
            amount: centsToDraftAmount(duplicate.amount),
          },
        });
        return;
      }
    }

    set((state) => ({
      assignmentDraft: { ...state.assignmentDraft, categoryId },
    }));
  },

  addAssignment: () => {
    const { engine, appState, assignmentDraft } = get();
    if (!engine) {
      return {
        ok: false,
        errors: [{ code: "INVALID_STATE", message: "Engine not initialized" }],
      };
    }
    if (!appState.activePeriod) {
      return {
        ok: false,
        errors: [{ code: "INVALID_STATE", message: "No active period" }],
      };
    }
    if (!assignmentDraft.categoryId) {
      return {
        ok: false,
        errors: [{ code: "INVALID_STATE", message: "Pick a category" }],
      };
    }
    const walletId =
      assignmentDraft.walletId ?? appState.wallets[0]?.id ?? null;
    if (!walletId) {
      return {
        ok: false,
        errors: [{ code: "NOT_FOUND", message: "No wallet available" }],
      };
    }
    const amountCents = randToCents(assignmentDraft.amount || "0");
    if (amountCents <= 0) {
      return {
        ok: false,
        errors: [
          {
            code: "INVALID_STATE",
            message: "Amount must be greater than zero",
          },
        ],
      };
    }

    const assignment: Assignment = {
      id: generateId(),
      period_id: appState.activePeriod.id,
      category_id: assignmentDraft.categoryId,
      wallet_id: walletId,
      amount: amountCents,
      created_at: new Date(),
    };

    const result = engine.createAssignment(assignment);

    if (result.ok) {
      get().syncFromEngine();
      set({
        assignmentSheetMode: "closed",
        editingAssignmentId: null,
        assignmentDraft: { ...INITIAL_ASSIGNMENT_DRAFT },
      });
    }

    return result;
  },

  updateAssignment: () => {
    const { engine, appState, assignmentDraft, editingAssignmentId } = get();
    if (!engine) {
      return {
        ok: false,
        errors: [{ code: "INVALID_STATE", message: "Engine not initialized" }],
      };
    }
    if (!appState.activePeriod) {
      return {
        ok: false,
        errors: [{ code: "INVALID_STATE", message: "No active period" }],
      };
    }
    if (!editingAssignmentId) {
      return {
        ok: false,
        errors: [{ code: "INVALID_STATE", message: "No assignment selected" }],
      };
    }
    const amountCents = randToCents(assignmentDraft.amount || "0");
    if (amountCents <= 0) {
      return {
        ok: false,
        errors: [
          {
            code: "INVALID_STATE",
            message: "Amount must be greater than zero",
          },
        ],
      };
    }

    const result = engine.updateAssignment(editingAssignmentId, {
      amount: amountCents,
    });

    if (result.ok) {
      get().syncFromEngine();
      set({
        assignmentSheetMode: "closed",
        editingAssignmentId: null,
        assignmentDraft: { ...INITIAL_ASSIGNMENT_DRAFT },
      });
    }

    return result;
  },

  deleteAssignment: () => {
    const { engine, editingAssignmentId } = get();
    if (!engine) {
      return {
        ok: false,
        errors: [{ code: "INVALID_STATE", message: "Engine not initialized" }],
      };
    }
    if (!editingAssignmentId) {
      return {
        ok: false,
        errors: [{ code: "INVALID_STATE", message: "No assignment selected" }],
      };
    }

    const result = engine.deleteAssignment(editingAssignmentId);

    if (result.ok) {
      get().syncFromEngine();
      set({
        assignmentSheetMode: "closed",
        editingAssignmentId: null,
        assignmentDraft: { ...INITIAL_ASSIGNMENT_DRAFT },
      });
    }

    return result;
  },
}));
