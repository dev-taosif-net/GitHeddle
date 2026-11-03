# GitHeddle — UI/UX design

**Bangla version:** [ux-design.bn.md](ux-design.bn.md)

| | |
|---|---|
| **Document** | UI/UX design (visual language, layout, screens, interactions and copy) |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. Written by the design panel (Agents 1–5) |

**Related documents:** [PRD](../product/PRD.en.md) · [UI architecture](ui-architecture.en.md) · [ADR 0001 — Technology stack](../decisions/0001-tech-stack.en.md) · [Architecture](../architecture/architecture.en.md) · [Security](../engineering/security.en.md) · [Test strategy](../engineering/test-strategy.en.md) · [Roadmap](../plan/roadmap.en.md) · [Mockups](mockups/index.html)

> This file and its Bangla version carry the same content. When one changes, update the other in the same commit.

---

## 1. Purpose and scope

This document says what GitHeddle looks like and how it behaves: the token values, the layout and its sizes, the anatomy and states of every screen, the interactions, the keyboard map and the exact words on screen.

[UI architecture](ui-architecture.en.md) says how the UI is built: folders, state, the core interface, the component library and the engineering rules. The two documents fit together like this:

| Question | Where the answer is |
|---|---|
| Which token roles exist, and how are they wired into Tailwind? | ui-architecture §8 |
| What value does each role have, in light and dark, and does it pass contrast? | This document, §3 and [mockups/tokens.css](mockups/tokens.css) |
| Which React Aria component is used for X? | ui-architecture §9 |
| How big is X, what does it say, what happens when it's empty, loading or failing? | This document, §4–§18 |
| What does the shared preview → run → result flow do? | ui-architecture §7 (rules), this document §12 (looks, words, keys) |

Where this document needs something the existing documents don't have, it adds it (new token roles, a job panel region). Where it disagrees with them, it says so in §26 and does not silently override them.

The design was made by a panel of five agents, each with its own focus. Their proposals were merged by the panel chair. Where they disagreed, the chair decided, and each decision is recorded in §24.

| Agent | Focus |
|---|---|
| Agent 1 | Visual design system: colour, type, spacing, icons, motion, logo |
| Agent 2 | Information architecture, app shell and overview screens |
| Agent 3 | Changes, diff view, Conflicts screen and merge editor |
| Agent 4 | Action flows, pipelines, safety confirmations and copy |
| Agent 5 | Ease of use and accessibility |

Example data throughout: workspace `acme-works`; task `TK-2636` "Onboarding"; branch `TK-2636-taosif-Onboarding`; base `dev`; repos `app-api`, `app-front`, `app-report-api`, `app-scheduler-api`, `app-signalr-api` and `knowledge-hub`.

## 2. Design principles

1. **Calm by default, loud only when it needs you.** Surfaces are flat cool greys. Colour is spent on what needs attention: a paused repo, a failure, a choice to make, a protected branch. Done and skipped things stay plain.
2. **Familiar behaviour, own look.** The Changes screen behaves like VS Code's Source Control and the merge editor like Visual Studio's. The look is GitHeddle's: an indigo "thread" accent, Inter and JetBrains Mono, Lucide icons. No VS Code blue, no Visual Studio purple, no Segoe or Consolas, no codicons.
3. **Say it in words.** Every state has a word next to its icon or colour ("2 to push", "Paused · 3 conflicts"). Glyphs and colour help scanning; they never carry meaning alone.
4. **Every button names its scope.** "Push 4 repos", "Commit app-api", "Discard 3 files". The target is always visible before anything runs.
5. **No dead ends.** Every empty state has a next action, every disabled button says why in visible text, every error says what to do next.
6. **Never lose work.** Destructive actions list exactly what is lost and offer a safe alternative. Conflicts are a pause, not a failure. Nothing is committed, pushed or discarded without a labelled button.
7. **Instant first.** The UI reacts in the same frame as the click. Cached state shows at once and is marked as cached until live data arrives.
8. **Same on three systems.** Bundled fonts, SVG icons, the native window frame and one set of sizes. Only the shortcut key changes (Ctrl or ⌘).
9. **Dense but reachable.** IDE density (13 px text, 24 px rows), with every target at least 24 × 24 px (WCAG 2.2 AA, 2.5.8).

## 3. Visual language

### 3.1 Identity in one paragraph

GitHeddle is calm, flat and cool-grey, with one blue-violet indigo accent (`#3D4FD1`) that stands for the thread passing through a heddle. It is dense like an IDE but every row is 24 px high. Shapes have small radii: 4 px on controls, 6 px on overlays. There are no gradients except the diff hatch, and no blur. Merge sides use teal (Incoming) and violet (Current), never green and red, so they never read as "added" and "deleted".

### 3.2 Colour tokens

CSS custom properties are named `--gh-<role>` and defined for `[data-theme="light"]` and `[data-theme="dark"]` on `<html>`. Tailwind v4 maps them as `--color-<role>: var(--gh-<role>)` (ui-architecture §8). `<html>` also sets `color-scheme` to match, so native scrollbars and the caret follow the theme. Roles marked **new** are additions to ui-architecture §8 (see §26).

**Surfaces**

| Role | Light | Dark | Used for |
|---|---|---|---|
| `surface-base` | `#ECEEF2` | `#17191E` | App background, top bar, bottom bar |
| `surface-raised` | `#F6F7F9` | `#1D2026` | Sidebar, details panel, pane headers, table headers, cards |
| `surface-sunken` | `#FFFFFF` | `#131519` | Lists, tables, the Changes tree, editors, text inputs |
| `surface-overlay` | `#FFFFFF` | `#252932` | Menus, popovers, dialogs, palette, tooltips, toasts |
| `surface-hover` | `#E6E9EF` | `#272B33` | Row and ghost-button hover, neutral pills |
| `surface-selected` | `#DDE2FB` | `#283166` | Selected row while its list has focus |
| `surface-selected-inactive` | `#E3E5EA` | `#2C3038` | Selected row while focus is elsewhere |

In dark mode an overlay shows its height by being lighter, not by its shadow.

**Text**

| Role | Light | Dark |
|---|---|---|
| `text-primary` | `#1B1E25` | `#E4E7EE` |
| `text-secondary` | `#555B69` | `#A3A9B7` |
| `text-disabled` | `#8D93A0` | `#646A77` |
| `text-on-accent` | `#FFFFFF` | `#FFFFFF` |
| `text-link` | `#3442B8` | `#97A3FF` |

**Lines and actions**

| Role | Light | Dark | Notes |
|---|---|---|---|
| `border-subtle` | `#DADDE3` | `#2B2F37` | Decoration only: pane dividers, table row lines, indent guides. Never the only boundary of a control |
| `border-strong` | `#767C8A` | `#7C8291` | Input, checkbox, radio and secondary-button borders. Meets 3:1 on every surface |
| `focus-ring` | `#3D4FD1` | `#8A98FF` | 2 px outline |
| `accent` | `#3D4FD1` | `#4C5AD6` | Primary button fill, checkbox fill |
| `accent-hover` | `#3343BA` | `#5967DD` | |
| `accent-indicator` **new** | `#3D4FD1` | `#8A98FF` | Selected-row bar, active sidebar bar, active tab underline, splitter hover, `merge-active` outline. Split from `accent` because the dark accent can't be both a white-text background and a 3:1 indicator |
| `danger-action` | `#C02C2C` | `#BE3434` | Fill of destructive buttons |
| `danger-action-hover` **new** | `#A32323` | `#C94141` | |
| `indicator-glyph` **new** | `#FFFFFF` | `#131519` | The check mark on a merge checkbox fill and the knob of a switch that is on. Dark in the dark theme because the dark edges and `accent-indicator` are light (white on them is 2.39–2.76:1) |

**Feedback.** Each feedback role has a foreground and a soft background, named `<role>-soft`.

| Role | Light fg / soft | Dark fg / soft |
|---|---|---|
| `success` | `#136B33` / `#E3F4E8` | `#4CC46E` / `#15301F` |
| `warning` | `#8F5400` / `#FDF1DC` | `#E3A43A` / `#33270F` |
| `danger` | `#B42323` / `#FBE6E6` | `#F68A84` / `#3A1A1A` |
| `info` | `#1F5FB8` / `#E3EEFB` | `#6EA8F5` / `#152740` |

Soft backgrounds tint only what needs attention: paused and failed cells, rows that need a choice, the confirmation block, banners. Done and skipped rows stay on the plain surface.

**Git status letters**

| Role | Letter | Tooltip | Light | Dark |
|---|---|---|---|---|
| `status-modified` | M | Modified | `#8F5400` | `#E3A43A` |
| `status-added` | A | Added | `#136B33` | `#4CC46E` |
| `status-deleted` | D | Deleted | `#B42323` | `#F68A84` |
| `status-renamed` | R | Renamed | `#1F5FB8` | `#6EA8F5` |
| `status-untracked` | U | Untracked (new, not yet added) | `#0E6F66` | `#3FC2B4` |
| `status-conflicted` | ! | Conflicted | `#A3218C` | `#E77BD3` |

- Each letter is JetBrains Mono 600 at 12 px, centred in a 16 px column.
- "Conflicted" is magenta, not red, so it never looks like "deleted". It is also the only letter drawn as a badge: 16 × 16 px, radius 3 px, on `merge-unresolved` background.
- The letter is the meaning. The colour only helps scanning.

**Diff**

| Role | Light | Dark |
|---|---|---|
| `diff-inserted-line` | `#E6F6EA` | `#17301F` |
| `diff-deleted-line` | `#FCEBEB` | `#36191B` |
| `diff-inserted-word` | `#C6EDD0` | `#1B4025` |
| `diff-deleted-word` | `#F9D3D3` | `#522125` |
| `diff-spacer-1` / `diff-spacer-2` **new** | `#EEF0F3` / `#E2E5EA` | `#1A1D22` / `#23262D` |
| `diff-spacer` | stripes of the two above | stripes of the two above |
| `diff-gutter` | `#F6F7F9` | `#181B20` |

- The spacer is `repeating-linear-gradient(135deg, var(--gh-diff-spacer-1) 0 0.25rem, var(--gh-diff-spacer-2) 0.25rem 0.5rem)`.
- The gutter has line numbers in `text-secondary` and a 1ch `+` / `−` sign column in `success` / `danger`. The sign is always shown, so inserted and deleted lines read without colour.

**Merge.** Each merge role is a background plus an edge colour (`-edge`, **new** sub-role) used for the 3 px region bar, gutter markers and the checkbox fill.

| Role | Light bg / edge | Dark bg / edge | Meaning |
|---|---|---|---|
| `merge-incoming` | `#E2F3F6` / `#0F7285` (teal) | `#12303A` / `#3FB6CC` | Incoming side and its regions |
| `merge-current` | `#EFE7FB` / `#6B3FC2` (violet) | `#2A2140` / `#A88BF0` | Current side and its regions |
| `merge-auto-applied` | `#ECF0F6` / `#55698A` | `#1D2533` / `#8696B3` | CONF-05 changes applied automatically |
| `merge-unresolved` | `#F8E6F4` / `#A3218C` | `#3A1834` / `#E77BD3` | Placeholder in Result; same hue as `!` |
| `merge-edited` | `#FFF3D6` / `#8F5400` | `#33290F` / `#E3A43A` | Region edited by hand |
| `merge-active` **new** | outline = `accent-indicator` | outline = `accent-indicator` | 2 px outline around the active conflict in all three panes |

**Run cells**

| Role | Lucide icon | Word | Icon colour | Cell background |
|---|---|---|---|---|
| `run-done` | `check` | Done, Merged, Pushed, Up to date | = `success` | none |
| `run-failed` | `x` | Failed: rejected | = `danger` | `danger-soft` |
| `run-paused` | `pause` | Paused · 3 conflicts | = `warning` | `warning-soft` |
| `run-skipped` | `minus` | Nothing to do, Cancelled, Stopped | = `text-secondary` | none |
| `run-waiting` | `circle` | Waiting | `#6E7482` / `#7D8391` | none |
| `run-running` **new** | `loader-circle`, spinning | Running · 12 s | = `info` | none |

The word is `text-secondary` for waiting and skipped, `text-primary` otherwise. The waiting icon is dimmer than `text-secondary` on purpose: it still meets 3:1, and the word carries the meaning.

**Syntax highlighting.** Checked against `surface-sunken`, all diff and merge backgrounds (line and word level), the editor selection, the active line and the search match.

| Role | Light | Dark |
|---|---|---|
| `syntax-keyword` | `#7A2FB5` | `#C49AF0` |
| `syntax-string` | `#0F6435` | `#8BD49C` |
| `syntax-number` | `#923F07` | `#F0A56B` |
| `syntax-comment` | `#575E6C` (not italic) | `#A2A9B5` (not italic) |
| `syntax-type` | `#0B627A` | `#5FC9D9` |
| `syntax-function` | `#2D46B5` | `#94A8FF` |
| `syntax-tag` | `#A0215A` | `#F28BB0` |
| `syntax-attribute` | `#7B4B00` | `#E8C170` |

**Editor, overlay and logo roles (new)**

| Role | Light | Dark |
|---|---|---|
| `editor-selection` | `#D9DEF9` | `#2A3266` |
| `editor-active-line` | `#F4F6FA` | `#1A1D22` |
| `editor-search-match` | `#FBE3A6` | `#3F3210` (darker than the first draft's `#5A4614`, on which dark syntax colours fell to 3.83:1) |
| `editor-cursor` | = `text-primary` | = `text-primary` |
| `scrim` | `rgb(15 18 24 / 0.32)` | `rgb(0 0 0 / 0.55)` |
| `logo-tile` | `#3D4FD1` | `#5967DD` |
| `logo-thread` | `#F4F5FB` | `#F4F5FB` |

The scrim is a flat colour and never uses `backdrop-filter` (ui-architecture §17).

### 3.3 Contrast results (WCAG 2.x)

Every figure below is computed from `mockups/tokens.css` by [`mockups/contrast-check.js`](mockups/contrast-check.js) (the WCAG relative-luminance formula), not by hand. Each figure is the worst case over every background the pair can appear on: for surfaces that is base, raised, sunken, overlay, hover, selected and selected-inactive; for editors it also includes the line- and word-level diff backgrounds, the merge backgrounds, the selection, the active line and the search match. The script's pair list is the CI contrast test: it fails the build if any value drops below its threshold (4.5:1 text, 3:1 non-text), and the table is regenerated from it, never edited by hand.

| Pair | Needs | Light min | Dark min |
|---|---|---|---|
| `text-primary` on surfaces | 4.5:1 | 12.98 (selected) | 9.85 (selected) |
| `text-secondary` on surfaces | 4.5:1 | 5.30 (selected) | 5.18 (selected) |
| `text-secondary` on soft, diff and merge bgs | 4.5:1 | 4.95 (diff-deleted-word) | 4.94 (diff-inserted-word) |
| `text-link` on surfaces | 4.5:1 | 6.25 (selected) | 5.23 (selected) |
| `text-on-accent` on `accent` / `accent-hover` | 4.5:1 | 6.49 / 7.92 | 5.61 / 4.76 |
| `text-on-accent` on `danger-action` / hover | 4.5:1 | 5.77 / 7.44 | 5.63 / 4.87 |
| feedback fg on its own soft bg (worst of 4) | 4.5:1 | 5.28 (info-soft) | 6.15 (info-soft) |
| feedback fg on surfaces (worst of 4) | 4.5:1 | 4.76 (selected, warning) | 4.99 (selected, info) |
| `text-primary` on any soft bg | 4.5:1 | 13.95 (danger-soft) | 11.51 (success-soft) |
| Status letters on surfaces | 4.5:1 | 4.69 (selected, untracked) | 4.75 (selected, conflicted) |
| `!` on `merge-unresolved` (badge) | 4.5:1 | 5.59 (merge-unresolved) | 6.01 (merge-unresolved) |
| `text-primary` on diff bgs (lines, words, gutter, spacer) | 4.5:1 | 12.14 (diff-deleted-word) | 9.39 (diff-inserted-word) |
| Line numbers on diff line bgs and gutter | 4.5:1 | 5.90 (diff-deleted-line) | 6.03 (diff-inserted-line) |
| `+` on inserted line and word / `−` on deleted line and word | 4.5:1 | 5.17 / 4.77 | 5.22 / 5.54 |
| `text-primary` on merge bgs | 4.5:1 | 13.89 (merge-current) | 11.24 (merge-incoming) |
| Merge edges on `surface-sunken`, `surface-raised` and their own bg | 3:1 | 4.87 (merge-auto-applied) | 5.15 (merge-auto-applied) |
| Syntax roles on every editor bg (incl. selection, active line, search match) | 4.5:1 | 4.74 (diff-deleted-word, comment) | 4.91 (diff-inserted-word, comment) |
| `text-primary` on `editor-selection` / `editor-search-match` | 4.5:1 | 12.52 (editor-selection) | 9.71 (editor-selection) |
| `border-strong` on surfaces and soft bgs | 3:1 | 3.26 (selected) | 3.17 (selected) |
| `focus-ring` on surfaces | 3:1 | 5.05 (selected) | 4.66 (selected) |
| `focus-ring` on soft, diff and merge bgs | 3:1 | 4.72 (diff-deleted-word) | 4.44 (diff-inserted-word) |
| `accent-indicator` on surfaces (row bar, checked radio and switch) | 3:1 | 5.05 (selected) | 4.66 (selected) |
| `accent-indicator` on merge bgs (`merge-active`) | 3:1 | 5.40 (merge-current) | 5.31 (merge-incoming) |
| Run-waiting icon on surfaces | 3:1 | 3.65 (selected) | 3.21 (selected) |
| Check on `accent` checkbox (`text-on-accent`) | 3:1 | 6.49 (accent) | 5.61 (accent) |
| Check on merge checkboxes, knob on switch (`indicator-glyph` on incoming / current edge, `accent-indicator`) | 3:1 | 5.58 (merge-incoming-edge) | 6.63 (merge-current-edge) |
| Logo threads on tile | 3:1 | 5.96 (logo-tile) | 4.38 (logo-tile) |

`text-disabled` (2.40 light, 2.25 dark at worst) is used **only for inactive controls**, which WCAG 1.4.3 exempts. Anything that tells the user something, such as a "Left out" preview row, uses `text-secondary`.

Five dark-theme cases need care, and the shared classes handle them:

- **Ticked checkbox:** the dark `accent` against `surface-raised` is 2.91, so a ticked checkbox keeps its 1 px `border-strong` outline around the fill.
- **Merge checkboxes:** the dark merge edges are light, so the check mark on them is drawn in `indicator-glyph` (`#131519`), not white.
- **Checked radio and switch:** they use `accent-indicator`, not `accent`, for the ring and the track (the dark `accent` is 2.17–2.91 on surfaces); the switch knob is `indicator-glyph`.
- **Primary button outline:** also 2.91 in dark. WCAG doesn't require a labelled button's outline to meet 3:1; the label is 5.61.
- **Focus on the primary button:** the ring uses a 2 px offset, so it sits on the surface around the button, not on the fill.

Selected rows: `surface-selected` against `surface-sunken` is only 1.28 (light) and 1.50 (dark), so a selected row always also gets a 2 px `accent-indicator` bar on its left edge, which carries the 3:1 state signal (WCAG 1.4.11).

### 3.4 Typography

**Fonts** (both SIL OFL 1.1, bundled, subset in CI with `pyftsubset` to WOFF2, never on a developer machine):

- **UI: Inter 4**, variable, `wght` 400–700. Large x-height, tabular figures (`tnum`), and the `cv05` and `cv08` features on, so `Il1` is readable in branch names. `font-optical-sizing: none`.
- **Monospace: JetBrains Mono 2**, variable. Distinct `0O`, `1lI`. **Ligatures always off** (`font-variant-ligatures: none; font-feature-settings: "calt" 0, "liga" 0`), so `<<<<<<<`, `!=` and `=>` show the exact characters. Tab size 4.
- Subset ranges: Basic Latin, Latin-1 Supplement, Latin Extended-A, General Punctuation, Arrows, `·` `…` `−`, Box Drawing basics. Expected size about 90–120 KB (Inter) and 60–80 KB (JetBrains Mono), measured at M0 in the PERF-09 job. Both licence files go into `styles/fonts/` and the About screen.

**Fallback stacks** (also used by the mockups, which can't bundle fonts):

- UI: `"Inter", system-ui, "Segoe UI", "Noto Sans", "Noto Sans Bengali", sans-serif`
- Mono: `"JetBrains Mono", ui-monospace, "Cascadia Mono", Menlo, "DejaVu Sans Mono", monospace`

Every line height is set explicitly, so a fallback glyph (Bangla or CJK in a commit message) can't change row height or the merge editor's line height.

**Type roles.** The root font size is 16 px × zoom. Values are at 100 %.

| Role | Family | Size | Weight | Line height | Used for |
|---|---|---|---|---|---|
| `text-caption` | Inter | 0.75rem (12 px) | 400 | 1rem (16 px) | Bottom bar, badges, tooltips, key hints, counts, helper text. The smallest text in the app |
| `text-body` | Inter | 0.8125rem (13 px) | 400 | 1.25rem (20 px) | Default: rows, buttons, inputs, menus, dialog body |
| `text-body-strong` | Inter | 0.8125rem | 600 | 1.25rem | Repo names, table header labels, selected nav item |
| `text-section-title` | Inter | 0.75rem (12 px) | 600, sentence case | 1rem | Sidebar groups ("Tasks"), pane titles ("Incoming"), panel sections. Colour `text-secondary` |
| `text-screen-title` | Inter | 1rem (16 px) | 600 | 1.5rem (24 px) | One per screen; dialog titles; empty-state headline. Letter spacing −0.01em |
| `text-code` | JetBrains Mono | 0.8125rem (13 px) | 400 | 1.25rem (20 px) | Editors, diff, branch names, hashes, commands, Git output |

- Every number in a row or table uses `font-variant-numeric: tabular-nums`.
- Branch names, hashes and paths shown inline use `text-code` at the size of the text around them.
- Weight 700 and uppercase text are never used. The only exception is key hints, which show key names as the OS writes them (`Ctrl`, `⌘`).
- **Key notation** comes from the shortcut registry and follows the OS (PLAT-05), one notation per OS, never mixed. Key hint chips separate keys with spaces: `Ctrl Shift B` on Windows and Linux, `⇧⌘B` on macOS. Prose, tooltips and the shortcut tables use `Ctrl+Shift+B` / `⇧⌘B`. A Windows or Linux hint never uses a macOS glyph such as `⇧`.
- Badges that hold text (initials, order badges, rail counts, coach-strip numbers) use `text-caption` too and grow to fit it: 20 px initials, 16 px order and number badges.

### 3.5 Spacing, sizes, radii and borders

**Spacing scale** (2 px base, 4 px rhythm):

| Token | `space-0` | `space-1` | `space-2` | `space-3` | `space-4` | `space-5` | `space-6` | `space-7` | `space-8` |
|---|---|---|---|---|---|---|---|---|---|
| rem | 0 | 0.125 | 0.25 | 0.375 | 0.5 | 0.75 | 1 | 1.5 | 2 |
| px | 0 | 2 | 4 | 6 | 8 | 12 | 16 | 24 | 32 |

**Fixed sizes**

| Token | Value | Notes |
|---|---|---|
| `row-height` | 1.5rem (24 px) | Every list, tree, table and sidebar row. Row buttons are 24 × 24 |
| `pane-gap` | 1 px | The visible divider between panes, in `border-subtle`. The splitter hit area is 6 px |
| `control-sm` **new** | 1.5rem (24 px) | Row buttons, toolbar icon buttons, filter chips, segmented choices |
| `control-md` **new** | 1.75rem (28 px) | Default buttons, inputs, selects |
| `control-lg` **new** | 2rem (32 px) | Only the main call to action in first run and empty states |
| Tree indent | 1rem per level | With a 1 px `border-subtle` indent guide |
| Row padding | `space-4` (8 px) left | |
| Button padding | `space-5` (12 px) sides; `space-3` icon gap; min width 4rem | |
| Checkbox / radio | 0.875rem (14 px) box in a 1.5rem hit area | |

**Radii (new)**

| Token | Value | Used for |
|---|---|---|
| `radius-none` | 0 | Rows, panes, editors, tables |
| `radius-sm` | 3 px | Checkboxes, key hints, small badges, inline code, variable chips |
| `radius-md` | 4 px | Buttons, inputs, selects, menu items, banners |
| `radius-lg` | 6 px | Popovers, menus, dialogs, toasts, palette, cards |
| `radius-full` | 9999 px | State pills, initials badge, count pills |

**Borders are in px, not rem:** 1 px for lines, 2 px for the focus ring and selection bars, 3 px for merge region edges and invalid-step markers. A rem hairline renders blurry at fractional zoom (see §26).

**Density.** One density in v0.1: 24 px rows, 13 px text, 8 px typical padding. About 30 dashboard rows fit on a 1080p screen. A compact 22 px mode is an open question (§25).

### 3.6 Elevation (new tokens)

Elevation is a flat surface plus a 1 px `border-subtle` plus at most one small shadow (blur ≤ 12 px). There is no `backdrop-filter`.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `elevation-0` | none | none | Everything in the shell |
| `elevation-1` | `0 2px 6px rgb(16 20 30 / 0.12)` | `0 2px 6px rgb(0 0 0 / 0.45)` | Menus, popovers, tooltips, toasts, overlay details panel |
| `elevation-2` | `0 4px 12px rgb(16 20 30 / 0.16)` | `0 4px 12px rgb(0 0 0 / 0.55)` | Dialogs and the palette, over `scrim` |

### 3.7 Icons

**Lucide** (ISC licence, GPL-3.0 compatible), imported per icon through `lucide-react` inside `ui/Icon`, rendered as inline SVG with `currentColor`. No icon font, no remote requests. Codicons are not used (they would copy VS Code's look). Mockups inline the SVG paths.

| Token | Size | Stroke | Used for |
|---|---|---|---|
| `icon-sm` | 12 px | 2 | Chevrons, inline badge icons |
| `icon-md` | 16 px | 1.5 | Default: buttons, rows, run cells |
| `icon-lg` | 20 px | 1.5 | Sidebar rail icons, dialog title icons |
| `icon-xl` | 32 px | 1.5 | Empty states only |

Icons are `text-secondary` by default and `text-primary` on hover or selection. Icon-only buttons always have an accessible name and a tooltip.

**No Unicode glyphs for states.** `⏸` shows as a colour emoji on Windows and macOS, and `✓ ✗ ○` depend on the fallback font. The glyphs in the PRD sketches are notation; the app draws Lucide SVGs.

| Action or place | Lucide icon | Action or place | Lucide icon |
|---|---|---|---|
| Fetch | `cloud-download` | Repositories | `folder-git-2` |
| Pull | `arrow-down-to-line` | Changes | `file-diff` |
| Push | `arrow-up-from-line` | Pull requests | `git-pull-request` |
| Commit | `git-commit-horizontal` | Draft pull request | `git-pull-request-draft` |
| Branch | `git-branch` | Conflicts | `git-compare` |
| Merge | `git-merge` | Pipelines | `workflow` |
| Stash | `archive` | Task | `ticket` |
| Run | `play` | Activity log | `scroll-text` |
| Refresh | `refresh-cw` | Settings | `settings` |
| Stage / unstage | `plus` / `minus` | Discard | `undo-2` |
| Open in editor | `square-pen` | Terminal | `square-terminal` |
| File manager | `folder-open` | Open on GitHub | `external-link` |
| Protected branch | `shield` | Force with lease | `triangle-alert` |
| Needs review | `shield-question` | Search | `search` |
| Expand | `chevron-right` (rotates 90°) | Side by side / inline | `columns-2` / `rows-2` |
| Detached HEAD | `unlink` | Diverged | `split` |
| Not published | `cloud-off` | Help / term | `circle-help` |

Icon names are checked at M0.

### 3.8 Motion (new tokens)

| Token | Duration | Used for |
|---|---|---|
| `motion-instant` | 0 ms | Hover, press, selection, theme switch, row insert and remove |
| `motion-fast` | 80 ms | All exits; chevron rotation; tooltip fade |
| `motion-base` | 120 ms | Menu and popover enter (`opacity`, `translateY(-4px → 0)`); toast enter (`translateY(8px → 0)`) |
| `motion-slow` | 150 ms | Dialog and palette enter (`opacity`, `scale(0.98 → 1)`) |

- Easing: enter `cubic-bezier(0.2, 0, 0, 1)`, exit `cubic-bezier(0.3, 0, 1, 1)`.
- Only `opacity` and `transform` are animated. Never layout, colour or scroll (ui-architecture §18).
- Continuous animations (the only ones over 150 ms): spinner `rotate` 900 ms linear; indeterminate bar `translateX` 1.2 s; determinate progress `scaleX` in 120 ms steps.
- **Reduced motion** (`prefers-reduced-motion: reduce`, the OS setting reported by the core, or Settings → Motion: Reduce): every duration is 0; the spinner becomes a static `hourglass` icon with its word; indeterminate bars become the text "Working…"; skeletons are flat.

### 3.9 Logo and wordmark

A heddle is a wire with an eye in the middle; one warp thread passes through each eye. The mark shows three vertical threads. The middle one opens into a narrow eye and closes again, which reads as "a thread guided by a heddle" and as "branch, then merge". It uses no Git diamond, no node graph and no octocat.

```svg
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="5.5" fill="#3D4FD1"/>
  <g fill="none" stroke="#F4F5FB" stroke-width="2" stroke-linecap="round">
    <path d="M7 4.5v15M17 4.5v15"/>
    <path d="M12 4.5v3.5c0 0-2.6 1.2-2.6 4s2.6 4 2.6 4v3.5"/>
    <path d="M12 8c0 0 2.6 1.2 2.6 4s-2.6 4-2.6 4"/>
  </g>
</svg>
```

- Threads on the tile: 5.96:1. In dark mode the tile uses `#5967DD` (3.69:1 against `surface-base`) so it doesn't sink.
- A monochrome version (`currentColor`, no tile) is used under forced colours and in small UI spots. At 16 px the stroke becomes 1.5.
- App icons: macOS 1024 squircle on the standard template; Windows ICO at 16, 24, 32, 48, 256; Linux PNG 512 plus SVG.
- **Wordmark:** "GitHeddle", Inter 600, letter spacing −0.01em, one word, one colour (`text-primary`). In the top bar it is 14 px next to the 20 px mark, `space-3` apart.

### 3.10 Control states

**Buttons**

| Variant | Rest | Hover | Pressed | Disabled |
|---|---|---|---|---|
| Primary | `accent` fill, `text-on-accent` | `accent-hover` | `accent-hover` + `scale(0.98)` | `surface-hover` fill, `text-disabled` |
| Secondary | transparent, 1 px `border-strong`, `text-primary` | `surface-hover` | + `scale(0.98)` | border `border-subtle`, `text-disabled` |
| Ghost / icon | transparent, `text-secondary` | `surface-hover`, `text-primary` | + `scale(0.98)` | `text-disabled` |
| Danger | `danger-action` fill, `text-on-accent` | `danger-action-hover` | + `scale(0.98)` | as primary disabled |
| Danger text | transparent, 1 px `border-strong`, `danger` text | `danger-soft` | + `scale(0.98)` | as secondary disabled |

- Disabled never uses `opacity`, because it makes contrast unpredictable.
- **Busy** buttons keep their width, swap the leading icon for a spinning `loader-circle`, set `aria-busy`, and say what is happening: "Pushing 4 repos…".
- **Not yet available** primary buttons in dialogs (Run, Commit, Accept merge, Continue) use `aria-disabled="true"` and stay focusable. The reason is visible text beside the button, linked with `aria-describedby`. Pressing it moves focus to the first unmet requirement and announces it (§20).

**Rows**

| State | Look |
|---|---|
| Hover | `surface-hover` |
| Selected, list focused | `surface-selected` + 2 px left bar in `accent-indicator` (`box-shadow: inset 2px 0 0`) |
| Selected, focus elsewhere | `surface-selected-inactive` + bar in `border-strong` |
| Keyboard focus | 2 px `focus-ring` outline, inset (`outline-offset: -2px`) |
| Pending (optimistic stage) | No bar, because a bar would look like the selection bar. The 72 px slot shows a 12 px spinning `loader-circle` and "Staging…" in `text-caption` `text-secondary` until the core confirms; the accessible name adds ", staging" |
| Needs review / unavailable | All cells `text-secondary` (never opacity) |

**Focus ring.** Controls: `outline: 2px solid var(--gh-focus-ring); outline-offset: 2px`, on `:focus-visible`. Rows, grid cells and editor panes: inset (`-2px`) so virtualised containers don't clip it. Inside a focused tree or grid, the focused row shows the ring even after a mouse click. It is always an outline, never a box-shadow, so it survives forced colours.

**State pills.** `text-caption` 600, 18 px high, `radius-full`, `space-3` padding, a 12 px icon first, soft background with its foreground colour, sentence case: "Merging · 3 conflicted", "Behind 4", "Needs review". The full catalogue is in §5.3.

**Pull request state.** Draft (neutral pill + `git-pull-request-draft`), Open (`success`), Merged (violet: `merge-current` edge on `merge-current` bg), Closed (`danger`). CI: `check` "Checks passed" (`success`), `x` "1 check failed" (`danger`), `circle-dot` "Checks running" (`warning`), `minus` "No checks". The word is always shown.

**Scrollbars.** `scrollbar-width: thin; scrollbar-color: var(--gh-border-strong) transparent`, with WebKit pseudo-elements only as a cosmetic extra (8 px thumb, `radius-full`).

## 4. App shell and layout

### 4.1 Window

- **Native window frame on all three OSes in v0.1.** The app's top bar sits under the OS title bar. A custom title bar means three hit-test schemes and is risky on WebKitGTK/Wayland; revisit after M1.
- **Minimum window: 1024 × 640 px** (Tauri `minWidth` / `minHeight`). First launch: 1280 × 800, or 90 % of the work area if smaller, centred. The window size and position are remembered (UX-09).

```text
┌ OS title bar (native) ───────────────────────────────────────────────────────────────────────────────────┐
│ ▣ GitHeddle │ acme-works ▾ │ Target: Task TK-2636 · 2 ▾ │ ● TK-2636 Onboarding ▾ │      [Start task] [Run pipeline ▾] │ Fetch Pull Push │ Search or run a command…  Ctrl K │ (TA) │ 40 px
├───────────────┬────────────────────────────────────────────────────────────────┬─────────────────────────┤
│ Sidebar 240   │ Centre (min 560)                                               │ Details 320             │
│               │ screen header 40 · toolbar 36 · banners 0–2 × 36 · content     │ header 40 · body · foot │
├───────────────┴────────────────────────────────────────────────────────────────┴─────────────────────────┤
│ Job panel (closed by default, 16rem, opens upward)                                                        │
├───────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ⟳ Pull · 2 of 4 repos   ⏸ 1 run paused │ Fetched 2 min ago │                 Offline · 110% · Activity log │ 24 px
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Regions

| Region | Size | Min / max | Collapse | Landmark |
|---|---|---|---|---|
| Top bar | 2.5rem (40 px), `surface-base`, 1 px `border-subtle` bottom | — | Items shrink in steps (§4.4) | `banner` |
| Sidebar | 15rem (240 px), `surface-raised` | 11.25rem / 22.5rem (180 / 360) | 3rem (48 px) icon rail; Mod+B | `navigation` "Main" |
| Centre | flexible, `surface-sunken` content | 35rem (560 px) min | never | `main` |
| Details panel | 20rem (320 px), `surface-raised` | 16rem / 32rem | hidden, or overlay when space is short; Mod+I | `complementary` "Details" |
| Job panel **new** | 16rem default, resizable, `surface-raised` | 8rem / 60 % of height | closed by default; Mod+J | `region` "Jobs" |
| Bottom bar | 1.5rem (24 px), `surface-base`, `text-caption`, 1 px `border-subtle` top | — | never | `contentinfo` |
| Screen header | 2.5rem | — | — | — |
| Screen toolbar | 2.25rem | — | — | `toolbar` |
| Pane header | 2rem, `surface-raised`, `text-section-title` | — | — | — |

### 4.3 Splitters

- Visible line: 1 px `border-subtle`. Hit area: 6 px, centred, `col-resize` / `row-resize` cursor. Hover (after 150 ms) and focus show a 2 px `accent-indicator` line.
- Role `separator`, focusable, with `aria-valuenow` / `aria-valuemin` / `aria-valuemax` and names like "Resize sidebar", "Resize details panel", "Resize diff".
- Keys: ←/→ (or ↑/↓) move 1rem; Shift moves 4rem; Home / End jump to min / max; Enter toggles collapse. Double-click resets to the default.
- Dragging below min − 40 px snaps to collapsed (rail for the sidebar, hidden for panels). Only the release commits layout; during the drag only a transform moves.
- Sizes are stored at 100 % zoom and scaled by the zoom factor (UX-09).

### 4.4 Breakpoints

Breakpoints use the **effective width** (window px ÷ zoom), so zooming to 200 % reflows the layout instead of clipping it. Space is given up in this order: details panel → sidebar → top bar items.

| Effective width | Sidebar | Details panel | Top bar |
|---|---|---|---|
| ≥ 1440 | 240 docked | 320 docked, open by default | Everything with labels |
| 1200–1439 | 240 docked | docked only if the user opened it, and only while the centre keeps 720 px (so from 1280 up); otherwise an overlay | Fetch / Pull / Push become icon-only (tooltips and names stay) |
| 960–1199 | 48 rail | overlay over the centre's right edge (`elevation-1`, Esc closes, focus moves in) | Search field becomes an icon button "Search (Ctrl+K)" |
| 720–959 | 48 rail | overlay | Start task, task chip and Search stay; the rest moves into "More actions ▾" (the only place items hide; the palette has everything) |
| < 720 (only reached by zoom) | behind a "Menu" button | overlay | as above. Changes list and diff become two views with "← Back to files"; dashboard rows become 2-line cards; merge editor top panes become tabs "Incoming · Current" |

Effective height under 480: dialogs become full-window sheets with a scrolling body and a sticky footer. The user's explicit collapse choice always wins over automatic expansion.

**The centre never drops below 720 px because of a docked panel.** When opening or widening the details panel would push the centre under 720 px, the panel opens as an overlay instead. Each screen defines what it hides between 720 and its full width (dashboard §5.2 and §5.7, Changes §8.1).

Changes, Conflicts and the merge editor hide the details panel by default because they need the width; the user can show it with Mod+I and the choice is remembered per screen.

### 4.5 Top bar (left → right)

1. **Mark and wordmark** (not a button).
2. **Workspace picker** `acme-works ▾`, max 200 px, truncated. Menu: Open folder…, Import VS Code workspace…, Rescan for repos, Workspace settings. In v0.2 (DASH-08) the list of workspaces appears above.
3. **Target picker** `Target: Task TK-2636 · 2 ▾`, max 240 px (§4.7).
4. **Active-task chip** (§4.8).
5. Flexible spacer.
6. **[Start task]** (primary, Mod+N) and **[Run pipeline ▾]** (secondary).
7. 1 px divider, then **Fetch · Pull · Push** as a toolbar of ghost buttons with icons and labels. Tooltips name the target: "Pulls 2 repos (Task TK-2636). Brings new commits from origin. Stops if it can't fast-forward." While a job of that kind runs, the button shows a spinner and a second click opens the job panel, never a second job.
8. **Search field**, 200–320 px, placeholder "Search or run a command…", key hint `Ctrl K` / `⌘K`. Clicking it opens the palette.
9. **Account badge**, 24 px circle with initials (TH-07). Signed in: initials on `surface-selected`; menu "Signed in as dev-taosif-net", Open GitHub profile, Sign out. Signed out: a hollow circle with `user` icon, tooltip "Not signed in to GitHub"; click opens sign-in.

The top bar is one toolbar tab stop with ←/→ inside it.

### 4.6 Sidebar

```text
 Repositories          6  ⚠
 Changes               8
 Pull requests         1
 Conflicts             1
 Pipelines
 ─────────────────────────
 Tasks                    +
   ● TK-2636 Onboarding  Active
     TK-2601 Cost centres
     Show all (6)
 Pipelines                +
   ▷ Update from main
   ▷ Update from main, merge into dev
   ▷ Update from main, pull request to dev
 Groups                   +
   backend                4
   frontend               1
   docs                   2
 ─────────────────────────  (pinned to the bottom)
 Activity log
 Settings
```

- **Screens first, objects after, Activity log and Settings pinned to the bottom**, so navigation never moves however many tasks there are. The label is "Repositories", not "Repos".
- Items are `row-height`, 12 px left padding, 16 px icon, `text-body` label, count right-aligned in `text-caption`. Selected: `surface-selected` + 2 px `accent-indicator` bar + `text-body-strong`.
- **Counts** are store selectors over trusted repos only. Repositories: number of repos, plus a `triangle-alert` icon in `warning` if any repo needs review or has a risky badge. Changes: changed files in all repos. Pull requests: the active task's open PRs, plus a 6 px `danger` dot if any has failing checks or changes requested. Conflicts: **repos** in a merge, rebase or cherry-pick; tooltip "1 repo, 3 conflicted files". Counts cap at "99+". While state comes from cache, counts are `text-secondary` with the tooltip "Updating…".
- **The icon and the dot are never the only signal.** Each has a tooltip with one sentence, and the item's accessible name says the same thing: "Repositories, 6, 1 needs review", "Pull requests, 1 open, 1 has a failing check" (or "…, 1 has changes requested"). See §20.1.
- **Section headers** "Tasks", "Pipelines", "Groups" are Disclosures in `text-section-title` with a `+` icon button ("Start task", "New pipeline", "New group").
- **Tasks** shows the active task first with an "Active" word (not just a dot), then up to 4 recent tasks, then "Show all (n)", which opens the palette filtered to tasks. Row hover shows [Switch]. Context menu: Open task, Switch to this task, Run pipeline on task ▸, Add repos…, Rename…, Finish task… (v0.2).
- **Pipelines** rows show a ▶ on hover: "Run on Target: Task TK-2636", which opens the preview (2 clicks to run). Built-in pipelines show a `lock` icon, tooltip "Ready-made. Duplicate it to change it".
- **Groups**: clicking a group filters the dashboard to it and sets the target to it (§4.7).
- **Rail mode** (48 px): only the 5 screen icons, Activity log and Settings, 40 px squares, counts as corner badges, labels as tooltips and accessible names.
- **Keyboard:** one tab stop, ↑/↓ roving focus, Enter activates, type-ahead.

### 4.7 Target rule

The target is what Fetch, Pull, Push, Run pipeline and task-less actions act on. The picker lists:

```text
 Target
 ● Active task  TK-2636           2 repos
 ○ Selection                      3 repos      (only when something is ticked)
 ○ All repos                      6 repos      (1 needs review, not included)
 ── Groups ──
 ○ backend                        4 repos
 ○ frontend                       1 repo
 ○ docs                           2 repos
 ──
   Manage groups…
```

**Precedence:**

1. Ticking a checkbox on the dashboard switches the target to **Selection (n)**. The previous target is remembered and a chip "← Back to Task TK-2636" appears next to the picker. Clearing the selection restores it.
2. Clicking a group in the sidebar filters the dashboard to that group and sets the target to it, so the rows shown are the rows acted on. Removing the group filter restores the previous target.
3. Typing in a filter field never changes the target. The toolbar says "Showing 2 of 6 · target unchanged: Task TK-2636".
4. Choosing in the picker is explicit and persists (UX-09).
5. With no active task and nothing chosen, the target is All repos.
6. Repos that need review are never in a target.

When the target changes, the picker's background shows `info-soft` for 600 ms (opacity fade, none under reduced motion) and the announcer says "Target: selection, 3 repos". Every preview repeats the target in its title.

### 4.8 Active-task chip

| State | Look | Click |
|---|---|---|
| Active task | `● TK-2636 Onboarding ▾`: dot in `accent`, key in `text-code`, title truncated at 160 px | Menu: Open task · Commit task… · Sync with dev · Create pull requests · Merge task into… · Run pipeline on task ▸ · Switch task… · Finish task… (v0.2) |
| Partly switched | `● TK-2636 ⚠ ▾`, tooltip "app-api isn't on the task branch." | Same menu with "Switch remaining repos" at the top |
| Switching | spinner + "Switching to TK-2601…" | Opens the job |
| No task | `No active task ▾` in `text-secondary` | Start task… · Switch task… (recent tasks) |

"Sync with **dev**" uses the task's real base. If repos have different bases, it says "Sync with base".

**Where each menu item lands:** Open task → the Task screen. **Commit task…** → the Changes screen, filtered to the task's repos, with the commit scope set to "Task TK-2636 · 2 repos" and focus in the message field (§8.6); there is no separate dialog. Sync with dev, Create pull requests and Run pipeline on task → their previews. Merge task into… → §7.7. Switch task… → §7.5. Add repos… → §7.6.

### 4.9 Bottom bar

| Slot | Content |
|---|---|
| Left: job chips | Idle: "Nothing running" (`text-secondary`). Running: spinner + "Push · 2 of 4 repos" + an 80 × 4 px progress bar. Paused: `pause` in `warning` + "Update from main → dev · 1 paused". Failed: `x` in `danger` + "Fetch · 1 failed". Done: `check` + "Push · done", which collapses into the job panel's Recent list after 10 s. At most 3 chips, then "+2 more". A new job's chip pulses once (opacity 1 → 0.6 → 1, 300 ms; none under reduced motion). Click opens the job panel on that job |
| Middle | "Fetched 2 min ago" (most recent fetch). Tooltip: "Oldest: knowledge-hub, 3 days ago". After 60 min: "Fetched 2 h ago · Fetch now" |
| Right | "Offline" chip in `warning` (only when the network fails) · zoom "110%" (only when not 100 %; click resets) · "Activity log" link |

### 4.10 Job panel

A docked, non-modal region that opens upward from the bottom bar (closed by default; Mod+J or a click on a job chip). It is where progress and results live after the action-flow dialog closes, so a 30-repo result has room.

- Left column 14rem: job list grouped **Running**, **Paused**, **Needs attention** (finished with failures), **Recent**. Each row: "Sync with dev · Task TK-2636 · 1 succeeded, 1 paused" and a [Dismiss] icon. Footer: "Dismiss all finished".
- Right: the selected job's progress view or result (§12.6–§12.7). A pipeline shows a compact grid and [Open run], which goes to Pipelines → run grid.
- Esc closes the panel. Results stay until dismissed.
- Empty: "Nothing running. Actions you run show their progress here."

### 4.11 Banners and notices

Banners sit under the screen toolbar: 2.25rem tall, soft background of their tone, a 16 px icon, one sentence, one action, and a dismiss × when not blocking. At most two show; more collapse into a "1 of 3 ▾" switcher. Priority:

| # | Tone | Text | Action |
|---|---|---|---|
| 1 | warning | GitHeddle closed while "Update from main → dev" was running. app-api is paused at Push (interrupted). 1 repo finished. | [Review run] |
| 2 | warning | 1 repo needs review before GitHeddle runs Git in it. | [Review repos] |
| 3 | warning | Your GitHub sign-in has expired. Pull request status and creation are paused. | [Sign in again] |
| 4 | info | Can't reach github.com. Local work still works. Fetch, Pull, Push and pull requests will wait. | [Try again] |
| 5 | info | The team file for acme-works changed. (v0.2) | [Review it] |

### 4.12 Toasts

- Bottom right, `space-4` above the bottom bar (or the job panel), 22.5rem wide, `surface-overlay`, `elevation-1`, `radius-lg`, 4 px left bar in the tone colour, icon, 1–2 lines, optional action, ×.
- At most 3 stacked, newest at the bottom.
- Durations: success 4 s; info and failure 6 s; with an action 8 s; with Undo 10 s. They pause while hovered or focused.
- A toast is never the only place for a failure or a pause: the job chip keeps it until dismissed.
- The toast region is in the F6 cycle; role `status`.

## 5. Repositories dashboard (DASH-01..08)

### 5.1 Anatomy

```text
Repositories   Sorted by: Needs attention                                                       ◀ ▶
[⌕ Filter repos…  Ctrl F] [Dirty] [Behind] [Conflicts] [Unpushed] [Group ▾] [Task ▾]    Updated 12 s ago ⟳  [Columns ▾]
⚠ app-api is in the middle of a merge (3 files with conflicts). Finish or abort it before starting new work there. [Resolve conflicts] [Abort merge…]
┌ Getting started · 4 of 6 done ─────────────────────────── Next: Commit your changes  [Open Changes]   [Hide] ┐
☐ │ Repo              │ Branch                     │ Origin      │ vs dev     │ Changes       │ State                       │ Task / PR        │ Fetched
  │ vendor-sdk        │ —                          │ —           │ —          │ —             │ Needs review   [Review]     │                  │ —
☐ │ app-api           │ dev                        │ Up to date  │ –          │ 6 · 3 staged  │ Merging · 3 conflicted      │ TK-2636          │ 2 min
☐ │ app-report-api    │ main                       │ 1 to pull   │ –          │ ·             │ Behind 1                    │                  │ 2 min
☐ │ app-front         │ TK-2636-taosif-Onboarding  │ ↑ 2 to push │ 4 behind   │ 2             │ 2 to push                   │ TK-2636 · #412 ✓ │ 2 min
☐ │ app-scheduler-api │ main                       │ Up to date  │ –          │ ·             │ Clean                       │                  │ 2 min
☐ │ app-signalr-api   │ main                       │ Up to date  │ –          │ ·             │ Clean                       │                  │ 2 min
☐ │ knowledge-hub     │ main                       │ Up to date  │ –          │ ·             │ Clean                       │                  │ 3 d ⚠
```

The example state used in every section of this document: **vendor-sdk** needs review. **app-api** is on `dev`, in the middle of merging `TK-2636-taosif-Onboarding` into `dev` (3 conflicted files, 6 conflicts); its task branch has 5 commits ahead of `dev`, isn't on origin yet and has no pull request. **app-front** is on the task branch with 2 commits to push, 4 behind `dev`, 2 changed files and pull request #412 (checks passed 4/4, approved). Nothing is ticked, so the target is still Task TK-2636 and the filter toolbar shows (§5.6). Rows are in the default "Needs attention" order (§5.2). Getting started is at 4 of 6: committing and creating pull requests (app-api has none yet) are still open.

The table is a React Aria Table on `surface-sunken`: 24 px rows, 1 px `border-subtle` between rows, a sticky 28 px header on `surface-raised` in `text-body-strong`.

### 5.2 Columns

Values are phrased in words. Arrow glyphs may appear next to words, never instead of them.

| # | Column | Width | Content | Sort |
|---|---|---|---|---|
| 1 | ☐ | 32 px | Checkbox; the header is tri-state, "Select all 6 visible" | — |
| 2 | Repo | flex, min 160 | `text-body-strong`. A 12 px `history` icon in `text-secondary` while the row is from cache (tooltip "Showing last known state, updating…"). Row actions at the cell's right end (§5.5) | name |
| 3 | Branch | 220 | `text-code`, middle-truncated keeping the ticket and the end (`TK-2636-taos…Onboarding`); full name in the tooltip. Detached: `unlink` + `a1b2c3d`. Unborn: "No commits yet" | name |
| 4 | Origin | 112 | "2 to push", "1 to pull", "Up to date", "Not published", "Diverged · 2 ↑ 1 ↓". All in `text-primary`, with a 12 px `arrow-up-from-line` before "to push" and `arrow-down-to-line` before "to pull" (never `text-link`, which would make plain text look like a link) | behind, then ahead |
| 5 | vs dev | 96 | Header reads "vs dev" when every repo has the same base, else "vs base". "4 behind", "3 ahead · 4 behind", "Up to date", "–" when on the base. Tooltip: "dev has 4 commits this branch doesn't have. Sync to bring them in." | behind |
| 6 | Changes | 96 | Changed files, plus "· 3 staged" when some are staged ("6 · 3 staged"); tooltip "3 staged · 2 changed · 1 untracked"; "·" when clean | total |
| 7 | State | flex, min 200 | One primary pill, at most one secondary pill, then "+N" (§5.3). Rows never grow taller | priority |
| 8 | Task / PR | 140 | Task key chip (click opens the task), then `#412` with a CI icon | task |
| 9 | Fetched | 72 | "2 min", "1 h", "3 d". Over 24 h: `warning` text + `triangle-alert`, tooltip "Last fetched 3 days ago. Fetch to see new commits." | age |

- **Narrow centre.** The widths above need about 1,130 px. Below that, columns give way in this order, and nothing ever scrolls sideways:

  | Centre width | What changes | Minimum total |
  |---|---|---|
  | ≥ 1,130 | Every column at the widths above | 1,128 |
  | 960–1,129 | Fetched (9) hides: an age over 24 h shows as a `triangle-alert` in the Repo cell, with the same tooltip. Repo min 140, Branch 180, State min 160 | 956 |
  | 720–959 | Task / PR (8) hides too: the task key becomes a secondary pill in State, the PR number goes into the row tooltip. Origin (4) and vs dev (5) merge into one 128 px "Sync" column ("2 to push · 4 behind"). Branch 160 | 716 |

  At the default 1,280 × 800 window with the details panel open, the centre is exactly 720 px, so the last row applies. The centre is never narrower than 720 px while a panel is docked (§4.4); below that only zoom can take it, and rows become 2-line cards. [Columns ▾] shows or hides columns 3–9; the choice is saved per workspace and applies on top of these rules.
- A header click sorts ascending, a second click descending, a third clears. Shift+click adds a second key.
- **The default order is "Needs attention"**: State priority, then name. The header says "Sorted by: Needs attention" until the user picks another sort.

### 5.3 State pill catalogue

One catalogue, shared by the dashboard, the details panel, the Task screen and previews.

| Priority | Pill text | Tone | Icon | When | Action in the details panel |
|---|---|---|---|---|---|
| 1 | Needs review | warning | `shield-question` | GS-08 untrusted | [Review] |
| 2 | Can't read repo | danger | `x` | Status failed, folder missing, `safe.directory` refused | [Show Git output] [Locate…] [Remove from workspace] |
| 3 | Merging · 3 conflicted / Rebasing 2 of 5 · 1 conflicted / Cherry-picking · 1 conflicted | `status-conflicted` on `merge-unresolved` | `git-compare` | Operation with conflicts | [Resolve conflicts] [Abort merge…] |
| 4 | Merging · ready to continue | info | `git-merge` | Operation with 0 conflicts | [Continue merge] |
| 5 | Pulling… | info | spinner | A job runs in this repo | Row actions other than Open are aria-disabled: "Pull is running here" |
| 6 | Detached HEAD | warning | `unlink` | DASH-07 | [Create branch here…] [Switch branch…] |
| 7 | Diverged · 2 ↑ 3 ↓ | warning | `split` | DASH-07 | "This branch and origin both have new commits. Pull will stop; merge or rebase is needed." |
| 8 | 2 commits on dev | warning | `shield` | Local commits on a protected branch (DASH-07) | [Create branch from here…] |
| 9 | Can't push: no Git login | warning | `key-round` | The first-run reachability check failed (§17.5) | [How to set up a Git login] |
| 10 | Behind 4 | info | `arrow-down-to-line` | Behind upstream | [Pull app-report-api] |
| 11 | 2 to push | info | `arrow-up-from-line` | Ahead of upstream | [Push app-front] |
| 12 | Not published | neutral | `cloud-off` | No upstream | [Publish branch] |
| 13 | 6 changed | neutral | `circle-dot` | Dirty only | [Open in Changes] |
| secondary | 1 stash · githeddle/TK-2636 | neutral | `archive` | A GitHeddle-made stash (v0.1); any stash in v0.2 (DASH-07) | Lists the stashes |
| 14 | Clean | `success` text, no fill | `check` | Nothing else applies | — |

Neutral pills are `text-secondary` on `surface-hover`. Every pill has a one-sentence tooltip, and the row's accessible name includes the pill text.

### 5.4 Row states

| State | Look |
|---|---|
| Cached (first paint, PERF-02) | Normal contrast, the `history` mark, cached values. Toolbar "Updating 6 repos…" until all are live, then "Updated just now" |
| Discovering (no cache) | Rows appear as the core finds repos. After 150 ms, uncached cells show a static 40 × 8 px `surface-hover` bar. State says "Reading…" |
| Live | No mark |
| Changed live | The changed cell shows `info-soft` for 400 ms (opacity only, none under reduced motion). Not announced |
| Busy | The busy pill. Checkboxes stay usable (PERF-05) |
| Needs review | Every cell `text-secondary`, every status cell "—". The checkbox is disabled with the tooltip "Review this repo before GitHeddle can act on it." [Review] opens the trust dialog with only this repo |
| Error | The danger pill. Other cells keep their last values in `text-secondary`, tooltip "Last known value" |
| Offline | Rows don't change (local status still works). The offline banner shows, and Fetched keeps ageing |

### 5.5 Row actions and context menu

On hover or focus, three 24 px icon buttons appear at the right of the Repo cell: **Open in VS Code** (the label follows the configured editor, for example "Open in Rider"), **Open terminal** and **⋯**. They stay visible on the focused row and are reached with → from the name cell.

The ⋯ menu is also the context menu (right-click, Shift+F10, the Menu key):

```text
Open in VS Code
Open terminal here
Open in file manager
Open on GitHub
────────
Fetch app-api
Pull app-api
Push app-api
Switch branch…
Create branch…
────────
Add to task ▸
Add to group ▸
────────
Copy path
Repo settings…
Remove from workspace…
```

"Open in file manager" is the same label on every OS. Fetch, Pull and Push in this menu act on this repo only, and the label says so.

### 5.6 Selection (DASH-05)

- Click a checkbox to toggle it; Shift+click selects a range. In the table: Space toggles, Shift+Space extends, Mod+A selects all visible rows, Esc clears.
- **Clicking the row itself (not the checkbox) focuses it and shows it in the details panel. It doesn't change the selection.** Enter opens the details panel if it is hidden and moves focus there.
- The selection survives refresh and filtering. Selected rows hidden by a filter are counted.
- With one or more rows selected, a **selection bar** replaces the filter toolbar (same 36 px): `3 selected (1 hidden by filter) · Clear │ [Pull 3 repos] [Push 3 repos] [Switch branch…] [Start task with these] [Run pipeline ▾] [More ▾]`. Below a 960 px centre, [Switch branch…] and [Start task with these] also move into More ▾.
- **More ▾** holds the rest of BULK-01, each opening its preview (§5.9): Fetch 3 repos · Create branch… · Stash 3 repos · Pop stash… · Merge a branch into… · Delete local branch… · Commit… (opens Changes with the scope set to the selection) · Add to task ▸ · Add to group ▸.

### 5.7 Toolbar and filters (DASH-03)

- The filter field is 240 px, placeholder "Filter repos…". Mod+F focuses the current screen's filter.
- Toggle chips: Dirty, Behind, Conflicts, Unpushed (24 px). An active chip shows its count: "Behind · 2". Group ▾ and Task ▾ are select chips. Chips combine with AND, and "Clear filters" appears when any is on.
- Refresh (F5 / ⌘R) with "Updated 12 s ago". During a refresh the icon spins and the button is busy.
- **Narrow centre (under 960 px).** The filter field becomes 180 px (240 px on focus); the four toggle chips stay; Group ▾, Task ▾ and [Columns ▾] move into a **"More filters ▾"** menu, whose label counts the active ones ("More filters · 1"); "Updated 12 s ago" becomes the refresh icon alone, with the age in its tooltip and accessible name. Total at 720 px: about 650 px.

### 5.8 Empty and blocking states (UX-06)

| Case | Content |
|---|---|
| No workspace | `icon-xl` `folder-git-2`. Headline "Open your repos". Body "Choose the folder where your Git repos live, or import a VS Code workspace." [Choose folder…] (primary, `control-lg`) [Import VS Code workspace…] |
| No repos found | "No Git repos found in C:\Work\acme. GitHeddle looked 2 folders deep." [Look 3 levels deep] [Choose another folder] |
| Filter matches nothing | "No repos match "sched" with Behind." [Clear filters] |
| Git missing or too old (GS-01) | The full centre blocker (§17.1) |
| All repos need review | Dimmed rows, and focus goes to the review banner |

### 5.9 Bulk operations from the selection (BULK-01)

Every item in the selection bar and in More ▾ opens the shared action flow (§12) on the selection, except Fetch, which is read-only and runs at once with a toast. Each row below gives the inputs, the per-repo plan sentence, the inline choices (nothing preselected, §12.5) and the primary button.

| Operation | Inputs (§12.2) | Plan sentence per repo | Inline choices and special rows | Button |
|---|---|---|---|---|
| Switch branch… | Branch: a ComboBox of branch names found in any selected repo | "Switch from `TK-2636-taosif-Onboarding` to `dev`" | Uncommitted changes: Take them along (clean switch only) · Stash · Skip. Branch only on origin: Check it out and track origin · Skip. Branch nowhere: Skipped "No branch `dev` in app-report-api" | Switch 3 repos to dev |
| Create branch… | Name (validated as in §7.4) · From: ( ) Each repo's current branch ( ) `origin/<base>`, nothing preselected · ☐ Switch to it | "Create `spike-logging` from `dev` and switch to it" | Name already exists: Switch to it · Skip. Uncommitted changes when switching: as Switch branch | Create branch in 3 repos |
| Stash | Name, prefilled `githeddle/TK-2636` (or `githeddle/manual` with no task) · ☐ Include new (untracked) files, off | "Stash 4 changed files as `githeddle/TK-2636`" | Clean repo: under "Nothing to do" | Stash 3 repos |
| Pop stash… | — | "Bring back `githeddle/TK-2636` (4 files, 2 h ago) into `TK-2636-taosif-Onboarding`" | Several stashes: a per-row picker, nothing preselected, GitHeddle stashes first. Files also changed since the stash: `warning` sub-line "Program.cs changed since. This may conflict; if it does, the stash is kept and the repo pauses." No stash: "Nothing to do" | Pop stash in 2 repos |
| Merge a branch into… | Branch to merge in: a ComboBox, default `origin/<base>` (`origin/dev`) · Into: each repo's current branch, shown per row, never chosen globally | "Merge `origin/dev` (4 new commits) into `TK-2636-taosif-Onboarding`" | Uncommitted changes: Stash · Skip. Current branch protected: the confirmation block (§12.8). Already contains it: "Nothing to do". Conflicts pause the repo (§12.7) | Merge into 3 repos |
| Delete local branch… | Branch: a ComboBox of local branch names in the selection | "Delete local `spike-logging` (already merged into `dev`)" | Unmerged commits: a loss row on `danger-soft` that lists each commit (§12.9). Checked out here: Skipped "`spike-logging` is checked out in app-api. Switch first." [Switch branch…]. Protected: Skipped "GitHeddle doesn't delete protected branches." | Delete branch in 2 repos · with losses: Delete branch in 2 repos, losing 4 commits (`danger-action`) |
| Commit… | — | — | Opens Changes with the commit scope set to the selection (§8.6) | — |

Delete local branch follows the destructive rules: initial focus on Cancel, Mod+Enter does nothing (§12.10). The remote branch is never touched from here.

### 5.10 Group editor (GRP-01)

Opened from the `+` on the sidebar's Groups header ("New group"), a group's context menu (Rename…, Edit group…, Delete group…), "Manage groups…" in the target picker, and Settings → Workspace → Groups.

```text
New group                                                        ×
Name   [ backend                    ]
Repos  [⌕ Filter repos…]                              4 of 6 ticked
       ☑ app-api            ☑ app-report-api
       ☑ app-scheduler-api  ☑ app-signalr-api
       ☐ app-front          ☐ knowledge-hub
       ☐ vendor-sdk  Needs review (it can be in a group; actions still skip it)
Default reviewers (for pull requests)  [ (AL) alice  + ]   (optional)
                                           [Cancel]  [Create group · 4 repos]
```

- A `gh-dialog--md` dialog. Name is required and unique in the workspace: "A group named backend already exists." Repos is a checklist with a filter; nothing is ticked for a new group, unless it was opened from a dashboard selection ("New group from selection"), which ticks those rows.
- **No preview.** A group is a GitHeddle setting and changes nothing in Git, so it saves directly (R38). The button names the result: "Create group · 4 repos" or "Save group · 4 repos".
- Result: toast "Group backend created with 4 repos. [Make it the target]". The group appears in the sidebar and the target picker at once.
- Delete: an AlertDialog "Delete the group backend? Its 4 repos stay in the workspace; only the group goes." [Cancel] [Delete group]. Not a SAFE-03 case: nothing in Git is lost.
- Sharing groups through the team file (GRP-02, CFG-03) is a v0.2 toggle in this dialog, shown disabled with "Coming in v0.2".

## 6. Right details panel

- **Header** (40 px): kind icon, title, [Pin] and [×]. A pinned panel keeps its object; an unpinned one follows the focused row.
- **Body** scrolls. Sections are Disclosures with `text-section-title` headers and 12 px padding. Their open or closed state is remembered per kind.
- **Footer** (44 px, sticky): the object's actions.
- **Empty:** "Select a repo, task or pull request to see its details."

### 6.1 Repo

```text
app-api                                         [Pin] [×]
C:\Work\acme\app-api                     (middle-truncated) [Copy]
[Open in VS Code] [Terminal] [⋯]

┌ merge-unresolved card ─────────────────────────────┐
│ Merging TK-2636-taosif-Onboarding into dev          │
│ 3 conflicted files, 6 conflicts                     │
│ [Resolve conflicts]   [Abort merge…]                │
└─────────────────────────────────────────────────────┘
Branch
  dev  (protected)                     [Switch branch…]
  Upstream  origin/dev · Up to date
  Base      dev
Changes
  3 staged · 2 changed · 1 untracked
  !  Api.csproj                 Api
  M  Program.cs                 Api            +8 −2
  … 4 more                      [Open in Changes]
Warnings    (one card per DASH-07 pill: one sentence and an action)
Stashes
  githeddle/TK-2636 · 2 h ago · 4 files
Task and pull request
  Part of TK-2636 Onboarding  →
  No pull request yet: TK-2636-taosif-Onboarding has 5 commits ahead of dev.
Repo
  Last fetch 2 min ago · Base override: none  [Repo settings…]
──────────────────────────────────────────────────────
[Fetch app-api] [Pull app-api] [Push app-api]
```

With several repos selected, the panel says "3 repos selected" and shows the totals (changes, behind, to push), the pills that apply ("1 merging"), [Start task with these] and [Run pipeline ▾].

### 6.2 Task

The header is "TK-2636 · Onboarding". Below it: the branch in `text-code` with [Copy]; "Base dev · 2 repos · Active"; the Next step card (§7.2); a mini list of repos (name, pill, PR number); "1 pull request · checks passed · app-api has none yet". Footer: [Sync with dev] [Create pull requests] [Open task].

### 6.3 Pull request

```text
#412  TK-2636: Onboarding                       [Pin] [×]
app-front · TK-2636-taosif-Onboarding → dev
Open · created 2 h ago by (TA) dev-taosif-net
Checks       Checks passed · 4 of 4        (name · result · duration)
Review       (JM) approved · (RK) review requested
Merge        Can merge
Comments     3
Description  (sanitised markdown, UN-02)
  [image: architecture.png]  [Copy link]
  https://example.com/spec   [Copy]        (shown in full, not clickable, UN-04)
Related pull requests
  None yet. app-api's pull request is linked here when it's created.
───────────────────────────────────────────────────────
[Open on GitHub]          (v0.2: [Mark ready] [Add reviewers] [Merge…])
```

Images are never loaded. Each one is shown as `[image: name]` with a [Copy link] button (TH-07). Links to `https://github.com/…` open in the system browser. Any other URL is shown in full with [Copy] and is never opened.

## 7. Task screen and Start task

### 7.1 Task screen

```text
TK-2636 · Onboarding                                              Active task            ◀ ▶
TK-2636-taosif-Onboarding [Copy] · base dev · created 3 Nov · 2 repos
[Resolve conflicts] [Commit…] [Sync with dev] [Create pull requests] [Merge into… ▾] [Run pipeline ▾] [⋯]

┌ Next step ─────────────────────────────────────────────────────────────────────────────────┐
│ app-api has 3 conflicted files. Resolve them before anything else.   [Resolve conflicts]    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
Repos                                                                              [+ Add repos]
  Repo        Branch                         Origin       vs dev     Changes  State                     Pull request
  app-api     dev  ⚠ not on task branch       Up to date   –          6        Merging · 3 conflicted    —      [Switch]
  app-front   TK-2636-taosif-Onboarding      2 to push    4 behind   2        2 to push                 #412
Pull requests
  #412 app-front  TK-2636: Onboarding   Open   Checks passed 4/4   Approved (1)   Can merge   3 comments  [↗]
  —    app-api    No pull request yet: 5 commits ahead of dev, not on origin.  [Create pull requests]
Recent runs
  Sync with dev · 14:02 · 1 succeeded, 1 paused  [Open]
```

- The header badge says "Active task" or "Not active".
- The action bar's first button is the Next step action, styled as primary. The rest are secondary.
- The ⋯ menu: Add repos…, Remove repo from task…, Rename…, Copy branch name, Finish task… (v0.2), Show in activity log.
- The repos table is the dashboard table, with a "Pull request" column in place of "Task / PR".

### 7.2 Next step card

The card is a selector over store state. It is `info-soft`, `radius-lg`, 12 px padding. The first rule that matches shows one sentence and one button:

| Rule | Text | Button |
|---|---|---|
| A task repo is in conflict | "app-api has 3 conflicted files. Resolve them before anything else." | Resolve conflicts |
| A repo isn't on the task branch | "app-api is on dev, not on the task branch." | Switch app-api |
| Changed files | "app-front has 2 changed files. Next: commit them." | Open Changes |
| Commits not in a pull request | "2 repos have commits that aren't in a pull request yet." | Create pull requests |
| Behind the base | "dev has 4 new commits. Sync to stay up to date." | Sync with dev |
| A PR's checks are failing | "#412 in app-front has a failing check." | Open pull request |
| All PRs approved and mergeable | "Both pull requests are approved and can merge." | Open on GitHub (v0.2: Merge pull requests…) |
| Nothing to do | — | The card is hidden |

### 7.3 Task screen states

| State | Treatment |
|---|---|
| Inactive task | `info` banner: "This isn't the active task. Actions here still apply to its repos." [Make active] |
| No repos | "TK-2636 has no repos. Add the repos this ticket touches." [Add repos] |
| Repo removed from the workspace | The row in `text-secondary`: "Not in this workspace" [Remove from task] |
| Signed out | PR section: "Sign in to GitHub to create and track pull requests." [Sign in to GitHub] |
| Loading | Cached values with the cache mark |

### 7.4 Start task dialog (Flow 1, TASK-01/02)

This is the shared action flow with an **inputs section** above the preview (§12.2), 55rem wide. It opens in the same frame as the click, with the cursor in Ticket.

```text
Start a task · Target: Selection · 2 repos                                                   ×
Ticket  [TK-2636      ]   Title [Onboarding                           ]
Branch  TK-2636-taosif-Onboarding                                           [Edit]
        From the pattern {ticket}-{user}-{title}. Change it in Settings.
Base    [dev ▾]   app-report-api uses main (repo setting)
Repos   [backend 4] [frontend 1] [docs 2] [Selected on dashboard 2]    ☑ app-api ☑ app-front ☐ …  (2 of 6)
☐ Publish the branch to origin now (creating pull requests does this for you later)
── Preview ─────────────────────────────────────────────────────────────── Updated just now
 ☑ ●  app-api     Create TK-2636-taosif-Onboarding from origin/dev (fetches first) and switch to it
 ☑ ▲  app-front   Create from origin/dev and switch to it      ( ) Take them along  ( ) Stash  ( ) Skip
                  2 changed files: cost-center.service.ts, cost-center-list.component.html
 ▸ Skipped (1)    vendor-sdk: needs review
 ℹ Unsaved edits in your editor aren't seen by Git. Save all files first.
 ▸ Show Git commands
───────────────────────────────────────────────────────────────────────────────────────────────
Choose what to do with app-front's 2 changed files.                  [Cancel]  [Start task in 2 repos]
```

**Inputs**

- **Ticket** (160 px, `text-code`), placeholder "TK-1234", hint "Used at the start of branch names and commit messages." Required in v0.1 (see §25).
- **Title**, placeholder "Short title, like Onboarding". It becomes PascalCase in the branch name (PRD assumption 2).
- **Branch** is derived and read-only until [Edit] makes it a field. Then "Reset to pattern" appears.
- **Base** is a ComboBox of the branches common to the ticked repos, defaulting to the setting.
- **Repos** default to the dashboard selection, if any (chip "Selected on dashboard 2" active). Otherwise the target group is ticked. Otherwise nothing is ticked and the button reads "Choose repos". Group chips toggle all their repos.
- **Publish** is off by default and remembers the last choice.

**Live plan.** 300 ms after the last keystroke or tick, the core re-plans. The previous preview stays, at reduced emphasis, with "Updating…", so it never flashes empty. Fetching happens at run time, which the plan says ("fetches first").

**Per-repo choices** (SAFE-04, TASK-02). Nothing is ever preselected.

| Case | Choices |
|---|---|
| Uncommitted changes, and the switch is clean | **Take them along** (tag "Recommended: nothing is lost") · Stash · Skip |
| Uncommitted changes, and the switch would conflict | Stash · Skip |
| The branch exists locally | Switch to it · Skip |
| The branch exists on origin | Check it out and track origin · Skip |
| Local commits on the base that origin doesn't have (the "2 commits on dev" pill) | **Bring them into the task branch** (the branch starts from local `dev`, so it includes them) · **Leave them on dev** (the branch starts from `origin/dev`; the pill stays). Sub-line lists the commits: "a1b2c3d Fix typo · 9f3e2a1 Add field" |
| The base can't fast-forward (`dev` and `origin/dev` have both moved) | Leave them on dev · Skip. Sub-line: "Your dev has 2 commits origin doesn't, and origin has 4 new ones, so GitHeddle can't update dev. The task branch starts from origin/dev and dev is left as it is." |
| Mid-merge, needs review, can't read | No choice. Listed under "Skipped (n)" with the reason and a fix link |

Stash creates `githeddle/TK-2636`, and the sub-line says "Stash as githeddle/TK-2636. You can bring it back when you switch back."

**Validation**, inline under the field, from core codes: "Enter a ticket key, like TK-2636." · "Branch names can't contain spaces or `..`, or start with `-`. Try TK-2636-taosif-Onboarding."

**Keys.** Mod+Enter runs once everything is ready. Esc cancels; if anything was typed, it asks "Discard this task? [Keep editing] [Discard task]".

**Result.** The dialog closes into a job. Toast: "Task TK-2636 started in 2 repos. Now the active task. [Open task]". Partial: "Task TK-2636 started in 1 of 2 repos. app-api: fetch failed (can't reach origin). [View result]". The top-bar chip updates at once.

### 7.5 Switch task dialog (TASK-03, SAFE-04)

Opened from the task chip (Switch task…), Mod+T, a sidebar task row's [Switch], or the palette. One dialog, two stages:

1. **Pick the task.** A list in the dialog's inputs section, filtered as you type: "TK-2601 · Cost centres · 3 repos · active 2 days ago". The current task is listed but disabled ("Active now"). Enter or a click picks a task and the preview loads below, in the same frame.
2. **Preview** (the shared action flow), titled "Switch to TK-2601 · 3 repos".

```text
Switch to TK-2601 · Cost centres · 3 repos                                                 ×
Task [ TK-2601 · Cost centres ▾ ]
 ☑ ▲  app-api     Switch from dev to TK-2601-taosif-CostCentres
                  6 changed files            ( ) Take them along  ( ) Stash  ( ) Skip
 ☑ ●  app-front   Switch from TK-2636-taosif-Onboarding to TK-2601-taosif-CostCentres
                  ☐ Bring back your stashed changes (githeddle/TK-2601 · 3 files · 2 days ago)
 ☑ ●  app-hr-api  Check out TK-2601-taosif-CostCentres from origin and track it
 ▸ Not part of TK-2601 (0)   ▸ Skipped (0)   ▸ Show Git commands
 ℹ Unsaved edits in your editor aren't seen by Git. Save all files first.
Choose what to do with app-api's 6 changed files.                [Cancel]  [Switch 3 repos to TK-2601]
```

| Case | Row |
|---|---|
| Branch exists locally | "Switch from `<current>` to `TK-2601-taosif-CostCentres`" |
| Branch only on origin | "Check out `TK-2601-…` from origin and track it" |
| Branch nowhere | Skipped: "`TK-2601-…` doesn't exist in app-api any more." [Remove from task] |
| Uncommitted changes (SAFE-04) | Take them along (only when the switch is clean, tagged Recommended) · Stash · Skip. Stash names the stash after the task being left: "Stash as githeddle/TK-2636" |
| A GitHeddle stash for the new task exists | An **unticked** checkbox under the row: "Bring back your stashed changes (githeddle/TK-2601 · 3 files · 2 days ago)". Never preselected (L6) |
| Mid-merge, needs review, can't read | Skipped with the reason and a fix link |
| Repos of the old task that aren't in the new one | Collapsed "Not part of TK-2601 (n)": "app-front stays on TK-2636-taosif-Onboarding." Nothing runs there |

- **Pop conflicts.** If bringing back a stash conflicts, that repo pauses like any conflict ("app-front: 1 file needs you to choose what to keep. The stash is kept."), Git keeps the stash, and the result row offers [Resolve conflicts]. The switch itself has already happened.
- **Result.** The chip shows the new task at once. Toast: "TK-2601 is now the active task. 3 repos switched. [Open task]". If some repos were skipped or failed, the chip shows the partly switched state (§4.8), whose menu starts with "Switch remaining repos".

### 7.6 Add repos and remove a repo (TASK-04)

**Add repos…** (task chip menu, Task screen [+ Add repos] and ⋯, the sidebar task menu, a dashboard row's Add to task ▸, or More ▾ → Add to task ▸ with the selection ticked). It is the Start task dialog (§7.4) with Ticket, Title, Branch and Base read-only, titled "Add repos to TK-2636 · 2 repos". The repo picker lists only workspace repos not in the task. Each ticked repo gets the Start task plan and the same per-repo choices ("Create `TK-2636-taosif-Onboarding` from `origin/dev` and switch to it"; "The branch exists on origin: Check it out and track origin · Skip"). Button: "Add 2 repos to TK-2636". Toast: "app-report-api and knowledge-hub added to TK-2636."

**Remove repo from task…** (a Task screen row's ⋯, or the ⋯ menu, which first asks which repos). A short action-flow dialog, titled "Remove from TK-2636 · 1 repo":

```text
 ☑ app-front   Remove from TK-2636. TK-2636-taosif-Onboarding stays, locally and on origin,
               and so does pull request #412.      ( ) Stay on the task branch  ( ) Switch to dev
```

- Nothing is preselected. "Switch to dev" brings the uncommitted-changes choices (Take them along · Stash · Skip) when they apply.
- No branch is deleted here; deleting is Finish task (TASK-07, v0.2). So this is not destructive and uses the normal key rules.
- Button: "Remove 1 repo from TK-2636". Removing the last repo leaves an empty task (§7.3 "No repos").

### 7.7 Merge task into… (TASK-06)

Opened from the task chip, the Task screen's [Merge into… ▾] or the palette. It runs the built-in pipeline "Merge task into…" (§13.2), so the inputs pick the target and the preview is the pipeline preview.

```text
Merge task into · Task TK-2636 · 2 repos                                                    ×
Merge TK-2636-taosif-Onboarding into  [ dev ▾ ]   (default: the task's base)
☑ Push dev after merging (you confirm below)
 ☑ ●  app-api     Update dev from origin (fast-forward), merge TK-2636-taosif-Onboarding (5 commits),
                  push dev, then switch back to the task branch
 ☑ ●  app-front   Same, 2 commits
┌ This run writes to protected branches ───────────────────────────────────────────────────┐
│ ☐ Merge into dev and push dev in 2 repos                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────┘
Tick the confirmation to push to dev.                         [Cancel]  [Merge into dev in 2 repos]
```

(The sketch shows the state before app-api's merge started; §10 shows the same repo paused in it.)

- **The target picker** is a ComboBox of branch names that exist in every task repo, with the task's base first and marked "(base)". When repos have different bases, the first option is "Each repo's base (dev; main for app-report-api)" and is the default.
- Push is on by default (PIPE-03) and is always confirmed in the block; the push happens only after the merge succeeds in that repo.
- Rows: uncommitted changes → Stash · Skip; target already contains the task branch → "Nothing to do"; mid-operation or needs review → Skipped. If the target can't fast-forward from origin, that repo stops before merging: "dev and origin/dev have both moved. Pull dev first." [Open terminal].
- Conflicts pause the repo in the run grid (§13.5), with [Resolve conflicts]. Each repo returns to the branch it started on when it finishes (the pipeline default, §22.4).

## 8. Changes screen (CHG-01..07, BULK-06)

### 8.1 Layout

The centre splits into a **list pane** on the left and a **diff pane** on the right.

| Element | Size |
|---|---|
| Screen toolbar | 36 px, across the list pane |
| Commit box | Pinned at the **top** of the list pane, under the toolbar (as in VS Code). About 136 px in its 3-line state |
| List pane | 380 px default at an effective width of 1440 or more, 320 px below it; min 280 px; max 55 % of the centre |
| Splitter | 1 px line, 6 px hit area; keys move 1rem, Shift 4rem |
| Diff pane | Min 400 px, with its own 64 px header |

At 1440 px: sidebar 240 + list 380 + diff 820. At the default 1280 × 800: sidebar 240 + list 320 + diff 720, so side by side shows (§9.2). At 1024 × 640: rail 48 + list 320 + diff 656, still side by side; the list shows about 15 rows.

```text
┌ Changes  8 files · 2 repos ──── [List|Tree] ⌕ Filter files…  ⊟ ⟳ ┐┌ M Modified  Program.cs  Api · app-api · dev ───────────────┐
│ Commit in [ app-front · 2 changes ▾ ]                              ││ Last commit (HEAD) ⟷ Staged               [Side by side|Inline]│
│ ┌ TK-2636: |                                              ┐       ││ Change 1 of 2  ↑ ↓          [− Unstage file] [Open in editor] ⋯│
│ └─────────────────────────────────────────────────────────┘       ││  12 │  app.UseRouting();      │ 12 │  app.UseRouting();       │
│ Nothing staged, so all 2 changed files will be committed.          ││  13 │− app.UseAuth();         │ 13 │+ app.UseAuthentication();│
│ [Choose files…]                  [Commit & push] [Commit 2 files]  ││ ⋯ 48 unchanged lines  Show 20 above · Show all · Show 20 below│
├────────────────────────────────────────────────────────────────────┤│                                                            │
│▾ app-api  dev · Merging TK-2636-taosif-Onboarding  Finish on Conflicts →                                                        │
│  ▾ Merge changes 3                              [Resolve all…]     ││                                                            │
│      Api.csproj              Api                         6 ⓘ   !   ││                                                            │
│      DeleteOnboarding.cs     Services/HrmService/Feat…   2     !   ││                                                            │
│  ▾ Staged changes 3                             [− all]            ││                                                            │
│      Program.cs              Api                     +8 −2     M   ││                                                            │
│▾ app-front  TK-2636-taosif-Onboarding               2 changes      ││                                                            │
│  ▾ Changes 2                                    [↶ all] [+ all]    ││                                                            │
│      cost-center.service.ts  src/app/hrm/…          +22 −4     M   ││                                                            │
└────────────────────────────────────────────────────────────────────┘└────────────────────────────────────────────────────────────┘
```

### 8.2 Toolbar

| Element | Detail |
|---|---|
| Title | "Changes" (`text-screen-title`) and "8 files · 2 repos" in `text-secondary` |
| List / Tree | ToggleButtonGroup, 24 px. Tooltips "Shows files as a flat list with their folder." / "Shows files grouped in folders." |
| Filter | SearchField 200 px (280 px on focus), placeholder "Filter files…", Mod+F |
| Collapse all | `list-collapse` icon. Tooltip "Collapses every repo." |
| Refresh | `refresh-cw`. Tooltip "Re-reads every repo's changes from Git." |

### 8.3 Row kinds

All rows are 24 px high, indented 16 px per level, with 8 px left padding.

**Repo header** (level 0), pinned while its rows are in view:
- `surface-raised`, 1 px top `border-subtle`.
- Twisty, repo icon, name in `text-body-strong`, then the branch in `text-code` and `text-secondary`, middle-truncated.
- An operation pill if any: "Merging", "Rebasing 2 of 5", "Cherry-picking".
- On the right, a summary: "3 ! · 3 staged · 2 changes". Hover and focus actions replace it: Open in VS Code, Open terminal, ⋯ (Commit this repo only, Open on GitHub, Open in file manager).
- If the repo is mid-operation, the summary is replaced by the link **"Finish on Conflicts →"**.

**Section header** (level 1): twisty, the name in `text-body-strong` ("Merge changes", "Staged changes", "Changes") and a count pill. Its actions sit on the right and are **always visible**, not hover-only, because novices don't discover hover-only controls.

| Section | Actions |
|---|---|
| Merge changes | **[Resolve all…]** opens the merge editor on the first unresolved file. There is **no "+ all"** here |
| Staged changes | **[− all]**, tooltip "Unstages all 3 files in app-api. Your edits stay." |
| Changes | **[↶ all]**, tooltip "Discards all changes in app-front, after showing what will be lost." · **[+ all]**, tooltip "Stages all 2 files in app-front." |

**Folder row** (tree mode only): twisty, folder icon, name. Chains of single-child folders are compacted (`src/app/hrm`).

**File row:**

```text
| 8 pad | indent | 16 icon | 6 | name (text-body) | 6 | folder (text-secondary, 12 px) … | ≥8 | [ 72 px slot ] | 8 | 16 letter | 8 pad |
```

- The name truncates at the end. The folder truncates from the start ("…/HrmService/Features"), so the part nearest the file stays visible. Tree mode hides the folder.
- **The 72 px slot** shows `+8 −2` at rest (`text-caption`, tabular numerals, + in `status-added`, − in `status-deleted`). On hover, focus or selection, it shows up to three 24 px buttons instead, so nothing shifts. The counts stay in the tooltip and the accessible name. Before counts arrive, the slot shows a 32 × 8 px `surface-hover` bar, never a spinner. Binary files show "bin". Conflicted files show "6 ⓘ" (tooltip "6 conflicts").
- Status letter column: 16 px (§3.2).

**Row buttons per section.** Danger buttons sit leftmost, away from +.

| Section | Buttons, left to right |
|---|---|
| Changes, tracked file | Discard changes (`undo-2`) · Open file · **Stage** (`plus`) |
| Changes, untracked file (U) | Delete file (`trash-2`) · Open file · **Stage** |
| Staged changes | Open file · **Unstage** (`minus`) |
| Merge changes | Open file · **Resolve** (`git-compare`, opens the merge editor) · **Mark as resolved** (`check`) |

**Mark as resolved** is enabled only when the core's marker scan finds no conflict markers in the file, for example after the user fixed it in VS Code. Otherwise it is aria-disabled with "Api.csproj still has conflict markers (first at line 42). Resolve it first." Space on a conflicted row opens the merge editor instead of staging.

**Multi-select** (Shift, Mod): a 24 px bar appears above the list: "3 files selected · [+ Stage 3] [− Unstage 3] [↶ Discard 3…]".

**Filter match:** the matched characters are `text-body-strong` with a 1 px `accent-indicator` underline. Repos and sections with no match are hidden, and collapsed sections open while a filter is on. A caption under the field says "12 of 348 files match". Esc clears the filter, and a second Esc returns focus to the list.

### 8.4 Context menu (CHG-06)

1. Open diff (Enter)
2. Open in editor
3. —
4. Stage / Unstage / Mark as resolved
5. —
6. Copy path · Copy relative path · Open in file manager
7. —
8. **Discard changes…** (`danger` text), or "Delete untracked file…"

For a conflicted file, item 1 is "Resolve in merge editor", and Discard isn't offered.

### 8.5 Discard confirmation (SAFE-03)

An AlertDialog, 30rem wide, with initial focus on Cancel. Neither Enter nor Mod+Enter confirms it.

> **Discard changes to 2 files in app-front?**
> These edits will be lost. Git doesn't keep a copy of them.
> • `cost-center.service.ts` — 22 added, 4 removed lines
> • `cost-center-list.component.html` — 5 added, 1 removed lines
> [Cancel] [Stash instead] **[Discard 2 files]**

For an untracked file: "Delete 1 new file? `notes.md` (3.2 KB) has never been committed. It will be deleted from disk." The button is "Delete 1 file". A discard across several repos uses the action-flow loss list (§12.9).

### 8.6 Commit box (CHG-07, BULK-06)

**The scope picker**, "Commit in [ … ▾ ]", decides one repo or many. There is no hidden mode.

| Situation | Default scope | Primary button |
|---|---|---|
| Exactly 1 repo has staged files | That repo | "Commit app-api" |
| 2 or more repos have staged files | "2 repos with staged files" | "Commit 2 repos" |
| "Commit this repo only" chosen on a repo header | That repo | "Commit app-front" |
| Nothing staged in any repo in scope | The repos with changes (or the focused repo) | "Commit 2 files" / "Commit 5 files in 2 repos" (commit-all mode) |

- **Commit-all mode.** When nothing is staged in the scope, visible helper text says so: "Nothing staged, so all 2 changed files will be committed. [Choose files…]". **Commit-all takes tracked files only.** New (untracked, U) files are never included silently: they get their own line under the helper text with an **unticked** checkbox that names them, "☐ Also add 2 new files: `.env`, `notes.md`" (more than 3: "`.env`, `notes.md` and 4 more", with the full list in the tooltip). Ticking it adds them to this commit only, and the preview line and the button count them ("Commit 4 files · 2 new"). The button names the file count. If some repos in the scope have staged files, only staged files are committed, and the repos with nothing staged appear in the preview as "Nothing staged · [Include all 3 changes]". Settings → Git and branches → "Require staging before commit" (off by default) turns commit-all mode off for people who prefer to stage.
- **Message field.** Multiline, 3 lines (60 px) tall, grows to 8 lines, then scrolls. Prefilled with "TK-2636: " and the cursor after the space. If the repos in scope have different tickets, the field starts empty with the placeholder "Message for 2 repos (different tickets: TK-2636, TK-2601)". The draft is kept per scope across restarts (UX-09), so a failed commit never loses it.
- **Preview line** (`text-caption`, `text-secondary`, above the buttons). For a single repo this line is the preview: "Will commit 3 staged files to TK-2636-taosif-Onboarding in app-api." It always names new files that will be added: "Will commit 4 files to TK-2636-taosif-Onboarding in app-front, including 2 new files: .env, notes.md." For several repos: "Will commit 5 files in 2 repos. You'll see each repo before it runs."
- **Soft hint, never blocking:** "First line is 84 characters. Under 72 reads better on GitHub."
- **Buttons**, right-aligned: [Commit & push] (secondary), then the primary commit button with the key hint `Ctrl Enter` / `⌘Enter` inside it. Mod+Shift+Enter is Commit & push.
- **Not ready.** The button is aria-disabled and the reason replaces the preview line, in `warning`: "Write what you changed after TK-2636:" · "app-api is in the middle of a merge. Finish it on Conflicts." Repos mid-merge, mid-rebase or mid-cherry-pick are always left out of the scope (SAFE-06).
- **Protected branch (SAFE-02).** Single repo: an AlertDialog, "app-api is on dev, a protected branch. Usually you'd start a task first.", with [Cancel] [Start a task with these changes] [Commit to dev]. Several repos: the confirmation block in the preview.
- **Detached HEAD:** "app-scheduler-api isn't on a branch, so this commit will be easy to lose. [Create a branch here first]".
- **Several repos** go through the shared action flow. One row per repo: "☑ app-api · 3 files → TK-2636-taosif-Onboarding". The message is shown once, read-only, with [Edit] going back to the box. The button is "Commit 2 repos" or "Commit & push 2 repos".
- **Result.** Single repo: a toast, "Committed 3 files to TK-2636-taosif-Onboarding in app-api · 9f3e2a1. Not pushed yet." With push: "…and pushed to origin." Hook failure: "Commit stopped: app-front's pre-commit hook failed. Your changes are still there and nothing was committed. [Show Git output]". The message stays in the box.

### 8.7 Keyboard

ui-architecture §10.5 applies. Added here: Mod+Enter commits; Mod+Shift+Enter commits and pushes; Alt+M (⌃⌥M on macOS) moves focus to the message field; Mod+Delete (⌘⌫ on macOS) opens the Discard confirmation. Plain Delete does nothing.

### 8.8 States

| State | What the user sees |
|---|---|
| Loading, no cache | After 150 ms: 3 skeleton repo headers and 6 rows (static `surface-hover` bars) |
| No changes | `icon-xl` `check`. "No changes in 6 repos. Edit files in your editor and they show up here." Caption "Checked 10 s ago." [Open in VS Code ▾] [Refresh] |
| Task active, changes only outside it | "No changes in this task's repos. 3 changes in other repos." [Show all repos] |
| No repos | "No repositories in this workspace yet." [Open a folder] |
| Filter shows nothing | "No files match "csproj" in 2 repos." [Clear filter] |
| Stage failed (reverted) | Toast: "Couldn't stage Program.cs in app-api: another Git program is using the repo (index.lock). Close it, then try again." [Retry] [Show Git output] |
| Busy repo | Repo header spinner and "Pushing…". Stage, unstage and discard in that repo are aria-disabled: "Wait for Push to finish in app-api". Diffs still open |
| Needs review | The repo header shows "Needs review" and [Review], with no rows |
| 5,000 files | Unchanged; virtualised (PERF-08) |

## 9. Diff view (CHG-04)

### 9.1 Header (64 px, two rows)

- **Row 1:** a status chip (letter and word, "M Modified"), the file name (`text-body-strong`), the folder (`text-secondary`), "· app-api · dev".
- **Row 2:** the comparison label; [Side by side | Inline]; "Change 3 of 9" with ↑ ↓ (tooltips show F7 / Shift+F7); the context action **[+ Stage file]**, **[− Unstage file]** or **[Resolve conflicts]**; [Open in editor]; ⋯ (Copy path, Open in file manager, Show whitespace changes ✓, Wrap lines).

| Row's section | Left pane | Right pane |
|---|---|---|
| Changes (tracked) | "Staged / last commit" | "Your working copy" |
| Staged changes | "Last commit (HEAD)" | "Staged" |
| Untracked | — (single pane) | "New file" |

### 9.2 Body

- **Side by side:** each side has a line-number gutter (at least 3 digits, 32–48 px), a 14 px sign column, then the code. A 1 px `border-subtle` line separates the sides. A 10 px overview ruler sits at the far right; clicking it jumps there. Spacers use `diff-spacer`.
- **Inline:** an old and a new line-number column (40 px each), the sign column, then the code.
- **Narrow pane:** when the diff pane is narrower than 640 px (each side then has about 270 px, 34 characters, of code), side by side switches to inline automatically, and the toggle's tooltip says "Inline · not enough room for side by side". The remembered choice comes back when there is room.
- **Context:** 3 lines. Longer unchanged runs collapse into one 24 px row on `surface-raised`: "⋯ 48 unchanged lines · Show 20 above · Show all · Show 20 below". Each control is a real button.
- Word highlights use `diff-*-word` with a 2 px radius. Wrapping is off in side by side and on in inline.

### 9.3 Special cases

Each special case is a centred card, at most 30rem wide, with an icon, a title and one sentence. There is never a blank pane.

| Case | Text | Actions |
|---|---|---|
| Binary | "Binary file. GitHeddle can't show its changes as text." Caption "24.1 KB → 25.3 KB" | [Open in editor] [Open in file manager] |
| Rename only | The header shows `old/Path.cs → new/Path.cs` with an R chip. "Renamed only. The content didn't change." | — |
| Rename with edits | A 28 px `info-soft` strip, "Renamed from `Services/Old.cs` (92 % similar)", then the diff | — |
| Line endings only | "Only line endings changed (CRLF → LF). The text is the same." Caption "This often happens when another editor or OS saved the file." | [Show line endings] [Discard changes…] |
| Whitespace only | "Only spaces or tabs changed, on 12 lines." | [Show whitespace changes] |
| Mode only | "Only the file permission changed: it's now executable (644 → 755)." | — |
| Encoding only | "Only the encoding changed: UTF-16 → UTF-8." | — |
| Added or deleted file | A single pane. Header "New file · 40 lines" or "Deleted file · 120 lines" | — |
| Too large | "This file is too large to show here (12.4 MB; the limit is 5 MB)." | [Open in editor] · "Change the limit in Settings" |
| Conflicted | "This file has 6 conflicts. Choose what to keep in the merge editor." Markers are never shown raw | **[Resolve conflicts]** |
| Submodule | "Submodule moved from a1b2c3d to e4f5a6b." | — |

### 9.4 States

| State | What the user sees |
|---|---|
| Nothing selected | "Select a file to see its changes." and "↑ ↓ move · Space stage · Enter open", with the OS's keys |
| Loading | Header row 1 renders at once from the row data. After 150 ms, a 2 px indeterminate `accent-indicator` bar appears under the header. The previous diff stays until the new one arrives, so fast arrowing never flashes |
| Error | "Couldn't load the diff of Program.cs in app-api: the file changed while it was being read." [Try again] [Show Git output] |
| File changed while open | The diff refreshes in place and keeps the scroll anchor. An "Updated" caption shows for 1.5 s |

## 10. Conflicts screen (CONF-01, CONF-02, CONF-10, CONF-11)

### 10.1 Layout

A single scrolling column, at most 60rem wide, centred. Each repo in a merge, rebase or cherry-pick gets one card. There are few cards, so the list isn't virtualised.

```text
Conflicts   2 repos · 4 files · 9 conflicts left
┌ ⓘ What's a conflict? ──────────────────────────────────────────────────────────────── [Hide] ┐
│ Both sides changed the same lines, so Git needs you to choose what to keep. Nothing is         │
│ committed until you click Continue, and Abort puts the repo back the way it was.               │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
┌ app-api ───────────────────────────────────────────────────────────────────────────────────────┐
│ Merging TK-2636-taosif-Onboarding into dev                Started by Sync with dev · paused    │
│ ▓▓▓▓░░░░░░  1 of 3 files resolved                                                              │
│  !  Api.csproj                 Api                       6 conflicts           [Resolve] ▾     │
│  !  DeleteOnboarding.cs        Services/HrmService/…     2 conflicts           [Resolve] ▾     │
│  ✓  DeleteOnboardingTests.cs   Tests/HrmService.Int…     Resolved              [Open]    ▾     │
│ [Abort merge…]                                  Resolve 2 more files first.  [Continue merge]  │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Card anatomy

- `surface-raised`, `radius-lg`, 16 px padding, 12 px between cards.
- **Title:** the repo name in `text-body-strong`.
- **Operation sentence** (`text-body`):
  - "Merging `TK-2636-taosif-Onboarding` into `dev`"
  - "Rebasing `TK-2636-taosif-Onboarding` onto `dev` · commit 2 of 5: a1b2c3d "Add delete endpoint""
  - "Cherry-picking a1b2c3d "Fix validation" onto `dev`"
- **Source**, right-aligned in `text-secondary`: "Started by Sync with dev · paused" (a link to the run) or "Started outside GitHeddle".
- **Progress:** a Meter, 4 × 160 px, and "1 of 3 files resolved".
- **File rows**, 32 px high (taller than list rows because they are the main targets): the `!` badge or a `check` in `success`; name; folder in `text-secondary`; a kind word ("6 conflicts", "Resolved", "Resolved outside GitHeddle", "Deleted on one side", "Binary file"); the primary **[Resolve]** (or [Open] when resolved); a ▾ menu with the CONF-02 options, named with the real branches:
  - **Use dev for all 6 conflicts**
  - **Use TK-2636-taosif-Onboarding for all 6 conflicts**
  - —
  - Open in external merge tool
  - Open in editor
  - Open in file manager
- **Footer:** left, **[Abort merge…]** (danger-text button); right, the reason caption and **[Continue merge]** (primary). The labels follow the operation: "Continue rebase" / "Abort rebase…", "Continue cherry-pick" / "Abort cherry-pick…".

A whole-file "Use … for all" confirms in a popover anchored to the row: "Use dev's side for all 6 conflicts in Api.csproj? Changes that didn't conflict stay in the file." [Cancel] [Use dev for 6 conflicts]. The file is then saved and staged (a one-file change confirmed in the popover rather than the full preview, §26 #32). It means "resolve every conflict with that side", not a whole-file checkout (see §26).

### 10.3 Continue and Abort

**Continue not ready** (aria-disabled, reason visible): "Resolve 2 more files first." · "Api.csproj is marked resolved but still has conflict markers at line 42." [Open], and the row shows a `warning` "Markers at line 42".

**Continue on a branch that isn't protected** commits from the card without a dialog (an exception to the preview rule, §26 #32). The footer caption shows the message before the press: "Will commit: Merge branch 'TK-2636-taosif-Onboarding' into feature-x".

**Continue on a protected branch** (SAFE-02), unless already confirmed in a run's preview: an AlertDialog "Continue the merge in app-api? This creates a merge commit on dev, a protected branch. Nothing is pushed." It shows the default message read-only ("Merge branch 'TK-2636-taosif-Onboarding' into dev") with [Cancel] [Commit merge to dev].

**After Continue:**
- Merge or cherry-pick: the card becomes a 48 px success strip, "Merge finished in app-api · 9f3e2a1 on dev · not pushed".
- If a run is paused there, the strip adds "Resume Sync with dev for app-api? [Resume] [Later]". Resuming is never automatic.
- A rebase that stops again: the card stays and updates ("commit 3 of 5 · 2 new conflicted files"), the change is announced, and focus goes to the first new file.

**Abort** opens an AlertDialog (SAFE-03), focus on the safe button:

> **Abort the merge in app-api?**
> app-api goes back to dev at a1b2c3d, as it was before the merge.
> You'll lose: your choices in 1 resolved file (DeleteOnboardingTests.cs).
> Uncommitted edits from before the merge may not come back: `Program.cs`.
> [Keep resolving] [Stash them first] **[Abort merge in app-api]**

- **Edits from before the merge.** The core reports files that had uncommitted changes when the operation started (new core data, §26). If there are any, the loss list names them, as above, and [Stash them first] stashes only those files as `githeddle/before-abort`, then aborts. If Git can't stash them in the middle of the merge, the core says so before the dialog opens and the button reads [Save copies first], which copies them to `.git/githeddle/backup/<time>/` and lists that folder in the result. With no such files, neither line nor button appears.

If the abort belongs to a paused run, it adds "Sync with dev will stop for app-api."

**Continue all** appears as a 56 px sticky bar at the bottom when 2 or more cards are fully resolved: "All 2 repos are resolved. [Continue all · 2 repos]". It goes through the shared preview, with each repo's commit message and one protected-branch confirmation block.

### 10.4 States

| State | What the user sees |
|---|---|
| Empty | `icon-xl` `git-compare`. "No conflicts. Repos that stop in a merge or rebase show up here." [Go to repositories] |
| All done | "All conflicts resolved. 2 merges finished." [Back to the run] (if any) [Go to Changes] |
| Loading | A skeleton card after 150 ms |
| Busy | During Continue or Abort the footer button is busy ("Continuing…") and the file rows are disabled |
| Error | Inline in the card: "Continue stopped: app-api's pre-commit hook failed. Fix what it reports, then Continue again." [Show Git output] |

## 11. Merge editor (CONF-03..09)

### 11.1 Focus mode and sizes

Opening the editor collapses the sidebar to the rail and hides the details panel, keeping the top and bottom bars. Leaving restores the previous layout.

| Part | Height | Content |
|---|---|---|
| File bar | 40 px | [← Conflicts] · `app-api / Api/Api.csproj` · operation sentence · right: "File 1 of 3 in app-api · 6 conflicts in this repo" |
| Conflict toolbar | 36 px | "Conflict 2 of 6" · [‹ Previous] [Next ›] · "4 unresolved" chip (`merge-unresolved` colours) · [?] · ⋯ (Open in external merge tool, Open in editor, Show Base: disabled "Coming in v0.2", CONF-12) |
| Pane title bars | 28 px each | 3 px top border in the side's edge colour |
| Top panes | 55 % of the rest, min 100 px | 50 / 50, resizable 30–70 % |
| Horizontal splitter | 6 px | Keys move one line (20 px); remembered |
| Result | 45 %, min 100 px | |
| Footer | 48 px | |

At 1024 × 640 the space left is 640 − 40 − 24 − 76 − 48 = 452 px. Minus two title bars and the splitter: 390 px, so the top panes get about 10 lines and Result about 8. When the window is shorter than 720 px, the file bar and the conflict toolbar merge into one 40 px row, which gives back 36 px.

Horizontally, at the minimum window each top pane is 488 px: line numbers 40, checkbox gutter 28, region stripe 4, overview ruler 10, **code 406 px (about 52 characters)**. Side by side is kept down to an effective width of 720 px; below that (only reachable by zoom) the top panes become tabs "Incoming · Current" above Result.

```text
← Conflicts   app-api / Api/Api.csproj   Merging TK-2636-taosif-Onboarding into dev               File 1 of 3
Conflict 2 of 6   [‹ Previous] [Next ›]   4 unresolved                                               ?   ⋯
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ teal ▔▔▔▔ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ violet ▔▔▔▔▔▔
 Incoming · TK-2636-taosif-Onboarding  [Your task]   │ Current · dev
 Changes being merged in                             │ The branch you're on
 14 │ ☐ ▌ <PackageReference Include="Serilog"        │ 14 │ ☑ ▌ <PackageReference Include="Serilog"
 15 │   ▌     Version="4.1.0" />                     │ 15 │   ▌     Version="4.0.2" />
 16 │   ▌ <PackageReference Include="Polly" …        │ ╱╱ │   ╱╱╱╱╱╱╱╱╱╱╱╱ (spacer) ╱╱╱╱╱╱╱╱╱╱╱╱╱
══════════════════════════════════════════════════════╧════════════════════════════════════════════ (splitter)
 Result · Api.csproj · editable                                          Saved into app-api when you accept
 14 C│ <PackageReference Include="Serilog" Version="4.0.2" />
 21  ┆┌ Unresolved conflict 3 of 6 ── Tick a side above, or: [Use incoming] [Use current] [Use both] ┐
     ┆└────────────────────────────────────────────────────────────────────────────────────────────┘
─────────────────────────────────────────────────────────────────────────────────────────────────────────
 [Take all incoming] [Take all current]          4 of 6 conflicts left                [Accept merge  Ctrl S]
                                                                                Saves this file and opens the next
```

### 11.2 Pane titles: real name plus plain role

Each title shows the label in `text-section-title`, the real name in `text-code`, and a second line in `text-caption` `text-secondary` saying what the side means.

| Operation | Incoming title / role | Current title / role |
|---|---|---|
| Merge | Incoming · `TK-2636-taosif-Onboarding` / "Changes being merged in" | Current · `dev` / "The branch you're on" |
| Merge task into… (on `dev`) | As merge, plus a "Your task" tag | As merge |
| Rebase | Incoming · `a1b2c3d Add delete endpoint` / "Your commit, being replayed" + "Your commit" tag | Current · onto `dev` / "What you're rebasing onto, plus your commits already replayed" |
| Cherry-pick | Incoming · `a1b2c3d Fix validation` / "The commit being picked" | Current · `dev` / "The branch you're on" |

The "Your task" / "Your commit" tag is an 18 px `info-soft` pill, shown when the core says that side is the active task's branch or the user's own commit. A novice can always find "mine" without knowing what ours and theirs mean. During a rebase the file bar says "Rebasing `TK-2636-taosif-Onboarding` onto `dev`: commit 2 of 5".

### 11.3 Top panes

| Region | Look |
|---|---|
| Unchanged | Plain `surface-sunken` |
| Conflict, undecided | The side's bg, 1 px top and bottom lines and a 4 px stripe in its edge colour |
| Conflict, this side ticked | As undecided, plus a ticked checkbox |
| Conflict, only the other side ticked | Text `text-secondary`, background dropped to the plain surface with only the stripe left ("not used"). The checkbox stays clickable |
| Applied automatically from this side | `merge-auto-applied` bg, stripe in this side's edge colour, gutter tooltip "Applied automatically, no conflict" |
| Active conflict | 2 px `merge-active` outline around the region in all three panes. Navigation scrolls it to one third from the top |

**Checkboxes** (CONF-04):
- A 16 px box centred in the 28 px gutter on the region's first line. The hit target is the whole 28 × 20 px cell. Ticked: the side's edge colour fill with a check in `indicator-glyph` (white in light, `#131519` in dark, because the dark edges are light) and a 1 px `border-strong` outline.
- **Tick order.** When both sides are ticked, each box gets a 16 px order badge with 12 px text ("1", "2"), and a "Swap order" link appears in the gutter of the second-ticked side.
- **Hand-edited.** When the region in Result was edited by hand, both boxes show the mixed state (–), tooltip "You edited this conflict in Result. Ticking a side replaces your edit."
- **Accessible name:** "Take incoming for conflict 2 of 6, lines 14 to 16, TK-2636-taosif-Onboarding"; mixed adds ", edited by hand".

Spacers use `diff-spacer`. The top panes share one vertical and one horizontal scroll offset.

### 11.4 Result pane

- **Title:** "Result · Api.csproj · editable", right side "Saved into app-api when you accept" (`text-caption`).
- **Gutter:** line numbers (40 px) and a 14 px source column with a letter on the first line of each region: **I** (incoming edge colour), **C** (current edge colour), a `pencil` icon for hand edits, nothing for unchanged lines. The source never depends on colour.
- **Regions:** auto-applied in `merge-auto-applied`; resolved conflicts with a 3 px left stripe in the chosen side's colour (split half and half for both); hand-edited in `merge-edited` bg with a 3 px stripe.
- **Unresolved placeholder** (a block widget, never text): 44 px tall, inset 8 px, 1 px dashed `merge-unresolved` edge, `merge-unresolved` fill. Content "Unresolved conflict 3 of 6". When it is the active conflict the border is 2 px solid and it adds "Tick a side above, or:" with three small buttons **[Use incoming] [Use current] [Use both]**, reachable by Tab.
- **Inside a resolved conflict**, a hover/focus action at the region's top right: "Reset to unresolved" (undoable).
- Ticking a side over a hand edit: toast "Replaced your edit in conflict 3. [Undo]".

### 11.5 Footer (48 px)

- **Left:** [Take all incoming] [Take all current] (secondary). Tooltips name the branch: "Uses TK-2636-taosif-Onboarding's side for every conflict in this file. Changes that didn't conflict stay." If some conflicts are already decided or hand-edited, a popover asks: "This replaces 2 choices you already made, including 1 hand edit." [Replace all 6] [Only the 4 unresolved]. Either is one undoable step (CONF-08).
- **Centre:** "4 of 6 conflicts left", or "All conflicts resolved. Check Result, then accept." in `success` with a `check`.
- **Right:** **[Accept merge]** (primary, key hint inside) with the caption "Saves this file and opens the next" under it. While conflicts remain it is aria-disabled with the visible reason "Resolve 4 more conflicts first."; pressing it (or Mod+S) jumps to the first unresolved conflict and its placeholder outline flashes twice (≤ 150 ms each; none under reduced motion). The label is the same for merge, rebase and cherry-pick.
- **After accept:** toast "Api.csproj resolved and staged. Opening DeleteOnboarding.cs (2 of 3)." The next file opens in the same view. After the last file of the last repo, the editor returns to the Conflicts screen with focus on that repo's [Continue merge].
- **Markers refused (CONF-11):** a `danger-soft` strip across the top of Result: "Not saved: line 42 still has a conflict marker (<<<<<<<). Remove it, then accept again." [Go to line 42].

### 11.6 Special files

The panes are replaced by a centred card:

- **Delete / modify:** "TK-2636-taosif-Onboarding deleted this file. dev changed it (12 lines)." Two choice cards (RadioGroup, 200 × 88 px): "Keep the file · dev's version" / "Delete the file". Then [Accept merge].
- **Binary, or over the hard limit:** "Both sides changed this binary file. Choose one." [Use incoming · 24.1 KB] [Use current · 25.3 KB] [Open in external merge tool].

### 11.7 States

| State | What the user sees |
|---|---|
| Loading | File bar and pane titles render at once; line skeletons after 150 ms. Ready within 500 ms (PERF-06) |
| Busy (saving) | Accept is busy ("Saving…") and Result is read-only meanwhile |
| Error loading | "Couldn't open Api.csproj in app-api: the file changed on disk." [Reload] [Open in external merge tool] [Show Git output] |
| Changed outside while open | Non-modal strip: "Api.csproj changed on disk (maybe in VS Code)." [Reload and lose my choices] [Keep mine] |
| Leaving with changes | "Leave Api.csproj? Your 2 choices aren't saved yet." [Keep editing] [Discard my changes] |

### 11.8 Guiding a novice through a conflict

1. **The result says it plainly**, as a pause, not a failure: "app-api: 3 files need you to choose what to keep. [Resolve conflicts]". The sidebar shows "Conflicts 1".
2. **The Conflicts screen** shows the "What's a conflict?" box until hidden, the operation in words, a progress meter and one obvious [Resolve] per file. Abort is always visible, with its consequence spelled out.
3. **Coach strip**, the first time the editor opens for each kind of operation: a 32 px `info-soft` strip under the toolbar. Its words follow the operation, like the pane titles (§11.2):
   - Merge: "① Top left: the changes coming in. ② Top right: what's on dev now. ③ Bottom: the file that will be saved. For each conflict, tick the side to keep, or both. [Got it]"
   - Rebase: "① Top left: your commit, being replayed. ② Top right: dev, plus your commits already replayed. ③ Bottom: the file that will be saved. For each conflict, tick the side to keep, or both. [Got it]"
   - Cherry-pick: "① Top left: the commit you're picking. ② Top right: what's on dev now. ③ Bottom: the file that will be saved. …"

   Badges ①②③ show in the pane titles meanwhile: 16 px circles, 12 px text in `info` on `info-soft` with a 1 px `info` ring (white on `info` fails in dark). Under 720 px of height it is a one-time popover instead.
4. **The editor opens on conflict 1** with the active outline. The placeholder's three "Use…" buttons give a path to users who don't notice the checkboxes.
5. **After each choice** the counter updates and is announced ("Conflict 1 resolved. 5 left."). [Next ›] becomes primary while the active conflict is resolved and others remain. There is no automatic jump.
6. **When nothing is left**, the footer turns `success` and the announcer says "All 6 conflicts resolved. Press Ctrl+S to accept."
7. **[?]** opens a 20rem popover: "Not sure? Tick both, then fix Result by hand." · "Everything in grey shading was combined automatically." · "Changed your mind? Ctrl+Z."
8. **Finish:** Accept moves to the next file; after the last one the user lands on [Continue merge] with the message shown; the result is "Merge finished · not pushed", with the next step offered (Resume run, or Push).

## 12. The action flow (preview → run → result)

ui-architecture §7 defines the rules. This section defines the looks, words and keys. Every change goes through it; read-only actions (Fetch) skip it. The only exceptions are listed in §26 #14 and #32.

### 12.1 Dialog anatomy

A React Aria Modal + Dialog over `scrim`, `surface-overlay`, `radius-lg`, `elevation-2`.

| Part | Size | Content |
|---|---|---|
| Width | `min(55rem, 100vw − 4rem)`; Create pull requests `min(64rem, 100vw − 4rem)` | |
| Height | content, max `min(80vh, 45rem)`; the body scrolls | Header, confirmation block and footer never scroll away |
| Header | 3rem, `space-5` side padding | Title with action and count · target chip · × |
| Inputs | optional | Fields the action needs (Start task, Commit, Create pull requests) |
| Toolbar | 2.25rem | Select all/none checkbox, "2 of 2 selected", "Choose for all: [Stash all 2] [Skip all 2]", a filter field from 12 repos |
| Body | preview rows (24 px plus sub-lines) | |
| Confirmation block | pinned above the footer, when needed | §12.8 |
| Footer | 3.5rem | Left: status sentence. Right: secondary buttons, then the primary |

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Sync with dev · Task TK-2636 · 2 repos                     Target: Task TK-2636    × │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ☑ 2 of 2 selected                         Choose for all: [Stash all 1] [Skip all 1] │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ☑ ▲  app-front   Merge origin/dev (4 new commits) into TK-2636-taosif-Onboarding     │
│                  2 uncommitted files                     ( ) Stash  ( ) Skip         │
│ ☑ ●  app-api     Merge origin/dev (5 new commits) into TK-2636-taosif-Onboarding     │
│ ▸ Nothing to do (0)   ▸ Skipped (0)   ▸ Show Git commands                            │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ Choose Stash or Skip for app-front.                     [Cancel]  [Sync 2 repos]     │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Footer status sentence.** It always explains the primary button's state in words, because a tooltip on a disabled button is unreachable for keyboard and screen-reader users: "2 repos will change." · "Choose Stash or Skip for app-front." · "Tick the confirmation to push to dev." · "Nothing to do: all 4 repos are up to date." (the primary becomes [Close]).

### 12.2 Inputs section

Start task, Switch task, Add repos, Merge task into…, the bulk operations in §5.9 and Create pull requests need parameters. They live in the same dialog, above the preview, and the core re-plans 300 ms after the last change. The preview never flashes empty: the previous one stays at reduced emphasis with "Updating…". This keeps those flows within 3 clicks (UX-07).

### 12.3 Loading (PERF-03)

- The dialog opens in the same frame as the click. The target is known in the UI, so **repo rows render at once**, each with a spinner and "Checking…".
- Footer: "Checking 4 repos…"; the primary is not ready.
- Rows fill in as their plan arrives (if the core streams per repo; otherwise all at once, see §25).
- After 3 s a still-loading row says "Still checking: fetching from origin…" with the core's reason.

### 12.4 Preview rows

Grid: `[2rem checkbox][1.25rem state icon][11rem repo, ellipsis][1fr plan][auto choice]`.

| Element | Spec |
|---|---|
| Checkbox | Unticking replaces the plan with "Left out" in `text-secondary`, after a `minus` icon. `text-disabled` is only for inactive controls (§3.3) |
| State icon | `circle-dot` plan ready (`text-secondary`) · `triangle-alert` needs attention (`warning`) · `octagon-x` blocked (`danger`) · `minus` nothing to do |
| Repo | `text-body-strong`; the current branch in `text-code` only in pipeline previews |
| Plan | One plain sentence with Git verbs, branch names in `text-code`: "Merge origin/dev (5 new commits) into TK-2636-taosif-Onboarding" |
| Sub-line | Optional, `text-caption` `text-secondary`, at most 2 lines, then "Show all 14 files" |
| Choice | Inline radio group (§12.5) |

**Order:** rows needing a choice; rows that will run; a collapsed "Nothing to do (3)" Disclosure (unticked, with reasons "Already up to date", "No commits ahead of dev"); a collapsed "Skipped (1)" Disclosure for blocked rows (disabled checkbox, reason, and a fix link such as [Review repo] or [Open conflicts]). "Show Git commands" lists the exact commands per repo (transparency); its open state is remembered.

**Preview errors.** A repo whose plan failed shows `octagon-x` and a three-part message: "Couldn't check app-report-api: origin didn't answer within 120 s. Retry or leave it out." [Retry check]. It is unticked; the rest stay usable.

**Stale preview (SAFE-07, UI half).** If a previewed repo changes while the dialog is open, a `warning` strip appears above the rows: "app-front changed since this preview (new commit). [Refresh preview]". The primary stays enabled; the core's preflight is the real guard.

### 12.5 Inline choices (SAFE-04, TASK-02)

- A React Aria RadioGroup drawn as a segmented control, 24 px, labels such as `Stash` · `Skip`. **Nothing is preselected.** The row is tinted `warning-soft` until a choice is made.
- After Stash: "Stash as githeddle/TK-2636 · you can bring it back when you switch back". After Skip: the row becomes a skipped row in place (not moved, so focus doesn't jump).
- "Choose for all" applies to every row still needing a choice, with the count in the label.
- SAFE-04's "Cancel" is the dialog's [Cancel]; there is no per-row Cancel.
- Same control for: Take them along / Stash / Skip (Start task), Switch to it / Skip, Merge origin in / Skip (diverged on pull), Include all 3 changes / Skip (commit).

### 12.6 Running

1. The primary shows pressed and busy in the same frame.
2. The core returns a job ID. The dialog fades out (80 ms) and focus returns to the control that opened it.
3. A job chip appears in the bottom bar (§4.9). The announcer says "Push started in 4 repos."

Progress (in the job panel):

```text
Push · Target: Task TK-2636 · 4 repos · 6.1 s                         [Cancel remaining (2)]
  ✓ app-api            Pushed 3 commits to origin/TK-2636-taosif-Onboarding     1.2 s
  ⟳ app-front          Pushing… (remote: Resolving deltas 40%)                  4.0 s
  ○ app-report-api     Waiting for a free slot
  ○ app-scheduler-api  Waiting for a free slot
```

- [Cancel remaining (n)], tooltip "Stops repos that haven't started. Repos that are running finish their current Git command, so nothing is cut off midway." After pressing: "Cancelling: 1 still running…".
- Git progress lines show in `text-caption`, cut to one line.
- After 60 s on a write: "Still running (a hook may be working). You can wait or cancel the remaining repos."
- Rows sort live: running, waiting, then finished in finishing order.

### 12.7 Result

```text
Push finished in 4.2 s · 2 succeeded · 1 skipped · 1 failed             [Retry 1 failed]  [Dismiss]
  ✗ app-front     Push rejected: origin/TK-2636-taosif-Onboarding has commits you don't have.
                  Pull first, then push again.
                  [Pull app-front]  [Show Git output]  [Open terminal]  [Show in activity log]
  – app-report-api  Skipped: nothing to push.
  ✓ app-api        Pushed 3 commits.
  ✓ app-scheduler-api  Pushed 1 commit.
```

- Order: failed, paused, skipped, done. The counts line is the only summary.
- **Conflicts are paused, never failed**: "⏸ app-api: 3 files need you to choose what to keep. [Resolve conflicts]". "Retry failed" counts only real failures.
- A failure row: `x` icon, repo (bold), the what-and-where line, the next-step line, then buttons. The first button is the fix the core reports (Pull app-front, Open conflicts, Sign in to GitHub); it opens a new preview and never runs directly.
- **Show Git output** expands a `surface-sunken` `text-code` block (max 12 lines, then scrolls): command, exit code, duration, stdout and stderr with control characters escaped (UN-05), and [Copy].
- **Retry n failed** opens a new preview limited to those repos.
- **What changed** (UX-10): after a cancel or partial failure, a box: "Changed: app-api, app-scheduler-api (pushed). Not changed: app-front (failed), app-report-api (nothing to push)." In v0.1 the activity log also shows each repo's HEAD before and after, with "Copy command to go back".
- **Undo** (BULK-09) is v0.2 only, with a specific label ("Undo: delete 2 new branches and switch back"), and never for pushes.
- **Focus:** when the user opens a result, focus goes to the first failure or paused repo's first button. A result finishing in the background never steals focus.
- On finish: a toast ("Push finished: 2 succeeded, 1 skipped, 1 failed. [View result]") and the same sentence as the announcement. The toast, the announcement and the counts line always use the same counts. With 0 failures there is no Retry button at all (never "Retry 0 failed").

### 12.8 Protected-branch and force-with-lease block (SAFE-01, SAFE-02, PIPE-05)

One block per preview, pinned above the footer. `warning-soft`, 1 px `warning` border, `radius-lg`, 12 px padding, `shield` icon. With force with lease, the border is `danger` and the icon `triangle-alert`.

```text
┌ This run writes to protected branches ──────────────────────────────────────────────────┐
│ Push to dev         app-api, app-front                                                   │
│ Commit to dev       app-api                                                              │
│ Force with lease    TK-2636-taosif-Onboarding in app-api                                 │
│                     Replaces 4 commits on origin with your version. Stops if anyone      │
│                     else pushed since your last fetch.                                   │
│ ☐ Push to dev in 2 repos and commit to dev in 1 repo                                     │
│ ☐ Force-push TK-2636-taosif-Onboarding in app-api with lease                             │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

- One checkbox per kind of risk (at most 2). The label restates the exact action and counts; never "I understand".
- The primary stays not-ready until all are ticked; the footer says "Tick the confirmation to push to dev."
- Each line links to its repo row. Unticking repos updates the block live; when no risky rows remain the block and its ticks disappear.
- No typing to confirm. Plain `--force` is never offered anywhere.

### 12.9 Destructive confirmations (SAFE-03)

Used for discard, delete a branch with unmerged commits, abort a merge with resolved files, stop-and-abort, and later reset. In the flow the rows become a **loss list** on `danger-soft`:

```text
Discard changes · 2 repos · 3 files
  app-front   cost-center.service.ts           modified   22 added, 4 removed lines lost
              cost-center-list.component.html  modified   5 added, 1 removed lines lost
  app-api     notes-draft.md                   untracked  whole file deleted (4 KB)
  Discarded changes can't be recovered. Git doesn't keep a copy of them.
                                    [Cancel]  [Stash instead]  [Discard 3 files]
```

- The primary uses `danger-action` and names the loss: "Discard 3 files", "Delete branch with 4 unmerged commits".
- [Stash instead] is offered wherever uncommitted changes would be lost.
- Initial focus on Cancel. **Neither Enter nor Mod+Enter confirms**: the destructive button needs a click, or Space/Enter while it has focus.
- Delete branch lists each unmerged commit (short hash + subject, up to 10, then "and 6 more"): "These commits exist only on this branch."

### 12.10 Dialog keys

- Initial focus: first unmade choice; else the primary for non-destructive actions; Cancel for destructive ones.
- **Plain Enter never submits the dialog**; it only activates the focused control.
- **Mod+Enter** runs non-destructive actions, including protected ones once the block is ticked. It does nothing in destructive dialogs.
- Esc = Cancel while nothing has started. Esc never cancels a running job.

### 12.11 Quit while writing

AlertDialog "2 Git commands are still writing" / "app-api and app-front are pushing." [Keep GitHeddle open] [Quit when they finish] (default) [Quit now] (`danger-action`, sub-text "They may stop midway. GitHeddle checks these repos next time it starts.").

## 13. Pipelines (PIPE-01..11)

### 13.1 List

```text
Pipelines                                                          [New pipeline]
Paused runs (1)
  ⏸ Update from main, merge into dev · Task TK-2636 · app-api paused at Update from main (3 conflicts)  [Open run]
My pipelines
  Update from main → dev   Fetch → Update from main → Push → Integrate into dev   ✓ 2 h ago   [Run…] ⋯
Ready-made
  Update from main                          Fetch → Update from main → Push      Ready-made  [Run…] ⋯
  Update from main, merge into dev          …                                    Ready-made  [Run…] ⋯
  Update from main, pull request to dev     …                                    Ready-made  [Run…] ⋯
```

- The step summary is `text-secondary`, cut with an ellipsis.
- ⋯: Edit, Duplicate, Rename, Delete…, and "Copy to My pipelines" for ready-made ones. Delete: "Delete pipeline "Update from main → dev". Runs that already happened stay in the activity log." [Cancel] [Delete pipeline].
- Source badges: "Ready-made", and "Team" in v0.2. `radius-sm`, `text-caption`, neutral.
- Last run: in v0.1 only the latest run kept in the journal (PIPE-14 is P1).
- Empty (none of mine): "No pipelines of your own yet. Save steps you repeat every day and run them on many repos at once. Pipelines run on this computer and don't build or deploy anything." [New pipeline] [Copy a ready-made one].

### 13.2 Ready-made and built-in pipelines

| Name | Steps |
|---|---|
| Update from main | Fetch → Update from `main` (merge) → Push `{current}` |
| Update from main, merge into dev | Fetch → Update from `main` → Push → Integrate into `dev` (merge, push on) |
| Update from main, pull request to dev | Fetch → Update from `main` → Push → Integrate into `dev` (pull request) |
| Sync with base (task action) | Fetch → Update from `{base}` (merge, or rebase by setting) → Push |
| Merge task into… (task action) | Fetch → Integrate `{task}` into the chosen branch (merge, push on) → Back to start branch |

Ready-made pipelines open read-only with the banner "Ready-made pipeline. Duplicate it to change the steps." [Duplicate]. Run entry points: the sidebar ▶, [Run pipeline ▾] (5 recent + "All pipelines…"), the Task screen, the palette. All open the preview.

### 13.3 Editor

```text
Pipeline name [ Update from main → dev                ]          [Discard changes] [Save] [Run…]
Runs Git and pull request steps on this computer. It doesn't build or deploy anything.
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ ⋮⋮ 1  Fetch                                                                   ↑ ↓ 🗑 │ 40 px
│ ⋮⋮ 2  Update from branch  [ main ▾        ]  using [ merge ▾ ]                ↑ ↓ 🗑 │
│ ⋮⋮ 3  Push                current branch                                       ↑ ↓ 🗑 │
│ ⋮⋮ 4  Integrate into      [ {base} × base branch ▾ ]  using [ merge ▾ ]        ↑ ↓ 🗑 │
│         ☑ Push dev after merging · dev is protected: you'll confirm once per run         │
│       ▸ Step options                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────────┘
[+ Add step ▾]
☑ Return each repo to the branch it started on
```

- Step rows are 2.5rem with sub-lines when needed. Columns: drag handle 1rem · number 1.5rem · step type 10rem · fields 1fr · actions 5.5rem (24 px icon buttons named "Move step 2 up", "Move step 2 down", "Remove step 2"). Alt+↑ / Alt+↓ (⌥↑ / ⌥↓) move the focused step, announced "Moved Push to position 2 of 4". Delete removes the focused step with an Undo toast.
- **Add step ▾** menu items with one-line descriptions: Fetch — "Downloads new commits from origin. Changes no branch." · Update from branch — "Brings another branch into the current one." · Push — "Sends the current branch to origin." · Switch branch — "Moves the repo to another branch." · Integrate into branch — "Brings the current branch into another one by merge, rebase or pull request." · Wait for confirmation — "Pauses every repo here until you click Continue."
- **Variables (PIPE-04).** The branch field is a ComboBox; typing `{` or opening it shows a "Variables" section first: `{current}` "the branch each repo is on when the run starts", `{base}` "each repo's base branch, usually dev", `{task}` "the active task's branch". A chosen variable is a chip inside the field (`info-soft`, `text-code`, `radius-sm`, 20 px, ×) with its meaning beside it. Hover or focus shows how it resolves now: "app-api → dev, app-front → dev, app-report-api → main". `{task}` with no active task: "No active task. {task} needs one when the pipeline runs."
- **Method** select: merge · rebase · pull request, each with a description inside the list. Rebase adds "Rebase rewrites the current branch. If it's already on origin, the push needs force with lease, which you confirm when you run." Pull request reveals Draft, Reviewers and Title `{ticket}: {title}`.
- Wait for confirmation has "Message to show" (placeholder "Check CI before merging into dev").
- Step options (PIPE-11, P1) in a Disclosure: "Skip if there's nothing to do", "Stop this repo if the step fails".
- **Validation:** an invalid step gets a 3 px `danger` left border and an inline message ("Choose a branch for step 2."). [Save] stays enabled; with problems it saves a draft and lists them above the steps: "2 problems: step 2 has no branch; step 4 integrates into its own branch." [Run…] is not ready until they are fixed.
- Leaving with unsaved edits: "You have unsaved changes to "Update from main → dev"." [Keep editing] [Discard changes] [Save].
- No steps: "Add the first step. Steps run in order in each repo; repos run side by side." [+ Add step].

### 13.4 Pipeline preview

The shared dialog with a grid body: rows are repos, columns are steps, cells show the planned outcome in words ("5 new commits", "Nothing to do", "Protected: dev"). It uses the run grid's geometry, so the user learns one picture. The confirmation block sits below it. Wide pipelines use the 56rem dialog.

### 13.5 Run grid

A centre view (Pipelines → run), React Aria Table in grid mode.

```text
Update from main, merge into dev · Task TK-2636 · started 10:42 · 1 min 12 s    1 done · 1 paused   [Cancel remaining]
                 │ Fetch     │ Update from main │ Push       │ Integrate into dev │ Back to start │
 app-front  ✓    │ ✓ Done    │ ✓ Merged         │ ✓ Pushed   │ ✓ Merged, pushed   │ ✓ Done        │
 app-api    ⏸    │ ✓ Done    │ ⏸ 3 conflicts    │ ○ Waiting  │ ○ Waiting          │ ○ Waiting     │ [Open conflicts] [Resume (3 conflicts left)] [Skip step] [Stop]
 Legend: ✓ done · ✗ failed · ⏸ paused · – skipped · ○ waiting
```

- **Cell:** min width 7.5rem, height 2rem, 16 px Lucide icon + `text-caption` word. Paused and failed cells get their soft bg. Words are specific: done (Merged, Pushed, Up to date), failed (Failed: rejected), paused (3 conflicts, Changed since preview, Waiting for you, Interrupted), skipped (Nothing to do, Cancelled, Stopped), waiting (Waiting), running (spinner, "Running · 12 s"). A cell confirmed after a restart gets a small `rotate-ccw` badge, "Confirmed after restart". Accessible name: "app-api, Update from main, paused, 3 conflicts".
- **Columns** are titled with the step name and its argument ("Integrate into dev"). The repo column (11rem) is sticky left with the overall icon; the actions column is sticky right and shows only on paused or failed rows. A legend row is always shown under the grid.
- A Wait-for-confirmation column shows its message and a header button [Continue all 2] once every repo waits there.
- Arrow keys move between cells; Enter opens the cell's commands and output in the details panel; focused cells have an inset ring.

**Paused-row actions** (PIPE-07):

| Reason | Actions (first is primary) |
|---|---|
| Conflicts | Open conflicts · Resume · Skip step · Stop |
| Changed since preview | Show what changed · Resume · Stop |
| Failure | Show Git output · Retry step · Skip step · Stop |
| Interrupted (restart) | Check repo · Resume · Skip step · Stop |

- Resume is not ready while conflicts remain: "Resume (3 conflicts left)". If the next step writes to a protected branch: "Resume · pushes to dev".
- **Stop never silently aborts a merge.** Mid-merge, Stop asks: "Stop the run for app-api" / "app-api is still in the middle of a merge: 3 files conflicted, 1 already resolved." [Keep the merge and stop] (default) [Abort the merge and stop] (`danger-action`, loss list names the resolved file).
- Finished: "Finished in 3 min 4 s · 2 done" with [Run again] (P1) and [Dismiss].

## 14. Pull requests

### 14.1 Task pull request status (v0.1, PR-05, PR-11)

Header "Pull requests · Task TK-2636", with [Create pull requests] and Refresh ("Updated 3 min ago").

| Column | Width | Values |
|---|---|---|
| Repo | 140 | app-front |
| PR | 64 | `#412` (opens the details panel); `external-link` icon opens GitHub |
| Title | flex | TK-2636: Onboarding |
| State | 88 | Draft (neutral) · Open (`success`) · Merged (violet) · Closed (`danger`) |
| Checks | 120 | "Checks passed 4/4" · "1 check failed" · "2 checks running" · "No checks" |
| Review | 136 | Approved (1) · Changes requested · Review required · No reviewers |
| Merge | 136 | Can merge · Conflicts with dev · Blocked: review required · Checking… |
| Comments | 56 | 3 |
| Updated | 72 | 12 min |

Task repos without a PR are listed below in `text-secondary`: "app-api · No pull request: 5 commits ahead of dev. [Create pull requests]".

| State | Content |
|---|---|
| Signed out | "Sign in to GitHub to create and track pull requests. GitHeddle never sees your password." [Sign in to GitHub] |
| No active task | "No active task. Your task's pull requests and their checks show here." [Start task] [Switch task] |
| Task, no PRs, commits ahead | "No pull requests for TK-2636 yet. 2 repos have commits ahead of dev." [Create pull requests] |
| Task, nothing ahead | "Nothing to open yet. Commit your changes first." [Open Changes] |
| Loading | Cached rows with the cache mark, "Updating from GitHub…" |
| Rate limited | `info` banner: "GitHub asked GitHeddle to slow down. Status refreshes again at 14:32." |
| Token expired or revoked (SEC-08) | `warning` banner "Your GitHub sign-in has expired. [Sign in again]"; cached rows in `text-secondary` |
| No permission / SSO | Row message: "GitHub says you can't see acme/app-api. If your organisation uses single sign-on, authorise GitHeddle on github.com." [Open on GitHub] |
| Offline | Offline banner, cached rows, "Updated 2 h ago" |

v0.2 (PR-06/07/08) adds tabs "Current task 2 · Created by me 5 · Review requested 3", a repo filter, and a selection bar [Mark ready for review] [Add reviewers…] [Merge in order…] [Close…], all through the shared preview.

### 14.2 Create pull requests preview (Flow 3, PR-02, PR-03)

The wide action-flow dialog (64rem), two columns under shared fields: a repo list (20rem) and an editor for the selected repo.

```text
┌ Create pull requests · Task TK-2636 · 2 of 3 repos ─────────────────────────────────────── × ┐
│ Shared for all                                                                               │
│ Title     [ TK-2636: Onboarding                                    ]  from {ticket}: {title}  │
│ Reviewers [ (AL) alice  (BO) bob  + ]  (optional)        ☐ Create as draft     Labels [ + ]   │
│ Assignees [ (TA) dev-taosif-net × + ]  default: you                                          │
├─────────────────────────────┬────────────────────────────────────────────────────────────────┤
│ ☑ app-api                   │ app-front   TK-2636-taosif-Onboarding → [ dev ▾ ]               │
│   TK-2636-… → dev           │ 2 commits ahead · will push first (branch not on origin)        │
│   5 commits · will push     │ Title  [ TK-2636: Onboarding                ]  ● edited         │
│ ☑ app-front        ● edited │ Body   ( Write | Preview )                                      │
│   TK-2636-… → dev           │ ┌────────────────────────────────────────────────────────────┐ │
│   2 commits · will push     │ │ ## What                                                     │ │
│ – app-report-api            │ └────────────────────────────────────────────────────────────┘ │
│   No commits ahead of dev   │ Related pull requests (added automatically after creating)     │
│                             │   · app-api — link added when created                          │
├─────────────────────────────┴────────────────────────────────────────────────────────────────┤
│ 2 pull requests will be created. 2 branches will be pushed first. [Cancel] [Create 2 pull requests] │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Shared fields apply to every repo. Editing one for a repo marks that row "● edited" (`info` dot) with [Use shared value] next to the field.
- The target per repo is a ComboBox defaulting to the repo's base (CFG-02).
- Reviewers use initials badges, no avatars (TH-07); suggestions from the group's default reviewers, prefilled.
- **Assignees** (PR-02) default to the signed-in user, prefilled as "(TA) dev-taosif-net" with × to remove and + to add more. The per-repo editor shows the same field under Title, with "Same as shared" until it is edited.
- "Create as draft" is off by default, tooltip "Drafts are visible but don't ask anyone to review yet." The button follows: "Create 2 draft pull requests".
- Body Write | Preview renders through the sanitised markdown view; images show as `[image: diagram.png]`; non-GitHub links show in full with [Copy].
- Related pull requests is a read-only placeholder, so the user knows it will be added (PR-03).
- Already exists (T-21): "#412 already open · will only update the related links"; button "Create 1 pull request, update 1".
- Nothing ahead but changes exist: "Skipped: app-front has no commits yet, but 2 changed files. [Commit them first]" — this jumps to Changes with that repo expanded, keeps the dialog's state and offers "Back to pull requests".
- Signed out: the device-code sign-in (§17.6) opens inline in the right column, then the preview continues. Never "go to Settings".
- Result rows carry links: "✓ app-front  #413 created (draft)  [Open on GitHub]". Summary: "2 pull requests created and linked to each other."

## 15. Activity log (BULK-08)

```text
Activity log                         [Filter commands…] [Repo ▾] [Source ▾] [Failed only]      Kept 30 days
▾ 14:02:11  Pull · Task TK-2636 · 4 repos · 3 succeeded, 1 failed                                    6.1 s
    14:02:11  app-api    git pull --ff-only                                      ✗ 128     1.2 s
    14:02:11  app-front  git pull --ff-only                                        0       0.8 s
▸ 13:40:03  Background status · 6 repos                                                              0.9 s
```

- Groups by source (a bulk action, a pipeline run, background status). Background status is collapsed by default and can be hidden with Source ▾.
- Command rows (24 px, virtualised, newest first): Time 72 (HH:MM:SS, 24 h) · Repo 140 · Command (flex, `text-code`, credentials shown as `[credentials removed]`, SEC-05) · Exit 48 (`0` neutral, non-zero `danger` with `x`) · Duration 64.
- Expanding a row shows stdout and stderr in a `surface-sunken` mono block (max 320 px), control characters escaped (UN-05), with [Copy command] (a terminal-ready `git -C "<path>" …`) and [Copy output]. For writes, HEAD before and after, and [Copy command to go back].
- Running commands show a spinner in Exit and stream output.
- Opened from a job's "Show in activity log", the screen is filtered to that job with the chip "Job: Pull · 14:02 ×".
- Empty: "Nothing has run yet. Every Git command GitHeddle runs appears here, so you can repeat it in a terminal."

## 16. Settings (CFG-01, CFG-02)

- A 200 px vertical tab list on the left (↑/↓), a form on the right (max 680 px, labels above fields). "Search settings" above the tabs filters fields across tabs.
- **Every change saves itself** (300 ms debounce; templates on blur), and "Saved" with a `check` shows next to the field for 2 s. An invalid value isn't saved and shows its error inline.
- Each field has a scope tag, `App` or `Workspace` (`text-caption` pill). The split below is provisional (§25).

| Tab | Fields (exact labels) |
|---|---|
| General | Theme: System / Light / Dark (App) · Zoom: 90–300 % with [Reset] (App) · Motion: System / Reduce / Full (App) · Editor: VS Code (detected path shown) / Other… (App) · Terminal: System terminal / Other… (App) · Remember window layout (App, on) |
| Git and branches | Your short name `taosif`, caption "Used in branch names" (App) · Branch name pattern `{ticket}-{user}-{title}` with a live example and variable list (Workspace) · Default base branch `dev` (Workspace) · Protected branches: chips `main` `master` `dev` + add (Workspace) · Sync method: Merge (recommended) / Rebase (Workspace) · Require staging before commit (App, off) · Parallel limit 1–16, default 4 (App) · Background fetch: Off / 5 / 15 / 30 / 60 min, default Off (Workspace) · Git: path and version, read-only, [Check again] |
| Pull requests | Title template `{ticket}: {title}` · Body template (markdown, [Preview]) · Create as draft by default (off) · Default reviewers per group (group → logins table) |
| Conflicts and tools | Resolve conflicts with: Built-in merge editor (default) / External tool… · External merge tool command (local only, never from the team file) |
| Accounts | GitHub: initials badge, "Signed in as dev-taosif-net", [Sign out]; or [Sign in with GitHub] and [Use a personal access token…]; the Linux keyring notice when relevant (SEC-02) |
| Workspace | Name · Folders (add / remove) · Search depth 1–5, default 2 · Groups (GRP-01): list with [New group], rename, edit, delete · Trusted repos: list with trusted date and [Review again] |
| Repositories (CFG-02) | Repo list (220 px) and an override form. Each field shows the inherited value as a placeholder ("dev, from Git and branches") and an [Override] toggle. Overridden fields get a 2 px `accent-indicator` left border and [Reset to default]. Fields: base branch, protected branches, sync method, default merge method (v0.2) |
| Keyboard shortcuts | v0.1: read-only table for this OS. v0.2: editable with conflict warnings (PIPE-12) |
| About | Version, licence GPL-3.0, font and icon licences, [Open logs folder], links to the repository and install guide |

## 17. First run and GitHub sign-in (Flow 0, UX-01)

### 17.1 Before the UI: Git check (GS-01)

If Git is missing or older than 2.30, a full-window blocker replaces everything:

- Title: "GitHeddle needs Git 2.30 or newer". Found but old: "Found Git 2.25 at /usr/bin/git. GitHeddle needs 2.30 or newer."
- Per-OS steps, each command with [Copy]: Windows — "Install Git for Windows from github.com/git-for-windows/git/releases" (an allowed link, UN-04); macOS — `xcode-select --install`; Linux — `sudo apt install git` or `sudo dnf install git`.
- [Check again].

The macOS WKWebView floor message (ui-architecture §17) is native: "GitHeddle needs macOS 13.3 or newer. Update macOS in System Settings → General → Software Update."

### 17.2 Frame

- Full window, no shell chrome, a centred card 35rem wide (max 90vw) on `surface-base`, `surface-overlay` card, `radius-lg`.
- Step indicator: "Step 1 of 4" with labelled dots **Folder · Review · You · GitHub** (also a list for screen readers). Review exists only if repos were flagged; otherwise "of 3".
- Footer: [Back] left; [Skip this step] (text button) and the primary right. The primary names where it goes: "Continue to review", "Continue to your details", "Continue to GitHub sign-in"; the last step's is "Open dashboard". Never a bare "Continue".
- Every skipped step becomes an item in the Getting started checklist (§22.2), so skipping never leaves a dead end. Target: under 2 minutes, no typing required.

### 17.3 Step 1 — Folder

> **Welcome to GitHeddle**
> Do Git and pull request work in many repos at once. GitHeddle uses your own Git, lists everything it runs in the Activity log, and asks before anything that changes your repos.
> **Where do your repos live?**

- Two 240 × 96 px choice tiles: **Choose a folder** · **Import a VS Code workspace** (`.code-workspace`).
- Then a live scan: "Looking in C:\Work\acme… 6 repos found" with [Stop], and a list (max 200 px, scrolls) of ticked repos with dimmed paths. [Look deeper].
- "Workspace name [acme-works]", prefilled from the folder name.
- Zero found: "No Git repos in C:\Work\acme\app-api\src. GitHeddle looks 2 folders deep." [Choose another folder] [Look 3 levels deep]. A single repo folder is accepted as a 1-repo workspace.
- Over 50 found: "Found 214 repos. That's more than GitHeddle is built for (up to 50). Pick a narrower folder, or untick the ones you don't need."
- Folder owned by another user: "Git refuses this folder because it belongs to another user." [How to fix] — never worked around (GS-08).
- Skip → the dashboard's "Open your repos" state.

### 17.4 Step 2 — Review repos (GS-08)

> **2 repos need review before GitHeddle runs Git in them**
> These repos have settings that make Git start other programs. If you cloned them from your team, trusting them is usually fine.
> ☑ `app-api`   `core.fsmonitor = "rs-git-fsmonitor"`
> ☑ `app-front` `include.path = ../shared.gitconfig`
> ▸ What does trusting mean? — "GitHeddle will run Git here, and Git will run these programs. Don't trust repos from people you don't know."
> [Not now] **[Trust 2 repos]**

The primary names the count. "Not now" leaves them as "Needs review".

### 17.5 Step 3 — You

- "Your short name [taosif]", prefilled from `git config user.name` (see §25), lowercase `a–z 0–9 -`; spaces become dashes as typed, hint "Spaces become dashes in branch names." Live caption: "Branch names will look like TK-2636-taosif-Onboarding".
- "Base branch [dev ▾]" with "dev exists in 5 of 6 repos." Exceptions: "app-report-api has no dev branch. It will use main. [Change]".
- Info line: "main, master and dev are protected. GitHeddle asks before committing, merging or pushing to them. Change this in Settings."
- **Git identity check.** If `user.name` or `user.email` is missing: "Git doesn't know your name and email yet. Commits need them." Name [ ] Email [ ] ☐ Use for all repos on this computer. Before saving it shows "GitHeddle will run: `git config --global user.name "…"`" and logs it. (New; see §26.)

### 17.6 Step 4 — GitHub (PR-01, SEC-03/04)

The same UI is used in the sign-in dialog (30rem) and inline in Create pull requests.

**A. Start.** "Sign in to GitHub" / "You need this to create and track pull requests. GitHeddle opens github.com in your browser; you approve it there and never type a password here." [Sign in with GitHub] · "Use a personal access token instead" · "Skip for now. You can sign in later from Pull requests or Settings."

**B. Code.**

```text
Enter this code on GitHub

        WDJB-MJHT            [Copy code]
   (JetBrains Mono 28 px, letter spacing 0.12em, selectable)

Go to  https://github.com/login/device       [Open it again]
We opened this page in your browser.

◌ Waiting for you to approve on GitHub…      Code expires in 14:32
Only enter this code on github.com. GitHub will show "GitHeddle" as the app name.
                                                          [Cancel]
```

The countdown updates every second and is announced only at 5 min and 1 min. The code's accessible name is "Your code: W D J B, dash, M J H T".

**C. Success.** "Signed in as dev-taosif-net" with the initials badge, then the "Can Git reach GitHub?" check below. In first run the primary is [Open dashboard]; in the sign-in dialog it is [Done: signed in]. It does not auto-close.

| Case | Message | Action |
|---|---|---|
| Code expired | "The code expired before it was approved." | [Get a new code] |
| Denied | "Sign-in was cancelled on GitHub." | [Try again] |
| Network | "Can't reach github.com. Check your connection or proxy." | [Try again] |
| No Secret Service (Linux, SEC-02) | "Signed in for this session only. Your desktop has no password store, so you'll sign in again next time. Installing GNOME Keyring or KWallet fixes this." | [How to set up a keyring] |
| Org restricts OAuth apps | "GitHeddle can't see repos in acme yet. An organisation owner must approve GitHeddle." | [Request access on GitHub] · use a token |

**Personal access token:** a masked field "Paste a personal access token" with Show and [Check and save]; "Use a fine-grained token. It needs:" plus the permission list from the core (scopes decided at M9). Invalid: "GitHub didn't accept this token. Check that it isn't expired and has the permissions above."

**Can Git reach GitHub?** At the end of the step, a read-only `git ls-remote --heads origin` per trusted repo (parallel, logged). Each repo shows "Git can reach github.com" or "Git has no saved login for github.com in app-front. GitHeddle can't type a password for Git." [Set up Git Credential Manager] [Use SSH instead]. A failure also puts the "Can't push: no Git login" pill on the dashboard row. (New; see §26.)

**Finish:** "You're set up." [Open dashboard].

## 18. Command palette (Mod+K)

| Part | Spec |
|---|---|
| Container | cmdk inside a React Aria Modal; 40rem wide; top edge at 12vh; `surface-overlay`, `radius-lg`, 1 px `border-strong`, `elevation-2` |
| Input | 2.75rem tall, 14 px text, placeholder "Type an action, pipeline, repo or task…" |
| Rows | 2rem: 16 px icon · title with matched characters in weight 600 (not colour) · context in `text-secondary` ("on Task TK-2636 · 2 repos") · key hint chips on the right |
| List | max 22.5rem (about 10 rows); section headers 1.5rem in `text-section-title` |
| Footer | 1.75rem: "↑↓ move · Enter choose · Esc close · Backspace back" |

- **Sections, in order:** Suggested (from state, up to 3: "Resolve 3 conflicts in app-api", "Pull 1 repo that's behind", "Resume paused run") · Recent (5) · Actions · Pipelines · Repos ("Go to app-api") · Tasks · Screens.
- **Scope prefixes** `>` actions, `@` repos, `#` tasks, `/` screens; hinted in the footer the first 3 times.
- **Second level:** choosing a repo opens its actions (Open in VS Code, Open terminal, Open in file manager, Open on GitHub, Fetch app-api, Go to app-api). Backspace on an empty input goes back.
- **Unavailable actions** are dimmed with the reason where the key hint would be ("No conflicts to resolve"); choosing one shows the reason as a toast.
- Changes always open their preview. Read-only actions run directly with a toast.
- No results: "No action matches "pshu". Try a Git verb like Push or Pull, or a repo name."
- Mod+P opens the palette in "Go to" mode (repos, screens, tasks).

## 19. Keyboard map

### 19.1 Rules

1. `Mod` is Ctrl on Windows and Linux and ⌘ on macOS (PLAT-05).
2. No Ctrl+Alt combinations on Windows or Linux: Ctrl+Alt is AltGr on many layouts.
3. No shortcut on keys that move between layouts (`[ ] \ ; '`), except the macOS conventions ⌘[ ⌘] ⌘,.
4. Avoid OS keys: Linux Ctrl+Shift+U and Ctrl+Shift+E (IBus), Ctrl+. and Ctrl+; (emoji), Alt+F5/F7/F8, Super; macOS ⌘H ⌘M ⌘Q ⌘W ⌘\` and ⌃⌘ system keys; Windows Win+, Alt+F4, Alt+Space.
5. Every F-key command has a macOS alternative (laptops need Fn).
6. Shortcuts that change something open their preview, so a mis-press is harmless.
7. Single letters work only outside text inputs. The merge editor's read-only panes count as outside (§19.3).
8. Every shortcut is checked at M1 on all three webviews.

### 19.2 Global

| Action | Windows / Linux | macOS |
|---|---|---|
| Command palette | Ctrl+K (alias Ctrl+Shift+P) | ⌘K (alias ⇧⌘P) |
| Go to repo, screen or task | Ctrl+P | ⌘P |
| Start task | Ctrl+N | ⌘N |
| Switch task | Ctrl+T | ⌘T |
| Fetch target (no preview) | Ctrl+Shift+F | ⇧⌘F |
| Pull target | Ctrl+Shift+D | ⇧⌘D |
| Push target | Ctrl+Shift+H | ⇧⌘H |
| Sync with base | Ctrl+Shift+B | ⇧⌘B |
| Create pull requests | Ctrl+Shift+R | ⇧⌘R |
| Run pipeline… | Ctrl+Shift+X | ⇧⌘X |
| Refresh status | F5 | ⌘R |
| Filter this screen | Ctrl+F | ⌘F |
| Go to screen 1–7: Repositories, Changes, Pull requests, Conflicts, Pipelines, Task, Activity log | Ctrl+1…7 | ⌘1…7 |
| Back / forward | Alt+← / Alt+→, mouse 4/5 | ⌘[ / ⌘] |
| Next / previous region | F6 / Shift+F6 | F6 / ⇧F6, or ⌃⌘→ / ⌃⌘← |
| Toggle sidebar | Ctrl+B | ⌘B |
| Toggle details panel | Ctrl+I | ⌘I |
| Toggle job panel | Ctrl+J | ⌘J |
| Open focused repo or file in editor | Ctrl+O | ⌘O |
| Open terminal in focused repo | Ctrl+Shift+T | ⇧⌘T |
| Settings | Ctrl+, | ⌘, |
| Zoom in / out / reset | Ctrl+= (Ctrl++) / Ctrl+− / Ctrl+0 | ⌘= / ⌘− / ⌘0 |
| Keyboard shortcuts sheet | ? (outside text) | ? |
| Context menu | Shift+F10, Menu key | ⇧F10, ⌃Return |
| Close dialog or popover, clear filter or selection | Esc | Esc |

### 19.3 Screen scopes

| Scope | Keys |
|---|---|
| Dashboard table | ↑/↓ rows, ←/→ cells, Space toggle, Shift+Space / Shift+↑↓ extend, Mod+A all visible, Enter details, Home/End, type-ahead |
| Changes tree | ui-architecture §10.5, plus Mod+Enter commit, Mod+Shift+Enter commit & push, Alt+M (⌃⌥M) message box, Mod+Delete (⌘⌫) discard confirmation |
| Diff | Next / previous change F7 / Shift+F7 (all OSes); aliases Alt+F5 / Shift+Alt+F5 on Windows only; ⌃⌘↓ / ⌃⌘↑ on macOS |
| Merge editor | F8 / Shift+F8 next/previous unresolved (macOS also ⌃⌘↓ / ⌃⌘↑) · take incoming Alt+I (⌃⌘I), or I in a read-only pane · take current Alt+C (⌃⌘C), or C · take both Alt+B (⌃⌘B), or B · reset conflict Alt+R (⌃⌘0), or R · Space toggles the focused side's checkbox · Mod+S accept · Mod+Z / Mod+Shift+Z (Ctrl+Y) undo/redo · F6 cycles Incoming → Current → Result → footer · Esc then Tab leaves Result · Alt+← (⌘[) back to Conflicts, asking first if unsaved |
| Pipeline editor | ↑/↓ steps, Alt+↑/↓ (⌥↑/⌥↓) move step, Delete remove (Undo toast), Mod+S save |
| Run grid | Arrows between cells, Enter opens the cell's output, Tab reaches the paused row's actions |
| Action-flow dialog | Tab cycles, Mod+Enter runs (not destructive), plain Enter only activates the focused control, Esc cancels |

### 19.4 Focus order

Shell tab order: **Skip to main content** → top bar toolbar (one stop, ←/→ inside) → sidebar (one stop) → main → details panel → job panel → bottom bar. F6 cycles top bar → sidebar → each main sub-region → details → job panel → bottom bar → toasts. Each region remembers its last focused element and the landing is announced ("Changes list", "Diff, Program.cs").

| Screen | Main sub-regions (F6 order) | Initial focus |
|---|---|---|
| Repositories | Toolbar, table | Table, last focused row |
| Changes | Toolbar, commit box, tree, diff (the visual order, top to bottom then left to right) | Tree's first file; the message box if anything is staged |
| Conflicts | Cards, Continue all | First unresolved file |
| Merge editor | Header, Incoming, Current, Result, footer | Active conflict's Incoming checkbox |
| Task | Header actions, repos table, PR list | First header action |
| Pipelines | List, editor, run grid | List selection |
| Settings | Tabs, panel | Tabs |
| Action-flow dialog | — | First unmade choice; else primary (non-destructive) or Cancel (destructive) |
| Palette | — | Input |

## 20. Accessibility (UX-08)

The target is **WCAG 2.2 AA**, including 2.5.8 target size, 2.4.11 focus not obscured and 3.3.7 redundant entry.

### 20.1 Accessible names

| Widget | Role | Name (description) |
|---|---|---|
| Task chip | button (menu) | "Active task: TK-2636 Onboarding, 2 repos. Task actions" |
| Target picker | combobox | "Target: Task TK-2636, 2 repos" ("Fetch, Pull, Push and pipelines act on these repos") |
| Fetch / Pull / Push | button | "Pull 2 repos" (the tooltip sentence) |
| Sidebar items | link | "Changes, 8 files" · "Conflicts, 1 repo needs you" · "Repositories, 6, 1 needs review" · "Pull requests, 1 open, 1 has a failing check". The `triangle-alert` icon and the `danger` dot are never the only signal: the name and a tooltip say the same sentence |
| Dashboard row | row | "app-api, on dev, merging, 3 conflicted, 6 changed, selected" |
| Needs-review row | row | "vendor-sdk, needs review before GitHeddle runs Git. Review button" |
| Changes repo header | treeitem level 1 | "app-api, on dev, merging TK-2636-taosif-Onboarding, 6 files, expanded" |
| Section header | treeitem level 2 | "Staged changes, 3 files, expanded" |
| File row | treeitem | "Program.cs, Api, modified, 8 added, 2 removed, staged" |
| Row buttons | button | "Stage Program.cs" · "Open Program.cs in editor" |
| Commit message | textbox | "Commit message" ("Commits 5 files in 2 repos: app-api, app-front. Nothing staged, so all changes are committed.") |
| Diff panes | textbox, read-only | "Program.cs, last commit, app-api, read only" |
| Merge checkbox | checkbox | "Take incoming for conflict 2 of 6, lines 14 to 16, TK-2636-taosif-Onboarding" |
| Result | textbox | "Result, Api.csproj, editable" ("2 of 6 conflicts unresolved. Press Escape then Tab to leave.") |
| Unresolved placeholder | group | "Unresolved conflict 3 of 6", announced when the cursor enters it (check at M1) |
| Run grid cell | gridcell | "app-api, Update from main, paused, 3 conflicts" |
| Job chip | button, with a `progressbar` inside (linked by `aria-describedby`) | "Push, 3 of 4 repos done. Open in job panel" |
| Account badge | button | "Signed in to GitHub as dev-taosif-net. Account menu" |
| Splitter | separator | "Resize sidebar", with values |
| Glossary term | button | "stash, what does this mean?" |
| Getting started | list | "Getting started, 2 of 6 done" |

### 20.2 Announcements (one polite announcer)

| Event | Text | Politeness |
|---|---|---|
| Stage / unstage | "Program.cs staged" / "3 files staged" | polite, coalesced in 500 ms |
| Filter | "12 files match" | polite, 400 ms after typing stops |
| Job start / progress / end | "Push started in 4 repos" · "2 of 4 done" (at most every 3 s) · "Push finished: 2 succeeded, 1 skipped, 1 failed." | polite |
| Repo paused | "app-api paused at Update from main: 3 files need you" | polite (assertive only if focus is in that job's view) |
| Conflict navigation / tick / accept | "Conflict 3 of 6, 2 unresolved" · "Incoming taken for conflict 3. 1 unresolved" · "Api.csproj saved and marked resolved. Opened DeleteOnboarding.cs, 2 conflicts" | polite |
| Target change | "Target: selection, 3 repos" | polite |
| Copy, zoom, sign-in, region | "Code copied" · "Zoom 150%" · "Signed in as dev-taosif-net" · region name | polite |
| Sign-in revoked while needed | "Signed out of GitHub: your sign-in was revoked. Sign in again to create pull requests." | assertive |
| Background refresh, watcher updates | — | never announced |

Toasts use role `status`. Undo toasts stay at least 10 s and pause on focus or hover (WCAG 2.2.1).

### 20.3 Zoom and reflow

- Steps: 90, **100**, 110, 125, 150, 175, 200, 250, 300 %. Reflow is guaranteed up to 200 % (breakpoints use effective width, §4.4); 250–300 % stays usable.
- A zoom change shows the toast "Zoom 150% · Reset (Ctrl+0)" for 2 s.
- The first-run default follows the OS text scale where the core can read it (Windows "Text size", GNOME `text-scaling-factor`); see §25.
- Truncation: paths middle-truncated keeping the file name; branches keeping the ticket and the end; full text always in the tooltip and accessible name. Repo names in action-flow dialogs wrap instead of truncating.

### 20.4 Reduced motion

See §3.8. Sources: `prefers-reduced-motion`, the OS setting from the core (GNOME `enable-animations`), and Settings → Motion.

### 20.5 Increased contrast (`prefers-contrast: more`)

macOS "Increase contrast", and GNOME high contrast when the core reports it:

- `border-subtle` takes the `border-strong` value.
- `text-secondary` becomes light `#3A3F4B`, dark `#C4C9D4`.
- The selection bar becomes 3 px.
- Elevation shadows are dropped; overlays get a 1 px `border-strong` border.

### 20.6 Forced colours (Windows contrast themes)

| Element | Mapping |
|---|---|
| Surfaces | `Canvas` |
| Text, secondary text | `CanvasText` (never `GrayText`, which means disabled) |
| Disabled | `GrayText` |
| Links | `LinkText` |
| Borders, panels, inputs | `CanvasText`; every panel and input has a real border because backgrounds vanish |
| Buttons | `ButtonFace` / `ButtonText`, 1 px `ButtonText` border; the primary has a 2 px border |
| Selected row | `Highlight` / `HighlightText`; the bar is `HighlightText` |
| Focus ring | 2 px `Highlight` outline |
| Status letters, run icons, pills | `CanvasText` with a 1 px `CanvasText` pill border; letter, word and icon carry the meaning |
| Diff | Backgrounds dropped; `+` / `−` signs stay; inserted words underlined, deleted words struck through |
| Spacer | Dashed border instead of the hatch |
| Merge regions | 1 px `CanvasText` frame with a gutter label "Conflict 2"; Incoming edge solid, Current edge dashed; unresolved placeholder 1 px dashed `Highlight`; auto-applied gets an "auto" gutter label |

`forced-color-adjust: none` is not used on the editors. Playwright emulates `forcedColors: 'active'` for screenshots and axe.

### 20.7 Colour vision

Red and green are never the only signal: diffs have gutter signs, run cells have icon + word, CI has icon + word, status letters are letters. Merge sides differ by position, title, I/C gutter letter and edge style as well as hue; a colour-vision simulation screenshot check runs at M0.

## 21. Copy deck

All strings live in `copy/` (ui-architecture §16). Sentence case; buttons name the action and its object; never "OK", "Yes" or "Something went wrong".

### 21.1 Button labels

| Context | Labels |
|---|---|
| Top bar | Start task · Run pipeline · Fetch · Pull · Push · Search or run a command… |
| Flow footers | Cancel · Start task in 2 repos · Switch 3 repos to TK-2601 · Add 2 repos to TK-2636 · Remove 1 repo from TK-2636 · Create branch in 3 repos · Pop stash in 2 repos · Merge into 3 repos · Delete branch in 2 repos · Create group · 4 repos · Pull 4 repos · Push 4 repos · Commit app-api · Commit 2 repos · Commit 5 files in 2 repos · Commit & push 2 repos · Switch 3 repos to dev · Stash 2 repos · Run pipeline on 2 repos · Create 2 pull requests · Create 2 draft pull requests · Sync 2 repos with dev · Merge into dev in 2 repos · Close |
| Inline choices | Take them along · Stash · Skip · Switch to it · Check it out and track origin · Merge origin in · Include all 3 changes · Stash all 2 · Skip all 2 |
| Destructive | Discard 3 files · Discard file · Delete 1 file · Stash instead · Delete branch with 4 unmerged commits · Abort merge in app-api · Abort the merge and stop · Quit now |
| Progress / result | Cancel remaining (2) · Retry 1 failed · Show Git output · Hide Git output · Open terminal · Show in activity log · Open conflicts · Resolve conflicts · View result · Dismiss · Copy · Undo: … (v0.2) |
| Run grid | Open conflicts · Resume · Resume (3 conflicts left) · Resume · pushes to dev · Skip step · Retry step · Stop · Keep the merge and stop · Continue all 2 · Show what changed · Check repo · Run again (v0.2) |
| Pipelines | New pipeline · Run… · Save · Discard changes · Duplicate · Copy to My pipelines · Delete pipeline · + Add step |
| Conflicts | Resolve · Resolve all… · Mark as resolved · Use dev for all 6 conflicts · Take all incoming · Take all current · Use incoming · Use current · Use both · Accept merge · Continue merge · Continue rebase · Continue cherry-pick · Continue all · 2 repos · Abort merge… · Keep resolving |
| Trust and sign-in | Trust 2 repos · Not now · Review · Review repos · Sign in with GitHub · Copy code · Open it again · Get a new code · Check and save · Done: signed in |
| First run | Continue to review · Continue to your details · Continue to GitHub sign-in · Open dashboard · Skip this step · Back |
| Unsaved | Keep editing · Discard my changes · Discard task |

### 21.2 Tooltips (one sentence, starts with a verb, states the safe limit)

| Control | Tooltip |
|---|---|
| Fetch | Downloads new commits from origin without changing any of your branches. |
| Pull | Brings new commits from origin into the current branch. Stops if it can't fast-forward. |
| Push | Sends your new commits to origin. Never force-pushes. |
| Commit | Saves the staged files as a new commit on each repo's current branch. Nothing is pushed. |
| Commit & push | Commits, then pushes each repo that committed. Publishes the branch if it isn't on origin yet. |
| Start task | Creates the task branch from the latest base in each repo you pick, after a preview. |
| Run pipeline | Runs a saved list of Git steps on the target repos, after a preview. |
| Sync with dev | Brings the latest dev into the task branch in every task repo; conflicts pause that repo. |
| Merge task into… | Merges the task branch into a branch you choose and pushes it only after you confirm. |
| Create pull requests | Opens one pull request per task repo that has commits ahead, after a preview you can edit. |
| Stash | Puts this repo's uncommitted changes aside as githeddle/TK-2636 so you can get them back later. |
| Stage (+) | Adds this file to the next commit. |
| Unstage (−) | Takes this file out of the next commit and keeps your changes. |
| Discard | Throws away your changes to this file after showing exactly what will be lost. |
| Mark as resolved | Marks this conflicted file as done. Only works when no conflict markers are left. |
| Resolve | Opens this file in the merge editor so you can choose what to keep. |
| Continue merge | Finishes the merge with a merge commit. Nothing is pushed. |
| Abort merge | Cancels the merge and puts the repo back as it was. Asks first. |
| Take all incoming | Uses TK-2636-taosif-Onboarding's side for every conflict in this file; you can still undo. |
| Accept merge | Saves Result to the file, marks it resolved and opens the next conflicted file. |
| Resume | Runs the paused step again after re-checking the repo. |
| Skip step | Moves this repo on to the next step without running this one. |
| Stop | Ends the run for this repo and keeps any merge in progress unless you choose to abort it. |
| Retry failed | Opens a new preview for only the repos that failed. |
| Cancel remaining | Stops repos that haven't started; running Git commands finish first. |
| Show Git output | Shows the exact Git command, its exit code and its full output. |

### 21.3 Error messages (what happened, where, what next)

Every message also offers [Show Git output].

| Code (proposed) | Message | Actions |
|---|---|---|
| `git.pull.dirty_worktree` | Pull stopped: app-front has local changes that the pull would overwrite. Stash them or commit first. | Stash and pull · Open Changes |
| `git.pull.not_fast_forward` | Pull stopped: app-api's branch and origin have both moved, so it can't fast-forward. Run Update from branch to merge origin in. | Update from origin · Open terminal |
| `git.push.non_fast_forward` | Push rejected: origin/TK-2636-taosif-Onboarding in app-front has commits you don't have. Pull first, then push again. | Pull app-front |
| `git.push.lease_rejected` | Force push refused: someone pushed to TK-2636-taosif-Onboarding in app-api since your last fetch. Fetch, look at their commits, then try again. | Fetch app-api |
| `git.auth_failed` | Fetch failed: origin refused the credentials for app-report-api. Set up your Git login, then retry. | Retry · How to set up a Git login |
| `git.timeout.network` | Fetch timed out: app-signalr-api got no answer from origin for 120 s. Check your network or VPN, then retry. | Retry |
| `git.index_lock` | Commit stopped: another Git program is using app-api right now (index.lock exists). Close it in VS Code or the terminal, then retry. | Retry |
| `git.hook_rejected` | Commit stopped: app-front's pre-commit hook failed. Your changes are still there. Fix what the hook reports, then commit again. | Show Git output |
| `git.merge.conflict` | Update from main paused: app-api has 3 files that need you to choose what to keep. Resolve them, then Resume. | Open conflicts |
| `preflight.changed_since_preview` | Push paused: app-api moved from TK-2636-taosif-Onboarding to dev after the preview. Check the repo, then Resume or Stop. | Show what changed · Resume · Stop |
| `preflight.operation_in_progress` | Pull skipped: app-api is in the middle of a merge. Finish or abort it on Conflicts first. | Open conflicts |
| `repo.untrusted` | Skipped: vendor-sdk needs review before GitHeddle runs Git in it. | Review repo |
| `github.signed_out` | Create pull requests stopped: you're not signed in to GitHub. Sign in, then try again. | Sign in to GitHub |
| `github.no_commits` | Pull request not created: app-report-api has no commits ahead of dev. Commit and push first, or leave it out. | — |
| `github.rate_limited` | Pull request status paused: GitHub's rate limit is reached until 14:32. GitHeddle tries again then. | — |
| `merge.markers_found` | Can't save Api.csproj in app-api: line 42 still has a conflict marker (<<<<<<<). Remove it or pick a side, then accept again. | Go to line 42 |
| `git.missing` | GitHeddle needs Git 2.30 or newer. Install Git, then check again. | Check again |
| `git.unknown` (fallback) | Push failed in app-api (exit code 128). Git said: "fatal: …first line…". Open the full output to see what to do. | Show Git output · Open terminal |

### 21.4 Empty states

| Screen / state | Text | Button |
|---|---|---|
| Repositories, no workspace | Open your repos. Choose the folder where your Git repos live, or import a VS Code workspace. | Choose folder… · Import VS Code workspace… |
| Repositories, none found | No Git repos found in C:\Work\acme. GitHeddle looked 2 folders deep. | Look 3 levels deep · Choose another folder |
| Repositories, filter | No repos match "sched" with Behind. | Clear filters |
| Task area, no task | No task yet. A task creates the same branch in every repo it touches. | Start task |
| Task, no repos | TK-2636 has no repos. Add the repos this ticket touches. | Add repos |
| Changes, clean | No changes in 6 repos. Edit files in your editor and they show up here. | Open in VS Code |
| Changes, filter | No files match "service". | Clear filter |
| Conflicts | No conflicts. Repos that stop in a merge or rebase show up here. | Go to repositories |
| Pull requests, no task | No active task. Your task's pull requests and their checks show here. | Start task |
| Pull requests, none yet | No pull requests for TK-2636 yet. 2 repos have commits ahead of dev. | Create pull requests |
| Pull requests, signed out | Sign in to GitHub to create and track pull requests. | Sign in to GitHub |
| Pipelines, none of mine | No pipelines of your own yet. Save steps you repeat every day and run them on many repos at once. | New pipeline · Copy a ready-made one |
| Pipeline editor | Add the first step. Steps run in order in each repo; repos run side by side. | + Add step |
| Groups | No groups. Group related repos to target them together. | New group |
| Activity log | Nothing has run yet. Every Git command GitHeddle runs appears here. | — |
| Job panel | Nothing running. Actions you run show their progress here. | — |
| Details panel | Select a repo, task or pull request to see its details. | — |
| Palette | No action matches "pshu". Try a Git verb like Push or Pull, or a repo name. | — |

### 21.5 Glossary terms (`components/Term`)

In prose (empty states, previews, dialogs) a Git term gets a 1 px dotted underline in `text-secondary`. Hover (500 ms) or focus (immediate) shows a 20rem tooltip with 1–2 sentences. Terms are focusable only in prose, never in tables. Sentences live in `copy/glossary`.

| Term | Plain sentence |
|---|---|
| Repo | A project folder that Git tracks, with its full history. |
| Branch | A separate line of work in a repo. Changes on one branch don't affect another until you merge them. |
| Base branch | The branch your task starts from and goes back into, usually dev. |
| Commit | A saved snapshot of your changes, with a message. It stays on your computer until you push. |
| Stage | Choose which changed files go into the next commit. |
| Fetch | Downloads news from GitHub without changing your files. Always safe. |
| Pull | Brings new commits from GitHub into your branch. Stops if your local changes would get in the way. |
| Push | Uploads your commits to GitHub so others can see them. |
| Stash | Puts your uncommitted changes aside so you can switch branches, and lets you bring them back later. |
| Merge | Combines another branch's changes into yours, adding one commit that joins them. |
| Rebase | Replays your commits on top of another branch, as if you'd started from there. Rewrites your branch's history. |
| Conflict | Both branches changed the same lines, and Git needs you to choose the result. |
| Ahead / behind | Ahead: commits you have that the other side doesn't. Behind: commits it has that you don't. |
| Origin | The copy of the repo on GitHub. |
| Protected branch | A shared branch (like dev or main) where GitHeddle asks before changing anything. |
| Pull request (PR) | A request on GitHub to merge your branch into another, so teammates can review it. |
| Draft pull request | A pull request that's visible but not asking for review yet. |
| Force with lease | Replaces the branch on GitHub with yours, but refuses if someone else pushed in the meantime. |
| Detached HEAD | The repo is looking at a specific commit, not a branch. New commits here are easy to lose. |
| Task | Your ticket's work: one branch name across several repos, and their pull requests. |
| Target | The repos the next action will touch. |
| Pipeline | A saved list of Git steps you can run on many repos with one click. It runs on your computer and doesn't build or deploy anything. |
| Incoming / Current / Result | Incoming: the changes being brought in (during a rebase, your own commit being replayed). Current: the side you're building on (during a rebase, the branch you're rebasing onto, plus your commits already replayed). Result: the file that will be saved. |

## 22. Novice journey

Persona **Rina**, frontend developer on Ubuntu 24.04. She commits and pushes from VS Code's Source Control and has never rebased. Her short name is `rina`; she works on TK-2636 in `app-api` and `app-front`. The success metric (PRD §11) is "first launch to created pull requests" without knowing a Git term.

### 22.1 Walkthrough

| # | Step | What she sees | Where she could get stuck | Design fix |
|---|---|---|---|---|
| 0 | Launch | Git check | Git missing | Full-window blocker with per-OS steps (§17.1) |
| 1 | Folder | Welcome + two tiles | Picks home or a subfolder | Zero/over-50 messages, 1-repo workspace accepted (§17.3) |
| 2 | Review | Trust list | Doesn't know what trust means | One-sentence explanation, "Trust 2 repos" names the count |
| 3 | You | Short name, base, identity | Git has no `user.email`, so the first commit would fail | Git identity check with the exact command shown (§17.5) |
| 4 | GitHub | Device code | Pushing later fails because her HTTPS login lives only in VS Code | "Can Git reach GitHub?" check on day one (§17.6) |
| 5 | Dashboard | Repos + Getting started | A repo is already mid-merge | Banner with [Resolve conflicts] [Abort merge…] |
| 6 | Start task | Inputs + preview | "Stash" is jargon; a forgotten stash looks like lost work | "Take them along (Recommended)", plain labels, stash pill on the row |
| 7 | Edit | Checklist "Make your changes in your editor" [Open both in VS Code] | Unsaved editor buffers | Hint "Unsaved edits in your editor aren't seen by Git." |
| 8 | Commit | Commit box | Nothing staged → "nothing to commit" | Commit-all mode with the count in the button (§8.6) |
| 9 | Commit on dev by accident | Protected confirm | Commits to a shared branch | [Start a task with these changes] as the first option |
| 10 | Create PRs | Wide preview | Not signed in; forgot to commit one repo | Inline sign-in; "[Commit them first]" keeps the dialog state |
| 11 | Done | Result with links | "Did it push?" | "2 pull requests created and linked to each other", links to GitHub |

About 10 clicks over 4 setup steps and 3 task dialogs.

### 22.2 Getting started checklist (`components/GettingStarted`)

A collapsible card above the dashboard table and on the Task screen (one 36 px line when collapsed: "Getting started · 2 of 6 done · Next: Start a task [Start task]"). Items tick from **real state**, not from clicks:

1. Choose your repos — workspace has ≥ 1 trusted repo.
2. Sign in to GitHub — signed in. "Needed to create pull requests."
3. Start a task — there is an active task.
4. Make changes in your editor — a task repo has changes or commits ahead. [Open both in VS Code]
5. Commit — every task repo with changes has a commit ahead.
6. Create pull requests — every task repo with commits ahead of its base has a pull request.

The next undone item is expanded with one sentence and one button; the rest are collapsed. When all are done: "All done, your pull requests are open. [Hide this guide]" — plain text, no confetti. [Hide] moves it to the palette ("Show getting started"). It is saved per user.

### 22.3 Where work can be lost, and the fix

| # | Situation | Fix |
|---|---|---|
| L1 | "+ all" on Merge changes would stage files that still have markers | No "+ all" there; [Resolve all…]; per-row Mark as resolved only when no markers remain (§8.3) |
| L2 | Discard changes | Loss list, [Stash instead], button named after the loss, Enter never confirms (§12.9) |
| L3 | Abort merge after resolving | The dialog names the resolved files and conflicts lost (§10.3) |
| L4 | Leaving the merge editor | Keep editing / Discard my changes; draft autosave is an open question (§25) |
| L5 | Unsaved editor buffers during a switch | Hint in Start, Switch and Finish task previews |
| L6 | Forgotten stash | Stash pill on the row; switching back shows an **unticked** choice "Bring back your stashed changes (githeddle/TK-2636)" (nothing is preselected, R17). If the pop conflicts, the repo pauses as a conflict and Git keeps the stash (§7.5) |
| L7 | Closing during a run | Quit dialog (§12.11) |
| L8 | Rebase / force push | Never preselected; the block says in words what is replaced (§12.8) |
| L9 | Detached HEAD commit | Commit box warning with [Create a branch here first] |
| L10 | Commit on a protected branch | [Start a task with these changes] first |
| L11 | Conflicts shown as failures | Conflicts are paused ("need you"); Retry failed excludes them |
| L12 | Rebase side meaning | Plain-language pane roles and the "Your commit" tag (§11.2) |
| L13 | Accept merge disabled without a reason | Visible reason; pressing jumps to the first conflict |
| L14 | No undo in v0.1 | Results say what changed; the activity log shows HEAD before/after with "Copy command to go back" |
| L15 | Commit-all picks up stray new files (`.env`, build output) | Commit-all takes tracked files only; new files need their own tick and are named in the preview line (§8.6) |
| L16 | Abort loses edits made before the merge | The abort dialog names them and offers [Stash them first] (§10.3) |
| L17 | Local commits on dev are left out of a new task branch | Start task asks: Bring them into the task branch · Leave them on dev (§7.4) |

### 22.4 Safe defaults

Pull fast-forward only · sync by merge · background fetch off (bottom bar nudges after 60 min) · no choice preselected (Take them along recommended) · return each repo to its start branch on · publish branch off · draft PR off · force with lease never preselected · parallel limit 4 · protected `main`, `master`, `dev`.

## 23. Mockups

Static HTML mockups live in [mockups/](mockups/index.html). They were built by two mockup authors to this list and revised after the design review. Each one links `tokens.css`, uses only its token variables and shared classes, starts with a "Skip to main content" link in every app window, switches theme with `data-theme="light" | "dark"` on `<html>`, inlines Lucide SVGs, and loads nothing from the network.

| File | What it shows | Covers |
|---|---|---|
| `mockups/tokens.css` | Every token value, light and dark, plus base styles and the shared component classes | §3 |
| `mockups/contrast-check.js` | The §3.3 contrast table and CI pair list, computed from `tokens.css` (`node mockups/contrast-check.js`) | §3.3 |
| `mockups/index.html` | Gallery: a link to every mockup with a one-line description and the PRD IDs it covers | — |
| `mockups/dashboard.html` | App shell + Repositories dashboard, normal state, with the details panel open on app-api | DASH-01..07, §4, §5, §6 |
| `mockups/task.html` | Task screen for TK-2636 and the Start task dialog | TASK-01/02, §7 |
| `mockups/first-run.html` | First-run steps, including the repo trust step and GitHub device-flow sign-in | UX-01, GS-08, PR-01, §17 |
| `mockups/pull-requests.html` | Task PR status (PR-05) and the Create pull requests preview (Flow 3) | PR-02/03/05/11, §14 |
| `mockups/settings.html` | Settings | CFG-01/02, §16 |
| `mockups/changes.html` | Changes screen (list mode) with the diff view open and the commit box | CHG-01..07, BULK-06, §8, §9 |
| `mockups/merge-editor.html` | Conflicts screen and the three-pane merge editor, including the rebase variant | CONF-01..11, §10, §11 |
| `mockups/pipelines.html` | Pipeline editor and the run grid with a paused repo | PIPE-01..10, §13 |
| `mockups/action-flow.html` | Preview, running in the bottom bar and job panel, a result with a failure; protected-branch confirmation; destructive confirmation | BULK-03..05, SAFE-01..04, §12 |
| `mockups/palette-states.html` | Command palette, empty states, error messages, toasts, loading from cache | UX-04/05/06, PERF-02, §18, §21 |

**Shared classes in `tokens.css`** (mockup authors use these instead of inventing styles; every colour is a `--gh-<role>` variable):

| Area | Classes |
|---|---|
| Shell | `gh-shell`, `gh-shell__body`, `gh-topbar`, `gh-topbar__spacer`, `gh-wordmark`, `gh-sidebar`, `gh-sidebar--rail`, `gh-sidebar__group`, `gh-sidebar__bottom`, `gh-nav-item` (`--sub`, `.is-selected`), `gh-main`, `gh-screen-header`, `gh-toolbar`, `gh-details` (`--overlay`, `__header`, `__body`, `__footer`), `gh-jobpanel` (`__list`, `__view`), `gh-bottombar`, `gh-jobchip` (`--running`, `--paused`, `--failed`, `--done`), `gh-splitter` (`--h`), `gh-pane` (`__header`, `__body`), `gh-card` |
| Text and icons | `gh-screen-title`, `gh-section-title`, `gh-strong`, `gh-caption`, `gh-secondary`, `gh-disabled`, `gh-code`, `gh-link`, `gh-num`, `gh-icon` (`--sm`, `--lg`, `--xl`, `--inherit`), `gh-spin`, `gh-term` |
| Buttons | `gh-btn` (`--primary`, `--danger`, `--danger-text`, `--ghost`, `--link`, `--icon`, `--sm`, `--lg`, `.is-busy`, `[aria-disabled="true"]`), `gh-btn__hint`, `gh-btn-group`, `gh-segmented`, `gh-chip` |
| Forms | `gh-input` (`--code`, `.is-invalid`), `gh-select`, `gh-textarea`, `gh-search`, `gh-field` (`__label`, `__hint`, `__error`), `gh-check` (`aria-checked`, `--incoming`, `--current`), `gh-checkrow`, `gh-radio`, `gh-switch` |
| Badges | `gh-pill` (`--success`, `--warning`, `--danger`, `--info`, `--conflict`, `--merged`, `--clean`), `gh-badge`, `gh-count` (`--danger`), `gh-dot`, `gh-initials`, `gh-varchip`, `gh-status` (`--M`, `--A`, `--D`, `--R`, `--U`, `--C` for "!"), `gh-counts` (`__add`, `__del`), `gh-kbd` |
| Lists and tables | `gh-table`, `gh-row` (`--repo`, `--section`, `.is-selected`, `.is-selected-inactive`, `.is-focus`, `.is-pending`, `.is-muted`, `.is-attention`, `.is-loss`), `gh-row__actions`, `gh-row__slot`, `gh-indent-1..3`, `gh-folder`, `gh-twisty`, `gh-skeleton`, `gh-cache-mark` |
| Overlays | `gh-scrim` (`--static`), `gh-dialog` (`--sm`, `--alert`, `--md`, `--wide`, `__header`, `__inputs`, `__toolbar`, `__body`, `__footer`, `__status`), `gh-preview-row` (`__sub`), `gh-confirm` (`--force`), `gh-menu`, `gh-menu__item` (`--danger`), `gh-menu__sep`, `gh-popover`, `gh-tooltip`, `gh-palette` (`__input`, `__list`, `__section`, `__row`, `__footer`) |
| Feedback | `gh-banner` (`--info`, `--warning`, `--danger`, `--success`, `__text`), `gh-toast-region`, `gh-toast` (`--success`, `--warning`, `--danger`), `gh-empty` (`__actions`), `gh-progress`, `gh-meter`, `gh-steps` |
| Runs | `gh-run-cell` (`--done`, `--failed`, `--paused`, `--skipped`, `--waiting`, `--running`), `gh-run-legend` |
| Editors | `gh-editor`, `gh-line` (`__num`, `__sign`, `__gutter`, `__source`, `__code`, `--active`), `gh-diff-line--ins`, `gh-diff-line--del`, `gh-diff-word--ins`, `gh-diff-word--del`, `gh-diff-spacer`, `gh-diff-collapsed`, `gh-diff-divider`, `gh-ruler`, `gh-merge-region` (`--incoming`, `--current`, `--auto`, `--auto-incoming`, `--auto-current`, `--edited`, `--resolved-incoming`, `--resolved-current`, `--unused`, `.is-active`), `gh-merge-source--I/C/E`, `gh-merge-pane-title--incoming/current/result`, `gh-merge-placeholder`, `gh-order-badge`, `tok-*` syntax classes, `gh-output` |
| Helpers | `gh-stack`, `gh-hstack`, `gh-spacer`, `gh-truncate`, `gh-mock-label`, `gh-sr-only`, `gh-divider`, `gh-vdivider` |

## 24. Panel rulings

Where proposals disagreed, the chair decided. Each ruling lists what was proposed, the decision and why.

| # | Topic | Proposals | Decision | Why |
|---|---|---|---|---|
| R1 | Colour values | Five different palettes; only Agent 1's was contrast-checked on every surface, including selected rows | Agent 1's palette, accent indigo `#3D4FD1` | Verified numbers beat estimates, and it passes the selected-row cases the others failed |
| R2 | Row height | 24 px (Agents 1, 3, 5) vs 28 px (Agents 2, 4) | 24 px for every row; dialogs and the palette use larger rows where noted | Meets WCAG 2.5.8 with 24 × 24 row buttons and keeps IDE density |
| R3 | Text sizes | Caption 11 px (Agent 2) vs 12 px (others); screen title 16 vs 18 px | Caption 12 px is the floor; screen title 16 px; code 13 px | No text under 12 px (Agent 5); 16 px titles fit the dense shell |
| R4 | Section title case | Uppercase 11 px (Agent 1) vs sentence case 12 px (Agents 2, 4, 5) | Sentence case 12 px 600; no uppercase anywhere | Easier to read for less-confident users; ui-architecture §16 asks for sentence case |
| R5 | Window frame | Native (Agent 2); others silent | Native frame on all three OSes in v0.1 | One hit-test scheme, no WebKitGTK/Wayland risk |
| R6 | Minimum window | 960 × 600 (A1), 1024 × 640 (A2, A3), 800 × 560 (A5) | 1024 × 640; breakpoints on effective width (A5) | Keeps the merge editor at ≈ 52 characters per side; zoom still reflows down to single column |
| R7 | Shell sizes | Top bar 40/44, bottom bar 24/26/28, sidebar 220/240, details 320/340 | Top 40, bottom 24, sidebar 240, details 320 | Majority values; denser shell leaves more room for content |
| R8 | Sidebar order | PRD sketch: objects first; A2 and A5: screens first | Screens first, Activity log and Settings pinned at the bottom; "Repositories" label | Navigation never moves; novices look for "where am I" first |
| R9 | Target vs checkboxes | A2 and A5: ticking switches the target; A2: group click also sets it | Both adopted, with a "← Back to …" chip and the target repeated in every preview | Removes the PRD sketch's ambiguity; the shown rows are the acted-on rows |
| R10 | Where results live | Job tray popover (A2) vs docked job panel (A4) | Docked, non-modal job panel above the bottom bar (Mod+J) | A 30-repo result with failure rows doesn't fit a popover or the 20rem details panel |
| R11 | Icons and state glyphs | Unicode in docs; A1 and A4: SVG | Lucide SVG everywhere; Unicode stays as document notation | `⏸` renders as emoji on two OSes; fonts differ |
| R12 | Merge side colours | Teal/violet (A1) vs blue/teal (A3) | Teal Incoming, violet Current, with `-edge` sub-roles and a new `merge-active` | Verified contrast; doesn't copy VS Code or Visual Studio; avoids add/delete reading |
| R13 | "+ all" on Merge changes | PRD sketch has it; A3 and A5 remove it | Removed; [Resolve all…] and per-row Mark as resolved gated on the marker scan | Staging a file with markers marks it resolved and loses work later |
| R14 | Commit with nothing staged | Skip (BULK-06), stage-all button (A3), preview choice (A2), commit all with label (A5) | Commit-all mode when nothing in scope is staged, with the file count in the button and visible helper text; "Require staging" setting for experts; mixed scopes commit staged only, with a per-repo "Include all" choice | Removes the #1 novice trap without anything silent |
| R15 | Commit box position | Below the list (PRD, ui-architecture §10.8, A3) vs above (A5) | Above the list, pinned | Matches VS Code, which the PRD names as the model for this screen |
| R16 | Single-repo commit preview | Open the full flow vs inline preview line (A3) | Always-visible preview line plus the protected-branch AlertDialog | Keeps the one-repo commit one click; still shows what will happen |
| R17 | Uncommitted-changes choice | No preselection (A2, A4) vs default "Take them along" (A5) | "Take them along" offered when the switch is clean and tagged Recommended, but nothing is preselected | Keeps ui-architecture §7's "every choice is made" rule while guiding novices |
| R18 | Disabled primary buttons | `disabled` + tooltip vs aria-disabled with visible reason (A4, A5) | aria-disabled, focusable, visible reason, focus moves to the first unmet requirement | Tooltips on disabled buttons are unreachable by keyboard and screen readers |
| R19 | Conflicts in results | ✗ failed (PRD preview sketch) vs paused (A5, PIPE-08) | Paused, "need you"; Retry failed excludes them | Avoids panic and re-running a merge on a conflicted repo |
| R20 | Enter in dialogs | Mod+Enter runs (A4); Enter does nothing on protected (A5) | Plain Enter never submits; Mod+Enter submits non-destructive actions (protected once ticked); destructive needs a deliberate press | One rule that prevents an accidental push or discard |
| R21 | Confirmation strength | Checkbox per risk (A4) vs typing to confirm | One checkbox per risk kind, labels restating the action; no typing | Protected pushes are routine for this team; the point is seeing names |
| R22 | Focus after an action | First failure (ui-architecture §15) vs return to invoker (A4) | Return to invoker; first failure or paused repo only when the user opens the result | The dialog closes at run start; moving focus later would steal it |
| R23 | Stop during a paused merge | Unspecified | Stop asks; default "Keep the merge and stop" | Silent abort could lose resolved files (G6) |
| R24 | Shortcuts for screens and panels | Mod+1..5 + Mod+Alt+B (A2) vs Mod+1..7 + Mod+I (A5) | Mod+1..7 screens, Mod+B sidebar, Mod+I details, Mod+J job panel; merge "take" keys Alt+I/C/B (⌃⌘ on macOS) | No Ctrl+Alt (AltGr); digits mean screens everywhere |
| R25 | Next change in diff | Alt+F5 (ui-architecture §11) vs F7 (A5) | F7 / Shift+F7 everywhere, Alt+F5 alias on Windows, ⌃⌘↓/↑ on macOS | Alt+F5 is GNOME's unmaximise; macOS F-keys need Fn |
| R26 | Discard key | Delete (A3) vs Mod+Delete (A5) | Mod+Delete / ⌘⌫, always opening the confirmation | Harder to hit by accident |
| R27 | Mod+F | "Search repos" (PRD) | "Filter this screen": repos, files, or editor search | One key, predictable per screen |
| R28 | Zoom steps | 90–200 (A1) vs 70–300 (A5) | 90–300 %; reflow guaranteed to 200 % | 90 % keeps captions ≥ 10.8 px; high zoom helps low-vision users |
| R29 | Focus ring offset | 1 px (A2, A4) vs 2 px (A1, A5) | 2 px outside, −2 px inset in rows and cells | The dark accent fill needs the ring on the surface around it |
| R30 | Toast durations | 4–10 s in four variants | Success 4 s, info/failure 6 s, action 8 s, Undo 10 s; pause on hover/focus | Long enough to act; failures also persist in the job chip |
| R31 | Border units | rem everywhere (ui-architecture §8) vs px hairlines (A1) | px for borders, rings, bars and shadow offsets; rem for everything else | rem hairlines blur at fractional zoom |
| R32 | Wordmark | Two-tone (A1) vs single colour | Single colour | Avoids reading as a "Git" + "Heddle" split brand |
| R33 | First-run steps | 4 steps (A2) vs 5 with Welcome (A5) | 4 steps (Folder · Review · You · GitHub), Welcome text on step 1, plus Git identity and reachability checks | Under 2 minutes; the two checks remove the two worst later failures |
| R34 | Guidance | Next step card (A2); checklist, glossary terms and "?" help (A5) | Next step card, Getting started checklist and glossary terms in v0.1; "?" help panel stays P1 (§25) | Cheap, state-driven help now; the help panel is a scope decision for the owner |
| R35 | Dashboard values | Arrow numbers (A2) vs words (A5) | Words ("2 to push", "4 behind") with optional arrows, plus A2's priority pill catalogue | The PRD's "2/0" is cryptic; one catalogue serves every screen |
| R36 | CONF-02 meaning | Whole-file checkout vs resolve every conflict with one side (A3) | Resolve every conflict with that side; whole-file only for delete/modify, binary and over-limit files | Keeps non-conflicting changes; matches CONF-08 |
| R37 | Stash visibility | DASH-07 stashes are P1 | GitHeddle-made stashes show as a pill in v0.1 | v0.1 creates stashes (SAFE-04), so it must show them |
| R38 | Group editor and the action flow | Design review: GRP-01 had no editor | A small dialog (name + repo checklist) that saves directly, without the preview | A group is a GitHeddle setting and changes nothing in Git; the preview is for Git changes |
| R39 | New files in commit-all | Design review: commit-all could include untracked files | Commit-all takes tracked files only; new files need their own tick and are named in the preview line | One click must never publish a stray `.env` or build output |
| R40 | Pending row look | 2 px `info` bar (first draft) | No bar; a spinner and "Staging…" in the row's slot | The `info` bar and the selection bar differ by only 1.05–1.07:1, so pending looked selected |
| R41 | Fit at the default window | Design review: at 1280 × 800 the dashboard columns and the side-by-side diff didn't fit | A docked panel never leaves the centre under 720 px (otherwise it overlays); dashboard columns give way in a fixed order (§5.2) and filters overflow into "More filters ▾" (§5.7); the Changes list is 320 px below 1440; side by side down to a 640 px diff pane | The default window must show the designed layout without improvised workarounds |
| R42 | Glyphs on light fills in dark mode | White everywhere (first draft) | New `indicator-glyph` role (white light, `#131519` dark) for checks on merge edges and the switch knob; checked radio and switch use `accent-indicator` | White on the dark edges is 2.39–2.76:1 and dark `accent` rings were 2.17–2.91:1; both now pass 3:1 |
| R43 | Search-match colour | `#5A4614` dark (first draft) | `#3F3210` dark | Dark syntax colours fell to 3.83:1 on the old value; the darker one keeps every role at 4.91:1 or more |
| R44 | Small badges | 9–11 px text in initials, order badges, key hints, rail counts | All at `text-caption` (12 px); the badges grow instead (20 px initials, 16 px order and number badges) | Keeps R3's floor with no exception list to maintain |
| R45 | Key notation | Three notations in the mockups, some mixing `Ctrl` with `⇧` | One notation per OS from the registry: chips `Ctrl Shift B` / `⇧⌘B`, prose `Ctrl+Shift+B` | PLAT-05; a mixed hint matches no keyboard |
| R46 | Job chip role | `progressbar` | `button` with a progress bar inside | It opens the job panel; a progressbar isn't announced as clickable |
| R47 | Local commits on the base at Start task | Silently branch from `origin/dev` (TASK-02) | Ask: Bring them into the task branch · Leave them on dev; nothing preselected | Otherwise a novice's accidental commits on dev vanish from the task branch without a word |
| R48 | Abort over edits made before the merge | Loss list named only the resolved files | The core reports files that were dirty before the operation; the dialog names them and offers [Stash them first] (or [Save copies first]) | `git merge --abort` may not rebuild those edits |
| R49 | One example state | Sections used different states for app-api and app-front | One state, written down under §5.1, used by every section | Contradicting examples made the spec hard to check |

## 25. Open questions

1. **Accent hue:** is indigo `#3D4FD1` right for the brand?
2. **Bangla text:** bundle a Noto Sans Bengali subset (≈ 100–200 KB) so Bangla commit messages render the same everywhere, or rely on system fonts?
3. **Compact density:** a 22 px row setting in v0.2?
4. **Linux high contrast:** should the core detect GTK high-contrast themes and report `prefers-contrast: more`?
5. **Preview streaming:** will the core stream preview rows per repo (§12.3 assumes it can)?
6. **Short jobs:** for jobs under about 3 s (Start task on 2 repos), keep the dialog open and show the result in place?
7. **Pull preview:** should a plain fast-forward Pull ever skip the preview? UX-03 says no.
8. **Stale protected confirmation:** should a confirmation expire, for example when a paused run is resumed the next day?
9. **Merge Result draft:** should the core autosave Result drafts so a crash never loses choices (new core command)?
10. **Discard snapshot:** should the core snapshot discarded files (`refs/githeddle/discarded/*`, 14 days) so discard can be undone?
11. **Push credentials:** accept a scoped askpass bridge for allow-listed GitHub remotes (changes GS-13), or rely on the reachability check and a guide?
12. **Git identity:** may first run write `git config --global user.name/email`, or only per repo, or only explain?
13. **Ticket key:** mandatory? Teams without tickets are stuck at Start task; a blank key would give `rina-Onboarding`.
14. **Short-name derivation:** first word, last word or the `user.email` local part of `git config user.name`?
15. **Settings scope:** which settings are per workspace and which apply to the whole app (§16 is provisional)?
16. **Group click:** should clicking a group in the sidebar change the target (R9), or only filter?
17. **"?" help in v0.1:** ship minimal help for Repositories, Start task, Changes, Create pull requests and Conflicts, since the success metric is a v0.1 goal (UX-11 is P1)?
18. **Pull requests count:** open PRs, or only PRs needing attention?
19. **Activity log:** 30 days retention; log background status at all?
20. **Next step card on the dashboard:** also show it for the active task, as one line above the table?
21. **Protected branches from GitHub:** also treat branches GitHub reports as protected as protected?
22. **Rebase skip:** offer "Skip this commit" on rebase cards, with a SAFE-03 confirmation?
23. **Whitespace toggle:** "Show whitespace changes" in v0.1 or P1?
24. **Merge take keys:** Alt+I/C/B as defaults, or palette-only until assigned?
25. **Coach strip:** once per user, or once per operation type (proposed)?
26. **macOS alternatives:** who owns the M1 checklist for ⌃⌘ keys against WKWebView, CodeMirror and macOS?
27. **Zoom follows OS:** keep following the OS text scale after first run?
28. **Reviewers field:** does the shared Reviewers field merge with or replace each group's defaults?
29. **Getting started:** also for an existing user opening a new workspace?

## 26. Conflicts with existing docs

These need a change in the named documents (both languages) if the owner accepts them. Nothing here has been changed yet.

1. **ui-architecture §8, missing token roles.** Add: `accent-indicator`, `danger-action-hover`, `indicator-glyph`, `merge-*-edge`, `merge-active`, `run-running`, `diff-spacer-1`, `diff-spacer-2`, `editor-selection`, `editor-active-line`, `editor-search-match`, `editor-cursor`, `scrim`, `logo-tile`, `logo-thread`, `elevation-0..2`, `radius-*`, `motion-*`, `control-sm/md/lg`, `icon-sm..xl`. These are additions.
2. **ui-architecture §8, "All sizes are in rem".** Exception for borders, focus rings, selection bars, merge edges, `pane-gap` and shadow offsets (px) (R31).
3. **ui-architecture §8, "forced-colors is respected".** Add `prefers-contrast: more` for macOS and decide Linux (§20.5, open question 4).
4. **ui-architecture §13 and PRD §7 M / §8 glyphs.** Render ✓ ✗ ⏸ – ○ as SVG icons with words; keep the glyphs as notation (R11).
5. **ui-architecture §3 / PRD §8 main window: new job panel region** above the bottom bar (R10).
6. **ui-architecture §7: inputs stage** before Preview, in the same dialog, with live re-planning (§12.2).
7. **ui-architecture §7: "Run stays disabled"** becomes aria-disabled with a visible reason (R18).
8. **ui-architecture §7.1 / §16: button "Trust selected repos"** becomes "Trust 2 repos" (with the count).
9. **ui-architecture §7.1: "dimmed row"** means `text-secondary` cells, not opacity.
10. **ui-architecture §10.4 and PRD §8 Changes sketch: "+ all" on Merge Changes** removed (R13).
11. **ui-architecture §10.8: commit box under the list** moves above it (R15).
12. **PRD §8 Changes sketch: commit box under a mid-merge repo.** Repos in an operation are always left out of the commit scope.
13. **PRD Flow 2 step 4 and BULK-06: repos with nothing staged are skipped.** Commit-all mode (R14).
14. **UX-03 / ui-architecture §10.8: single-repo commit preview** is the inline preview line plus the protected-branch dialog (R16).
15. **SAFE-04 "Stash / Skip / Cancel".** Per repo: Stash / Skip (plus "Take them along" when clean); Cancel is the dialog button (R17).
16. **PRD §8 preview sketch: `[ Stash and continue ▾ ]`** looks preselected; choices are radios with nothing preselected.
17. **PRD §8 preview sketch: conflicts as ✗ failed and `[Run]`.** Conflicts are paused (R19); the button names the action ("Sync 2 repos").
18. **BULK-05 "Show log".** Split into "Show Git output" (inline) and "Show in activity log" (filtered log).
19. **ui-architecture §15: focus after an action** (R22), and paused repos count with failures.
20. **ui-architecture §7 step 4 / §9: Undo** in v0.1 only for UI-local edits (merge editor); run undo is v0.2 (BULK-09).
21. **Architecture §9 / PIPE-07: Stop during a merge** keeps the merge unless the user chooses to abort (R23).
22. **CONF-02 wording** should say "resolve every conflict with that side" (R36).
23. **PRD §8 sidebar sketch** order and the "Repos" label (R8).
24. **PRD §8 shortcut table.** Rename "Search repos" to "Filter current screen" (R27); add Mod+P, Mod+T, Mod+Shift+F/D/H/B/R/X, Mod+1..7, Mod+B, Mod+I, Mod+J, F6, ? (shortcut sheet), Mod+O, Mod+Shift+T.
25. **ui-architecture §11: Alt+F5** for next change becomes F7, with aliases (R25).
26. **ui-architecture §14 rule 2: single-letter keys inside editors.** The merge editor's read-only panes are exempt (I, C, B, R, Space).
27. **PRD Flow 0 / UX-01: Git identity check and the "Can Git reach GitHub?" check** are new first-run steps. The identity check writes Git config (a new, logged core command).
28. **GS-05 / GS-13: push credentials.** Users whose HTTPS login lives only in VS Code can't push; the reachability check detects it (open question 11).
29. **DASH-07 (P1): stashes.** GitHeddle-made stashes show in v0.1 (R37).
30. **UN-04 link allow-list.** The "Git is needed" screen links to the github.com Git for Windows releases page instead of git-scm.com; confirm, or allow-list a documentation host.
31. **PRD §8 "MERGING · 3 conflicted"** in capitals is notation; the UI says "Merging · 3 conflicted".
32. **ui-architecture §7: "every change goes through the preview".** Besides the single-repo commit (#14), three changes don't open the full flow: **Continue merge** on a branch that isn't protected commits from the Conflicts card, whose footer shows the commit message first ("Will commit: Merge branch 'TK-2636-taosif-Onboarding' into feature-x"); **Use dev for all 6 conflicts** confirms in a popover and saves and stages one file; **group edits** save directly (R38). Accept these as exceptions, or route them through a one-row preview.
33. **ui-architecture §12: "Accept merge … is disabled"** while conflicts remain becomes aria-disabled with a visible reason (R18).
34. **TASK-02: "create the branch from `origin/<base>`"** gains the R47 choice when the local base has commits origin doesn't.
35. **New core data** for the UI: files that were dirty before a merge, rebase or cherry-pick started (R48); local-only commits on the base (R47); whether a stash pop would touch files changed since (§5.9, §7.5).

## 27. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 3 November 2026 | First version, merged by the panel chair from the five design-panel proposals: visual language with verified contrast, shell and layout, every screen's anatomy and states, the action flow, pipelines, keyboard map, accessibility, copy deck, novice journey, the mockup list and 37 panel rulings. Revised after the design review: contrast table regenerated from `tokens.css` by a script, dark-theme fixes (merge check glyph, search match, radio and switch, coach badges), designs for Switch task, Add/Remove repos, Merge task into…, the bulk operations, the group editor and PR Assignees, one consistent example state, default-window fit rules, safer commit-all, abort and Start task cases, and rulings R38–R49. |
