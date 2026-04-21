@AGENTS.md

# CLAUDE.md — How to Work on This Project

> This file governs how any AI assistant (Claude or otherwise) must think, communicate, and act when working on the Afrinia codebase. These rules are non-negotiable and apply to every task, every file, every decision.

---

## 1. WHO YOU ARE WORKING WITH

The person directing this project:
- Thinks in **systems and logic**, not in code syntax. He understands cause and effect, architecture, flows, and consequences — but is not a programmer.
- Cares deeply about **why** something is done, not just what is done.
- Will not accept vague answers, surface-level fixes, or "it works for now" solutions.
- Expects every decision to be **justified**, every trade-off to be **named**, and every risk to be **surfaced** before it becomes a problem.
- Operates with a **long-term builder mindset**: he is building something that will scale to thousands of users. Every decision today shapes what is possible in Phase 3, 4, and 5.

---

## 2. HOW TO THINK BEFORE ACTING

Before writing a single line of code or making any change, you must answer these three questions internally:

**WHAT** — What exactly is the problem? Not the symptom. The root cause.
**WHY** — Why does this problem exist? What created it? What will happen if it is not fixed?
**HOW** — How will the solution fix the root cause without creating new problems?

If you cannot answer all three clearly, you are not ready to act. Investigate further.

**The rule:** Diagnose before you prescribe. A doctor who writes a prescription without reading the test results is dangerous. Be the careful doctor, not the rushed one.

---

## 3. HOW TO COMMUNICATE

Plain English, always. No jargon without an explanation. When a technical term is necessary, explain it in one sentence using an analogy or plain language.

**Structure every explanation as:**
1. What is happening right now (the current state)
2. What is wrong with it and why it matters (the problem)
3. What the fix does and how it solves the root cause (the solution)
4. What risks or side effects the fix introduces (the trade-offs)

Never say "I fixed it." Say what was broken, what you changed, and what the user should now observe differently.

---

## 4. CODE QUALITY STANDARDS (NON-NEGOTIABLE)

### Security First
- Never expose API keys, secrets, or credentials in code. Use environment variables.
- All user inputs are validated before touching any database or external service.
- No `dangerouslySetInnerHTML` without sanitization.
- Firestore security rules must match the code. If code allows an operation, the rules must too. If the rules block it, the code must respect that.
- Never trust the client. Always validate on the server side or in Firestore rules.

### No Shortcuts
- No `// TODO: fix this later` in committed code.
- No hardcoded values that belong in config or environment variables.
- No commented-out blocks of old code left in production files.
- No `any` type in TypeScript unless absolutely unavoidable and explicitly justified in a comment.

### No Duplication
- If the same logic appears in two places, extract it. Name it clearly. Import it both places.
- Design tokens (colors, fonts, spacing) live in one place and are referenced everywhere. They are never re-typed in a component.
- Translation strings live in `en.json` and `fr.json`. They are never hardcoded in a component.

### Documentation
- Every function that is non-obvious gets a one-line comment explaining **why** it exists, not what it does (the code already shows what it does).
- Every file that is not self-explanatory gets a three-line header: what it is, why it exists, and what it connects to.
- Complex flows (auth, analytics, data fetching) get an inline comment at the entry point explaining the full sequence.

### Long-Term Resolution Over Symptomatic Fixes
- If a bug is caused by a wrong assumption in the architecture, fix the assumption — do not patch around it.
- If a workaround is unavoidable, it must be marked with `// TEMP:` and a clear explanation of what the real fix requires.
- Every change must leave the codebase in a **better state** than before. Not just "working" — better.

---

## 5. PRODUCTION-READY STANDARDS

Every change made to this codebase is treated as if it is going live to real users in the next 30 minutes.

**This means:**
- All new code is tested locally before being committed. Verify the feature works end-to-end.
- No changes to routing, security rules, or data models without checking what breaks downstream.
- Environment variables are verified to exist before deployment (not assumed).
- Loading states exist for every async operation. Empty states exist for every list or data fetch.
- Error states are handled. If a Firebase call fails, the UI shows something useful — not a blank screen or a JavaScript error.
- The site works with slow connections and on mobile. No layout breaking at 375px width.

**Testing checklist before any commit:**
- [ ] The feature works on localhost (dev server running)
- [ ] The feature works in both English and French
- [ ] The feature does not break any existing page or route
- [ ] No console errors in the browser
- [ ] Firestore security rules allow the new operations
- [ ] All new strings have EN and FR translations

---

## 6. BRANCH AND COMMIT DISCIPLINE

- Feature branches are named descriptively: `feature/ga4-spa-tracking`, `fix/sitemap-domain`, etc.
- Commits are small and focused. One logical change per commit.
- Commit messages follow the pattern: `type: plain-English description of what changed and why`
  - Types: `feat`, `fix`, `refactor`, `docs`, `chore`
  - Example: `feat: add GA4 route-change tracking so article page views are recorded in Analytics`
- Never commit directly to `main`. Always work on a branch and merge.

---

## 7. WHAT TO DO WHEN UNCERTAIN

If you are uncertain about the right approach:
1. Say so explicitly. Do not guess and hide it.
2. Present two or three options with their trade-offs clearly named.
3. Recommend one option and explain why.
4. Wait for confirmation before proceeding.

Uncertainty acknowledged is a strength. Uncertainty hidden is a bug waiting to happen.

---

## 8. CURRENT PROJECT PHASE

Afrinia is in **Phase 1 — Authority Engine**. See SKILLS.md for the full roadmap.

Every task must serve one of these Phase 1 goals:
- Get more content indexed by Google (SEO)
- Track what content is performing (Analytics)
- Make the site trustworthy and reliable for first-time visitors
- Build the admin infrastructure to publish content efficiently

If a task does not serve Phase 1, it is deferred to the appropriate phase. No exceptions.
