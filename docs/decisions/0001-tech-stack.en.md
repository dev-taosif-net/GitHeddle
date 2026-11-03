# ADR 0001 — Technology stack

**Bangla version:** [0001-tech-stack.bn.md](0001-tech-stack.bn.md)

| | |
|---|---|
| **Document** | Architecture Decision Record (ADR) 0001 |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Accepted, subject to the M1 go/no-go gate (§6) |

**Related documents:** [PRD](../product/PRD.en.md) · [Architecture](../architecture/architecture.en.md) · [UI architecture](../design/ui-architecture.en.md) · [Build and release](../engineering/build-and-release.en.md) · [Test strategy](../engineering/test-strategy.en.md) · [Security](../engineering/security.en.md) · [AI development workflow](../process/ai-development-workflow.en.md) · [Roadmap](../plan/roadmap.en.md)

> This file and its Bangla version carry the same content. When one changes, update the other in the same commit.

---

## 1. Context

PRD question 9 left the technology open. GitHeddle must:

- run the same way on Windows, macOS and Linux (PLAT-01..05);
- start in under 1 second, use under 250 MB with 30 repos, and ship an installer under 60 MB (PERF-01, PERF-07, PERF-09);
- show a VS Code–style Changes screen with up to 5,000 files, diffs, and a three-pane merge editor (CHG-01..06, CONF-03..07, PERF-06, PERF-08);
- run the user's own `git` safely, in parallel, with cancellation and crash-safe pipelines (SAFE-01..07, BULK-04, PIPE-07).

Two rules from the owner shaped how the decision was made:

1. **Choose what is best for the product.** What the owner already works with (C# / .NET) carries no weight. The PRD's earlier remark about this is withdrawn.
2. **The whole app is built by vibe coding with Claude Code.** AI writes nearly all of the code, and the owner steers, reviews and tests. So the stack is also judged on how reliably an AI agent can write, test and maintain correct code in it.

## 2. How the decision was made

A panel of five agents, each with its own focus, evaluated the options independently, without seeing each other's work, and cast a ranked vote (1st = 3 points, 2nd = 2, 3rd = 1):

| Agent | Focus |
|---|---|
| Agent 1 | Systems and performance |
| Agent 2 | Cross-platform builds and releases |
| Agent 3 | UX and frontend |
| Agent 4 | AI-assisted development |
| Agent 5 | Git correctness, security and quality |

The panel considered Tauri 2, Electron, Avalonia, Wails, Flutter desktop, Qt/QML, Slint, native Rust GUIs (egui, iced, GPUI-style) and .NET MAUI.

## 3. Vote

| Stack | Agent 1 | Agent 2 | Agent 3 | Agent 4 | Agent 5 | **Total** |
|---|---|---|---|---|---|---|
| **Tauri 2** (Rust core + React/TypeScript UI) | 3 | 3 | 3 | 3 | 3 | **15** |
| Electron (Node + TypeScript) | 2 | 2 | 2 | 0 | 1 | 7 |
| Avalonia (.NET) | 1 | 1 | 1 | 2 | 2 | 7 |
| Wails v3 (Go + web UI) | 0 | 0 | 0 | 1 | 0 | 1 |

All five agents put Tauri 2 first.

Why the others were ruled out:

- **Flutter, Slint, egui/iced:** no mature code-editor or merge-view component, and weak accessibility.
- **Qt/QML:** C++ code written by AI risks memory-safety bugs that a non-expert can't spot.
- **.NET MAUI:** no Linux support.

## 4. Decision

**GitHeddle is built with Tauri 2: a Rust core and a React + TypeScript UI.**

Why:

- **Meets the hard requirements comfortably.** The Windows and macOS installers and the `.deb` are roughly 10–15 MB, because they use the system's webview instead of bundling a browser. The Linux AppImage is the exception: it bundles WebKitGTK and may be much larger (§6). Memory stays low because the heavy work runs in Rust (PERF-07, PERF-09). The Tauri bundler produces every package PLAT-02 and PLAT-09 ask for.
- **Two automatic safety nets for AI-written code.** Rust's compiler and Clippy catch whole classes of bugs before anything runs: unhandled states, ignored errors, data races. Strict TypeScript catches UI mistakes. `tauri-specta` generates the UI's types from the Rust commands, so a mismatch between the two sides fails to compile.
- **The hardest UI already exists on the web.** CodeMirror 6 renders the diffs and the merge editor's panes. Whether its merge extension can display hunks computed in Rust is checked at M1 (§6). TanStack Virtual handles the 5,000-file list, React Aria provides accessible controls, and cmdk provides the command palette.
- **Testable without a person clicking.** The Rust core is tested with `cargo test` against real fixture repos on all three systems. The UI is tested in a headless browser with the core mocked.
- **Fits the design in PRD §10.** The PRD already describes a job runner off the UI thread, a shared diff engine and a pipeline state machine that can resume. All of that is pure logic that suits Rust.

### 4.1 Main sub-choices

| Area | Choice | Why |
|---|---|---|
| UI framework | React 19 + TypeScript (strict) + Vite | Deepest AI training data, and the strictest type checking |
| State | Zustand + TanStack Query | Small and explicit; selectors keep big lists cheap |
| Styling | Tailwind CSS v4 over design tokens | Themes are a token swap; easy for AI to write consistently |
| Accessible controls | React Aria Components, cmdk | Complete keyboard and screen-reader support (UX-05, UX-08) |
| Editor and merge view | CodeMirror 6 + `@codemirror/merge` | Light, handles large files; Monaco is heavier and has no three-way merge |
| Diff engine | `imara-diff` + `similar` in Rust | One engine for every screen (PRD §10) |
| Git access | The user's `git` CLI for reads and writes in v0.1 | Behaviour, hooks and credentials match the terminal (SAFE-05) |
| Process control | Own `GitRunner` with `process-wrap` | Cancel and app exit never leave orphan `git` processes |
| GitHub | Thin `reqwest` client + typed GraphQL queries | Small dependency tree; pull request status fetched in batches |
| Keychain | `keyring` crate | Credential Manager, Keychain and Secret Service (§9) |
| Storage | SQLite (WAL) for cache, pipeline journal and log; JSON for settings | Crash-safe runs (PIPE-07); settings stay readable |
| Tests | nextest, insta, proptest; Vitest; Playwright in Chromium and WebKit; tauri-driver | Every layer testable in CI on all three systems |
| Builds | GitHub Actions only | Nothing heavy runs on the owner's machine |

The full list, with security and release settings, is in the [architecture](../architecture/architecture.en.md) and [build and release](../engineering/build-and-release.en.md) documents.

### 4.2 Disagreements and how they were settled

| Question | Positions | Settled as |
|---|---|---|
| Read Git state with `gix` (gitoxide) in-process, or only with the `git` CLI? | Agent 1: `gix` for fast reads, because starting processes is slow on Windows. Agents 4 and 5: CLI only, so behaviour always matches `git`. | CLI only in v0.1. `gix` is adopted for read paths only if the M1 benchmark shows PERF-02 is missed on Windows. |
| GitHub client: `octocrab` or a thin client? | Agent 1: octocrab. Agent 5: thin client. | Thin `reqwest` client, which means fewer dependencies to audit. |
| Second choice: Electron or Avalonia (tied at 7)? | Agents 1–3: Electron. Agents 4–5: Avalonia. | **Electron is the fallback**, because the React UI carries over unchanged and only the backend adapter would be rewritten. |

## 5. Consequences

**Good:**

- Small, fast app.
- Strong compile-time checks for AI-written code.
- Mature editor components.
- One Rust core that can be tested headless.

**Costs, and what we do about them:**

| Cost | Mitigation |
|---|---|
| Each system has a different webview (WebView2, WKWebView, WebKitGTK), and WebKitGTK on Linux is the weakest | Use only web features that all three engines support. Run UI tests in WebKit as well as Chromium. Run performance jobs on all three systems in CI. Electron stays as the fallback. |
| Rust builds are slow and the borrow checker pushes AI code towards hacks | Small crates, `cargo check` while iterating, sccache in CI, and Clippy rules that deny `unwrap` and forbid `unsafe` code. |
| AI agents may mix up Tauri v1 and v2 APIs | Pin versions, put the v2 patterns in the code `CLAUDE.md`, generate typed bindings, and keep one template command that every new feature copies. |
| `tauri-driver` can't drive the macOS webview | Most UI tests run headless with the core mocked. A short manual macOS check runs before each release (PLAT-04). |
| The owner doesn't read Rust | Acceptance criteria, CI checks and demo flows for each work item ([AI development workflow](../process/ai-development-workflow.en.md)). |
| The webview shows untrusted text (commit messages, branch names, pull request bodies) and talks to a privileged core over IPC | A strict CSP, Tauri's isolation pattern, a capability allow-list with only our own commands, and no remote content ([security](../engineering/security.en.md)). |
| Tailwind CSS v4 needs Safari 16.4, so the macOS floor in practice is 13.3, not 13.0 | The first run checks the webview version and explains how to update macOS. The PRD's PLAT-01 notes the 13.3 floor. |

## 6. Go/no-go gate (milestone M1)

The decision is final only after the M1 spikes pass on the CI runners for all three systems ([roadmap](../plan/roadmap.en.md)). Every number is measured with the production security settings on (CSP, isolation pattern, devtools off), so the isolation pattern's IPC cost is included.

| Check | Target |
|---|---|
| 5,000-row virtual list | Scrolls without visible jank and responds within 100 ms (PERF-03, PERF-08) |
| 10,000-line diff / prototype three-pane merge view | Opens within 300 ms / 500 ms (PERF-06) |
| Diff rendering from Rust data | CodeMirror's merge extension can display hunks computed in Rust. If it can't, both diff modes are drawn on the aligned-panes layer that the merge editor uses. Either way there is one diff engine, in Rust. |
| Cold start | Within the PERF-01 targets |
| Memory with 30 fixture repos, webview processes included | Under 250 MB (PERF-07) |
| Installers | `.exe`, `.dmg` and `.deb` under 60 MB (PERF-09). The AppImage is measured too (see below). |
| Shell behaviour | F5 and the browser shortcuts don't reload the page; ⌘C/⌘V work on macOS; in-page drag and drop works on Windows; the theme follows the system on all three |

- **If WebKitGTK or WKWebView fails** and can't be fixed within the spike, switch to Electron.
- **If `git status` across 30 repos on Windows misses PERF-02** because starting processes is slow, adopt `gix` for read paths only.
- **If the AppImage is over 60 MB** after the bundled libraries are trimmed, record it here as a known PERF-09 exception for the AppImage only. All other installers still have to meet the limit.

## 7. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 3 November 2026 | First version: the five-agent vote, the decision, the sub-choices and the M1 gate. After the panel review: the AppImage size rule, the diff-rendering check, the shell checks and security settings in the M1 gate, and the webview-security and macOS 13.3 costs. |
