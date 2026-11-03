# GitHeddle — Test Strategy

**Bangla version:** [test-strategy.bn.md](test-strategy.bn.md)

| | |
|---|---|
| **Document** | Test strategy |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. Written by the planning panel (Agent 5). Confirm at the end of M1 |

**Related documents:** [PRD](../product/PRD.en.md) · [Tech stack decision](../decisions/0001-tech-stack.en.md) · [Architecture](../architecture/architecture.en.md) · [Security and threat model](security.en.md) · [Build and release](build-and-release.en.md) · [UI architecture](../design/ui-architecture.en.md) · [AI development workflow](../process/ai-development-workflow.en.md) · [Roadmap](../plan/roadmap.en.md)

> This file and its Bangla version, [test-strategy.bn.md](test-strategy.bn.md), carry the same content. When one changes, update the other in the same commit.

---

## 1. Purpose and principles

GitHeddle works on people's real repositories, so a bug can cost someone their work. This document says how we prove, automatically and on all three systems, that GitHeddle does what the PRD says and never loses work (PRD §7 H, §9).

Principles:

1. **Real Git, not mocks.** Anything that touches Git is tested against real repositories built by the fixture builders, using a real `git` binary. Git is never mocked in core tests.
2. **Three systems from day one.** Every pull request runs the tests on Windows, macOS and Linux (PLAT-03, PLAT-04, PRD §13).
3. **Safety rules are invariants.** Each SAFE rule becomes a named invariant (§5) that is checked in many scenarios, not by one example test.
4. **Logic lives in the core and is tested there.** The webview differs between systems and is the hardest part to automate. The UI stays thin, so most behaviour can be tested in Rust without a window.
5. **Tests are protected from being weakened.** Most of the code is written by an AI agent, so the rules in §8 stop a session from "fixing" a red test by loosening it.
6. **The owner can read the result.** Every CI run ends with a plain summary (§15). The owner should never have to read test code to know whether the app is safe.

## 2. Test levels

| Level | Name | Tool | What belongs here | Runs on |
|---|---|---|---|---|
| L1 | Unit | `cargo-nextest`, `insta`, `proptest` | Pure functions with no IO: porcelain and ref parsers, the pipeline state machine's transitions, the diff engine, merge-editor alignment, conflict marker scan, branch name pattern, pull request templates, the command guard (§5) | 3 OSes, every pull request |
| L2 | Crate integration with real Git | `cargo-nextest` with fixture builders | `git-runner`, `repo-state`, `pipeline`, `workspace`, `storage` against fixture repos in temporary folders; the safety invariants (§5); chaos tests (§6) | Every pull request: 3 OSes with the latest Git, plus Linux with Git 2.30. Nightly: 3 OSes × 2 Git versions |
| L3 | Core contract | Rust tests through Tauri's mock runtime | Each Tauri command and event: input checks, error shapes, capability rules. Records **IPC transcripts** (the real requests and responses for each fixture scenario) for L5 to replay | Linux, every pull request |
| L4 | UI component | Vitest + Testing Library | React components and Zustand stores: rendering, keyboard handling, state changes from events, empty states (UX-06) | Linux, every pull request |
| L5 | UI in a real browser, mocked IPC | Playwright on the Vite build, Chromium **and** WebKit | Whole screens driven by the recorded IPC transcripts: flows, keyboard-only use, `@axe-core/playwright`, screenshot comparisons, input latency (PERF-03) | Linux and macOS, every pull request |
| L6 | End to end | `tauri-driver` (WebDriver) | The real packaged app, the real core and real fixture repos: the P0 flows in PRD §6 | Windows and Linux, nightly and release |
| L7 | Manual smoke | Scripted checklist | The macOS app (no WebDriver for WKWebView), signing and installer behaviour, screen readers, Git Credential Manager and SSH agents on real machines | macOS each release; all 3 OSes for a release candidate |
| P | Performance | `criterion`, `tools/perf` | The PERF budgets (§9) | 3 OSes; nightly gate, release gate |

Rules for choosing a level:

- If a behaviour can be checked without a window, test it at L1–L3, not at L5 or L6.
- By default, the fake-core scenarios that L4 and L5 use are generated from the IPC transcripts that L3 recorded from real fixture runs. The only exceptions are **scripted scenarios**: timing and event-burst scripts, rare errors, and scale cases such as 5,000 files. They are typed like the rest and labelled "scripted" in their name. The TypeScript types come from `tauri-specta`, so a change in the core is a type error or a transcript diff, never a silent mock drift.
- L6 covers each P0 flow once from start to finish. It does not repeat the edge cases that L2 already covers.
- GitHub calls are never made to the real github.com in L1–L6. They go to a local mock server (the `wiremock` crate) loaded with recorded responses. GraphQL queries are checked at compile time against GitHub's published schema by `graphql_client`. A separate nightly **live contract job** runs the PR flows against a dedicated sandbox repository on github.com. It runs only on a schedule on `main`, in the protected `github-live` environment, with a fine-grained token limited to that one sandbox repository. It is the only nightly job that gets a secret, and it never runs for pull requests.

## 3. Fixture repo catalogue

Fixtures are built at test time by the **fixture builders (Rust)** in `tests/fixtures`. Binary repositories are never committed. The builders are Rust test helpers, not shell scripts, so they behave the same on Windows. Each builder:

- sets fixed author and committer names and dates, so commit hashes are the same on every run and every OS;
- points `HOME`, `XDG_CONFIG_HOME` and `GIT_CONFIG_GLOBAL` at a temporary folder and sets `GIT_CONFIG_NOSYSTEM`, so the CI machine's Git config cannot leak in. Fixtures that test the user's own config (SAFE-05) write their own global config on purpose;
- uses a local bare repository as `origin`, so fetch, pull and push need no network;
- returns a description of the expected state, which the test compares with what GitHeddle reads.

| ID | Scenario | Used for |
|---|---|---|
| FX-01 | Clean repo on a task branch with upstream | Baseline for every operation |
| FX-02 | Dirty tree: modified, staged, partly staged, untracked, deleted, renamed, mode change | DASH-02, CHG-01/02, SAFE-03/04 |
| FX-03 | Ahead of upstream | Push, DASH-02 |
| FX-04 | Behind upstream | Pull fast-forward only (BULK-01) |
| FX-05 | Diverged from upstream | Pull refusal, preview warnings (BULK-03) |
| FX-06 | No upstream set | Push with set-upstream, TASK-02 |
| FX-07 | Merge in progress, both sides modified the same lines | CONF-01..11 |
| FX-08 | Merge conflict add/add (stage 1 missing) | Merge editor with no base |
| FX-09 | Merge conflict modify/delete and delete/modify (one stage missing) | Merge editor, take current or incoming |
| FX-10 | Binary file conflict | Only take current, take incoming or the external tool |
| FX-11 | Rebase in progress, stopped on a conflict, with distinct names for the branch rebased onto and the replayed commit | SAFE-06, CONF-10 Continue and Abort; the rebase stage-to-pane mapping (Current = stage 2, the branch being rebased onto; Incoming = stage 3, the replayed commit) and the pane titles (CONF-03) |
| FX-12 | Cherry-pick in progress, stopped on a conflict | SAFE-06, CONF-01; the cherry-pick mapping (Current = stage 2, HEAD; Incoming = stage 3, the picked commit) and the pane titles (CONF-03) |
| FX-13 | Conflict markers left in a staged file | CONF-11 |
| FX-14 | Line endings: `core.autocrlf` true, input and false; `.gitattributes` with `eol`; mixed CRLF and LF files | PLAT-03, diff and merge editor saving |
| FX-15 | Case clash: two paths that differ only by case; a rename that only changes case | PLAT-03 on case-insensitive systems |
| FX-16 | Unicode, spaces, leading dashes and very long paths (over 260 characters on Windows) | Argument quoting, `--` and `--end-of-options` |
| FX-17 | Hooks: a `pre-commit` that rejects, a `commit-msg` that edits the message, a slow `pre-push`; every hook writes a marker file | SAFE-05 |
| FX-18 | Protected branch: on `dev` with local commits; on `main` | SAFE-02, DASH-07 |
| FX-19 | Detached HEAD | DASH-02, DASH-07, refusal rules |
| FX-20 | Stashes present, including an existing `githeddle/<task>` stash | SAFE-04 stash and pop |
| FX-21 | Submodule, linked worktree, shallow clone, empty repo with no commits | DASH-01 and DASH-02 must not break |
| FX-22 | Stale `index.lock` (another Git process or a killed one) | Error message (UX-04), chaos recovery |
| FX-23 | A credential helper that records each call | SAFE-05: the user's helper is used, never bypassed |
| FX-24 | 10,000-line file with a diff, and a large conflicted file | PERF-06 |
| FX-25 | 5,000 changed files spread over several repos | PERF-08 |
| FX-26 | Folder with nested repos at several depths, and a `.code-workspace` file | DASH-01 |
| FX-27 | Team files `.githeddle.json`: valid, invalid, oversized, and hostile (see the security document) | CFG-03, security tests |
| FX-28 | Hostile repository config: a command-valued `core.fsmonitor`, `core.sshCommand`, a filter, diff and merge driver, and an `include.path` / `includeIf` target; each command writes a marker file. A twin repo with `core.fsmonitor=true` only must not be flagged | Repository trust (security GS-08), INV-12 |
| WS-30 | Reference workspace: 30 real-sized repos (a mix of small and large, with long histories), in a mix of states taken from FX-01..20 | PERF-01/02/04/07, PRD §9 Performance |
| WS-50 | Scale workspace: 50 repos | PRD §9 Scale |

For FX-07, FX-11 and FX-12, a merge-editor test checks that the Current and Incoming panes hold the right stage and show the real branch or commit name for each operation (merge: Current = stage 2, HEAD; Incoming = stage 3, `MERGE_HEAD`).

Each new bug found in real use gets a new fixture or a new variant of one, plus a test that fails before the fix.

## 4. CI matrix

| Job | Windows x64 | macOS (Apple Silicon) | Linux (Ubuntu 22.04) | Git versions | When |
|---|---|---|---|---|---|
| Lint, docs-pair, terminology, skip/`.only` lint, test-change report, coverage ratchet | — | — | yes | — | Every pull request |
| L1 and L2 (with the invariants) | yes | yes | yes | latest | Every pull request |
| L1 and L2 on the oldest Git | — | — | yes | 2.30 | Every pull request |
| L1 and L2, full matrix | yes | yes | yes | 2.30 and latest | Nightly |
| L3 and L4 | — | — | yes | — | Every pull request |
| L5 Chromium + WebKit, with the Playwright report and screenshots uploaded | — | yes | yes | — | Every pull request; macOS WebKit again nightly |
| `criterion` comparison with `main` (fails at 10 %) | — | — | yes | — | Every pull request |
| `bundle` (installers) and `perf` (start, RAM, size) | yes | yes | yes | latest | On demand, by pull request label |
| Full performance budgets (§9) | yes | yes | yes | latest | Nightly, release |
| L6 `tauri-driver` | yes | — | yes | latest | Nightly, release |
| Chaos suite (§6) | yes | yes | yes | latest | Nightly, release |
| Fuzzing (§7) | — | — | yes | — | Nightly, 30 minutes per target |
| Scale WS-50 | yes | yes | yes | latest | Nightly |
| Extra platforms: Windows ARM64, macOS Intel (while GitHub offers a runner), Fedora container | L1 + L2 smoke | | | latest | Weekly and release |
| Mutation testing with `cargo-mutants` (§8) | — | — | yes | — | Weekly |
| Live GitHub contract (§2) | — | — | yes | latest | Nightly, scheduled on `main` only, `github-live` environment |

Notes:

- Git 2.30 is the oldest version the PRD supports (PRD §9 Compatibility). On Windows it comes from the MinGit 2.30.x portable release. On macOS and Linux it is built from source once and cached. The latest version is whatever the runner image ships, and its version is printed in the job summary.
- The fixture workspaces WS-30 and WS-50 may be cached, keyed by a hash of the fixture builder code. All other fixtures are built fresh in every run.
- All builds and tests run in GitHub Actions. Nothing heavy has to run on the owner's machine.

## 5. Safety invariants

Every SAFE rule is enforced in two places: in a central **command guard** inside `crates/git-runner`, which checks every argument list before a process is spawned, and in tests. The UI may also warn, but the guard is the real barrier, so a bug in the UI or in AI-written code can't get around it.

The invariants run as L2 tests across a matrix of **operations × fixtures**: every BULK-01 operation, every PIPE-02 step and every TASK flow, against every fixture in which it makes sense.

| ID | Invariant | How it is tested | PRD |
|---|---|---|---|
| INV-01 | No uncommitted change is ever lost | Before each operation, take a **work snapshot**: the content hash of every tracked and untracked (not ignored) file, the index tree, and the stash list. After it, every byte must still be recoverable: in the working tree, in the index, in a `githeddle/<task>` stash, or in a list the user confirmed for discarding | SAFE-03, SAFE-04, §9 Safety |
| INV-02 | Plain force push never happens | The guard rejects `--force`, `-f` and `+` refspecs on push. The only allowed form is `--force-with-lease` with an explicit ref and expected value, and only with a confirmation token for that action. Property tests generate push requests in every combination. After each test run, an **activity log audit** scans every logged command for forbidden forms | SAFE-01 |
| INV-03 | No commit, merge or push to a protected branch without confirmation | The guard requires a confirmation token tied to that repo, that branch and that run. Tests try every path, including pipelines (one confirmation per run) | SAFE-02, PIPE-05 |
| INV-04 | A destructive action removes exactly what the preview listed | Compare the preview's list with the difference between the work snapshots before and after | SAFE-03 |
| INV-05 | Hooks and credential helpers are never skipped or replaced | The guard rejects `--no-verify`, the `-n` short form on commit, and any `-c` that overrides `core.hooksPath` or `credential.helper`. FX-17 and FX-23 marker files prove that the hooks and helper ran | SAFE-05 |
| INV-06 | No new operation starts in a repo that is mid-merge, mid-rebase or mid-cherry-pick, unless it is meant for that state | FX-07, FX-11 and FX-12 against every other operation: the operation is refused before any Git write | SAFE-06 |
| INV-07 | State is re-checked just before running | The test harness changes the repo between preview and run (new commit, branch switched, file edited). The operation must re-plan or refuse, and it must report why | SAFE-07 |
| INV-08 | Pull is fast-forward only unless the user chose otherwise; fetch never changes local branches or the working tree | Compare refs and work snapshots before and after | BULK-01 |
| INV-09 | Every spawned process appears in the activity log | `git-runner` counts its spawns, and the test compares the count with the log entries (repo, command, exit code, duration) | BULK-08, §9 Transparency |
| INV-10 | No repo is left in an unknown state | After any failure or cancel, the state GitHeddle reports must equal the state read fresh from Git | §9 Reliability, BULK-05, UX-10 |
| INV-11 | The token never leaks | Sign in with a canary token, run the P0 flows, then scan the activity log, the SQLite files, the JSON files, every IPC payload and the environment passed to Git. The canary must not appear in any of them | PR-01, §9 Security |
| INV-12 | Nothing but the config read runs in a repository before it is trusted | Add FX-28 to a workspace. Until the user trusts it, the only thing GitHeddle does in that repo is read its local config: no background `status`, no fetch, no diff. No FX-28 marker file appears. After trust, the repo is read normally. Changing the repo's config afterwards makes it "Needs review" again. The `core.fsmonitor=true` twin is not flagged | Security GS-07, GS-08 |

Before an invariant test is changed or removed, the owner must approve it by ticking an explicit checkbox in the pull request (§8).

## 6. Crash and chaos tests

These prove the PRD §9 Reliability promise and PIPE-07 ("a paused run is kept if the app closes"). The harness runs a pipeline or bulk action on fixture repos and kills the process at a chosen **crash point**: `kill -9` on macOS and Linux, `TerminateProcess` on Windows.

| ID | Crash point |
|---|---|
| CH-01 | After the journal records a step's intent, before Git is spawned |
| CH-02 | While Git is running: kill only the app; then kill the app and Git together |
| CH-03 | After Git exits, before the journal records the result |
| CH-04 | In the middle of an SQLite write |
| CH-05 | In the middle of an atomic JSON write (settings, pipelines) |
| CH-06 | While a merge-editor Result is being saved |
| CH-07 | Network failure halfway through a push or fetch (a remote that stalls or drops) |
| CH-08 | GitHub returns errors, timeouts or rate limits halfway through creating the pull requests (PR-02/03) |

Bulk actions run as one-step journaled runs on the same engine as pipelines, from M5 on. So CH-01..03 run against bulk actions from M5, and against multi-step pipelines from M8.

After each restart, the test checks:

1. The journal and settings open without corruption (fall back to the last good copy if needed).
2. The recovery screen lists exactly the affected repos and their real state (PRD §9 Reliability).
3. **Resume** continues from the right step and never runs a step twice when that would change the result. For example, it must not make a second merge commit. Every step records its expected result and checks for it before it runs again.
4. No orphan `git` processes are left. The Job Object on Windows and the process group on Unix are checked.
5. A stale `index.lock` left by a killed Git is detected and explained, and never removed automatically. The app offers to remove it only when no Git process is running in that repo, after explaining the risk, and only with the user's explicit confirmation.
6. After CH-08, running again creates only the missing pull requests and fixes the "Related pull requests" sections (PR-03).

On top of these fixed crash points, a **stateful property test** (proptest) drives the pipeline state machine against a simple reference model with random steps, failures, pauses and crash points, and checks that both always agree.

## 7. Property tests and fuzzing

| Target | Property tests (`proptest`, L1) | Fuzzing (`cargo-fuzz`, nightly) |
|---|---|---|
| `status --porcelain=v2 --branch -z` parser | Generated records, written and parsed again, give the same model. Every record type is handled | Any bytes: no panic, no endless loop |
| `for-each-ref`, `rev-list --left-right --count`, `ls-files -u -z` parsers | Round trip | Any bytes |
| `cat-file --batch` stream reader | Correct framing for any sizes, missing objects and empty blobs | Any bytes |
| Conflict marker scan (CONF-11) | Finds markers in merge and diff3 styles and with CRLF; never flags a marker-like text that is not at the start of a line | Any text |
| Merge-editor building | **Differential test against Git:** taking all current, or all incoming, matches `git merge-file` with the same option; non-conflicting changes always appear in Result (CONF-05, CONF-08) | — |
| Diff engine | Applying the diff to the old text gives the new text; word-level ranges stay inside their lines | Any pair of texts |
| Branch name pattern (TASK-01) | **Differential test:** every name it produces passes `git check-ref-format` | — |
| BULK-07 argument splitting with `shell-words` | Quoting round trip; no shell is ever involved | Any string |
| Team file parser (CFG-03) | Unknown keys and oversized values are rejected | Any bytes |
| GitHub response parsing and the device flow | Missing or extra fields give a clear error, never a panic | Any JSON |

Every crash that fuzzing finds becomes an L1 regression test, and its input joins the stored corpus.

## 8. Snapshot policy and keeping tests honest

Snapshots (`insta`) are used for parser models, preview plans, error messages (UX-04) and IPC transcripts. Playwright screenshots are used for screens in both themes.

Snapshot rules:

1. CI runs with snapshot updates turned off. A new or changed snapshot fails the run; it is never accepted automatically.
2. Snapshot changes go in their own commit. The pull request description lists every changed snapshot with a one-line reason.
3. Screenshot baselines are made only in CI, separately for each OS and engine, by a manually started workflow. The owner looks at the image diffs before merging.

Rules that stop an AI session from weakening tests (they are repeated in the code `CLAUDE.md`, see the [AI development workflow](../process/ai-development-workflow.en.md)):

1. A test may never be deleted, skipped, marked ignored, given a longer timeout or a looser assertion to make CI pass, unless the pull request says so in a section called "Tests changed" and the owner agrees.
2. A CI lint fails on `#[ignore]`, `.skip`, `.only` and `test.fixme` unless the same line refers to an issue number.
3. The invariant tests (§5) and chaos tests (§6) live in their own folders, listed for the owner in `CODEOWNERS`. `CODEOWNERS` is used for review requests and labels, not as a required approval, because GitHub doesn't count a solo maintainer's own approval; branch protection requires green CI. Any change in these folders adds the label `tests-changed`, and the pull request can only be merged after the owner ticks an explicit checkbox saying they reviewed each test change.
4. For each safety feature, the tests are written first from the PRD requirement, in a separate commit or session, before the implementation. The implementation can then not shape its own tests.
5. **Coverage floors**, measured by `cargo-llvm-cov` and Vitest: at least 80 % of lines in the core crates, at least 90 % in `git-runner`, `pipeline` and the `diff-engine` marker scan, and at least 70 % in the UI. The floor is a ratchet: a pull request may not lower coverage by more than 0.5 points.
6. **Mutation testing** with `cargo-mutants` runs weekly on the command guard, the pipeline state machine and the marker scan. Any surviving mutant in these modules becomes an issue. This shows whether the tests really check something.

## 9. Performance tests

| PRD | What is measured | Budget | Where and how |
|---|---|---|---|
| PERF-01 | Launch to the "dashboard usable" mark that the app emits | Warm start: median of 10 under 1 s. First start on a fresh runner (the closest CI gets to after a reboot): under 2 s | `tools/perf` on all 3 OSes; also checked by hand on real machines before release |
| PERF-02 | Dashboard with WS-30: cached state visible; live state of 10 and of 30 repos | Cached state with the first frame; 10 repos within 1 s; 30 within 2 s | `tools/perf` with the real app; this is also the M1 Windows spawn-cost check that decides about `gix` |
| PERF-03 | Input to next paint | Under 100 ms at the 95th percentile | L5 in Chromium and WebKit, plus spot checks in L6 |
| PERF-04 | From a Git process ending to the repo row repainting | Under 300 ms | Timestamps from `git-runner` and a UI render mark, in L6 |
| PERF-05 | UI latency while a bulk action runs on WS-30; dashboard reads during a long bulk push | Same as PERF-03; no main-thread task over 50 ms. **Read-pool independence:** with all 4 action slots busy with slow pushes, a status refresh of the other repos still finishes within the PERF-02 times, because reads use their own pool of 8 | L5 with a replayed busy event stream, L6, and an L2 test for the read pool |
| PERF-06 | Diff of a 10,000-line file; merge editor on the large conflict (FX-24) | Diff opens under 300 ms; merge editor under 500 ms; the Rust part has its own `criterion` budget | `criterion` on every pull request; whole open time in L5 and L6 |
| PERF-07 | Memory of the app **plus all webview processes** with WS-30 open; CPU when idle for 60 s | Under 250 MB in total; idle CPU near zero with no regular wakeups | `tools/perf` on all 3 OSes |
| PERF-08 | Scrolling the Changes screen with FX-25 (5,000 files) | CI limit on GPU-less runners: 95 % of frames under 33 ms, no task over 100 ms. Target on real machines: 95 % of frames under 16.7 ms | L5 trace in both engines; the real-machine target is checked in the release smoke |
| PERF-09 | Installer size | Under 60 MB; a warning from 50 MB | Bundle job on all 3 OSes |

Enforcement:

- On every pull request, `criterion` compares with the `main` baseline. A slowdown over 10 % beyond noise fails the run. The `perf` job (start, RAM, size) runs on a pull request on demand, when the pull request has the `perf` label.
- The full budgets above are a gate for the nightly run and for every release. A budget that is missed on the nightly run opens an issue right away (PRD §13: "very fast" erodes slowly).
- The M1 go/no-go gate uses these same measurements (see the [roadmap](../plan/roadmap.en.md)).

## 10. Accessibility tests

| Check | Tool | Pass rule | PRD |
|---|---|---|---|
| Automatic rules on every screen and state, in both themes | `@axe-core/playwright` in L5 | No serious or critical violations | UX-08, PLAT-06 |
| Keyboard only: each P0 flow from PRD §6 done without the mouse | Playwright scripts in L5 | The flow finishes, focus is always visible, focus order is logical, no focus traps | UX-05, UX-08 |
| Labels and roles | Playwright accessibility-tree snapshots | Every control has a name and role; snapshot changes are reviewed (§8) | UX-08 |
| Virtualised Changes tree | Playwright accessibility-tree check on FX-25, scrolled to the top, middle and end | Every visible row has the right `aria-level`, `aria-setsize` and `aria-posinset`, so a screen reader announces "3 of 12" correctly even though most rows are not in the DOM | UX-08, CHG-01 |
| Contrast in light and dark | axe in both themes | WCAG AA | UX-08 |
| Zoom | Screenshots at 200 % | Nothing cut off or overlapping | UX-08 |
| Screen readers | Manual (L7): NVDA on Windows, VoiceOver on macOS, Orca on Linux | The release smoke script can be followed by ear | UX-08 |

## 11. Platform-difference tests

PRD §13 asks for platform differences to be handled in one place and tested there. That place is `crates/platform`, and its L2 tests run on all three systems:

- finding Git, refusing `.bat` and `.cmd` wrappers, reading the PATH from the login shell on macOS;
- paths: drive letters, UNC paths, long paths, separators, Unicode normalisation on macOS;
- line endings (FX-14) and case-insensitive file names (FX-15);
- opening the editor, terminal, file manager and external merge tool with tricky paths (FX-16);
- process flags: no console window on Windows, kill-on-close and process groups.

## 12. Traceability: P0 areas to test levels

| PRD area | L1 | L2 | L3 | L4 | L5 | L6 | L7 | Perf |
|---|---|---|---|---|---|---|---|---|
| A. Workspace and dashboard (DASH-01..06) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PERF-01/02/04 |
| B. Groups (GRP-01..03) | ✓ | ✓ | ✓ | ✓ | ✓ | | | |
| C. Tasks (TASK-01..06) | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | |
| D. Changes and commits (CHG-01..07) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PERF-06/08 |
| E. Bulk operations (BULK-01, 03..06, 08) | ✓ | ✓ | ✓ | | ✓ | ✓ | | PERF-05 |
| F. Conflicts and merge editor (CONF-01..11) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PERF-06 |
| G. Pull requests (PR-01..03, 05, 11) | ✓ | mock server | ✓ | ✓ | ✓ | ✓ | live contract | |
| H. Safety (SAFE-01..07) | guard | invariants §5 | ✓ | | ✓ | ✓ | | |
| I. Configuration (CFG-01, 02) | ✓ | ✓ | ✓ | ✓ | ✓ | | | |
| J. Platforms (PLAT-01..06) | | ✓ §11 | | | ✓ | ✓ | ✓ | PERF-09 |
| K. Speed (PERF-01..09) | | | | | ✓ | ✓ | | §9 |
| L. Ease of use (UX-01..09) | | | | ✓ | ✓ §10 | ✓ | ✓ | PERF-03 |
| M. Pipelines (PIPE-01..10) | ✓ | ✓ + chaos §6 | ✓ | ✓ | ✓ | ✓ | ✓ | |
| §9 Reliability, Security, Transparency | | INV-09..11, chaos | ✓ | | | | | |

During development, each work item (`M<n>-<nn>`) names the requirement IDs it covers and the tests that prove them. A script in CI lists every P0 ID from the PRD that no test names yet. For v0.1, that list must be empty.

## 13. When the test pieces are built

| Milestone | Test work |
|---|---|
| M0 | CI on 3 OSes, lint gates, the skip/only lint, coverage reporting, the CI summary (§15), `cargo-deny` |
| M1 | First `tools/perf` jobs; the spike measurements for the go/no-go gate |
| M2 | Fixture builders FX-01..23 and FX-28; L1 and L2 for `platform`, `git-runner`, `repo-state`, `storage`; command guard with INV-02, 05 and 09; repository trust with INV-12, before the first background status; the read-pool independence test (§9, PERF-05); parser property tests and fuzz targets; Git 2.30 leg |
| M3–M6 | L3 transcripts, L4 and L5 for each screen; INV-01, 03, 04, 06, 07, 08; WS-30; from M5, chaos tests CH-01..03 on bulk actions (one-step runs) |
| M7 | Merge-editor differential tests, FX-07..13 coverage, CONF-11 scan |
| M8 | Chaos suite CH-01..07 on multi-step pipelines, stateful state-machine test, INV-10 |
| M9 | Mock GitHub server, CH-08, INV-11, live contract job |
| M10 | L6 for every P0 flow, full performance and accessibility gates, WS-50, mutation testing, the L7 scripts, the acceptance checklist (§14) |

## 14. v0.1 acceptance checklist

v0.1 ships only when every item is checked. The first five come straight from PRD §12; the rest make them repeatable.

| # | Item | How the owner checks it |
|---|---|---|
| 1 | One real ticket spanning 2 repos goes from Start Task to created pull requests using only GitHeddle plus an editor | Done by hand on Windows; noted in the release issue with links to the pull requests |
| 2 | That ticket includes at least one conflict resolved in the merge editor | Same release issue |
| 3 | That ticket includes at least one run of a saved pipeline | Same release issue |
| 4 | The same flows pass on macOS and Linux test machines | Linux: L6 `tauri-driver` E2E and the CI install smoke are green, with no manual run required. macOS: the L7 manual smoke script is signed off |
| 5 | PERF-01 and PERF-02 met on all three systems | The release performance job is green, plus a hand check on real machines |
| 6 | Every P0 requirement is named by at least one passing test | The traceability script's list of uncovered IDs is empty |
| 7 | INV-01..12 and CH-01..08 are green on 3 OSes × 2 Git versions | The CI summary of the release candidate |
| 8 | All PERF budgets and accessibility checks pass | The CI summary |
| 9 | No open flaky tests in the safety, chaos or invariant groups | The `flaky` issue list |
| 10 | The release security checklist is done, and `cargo-deny` and `cargo-audit` are clean | [Security document](security.en.md) §11, ticked in the release issue |
| 11 | The installers for all three systems install, start and uninstall cleanly | CI install smoke on every OS and architecture, plus the L7 macOS smoke |

After release, PRD §11 adds a two-week daily-use period. Any lost work or unintended push to a protected branch during it is a release-blocking bug for v0.1.x.

## 15. How the owner reads the results

Every CI run writes a short summary at the top of the job page:

- passed and failed counts per level and per OS;
- the coverage change compared with `main`;
- changed snapshots and screenshots, with links to their diffs;
- the performance change compared with `main`, and any budget that was missed;
- the axe violation count;
- whether the `tests-changed` label is set.

The owner's review routine for a pull request: everything green; the roadmap acceptance checklist ticked with evidence; no unexplained snapshot changes; when `tests-changed` is set, read the "Tests changed" section, agree with each change and tick the checkbox for it; for a safety feature, check that its tests came before its implementation. Then the owner merges personally.

## 16. Flaky-test policy

A test is **flaky** if it fails and then passes on the same code.

1. L1–L3 run without retries, because a retry would hide races in the job runner. L5 and L6 get one retry, and every retry is reported as flaky in the summary.
2. Each flaky test gets an issue with the label `flaky` on the day it is seen. It may go into a quarantine list, where it still runs but does not block, for at most 14 days. After that it is fixed, or the owner decides to delete it.
3. **Invariant, chaos and guard tests are never quarantined.** A flake there is treated as a real bug, probably a race in GitHeddle, until proven otherwise.
4. Rules that prevent flakiness: no fixed sleeps (wait for an event or a state); a unique temporary folder for each test; fixed commit dates; no network apart from the local mock servers and local bare remotes; time comes from a clock that tests can control.

## 17. Revision history

| Version | Date | Changes |
|---|---|---|
| 0.1 | 3 November 2026 | First draft by the planning panel (Agent 5), updated after the panel's cross-review (rulings R1–R32) |
