# GitHeddle — AI development workflow

**Bangla version:** [ai-development-workflow.bn.md](ai-development-workflow.bn.md)

| | |
|---|---|
| **Product** | GitHeddle |
| **Document** | AI development workflow: how GitHeddle is built with Claude Code |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. Assumptions are marked "Assumption" |

**Related documents:** [PRD](../product/PRD.en.md) · [Roadmap](../plan/roadmap.en.md) · [ADR 0001: tech stack](../decisions/0001-tech-stack.en.md) · [Architecture](../architecture/architecture.en.md) · [UI architecture](../design/ui-architecture.en.md) · [Build and release](../engineering/build-and-release.en.md) · [Test strategy](../engineering/test-strategy.en.md) · [Security](../engineering/security.en.md)

> This file and its Bangla version carry the same content. When one changes, update the other in the same commit.

---

## 1. Purpose and scope

GitHeddle is built almost entirely by Claude Code. The owner steers, reviews and tests, and is not expected to be an expert in Rust, TypeScript or React. This document describes how that works day to day: who does what, the loop for one work item, how Claude Code is set up, what "done" means, how the owner checks work without deep expertise, and which guardrails stop the typical mistakes an AI makes.

The stack is fixed in [ADR 0001](../decisions/0001-tech-stack.en.md): Tauri 2, a Rust core in small crates, and a React 19 + TypeScript UI. The work items come from the [roadmap](../plan/roadmap.en.md) (`M<n>-<nn>`).

Two constraints shape everything below:

- **The owner's machine stays light.** All builds, full test runs and installers run in GitHub Actions. Running things locally is optional and kept small (one crate's tests, one type-check).
- **CI is the judge.** A work item is not finished because Claude Code says so. It is finished when CI is green on all three systems and the owner has checked the acceptance criteria.

## 2. Roles

| Role | Does | Does not |
|---|---|---|
| **Owner (Taosif)** | Picks the next work item; approves plans; answers product questions; checks acceptance criteria with the demo flow and CI screenshots; ticks the acceptance checklist and merges pull requests personally (this is the review, see §10.5); tests releases by hand on real machines; owns the PRD and roadmap priorities | Write or debug Rust/TS by hand (allowed, never required); approve a PR with red CI; accept "it works on my side" without evidence |
| **Claude Code (main session)** | Reads the work item and the relevant docs; writes a plan; implements on a branch; writes and runs tests; reads CI failures and fixes them; keeps docs in both languages in sync; opens the pull request with the acceptance checklist filled in | Change scope without asking; weaken or delete tests to get green; merge its own pull request; edit the PRD |
| **Review subagent** | Reviews the diff with fresh context against the acceptance criteria and the code `CLAUDE.md` | See the main session's reasoning (it must judge the code, not the story) |
| **GitHub Actions** | Formats, lints, type-checks, runs every test on Windows, macOS and Linux, builds installers, uploads screenshots and perf numbers | — |

## 3. Principles

1. **One work item, one branch, one pull request.** Never mix two items in one pull request.
2. **The docs are the spec.** A session must be able to do a work item using only the roadmap entry, the PRD IDs it names and the design docs. If it can't, the docs get fixed first.
3. **Small modules with clear contracts.** Each crate in `crates/` has one job and its own tests (see [architecture](../architecture/architecture.en.md)). Claude Code works on one crate, or one screen, at a time.
4. **Types and tests are the safety net.** Rust's compiler, `cargo clippy -D warnings`, strict TypeScript and the generated `tauri-specta` bindings catch whole classes of mistakes. Tests catch the rest.
5. **Evidence over claims.** Every claim in a pull request ("dashboard updates within 300 ms") points to a test, a CI job or a screenshot.
6. **Safety rules are never traded for progress.** Anything touching §7 H of the PRD (`SAFE-01` to `SAFE-07`) needs a test that proves the rule holds.

## 4. The standard loop for one work item

1. **Pick.** The owner picks the next item from the roadmap, respecting its dependencies, and starts a fresh Claude Code session.
2. **Load context.** Claude Code reads the code `CLAUDE.md`, the roadmap entry, the PRD rows for the IDs it names, and the crate-level documentation (§6.2) of the crates it will touch.
3. **Plan (plan mode).** Claude Code writes a short plan: the files and crates it will change, the public types or commands it will add, the tests it will write (including fixture repos), how each acceptance criterion will be shown, and any open question. No code yet.
4. **Approve.** The owner reads the plan. Check: does it stay inside the item's scope? Does every acceptance criterion have a test or a screenshot? Are the questions answered? Approve, or send it back.
5. **Branch.** Claude Code creates a branch named `<type>/<roadmap-id>-<desc>`, as in [CONTRIBUTING](../../CONTRIBUTING.md) (for example `feat/m4-03-changes-tree`), in its own worktree if items run in parallel (§7.4).
6. **Implement with tests.** Write the tests for the behaviour first where practical (parsers, state machines, safety rules), then the code. Keep each commit small and buildable.
7. **Local check (optional, targeted).** If the environment has the toolchain, run only the cheap checks for what changed: one crate's tests, the TS type-check, Biome. Never a full build on the owner's machine.
8. **Push and wait for CI.** Push the branch and open a draft pull request. When CI fails, Claude Code reads the failed job logs with the `gh` CLI, fixes the cause, and pushes again, until CI is green on all three systems. **Limit:** after two failed attempts on the same problem, Claude Code stops and asks the owner (§13). If the item touches start-up, memory or installer size, Claude Code adds the `perf` or `bundle` label so the on-demand jobs run (§7.6).
9. **Self-review.** Claude Code runs the review subagent and `/code-review` on the diff (§7.3, §7.5), fixes what they find, and checks the Definition of Done (§9).
10. **Owner check.** Claude Code marks the pull request ready and fills in the acceptance checklist with links to tests, CI jobs and screenshots. The owner goes through the checklist and the demo flow (§10), and ticks each item only after seeing its evidence.
11. **Merge.** The owner squash-merges into `main` personally. Branch protection requires green CI, not an approving review, because GitHub can't count a self-approval (§10.5). The branch and worktree are deleted. The roadmap item's status is updated in both languages.

## 5. Session sizing rules

- A **session** is one Claude Code conversation that ends with a pull request, or with a written handover note if the item is split. The roadmap gives effort in sessions, never in dates.
- An item should take **1 to 3 sessions**. If the plan lists more than about 10 files to change, more than one crate plus one screen, or more than 5 acceptance criteria, split the item before starting.
- **One concern per session:** a parser, a state machine, one screen, one CI job. Don't mix Rust core and UI work in the same session unless the item is only the thin command between them.
- **Start fresh for each item.** Don't carry a long conversation from one item to the next. Long contexts make the model forget the rules at the start.
- **Hand over when stopping mid-item.** End with a note in the pull request description: what is done, what is left, which tests fail and why. The next session starts by reading it.
- **Spikes (M1) are time-boxed.** A spike that runs past its budget of sessions stops, and the findings so far are written up.

## 6. Code-level `CLAUDE.md` and crate-level documentation

The repository root `CLAUDE.md` already holds the product and documentation rules. Work item `M0-05` extends it with a code section, and adds a crate-level documentation comment to each crate. This section describes what they must contain. It doesn't write them.

### 6.1 Code section of the root `CLAUDE.md`

- **Map of the repo:** the paths in the [architecture](../architecture/architecture.en.md) (`apps/desktop/src-tauri`, `apps/desktop/src`, `crates/*`, `tests/fixtures`, `tools/perf`), one line each, and the rule that business logic never goes in `src-tauri`.
- **Pinned versions:** the Rust toolchain from `rust-toolchain.toml`, Tauri 2, React 19, and the main crates and packages, with the instruction "use only the APIs of these versions; check the docs.rs or package docs for the pinned version before using an API you are unsure of".
- **Tauri 2 patterns:** how a command is declared, registered and exported through `tauri-specta`; how capabilities and permissions are declared; how events are emitted; one existing command named as the template to copy. Plus an explicit list of Tauri v1 patterns that must not appear (the v1 allow-list in the config, the old `tauri::api` modules, v1 plugin names).
- **Rust rules:** `thiserror` in library crates and `anyhow` only in the app shell; no `unwrap`, `expect` or `panic!` outside tests; no `unsafe` (only in `crates/platform`, with a written reason); tokio only in the job runner and IO edges; `git` is spawned only by `crates/git-runner`.
- **UI rules:** strict TypeScript, no `any`; call the backend only through the generated bindings; state in Zustand stores fed by events; components from React Aria Components; styling through the design tokens; only Baseline web features, so WebKitGTK and WKWebView behave like Chromium (see [UI architecture](../design/ui-architecture.en.md)).
- **Test rules:** every behaviour change comes with a test; Git behaviour is tested against fixture repos made by the fixture builders (Rust) in `tests/fixtures`, never against mocks of `git`; snapshot updates need a reason in the pull request; tests are never deleted, skipped or loosened without the owner's approval.
- **Commands:** the exact commands to format, lint, type-check and test one crate or the UI, and how to read CI logs with `gh`.
- **Safety rules:** a short copy of `SAFE-01` to `SAFE-07` and the git process rules from the [security](../engineering/security.en.md) doc (no shell, `--` before paths, `GIT_TERMINAL_PROMPT=0`).
- **Documentation rule:** the bilingual rule and a pointer to §12 of this document.
- **Stop-and-ask list:** a copy of §13 of this document.

### 6.2 Crate-level documentation

Each crate in `crates/` has a crate-level rustdoc comment at the top of its `lib.rs`. There are no separate notes or README files per crate. The comment holds:

- the crate's single responsibility and what it must **not** do (for example "`repo-state` never spawns processes; it asks `git-runner`");
- its public API in prose: the main types and functions and what they guarantee;
- the PRD IDs it serves;
- its invariants (for example "the parser never panics on any input; this is checked by `proptest` and `cargo-fuzz`");
- how to test it, and which fixture repos it uses;
- known limits and open questions.

Claude Code updates this comment in the same pull request whenever the public API or an invariant changes. It is a code comment, so it is written in English only, like every other code comment.

## 7. Recommended Claude Code setup

The setup lives in the repository (project settings and project subagents), so every session and every worktree gets the same behaviour. It is created in `M0-05`.

### 7.1 Hooks

- **After every file edit:** a hook formats the edited file (`rustfmt` for Rust, Biome for TS, JSON and CSS). It only runs where the toolchain is installed. In the light local setup, the same checks run as the first CI job, and Claude Code fixes them from the log.
- **Before ending a turn:** a hook reminds Claude Code to run the targeted tests for the crate or screen it changed, if the toolchain is there.
- **Guard hook before shell commands:** blocks force pushes, pushes to `main`, `git reset --hard` outside a scratch worktree, and commands that read secret files.
- **Docs pair check:** after an edit to a `*.en.md` file, a hook warns if the matching `*.bn.md` file has not been touched in the same branch, and the reverse.

### 7.2 Permissions

- **Allowed without asking:** reading files; editing inside the repository; read-only `git` commands; `gh` commands that read pull requests and CI runs; the targeted test, lint and type-check commands from the code `CLAUDE.md`.
- **Ask first:** `git push`, creating or editing pull requests, adding a dependency (changes to the Cargo manifests or `package.json`), editing GitHub Actions workflows, editing the Tauri capability files or the CSP, editing the invariant and chaos test folders, `CODEOWNERS` or the `cargo-deny` config, and any network access other than docs lookups.
- **Denied:** force pushes, pushing to `main`, editing the PRD, reading credential files and keychain dumps, installing global tools on the owner's machine.
- **Branch protection on GitHub** backs this up: `main` accepts changes only through a pull request with green CI. It doesn't require an approving review (§10.5). `CODEOWNERS` is used to request reviews and add labels, not as a required approval.

### 7.3 Subagents

- **Reviewer:** gets only the diff, the roadmap entry and the code `CLAUDE.md`, not the main session's reasoning. It reports bugs, missing tests, scope creep and rule breaks.
- **Test auditor:** compares the tests before and after the change and flags any test that was deleted, skipped, marked ignored, or had its assertions loosened or snapshots rewritten without a reason.
- **Docs sync checker:** for every changed `*.en.md` / `*.bn.md` pair, checks that sections, numbering, tables and IDs match, and that the Bangla follows the style rules in `CLAUDE.md`.
- **API checker (optional):** when the diff uses a crate or package API for the first time, it looks the API up in the pinned version's docs and confirms it exists.

### 7.4 Worktrees for parallel items

Items marked as parallel in the [roadmap](../plan/roadmap.en.md) (§5 there) can run at the same time, each in its own git worktree and its own Claude Code session. Rules: one item per worktree; two parallel items must not change the same crate's public API; the item that merges second rebases on `main` and re-runs CI; at most 2 or 3 parallel items, because the owner has to review each one.

### 7.5 `/code-review` before merge

Before marking a pull request ready, Claude Code runs `/code-review` on the branch at a medium or high level and fixes or answers every finding. Safety-related items (anything touching `SAFE-*`, `git-runner`, `pipeline` or `github` token handling) use the high level. The owner can run it again at any time.

### 7.6 On-demand CI jobs

The installer build and the full performance job are too slow for every pull request, so they run on demand (see [build and release](../engineering/build-and-release.en.md) §4):

- Add the `bundle` label to a pull request to build the installers for all three systems as artifacts. Use it when an item changes packaging, the shell, or what the app looks like at start-up.
- Add the `perf` label to run the start-time, RAM and installer-size jobs. Use it when an item touches start-up, the dashboard, the diff or merge editor, or adds a dependency.
- To run a job again after a new push, remove the label and add it again. Both jobs also run every night on `main` with the full budgets.

## 8. Prompt patterns

The owner starts sessions with short, structured prompts. Patterns, in prose:

| Situation | Pattern |
|---|---|
| Start an item | "Implement `M4-03` per the roadmap. Read the code `CLAUDE.md`, the roadmap entry and the PRD rows it names. Start in plan mode and list how each acceptance criterion will be shown." |
| Continue an item | "Continue `M4-03`. Read the handover note in pull request #N first. Finish what's left; don't change the parts that are done." |
| Fix CI | "CI failed on pull request #N. Read the failed job logs with `gh`, find the root cause, fix it. Don't skip or loosen any test." |
| Spike | "Do spike `M1-02`. The budget is 3 sessions. Measure against the gate in the roadmap and write the numbers and a recommendation into the pull request. Prototype code may be rough, but the measurements must be reproducible in CI." |
| Bug | "Bug: [what happened, on which OS, steps]. First write a failing test that reproduces it with a fixture repo, then fix it." |
| Refactor | "Refactor [crate] to [goal]. No behaviour change: every existing test must pass unchanged. List any test you think needs to change and ask me first." |
| Docs | "Update [document] for [change]. Change the English and Bangla files in the same commit, keep sections and IDs identical, and follow the Bangla style rules." |
| Review | "Review pull request #N against its roadmap entry. Use the reviewer and test-auditor subagents and `/code-review`, then summarise for me in plain language what changed and what I should test by hand." |

## 9. Definition of Done

A work item is done when **all** of these hold:

1. Every acceptance criterion in the roadmap entry is met and linked to evidence (a test, a CI job or a screenshot).
2. CI is green on Windows, macOS and Linux: format, lint (`clippy -D warnings`, Biome), type-check, the skip/`.only` lint, Rust tests (`cargo-nextest`), UI tests (Vitest; Playwright in Chromium and WebKit on Linux and macOS), `cargo-deny`, the coverage ratchet, the `criterion` comparison against `main`, and the `perf` or `bundle` job when the item touches start-up, memory or size (§7.6).
3. New behaviour has tests; Git behaviour is tested against fixture repos; parsers have property tests.
4. No test was deleted, skipped or loosened, and no snapshot was rewritten without a stated reason the owner accepted.
5. No `unwrap`, `expect`, `panic!`, `todo!` or `unsafe` outside the allowed places; no `any` in TypeScript; no new warnings.
6. New backend commands go through `tauri-specta`, and the generated bindings are committed and match.
7. Any new dependency was approved by the owner and passes `cargo-deny` (licence compatible with GPL-3.0).
8. The crate-level documentation and any affected document are updated, in both languages where the bilingual rule applies.
9. The reviewer subagent, the test auditor and `/code-review` have run and their findings are fixed or answered.
10. The owner has checked the acceptance checklist and the demo flow, and merged the pull request.

## 10. How the owner verifies without deep expertise

The owner doesn't need to read every line of Rust. Checking relies on four kinds of evidence, in this order.

### 10.1 CI checks

| Check | What green means | What the owner looks at |
|---|---|---|
| Format, lint, type-check | The code follows the rules and has no type errors | Only that it is green |
| Rust and UI tests on 3 OSes | Behaviour holds on every system | The test names added in this pull request read like the acceptance criteria |
| Test-change report | Which tests were added, changed or removed | Any removed or changed test has a reason in the pull request |
| Perf | Every pull request: the `criterion` comparison against `main` (fails at 10 % slower). With the `perf` label and nightly: start time, RAM and installer size against §7 K | The numbers in the job summary against `main` |
| Coverage and test lints | Coverage didn't drop past the ratchet; no new `#[ignore]`, `.skip` or `.only` without an issue number | Only that it is green |
| Playwright report and screenshots | Uploaded as artifacts on every pull request: the changed screens, in light and dark, Chromium and WebKit | The screenshots look like the design and nothing else moved |
| Installers | The app builds and packages on all three systems | Download and open one when the item changes the app's look or start-up |

### 10.2 Acceptance checklist

The pull request template has one checkbox per acceptance criterion from the roadmap entry. Claude Code fills each with its evidence. The owner ticks each one only after seeing the evidence.

### 10.3 Demo flows

Every item that changes what a user sees includes a short demo flow in the pull request: numbered steps the owner can follow in the installer built by CI, using a fixture workspace (for example "open the `30-repos` fixture, tick `app-api`, click Pull, see the preview"). For core items without UI, the demo is a named test whose output the owner can read in the CI log.

### 10.4 Plain-language summary

Claude Code ends every pull request with a short plain-language summary: what changed, what could go wrong, and what to test by hand. If the owner can't understand the summary, that is a reason to ask, not to merge.

### 10.5 What counts as the owner's review

The project has one maintainer, and GitHub doesn't count an author's approval of their own pull request. So the review is not a GitHub approval. It is:

1. CI is green (branch protection requires it).
2. The owner has ticked every item in the acceptance checklist, each with its evidence.
3. If the pull request changes tests in the invariant, chaos or guard folders, or has the `tests-changed` label, the owner ticks an explicit checkbox saying they read the "Tests changed" section and agree with each change.
4. The owner merges the pull request personally. Claude Code never merges.

## 11. Guardrails against common AI failure modes

| Failure mode | Guardrail |
|---|---|
| **Invented APIs** (a function or option that doesn't exist) | Pinned versions in the code `CLAUDE.md`; the compiler and the TS type-check fail fast; the API checker subagent; "check the docs for the pinned version" in every plan that uses a new API |
| **Tauri v1 / v2 mix-ups** | The list of forbidden v1 patterns in the code `CLAUDE.md`; one template command to copy; a CI check that searches for v1-only patterns; capability files are reviewed by the owner (ask-first permission) |
| **`unwrap`, `expect`, panics** | `clippy` denies `unwrap_used` and `expect_used` outside tests; `forbid(unsafe_code)`; errors are typed with `thiserror` and shown to the user per `UX-04` |
| **Skipped or missing tests** | Definition of Done items 3 and 4; the test auditor; the skip/`.only` lint; the coverage ratchet; the test-change report on every pull request |
| **Silently weakened tests** (looser assertions, rewritten snapshots, longer timeouts) | Snapshot changes need a reason; the test-change report in CI; the test auditor compares assertions before and after |
| **Scope creep** (extra features, "while I was here" refactors) | The plan must list the files to change; the reviewer flags changes outside the plan; extra ideas go into the pull request's "follow-ups" list, not the code |
| **Breaking safety rules** (force push, silent discard, skipped hooks) | `SAFE-*` tests with fixture repos run on every pull request; `git` is spawned only by `git-runner`, which has no force or hook-skipping options except force-with-lease behind an explicit flag |
| **Platform drift** (works on Windows, breaks on Linux) | All tests run on 3 OSes; path, line-ending and case logic lives only in `crates/platform` |
| **Shell injection or token leaks** | No shell anywhere; arguments are passed as a list; the token never reaches the webview; see the [security](../engineering/security.en.md) doc |
| **Confident but wrong summaries** | Evidence links are required for every claim; the reviewer subagent has no access to the main session's reasoning |
| **Dependency bloat** | Adding a dependency needs the owner's approval; `cargo-deny`; the installer size budget (`PERF-09`) in CI |
| **Overlong sessions that forget the rules** | Session sizing rules (§5); a fresh session per item |

## 12. Handling the bilingual documentation rule during development

- Any change to a human-readable document (anything under `docs/`, the READMEs, `CONTRIBUTING`, `SECURITY`) changes the `.en` and `.bn` files **in the same commit**. Claude Code writes the English first, then the Bangla from it.
- The docs sync checker subagent and the docs pair hook (§7.1) catch a change made in only one language. CI can also compare section headings and the requirement and work-item IDs between each pair.
- The Bangla follows `CLAUDE.md`: Bengali script, natural Bangla, Git and technical terms in English, Bangla numerals for section numbers, IDs and code unchanged.
- If the two files disagree, Claude Code does not guess which one is right. It asks the owner, then fixes the wrong one.
- Code, code comments (including the crate-level documentation in §6.2), config files and generated files are not covered by the rule. They are written in English only.
- UI text is English in v0.1 (PRD §14, question 7). It is not a document, so the rule doesn't apply to it.

## 13. When to stop and ask the owner

Claude Code stops and asks, rather than deciding alone, when:

1. The PRD, the roadmap or a design doc is unclear, contradicts itself, or seems to be wrong.
2. The two language versions of a document disagree.
3. Meeting an acceptance criterion seems to need a change outside the item's scope, or a change to a public API another item depends on.
4. A test seems wrong and the fix would change or remove it.
5. A new dependency, a new Tauri capability, or a change to a GitHub Actions workflow is needed.
6. Anything touches the safety rules (`SAFE-*`), token handling or what runs as a `git` command, beyond what the item describes.
7. A performance budget can't be met, or a spike's result is close to the gate threshold.
8. CI still fails after two attempts at fixing the same problem, or fails on one system only for a reason Claude Code can't explain.
9. The item is growing past its session estimate.
10. A UX choice the design docs don't cover would be visible to users.

When asking, Claude Code states the question, the options with their trade-offs, and its recommendation, so the owner can answer in one line.

## 14. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 3 November 2026 | First draft, revised after the panel review: crate docs as rustdoc comments, on-demand CI jobs, review for a solo maintainer, a two-attempt limit, branch names. |
