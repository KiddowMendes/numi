---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/03_Architecture/04_Offline_First_Strategy.md"
  - "docs/playbook/00_Foundation/02_Principles.md"
  - "docs/playbook/01_Domain/01_Entities.md"
decision_record: none
---

# 05 — Security

> NUMI handles money. Not bank passwords, not ID numbers — but the shape of a person's life. That deserves respect.

---

## Threat Model

| Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Device stolen | High | High | Local encryption, no cloud account required |
| App data extracted | Medium | High | SQLCipher or encrypted SQLite |
| Network interception (sync v2) | Medium | Medium | TLS 1.3, certificate pinning |
| Cloud breach | Low | High | Minimal data stored, no PII in domain |
| Shoulder surfing | High | Medium | Large fonts, no masking of "safe" data, biometric lock optional |
| Malicious backup restore | Low | Medium | Backup tied to device key, export is plaintext JSON (user's responsibility) |

---

## Data-at-Rest (v1)

**S1. The local SQLite database is encrypted.**

- Key: Derived from device hardware ID + user-defined PIN (optional) or biometric.
- Algorithm: AES-256-GCM via SQLCipher or expo-secure-store key wrapping.
- Fallback: If user declines PIN, database is still encrypted with a device-bound key (tamper-resistant, not theft-resistant).

**S2. No plaintext money amounts in logs or crash reports.**

- Crash reporters (if any) must strip transaction amounts, wallet balances, and category names.
- Stack traces only. No AppState snapshots.

**S3. Screenshots and screen recording.**

- Allow them. The user owns their screen. Do not block screenshots.
- Exception: If user enables "Privacy screen" in settings, blur app content in recent apps / multitasking view.

---

## Data-in-Transit (v2)

**S4. All sync traffic over TLS 1.3.**

- No unencrypted HTTP endpoints.
- Certificate pinning on mobile apps to prevent MITM on public WiFi.

**S5. Sync payload is encrypted before leaving device.**

- End-to-end encryption for transaction notes and wallet names.
- Cloud stores ciphertext only. Cannot read user data even if subpoenaed.

---

## Authentication (Freemium/Premium)

**S6. No password stored in domain.**

- Auth handled by Supabase Auth or similar. Passwordless magic links preferred.
- Domain only receives a JWT token with `user_id` and `tier`. No email, no password hash.

**S7. Token storage.**

- Mobile: expo-secure-store (Keychain/Keystore).
- Web: httpOnly, secure, sameSite=strict cookie. No localStorage tokens.

---

## The "No Surveillance" Security Model

**S8. No analytics SDKs with network access.**

- No Firebase Analytics, Mixpanel, Amplitude, or Segment.
- If analytics are needed for product decisions, use self-hosted Plausible or aggregate server logs only.

**S9. No advertising identifiers.**

- No GAID (Google Advertising ID), no IDFA (Apple Identifier for Advertisers).
- The app does not contain ad network SDKs.

**S10. No behavioral profiling.**

- Do not build "user segments" based on spending patterns.
- Do not sell or share data with credit bureaus, lenders, or insurers.

---

## Backup and Export

**S11. Free tier export is plaintext JSON.**

- User taps "Export my data" → JSON file written to Downloads.
- No encryption (user's responsibility). No cloud upload.
- Contains all entities: Wallets, Transactions, Categories, Goals, Assignments, Periods.

**S12. Freemium/Premium backup is encrypted.**

- Cloud backup encrypted with user's sync key.
- Restore requires same account + device authentication.

---

## Incident Response

**S13. If a vulnerability is discovered:**

1. Patch in next release.
2. ADR documenting the vulnerability and fix.
3. No user notification unless data was actually exposed (unlikely with offline-first model).

---

## What Happens After This Document

Security is not a one-time document. It is reviewed before every release. Next: `04_Design_System/` — the visual and interaction standards.

Next: docs/playbook/04_Design_System/01_Tokens.md
