---
name: whats-new-release
description: >-
  Generate a user-facing "What's New" popup entry in lib/changelog.ts from the current PR/branch diff.
  Activate ONLY when the user explicitly asks to create a "What's New" popup, release popup, or changelog announcement for a PR or release.
---

# What's New Release Popup Workflow

Use this skill **only** when the user explicitly requests a "What's New" popup / user announcement for a PR or release. Do **not** generate entries automatically for internal fixes or unrequested PRs, and keep this step cleanly separated from `pr-security-review`.

## 1. Delegate or Follow `release-notes-writer.md`
Follow [release-notes-writer.md](../../agents/release-notes-writer.md) (or invoke a dedicated subagent using its instructions):
1. Inspect `git diff origin/main...HEAD` (focusing on `app/`, `components/`, and user-facing features).
2. Read [lib/changelog.ts](../../../lib/changelog.ts).
3. Prepend **one** new `ReleaseNote` object at the top of `RELEASES` in `lib/changelog.ts` (with a unique `YYYY-MM-DD-<slug>` `id`, friendly German `title`, and 2–5 short `highlights` without technical jargon).

## 2. Verify
Run TypeScript check to confirm `lib/changelog.ts` compiles cleanly:
```bash
npx tsc --noEmit
```

## 3. Present Draft to User
Show the generated `ReleaseNote` title, ID, and highlights to the user so they can review or adjust the copy before running `pr-security-review` / merging the PR.
