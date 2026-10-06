# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata

- **Project Name:** numi
- **Date:** 2026-10-06
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

### Requirement: Onboarding & First-Run Setup

- **Description:** Guides a brand-new user through welcome, display name, PIN creation, quick setup (wallet/budget), and completion, while blocking premature or invalid completion.

#### Test TC003 Create and confirm a PIN during onboarding

- **Test Code:** [TC003_Create_and_confirm_a_PIN_during_onboarding.py](./TC003_Create_and_confirm_a_PIN_during_onboarding.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/f3211ed6-1c16-494a-88a2-4519b35aa9fe
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** PIN creation and confirmation completed successfully and onboarding advanced as expected.

---

#### Test TC007 Complete quick setup with wallet and budget

- **Test Code:** [TC007_Complete_quick_setup_with_wallet_and_budget.py](./TC007_Complete_quick_setup_with_wallet_and_budget.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/e223e9cc-456c-46ab-92d9-58ed0a67c92a
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Quick setup with a wallet and budget completes and moves the user forward in onboarding.

---

#### Test TC009 Create onboarding display name and continue

- **Test Code:** [TC009_Create_onboarding_display_name_and_continue.py](./TC009_Create_onboarding_display_name_and_continue.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/e36a42f4-d11f-46eb-8045-8e54be3ad3f0
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** The welcome screen accepts a display name and continues the onboarding flow.

---

#### Test TC010 Complete onboarding and enter the app

- **Test Code:** [TC010_Complete_onboarding_and_enter_the_app.py](./TC010_Complete_onboarding_and_enter_the_app.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/6d169b94-a0f4-445f-8404-1990bcb3a405
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Full onboarding completes end-to-end and the user lands inside the app.

---

#### Test TC013 Handle a mismatched PIN confirmation

- **Test Code:** [TC013_Handle_a_mismatched_PIN_confirmation.py](./TC013_Handle_a_mismatched_PIN_confirmation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/3ad64da5-67b9-4a3b-a38d-a3cd10318c3e
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** A mismatched PIN confirmation is handled without crashing and the user can retry.

---

#### Test TC014 Skip quick setup and continue onboarding

- **Test Code:** [TC014_Skip_quick_setup_and_continue_onboarding.py](./TC014_Skip_quick_setup_and_continue_onboarding.py)
- **Test Error:** TEST BLOCKED — /quick-setup rendered a blank page with 0 interactive elements; no Skip button present.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/df2d186c-4e38-42ec-a099-8ee6f849ea5d
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** Direct navigation to /quick-setup did not render the SPA (likely because onboarding state was missing in that session, or the route silently fails to render). Test could not be exercised; re-run with full onboarding from /welcome.

---

#### Test TC018 Reject an empty onboarding display name

- **Test Code:** [TC018_Reject_an_empty_onboarding_display_name.py](./TC018_Reject_an_empty_onboarding_display_name.py)
- **Test Error:** TEST BLOCKED — /welcome rendered blank with 0 interactive elements.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/fbf5c578-3608-4caf-a788-e1497ac377cb
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** The welcome screen failed to render in this session, so empty-name validation could not be verified. Intermittent blank renders were observed across several cases in this run.

---

#### Test TC019 Prevent entering the app before onboarding is complete

- **Test Code:** [TC019_Prevent_entering_the_app_before_onboarding_is_complete.py](./TC019_Prevent_entering_the_app_before_onboarding_is_complete.py)
- **Test Error:** TEST FAILURE — /all-set was reachable directly and showed "You're in." with "0 wallets · 0 budgets ready." instead of redirecting to incomplete setup.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/65e1935f-ec3a-4112-8083-660e781c3c28
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The final onboarding route does not guard against incomplete onboarding state — it can be opened directly (deep-link) and presents a completed state even with 0 wallets/budgets. Consider route guards that redirect to the first incomplete step.

---

#### Test TC021 Reject invalid quick setup budget data

- **Test Code:** [TC021_Reject_invalid_quick_setup_budget_data.py](./TC021_Reject_invalid_quick_setup_budget_data.py)
- **Test Error:** TEST FAILURE — submitting Quick Setup with R 0 balance and R 0 budgets proceeded to All-set with no validation error.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/8d21a2ff-30fe-4338-a143-d4b86d227217
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** Quick Setup allows an all-zero/empty budget to be submitted ("I'm done" succeeds). If v1 intends this to be skippable, the test expectation should be relaxed; otherwise add validation with an inline error.

---

#### Test TC025 Stay on the final onboarding step when completion is inconsistent

- **Test Code:** [TC025_Stay_on_the_final_onboarding_step_when_completion_is_inconsistent.py](./TC025_Stay_on_the_final_onboarding_step_when_completion_is_inconsistent.py)
- **Test Error:** TEST FAILURE — clicking "Open NUMI" navigated to Home ("No wallet yet") with no error and no remaining onboarding step.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/0e666ba1-5b00-4296-babd-e573cc157c6e
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** With incomplete setup state the app proceeds to Home instead of showing an error or holding the user on the final step. Product decision needed: either guard this transition or update the expectation to allow entering Home in a degraded state.

---

### Requirement: App Lock & PIN Security

- **Description:** Lock screen on launch, PIN unlock, and lockout after repeated failed attempts.

#### Test TC002 Unlock the app with a valid PIN

- **Test Code:** [TC002_Unlock_the_app_with_a_valid_PIN.py](./TC002_Unlock_the_app_with_a_valid_PIN.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/0ba05687-5b5b-4752-8249-355c91f9384e
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Entering the correct PIN unlocks the app and reveals the home screen.

---

#### Test TC004 Continue into the app when keychain read is unreadable

- **Test Code:** [TC004_Continue_into_the_app_when_keychain_read_is_unreadable.py](./TC004_Continue_into_the_app_when_keychain_read_is_unreadable.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/6cdb2a19-3967-441c-a708-ec0a9ec7ef33
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** The app recovers gracefully when PIN/keychain state cannot be read, rather than trapping the user.

---

#### Test TC006 Lock the PIN pad after repeated wrong attempts

- **Test Code:** [TC006_Lock_the_PIN_pad_after_repeated_wrong_attempts.py](./TC006_Lock_the_PIN_pad_after_repeated_wrong_attempts.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/38262c1a-50e0-4333-bb84-fb58fbfe2938
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Repeated incorrect PIN entries lock the pad as designed.

---

### Requirement: Home Dashboard & Safe-to-Spend

- **Description:** Home shows balance/safe-to-spend summary, with correct fallback when no budget period exists.

#### Test TC008 Show the home dashboard with safe-to-spend and balance summary

- **Test Code:** [TC008_Show_the_home_dashboard_with_safe_to_spend_and_balance_summary.py](./TC008_Show_the_home_dashboard_with_safe_to_spend_and_balance_summary.py)
- **Test Error:** TEST FAILURE — safe-to-spend hero present, but no total balance / numeric currency amount rendered anywhere on Home.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/1ce06629-2823-4e65-a92a-be0a73a64b41
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The balance summary is missing from the Home screen (only the safe-to-spend empty-state copy renders, no $/£/€ figure). Either the balance widget is not implemented for the fresh/empty state, or it only renders once a wallet exists — confirm intended behavior and fix or adjust the expectation.

---

#### Test TC022 Show an unusable safe-to-spend state when no active budget period exists

- **Test Code:** [TC022_Show_an_unusable_safe_to_spend_state_when_no_active_budget_period_exists.py](./TC022_Show_an_unusable_safe_to_spend_state_when_no_active_budget_period_exists.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/76203b0e-1311-4673-aa53-1e6edc9dbb27
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** With no active budget period, Home shows the correct explanatory empty state instead of a misleading figure.

---

### Requirement: Transaction Entry & History

- **Description:** Log income/expense from Home, validation of amount/category, immediate reflection in history sorted newest-first.

#### Test TC001 Log an expense from home and see it reflected immediately

- **Test Code:** [TC001_Log_an_expense_from_home_and_see_it_reflected_immediately.py](./TC001_Log_an_expense_from_home_and_see_it_reflected_immediately.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/39d39451-ead9-438e-bd58-b240e24779c0
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** An expense logged from Home appears immediately in the app state without a reload.

---

#### Test TC005 Log income from home without choosing a category

- **Test Code:** [TC005_Log_income_from_home_without_choosing_a_category.py](./TC005_Log_income_from_home_without_choosing_a_category.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/de13955d-466f-4cbe-afa2-0151e7fcf520
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Income can be logged without a category, as intended.

---

#### Test TC011 Open transaction entry from the home screen

- **Test Code:** [TC011_Open_transaction_entry_from_the_home_screen.py](./TC011_Open_transaction_entry_from_the_home_screen.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/722a02e3-2629-4696-b4a2-8132ad545e08
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Transaction entry opens from the Home screen as expected.

---

#### Test TC012 Show a newly created transaction immediately in history

- **Test Code:** [TC012_Show_a_newly_created_transaction_immediately_in_history.py](./TC012_Show_a_newly_created_transaction_immediately_in_history.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/104725ff-dad0-4b9e-86da-07fb7ff56b66
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** New transactions show up in History immediately after creation.

---

#### Test TC015 Prevent double submission while a transaction is being processed

- **Test Code:** [TC015_Prevent_double_submission_while_a_transaction_is_being_processed.py](./TC015_Prevent_double_submission_while_a_transaction_is_being_processed.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/dac8dd8f-a8e7-451b-9755-5441dbe77ea0
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Rapid repeated submission does not create duplicate transactions.

---

#### Test TC017 Inspect the transaction ledger in newest-first order

- **Test Code:** [TC017_Inspect_the_transaction_ledger_in_newest_first_order.py](./TC017_Inspect_the_transaction_ledger_in_newest_first_order.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/1142ea3a-067a-4def-92da-656046865eaf
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** History lists transactions newest-first.

---

#### Test TC020 Block zero or negative transaction amounts

- **Test Code:** [TC020_Block_zero_or_negative_transaction_amounts.py](./TC020_Block_zero_or_negative_transaction_amounts.py)
- **Test Error:** TEST BLOCKED — stuck on 'Confirm your PIN' (3/4 dots); home/transaction UI unreachable.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/944d7807-0697-4cb7-bfdf-a5f8f03c9fc2
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** Onboarding PIN confirmation intermittently accepted only 3 of 4 digits, blocking access to the transaction UI. This same flake blocked TC016, TC024, TC028 and TC029 — see Key Gaps.

---

#### Test TC023 Block an expense when no category is selected

- **Test Code:** [TC023_Block_an_expense_when_no_category_is_selected.py](./TC023_Block_an_expense_when_no_category_is_selected.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/df79ad31-b4e6-4256-93cc-1a1563deda3f
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Expenses cannot be submitted without selecting a category.

---

#### Test TC026 Show guidance when no categories are available

- **Test Code:** [TC026_Show_guidance_when_no_categories_are_available.py](./TC026_Show_guidance_when_no_categories_are_available.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/4367990a-04f7-4e23-a0d0-587201c18e62
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** When no categories exist the UI shows helpful guidance instead of an empty picker.

---

### Requirement: Plan, Review & Settings

- **Description:** Plan assignments, review summary/fallback, and Settings surface.

#### Test TC016 View the current plan assignments

- **Test Code:** [TC016_View_the_current_plan_assignments.py](./TC016_View_the_current_plan_assignments.py)
- **Test Error:** TEST BLOCKED — PIN confirmation repeatedly registered only 3 of 4 digits; Plan screen unreachable.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/cd228c74-96ca-4403-8017-a6a29b9122f8
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** Blocked by the onboarding PIN flake, not by Plan itself. Re-run after the PIN issue is addressed.

---

#### Test TC024 View the review summary

- **Test Code:** [TC024_View_the_review_summary.py](./TC024_View_the_review_summary.py)
- **Test Error:** TEST BLOCKED — stuck on 'Confirm your PIN' (Step 2 of 4); review screen unreachable.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/258a066c-86c3-43c9-ab04-670d75307e36
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** Blocked by the onboarding PIN flake.

---

#### Test TC027 View the settings surface

- **Test Code:** [TC027_View_the_settings_surface.py](./TC027_View_the_settings_surface.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/5f929709-40ae-4695-9235-c20669d6a578
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** The Settings surface opens and renders as expected.

---

#### Test TC028 Show a fallback state when no active period exists

- **Test Code:** [TC028_Show_a_fallback_state_when_no_active_period_exists.py](./TC028_Show_a_fallback_state_when_no_active_period_exists.py)
- **Test Error:** TEST BLOCKED — 'Confirm your PIN' never advanced (tried PINs 1234 and 2580, Go back, repeated entries).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/cd7edd7b-387d-40a6-9294-82fff7b638d5
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** Blocked by the onboarding PIN flake.

---

#### Test TC029 See review fallback content when data is unavailable

- **Test Code:** [TC029_See_review_fallback_content_when_data_is_unavailable.py](./TC029_See_review_fallback_content_when_data_is_unavailable.py)
- **Test Error:** TEST BLOCKED — /review redirected to onboarding welcome; PIN confirmation stuck at 3/4 digits.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/6ca21a41-ccee-4ba4-ae70-d896c4812287
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** Route guard correctly bounced an un-onboarded session to /welcome, but onboarding itself could not be completed, so the review fallback could not be reached.

---

#### Test TC030 Open settings without changing product behavior

- **Test Code:** [TC030_Open_settings_without_changing_product_behavior.py](./TC030_Open_settings_without_changing_product_behavior.py)
- **Test Error:** TEST BLOCKED — SPA rendered blank (0 interactive elements) on /welcome and /settings.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/11b61f05-2d3f-5e6c-8692-797878adf257/test/b653653c-3231-4f8e-ba27-4a93869bb72f
- **Status:** BLOCKED
- **Severity:** MEDIUM
- **Analysis / Findings:** Blank SPA render in this session — same intermittent render issue seen in TC014 and TC018. TC027 passed for the same surface, so this is environmental/timing rather than a Settings defect.

---

## 3️⃣ Coverage & Matching Metrics

- **60.00%** of tests passed (18/30)

| Requirement                    | Total Tests | ✅ Passed | ❌ Failed | ⛔ Blocked |
| ------------------------------ | ----------- | --------- | --------- | ---------- |
| Onboarding & First-Run Setup   | 10          | 5         | 3         | 2          |
| App Lock & PIN Security        | 3           | 3         | 0         | 0          |
| Home Dashboard & Safe-to-Spend | 2           | 1         | 1         | 0          |
| Transaction Entry & History    | 9           | 8         | 0         | 1          |
| Plan, Review & Settings        | 6           | 1         | 0         | 5          |
| **Total**                      | **30**      | **18**    | **4**     | **8**      |

---

## 4️⃣ Key Gaps / Risks

> 60% of tests passed (18/30): 4 failed, 8 blocked.

**Real product issues (fix these):**

1. **Home balance summary missing (TC008, HIGH)** — safe-to-spend hero renders but no balance/currency figure appears anywhere on Home.
2. **Onboarding route guards missing (TC019, HIGH)** — `/all-set` is directly reachable and shows a completed state with 0 wallets/0 budgets instead of redirecting to incomplete setup.
3. **Quick Setup accepts empty budgets (TC021, MEDIUM)** — submitting all-zero values proceeds with no validation. Decide: validate, or update the expected behavior to allow skipping.
4. **Inconsistent completion state (TC025, MEDIUM)** — "Open NUMI" enters Home in a degraded state ("No wallet yet") with no error instead of holding on the final onboarding step.

**Test-infrastructure risks (blocked runs — re-test before trusting results):** 5. **Onboarding PIN confirmation flake (5 blocked tests: TC016, TC020, TC024, TC028, TC029)** — the 'Confirm your PIN' step repeatedly registered only 3 of 4 digits despite many attempts across multiple PIN values. High suspicion of a real input-handling bug (e.g., rapid keypad taps being dropped) rather than pure test flake; worth reproducing manually. 6. **Intermittent blank SPA render (3 blocked tests: TC014, TC018, TC030)** — `/welcome`, `/quick-setup`, and `/settings` sometimes loaded with 0 interactive elements (white viewport). Likely a static-export hydration/timing issue; consider adding a render-detection wait or investigating console errors on cold load. 7. **Coverage gap** — Plan/Review is effectively unverified (5 of 6 blocked); only Settings (TC027) passed in that group. Re-run those cases after items 5–6 are resolved.

---
