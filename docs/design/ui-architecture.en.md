# GitHeddle — UI architecture

**Bangla version:** [ui-architecture.bn.md](ui-architecture.bn.md)

| | |
|---|---|
| **Document** | UI architecture (frontend design for `apps/desktop/src`) |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. Follows ADR 0001. The parts marked "check at M1" depend on the M1 spike results |

**Related documents:** [PRD](../product/PRD.en.md) · [ADR 0001 — Technology stack](../decisions/0001-tech-stack.en.md) · [Architecture](../architecture/architecture.en.md) · [Build and release](../engineering/build-and-release.en.md) · [Test strategy](../engineering/test-strategy.en.md) · [Security](../engineering/security.en.md) · [AI development workflow](../process/ai-development-workflow.en.md) · [Roadmap](../plan/roadmap.en.md)

> This file and its Bangla version carry the same content. When one changes, update the other in the same commit.

---

## 1. Purpose and scope

This document describes how GitHeddle's user interface is built: the React app in `apps/desktop/src`, which runs inside the Tauri 2 webview. It covers folders, screens, state, how the UI talks to the Rust core, design tokens, components and the hard screens (Changes, diff view, merge editor, pipeline run grid). It also covers the keyboard, accessibility, wording, webview compatibility and performance rules.

It does not cover the Rust crates, packaging or the test plan as a whole. Those are in the architecture, build-and-release and test-strategy documents. The screen sketches are in PRD §8 and are not repeated here.

The stack is fixed by ADR 0001: React 19 with TypeScript strict and Vite, Zustand, TanStack Query, Tailwind CSS v4 over CSS custom-property design tokens, React Aria Components, cmdk, CodeMirror 6 with `@codemirror/merge`, and TanStack Virtual. Pin the latest stable version of each at M0.

## 2. Principles

1. **The core decides, the UI shows.** Git state, diffs, merge alignment, previews and safety checks are computed in Rust. The UI never parses Git output and never decides whether an action is safe (SAFE-01..07).
2. **Feedback comes first, data follows.** Every click shows a visible change before any call to the core returns (PERF-03).
3. **One pattern per problem.** One action flow (preview → run → result), one command registry, one aligned-panes editor layer and one token set. A new screen reuses them instead of inventing its own.
4. **Keyboard and screen reader are part of "done".** A component isn't finished until it works without a mouse and has a correct name and role (UX-05, UX-08).
5. **Lowest common webview.** Code only against features that WebView2, WKWebView and WebKitGTK all support (§17).
6. **Easy for an AI agent to follow.** Strict folder rules, generated types and small files, so that a Claude Code session can find the one right place for a change.

## 3. Folder structure of `apps/desktop/src`

| Folder | What lives there | Rules |
|---|---|---|
| `app/` | Entry point, `AppShell` (top bar, sidebar, centre, right panel, bottom bar), providers (query client, theme, platform info), the top-level error boundary | No screen logic |
| `screens/<screen>/` | One folder per screen in §4: its components, hooks and screen-local state | A screen never imports from another screen. Shared parts move to `components/` |
| `components/` | Shared custom components: status letter, repo badge, empty state, error message, key hint, splitter, target picker | Built on `ui/` and tokens only |
| `ui/` | Thin, styled wrappers around React Aria Components (button, checkbox, menu, dialog, table, combo box …) | The only folder that imports `react-aria-components` directly |
| `flows/` | The shared preview → run → result flow (§7) | Used by every bulk action, task action and pipeline |
| `editor/` | Everything CodeMirror: shared setup, editor themes made from tokens, lazy language loading, the aligned-panes layer, the diff view and the merge editor | The only folder that imports CodeMirror |
| `stores/` | Zustand stores (§5) | Stores hold data and actions. They don't render and don't call Tauri directly |
| `ipc/` | Generated bindings from `tauri-specta` (never edited by hand), the core facade, the event router and error mapping (§6) | The only folder that imports `@tauri-apps/api` |
| `commands/` | The command registry, keybindings, palette sources (§14) | Every user action is registered here |
| `styles/` | Token files for light and dark, the Tailwind entry, bundled fonts | The only place where colour values, sizes and fonts are defined |
| `copy/` | All user-facing text and error-message templates (§16) | Components take text from here, not literals |
| `a11y/` | Live announcer, focus helpers, the skip-to-content target | |
| `lib/` | Pure helpers: path display, platform key names, formatting numbers and times | No React, no I/O |
| `testing/` | The fake core, scenario fixtures and test helpers (§6.3) | Left out of the production bundle |

Unit and component tests sit next to the file they test. Playwright specs live where the test strategy says. A CI check rejects:

- colour literals and arbitrary Tailwind values outside `styles/`
- imports that break the rules in the table
- hand edits to the generated bindings

## 4. Screens and navigation

| Screen | PRD §8 screen | Main requirements | Notes |
|---|---|---|---|
| Repositories | Repositories (default) | DASH-01..08, GRP-03 | A React Aria table with sorting, filtering and row checkboxes (DASH-05). With 1–50 repos (scale target) it needs no virtualisation |
| Changes | Changes | CHG-01..10, BULK-06 | Virtualised list or tree plus the diff view and commit box (§10, §11) |
| Pull Requests | Pull Requests | PR-05, PR-11 (v0.1); PR-06, PR-07 (v0.2) | v0.1 shows only the active task's pull requests with their status (PR-05). The three lists (created by me, review requested, current task, PR-06) are P1 and come in v0.2 |
| Conflicts | Conflicts | CONF-01, CONF-02, CONF-10, CONF-11 | Repos in a merge or rebase, their conflicted files, Continue / Abort / Continue all |
| Merge editor | Opened from Conflicts | CONF-03..09, CONF-12 | A sub-view of Conflicts, with its own keyboard scope (§12) |
| Pipelines | Pipelines | PIPE-01..14 | List, editor, run grid and run history (§13) |
| Task | Task | TASK-01..08, PR-02, PR-03 | The task's repos, branches and pull requests, with its actions |
| Activity log | Activity log | BULK-08 | Virtualised, read-only list of commands with exit code, duration and output |
| Settings | Settings | CFG-01, CFG-02, PLAT-06 | Forms built from React Aria fields |
| First run | Flow 0 | UX-01 | Skippable steps; ends on the dashboard |

Overlays that sit on top of any screen: the command palette (§14), the action-flow dialog (§7), the right details panel and the bottom bar from PRD §8 "Main window".

**Navigation.** There is no router library and no URL bar. A small `navigation` store holds the current screen, its parameters (for example repo and file) and a back/forward history. Back and forward use Alt+Left / Alt+Right on Windows and Linux, and ⌘[ / ⌘] on macOS. The sidebar counts (Changes 8, Conflicts 1) are selectors over the stores. The last screen, the layout and the filters are saved through the core's settings storage, not in webview storage (UX-09).

## 5. State architecture

### 5.1 Stores

| Store | Holds | Fed by |
|---|---|---|
| `workspace` | Workspaces, repos by ID, groups, tasks, the active task, the current target set | Commands at start, then events |
| `repoState` | Each repo's status (branch, ahead/behind, counts, operation in progress, conflicts), with a version number per repo | Repo-state events (deltas) |
| `changes` | Each repo's changed files by section (Merge Changes, Staged, Changes), with `+/−` counts and status letters | Change-list events (deltas per repo) |
| `jobs` | Running and finished bulk actions and pipeline runs: per-repo and per-step state, progress, results | Job events |
| `ui` | Layout, pane sizes, theme choice, zoom, filters, collapsed sections, selection and focus anchors | User actions. Persisted through the core (UX-09) |
| `navigation` | The current screen, its parameters and history | User actions |

Request/response data (diff content, commit history, settings, pull request details, previews) goes through TanStack Query instead of stores. Each query is keyed by what identifies the content, for example repo + path + revision for a diff.

### 5.2 Event subscription

1. At start, `ipc/` subscribes once to every typed core event from the generated bindings and sends each one to its store. Components never subscribe to Tauri events themselves.
2. The core sends small deltas, not full snapshots. Each event carries a per-repo sequence number.
3. The event router buffers incoming deltas and applies them to the store **once per animation frame**. A burst of 30 repo updates causes one render, not 30.
4. When the window regains focus (DASH-04), the core refreshes the repos and sends ordinary deltas, so the UI does nothing special. Only when a sequence number is skipped does the router ask the core for a fresh snapshot of that repo and replace its entry.
5. At start, the stores load the last known state from the core's cache first, so the dashboard shows at once (PERF-02). Live state then replaces it.
6. Some data is only produced while a screen needs it. The Changes screen subscribes to per-file line-count updates when it opens and unsubscribes when it closes, because the core reads line counts only while that screen is visible (architecture §7).

### 5.3 Selectors and keeping 5,000 rows cheap

- Data is normalised: repos by ID, and files by a stable key (repo ID + section + path). Rows receive only a key and select their own data.
- Components select the smallest slice they need, with shallow equality. A row never selects a whole map or array.
- Derived data (the flat row list for the Changes screen, filtered lists, counts) is computed once per change of its inputs and memoised **per repo**. A change in one repo rebuilds only that repo's part.
- Store updates replace only the entries that changed, so unchanged rows keep the same object and don't re-render.
- Filtering text input uses React's deferred value, so typing stays smooth while the list catches up.
- Enable the React Compiler if it is stable for React 19 at M0 (check at M0). It adds memoisation automatically and removes a whole class of AI-written re-render bugs.

## 6. How the UI talks to the core

### 6.1 Generated bindings

- `tauri-specta` generates the TypeScript bindings for every command, event and data type into `ipc/`. If the Rust side changes and the UI isn't updated, TypeScript fails to compile, so drift can't ship.
- `ipc/` wraps the bindings in a **core facade**: named async functions grouped by area (repos, changes, diff, merge, jobs, pipelines, GitHub, settings). Screens and stores call the facade, never the bindings directly.
- Every failure comes back as one typed `UserError`: a stable code plus its parameters (the repo, the step and any values the message needs), and Git's original output as detail. The core sends no sentences. `ipc/` maps the code onto a message template in `copy/`, which owns all wording (§16, UX-04).
- Large content, such as diffs and file texts for the merge editor, is fetched on demand by its own command. It never rides on state events. Streaming output (live Git output for the activity log or a run cell) uses Tauri channels.
- The webview never gets the GitHub token and has no shell or file-system plugins (Security document). Opening a file in the editor, a terminal or the file manager is a core command.

### 6.2 Platform information

The core tells the UI the operating system, the theme the system wants, and the key names. The UI doesn't guess from the user agent. This information drives the shortcut display (PLAT-05) and the few platform-specific layout details.

### 6.3 Fake core and mocked IPC for tests

- `testing/` contains a **fake core**: an implementation of the same facade made from scenario data, wired up through Tauri's IPC mocks (`@tauri-apps/api/mocks`).
- **By default, scenarios are generated from the IPC transcripts** that the core contract tests (L3 in the test strategy) record from real fixture repos. A scenario is then the real requests, responses and events of that fixture run.
- **Allowed exceptions are scripted scenarios.** They are typed by the generated bindings and labelled "scripted" in their name and in the test report. Only three kinds are allowed:
  - timing and event-burst scripts, for example "repo app-api becomes MERGING with 3 conflicts after 200 ms", or 30 repos updating at once
  - rare errors that are hard to produce with a real repo
  - scale cases, for example 5,000 changed files
- Every scenario, recorded or scripted, is typed by the generated bindings, so one that no longer matches the core fails to compile. The starting set is:
  - an empty workspace (recorded)
  - 6 clean repos (recorded)
  - 30 repos with mixed states (recorded)
  - 5,000 changed files (scripted, scale)
  - a merge with 3 conflicted files, and the same for a rebase and a cherry-pick (recorded)
  - a pipeline run paused at a conflict (recorded)
  - offline / GitHub signed out (scripted, rare error)
  - a workspace with repos that need review (recorded, §7.1) and a changed team file (recorded, §7.2)
- Vitest component tests, Playwright tests in Chromium and WebKit (with `@axe-core/playwright` and screenshots), and the M1 performance spikes all use the same fake core.
- **How the owner checks UI work:** CI publishes the Playwright HTML report and screenshots for each scenario, in both themes and both engines, as build artifacts. The owner reviews them in the browser. Nothing needs to be built locally.

## 7. Preview → run → result: one shared flow

Every action that changes something uses the same component and hook in `flows/` (UX-03, PRD §8 "UX rules"). Read-only actions such as Fetch skip the preview (BULK-03).

1. **Start.** A command (button, shortcut or palette) starts the flow with an action kind and a target set. The flow opens at once with a loading state (PERF-03).
2. **Preview.** The core returns a plan: one row per repo with what will happen, its warnings (dirty tree, diverged, protected branch, nothing to do), and any choice it needs. An example choice is Stash / Skip this repo / Cancel for SAFE-04. The preview shows:
   - a checkbox per repo so it can be left out (BULK-03)
   - inline choice controls on the rows that need them
   - one confirmation block for the whole run that lists every push to a protected branch and every force-with-lease push (SAFE-01, SAFE-02, PIPE-05)
   - for destructive actions, the exact list of what will be lost, with a Run button named after the loss, for example "Discard 3 files" (SAFE-03)

   Run stays disabled until every required choice and confirmation is made.
3. **Run.** The core returns a job ID and the flow closes its dialog. The job carries on in the bottom bar and the `jobs` store, so the user can keep working (PERF-05). The progress view shows each repo as waiting, running, done, skipped (nothing to do, or cancelled before it started), paused or failed, with a Cancel button whose label explains what cancelling does: no new repos start, and running Git commands finish (BULK-04). Pipelines show the run grid (§13) instead of the list.
4. **Result.** The summary shows counts of succeeded, skipped, paused and failed repos, then the repo rows. Each failure shows the step, the plain message and the next step, with Show Git output, Retry failed, Open terminal and Show log (BULK-05, UX-04). If a repo changed between the preview and the run, the core's preflight pauses it with the reason, and the row says so with Resume and Stop (SAFE-07, architecture §9). Undo appears when the core says it is safe (BULK-09, UX-10). The result stays reachable from the bottom bar until it is dismissed.

New actions plug in by registering their kind, preview and run commands and their copy. They don't build their own dialogs.

### 7.1 Repo trust prompt (security GS-08)

When the core adds repos to a workspace (first run, opening a folder, adding a repo), it checks each repo's local config for settings that would make Git run a program: a command-valued `core.fsmonitor` (not `true` or `false`), `core.sshCommand`, `core.pager` or `core.editor` overrides, filter, diff and merge drivers, and `include.path` / `includeIf` targets. The UI shows the result like this:

1. **Ask once per workspace, with a list.** One dialog, titled for example "3 repos need review before GitHeddle runs Git in them", lists each flagged repo with every setting found, shown as plain text with its value. It never shows one dialog per repo.
2. Each row has a checkbox, ticked by default, and the dialog has two buttons: "Trust selected repos" and "Not now". The tooltip and help text explain in one sentence what trusting means: "GitHeddle will run Git here, and Git will run these programs."
3. **Untrusted repos show "Needs review"** on the dashboard, with a dimmed row and a Review button in place of status. GitHeddle runs no Git command in them at all, background status included, until they are trusted. The core's command guard enforces this, not the UI. They are left out of target sets, and the preview lists them as "skipped: needs review".
4. Trust is stored by the core per repo path plus a hash of the config. If the config changes, the repo goes back to "Needs review", and the next prompt lists only what changed.
5. In first run (UX-01), the prompt is one skippable step after the folder step. Skipping leaves the repos as "Needs review".

### 7.2 Team-file approval screen (security UN-06)

The team file (CFG-03) is P1, so this screen ships with it in v0.2. A new or changed `.githeddle.json` team file has no effect until the user approves it:

1. The core checks it against the schema. A file that names a program (editor, terminal, merge tool) or contains a Run Git command step is rejected, and an error message names the field.
2. A valid new or changed file shows a non-blocking notice: "The team file for acme-works changed. Review it". The review screen lists what would change, grouped by kind: groups, branch patterns, templates, default reviewers and pipelines. Each item is shown as added, changed or removed, with the old and new values side by side.
3. "Apply team settings" and "Keep my current settings" are the only buttons. Until the user applies it, the old team settings, or none, stay in effect.
4. Pipelines that come from the team file are marked with their source in the Pipelines list, and they always go through the normal preview (§7, PIPE-05).

## 8. Design tokens and themes

All sizes are in `rem` and all colours are role tokens defined in `styles/`. Tailwind utilities point to the tokens, and components never use raw values. Values are chosen at M0 and checked with the contrast test below.

| Group | Roles |
|---|---|
| Surfaces | `surface-base`, `surface-raised` (panels), `surface-sunken` (editors, lists), `surface-overlay` (menus, dialogs), `surface-hover`, `surface-selected`, `surface-selected-inactive` |
| Text | `text-primary`, `text-secondary` (the dimmed folder path, CHG-02), `text-disabled`, `text-on-accent`, `text-link` |
| Lines | `border-subtle`, `border-strong`, `focus-ring` |
| Actions | `accent` (primary button), `accent-hover`, `danger-action` |
| Feedback | `success`, `warning`, `danger`, `info`, each with a matching soft background |
| Git status letters | `status-modified` (M), `status-added` (A), `status-deleted` (D), `status-renamed` (R), `status-untracked` (U), `status-conflicted` (!) |
| Diff | `diff-inserted-line`, `diff-deleted-line`, `diff-inserted-word`, `diff-deleted-word`, `diff-spacer` (hatched filler), `diff-gutter` |
| Merge | `merge-incoming`, `merge-current`, `merge-auto-applied` (CONF-05), `merge-unresolved`, `merge-edited` |
| Run cells | `run-done`, `run-failed`, `run-paused`, `run-skipped`, `run-waiting` |
| Syntax | A small set of highlight roles (keyword, string, number, comment, type, function, tag, attribute) used by the CodeMirror theme |

- **Spacing:** named steps from `space-0` to `space-8`, plus `row-height` (one fixed height for every list row) and `pane-gap`.
- **Type:** named roles `text-caption`, `text-body`, `text-body-strong`, `text-section-title`, `text-screen-title`, `text-code`. There are two font families: one bundled UI font and one bundled monospace font, both OFL-licensed, subset to keep the installer small. They are chosen at M0, with a licence check. Bundling makes text metrics the same on all three systems, which the merge editor's alignment and the "looks the same everywhere" UX rule both depend on.
- **Light and dark:** each theme is a complete set of values for the same roles. The theme follows the system by default (PLAT-06). System theme changes come from the core, because `prefers-color-scheme` isn't reliable on every Linux desktop. The user can override it in Settings. Windows high-contrast (`forced-colors`) is respected, and motion is turned off under `prefers-reduced-motion`.
- **Status letters:** never colour alone. The letter itself carries the meaning, a tooltip names it ("Modified"), and the row's accessible name includes it (UX-08).
- **Contrast:** an automated test checks every text/background token pair in both themes: 4.5:1 for text, and 3:1 for icons, borders and focus rings (UX-08).
- **Zoom (UX-08):** Ctrl+= / Ctrl+− / Ctrl+0 (⌘ on macOS) change one zoom factor in steps. The factor scales the root font size, so every `rem`-based size follows, including `row-height` and the editor font. The webview's own zoom is turned off so there is only one zoom path. On a zoom change, CodeMirror re-measures and the virtualiser updates its row height. The factor is saved (UX-09).

## 9. Component inventory

| From React Aria Components (wrapped in `ui/`) | Used for |
|---|---|
| Button, ToggleButton, ToggleButtonGroup | All buttons, the List / Tree switch (CHG-03) |
| Checkbox, Switch, RadioGroup | Repo selection, preview choices, settings |
| TextField, SearchField, NumberField | Commit message, filters, parallel limit |
| Select, ComboBox | Method pickers, the branch picker with variables (PIPE-04), workspace and target pickers |
| Menu, MenuTrigger, SubmenuTrigger, Popover | Context menus (CHG-06, DASH-06), the Run Pipeline dropdown |
| Tooltip | One-sentence explanations on every action button (UX-02) |
| Dialog, Modal, AlertDialog | The action flow, confirmations, the command palette container |
| Table | The dashboard, pull request lists, the run grid (§13), preview and result lists |
| GridList (with drag-and-drop) | The pipeline step list with reordering |
| Tabs, Disclosure | Settings sections, details in the right panel, step options |
| ProgressBar, Meter | Job progress |
| Toast (check stability at M0) | Short, non-blocking notices with Undo |
| The live announcer from React Aria | Screen-reader announcements (§15) |

| Custom (in `components/`, `editor/`, `flows/`) | Why custom |
|---|---|
| App shell with resizable panes and splitters | React Aria has no splitter. Built on the separator role, with arrow-key resizing |
| Changes list/tree (virtualised) | Needs 5,000 rows, mixed row kinds and VS Code behaviour (§10) |
| Activity log list (virtualised) | Large, streaming, read-only |
| Diff view and merge editor | CodeMirror plus our aligned-panes layer (§11, §12) |
| Action flow | Our own preview → run → result pattern (§7) |
| Command palette | cmdk inside a React Aria Modal (§14) |
| Markdown view for pull request bodies and comments | The markdown is rendered to HTML, then cleaned by DOMPurify with the security allow-list: no scripts, event handlers, forms, iframes or styles (security UN-02). Images are never loaded; each one is shown as a link (TH-07). Links follow the allow-list: `https://github.com/…` and a configured GitHub Enterprise host open in the browser, and any other URL is shown in full with a Copy button, never opened (UN-04) |
| Account badge | The signed-in GitHub user is shown as an initials badge with the login name. No avatar image is loaded in v0.1 (TH-07) |
| Status letter, repo state badge, run-cell glyph, key hint, empty state, error message | Small product-specific pieces built on tokens |

## 10. Changes screen: list, tree and virtualisation

1. **Row model.** `changes` produces a flat array of row descriptors per repo: repo header, section header (Merge Changes, Staged Changes, Changes, with counts), folder rows (tree mode only) and file rows. It takes collapsed state and the filter into account. The screen concatenates the per-repo arrays, and each repo's part is memoised separately (§5.3).
2. **Tree mode** groups files by folder and compacts folders with a single child, as VS Code does. **List mode** shows the file name with its folder dimmed (CHG-02, CHG-03).
3. **Virtualisation.** TanStack Virtual renders only the visible rows plus a small overscan, with a fixed `row-height` scaled by zoom. Fixed heights make scrolling cheap and predictable (PERF-08). The repo header of the section in view stays pinned at the top.
4. **Rows** are memoised components that receive a stable key. They show the name, the dimmed folder, `+12 −3`, the status letter and hover/focus buttons for stage (+), unstage (−) and open. Section headers have "+ all" / "− all" (CHG-05). Stage and unstage update the row optimistically at once, and the next change-list event confirms or reverts it.
5. **Keyboard:**
   - Up and Down move between rows. Left and Right collapse and expand. Home and End jump to the ends.
   - Typing a letter jumps to the next matching name.
   - Enter opens the diff, and Space toggles staging for the focused file.
   - Shift and Ctrl/⌘ extend the selection.
   - The context-menu key and Shift+F10 open the row menu (CHG-06).
6. **Accessibility.** The widget follows the ARIA tree pattern. Because only visible rows exist in the DOM, each row carries its level, its position and the size of its set, so screen readers announce "3 of 12" correctly. This is a requirement with its own test: a Playwright accessibility-tree check on the 5,000-file scenario confirms `aria-level`, `aria-setsize` and `aria-posinset` on rendered rows, before and after scrolling, in both engines. Focus is tracked by key, not by DOM node, so it survives scrolling and updates.
7. **Filter** (CHG-03) matches file names across all repos, highlights the match and shows how many matched.
8. **Commit box** (CHG-07, BULK-06) sits under the list. It is prefilled with the ticket key from the core, Ctrl+Enter / ⌘Enter commits, and multi-repo commit goes through the action flow (§7).
9. **Check at M1:** the brief fixes TanStack Virtual. The M1 spike should also try React Aria's own virtualiser for the tree, and keep whichever gives correct screen-reader output and smooth scrolling on all three webviews.

## 11. Diff view

- **Modes:** side by side and inline (CHG-04). The toggle is remembered.
- **Data:** the core's `diff-engine` sends both texts, the line hunks (histogram) and the word-level ranges inside changed lines. The UI computes no diff, so the diff view, the Changes counts and the merge editor always agree (one engine).
- **Rendering:** both modes use CodeMirror in read-only views:
  - line backgrounds and word marks come from the core's ranges
  - side-by-side mode inserts spacer blocks so matching lines stay level, and scrolls both sides together
  - long unchanged stretches are collapsed, with an "expand N lines" control
  - `@codemirror/merge` is used for side by side and inline only if it accepts precomputed chunks (check at M1). If it doesn't, both modes are built on the shared aligned-panes layer in `editor/`, the same one the merge editor uses (§12). There is never a second diff engine in JavaScript.
- **Syntax highlighting:** language support is loaded lazily from the file extension. The starting set covers TS/JS, JSON, HTML, CSS, Markdown, XML (including `.csproj`), YAML, C#, Rust, Python and SQL. Unknown types show as plain text.
- **Navigation:** previous and next change (Alt+F5 / Shift+Alt+F5, as in VS Code), with "Change 3 of 9" shown.
- **Special cases:** binary files, files with only mode changes, renames (old → new path), line-ending-only changes ("Only line endings changed") and whitespace-only changes each get a clear message instead of an empty diff.
- **Large files** (PERF-06): up to 10,000 lines open within 300 ms. Above that, the core sends hunks in pages and unchanged runs stay collapsed. Above a hard size limit (a setting) the view offers "Open in editor" instead.
- **Prefetch:** when a file row gets keyboard focus, the diff is requested after a short debounce (about 100 ms), so arrowing quickly through the list doesn't send a request per row. A newer request cancels the older one, and a late answer for a file that is no longer selected is dropped.
- **Reuse:** editor views are reused when the user moves between files, by swapping their state, not by rebuilding them. At most a few views are alive at once.

## 12. Merge editor (three panes, like Visual Studio)

**Panes** (CONF-03). Incoming sits top left and Current top right, each titled with its real branch or commit name. Result sits at the bottom, editable and titled with the file name. The header shows the file, the repo and the operation ("merging X into dev"), "Conflict 2 of 6", the unresolved count, and Prev / Next. The footer has Take all incoming, Take all current and Accept merge. Base (CONF-12, P1) is an optional fourth pane, toggled from the header. The split between top and bottom can be resized and is remembered.

**Which side is which.** Current is always index stage 2 and Incoming is always stage 3. What they mean, and so the pane titles, depend on the operation:

| Operation | Current (stage 2) title | Incoming (stage 3) title |
|---|---|---|
| Merge | The branch you are on (HEAD), for example `dev` | The branch being merged in (MERGE_HEAD), for example `TK-2636-taosif-Onboarding` |
| Rebase | The branch being rebased onto, that is the commit being built on, for example "onto `dev`" | Your commit being replayed, shown as its short hash and subject |
| Cherry-pick | The branch you are on (HEAD) | The commit being picked, shown as its short hash and subject |

During a rebase the header also says so in words ("Rebasing TK-2636-taosif-Onboarding onto dev: commit 2 of 5"), because "current" and "incoming" feel reversed to many people there.

**Data from the core.** The editor loads Incoming (stage 3), Current (stage 2) and Base (stage 1) as texts. It also receives a list of **regions**, each one unchanged, applied automatically from one side, or a conflict with an ID. The conflict regions come from the conflict markers Git wrote into the worktree file (architecture D-06), so they match exactly what Git decided. Every region has its line range in every pane and its place in Result. The core sends the Result text with all non-conflicting changes already in it (CONF-05) and **every conflict range empty**. The UI draws a placeholder in each empty range, so marker text never enters the editor. (`git merge-file` is used only as a test oracle, never to build Result.)

**Alignment spacers** (CONF-06).
- In the two top panes, every region starts at the same vertical position. Where one side has fewer lines, a hatched spacer block of the missing height is inserted. This is a block widget, not text, so it can't be selected, copied or saved.
- Spacer heights are lines × the measured line height. They are recomputed on zoom and font changes.
- Line wrapping is off in the top panes, because wrapping breaks alignment. Horizontal scrolling is shared between them.

**Synced scrolling.**
- The top panes are pixel-aligned, so they share one scroll offset.
- Result has its own line count, because it is edited, so it is synced through region anchors. The region at the top of the active pane is found, and the other panes scroll to the same region at the same relative offset inside it.
- Any pane can lead, and a short lock stops the panes from feeding back into each other.

**Checkbox gutter widgets** (CONF-04).
- Each conflict gets a real checkbox in a gutter of the Incoming pane and of the Current pane, on the region's first line. It has an accessible name such as "Take incoming for conflict 2 of 6, lines 14 to 16".
- Ticking one side fills that conflict's region in Result with that side. Ticking both inserts both, in the order they were ticked. Unticking removes that side.
- Every tick and untick is one undoable step in Result (Ctrl+Z / ⌘Z).
- Commands exist for "take incoming", "take current" and "take both" on the current conflict, so the whole editor works from the keyboard.

**Editing Result.**
- Result is a normal CodeMirror editor. The editor tracks each region's range in Result as the text changes.
- If the user types inside a conflict region, the region is marked "edited by hand" (`merge-edited`), and both checkboxes show a mixed state. Ticking a box afterwards replaces the hand edit with that side. This is undoable, and a toast says "Replaced your edit · Undo".
- An unresolved conflict shows in Result as a highlighted placeholder widget ("Unresolved conflict 3"), not as text. This means conflict markers can never be saved by accident.
- Auto-applied changes are shaded with `merge-auto-applied` and marked with their source side in the gutter.

**Navigation** (CONF-07). F8 and Shift+F8 move to the next and previous unresolved conflict and scroll all panes there. When none are unresolved, they move between all conflicts. The counter and the unresolved count update live and are announced politely (§15).

**Accept merge rules** (CONF-08, CONF-09, CONF-11).
1. Take all incoming and Take all current resolve every conflict at once, as one undoable step.
2. Accept merge (Ctrl+S / ⌘S) is disabled while any conflict is unresolved. Its tooltip says how many are left, and pressing the shortcut jumps to the first one.
3. On accept, the UI sends Result's text to the core. The core keeps the file's original line endings and encoding, scans for conflict markers (CONF-11), writes the file and stages it. If the scan finds markers, the save is refused with a message that points to the line.
4. After a successful save, the next conflicted file opens: first in the same repo, then in the next repo. When none are left, the Conflicts screen shows Continue / Abort per repo and Continue all (CONF-10).
5. Leaving the editor with unsaved Result changes asks Keep editing / Discard my changes.

**Large files.** Up to 10,000 lines, the editor opens within 500 ms (PERF-06). CodeMirror renders only the viewport, and the core sends the regions as precomputed data. Above that, long unchanged regions are collapsed in all three panes, keeping their anchors. Above the hard limit, and for binary files, the editor offers Take current, Take incoming or the external merge tool (CONF-02) instead.

## 13. Pipeline editor and run grid

**Editor** (PIPE-01..04, PIPE-11).
- Steps form a React Aria GridList, one step per row. Each row has its step type, its fields, and Move up / Move down / Remove buttons.
- Steps can be reordered by drag or by keyboard. Drag-and-drop inside the page needs Tauri's native file-drop handling turned off for the window (check at M1).
- Branch fields are a ComboBox that accepts a fixed name or one of the variables `{current}`, `{base}` and `{task}`. Variables are shown as chips with an explanation (PIPE-04).
- The method field is a Select of merge / rebase / pull request for Integrate into branch (PIPE-03).
- Invalid steps show an inline message, and Save stays enabled but lists the problems.
- "Return each repo to the branch it started on" is a checkbox (PIPE-06). Step options sit in a Disclosure (PIPE-11).
- Leaving with unsaved edits asks first. Built-in pipelines open read-only, with Duplicate (PIPE-09).

**Run grid** (PIPE-05..08).
- The preview is the shared action flow (§7), with every step for every repo listed and one confirmation for the run.
- The run screen is a React Aria Table in grid mode: rows are repos, columns are steps. Each cell shows a glyph, a short word and a colour role: ✓ done, ✗ failed, ⏸ paused (with "3 conflicts"), – skipped, ○ waiting, plus a spinner while running. Glyphs are never the only signal.
- Arrow keys move between cells. Enter opens the cell's commands and output in the right panel (PIPE-08).
- A paused or failed repo row shows Open conflicts, Resume, Skip step and Stop (PIPE-07). Paused runs restored after a restart look the same.
- Cell updates come through job events and the per-frame batching (§5.2). With at most about 50 × 10 cells, the grid isn't virtualised.
- Built-in task actions (Sync with Base, Merge Task Into…) use the same grid (Flow 4).

## 14. Command palette and keyboard shortcuts

**Command registry.** Every user action is registered once in `commands/`, with:
- an ID, its title (from `copy/`) and its tooltip sentence
- a "when" rule that says where it applies (screen, focus scope, selection, repo state)
- a handler
- default keybindings in a portable notation where "Mod" means Ctrl on Windows and Linux and ⌘ on macOS (PLAT-05)

Buttons, menus, the palette, tooltips and shortcut hints all read from the registry, so a shortcut never drifts from its label.

**Palette** (UX-05, PIPE-10).
- Mod+K opens cmdk inside a React Aria Modal. The results include actions, saved and built-in pipelines, screens, repos ("Go to app-api"), tasks and recent items, with fuzzy matching.
- Each result shows its shortcut for the current OS. Actions that don't apply right now are shown dimmed, with the reason ("No conflicts to resolve").
- Choosing an action that changes something opens its preview. The palette never runs a change directly.

**Scopes and precedence.**
1. Scopes are tried in this order: dialog, then editor (inside CodeMirror), then screen, then global. The first scope that handles a key wins.
2. Inside text fields and editors, single-letter shortcuts are inactive. Only combinations with Mod, Alt or function keys pass through.
3. The PRD §8 shortcuts are the defaults: Mod+K, Mod+N, Mod+F, refresh (F5 on Windows and Linux, ⌘R on macOS), Mod+Enter, F8 / Shift+F8, Mod+S in the merge editor and Mod+, (comma).
4. Users can change shortcuts in Settings, and assign shortcuts to pipelines (PIPE-12, P1). The registry warns about conflicts.

**Webview and OS keys.**
- The webview's own browser keys (reload on F5 and Ctrl+R, print, find, zoom, devtools) are turned off in the Tauri shell, and the UI blocks their defaults. Otherwise F5 would reload the app instead of refreshing repos (check at M1 on each webview).
- On macOS, the shell defines the standard app menu and Edit menu, because WKWebView needs them for ⌘C, ⌘V, ⌘X, ⌘A and ⌘Z to work. Menu items call registry commands.
- Windows and Linux have no native menu bar. Everything sits in the app's top bar and the palette.

## 15. Accessibility (UX-08)

- **Roles:**
  - landmarks for the top bar, sidebar navigation, main area, details panel and bottom bar
  - tree for the Changes list
  - table or grid for the dashboard and the run grid
  - dialog / alertdialog for flows and confirmations
  - toolbar for button groups
  - separator for splitters
  - a labelled textbox for each editor pane ("Incoming, TK-2636-taosif-Onboarding, read only")
- **Names:** every control has an accessible name. Icon-only buttons are named from the registry title, for example "Stage Program.cs". A file row's name includes the status word and the counts ("Program.cs, Api, modified, 8 added, 2 removed").
- **Focus management:**
  - one tab stop per composite widget (roving focus inside), and a visible `focus-ring` everywhere
  - a dialog moves focus in and returns it on close
  - after an action, focus goes to the result's first failure, or back to where the action started
  - "Skip to main content" is the first tab stop
  - F6 / Shift+F6 cycle between the main regions
  - in editor panes, Tab moves focus out of the read-only panes. In Result, Tab indents, and Escape followed by Tab leaves (the CodeMirror convention), and the pane's description explains this
- **Live regions:** one polite announcer for progress, through React Aria's announcer:
  - "Push started in 4 repos"
  - finished repos in batches, at most one announcement every couple of seconds
  - the final summary ("Push finished: 3 succeeded, 1 failed")
  - conflict counter changes

  Assertive announcements are reserved for something that blocks the user and isn't already in a dialog.
- **Motion and colour:** reduced motion and forced colours are respected (§8). Information is never carried by colour alone.
- **Automated checks:** axe runs in Playwright on every scenario, in both themes and both engines. Accessibility-tree snapshots check names and roles, including the virtual tree's `aria-level`, `aria-setsize` and `aria-posinset` (§10). The contrast test covers the tokens (§8).
- **Manual screen-reader checks** (each release, as part of the PLAT-04 smoke checklist):

| OS | Webview | Screen reader | Focus |
|---|---|---|---|
| Windows | WebView2 (Chromium) | NVDA, plus a short Narrator pass | Changes tree, action flow, merge editor checkboxes, palette |
| macOS | WKWebView | VoiceOver | Same list, plus the menu bar and ⌘ shortcuts |
| Linux | WebKitGTK | Orca | Same list. This is the weakest stack, so failures here are logged with the WebKitGTK version |

## 16. Copy and error messages (UX-02, UX-04, UX-06)

The UI is in English in v0.1, so the examples below stay in English.

- **Words:**
  - Use the Git verbs users know: Fetch, Pull, Push, Commit, Stash, Merge, Rebase.
  - Always say "pull request" or "PR", never "merge request".
  - Use sentence case.
  - Buttons name the action and its object ("Discard 3 files", "Push 4 repos"), never "OK" or "Yes".
- **Tooltips:** one plain sentence that starts with a verb and says what will happen, including the safe limit. For example: "Brings new commits from origin into this branch. Stops if it can't fast-forward." (UX-02)
- **Errors** always follow the same three parts: what happened, where (repo and step), and what to do next. For example: "Pull stopped: app-front has local changes. Stash them or commit first." Git's original output is one click away (Show Git output). Never write "Something went wrong". An unknown error kind still names the repo and the step and shows Git's text (UX-04).
- **Empty states** say what the screen is for and offer the next action as a button, for example "No task yet. Start a task" (UX-06).
- **Confirmations** list exactly what will happen or be lost, in numbers and names. They never rely on "Are you sure?" (SAFE-03).
- **Numbers and time:** "3 repos", "1 repo", "2 min ago", "finished in 4.2 s".
- **Where text lives:** every string sits in `copy/`, keyed by feature. The UI is English in v0.1 (PRD open question 7), but keeping strings in one place makes translation possible later without touching components.

## 17. Webview compatibility rules

GitHeddle runs on three engines: WebView2 (Chromium, evergreen) on Windows, WKWebView (the system Safari engine) on macOS 13.3+, and WebKitGTK on Linux (Ubuntu 22.04+, Fedora 39+). The UI targets the oldest of these.

**Rules:**
1. **The macOS floor is macOS 13.3 or newer**, which means Safari/WKWebView 16.4 or newer. Tailwind v4 needs that version. At every start, before the UI loads, the core checks the WebKit version. If WKWebView is older than 16.4, the app shows a native message that explains how to update macOS, and the web UI does not load (build-and-release §7.2).
2. Use only web platform features that are **Baseline "widely available"**, and that also work in Safari 16.4 and in the WebKitGTK of Ubuntu 22.04's updates. Check at M0 and record the minimum engine versions.
3. Only CSS in `styles/` may use newer features, and only with a fallback that still looks correct.
4. Every Playwright test runs in Chromium and WebKit. A feature that fails in WebKit isn't used.
5. **CSP stays strict for styles too.** CodeMirror's styles are injected through adoptedStyleSheets, or with the nonce set through `EditorView.cspNonce` where a style element is needed. `unsafe-inline` is never added to the CSP (security TH-01). React and TanStack Virtual set styles through the DOM style property, which the CSP allows.

**Avoid:**
- `requestIdleCallback` and `scheduler.postTask` (missing in WebKit). Use timeouts and animation frames instead.
- `SharedArrayBuffer` (needs cross-origin isolation), WebGPU, View Transitions, CSS anchor positioning, and `content-visibility` as a performance crutch.
- `backdrop-filter`, large blurs and shadows, and animated layout properties. They are slow on WebKitGTK.
- Native `<select>`, date inputs and the native `<dialog>` element. They look and behave differently per engine, so use the React Aria versions.
- Web file-system, clipboard-read and notification APIs. Use core commands instead.
- `localStorage` and IndexedDB as the source of truth. Settings live in the core (UX-09).
- Remote fonts, scripts and images (CSP `default-src 'self'`), `eval`, and inline event handlers.
- Styling scrollbars with WebKit-only pseudo-elements alone. Use the standard scrollbar width and colour properties, with WebKit pseudo-elements only as a cosmetic extra.
- Smooth-scroll CSS on lists and editors.

**WebKitGTK caveats** (Linux):
- Scrolling and compositing are slower, so the DOM must stay small (virtualise early) and paint effects minimal.
- Some GPU, driver and Wayland combinations show a blank or flickering window. The shell documents the known environment workaround, which is the shell's job and not the UI's.
- Accessibility goes through AT-SPI and is less mature, so the Orca checks (§15) matter most here.
- The system theme may not reach `prefers-color-scheme`, so the theme comes from the core (§8).
- Font rendering and IME behaviour differ, which the bundled fonts and the WebKit Playwright runs reduce.

## 18. UI performance rules (PERF-03, PERF-05, PERF-06, PERF-08)

1. **Under 100 ms to visible feedback.** Show the pressed, pending or optimistic state in the same frame as the input. Never wait for the core before showing that something happened.
2. **No long tasks.** No main-thread task over 50 ms during interaction. Heavy work (diffs, alignment, parsing, sorting large sets) is done in Rust. If something heavy must stay in the UI, it goes to a Web Worker.
3. **The window never blocks** (PERF-05). Jobs run in the core. The UI only listens, and every screen stays usable while jobs run.
4. **Virtualise** every list that can pass about 200 rows (Changes, activity log, commit history). Use fixed row heights and memoised rows with stable keys.
5. **Batch updates.** Core events are applied once per frame (§5.2), and selectors stay narrow (§5.3).
6. **Small IPC payloads.** State events carry deltas. Big texts are fetched on demand and cached by TanStack Query with a size cap. Streams use channels.
7. **Diffs and the merge editor** (PERF-06): prefetch the diff when a file row gets focus, debounced by about 100 ms and cancelling stale requests (§11), reuse editor views, load language support lazily, and collapse unchanged regions on large files.
8. **Start-up** (PERF-01, PERF-02): code-split by screen so the merge editor, pipeline editor and settings don't load at start. Paint the shell and the cached dashboard first. Load language packs only when a diff needs them.
9. **Memory** (PERF-07): keep few editor views alive, cap query caches, and drop the merge editor's documents when it closes. The UI's share of the 250 MB budget is measured in the M1 spike, and the result is recorded as the UI budget.
10. **Motion:** at most 150 ms, transform and opacity only.
11. **Measure, don't guess.** Performance-sensitive work items add marks for the time from input to paint and from opening to ready. The M1 spikes and `tools/perf` run them on all three systems, and CI fails when a budget is broken.

## 19. Where this lands in the roadmap

| Milestone | UI work from this document |
|---|---|
| M0 | Folder rules and checks (§3), tokens and themes (§8), `ui/` wrappers, fake core skeleton (§6.3), check engine floors (§17), choose fonts and React Compiler |
| M1 | Spikes for the go/no-go gate: 5,000-row Changes list on all three webviews (§10), merge-editor alignment and synced scrolling prototype (§12), `@codemirror/merge` with external chunks (§11), browser-key and drag-and-drop checks (§13, §14) |
| M3 | App shell, navigation, dashboard table with the "Needs review" state and the repo trust prompt (§7.1), command registry and palette (§4, §14) |
| M4 | Changes screen, diff view, commit box (§10, §11) |
| M5 | The shared action flow (§7), copy and error mapping (§16) |
| M6 | Task screen and the Start Task flow |
| M7 | Conflicts screen and merge editor (§12) |
| M8 | Pipeline editor and run grid (§13) |
| M9 | Sign-in flow with the account badge, and the active task's pull requests with their status (PR-05). The full Pull Requests screen (PR-06) is P1, in v0.2 |
| M10 | First-run guide including the trust step (§7.1), the start-up webview-version check (§17), accessibility pass and screen-reader checks (§15), performance pass (§18), polish |

The exact work items and their `M<n>-<nn>` IDs are in the roadmap.

## 20. UI risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | The merge editor's alignment and synced scrolling are subtle, and AI-written code tends to get the edge cases wrong (empty sides, a conflict at the end of the file, edits inside regions) | Alignment is computed in Rust as data, with snapshot tests. The UI only renders it. The prototype is built in M1. Fake-core scenarios cover the edge cases, with Playwright screenshots |
| 2 | WebKitGTK (and older WKWebView) is too slow or renders differently | Lowest-common-feature rules (§17), WebKit in every UI test run, the M1 gate measured on all three webviews, and the Electron fallback if the gate fails |
| 3 | A virtualised tree reads badly in screen readers | The ARIA tree pattern with level, position and set size (§10), the M1 comparison with React Aria's virtualiser, and Orca, VoiceOver and NVDA checks |
| 4 | `@codemirror/merge` can't take the core's diff, so there would be two diff engines | Check at M1. If it can't, render both diff modes on the shared aligned-panes layer (§11) |
| 5 | Shortcuts clash with webview, OS or editor keys (F5 reload, ⌘ menu keys, keys inside CodeMirror) | One registry with scopes (§14), browser keys turned off in the shell, a macOS Edit menu, and per-webview checks at M1 |
| 6 | AI-generated UI drifts from the system (raw colours, ad-hoc dialogs, direct Tauri calls) | Folder and import rules with CI checks (§3), the shared flow and the registry, and token-only styling |
| 7 | Event storms on large workspaces cause re-render storms | Deltas, per-frame batching, narrow selectors and per-repo memoisation (§5), measured with the 30-repo and 5,000-file scenarios |
| 8 | Bundled fonts add size or licence trouble | Subset OFL fonts, a licence check at M0, and the size counted in the PERF-09 installer job |
