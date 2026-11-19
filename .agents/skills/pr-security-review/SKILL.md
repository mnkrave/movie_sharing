---
name: pr-security-review
description: >-
  Autonomous Dual-Agent PR Review (Code Efficiency/Anti-Bloat + Security Auditor) and Merge Request workflow for movie_sharing.
  Activate whenever the user wants to commit, push, open a Pull Request (Merge Request),
  review changes for code bloat/duplication or security vulnerabilities, or merge code into main.
---

# Autonomous Dual-Agent PR & Anti-Bloat Security Workflow (`agents.py`)

Follow this mandatory lifecycle before creating or merging any Pull Request (Merge Request) in `mnkrave/movie_sharing`.

## 1. Branch Enforcement
- **Never commit or push directly to `main`.**
- Always create a descriptive branch (`feat/<topic>`, `fix/<topic>`, `sec/<topic>`, or `chore/<topic>`) before committing changes.

## 2. Run the Dual-Agent Orchestrator (`agents.py`) via `run_workflow`
Before opening or updating a Pull Request, execute the multi-agent review & auto-refactor workflow:

```python
run_workflow(
    ScriptPath="/Users/lukasreinle/Coding/Movie_sharing/.agents/workflows/agents.py",
    Description="Run parallel Efficiency/Anti-Bloat & Security Review loop",
    Args={"max_rounds": 2, "base_ref": "origin/main"}
)
```

### What `agents.py` does automatically:
1. **Parallel Dual-Agent Inspection:**
   - **Agent 1 ([efficiency-reviewer.md](../../agents/efficiency-reviewer.md)):** Checks the diff against `lib/store.ts`, `lib/tmdb.ts`, and `components/` for duplicate logic, missed reuse of existing helper functions, over-engineering, and code bloat. Assigns a `bloat_score` (1–10).
   - **Agent 2 ([security-reviewer.md](../../agents/security-reviewer.md)):** Audits NextAuth session enforcement (`getServerSession`), Prisma resource ownership/IDOR protection, visibility scoping (`PRIVATE`/`FRIENDS`/`PUBLIC`), input length bounds, XSS, and secrets exposure.
2. **Closed-Loop Auto-Refactoring:**
   - If either agent returns `NEEDS_REFACTOR` or `NEEDS_FIX`, `agents.py` automatically invokes an **Auto-Refactor Agent** with the exact instructions, simplifies the code / reuses existing functions / fixes security gaps, verifies `npx prisma generate && npx tsc --noEmit`, and re-runs both reviewers!
3. **Combined PR Report Generation:**
   - Outputs both the **`## ⚡ Code Efficiency & Anti-Bloat Report`** and the **`## 🛡️ Security Agent Audit Report`** (plus any auto-refactoring history).

## 3. GitHub Pull Request Lifecycle (`gh-authed.sh`)
Use `./.agents/skills/pr-security-review/scripts/gh-authed.sh` (which loads `GH_TOKEN` at runtime from the macOS Git credential keychain):

1. Verify build & types locally:
   ```bash
   npx prisma generate && npx tsc --noEmit
   ```
2. Push the feature branch to `origin`:
   ```bash
   git push -u origin <branch-name>
   ```
3. Open (or update) the Pull Request via `./.agents/skills/pr-security-review/scripts/gh-authed.sh pr create` and embed the complete output from `agents.py` (`⚡ Code Efficiency & Anti-Bloat Report` + `🛡️ Security Agent Audit Report`) in the PR description.
4. Wait for all 5 required GitHub & Vercel status checks (`CodeQL SAST Analysis`, `Secret Scanning (Gitleaks)`, `Dependency Vulnerability Review`, `TypeScript & Security Audit`, and `Vercel`) via `./.agents/skills/pr-security-review/scripts/gh-authed.sh pr checks` before merging.
