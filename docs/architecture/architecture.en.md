# GitHeddle — Architecture

**Bangla version:** [architecture.bn.md](architecture.bn.md)

| | |
|---|---|
| **Document** | Architecture |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. Some decisions wait for the M1 go/no-go gate (§18) |

**Related documents:** [PRD](../product/PRD.en.md) · [ADR 0001: tech stack](../decisions/0001-tech-stack.en.md) · [UI architecture](../design/ui-architecture.en.md) · [Build and release](../engineering/build-and-release.en.md) · [Test strategy](../engineering/test-strategy.en.md) · [Security](../engineering/security.en.md) · [AI development workflow](../process/ai-development-workflow.en.md) · [Roadmap](../plan/roadmap.en.md)

> This file and its Bangla version, [architecture.bn.md](architecture.bn.md), carry the same content. When one changes, update the other in the same commit.

---

## 1. Purpose and scope

This document describes how GitHeddle is built inside: the processes, the Rust crates and their boundaries, how data moves between the core and the UI, and how the performance and reliability targets in the PRD are met. It covers the backend and the IPC contract in detail. The React UI's internal structure is covered in the [UI architecture](../design/ui-architecture.en.md) document, and builds and installers in [Build and release](../engineering/build-and-release.en.md).

Each section is meant to be enough for a Claude Code session to implement a work item (`M<n>-<nn>`) without guessing. Each section also says how the owner can check the result without reading the code in depth.

## 2. Goals and constraints

| # | Goal or constraint | Source in the PRD |
|---|---|---|
| 1 | Use the user's own `git` for every operation, with their config, credentials and hooks. Never skip hooks. | SAFE-05, §9 Transparency, §10 |
| 2 | Git and network work never block the window. Long work shows progress immediately. | PERF-03, PERF-05 |
| 3 | Show the last known state at once on start, then the live state of 30 repos within 2 seconds. | PERF-01, PERF-02, DASH-04 |
| 4 | Stay small: under 250 MB of RAM with 30 repos, idle CPU near zero, installer under 60 MB. | PERF-07, PERF-09 |
| 5 | One diff engine for the Changes screen, the diff view and the merge editor. The merge editor follows what Git itself did. | CHG-04, CONF-03..06, §10, §13 |
| 6 | A bulk action or pipeline never leaves a repo in an unknown state, even after a crash. Paused runs survive a restart. | PIPE-07, BULK-05, §9 Reliability |
| 7 | Behave the same on Windows, macOS and Linux, with platform differences handled in one place. | PLAT-01, PLAT-03, §13 |
| 8 | Log every Git command that runs, visibly. | BULK-08, §9 Transparency |
| 9 | Tokens only in the OS keychain, and never sent to the webview. | PR-01, §9 Security |
| 10 | GitHub first, with other hosts possible later without changing the rest. | §10 Hosting providers |
| 11 | The code is written by an AI agent. Boundaries must be strict and checked by tools, so mistakes fail the build rather than show up at run time. | Decision brief §2 |

## 3. Process model

GitHeddle runs as one native Rust process (the Tauri shell plus the core crates) and one webview that draws the UI. The OS provides the webview: WebView2 on Windows, WKWebView on macOS and WebKitGTK on Linux. The core starts `git` child processes. Nothing else runs in the background, and there is no local server.

```text
+-------------------------- GitHeddle process (Rust) ---------------------------+
|                                                                                 |
|  apps/desktop/src-tauri  (Tauri shell: commands, events, capabilities)          |
|        |  calls                         ^ events (deltas, progress)             |
|        v                                |                                       |
|  pipeline -----> workspace      repo-state <---- watcher (notify)               |
|     |   \           |              |                                            |
|     |    \--> github (reqwest) ----+---> HTTPS: GitHub REST / GraphQL           |
|     v               v              v                                            |
|  git-runner  (job queue, parallel limit, cancel, timeouts, activity log)        |
|     |                                                                           |
|  diff-engine (pure)     storage (SQLite + JSON)     platform (OS layer)         |
+-----|---------------------------------------------------------------------------+
      | spawns (no shell)                      ^ typed IPC (tauri-specta)
      v                                        |
  git processes (user's git, one per job,   Webview: React UI (apps/desktop/src)
  plus one long-lived cat-file --batch      WebView2 / WKWebView / WebKitGTK
  per repo while it is in use)
```

Threads and runtimes:

- **Tauri main thread:** only the window, the menu and dispatching IPC. No Git, disk or network work ever runs on it (PERF-03, PERF-05).
- **tokio runtime:** started by the shell. The job runner, watchers, refresh logic and GitHub client run on it. Library crates that do no IO, such as `diff-engine` and the parsers, are plain synchronous Rust and don't depend on tokio.
- **Blocking pool:** CPU-heavy pure work, such as diffing a large file, runs through tokio's blocking pool so it never stalls async tasks.
- **Webview:** runs the UI only. It has no direct file system, shell or network access. It can only call GitHeddle's own commands, which are listed in the Tauri capability allow-list. `tauri-plugin-shell` and the fs plugins are not exposed. See [Security](../engineering/security.en.md).

**Single instance.** `tauri-plugin-single-instance` makes sure only one GitHeddle process runs per user. A second launch hands its arguments to the first process, which brings its window to the front, and then exits. This matters because `state.db`, the pipeline journal and the updater all assume a single owner.

**Shell duties.** Besides commands and events, the Tauri shell owns these window-level jobs. The UI depends on them (see [UI architecture](../design/ui-architecture.en.md) §14 and §8):

| Duty | Why | Checked by |
|---|---|---|
| Turn off the webview's own browser keys (reload on F5 and Ctrl+R, print, find, devtools in release) and the webview's own zoom | F5, Ctrl+R and Ctrl+± are GitHeddle's shortcuts (refresh and zoom, UX-08), and a reload would throw away the UI state | M1 spike check on all 3 webviews, then the M0-01 and M3-08 acceptance tests |
| Provide a native macOS menu bar with the standard app menu and Edit menu | WKWebView needs it for ⌘C, ⌘V, ⌘X, ⌘A and ⌘Z to work. Menu items call registered UI commands | M1 spike check, then M3-08 |
| Turn off native file-drop handling on the window | Otherwise it swallows in-page drag-and-drop (pipeline step reordering) | M1 spike check, then M3-08 |
| Send the system theme (light, dark, high contrast) to the UI, and send an event when it changes | `prefers-color-scheme` isn't reliable on every Linux desktop (PLAT-06) | M1 spike check, then M3-03 |
| Set the webview's data folder (§10) | Keeps the webview's own cache in GitHeddle's local data folder | M0-01 |

## 4. Crates and dependency direction

The repository is a Cargo workspace plus the UI package. The names are canonical. Every crate except the shell is a library with no Tauri dependency, so it can be tested with `cargo nextest` alone.

| Crate | Responsibility | Public surface (in prose) | Internal dependencies |
|---|---|---|---|
| `crates/platform` | Everything that differs per OS: finding `git` and checking its version (2.30 or newer), PATH (login-shell PATH on macOS), app data folders, path normalisation and comparison, case sensitivity per volume, line-ending and encoding detection, process creation flags, keychain access, the system theme, and the **launcher** module, which starts the editor, terminal and file manager (DASH-06) and opens allow-listed links. | A `Platform` value created once at start, which answers "where is git", "where is the data folder", "how do I compare these two paths", "open this folder in the terminal". Also functions that store, read and delete a secret. | none |
| `crates/diff-engine` | Line diff (`imara-diff`, histogram) and word diff (`similar`), turning conflict markers and index stages 1/2/3 into conflict regions, merge-editor alignment data, and the conflict-marker scan (CONF-11). Pure: takes bytes, returns data. Does no IO. | A function that diffs two texts and returns hunks with line ranges and word-level changed ranges. A function that takes base, current, incoming and the worktree text and returns a merge model (chunks, ranges, spacer lines). A function that says whether a text still contains conflict markers. | none |
| `crates/storage` | All persistence: one SQLite database (`rusqlite`, bundled, WAL, `synchronous=FULL`) and atomic JSON files (write a temp file, fsync, rename). Schema versions and migrations. | Typed repositories (in the data-access sense) for the state cache, the pipeline journal and the activity log. Load and save functions for each JSON document type. No other crate opens a file under the data folder. | `platform` |
| `crates/git-runner` | The only place where `git` is started. The **command guard** (§6, GS-07), job queue, parallel limits, per-repo write lock, cancellation, watchdog timeouts, the long-lived `cat-file --batch` sessions, classifying Git errors, and emitting activity records (BULK-04, BULK-08). | Submit a job (repo, arguments, kind, priority, timeout, confirmation tokens) and get a handle that reports progress and the final result (exit code, stdout, stderr, duration), or a guard refusal. Cancel a group of jobs. Read blobs through a repo's cat-file session. Set which repos are trusted (§7). Subscribe to activity records. | `platform` |
| `crates/repo-state` | Porcelain parsing, the repo status model, file watchers, debounced refresh, computing deltas, and the cached last-known state. | Start watching a set of repos. Get the current snapshot of one repo or all of them. Subscribe to deltas. Force an immediate refresh of one repo (used after a job, PERF-04). Read the change list with line counts for the Changes screen. Get the diff of a file, and the merge model of a conflicted file (§8). | `platform`, `git-runner`, `storage`, `diff-engine` |
| `crates/workspace` | Workspaces, `.code-workspace` import, repo discovery with configurable depth (DASH-01), groups, tasks, settings, per-repo overrides, the team file `.githeddle.json`, branch-name patterns (TASK-01), and the repo trust check (§7, GS-08). | Open and save a workspace. Discover repos. Scan a repo's config and report what needs review, then record the user's trust decision. Create, edit and delete groups and tasks. Resolve a target set (all, group, selection, task) into a list of repos (GRP-03). Read effective settings for a repo, with overrides applied. | `platform`, `git-runner`, `storage` |
| `crates/github` | The `HostingProvider` trait and its GitHub implementation: OAuth device flow, personal access tokens, REST and GraphQL calls through a thin `reqwest` client (rustls + `rustls-platform-verifier`) with `graphql_client` typed queries. | Detailed in §11. The token is read from the keychain inside this crate and never returned to callers. | `platform`, `storage` |
| `crates/pipeline` | The operation catalogue (BULK-01/02, TASK-02/05/06), pipeline step definitions (PIPE-02/03), built-in pipelines (PIPE-09), variable resolution (PIPE-04), previews and safety checks (BULK-03, SAFE-01..07), the per-repo run state machine and its journal (PIPE-07). | Build a preview for an operation or pipeline on a target set. Start a run from a confirmed preview. Resume, skip or stop a repo's run. List runs, including ones interrupted by a crash. Subscribe to run-cell updates. | `platform`, `git-runner`, `repo-state`, `workspace`, `github`, `storage`, `diff-engine` |
| `apps/desktop/src-tauri` | The Tauri shell: creates the runtime and the core services, defines the IPC commands and events, holds the capability allow-list. Thin: each command checks its input, calls one core function and maps the error. No business logic. | The IPC contract (§5), generated to TypeScript with `tauri-specta`. | all crates |

**Allowed dependency direction.** Dependencies only go downwards in this order: shell → `pipeline` → (`workspace`, `repo-state`, `github`) → (`git-runner`, `storage`) → `platform`. `diff-engine` is a pure leaf that any crate from `repo-state` upwards may use. There are no cycles, and a lower crate never names a higher one. When a lower crate must report something upwards (for example `git-runner` emitting activity records), it offers a subscription or a callback, never a dependency.

**Rules that tools check in CI** (so the owner only has to read the CI result):

1. Only `git-runner` may start `git`. The only other code that may start a process is the launcher module in `platform`. It starts the editor, terminal and file manager, runs the login-shell PATH discovery and `git --version`, and uses Rust's batch-file argument escaping for Windows `.cmd` launchers (GS-11). Clippy `disallowed-methods` forbids `std::process::Command` and `tokio::process` everywhere else, with an exception for exactly these two modules.
2. Only `github` depends on `reqwest`. Only the shell depends on `tauri`. Only `storage` depends on `rusqlite`. Only `platform` depends on `keyring`, and only `repo-state` depends on `notify`. Enforced with `cargo-deny` bans per crate, or a small check over `cargo metadata` in `tools/`.
3. No `unwrap`/`expect` outside tests (`clippy::unwrap_used`), and `forbid(unsafe_code)` everywhere except `platform`, where any `unsafe` block needs a comment explaining it.
4. The generated TypeScript bindings are committed. CI regenerates them and fails if they differ, so a change on one side of the IPC contract that isn't reflected on the other fails the build.

## 5. IPC contract

There are two kinds of message, and each has one job.

| Kind | Direction | Used for | Examples |
|---|---|---|---|
| **Command** | UI → core, async request and response | Asking for data, and starting things | open workspace, get repo snapshot, get diff, build preview, start run, cancel, stage file, sign in |
| **Event** | core → UI, push | Anything that changes on its own, or progress | repo-state delta, job progress, run-cell update, activity record, GitHub status update, crash-recovery notice |

Rules:

1. **Commands return fast.** A command that starts long work (a bulk action, a pipeline, a fetch) returns a job or run id at once. Progress and results come as events (PERF-03, PERF-05). No command waits on the network or on a write operation before it answers.
2. **Deltas, not snapshots.** Every repo state has a revision number that goes up by one with each change. A delta event carries the repo id, the new revision and only the fields that changed. The UI applies a delta only if its revision is exactly one more than what it holds. If it sees a gap, it asks for a fresh snapshot of that repo with a command. Full snapshots are sent only on start, when a workspace opens, or after a gap.
3. **Batching.** The core collects events and sends them at most about every 16 ms (one frame), so 30 repos refreshing together cause one UI update, not 30.
4. **Large payloads.** Any response that could be over about 1 MB is paged or streamed through a Tauri channel (`tauri::ipc::Channel`) instead of being returned in one message. This applies to diffs, file lists and command output. Diffs of files over 10,000 lines are sent in windows of hunks, and the UI asks for the next window as the user scrolls (PERF-06). File contents are sent once per pane. Hunk and alignment data refer to line numbers and never repeat the text.
5. **Typed both ways.** Every command argument, result and event payload is a Rust type with `serde` and `specta` derives. `tauri-specta` generates the TypeScript types and the call functions. The UI never builds a command name as a string.
6. **Errors** cross the boundary only in the shape described in §13.
7. **Secrets never cross.** The webview sees the GitHub login name and the signed-in state, never a token. v0.1 shows no avatar images, only an initials badge, because the webview loads nothing remote (TH-07).
8. **Subscriptions follow the screen.** Costly streams are only produced while a screen needs them. For example, the UI subscribes to per-file line-count updates when the Changes screen opens and unsubscribes when it closes. The core reads `--numstat` only while at least one subscription is open (§7 step 6, matching [UI architecture](../design/ui-architecture.en.md) §5.1).

How the owner checks it: the generated bindings file changes in the same pull request as the Rust types it comes from, and the CI job "bindings up to date" is green.

## 6. Job runner (`git-runner`)

Every `git` command, whether from the dashboard refresh, a bulk action, a pipeline or the Run Git command feature, goes through this crate.

**A job** has a repo, an argument list, a kind (read, write or network), a priority, a timeout, an optional group id (for example a bulk action's run id), and any confirmation tokens the preview produced.

**Command guard (GS-07).** Every argument list passes through one central guard before a process is started. A job the guard refuses is never spawned and is reported as a refusal with its reason. The guard:

- rejects `--force`, `-f` and `+` refspecs on push. The only allowed form is `--force-with-lease` with an explicit ref and expected value, and only with a confirmation token for that action (SAFE-01)
- rejects writes to a protected branch without a confirmation token tied to that repo, that branch and that run (SAFE-02)
- rejects `--no-verify`, `-n` on commit, and any `-c` that overrides `core.hooksPath` or `credential.helper` (SAFE-05)
- rejects every command in a repo that isn't trusted, except the config read used by the trust check (§7, GS-08)
- enforces `--end-of-options` before revisions and `--` before paths, and checks branch and tag names with `git check-ref-format` (GS-04)

The guard is the last line. `pipeline` still runs its own preflight checks before each step (§9), so there are two layers, and a bug in one doesn't remove the protection.

**Scheduling:**

| Rule | Detail | PRD |
|---|---|---|
| Parallel limit for actions | Write and network jobs from bulk actions and pipelines share a semaphore whose size is the user's parallel limit (default 4, CFG-01). | BULK-04, PIPE-06 |
| Separate read pool | Status reads for refreshes use their own small pool (proposed default 8), so a long bulk push doesn't freeze the dashboard. | PERF-02, PERF-05 |
| One writer per repo | A per-repo lock allows only one write job at a time in a repo. Reads in that repo can run alongside it, because they use `GIT_OPTIONAL_LOCKS=0` and never take `index.lock`. | SAFE-07 |
| Priority | User-started jobs first, then refreshes, then background fetch (off by default, DASH-04). | PERF-03 |

**Starting a process.** The runner uses the absolute path to `git` that `platform` found once at start. It refuses `.bat` and `.cmd` wrappers. It never goes through a shell. Arguments are passed as a list, always with `--` before paths. For BULK-07, the user's text is split with `shell-words`. Each process gets:

- stdin set to null
- `GIT_TERMINAL_PROMPT=0`, so a missing credential fails at once instead of hanging. The user's own credential helpers, including graphical ones like Git Credential Manager, still work (SAFE-05).
- `GIT_OPTIONAL_LOCKS=0` for background reads
- `CREATE_NO_WINDOW` on Windows
- `process-wrap`: a Windows Job Object that kills the whole process tree when GitHeddle exits, and a process group on Unix

**Cancellation (BULK-04).** Cancel marks the group cancelled. Jobs that haven't started are dropped and reported as "skipped: cancelled". Running Git commands are left to finish, so no repo is cut off in the middle of a write. The process tree is killed only when the app is quitting (after asking the user if a write is running) or when a watchdog fires.

**Timeouts.** Each job kind has a watchdog. Proposed defaults, to be tuned at M2: reads 30 s. Network jobs fail after 120 s with no output, but are never cut off while output is still arriving. Writes that may run hooks have no hard limit; after 60 s the UI shows "still running" with a Cancel option. A job stopped by its watchdog is reported as failed with the reason "timed out", and the repo is re-read before anything else runs in it.

**cat-file sessions.** For diffs and the merge editor, the runner keeps one `git cat-file --batch` process per repo while that repo's Changes or Conflicts view is in use. Blobs are read through it without starting a new process each time. Sessions close after about 60 s idle, so 30 long-lived processes don't eat memory (PERF-07).

**Results.** Each finished job gives its exit code, stdout, stderr, duration and a classified error, if any (§13). Every job, successful or not, emits an activity record (§14).

How the owner checks it: in the activity log, run a bulk Fetch on a group with the parallel limit set to 2, and see no more than two network commands overlapping. Then press Cancel during a 10-repo pull and see the remaining repos listed as skipped.

## 7. Repo-state pipeline (`repo-state`)

This is how the dashboard stays live without polling (DASH-04, PERF-02, PERF-04, PERF-07).

**Repo trust comes first (GS-08).** Even `git status` can run programs named in a repo's own config, for example a command in `core.fsmonitor`. So when a repo is added to a workspace, `workspace` reads its local config before anything else runs. It uses only a config read through `git-runner`, the one command the guard allows in an untrusted repo, and it follows `include.path` and `includeIf` targets. It looks for:

- `core.fsmonitor` set to a command (the values `true` and `false` are fine)
- `core.sshCommand`
- `core.pager` and `core.editor` overrides in the commands GitHeddle runs
- filter, diff and merge drivers
- `include.path` and `includeIf` targets

If nothing is found, the repo is trusted. Otherwise the user is asked **once per workspace**, with one list of every flagged repo and key. Until the user trusts it, a repo shows "Needs review" and gets no `git` commands at all, background `status` included. The guard enforces this (§6). A trust decision is stored per repo path together with a hash of the config it was based on (§10). If the config changes, the repo is checked again.

The refresh steps:

1. **Start from the cache.** When a workspace opens, `storage` loads the last-known state of every repo from SQLite. The UI shows it at once, with a small "updating" mark per row (PERF-02). No `git` runs before the window is visible.
2. **Watch.** For each repo, `notify` watches the Git folder (HEAD, index, refs, packed-refs, `MERGE_HEAD`, `rebase-merge`, `rebase-apply`, `CHERRY_PICK_HEAD`, `FETCH_HEAD`) and the worktree. The Git folder is found from the repo's `.git` entry without running Git: a folder, or a `gitdir:` file for linked worktrees. Worktree events are filtered against the ignore rules, and changes inside `.git/objects` are ignored.
3. **Debounce.** `notify-debouncer-full` collapses bursts, then events are combined into at most one refresh per repo every 150 ms or so.
4. **Other triggers.** The window regaining focus refreshes all repos (DASH-04). A job finishing in a repo refreshes that repo at once, skipping the debounce (PERF-04). The optional background fetch timer is off by default.
5. **One refresh at a time per repo.** If events arrive while a refresh runs, one follow-up refresh is queued. They never pile up.
6. **Read.** A refresh runs, through the read pool:
   - `git status --porcelain=v2 --branch -z`: branch, upstream, ahead/behind upstream, and staged, changed, untracked and conflicted entries
   - `git rev-list --left-right --count` against the repo's base branch (`dev` or its override, CFG-02)
   - stash count
   - checks for the in-progress operation files listed in step 2

   Line counts per file (`git diff --numstat -z --no-ext-diff --no-textconv`, with and without `--cached`) are only read while a line-count subscription is open, that is, while the Changes screen is visible (§5 rule 8), because they cost more (CHG-02, PERF-08). `--no-ext-diff` and `--no-textconv` make sure no external program runs (GS-09). Branch lists from `for-each-ref` are read when a branch picker opens.
7. **Parse.** Pure parsers turn the `-z` output into the repo status model. They are tested with snapshots and fuzzed with `cargo-fuzz`, because Git's output is input we don't control.
8. **Delta.** The new model is compared with the previous one. If nothing changed, nothing is sent. Otherwise the revision goes up and a delta event is queued (§5).
9. **Write the cache.** The new state is written to the SQLite cache in the background, at most once every few seconds per repo, so the next start shows something close to the truth.

**Idle means idle.** With no file changes and no focus changes, GitHeddle runs no `git` commands, and no core thread wakes up (PERF-07).

**Watcher limits.** On Linux, inotify has a per-user watch limit, and big worktrees (such as ones with `node_modules`) can reach it. If watching a worktree fails, GitHeddle watches only that repo's Git folder, keeps refreshing on focus, and shows a one-line note with how to raise the limit. It never falls back to polling.

## 8. Diff and merge data flow (`diff-engine`)

**Diff for the Changes screen and the diff view (CHG-04):**

1. The UI asks for the diff of one file in one repo: staged (HEAD → index) or unstaged (index → worktree).
2. `git-runner` reads the old side through the repo's cat-file session (`HEAD:path` or `:path`). `platform` reads the worktree file from disk.
3. `platform` detects binary content (a NUL byte in the first 8 KB), encoding and the line-ending style. Binary files and files over a size cap (proposed 5 MB) get a summary instead of a diff.
4. `diff-engine` runs a histogram line diff (`imara-diff`), then a word diff (`similar`) for each pair of changed lines. Word diffs are computed first for the hunks on screen.
5. The result is hunks with line ranges in both sides plus changed character ranges. The text of each side is sent once, and the hunks refer to line numbers. The UI's CodeMirror 6 view turns them into decorations and handles syntax highlighting itself, loading language packs only when needed.
6. **One diff engine, whatever the view.** M1-02 checks whether `@codemirror/merge` accepts these chunks computed in Rust. If it does, the diff view uses it. If it doesn't, both diff modes are drawn on the shared aligned-panes layer the merge editor uses. Either way, there is never a second diff engine in JavaScript, so the diff view, the Changes counts and the merge editor always agree.

**Merge editor (CONF-03..09):**

1. `git ls-files -u -z` gives the blob ids of stage 1 (base), stage 2 and stage 3 for each conflicted file. Which stage goes to which pane depends on the operation in progress:

   | Operation | Current pane (right) | Incoming pane (left) |
   |---|---|---|
   | Merge | Stage 2: HEAD, the branch you are on | Stage 3: `MERGE_HEAD`, the branch being merged in |
   | Rebase | Stage 2: the commit being built on (the branch you are rebasing onto, plus the commits already replayed) | Stage 3: your commit being replayed |
   | Cherry-pick | Stage 2: HEAD | Stage 3: the commit being picked |

   The core sends the real branch name or the short commit id and subject for each pane title (CONF-03). For a rebase, the titles say which side is yours, because "current" there isn't your branch.
2. The three blobs are read through the cat-file session. The worktree file is read too, because it contains the conflict markers Git wrote.
3. `diff-engine` builds the merge model from both sources:
   - **Conflict regions come from Git's own markers** in the worktree file, so the number and place of conflicts match exactly what Git decided (CONF-05, PRD §10 "matches what Git would do"). The parser supports the `merge`, `diff3` and `zdiff3` conflict styles, whichever the user's `merge.conflictStyle` sets.
   - **The full Incoming and Current pane texts come from stages 3 and 2.** The base comes from stage 1, ready for the Base view (CONF-12).
   - **Changes outside the conflicts are already in the worktree text.** The core sends Result as the worktree text with **each conflict range left empty**, plus the region list. The UI draws an "unresolved" placeholder in each empty range, so conflict markers can never be saved by accident.
   - `git merge-file` is used only as a test oracle for this model, never at run time.
4. **Alignment data:** for each chunk (unchanged, applied automatically, or conflict), the line ranges in Incoming, Current and Result, and how many spacer lines each pane needs so matching lines line up and the panes scroll together (CONF-06). Each conflict has a stable id, used for the checkboxes, Next/Previous and the "Conflict 2 of 6" counter (CONF-04, CONF-07).
5. The UI shows three CodeMirror views. Ticking a checkbox becomes an editor change that fills that conflict's range in Result. CodeMirror's position mapping keeps the ranges right when the user also edits by hand. The order of ticks is kept per conflict (CONF-04).
6. **Accept merge (CONF-09):** the UI sends the final Result text to the "resolve file" operation in `pipeline`. It runs the marker scan (CONF-11) and refuses if markers remain. Otherwise it writes the file atomically with the original line endings and encoding, runs `git add -- <path>`, and the UI moves on to the next conflicted file.
7. **Special cases** (no markers in the worktree: delete/modify conflicts, binary files, submodules): the model has one whole-file conflict that offers only take current or take incoming (CONF-02, CONF-08).

How the owner checks it: the fixture repos in `tests/fixtures` include conflicts in each conflict style. Snapshot tests show the merge model for each one, and a Playwright test opens the merge editor on them with mocked IPC.

## 9. Pipeline state machine and crash-safe journal (`pipeline`)

Bulk actions and pipelines share one engine. A bulk action (BULK-01) is treated as a run with one step, so it gets the same preview, result grid, journal and crash recovery as a pipeline (PRD §9 Reliability).

**A run** stores a copy of the pipeline definition as it was when the run started, the target repos, each repo's resolved variables (`{current}`, `{base}`, `{task}`, PIPE-04), the confirmations given in the preview (protected-branch pushes, force with lease, SAFE-01/02, PIPE-05), and the setting for returning to the start branch (PIPE-06).

**Per-repo states:**

| State | Meaning | Cell shown (PIPE-08) |
|---|---|---|
| Waiting | Not started yet, or waiting for a free slot | ○ |
| Running (step *n*) | A step is running | spinner |
| Paused (step *n*, reason) | Stopped at a step because of a conflict, a failure, a Wait for confirmation step, or a crash | ⏸ |
| Done | All steps finished | ✓ per step |
| Failed (step *n*) | A step failed and "stop this repo if the step fails" is on | ✗ |
| Stopped | The user chose Stop | the steps that ran keep their marks, the rest show – |

Steps that were skipped because there was nothing to do (PIPE-11) show –.

**Transitions:**

1. Waiting → Running when a slot is free. First, a preflight re-reads the repo's state and applies the safety checks: dirty tree, already in a merge or rebase, protected branch, diverged (SAFE-06, SAFE-07). A preflight that blocks moves the repo to Paused with the reason.
2. Running → next step, Done, Paused (conflict or failure) or Failed, depending on the step's result.
3. Paused → Running on **Resume** (the same step runs again, after a fresh preflight), on **Skip step** (the next step), or Stopped on **Stop**, which offers undo where it is safe (BULK-09, P1).
4. A **Wait for confirmation** step works as a barrier: every repo that reaches it pauses there, and one Continue releases them all.
5. After the last step, if return to start branch is on, a final step switches each repo back to the branch it started on (PIPE-06).

**Journal (in SQLite, written ahead):**

1. Before a step runs, a "step started" row is committed with the repo's branch and HEAD at that moment (needed for undo, BULK-09). The database uses WAL with `synchronous=FULL`, so the row is on disk before `git` starts.
2. The Git command runs.
3. A "step finished" row is committed with the outcome, exit code and a pointer to the activity records.
4. Run and repo state changes are written the same way. Rows are only added, never changed, so the latest row is always the truth.

**Reconciliation on restart:**

1. On start, the core looks for runs that have a "step started" row with no "step finished" row, or repos that are neither Done, Failed nor Stopped.
2. For each such repo it re-reads the live state:
   - **A merge, rebase or cherry-pick in progress:** the repo becomes Paused with the reason "conflicts".
   - **The step's effect is clearly complete:** for example, for push the remote branch now points at the expected commit, and for switch branch HEAD is on the target. The step is recorded as done, marked "confirmed after restart", and the repo stays paused at the next step.
   - **Anything else:** Paused with the reason "interrupted: check this repo".
3. **A write step is never re-run on its own after a crash.** The user decides with Resume, Skip step or Stop.
4. The app shows a recovery notice listing the affected repos and their states (PRD §9 Reliability). Paused runs then appear on the run screen as usual (PIPE-07).

How the owner checks it: a test in `tests/` kills the app process in the middle of a pipeline on fixture repos, starts it again, and checks the recovery list. The owner can also do this by hand: start "Update from main" on three repos and end the process from Task Manager or Activity Monitor.

## 10. Storage layout per OS (`storage`)

**Names.** The visible app and folder name is `GitHeddle`. The bundle identifier is `net.devtaosif.githeddle` (assumption: derived from the `dev-taosif-net` GitHub account; confirm at M0-01, because changing it later moves the data folders). The data folders use the readable name `GitHeddle`, set explicitly rather than taken from the identifier.

| What | Windows | macOS | Linux |
|---|---|---|---|
| Settings, workspaces (with groups, tasks, pipelines, per-repo overrides), window and layout state: JSON | `%APPDATA%\GitHeddle\` | `~/Library/Application Support/GitHeddle/` | `$XDG_CONFIG_HOME/GitHeddle/` (default `~/.config/GitHeddle/`) |
| `state.db` (SQLite: repo-state cache, pipeline journal, activity log, cached pull request status) | `%LOCALAPPDATA%\GitHeddle\` | `~/Library/Application Support/GitHeddle/` | `$XDG_DATA_HOME/GitHeddle/` (default `~/.local/share/GitHeddle/`) |
| Diagnostic log (rotating) | `%LOCALAPPDATA%\GitHeddle\logs\` | `~/Library/Logs/GitHeddle/` | `$XDG_STATE_HOME/GitHeddle/logs/` (default `~/.local/state/…`) |
| GitHub token | Windows Credential Manager | macOS Keychain | Secret Service (if missing: kept in memory for the session only, never written to disk) |
| Repo trust decisions (`trust.json`: repo path + config hash, §7) | `%APPDATA%\GitHeddle\` | `~/Library/Application Support/GitHeddle/` | `$XDG_CONFIG_HOME/GitHeddle/` |
| Webview data (the engine's own cache and storage; GitHeddle keeps no state there) | `%LOCALAPPDATA%\GitHeddle\WebView2\` (WebView2 user-data folder, set by the shell) | `~/Library/WebKit/net.devtaosif.githeddle/` and `~/Library/Caches/net.devtaosif.githeddle/` (chosen by WKWebView) | `$XDG_DATA_HOME/net.devtaosif.githeddle/` and `$XDG_CACHE_HOME/net.devtaosif.githeddle/` (chosen by WebKitGTK) |
| Single-instance lock | Handled by `tauri-plugin-single-instance` (§3) | same | same |
| Team file | `.githeddle.json` in the workspace root (CFG-03) | same | same |

Rules:

1. Every JSON document has a `schemaVersion` and is migrated forward when loaded. A file from a newer version is opened read-only, with a warning.
2. JSON is written atomically: write a temp file in the same folder, fsync it, then rename it over the old one. A crash leaves either the old file or the new one, never half of one.
3. The SQLite schema version lives in `user_version`. Migrations run in a transaction on start.
4. `state.db` holds only things that can be rebuilt or are history. If it is corrupt, it is renamed aside and recreated, and settings are not affected. The only real loss is the journal, so the app says so.
5. Retention (proposed): activity log 30 days or 50 MB, whichever comes first. Finished runs are kept for run history (PIPE-14, P1).

## 11. GitHub provider interface (`github`)

The `HostingProvider` trait is the only way the rest of the app talks to a hosting service (PRD §10). In prose, it offers:

- **Recognise:** given a repo's remote URL, say whether this provider handles it, and give the owner and repo name.
- **Sign in:** start the OAuth device flow and return the code to show, poll until approved, accept a personal access token instead, check the token and return the login, then sign out (PR-01). The device flow is written by hand on top of `reqwest`. The token goes straight into the keychain through `platform`.
- **Create a pull request** with title, body, draft flag, reviewers, assignees and labels (PR-02). Look up an existing pull request for a branch, so it is never created twice.
- **Update a pull request:** title, body, reviewers, labels, draft or ready, close (PR-03, PR-07).
- **Batched status:** for many pull requests in one GraphQL request, get state, checks, review state, mergeability and comment count (PR-05). This uses `graphql_client` typed queries with one alias per pull request.
- **List** pull requests created by me or with review requested from me (PR-06).
- **Merge** with a chosen method (PR-08), and read the repo's pull request template (PR-04).
- **Capabilities:** what this host supports (draft pull requests, merge methods, batched status), so the UI hides what doesn't apply.

Details:

- **Related pull requests (PR-03):** the section in each body is placed between two fixed hidden HTML-comment markers. Updates replace only that section and leave the rest of the body as the user wrote it.
- **Rate limits (PRD §13):** the client reads GitHub's rate-limit headers and backs off before the limit. Status is cached in `state.db` and refreshed when a pull request screen is visible, on demand, and after GitHeddle's own actions. There is no constant polling. REST reads use ETags.
- **Base URL:** github.com in v0.1 (PRD §14 Q1). The API base URL is a setting, so GitHub Enterprise can be added without changing the design.
- **Errors** are mapped to provider error kinds: not signed in, token expired, no permission, not found, rate limited, validation failed (with GitHub's message), network. The UI turns each kind into a message as described in §13.

## 12. Platform layer (`platform`)

All the differences from PLAT-03 and PRD §13 are handled here and nowhere else:

| Topic | Approach |
|---|---|
| Finding `git` | Look on PATH (and the usual install places on each OS). Resolve the absolute path once and check the version (2.30 or newer). If it is missing or too old, return an error that explains how to install Git on this OS (PRD §9 Compatibility). |
| PATH on macOS | Apps opened from Finder don't get the shell's PATH. Read it once from the user's login shell, with a timeout, so Homebrew `git`, credential helpers and hooks can be found. |
| Process flags | `CREATE_NO_WINDOW` on Windows. Job Object or process group setup. Environment variables from §6. |
| Paths | Convert between OS paths and Git's forward-slash paths. Support long paths on Windows. |
| Case sensitivity | Detected **per volume**, not assumed per OS. Windows folders can be case-sensitive, macOS volumes can be formatted case-sensitive, and Linux can mount case-insensitive drives. The result decides how paths are compared, so a repo found twice is shown once and case-only renames are shown correctly. |
| Line endings and encoding | Detect LF or CRLF and keep it when writing a file (merge editor). Detect a UTF-8 BOM and UTF-16. Never change a file's line endings by itself; Git's `core.autocrlf` stays in charge. |
| Keychain | Wrap `keyring`: store, read and delete the token. Report clearly when Secret Service is missing on Linux. |
| Launcher module | The only place outside `git-runner` that starts a process (§4 rule 1). It opens the editor (default `code`), the terminal (Windows Terminal or `cmd`, Terminal.app, the desktop's default terminal on Linux) and the file manager, each configurable (DASH-06, CFG-01). It uses argument lists, and Rust's batch-file escaping for `.cmd` launchers such as `code.cmd`. A path that can't be passed safely is refused with a clear message (GS-11). It also runs the login-shell PATH discovery and `git --version`. |
| Opening links | A strict allow-list: `https://github.com/…`, and a configured GitHub Enterprise host when one is set. Any other URL is never opened directly. The UI shows it in full with a Copy button (UN-04). |
| Theme | Read the system theme (light, dark, high contrast) and report changes, so the shell can send them to the UI (§3, PLAT-06). |
| Shortcuts | Tell the UI which OS it runs on, so it can use Ctrl or ⌘ (PLAT-05). |

Every function in this crate has tests that run on all three OSes in CI (PRD §13, PLAT-04).

## 13. Error model and user-facing errors

1. **Inside crates:** each library crate has its own `thiserror` error enum. `anyhow` is used only in the shell, for start-up glue.
2. **Classifying Git errors:** `git-runner` maps the exit code and known stderr patterns to a stable error code, for example dirty worktree on pull, non-fast-forward push, authentication failed, `index.lock` exists, branch already exists, merge conflict, hook rejected. Anything it doesn't know becomes "git failed" with the raw message. A missed pattern can only make a message less specific, never wrong. **Classification only chooses the message.** It never changes what GitHeddle believes about a repo's state, which always comes from machine formats read fresh from Git (GS-12).
3. **Across IPC:** one `UserError` shape, made of **a code and parameters**, with no ready-made sentences:
   - a stable `code` (for example `git.pull.dirty_worktree`)
   - parameters for the message (for example the repo name, the branch, the number of files)
   - the repo and step
   - whether Retry makes sense
   - the action buttons that apply (Retry failed, Open terminal, Show log, BULK-05)
   - the technical detail: arguments, exit code, stderr
4. **Message text** lives only in the UI's `copy/` catalogue, keyed by `code`. It turns code and parameters into the summary and the next action (UX-04), for example "Pull stopped: app-front has local changes. Stash them or commit first." The detail is one click away. This keeps wording consistent and makes a Bangla UI possible later (PRD §14 Q7).
5. **Never hidden:** every failed job shows up in the result summary (BULK-05) and in the activity log. Nothing is retried on its own, except reads, which are retried once if `index.lock` is busy.
6. **`index.lock`:** never removed automatically. If a lock stays, the app explains what it is and the risk of removing it. It offers to remove it only when no `git` process is running in that repo, and only after explicit confirmation.
7. **Panics:** a panic hook writes the panic to the diagnostic log, and the app keeps running if the panic was in a job. A command that panics returns an "internal error" `UserError`, and the UI never sees a raw panic.

## 14. Logging and activity log

| Stream | Content | Where | For |
|---|---|---|---|
| **Activity log** | One record per Git command: time, repo, arguments, working folder, exit code, duration, the job or run it belongs to, and stdout and stderr (each cut to 64 KB) | `state.db`, shown in the Activity log screen with filters by repo, run and result | The user (BULK-08, PRD §9 Transparency) |
| **Diagnostic log** | Structured `tracing` events: start-up timings, refresh timings, watcher errors, IPC errors, panics | Rotating files (§10), 5 files × 10 MB (proposed) | The owner and bug reports |

Redaction rules for both: user info in remote URLs (`https://user:token@…`) is removed, `Authorization` headers and tokens are never logged, and file contents are never logged. The diagnostic log records timings for each PERF target (start to first paint, dashboard live, diff open), so the performance jobs and bug reports can use the same numbers.

## 15. Performance budget

| ID | Target | How it is met | Checked by |
|---|---|---|---|
| PERF-01 | Usable window in under 1 s (2 s cold) | Native Rust start. Small first JS bundle; CodeMirror and the merge editor load on first use. No `git` and no network before first paint. The first screen is drawn from `state.db`. Rough budget: process and webview about 400 ms, JS about 150 ms, cache read and render about 100 ms. | `tools/perf` start-time job on all 3 OSes |
| PERF-02 | Cached state at once; 10 repos live in 1 s, 30 in 2 s | Cache first (§7 step 1). Read pool of 8. About 3 `git` processes per repo. If spawn cost on Windows misses the target at M1, adopt `gix` for read paths only (§18). | Perf job with 30 fixture repos |
| PERF-03 | Response within 100 ms | Commands return at once (§5). Event batching per frame. All work off the main thread. The UI shows pending states straight away. | Playwright timing tests; M1 list spike |
| PERF-04 | Repo row updated within 300 ms after a Git operation | A finished job triggers a direct refresh of that repo, skipping the debounce (§7 step 4). | Integration test timing |
| PERF-05 | Never blocks | tokio and the blocking pool for all Git, disk and network work. Separate read pool. The Tauri main thread only dispatches. | Test that browses while a 30-repo push runs |
| PERF-06 | Diff of 10k lines in 300 ms; merge editor in 500 ms | Blobs come from the cat-file session (no new process). Diffing in Rust takes a few ms. Text is sent once, as plain data. Word diff runs for the visible hunks first. Larger files go in windows (§5 rule 4). The budget includes the cost of the Tauri isolation pattern, which checks every IPC message. M1 measures it with the production security settings on (CSP, isolation, devtools off). | `criterion` benchmarks + M1 spike |
| PERF-07 | Under 250 MB RAM with 30 repos; idle CPU near zero | The 250 MB counts **the GitHeddle process plus all its webview processes** (WebView2 and WebKit run the page in helper processes), but not `git` children. Small Rust core. Compact state model. File texts are dropped when a view closes. cat-file sessions close when idle. No polling; watchers only. Background fetch off by default. | RAM job with 30 fixture repos, summing the process tree; idle-CPU sample |
| PERF-08 | 5,000 changed files scroll smoothly | TanStack Virtual. Flat rows sent once, then deltas. Line counts read only while the screen is visible. | M1 list spike on all 3 webviews |
| PERF-09 | Installer under 60 MB | Tauri uses the system webview, so no browser is bundled. WebView2 comes from the evergreen bootstrapper. Few dependencies, checked by `cargo-deny`. **AppImage caveat:** the AppImage bundles WebKitGTK and its libraries. M1 measures every installer. If the AppImage is still over 60 MB after stripping the bundled libraries, the ADR records it as a known PERF-09 exception for the AppImage only. The `.exe`, `.dmg`, `.deb` and `.rpm` must still be under 60 MB. | Installer-size job in CI (warning at 50 MB) |

How CI checks these (PRD §13): every pull request runs the `criterion` benchmarks against `main` and fails on a slowdown over 10 %. The full budgets above (start, RAM, dashboard timing, size) run every night and at every release, and can be started on a pull request with the `perf` label. See [Test strategy](../engineering/test-strategy.en.md) and [Build and release](../engineering/build-and-release.en.md) for how the jobs run and their thresholds.

## 16. Extension points

| Extension | How it is added | What doesn't change |
|---|---|---|
| GitLab, Azure DevOps (v0.3+) | A new implementation of `HostingProvider` in its own module or crate, chosen for each repo from the remote URL's host, plus a host mapping in settings for self-hosted servers. The UI always says "pull request", whatever the host calls it. | `pipeline`, the UI screens, storage |
| New pipeline step types (PIPE-15) | Add an entry to the step catalogue in `pipeline`, with its preview, preflight, run and reconciliation rules. The state machine and journal stay the same. | Run screen, journal, job runner |
| New bulk operations (BULK-02) | An entry in the operation catalogue, which becomes a one-step run. | Same as above |
| `gix` read paths (M1 contingency) | Behind the same `repo-state` read functions, so callers don't change. Writes always stay on the CLI. | Everything above `repo-state` |
| UI language (PRD §14 Q7) | The error and message catalogue keyed by code (§13). | Core crates |
| Editor, terminal and merge tool | Launch settings resolved by `platform`. | Everything else |

## 17. Architecture risks

| Risk | Effect | Mitigation |
|---|---|---|
| WebKitGTK or WKWebView is slower or behaves differently from WebView2 | PERF-03, PERF-06 or PERF-08 missed on Linux or macOS | The M1 spike measures each webview. Virtualise everything, use simple CSS, and test in WebKit with Playwright. The fallback is Electron, which keeps the React UI. |
| Starting a process costs more on Windows | PERF-02 missed with 30 repos | Few commands per refresh, the read pool, cat-file sessions. `gix` for reads if the M1 gate says so. |
| Git output differs between 2.30 and the latest version | Parsing bugs on some machines | Use only porcelain v2 and `-z` formats. CI matrix with git 2.30 and the latest. Fuzzed parsers. |
| Git messages in other languages, or new wording | Error classification falls back to "git failed" | Classify by exit code and stable patterns first. The raw message is always shown, so the user can still act. Tests run under a non-English locale too. |
| Too many watchers, or noisy ones in big worktrees | Missed refreshes on Linux, or CPU use | Ignore filtering, fall back to watching only the Git folder, focus refresh. Never poll (§7). |
| A crash during a write | The repo state is unclear | Write-ahead journal, reconciliation, never re-run a write on its own (§9). |
| The user works in the same repo at the same time (VS Code, terminal) | `index.lock` conflicts, a stale preview | Preflight re-reads the state right before each step (SAFE-07). An `index.lock` is never removed automatically. The app reports it and offers Retry, and offers removal only as described in §13 rule 6. |
| A repo's own config runs programs during background reads (`core.fsmonitor`, drivers) | Code runs without the user knowing | The trust check before any background command, enforced by the command guard (§6, §7, GS-08). |
| Credential prompts hang | Jobs hang | `GIT_TERMINAL_PROMPT=0`, stdin null, network watchdog. |
| Large IPC payloads | Slow diffs, memory spikes in the webview | Paging and channels above about 1 MB, text sent once (§5). |
| AI-written code crosses layer boundaries | Logic leaks into the shell or UI, and tests get harder | The CI rules in §4, a thin-shell rule, and review against this document. |

## 18. Decision log

The full stack decision, with the vote record, is in [ADR 0001: tech stack](../decisions/0001-tech-stack.en.md). The architecture decisions this document depends on:

| # | Decision | Reason | Status |
|---|---|---|---|
| D-01 | Tauri 2: Rust core + React/TypeScript UI. Fallback: Electron | Best fit for PERF-01/07/09. Unanimous vote. | Decided; confirmed at the M1 gate |
| D-02 | The `git` CLI for all reads and writes in v0.1 | Behaves exactly like the terminal (SAFE-05). One code path. | Decided; `gix` for reads only if the M1 gate shows PERF-02 missed on Windows |
| D-03 | Thin `reqwest` + `graphql_client` client instead of octocrab | Smaller dependency tree, and we only need a few calls | Decided |
| D-04 | SQLite for the cache, journal and activity log; atomic JSON for settings and workspaces | Crash-safe transactions where they matter. Files people can read and diff where they matter. | Decided |
| D-05 | CodeMirror 6; `@codemirror/merge` for the diff view only if it accepts chunks computed in Rust, otherwise the shared aligned-panes layer. Monaco rejected | Lighter (PERF-07), three views can be controlled precisely, and there is never a second diff engine in JavaScript | Decided; the `@codemirror/merge` part is checked at M1-02 |
| D-06 | Merge editor conflicts come from Git's worktree markers; pane texts come from index stages 1/2/3, mapped per operation (§8); Result is sent with conflict ranges empty; `git merge-file` is a test oracle only | Result always matches what Git decided (§10 of the PRD) | Decided (review ruling) |
| D-07 | A bulk action runs as a one-step journaled run | One engine, the same crash recovery for everything (PRD §9 Reliability) | Decided (review ruling); the minimal engine lands at M5-01 |
| D-08 | A read pool separate from the BULK-04 parallel limit | The dashboard stays live during long bulk actions (PERF-05) | Decided (review ruling); lands at M2-03 |
| D-09 | One app instance per user (`tauri-plugin-single-instance`) | `state.db`, the journal and the updater assume a single owner | Decided (review ruling) |
| D-10 | A central command guard in `git-runner`, plus a repo trust check that blocks every `git` command in an untrusted repo | Safety rules hold even if a caller has a bug (GS-07, GS-08) | Decided (review ruling) |
| D-11 | `UserError` is code + parameters; all wording lives in the UI catalogue | One place for wording; ready for a Bangla UI | Decided (review ruling) |

## 19. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 3 November 2026 | First draft, from the Phase 2 decision brief. Review rulings applied: single instance and shell duties (§3), command guard and launcher rule (§4, §6), repo trust check (§7), stage-to-pane mapping and empty conflict ranges (§8), names and webview data folders (§10), per-volume case sensitivity and strict link allow-list (§12), code + parameters errors and the `index.lock` rule (§13), AppImage caveat and CI checking (§15), D-09 to D-11 (§18). |
