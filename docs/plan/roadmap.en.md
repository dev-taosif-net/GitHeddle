# GitHeddle — Roadmap

**Bangla version:** [roadmap.bn.md](roadmap.bn.md)

| | |
|---|---|
| **Product** | GitHeddle |
| **Document** | Roadmap: milestones and work items to v0.1, and an outline of v0.2 and v0.3 |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. Effort is in Claude Code sessions, not dates |

**Related documents:** [PRD](../product/PRD.en.md) · [AI development workflow](../process/ai-development-workflow.en.md) · [ADR 0001: tech stack](../decisions/0001-tech-stack.en.md) · [Architecture](../architecture/architecture.en.md) · [UI architecture](../design/ui-architecture.en.md) · [Build and release](../engineering/build-and-release.en.md) · [Test strategy](../engineering/test-strategy.en.md) · [Security](../engineering/security.en.md)

> This file and its Bangla version carry the same content. When one changes, update the other in the same commit.

---

## 1. How to read this roadmap

- **Milestones** `M0` to `M10` lead to v0.1, which holds every P0 requirement in the PRD. Each milestone has a goal, its dependencies, exit criteria and the PRD IDs it covers.
- **Work items** are `M<n>-<nn>` (for example `M4-03`). Each is sized for 1 to 3 Claude Code sessions (see [AI development workflow §5](../process/ai-development-workflow.en.md)) and follows the loop in §4 of that document. IDs are stable: an item added later gets the next free number, so a table may list items out of numeric order. The tables list them in the order they are done.
- **Effort** is given in sessions (S). There are no calendar dates. Totals are rough and are re-estimated after M1.
- **"Verified by"** says how the owner checks the item: **T** = named automated tests in CI on 3 OSes, **S** = CI screenshots, **P** = perf job numbers, **D** = demo flow in the CI-built app, **R** = written report in the pull request.
- Crate and path names are the ones in the [architecture](../architecture/architecture.en.md) doc. Fixture repos are made by the fixture builders (Rust) in `tests/fixtures`. Rule IDs such as `GS-08` or `INV-02` come from the [security](../engineering/security.en.md) and [test strategy](../engineering/test-strategy.en.md) docs.
- Every item also has to meet the Definition of Done in the [workflow](../process/ai-development-workflow.en.md) §9. The acceptance criteria below are only the item-specific part.
- For items that build a safety feature, the tests are written first, in their own commit or session, before the implementation (test strategy §8).

## 2. Milestone overview

| Milestone | Goal | Depends on | Effort (S) |
|---|---|---|---|
| M0 | Project setup: repo layout, code `CLAUDE.md`, CI skeleton on 3 OSes, lint/test gates, security baseline | — | ~11 |
| M1 | Spikes and go/no-go gate | M0 | ~11 |
| M2 | Core: `platform`, `git-runner` (with the command guard), `repo-state`, `storage`, repo trust, error classification | M1 (go) | ~21 |
| M3 | Workspace, dashboard, groups | M2 | ~17 |
| M4 | Changes screen, diff view, commits | M2, M3-03 | ~13 |
| M5 | Run engine, bulk operations and safety rules | M2, M3 | ~16 |
| M6 | Tasks | M5 | ~7 |
| M7 | Conflicts screen and merge editor | M4-01, M4-04, M5-07 | ~13 |
| M8 | Pipelines | M5, M6, M7-06 | ~15 |
| M9 | GitHub sign-in and pull requests | M2 (M9-01, M9-02); M6 (M9-03 on) | ~10 |
| M10 | Hardening: UX, accessibility, performance, installers → v0.1 release | M3–M9 | ~17 |
| | **Total to v0.1** | | **~151** |

## 3. Milestones and work items

### 3.1 M0 — Project setup

**Goal:** an empty but complete project in which a trivial pull request goes through every gate on all three systems, with the security baseline already on.
**Depends on:** nothing. **Covers:** PLAT-01, PLAT-02, PLAT-04 (foundation), PERF-09 (measurement).
**Exit criteria:** a trivial pull request is green on Windows, macOS and Linux with every gate on; the `bundle` label produces the 6 unsigned installers and their sizes; the code `CLAUDE.md`, the Claude Code setup and the owner's GitHub settings are in place.

| ID | Scope | PRD IDs | Acceptance criteria | Verified by | S |
|---|---|---|---|---|---|
| M0-01 | Repo skeleton: Cargo workspace with the empty crates, Tauri 2 app in `apps/desktop`, React 19 + Vite + strict TS, pnpm with a frozen lockfile and blocked install scripts, `rust-toolchain.toml`. Pin the latest stable versions and record them. Security baseline: CSP `default-src 'self'`, the isolation pattern, a capability file with only our commands, devtools off in release builds. `tauri-plugin-single-instance`. Shell duties: WebView2 browser keys and the webview's own zoom off, native file-drop off, a native macOS Edit menu, system theme changes sent to the UI. The webview's data folder (the WebView2 user-data folder on Windows and the per-OS webview data folders) set to GitHeddle's local data folder, as in [architecture](../architecture/architecture.en.md) §10 | PLAT-01 | The app opens a window showing "GitHeddle" on all 3 OSes; each crate compiles and has one passing test; a second launch focuses the first window; F5 and Ctrl+R don't reload the page; a file dropped on the window does nothing; the release build has no devtools; the webview's cache and data are written only inside GitHeddle's local data folder on each OS | T, S | 3 |
| M0-02 | Lint, format and type gates: `rustfmt`, `cargo clippy -D warnings` with `unwrap_used` denied and `unsafe_code` forbidden, Biome, TS type-check, the skip/`.only` lint, `cargo-deny` with GPL-3.0-compatible licences | — | A pull request with a deliberate `unwrap`, `any` or `.only` fails CI; a clean one passes | T | 1 |
| M0-03 | Test harness: `cargo-nextest`, `insta`, `proptest`; the first fixture builder (one clean repo); Vitest + Testing Library; Playwright on the Vite build with mocked IPC in Chromium and WebKit; the fake core skeleton in `apps/desktop/src/testing/`, with its first scenario generated from a recorded L3 transcript of the example command (scripted scenarios allowed only for timing, rare errors and scale, and labelled as scripted) | PLAT-04 | One example test of each kind runs in CI; the fake-core scenario is typed by the generated bindings; screenshots appear as a CI artifact | T, S | 2 |
| M0-04 | CI workflows per [build and release](../engineering/build-and-release.en.md) §4. **Every pull request:** L1/L2 on 3 OSes with the latest git plus Linux with git 2.30; L5 Playwright (Chromium, WebKit) on Linux and macOS; L3/L4 on Linux; `criterion` comparison against `main` (fails at 10 %); docs-pair, terminology, skip lint, test-change report, coverage ratchet; Playwright report and screenshots uploaded. **By label:** `bundle` and `perf`. **Nightly:** 3 OSes × git 2.30 and latest, full perf budgets, chaos suite, fuzzing. **Weekly:** extra platforms, `cargo-mutants`. git 2.30 from MinGit on Windows, built from source and cached on macOS and Linux | PLAT-01, PLAT-04 | Every listed job runs at the right trigger; the job summary lists tests added, changed and removed; adding the `perf` label starts the perf job | T | 2 |
| M0-05 | Code section of `CLAUDE.md`; a crate-level rustdoc comment at the top of each crate's `lib.rs` (workflow §6.2); Claude Code project settings (hooks, permissions, subagents); pull request template with the acceptance checklist and the `tests-changed` checkbox; one example `tauri-specta` command as the template | — | Contents match workflow §6–§7; the example command's bindings are generated and committed | R | 1 |
| M0-06 | Packaging smoke through the `bundle` label: `tauri-action` builds the 6 v0.1 installers, unsigned: Windows x64 and ARM64 `.exe` (NSIS per user), macOS arm64 and x64 `.dmg`, AppImage and `.deb` | PLAT-02, PERF-09 | All 6 installers are CI artifacts; the size table is in the job summary | P, D | 1 |
| M0-07 | Owner's GitHub settings (owner action; Claude Code writes the checklist): private vulnerability reporting, secret scanning with push protection, Dependabot alerts, a tag ruleset so only the owner creates `v*` tags, and branch protection on `main` that requires green CI but no approving review | — | The checklist in the pull request is ticked by the owner with screenshots of each setting | R | 1 |

### 3.2 M1 — Spikes and go/no-go gate

**Goal:** prove, before building features, that the stack can meet the hard speed, memory and size targets on all three webviews.
**Depends on:** M0. **Covers:** PERF-01, PERF-02, PERF-03, PERF-06, PERF-07, PERF-08, PERF-09, CONF-03, CONF-06 (prototype only).
**Exit criteria:** the gate below is decided and the decision is recorded in both languages. Spike code can be thrown away; the measurement harness in `tools/perf` stays.

**The M1 go/no-go gate.** Tauri is confirmed if, on the CI runners of all three OSes: a 5,000-row virtualised list scrolls without visible jank and responds within 100 ms (PERF-03/08); a 10,000-line diff opens within 300 ms and a prototype 3-pane merge view within 500 ms (PERF-06); cold start under the PERF-01 targets; RAM with 30 fixture repos under 250 MB (PERF-07); installer under 60 MB (PERF-09). If WebKitGTK or WKWebView fail and can't be fixed within the spike, switch to Electron. Separately, if `status` for 30 repos on Windows misses PERF-02 due to spawn cost, adopt `gix` for read paths only.

How the gate is measured:

- Every M1 number is measured with the production security settings on: the CSP, the isolation pattern and devtools off. The isolation pattern's IPC cost counts towards PERF-06.
- Every installer is measured. If the AppImage is still over 60 MB after stripping its bundled libraries, it is recorded in the ADR as a known PERF-09 exception for the AppImage only. The `.exe`, `.dmg`, `.deb` and `.rpm` must still be under 60 MB.
- RAM counts the app plus all its webview processes.

| ID | Scope | PRD IDs | Acceptance criteria | Verified by | S |
|---|---|---|---|---|---|
| M1-01 | Virtual list spike: 5,000 file rows with TanStack Virtual, measured in Playwright (Chromium, WebKit) and in the real app on 3 OSes; also tries React Aria's own virtualiser for the tree | PERF-03, PERF-08 | Input-to-paint and frame times reported per OS; meets the gate, or the failing webview and cause are named; the chosen virtualiser gives correct screen-reader level, position and set size | P, R | 2 |
| M1-02 | Diff and merge spike: `imara-diff` on a 10,000-line fixture file; checks whether `@codemirror/merge` accepts chunks computed in Rust; three EditorViews aligned from Rust-computed data with synced scrolling | PERF-06, CONF-03, CONF-06 | Open times per OS against 300 ms / 500 ms; alignment stays correct while scrolling in a recorded screenshot sequence; a written yes/no on `@codemirror/merge`. If no, both diff modes are planned on the shared aligned-panes layer; there is never a second diff engine in JS | P, S, R | 3 |
| M1-03 | Git spawn spike: `status --porcelain=v2 --branch -z` on 30 fixture repos through `tokio::process` + `process-wrap`, with `CREATE_NO_WINDOW` on Windows | PERF-02, PERF-05 | Wall time for 10 and 30 repos per OS; no console windows flash; killing the app kills children. Records whether `gix` reads are needed | P, R | 2 |
| M1-04 | Start, RAM and size harness in `tools/perf`: cold and warm start to first paint, RAM (app plus webview processes) with 30 repos open, the size of every installer, with the AppImage measured after stripping | PERF-01, PERF-07, PERF-09 | Harness runs on 3 OSes and writes a comparable table; it is kept for later budgets; an AppImage over 60 MB is written up as the exception case above | P | 2 |
| M1-06 | Shell-duty checks on each webview: browser keys and the webview's own zoom are off, file-drop is off while in-page drag-and-drop still works, ⌘C/⌘V/⌘X/⌘A/⌘Z work through the macOS Edit menu, a system theme change reaches the UI | PLAT-05, PLAT-06, UX-08 | A pass/fail table per webview in the report; each failure has a named fix or workaround | R, S | 1 |
| M1-05 | Gate decision: collect the numbers, write the decision (Tauri or Electron; CLI-only or `gix` reads; AppImage exception or not; `@codemirror/merge` or the aligned-panes layer) into an ADR update in both languages; re-estimate the roadmap | all above | The decision cites every gate number; the owner signs off | R | 1 |

### 3.3 M2 — Core crates

**Goal:** the core that every feature stands on: safe git spawning with the command guard, the job runner, repo trust, repo status, the watcher, error classification and persistence.
**Depends on:** M1 (go). **Covers:** SAFE-01, SAFE-02, SAFE-05, SAFE-06 (guard layer), PLAT-03, BULK-04, BULK-05, BULK-08, DASH-01 (trust), DASH-02, DASH-04, PERF-02, PERF-04, PERF-05, PERF-07, UX-04 (codes).
**Exit criteria:** with no UI, a test can open 30 fixture repos, refuse every command in an untrusted one, read the full status of the trusted ones, react to a file change within the PERF-04 budget, run a parallel job with cancel while reads keep flowing, and find every command in the activity log, on all 3 OSes.

| ID | Scope | PRD IDs | Acceptance criteria | Verified by | S |
|---|---|---|---|---|---|
| M2-01 | `crates/platform`: find `git` (absolute path, version ≥ 2.30, refuse `.bat`/`.cmd`), macOS login-shell PATH, path and line-ending helpers, case-sensitivity checked per volume, a clear "git missing" error, and the one launcher module allowed to spawn the editor, terminal and file manager | PLAT-03, SAFE-05 | Tests pass on 3 OSes, including a missing-git case and a path with spaces and non-ASCII characters; the Clippy rule allows spawning only in the launcher module | T | 2 |
| M2-06 | `crates/storage`: SQLite (bundled, WAL, `synchronous=FULL`) with migrations; atomic JSON writes (temp file, fsync, rename) | Reliability (PRD §9) | A test that kills the writer mid-write leaves either the old or the new file, never a broken one | T | 2 |
| M2-02 | `crates/git-runner` process layer: spawn with argv only, stdin null, `GIT_TERMINAL_PROMPT=0`, `GIT_OPTIONAL_LOCKS=0` for background reads, watchdog timeout, kill-on-close; result with exit code, output and duration | SAFE-05, PERF-05 | Tests show the user's hooks and config are used, a hung command is killed after its timeout, and no shell is ever involved | T | 2 |
| M2-09 | Command guard in `git-runner` (GS-07): rejects `--force` (only `--force-with-lease` with a confirmation token), `+` refspecs, `--no-verify`, `-c core.hooksPath` and `-c credential.helper`, protected-branch writes without a confirmation token, and any command in an untrusted repo; enforces `--end-of-options` / `--` and `check-ref-format`. Tests first | SAFE-01, SAFE-02, SAFE-05, SAFE-06 | INV-02 and INV-05 property tests pass; no argument list can reach a process without passing the guard (test) | T | 2 |
| M2-03 | `git-runner` job queue: parallel limit for actions (default 4), a separate read pool of 8, per-repo write lock, per-repo results, progress events, cancel that starts no new repos and lets running commands finish, one failure doesn't stop the others | BULK-04, BULK-05, PERF-05 | Tests with 10 fixture repos cover the limit, cancel and a mid-run failure; status reads keep running while 4 long writes fill the action limit | T | 2 |
| M2-04 | Activity log: `git-runner` emits an activity record for every command (repo, command, exit code, duration, output) through a subscription; a log sink wired in the shell writes the records to `storage`. `git-runner` never depends on `storage` | BULK-08 | Every test in M2-02/03 finds its commands in the log; INV-09 (spawn count equals log entries) passes | T | 1 |
| M2-11 | Core error classification: `git-runner` maps exit codes and known stderr patterns to stable error codes; commands return `UserError` as code plus parameters, and the UI's `copy/` catalogue owns the wording. Classification only chooses the message and never changes what the app believes about repo state (GS-12) | UX-04, BULK-05 | Snapshot tests of codes for each known failure on fixtures (dirty pull, non-fast-forward push, `index.lock`, hook rejected, auth failed); unknown errors become "git failed" with the raw text | T | 2 |
| M2-10 | Repo trust (GS-08) in `crates/workspace`: when a repo is added, read its local config and flag command-valued `core.fsmonitor` (not `true`/`false`), `core.sshCommand`, `core.pager`/`core.editor` overrides we would use, filter/diff/merge drivers, and `include.path`/`includeIf` targets. Trust is stored per repo path plus a hash of its config; the guard (M2-09) refuses every other command in an untrusted repo | DASH-01, SAFE-05 | Fixture FX-28 (hostile config): nothing but the config read runs before trust; changing the config makes the repo untrusted again | T | 2 |
| M2-05 | `crates/repo-state` parsers and model: porcelain v2 status, `for-each-ref`, ahead/behind via `rev-list --left-right --count`, in-progress operation detection, `ls-files -u -z`; `proptest` and a fuzz target for each parser | DASH-02 | Snapshot tests on fixtures for clean, dirty, staged, untracked, renamed, merging, rebasing, cherry-picking, detached and diverged repos; parsers never panic | T | 3 |
| M2-07 | Watcher and cache: `notify` with debouncing on `.git` and the worktree, ignore filtering, one refresh per repo per ~150 ms, refresh on window focus, last-known state cached on disk; trusted repos only | DASH-04, PERF-02, PERF-04, PERF-07 | A change in a fixture repo produces one refresh within budget; idle CPU near zero over a 60-second idle test; an untrusted repo is never refreshed | T, P | 2 |
| M2-08 | Long-lived `cat-file --batch` per repo for reading blobs and index stages | CHG-04, CONF-03 (foundation) | Reads base/current/incoming stages of a conflicted fixture; the process is restarted if it dies | T | 1 |

### 3.4 M3 — Workspace, dashboard and groups

**Goal:** the user opens a folder, approves untrusted repos once, and sees every repo's live state on one screen, can select repos and manage groups.
**Depends on:** M2. **Covers:** DASH-01–06, GRP-01–03, CFG-01, CFG-02, PLAT-05, PLAT-06, UX-05, UX-08, UX-09, PERF-02, PERF-03.
**Exit criteria:** the demo "open the 30-repo fixture, trust the flagged repo, see live state within 2 s, filter dirty repos, select 3, create a group" works in the CI-built app on all 3 OSes.

| ID | Scope | PRD IDs | Acceptance criteria | Verified by | S |
|---|---|---|---|---|---|
| M3-01 | `crates/workspace`: open a folder or `.code-workspace` file (folder paths only), find repos including nested ones, configurable depth; new repos go through the trust scan (M2-10) | DASH-01 | Fixtures with nested repos and a `.code-workspace` file find exactly the expected repos | T | 2 |
| M3-02 | Settings model with per-repo overrides, stored as JSON; settings screen for every CFG-01 field | CFG-01, CFG-02 | A per-repo base branch overrides the default in status; settings survive restart | T, S | 2 |
| M3-03 | App shell UI: top bar, sidebar, centre, right panel, bottom bar; design tokens with light and dark themes following the system theme sent by the core; zoom through our own zoom path; window size and layout remembered | PLAT-06, UX-08, UX-09 | Screenshots in both themes; a system theme change switches the app; Ctrl+= / ⌘= scales text and the webview's own zoom does nothing; layout restored after restart; a second launch focuses this window | S, T | 2 |
| M3-09 | Trust prompt: asked once per workspace with a list of the flagged repos and their config keys; untrusted repos show "Needs review" on the dashboard | DASH-01, UX-04 | Screenshot of the prompt; a Playwright test trusts one repo and leaves one as "Needs review" | S, T | 2 |
| M3-04 | Dashboard table: every DASH-02 column (not virtualised, at most 50 repos), last-known state shown at once, then live deltas through events | DASH-02, PERF-02, PERF-03 | 30-repo fixture: cached state at first paint, live within 2 s on 3 OSes | S, P, D | 3 |
| M3-05 | Search, filter and sort (dirty, behind, conflicts, unpushed, group, task); checkbox selection | DASH-03, DASH-05 | UI tests for each filter and sort; selection survives refresh | T, S | 2 |
| M3-06 | Row actions: open in the configured editor, terminal, file manager (through the `platform` launcher); open on GitHub | DASH-06 | Each action launches the right program with the repo path on each OS (spawn test); manual check on macOS | T, D | 1 |
| M3-07 | Groups: create, rename, edit, delete, saved with the workspace; target picker (all, group, selection, task) | GRP-01, GRP-02, GRP-03 | Groups survive restart; the target picker resolves the right repo set in tests | T, S | 2 |
| M3-08 | Command palette (cmdk in a React Aria dialog) and shortcut framework with Ctrl on Windows/Linux and ⌘ on macOS; macOS Edit menu items call registry commands | UX-05, PLAT-05 | Every registered action is found by name; shortcuts match the PRD table per OS; F5 (⌘R on macOS) refreshes repos instead of reloading the page; in-page drag and drop works on Windows (native file-drop off) | T, S | 1 |

### 3.5 M4 — Changes screen, diff view and commits

**Goal:** VS Code-style changes across all repos, fast diffs and single-repo commits.
**Depends on:** M2, M3-03. **Covers:** CHG-01–07, SAFE-02 (commit), SAFE-03 (discard), PERF-06, PERF-08.
**Exit criteria:** the demo "change files in 2 fixture repos, see them grouped, open a diff, stage one file, commit with the ticket prefix" works on all 3 OSes; diff timing budget met.

| ID | Scope | PRD IDs | Acceptance criteria | Verified by | S |
|---|---|---|---|---|---|
| M4-01 | `crates/diff-engine` line diff (`imara-diff`, histogram) and word diff (`similar`), with chunking for large files | CHG-04, PERF-06 | Snapshot tests on fixture pairs; 10,000-line diff computed well inside 300 ms in `criterion` | T, P | 2 |
| M4-02 | Changes list: a section per repo with Merge Changes, Staged Changes and Changes, counts, file rows with folder, `+/−` and status letters; virtualised; line counts subscribed only while the screen is visible | CHG-01, CHG-02, PERF-08 | 5,000-file fixture scrolls smoothly; screenshots match the design; the accessibility tree shows level, position and set size | S, P | 3 |
| M4-03 | Flat list / folder tree toggle and a file-name filter across repos | CHG-03 | UI tests for both views and the filter | T, S | 1 |
| M4-04 | Diff view: side by side and inline, syntax highlighting, word-level highlights, large files shown in parts; rendered with `@codemirror/merge` or on the aligned-panes layer, as M1-05 decided | CHG-04, PERF-06 | Opens a 10,000-line diff within 300 ms on 3 OSes; the UI computes no diff | S, P | 3 |
| M4-05 | Stage and unstage a file, and a whole section | CHG-05 | Fixture tests check the index after each action | T | 1 |
| M4-06 | Context menu: open in editor, open diff, stage/unstage, discard with a confirmation listing what is lost, copy path, show in file manager | CHG-06, SAFE-03 | Discard is impossible without confirmation (test); the dialog lists the exact files | T, S | 2 |
| M4-07 | Single-repo commit with the message prefilled from the branch's ticket key; warning and confirmation on protected branches | CHG-07, SAFE-02 | Prefill test for the default pattern; committing on `dev` asks first | T, D | 1 |

### 3.6 M5 — Run engine, bulk operations and safety rules

**Goal:** a crash-safe run engine from day one, every P0 bulk operation with preview → run → result, and every safety rule enforced in two layers (the guard and the preflight).
**Depends on:** M2, M3. **Covers:** BULK-01, BULK-03–06, BULK-08, SAFE-01–07, UX-02, UX-03, UX-04, PIPE-07 (foundation).
**Exit criteria:** every `SAFE-*` rule has a fixture test that passes on 3 OSes; chaos tests CH-01..03 pass on bulk actions; the demo "Pull on 5 repos, one dirty, one failing" shows the preview, progress and a correct result summary.

| ID | Scope | PRD IDs | Acceptance criteria | Verified by | S |
|---|---|---|---|---|---|
| M5-01 | Minimal run engine and journal in `crates/pipeline`: the operation catalogue, every bulk action as a one-step run, a write-ahead journal in SQLite, reconciliation on restart (a write is never re-run on its own). M8-03 extends it to multi-step pipelines | BULK-04, BULK-05, PIPE-07, Reliability (PRD §9) | Chaos tests CH-01..03 on a bulk push and pull: after a kill, the recovery list names exactly the affected repos and their real state | T | 3 |
| M5-07 | Preview engine: per-repo plan with warnings (dirty, diverged, protected, nothing to do), untick repos, preflight re-check of state just before running | BULK-03, UX-03, SAFE-07, GRP-03 | A repo changed after the preview is re-checked and reported, not run blindly (INV-07) | T, S | 3 |
| M5-02 | Fetch (no preview), pull fast-forward only, push; force only as force-with-lease with explicit confirmation | BULK-01, SAFE-01 | No code path can produce plain `--force` (the guard and INV-02); diverged pull stops and reports (INV-08) | T | 2 |
| M5-03 | Switch, create and delete local branch; uncommitted changes offer Stash (`githeddle/<task>`), Skip or Cancel, and pop on return | BULK-01, SAFE-03, SAFE-04 | INV-01 and INV-04: no change is ever lost; deleting an unmerged branch lists the commits and asks | T | 2 |
| M5-04 | Stash / pop, merge, and Commit Selected with one message for many repos, skipping repos with nothing staged | BULK-01, BULK-06 | Fixture tests for each; skipped repos appear as skipped in the result | T | 2 |
| M5-05 | Protected branches (default `main`, `master`, `dev`, configurable) and the in-progress guard in the preflight (no operation in a merging or rebasing repo unless meant for it) | SAFE-02, SAFE-06 | INV-03 and INV-06 for each protected action and each in-progress state | T | 1 |
| M5-06 | Progress and result UI: per-repo progress, cancel, summary of succeeded/skipped/failed, Retry failed, Open terminal, Show log; activity log screen; the `copy/` catalogue for every error code from M2-11; tooltips per UX-02 | BULK-04, BULK-05, BULK-08, UX-02, UX-04 | Screenshots of each state; every error names the repo, the step and the next action | S, D | 3 |

### 3.7 M6 — Tasks

**Goal:** the task is the unit of work across repos.
**Depends on:** M5. **Covers:** TASK-01–04, BULK-06, UX-06, UX-07.
**Exit criteria:** the demo "Start Task `TK-2636 Onboarding` in 2 fixture repos, switch to another task with a dirty repo, switch back and pop the stash" works on 3 OSes.

| ID | Scope | PRD IDs | Acceptance criteria | Verified by | S |
|---|---|---|---|---|---|
| M6-01 | Task model and branch pattern (`{ticket}-{user}-{title}`), stored with the workspace | TASK-01 | The default pattern gives `TK-2636-taosif-Onboarding`; every generated name passes `git check-ref-format`; the name is editable in the preview | T | 1 |
| M6-02 | Start Task: check tree, fetch, fast-forward the base, branch from `origin/<base>`, switch, optional push with upstream; offer to switch if the branch exists | TASK-02, UX-07 | Fixture tests for new, existing-local and existing-remote branches; at most 3 clicks from the dashboard | T, D | 2 |
| M6-03 | Active task in the top bar; Switch Task with the SAFE-04 rules | TASK-03, SAFE-04 | Fixture test: a dirty repo is stashed or skipped, never discarded | T, D | 2 |
| M6-04 | Add or remove a repo from a task | TASK-04 | Tests for both; the task's repo set updates everywhere | T | 1 |
| M6-05 | Task screen and Commit Task; empty states ("No task yet. Start a task") | BULK-06, UX-06 | Screenshots; Commit Task commits only staged repos | S, T | 1 |

### 3.8 M7 — Conflicts screen and merge editor

**Goal:** find every conflict across repos and resolve it in the Visual Studio-style three-pane editor.
**Depends on:** M4-01, M4-04, M5-07. **Covers:** CONF-01–11.
**Exit criteria:** the demo "merge a branch that conflicts in 2 fixture repos, resolve both in the merge editor, Continue all" works on 3 OSes; the merge editor opens a 10,000-line file within 500 ms.

| ID | Scope | PRD IDs | Acceptance criteria | Verified by | S |
|---|---|---|---|---|---|
| M7-01 | `diff-engine` conflict model: conflict regions from Git's worktree markers (`merge`, `diff3`, `zdiff3` styles), pane texts from stages 2 and 3 (base from stage 1), the Result text sent with conflict ranges empty plus the region list, three-pane alignment data, the marker scan | CONF-05, CONF-06, CONF-11 | Snapshot tests on conflict fixtures (including a `.csproj` with 6 conflicts); `git merge-file` is used only as a test oracle (take all current / all incoming match it) | T | 3 |
| M7-02 | Conflicts screen: repos in merge, rebase or cherry-pick, their files and conflict counts; per file: open, take current, take incoming, open external tool | CONF-01, CONF-02 | Fixture tests for each action; screenshot | T, S | 2 |
| M7-03 | Merge editor panes: Incoming left, Current right, Result bottom, aligned lines, synced scrolling, syntax and word highlights, unresolved conflicts drawn as placeholders. Pane titles per operation: **merge** Current = stage 2 (the branch you're on), Incoming = stage 3 (`MERGE_HEAD`); **rebase** Current = stage 2 (the commit being built on), Incoming = stage 3 (your commit being replayed); **cherry-pick** Current = stage 2 (HEAD), Incoming = stage 3 (the picked commit) | CONF-03, CONF-06 | Screenshot sequence shows alignment while scrolling, in Chromium and WebKit; the titles are right for the merge, rebase and cherry-pick fixtures; open time within 500 ms | S, P | 3 |
| M7-04 | Per-conflict checkboxes (both sides in tick order), hand-editable Result, take all incoming / current | CONF-04, CONF-08 | UI tests for every checkbox combination and order | T, S | 2 |
| M7-05 | Next / previous conflict with buttons and F8 / Shift+F8, "Conflict 2 of 6" counter, unresolved count | CONF-07 | UI tests | T | 1 |
| M7-06 | Accept merge (save, stage, open next file in repo, then next repo), blocked while unresolved; Continue, Abort, Continue all; block Continue if markers remain | CONF-09, CONF-10, CONF-11 | Fixture tests: Continue with markers is refused; Continue all finishes every repo | T, D | 2 |

### 3.9 M8 — Pipelines

**Goal:** saved, editable, resumable multi-step runs across repos, including the built-in Sync with Base and Merge Task Into.
**Depends on:** M5, M6, M7-06. **Covers:** PIPE-01–10, TASK-05, TASK-06, SAFE-01, SAFE-02, UX-03.
**Exit criteria:** the demo "run 'Update from main, merge into dev' on 2 repos, one pauses on conflicts, resolve, Resume, quit and reopen the app mid-run, finish" works on 3 OSes; the chaos suite CH-01..07 passes.

| ID | Scope | PRD IDs | Acceptance criteria | Verified by | S |
|---|---|---|---|---|---|
| M8-01 | Pipeline data model in `crates/pipeline`: ordered steps, variables `{current}`, `{base}`, `{task}`, saved with the workspace | PIPE-01, PIPE-04 | Round-trip tests; variables resolve per repo | T | 2 |
| M8-02 | Steps: Fetch, Update from branch, Push, Switch branch, Integrate into branch (merge, rebase), Wait for confirmation | PIPE-02, PIPE-03 | Fixture test per step and method; rebase into a pushed branch requires force-with-lease confirmation | T | 3 |
| M8-03 | Extend the M5-01 run engine to multi-step runs: per-repo state machine, pause on failure or conflict, Resume, Skip step, Stop; return to the start branch; survive restart | PIPE-06, PIPE-07, Reliability (PRD §9) | Chaos suite CH-01..07 passes; the stateful property test agrees with the reference model; Resume never runs a step twice when that would change the result | T | 3 |
| M8-04 | Whole-run preview: every repo × step, warnings, one confirmation for protected-branch and force-with-lease pushes | PIPE-05, SAFE-01, SAFE-02, UX-03 | Tests that no protected push happens without the run-level confirmation | T, S | 2 |
| M8-05 | Run screen grid (✓ ✗ ⏸ – ○), clicking a cell shows its commands and output | PIPE-08 | Screenshots of each cell state | S, T | 2 |
| M8-06 | Pipeline editor UI; the 3 ready-made pipelines; Sync with Base and Merge Task Into as built-ins; run from sidebar, task and palette | PIPE-09, PIPE-10, TASK-05, TASK-06 | Built-ins run on fixtures with the expected results; each entry point starts a run | T, D | 3 |

### 3.10 M9 — GitHub sign-in and pull requests

**Goal:** sign in safely and create and track a task's pull requests without the browser.
**Depends on:** M2 for M9-01 and M9-02; M6 for M9-03 onwards; M8-02 for M9-06. **Covers:** PR-01, PR-02, PR-03, PR-05, PR-11, PIPE-03 (pull request method), DASH-06 (open on GitHub).
**Exit criteria:** the demo "sign in with device flow, create pull requests for a 2-repo task, see related links and status" works against a test GitHub account on 3 OSes; the canary token test passes.

| ID | Scope | PRD IDs | Acceptance criteria | Verified by | S |
|---|---|---|---|---|---|
| M9-01 | `crates/github`: `HostingProvider` trait, `reqwest` client, OAuth device flow, personal access token option, token in the OS keychain via `keyring` (session-only if Linux Secret Service is missing); SEC-05 redaction of logs and errors; the UI shows the login name with an initials badge, no avatar image | PR-01 | Tests with a recorded HTTP mock; INV-11 canary test: the token appears in no log, file, IPC payload or Git environment | T, D | 2 |
| M9-02 | Map remotes (HTTPS and SSH) to GitHub repos; open a repo or pull request in the browser through the strict link allow-list | PR-11, DASH-06 | Parser tests for remote URL forms; a non-GitHub URL is shown, never opened | T | 1 |
| M9-03 | Create pull requests for a task: push first if needed, title and body templates, draft, reviewers, assignees, labels, preview and edit each | PR-02 | Mock tests for each option; manual demo against a test account | T, D | 3 |
| M9-04 | "Related pull requests" section in each body, updated when one is added later | PR-03 | Mock test: adding a third pull request updates the other two | T | 1 |
| M9-05 | Task pull request status via batched GraphQL (state, checks, reviews, mergeable, comments), cached, refreshed on demand. In v0.1 the Pull Requests screen shows only the active task's pull requests; the full screen (PR-06) is v0.2 | PR-05 | One request for all task pull requests (test); status shows in the dashboard, the task screen and the Pull Requests screen | T, S | 2 |
| M9-06 | Integrate into branch by pull request in pipelines | PIPE-03 | Pipeline test with the provider mocked | T | 1 |

### 3.11 M10 — Hardening and v0.1 release

**Goal:** make v0.1 easy, accessible, fast on every system, recoverable after a crash, and shippable.
**Depends on:** M3–M9. **Covers:** UX-01–09, PERF-01–08, PLAT-01–04, PLAT-12, Reliability (PRD §9), the "v0.1 is done when" rule in PRD §12.
**Exit criteria:** every P0 ID passes; perf budgets are enforced in CI on 3 OSes; the 6 installers are on GitHub Releases; the owner completes the PRD §12 dogfood ticket.

| ID | Scope | PRD IDs | Acceptance criteria | Verified by | S |
|---|---|---|---|---|---|
| M10-01 | First-run guide: folder, name and base branch, GitHub sign-in, every step skippable; git-missing help; a webview-version check that explains how to update (macOS 13.3 or newer) | UX-01, Compatibility (PRD §9) | A new user finishes it in under 2 minutes in a timed demo | D, S | 2 |
| M10-02 | Wording sweep: tooltips, empty states, error messages across all screens | UX-02, UX-04, UX-06 | Checklist of every screen with screenshots; every error code has catalogue text; no generic error remains | S, T | 2 |
| M10-03 | Accessibility: `@axe-core/playwright` on every screen, keyboard-only walkthrough, screen reader labels, contrast in both themes, zoom; manual passes with NVDA (Windows), VoiceOver (macOS) and Orca (Linux) where hardware is available | UX-05, UX-08 | No serious or critical axe violations; a keyboard-only Playwright test runs each main flow; the screen-reader passes are written up | T, R | 2 |
| M10-04 | Perf budgets as failing gates: start, dashboard timing for 10 and 30 repos, click response, row update, diff and merge editor open, RAM, Changes scroll; 50-repo scale test. `criterion` on every pull request; the full budgets nightly and at release | PERF-01–08 | Budgets fail CI when exceeded; numbers on 3 OSes are inside §7 K | P | 3 |
| M10-05 | Crash recovery: on start, show which repos an interrupted operation touched and their state; offer to resume paused runs; the chaos suite runs nightly and at release | Reliability (PRD §9), PIPE-07 | Kill-mid-operation tests on 3 OSes | T, D | 2 |
| M10-06 | Final installers: the 6 v0.1 installers (Windows x64 and ARM64 `.exe` per user without admin, macOS arm64 and x64 `.dmg`, AppImage and `.deb`), size check, and the install guide `docs/guides/install.{en,bn}.md` linked from the download page and the release notes: SmartScreen "Run anyway" on Windows, Gatekeeper "Open Anyway" and the quarantine fallback on macOS (no Apple Developer account, so macOS builds are ad-hoc signed), FUSE and `.deb` steps on Linux, and checking `SHA256SUMS` | PLAT-01, PLAT-02, PLAT-12, PERF-09 | Installers built from a tag; installed and launched on each OS (CI install smoke and `tauri-driver` on Windows and Linux, the manual smoke checklist on macOS); on macOS the owner or a helper opens a downloaded `.dmg` by following the guide word for word, with screenshots | T, D, P | 2 |
| M10-07 | Release process: release checklist, macOS manual smoke, cross-OS run of every v0.1 flow, release notes in both languages | PLAT-04 | Checklist completed for the release candidate | R, D | 2 |
| M10-08 | Three-click audit of Start Task, Commit Task, Create Pull Requests, Sync with Base, Run Pipeline | UX-07 | A Playwright test counts the clicks of each flow | T | 1 |
| M10-09 | Dogfood: the owner takes a real 2-repo ticket from Start Task to created pull requests, with one conflict resolved and one saved pipeline run | PRD §11, §12 | The owner's sign-off and the fixed bugs found | D | 1 |

## 4. Dependencies and critical path

**Critical path:** M0 → M1 (gate) → M2 → M3 → M5 → M6 → M8 → M10. About 115 of the ~151 sessions are in milestones on this path. M4, M7 and M9 run beside it, but M7-06 must finish before M8-03.

| Item or milestone | Waits for | Why |
|---|---|---|
| All of M2 | M1-05 | The gate decides the shell (Tauri or Electron) and whether `gix` is needed for reads |
| M2-09, M2-03, M2-11 | M2-02 | They build on the process layer |
| M2-04 | M2-02, M2-06 | The log sink writes runner records into storage |
| M2-10 | M2-09 | The guard enforces trust |
| M2-05, M2-08 | M2-02, M2-09 | All git reads go through the runner and its guard |
| M2-07 | M2-05, M2-10 | No background status runs before a repo is trusted |
| M3-04 | M2-05, M2-07, M3-03 | The dashboard shows parsed state and live updates inside the shell |
| M3-09 | M2-10, M3-03 | The prompt shows the trust scan results |
| M4 (all) | M2, M3-03 | Needs the status model and the app shell |
| M5-01 | M2-03, M2-04, M2-06 | The run engine uses the job queue, the log and the journal storage |
| M5-07 | M5-01, M3-05, M3-07 | Previews run on the engine and target selections and groups |
| M5-02 to M5-06 | M5-01, M5-07 | Every bulk action is a previewed one-step run |
| M6 | M5-07, M5-03 | Start and Switch Task reuse the preview engine and the SAFE-04 flow |
| M7 | M4-01, M4-04, M5-07 | Reuses the diff engine, the CodeMirror view and the preview engine |
| M8-03 | M5-01, M7-06 | It extends the run engine; a paused repo is resumed after its conflicts are resolved |
| M8-06 | M6 | Sync with Base and Merge Task Into are task pipelines |
| M9-03 onwards | M6 | Pull requests are created per task |
| M9-06 | M8-02 | The pull request method is a pipeline step |
| M10 | M3–M9 | Hardening covers the whole app |

## 5. Parallel work (separate worktrees)

At most 2 or 3 items run at the same time, each in its own worktree and session (see [workflow §7.4](../process/ai-development-workflow.en.md)). Items that change the same crate's public API never run together.

| Phase | Items that can run in parallel |
|---|---|
| M0 | M0-02 and M0-03 after M0-01; M0-06 alongside M0-04; M0-07 at any time |
| M1 | M1-01, M1-02 and M1-03 together; M1-04 and M1-06 alongside any of them |
| M2 | M2-01 and M2-06 together; after M2-02, M2-09 alongside M2-05 (pure parsers); then M2-03 alongside M2-10; then M2-04 alongside M2-08; M2-11 alongside M2-07 |
| M3 | M3-01 and M3-03 together; M3-02 alongside M3-04; M3-06, M3-07, M3-08 and M3-09 in any pairing |
| M3–M5 | M4-01 (Rust) alongside M3 UI items; M4 UI items alongside M5 core items; M9-01 and M9-02 alongside anything from M3 on |
| M6–M7 | M7-01 alongside M6; M7 UI items alongside M6 |
| M8–M9 | M9-03 to M9-05 alongside M8-01 to M8-05 |
| M10 | M10-02, M10-03 and M10-06 together; M10-04 alongside M10-05 |

## 6. Traceability: every P0 requirement to work items

Every P0 ID in the PRD maps to at least one work item. PERF-09 is P1 in the PRD but is part of the M1 gate, so it is listed too.

| Area | PRD ID → work items |
|---|---|
| A. Dashboard | DASH-01 → M3-01, M2-10, M3-09 · DASH-02 → M2-05, M3-04 · DASH-03 → M3-05 · DASH-04 → M2-07 · DASH-05 → M3-05 · DASH-06 → M3-06, M9-02 |
| B. Groups | GRP-01 → M3-07 · GRP-02 → M3-07 · GRP-03 → M3-07, M5-07 |
| C. Tasks | TASK-01 → M6-01 · TASK-02 → M6-02 · TASK-03 → M6-03 · TASK-04 → M6-04 · TASK-05 → M8-06 · TASK-06 → M8-06 |
| D. Changes | CHG-01 → M4-02 · CHG-02 → M4-02 · CHG-03 → M4-03 · CHG-04 → M4-01, M4-04, M2-08 · CHG-05 → M4-05 · CHG-06 → M4-06 · CHG-07 → M4-07 |
| E. Bulk | BULK-01 → M5-02, M5-03, M5-04 · BULK-03 → M5-07 · BULK-04 → M2-03, M5-01, M5-06 · BULK-05 → M2-03, M5-01, M5-06 · BULK-06 → M5-04, M6-05 · BULK-08 → M2-04, M5-06 |
| F. Conflicts | CONF-01 → M7-02 · CONF-02 → M7-02 · CONF-03 → M1-02, M7-03 · CONF-04 → M7-04 · CONF-05 → M7-01 · CONF-06 → M7-01, M7-03 · CONF-07 → M7-05 · CONF-08 → M7-04 · CONF-09 → M7-06 · CONF-10 → M7-06 · CONF-11 → M7-01, M7-06 |
| G. Pull requests | PR-01 → M9-01 · PR-02 → M9-03 · PR-03 → M9-04 · PR-05 → M9-05 · PR-11 → M9-02 |
| H. Safety | SAFE-01 → M2-09, M5-02, M8-04 · SAFE-02 → M2-09, M4-07, M5-05, M8-04 · SAFE-03 → M4-06, M5-03 · SAFE-04 → M5-03, M6-03 · SAFE-05 → M2-01, M2-02, M2-09, M2-10 · SAFE-06 → M2-09, M5-05 · SAFE-07 → M5-07 |
| I. Configuration | CFG-01 → M3-02 · CFG-02 → M3-02 |
| J. Platforms | PLAT-01 → M0-01, M0-04, M10-06 · PLAT-02 → M0-06, M10-06 · PLAT-03 → M2-01 · PLAT-04 → M0-03, M0-04, M10-07 · PLAT-05 → M1-06, M3-08 · PLAT-06 → M1-06, M3-03 · PLAT-12 → M10-06 |
| K. Speed | PERF-01 → M1-04, M10-04 · PERF-02 → M1-03, M2-07, M3-04, M10-04 · PERF-03 → M1-01, M3-04, M10-04 · PERF-04 → M2-07, M10-04 · PERF-05 → M1-03, M2-02, M2-03, M10-04 · PERF-06 → M1-02, M4-01, M4-04, M10-04 · PERF-07 → M1-04, M2-07, M10-04 · PERF-08 → M1-01, M4-02, M10-04 · (PERF-09 → M0-06, M1-04, M10-06) |
| L. Ease of use | UX-01 → M10-01 · UX-02 → M5-06, M10-02 · UX-03 → M5-07, M8-04 · UX-04 → M2-11, M5-06, M10-02 · UX-05 → M3-08, M10-03 · UX-06 → M6-05, M10-02 · UX-07 → M6-02, M10-08 · UX-08 → M1-06, M3-03, M10-03 · UX-09 → M3-03 |
| M. Pipelines | PIPE-01 → M8-01 · PIPE-02 → M8-02 · PIPE-03 → M8-02, M9-06 · PIPE-04 → M8-01 · PIPE-05 → M8-04 · PIPE-06 → M8-03 · PIPE-07 → M5-01, M8-03, M10-05 · PIPE-08 → M8-05 · PIPE-09 → M8-06 · PIPE-10 → M8-06 |

When the PRD gains or changes a P0 ID, this table and the affected items are updated in the same change, in both languages.

## 7. After v0.1 (milestone level only)

These milestones are provisional. They are broken into work items only when v0.1 ships.

### 7.1 v0.2 (all P1 requirements)

| Milestone | Scope | PRD IDs |
|---|---|---|
| M11 | Undo and safety extras: undo the last bulk action, clear cancel/failure reports, risk badges | BULK-09, UX-10, DASH-07 |
| M12 | Pull request power: repo templates, the full Pull Requests screen, bulk update, ordered merge | PR-04, PR-06, PR-07, PR-08 |
| M13 | Tasks, workspaces and team file: Finish Task, recognise tasks from branches, several workspaces, `.githeddle.json` (no programs, no Run Git command steps, changes approved by the user), pipeline options, shortcuts, sharing and run history | TASK-07, TASK-08, DASH-08, CFG-03, PIPE-11–14 |
| M14 | Git depth: Base view in the merge editor, commit history, more operations, Run Git command, built-in help | CONF-12, CHG-08, BULK-02, BULK-07, UX-11 |
| M15 | Distribution: automatic updates, signed Windows installer (macOS stays ad-hoc signed), `.rpm` | PLAT-07, PLAT-08, PLAT-09 |

### 7.2 v0.3 and later (P2 and new hosts)

| Milestone | Scope | PRD IDs |
|---|---|---|
| M16 | Line and hunk staging, Conventional Commits | CHG-09, CHG-10 |
| M17 | Review flow and notifications | PR-09, PR-10 |
| M18 | More pipeline steps, Linux ARM64; a notarised macOS app only if the owner has taken an Apple Developer account by then | PIPE-15, PLAT-10, PLAT-11 |
| M19 | GitLab and Azure DevOps behind `HostingProvider`; issue-tracker titles; AI-written pull request descriptions | PRD §12 |

## 8. Roadmap risks

| Risk | Effect | Mitigation |
|---|---|---|
| The M1 gate fails on WebKitGTK or WKWebView | Switch to Electron; M0 shell work partly redone | The React UI and Rust core carry over; only the shell adapter changes. Re-estimate after M1-05 |
| Windows process spawn cost misses PERF-02 | `gix` read paths add work to M2-05 | Decided at the gate; reads stay behind the `repo-state` API, so the UI doesn't change |
| The AppImage is over 60 MB | PERF-09 missed for one package | Strip the bundled libraries; otherwise record the AppImage-only exception in the ADR at M1-05 |
| `@codemirror/merge` doesn't accept chunks from Rust | M4-04 grows | Decided at M1-02; both diff modes then use the aligned-panes layer that M7 needs anyway |
| The merge editor is harder than estimated | M7 grows | M1-02 prototype first; alignment computed in Rust and tested with snapshots; the external merge tool (CONF-02) stays a fallback |
| CI on 3 OSes is slow, so the agent loop is slow | Fewer items per session | Caching and `sccache`; installers and full perf only by label or nightly |
| macOS can't be fully automated (`tauri-driver` doesn't support it) | macOS bugs found late | Playwright WebKit on macOS on every pull request plus the manual macOS smoke checklist each release |
| Estimates in sessions are rough | The total moves | Re-estimate after M1 and after each milestone; split any item that passes 3 sessions |
| Scope creep from P1 ideas | v0.1 slips | Only P0 in v0.1; ideas go to the follow-ups list for M11+ |
| Parallel worktrees collide | Rework and merge conflicts | At most 2–3 parallel items; never two changing the same crate API |
| The owner becomes the review bottleneck | Items wait for review | Evidence-first pull requests (workflow §10); small items |
| Pinned versions age during the build | Security advisories, outdated docs | Renovate and `cargo-deny`; upgrade only in dedicated items |

## 9. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 3 November 2026 | First draft, revised after the panel review: security baseline and shell duties in M0, the owner's GitHub settings (M0-07), shell checks (M1-06), the command guard (M2-09), repo trust (M2-10, M3-09), error classification (M2-11), the run engine from M5-01, the preview engine (M5-07), 6 installers, the CI layout. |
| 0.2 | 3 November 2026 | No Apple Developer account for now: M10-06 adds the install guide (PLAT-12); M15 signs only the Windows installer; a notarised macOS app (PLAT-11) is listed under M18, only if an account exists by then. |
