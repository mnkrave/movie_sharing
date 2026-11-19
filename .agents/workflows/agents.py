# Antigravity Dynamic Workflow (`run_workflow`): Dual-Agent Review & Auto-Refactor Loop
#
# Runs Agent 1 (Efficiency & Anti-Bloat Reviewer) and Agent 2 (Security & Auth Auditor)
# in parallel on the current git changes. If either agent finds bloat, duplicated logic,
# missed existing helpers, or security issues, an Automated Refactor Agent applies the
# fixes and re-runs the review loop (up to max_rounds) before returning the final
# combined PR Markdown report.

max_rounds = int(args.get("max_rounds", 2)) if isinstance(args, dict) else 2
base_ref = (args.get("base_ref", "origin/main") if isinstance(args, dict) else "origin/main")

EFFICIENCY_SCHEMA = {
    "type": "object",
    "properties": {
        "verdict": {
            "type": "string",
            "enum": ["APPROVED", "NEEDS_REFACTOR"],
            "description": "APPROVED if concise, DRY, and idiomatic; NEEDS_REFACTOR if bloat or duplication exists.",
        },
        "bloat_score": {
            "type": "integer",
            "description": "1 (ultra-lean) to 10 (severe bloat/duplication). Target is <= 3.",
        },
        "reused_existing_functions": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Existing project functions/patterns properly reused.",
        },
        "missed_existing_functions": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Existing functions in lib/store.ts, lib/tmdb.ts, or components/ that should have been used instead of new duplicate code.",
        },
        "refactor_instructions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "file": {"type": "string"},
                    "issue": {"type": "string"},
                    "how_to_simplify": {"type": "string"},
                    "estimated_lines_saved": {"type": "integer"},
                },
                "required": ["file", "issue", "how_to_simplify"],
            },
        },
        "summary_markdown": {
            "type": "string",
            "description": "Concise German Markdown summary for the PR report under '## ⚡ Code Efficiency & Anti-Bloat Report'.",
        },
    },
    "required": [
        "verdict",
        "bloat_score",
        "missed_existing_functions",
        "refactor_instructions",
        "summary_markdown",
    ],
}

SECURITY_SCHEMA = {
    "type": "object",
    "properties": {
        "verdict": {
            "type": "string",
            "enum": ["APPROVED", "NEEDS_FIX"],
            "description": "APPROVED if all security checks pass; NEEDS_FIX if any vulnerability or missing check exists.",
        },
        "security_findings": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "file": {"type": "string"},
                    "severity": {"type": "string", "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"]},
                    "issue": {"type": "string"},
                    "required_fix": {"type": "string"},
                },
                "required": ["file", "severity", "issue", "required_fix"],
            },
        },
        "summary_markdown": {
            "type": "string",
            "description": "Concise German Markdown summary for the PR report under '## 🛡️ Security Agent Audit Report'.",
        },
    },
    "required": ["verdict", "security_findings", "summary_markdown"],
}

REFACTOR_SCHEMA = {
    "type": "object",
    "properties": {
        "applied_changes": {
            "type": "array",
            "items": {"type": "string"},
        },
        "lines_removed_or_simplified": {"type": "integer"},
        "typecheck_passed": {"type": "boolean"},
    },
    "required": ["applied_changes", "typecheck_passed"],
}

eff_result = None
sec_result = None
refactor_history = []

for round_num in range(1, max_rounds + 1):
    phase(f"Round {round_num}: Parallel Efficiency & Security Review")
    log(f"Starting parallel review round {round_num}/{max_rounds} against {base_ref}...")

    eff_prompt = f"""Read `.agents/agents/efficiency-reviewer.md` and follow its checklist strictly.
Inspect the current changes in the workspace (`git status -s`, `git diff {base_ref}` and any untracked files).
Also check existing helpers in `lib/store.ts`, `lib/tmdb.ts`, and `components/` to see if the new code duplicates existing logic, fails to reuse existing functions, or generates unnecessary bloat.
Return your structured review in German matching the schema."""

    sec_prompt = f"""Read `.agents/agents/security-reviewer.md` and follow its checklist strictly.
Inspect the current changes in the workspace (`git status -s`, `git diff {base_ref}` and any untracked files).
Check NextAuth session enforcement, Prisma IDOR/ownership checks, visibility scoping (`PRIVATE`/`FRIENDS`/`PUBLIC`), input length/type bounds, XSS/injection safety, and secrets exposure.
Return your structured security review in German matching the schema."""

    tasks = [
        ("efficiency", "Agent 1: Efficiency & Anti-Bloat Reviewer", eff_prompt, EFFICIENCY_SCHEMA),
        ("security", "Agent 2: Security & Auth Auditor", sec_prompt, SECURITY_SCHEMA),
    ]

    results = await parallel(
        tasks,
        lambda t: agent(
            t[2],
            schema=t[3],
            role=t[1],
        ),
    )

    eff_result, sec_result = results[0], results[1]
    log(
        f"Round {round_num} verdicts -> Efficiency: {eff_result['verdict']} (Bloat Score: {eff_result['bloat_score']}/10) | Security: {sec_result['verdict']}"
    )

    needs_efficiency_refactor = eff_result["verdict"] == "NEEDS_REFACTOR" and len(eff_result["refactor_instructions"]) > 0
    needs_security_fix = sec_result["verdict"] == "NEEDS_FIX" and len(sec_result["security_findings"]) > 0

    if not needs_efficiency_refactor and not needs_security_fix:
        log(f"Both agents APPROVED in round {round_num}!")
        break

    if round_num == max_rounds:
        log("Reached maximum review rounds. Returning remaining findings in final report.")
        break

    phase(f"Round {round_num}: Autonomous Code Refactoring & Cleanup")
    log("Invoking Coding/Refactor Agent to eliminate bloat, reuse existing functions, and fix security findings...")

    refactor_prompt = f"""You are the Autonomous Refactor & Fix Agent for `movie_sharing`.
The two review agents analyzed the current changes and requested the following improvements before we open/update the Pull Request:

1. Efficiency & Anti-Bloat Instructions:
- Missed existing functions to reuse: {eff_result['missed_existing_functions']}
- Specific refactoring tasks: {eff_result['refactor_instructions']}

2. Security & Auth Fixes:
- Security findings to fix: {sec_result['security_findings']}

Apply all required fixes and simplifications directly to the files in the workspace:
- Eliminate duplicate code and wire up existing helpers where listed.
- Simplify verbose blocks while keeping exact feature behavior intact.
- Fix any listed security/ownership issues.
- Run `npx prisma generate && npx tsc --noEmit` to verify everything compiles cleanly.
Return your summary matching the schema."""

    fix_res = await agent(
        refactor_prompt,
        schema=REFACTOR_SCHEMA,
        role=f"Auto-Refactor Agent (Round {round_num})",
    )
    refactor_history.append(fix_res)
    log(f"Auto-Refactor completed: {fix_res['applied_changes']} (Typecheck passed: {fix_res['typecheck_passed']})")

phase("Final Combined PR Audit Report")
final_report = f"""{eff_result['summary_markdown']}

---

{sec_result['summary_markdown']}
"""

if refactor_history:
    applied_bullets = "\n".join(
        f"- **Runde {idx + 1}:** " + ", ".join(r.get("applied_changes", []))
        for idx, r in enumerate(refactor_history)
    )
    final_report += f"\n---\n\n### 🔄 Automatisch durchgeführte Refactorings (`agents.py`)\n{applied_bullets}\n"

print(final_report)
