# Repository Security, Anti-Bloat & Pull Request Policy

This repository enforces a strict **Pull Request + Autonomous Dual-Agent Review (`agents.py`)** workflow:

1. **No Direct Pushes to `main`:** All code changes must be made on a feature/fix branch (`feat/*`, `fix/*`, `sec/*`, `chore/*`) and submitted via a GitHub Pull Request.
2. **Mandatory Dual-Agent Audit (`agents.py`):** Whenever the user asks to commit, push, create a Merge/Pull Request, or review changes, activate the `pr-security-review` skill (`.agents/skills/pr-security-review/SKILL.md`) and run `.agents/workflows/agents.py` via `run_workflow`:
   - **Agent 1 (`efficiency-reviewer.md`):** Eliminates AI code bloat, enforces DRY reuse of existing helpers in `lib/store.ts`, `lib/tmdb.ts`, and `components/`, and triggers automatic refactoring if code is overly verbose or duplicated.
   - **Agent 2 (`security-reviewer.md`):** Audits NextAuth session enforcement, resource ownership in Prisma queries, visibility scoping, XSS/injection, and secret exposure.
3. **Automated GitHub & Vercel Quality Gates:** Every Pull Request must include both agent reports in its description and pass all 5 required branch protection checks (`CodeQL SAST Analysis`, `Secret Scanning (Gitleaks)`, `Dependency Vulnerability Review`, `TypeScript & Security Audit`, and `Vercel`).
