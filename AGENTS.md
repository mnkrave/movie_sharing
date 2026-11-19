# Repository Security & Pull Request Policy

This repository enforces a strict **Pull Request + Autonomous Security Agent Review** workflow:

1. **No Direct Pushes to `main`:** All code changes must be made on a feature/fix branch (`feat/*`, `fix/*`, `sec/*`, `chore/*`) and submitted via a GitHub Pull Request.
2. **Mandatory Security Agent Audit:** Whenever the user asks to commit, push, create a Merge/Pull Request, or review changes, activate the `pr-security-review` skill (`.agents/skills/pr-security-review/SKILL.md`).
3. **Automated Security Checks:** Every Pull Request must pass:
   - The local **Security Review Agent** audit (checking NextAuth session enforcement, IDOR/ownership in Prisma queries, XSS/injection, and secret exposure), documented directly in the PR description or as a PR comment.
   - The GitHub Actions **Security & Quality Gate** (`.github/workflows/security.yml`: CodeQL SAST, Gitleaks secret scanning, Dependency Review, and TypeScript check).
   - The **Vercel Preview Deployment** check.
