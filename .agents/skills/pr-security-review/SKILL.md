---
name: pr-security-review
description: >-
  Autonomous PR Security Agent and Merge Request workflow for movie_sharing.
  Activate whenever the user wants to commit, push, open a Pull Request (Merge Request),
  review changes for security vulnerabilities, or merge code into main.
---

# Autonomous PR & Security Review Workflow

Follow this mandatory security-first lifecycle before creating or merging any Pull Request (Merge Request) in `mnkrave/movie_sharing`.

## 1. Branch Enforcement
- **Never commit or push directly to `main`.**
- Create a descriptive branch (`feat/<topic>`, `fix/<topic>`, `sec/<topic>`, or `chore/<topic>`) before committing changes.

## 2. Autonomous Security Agent Audit (Pre-PR / Pre-Merge)
Launch a dedicated security review subagent (using `define_subagent` + `invoke_subagent` with role `Security Review Agent`) or perform a strict line-by-line audit of `git diff origin/main...HEAD` against the following project-specific checklist:

### A. Authentication & Authorization (`next-auth` + Prisma)
1. **Session Verification:** Every mutating API route (`POST`, `PUT`, `PATCH`, `DELETE` in `app/api/**/route.ts`) or Server Action MUST verify the session via `getServerSession(authOptions)`.
2. **IDOR / Ownership Prevention:** Never trust `userId`, `ownerId`, or `role` passed from the request body/query. Always derive the acting user from `session.user` and verify resource ownership in Prisma queries (`where: { id, userId: session.user.id }` or explicit admin role checks `session.user.role === "ADMIN"`).
3. **Friend / Visibility Scoping:** When querying `Recommendation`, `CustomCollection`, or `MediaStatus`, ensure `PRIVATE` or targeted items cannot be read or modified by unauthorized users.

### B. Input Validation, Injection & XSS
1. **JSON Fields in Prisma:** The schema stores several JSON strings (`moviesJson`, `commentsJson`, `targetUserIds`, `subscriptions`, `friendGroups`). Always validate structure and enforce reasonable size/length limits before `JSON.stringify` or `JSON.parse`.
2. **XSS Prevention:** Never pass user-controlled strings (`comment`, `description`, `tagline`, `text`) into `dangerouslySetInnerHTML` or unvalidated `href`/`src` URLs (reject `javascript:` or `data:` URLs).
3. **Database & API Safety:** Never use raw unparameterized SQL (`$queryRawUnsafe`, `$executeRawUnsafe`). Keep `TMDB_API_KEY`, `NEXTAUTH_SECRET`, `RESEND_API_KEY`, and `DATABASE_URL` strictly server-side (never prefix secrets with `NEXT_PUBLIC_`).

### C. Build & Static Analysis Verification
Run locally before pushing:
```bash
npx prisma generate && npx tsc --noEmit
```

## 3. GitHub Pull Request Lifecycle (`gh`)
Use the project wrapper `./.agents/skills/pr-security-review/scripts/gh-authed.sh` (which automatically injects `GH_TOKEN` from the Git credential keychain):

1. Push the feature branch to `origin`:
   ```bash
   git push -u origin <branch-name>
   ```
2. Open the Pull Request via `./.agents/skills/pr-security-review/scripts/gh-authed.sh pr create` and include a **`## 🛡️ Security Agent Audit Report`** section in the PR body (or post it as a PR comment via `./.agents/skills/pr-security-review/scripts/gh-authed.sh pr comment`) summarizing:
   - Auth & IDOR checks
   - Input validation & XSS checks
   - Secrets & Environment exposure checks
   - TypeScript & Prisma verification status
3. Monitor GitHub Actions (`Security & Quality Gate` + Vercel Preview Deployment) via `./.agents/skills/pr-security-review/scripts/gh-authed.sh pr checks`.
4. Only merge once all findings are resolved and status checks pass.
