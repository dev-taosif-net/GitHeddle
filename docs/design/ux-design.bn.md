# GitHeddle — UI/UX ডিজাইন

**English version:** [ux-design.en.md](ux-design.en.md)

| | |
|---|---|
| **ডকুমেন্ট** | UI/UX ডিজাইন (visual language, layout, screen, interaction আর লেখা) |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। Design panel (Agent 1–5) লিখেছে |

**সম্পর্কিত ডকুমেন্ট:** [PRD](../product/PRD.bn.md) · [UI architecture](ui-architecture.bn.md) · [ADR 0001 — Technology stack](../decisions/0001-tech-stack.bn.md) · [Architecture](../architecture/architecture.bn.md) · [Security](../engineering/security.bn.md) · [Test strategy](../engineering/test-strategy.bn.md) · [Roadmap](../plan/roadmap.bn.md) · [Mockups](mockups/index.html)

> এই file আর এর ইংরেজি সংস্করণে একই content আছে। একটা বদলালে অন্যটাও একই commit-এ update করতে হবে।

---

## ১. উদ্দেশ্য ও পরিধি

GitHeddle দেখতে কেমন আর কীভাবে আচরণ করে, এই ডকুমেন্টে সেটা বলা আছে: token-এর মান, layout আর তার মাপ, প্রতিটা screen-এর গঠন ও state, interaction, keyboard map আর screen-এ ঠিক কোন কথাগুলো লেখা থাকবে।

UI কীভাবে বানানো হয় তা বলে [UI architecture](ui-architecture.bn.md): folder, state, core-এর সাথে interface, component library আর engineering-এর নিয়ম। দুটো ডকুমেন্ট এভাবে একে অন্যের পরিপূরক:

| প্রশ্ন | উত্তর কোথায় |
|---|---|
| কোন কোন token role আছে, আর সেগুলো Tailwind-এ কীভাবে জোড়া হয়? | ui-architecture §৮ |
| Light আর dark-এ প্রতিটা role-এর মান কত, আর contrast পাস করে কি না? | এই ডকুমেন্ট, §৩ আর [mockups/tokens.css](mockups/tokens.css) |
| X-এর জন্য কোন React Aria component ব্যবহার হয়? | ui-architecture §৯ |
| X কত বড়, তাতে কী লেখা, খালি, loading বা ব্যর্থ হলে কী হয়? | এই ডকুমেন্ট, §৪–§১৮ |
| ভাগাভাগি করা preview → run → result flow কী করে? | ui-architecture §৭ (নিয়ম), এই ডকুমেন্টের §১২ (চেহারা, লেখা, key) |

যেখানে এই ডকুমেন্টের এমন কিছু দরকার যা আগের ডকুমেন্টগুলোতে নেই, সেখানে এটা নিজেই যোগ করে (নতুন token role, job panel region)। যেখানে আগের ডকুমেন্টের সাথে মেলে না, সেখানে §২৬-এ সেটা বলে দেয়, চুপচাপ বদলে দেয় না।

ডিজাইনটা বানিয়েছে পাঁচটা agent-এর একটা panel, প্রত্যেকের নিজের আলাদা দিক। তাদের প্রস্তাবগুলো একসাথে মিলিয়েছেন panel chair। যেখানে তারা একমত হয়নি, সেখানে chair সিদ্ধান্ত দিয়েছেন, আর প্রতিটা সিদ্ধান্ত §২৪-এ লেখা আছে।

| Agent | দিক |
|---|---|
| Agent 1 | Visual design system: রং, type, spacing, icon, motion, logo |
| Agent 2 | Information architecture, app shell আর overview screen |
| Agent 3 | Changes, diff view, Conflicts screen আর merge editor |
| Agent 4 | Action flow, pipeline, safety confirmation আর লেখা |
| Agent 5 | ব্যবহারের সহজতা আর accessibility |

পুরো ডকুমেন্টে উদাহরণের data: workspace `acme-works`; task `TK-2636` "Onboarding"; branch `TK-2636-taosif-Onboarding`; base `dev`; repo `app-api`, `app-front`, `app-report-api`, `app-scheduler-api`, `app-signalr-api` আর `knowledge-hub`।

## ২. ডিজাইনের মূলনীতি

1. **সাধারণত শান্ত, জোরে কথা বলে শুধু যখন আপনাকে দরকার।** Surface-গুলো সমতল, ঠান্ডা ধূসর। রং খরচ হয় শুধু যেখানে মনোযোগ দরকার: pause হওয়া repo, failure, কোনো সিদ্ধান্ত নেওয়ার জায়গা, protected branch। যা শেষ হয়েছে বা বাদ পড়েছে, সেগুলো সাদামাটা থাকে।
2. **চেনা আচরণ, নিজস্ব চেহারা।** Changes screen আচরণ করে VS Code-এর Source Control-এর মতো, আর merge editor Visual Studio-র মতো। চেহারাটা GitHeddle-এর নিজের: indigo রঙের একটা "thread" accent, Inter আর JetBrains Mono, Lucide icon। VS Code-এর নীল নেই, Visual Studio-র বেগুনি নেই, Segoe বা Consolas নেই, codicon নেই।
3. **কথায় বলুন।** প্রতিটা state-এর icon বা রঙের পাশে একটা শব্দ থাকে ("2 to push", "Paused · 3 conflicts")। Glyph আর রং চোখ বুলিয়ে দেখতে সাহায্য করে; অর্থ কখনো একা বহন করে না।
4. **প্রতিটা button তার পরিধির নাম বলে।** "Push 4 repos", "Commit app-api", "Discard 3 files"। কিছু চালানোর আগেই লক্ষ্য সবসময় চোখের সামনে থাকে।
5. **কোনো কানাগলি নেই।** প্রতিটা empty state-এ পরের action থাকে, প্রতিটা disabled button চোখে পড়ার মতো লেখায় কারণ বলে, প্রতিটা error বলে এরপর কী করতে হবে।
6. **কাজ কখনো হারাবে না।** Destructive action ঠিক কী কী হারাবে তার তালিকা দেয় আর একটা নিরাপদ বিকল্প দেয়। Conflict মানে pause, failure নয়। লেবেল করা button ছাড়া কিছুই commit, push বা discard হয় না।
7. **আগে তাৎক্ষণিক সাড়া।** Click-এর একই frame-এ UI সাড়া দেয়। Cache-এ রাখা state সাথে সাথে দেখায়, আর live data আসা পর্যন্ত সেটা cached বলে চিহ্নিত থাকে।
8. **তিন system-এ একই রকম।** Bundle করা font, SVG icon, native window frame আর একটাই মাপের set। শুধু shortcut key বদলায় (Ctrl বা ⌘)।
9. **ঘন, কিন্তু নাগালের মধ্যে।** IDE-র মতো ঘনত্ব (13 px লেখা, 24 px row), আর প্রতিটা target অন্তত 24 × 24 px (WCAG 2.2 AA, 2.5.8)।

## ৩. Visual language

### ৩.১ এক অনুচ্ছেদে পরিচয়

GitHeddle শান্ত, সমতল আর ঠান্ডা-ধূসর, সাথে একটাই নীল-বেগুনি indigo accent (`#3D4FD1`), যেটা heddle-এর ভেতর দিয়ে যাওয়া সুতোর প্রতীক। IDE-র মতো ঘন, কিন্তু প্রতিটা row 24 px উঁচু। আকারগুলোর কোণ অল্প গোল: control-এ 4 px, overlay-তে 6 px। Diff hatch ছাড়া কোনো gradient নেই, কোনো blur নেই। Merge-এর দুই দিক teal (Incoming) আর violet (Current) ব্যবহার করে, কখনো সবুজ আর লাল নয়, যাতে সেগুলো কখনো "added" আর "deleted" বলে মনে না হয়।

### ৩.২ রঙের token

CSS custom property-র নাম `--gh-<role>`, আর `<html>`-এ `[data-theme="light"]` ও `[data-theme="dark"]`-এর জন্য define করা। Tailwind v4 সেগুলোকে `--color-<role>: var(--gh-<role>)` হিসেবে map করে (ui-architecture §৮)। `<html>` মিলিয়ে `color-scheme`-ও set করে, যাতে native scrollbar আর caret theme মেনে চলে। যেসব role-এ **new** লেখা, সেগুলো ui-architecture §৮-এ নতুন যোগ (§২৬ দেখুন)।

**Surface**

| Role | Light | Dark | কোথায় ব্যবহার |
|---|---|---|---|
| `surface-base` | `#ECEEF2` | `#17191E` | App-এর background, top bar, bottom bar |
| `surface-raised` | `#F6F7F9` | `#1D2026` | Sidebar, details panel, pane header, table header, card |
| `surface-sunken` | `#FFFFFF` | `#131519` | List, table, Changes tree, editor, text input |
| `surface-overlay` | `#FFFFFF` | `#252932` | Menu, popover, dialog, palette, tooltip, toast |
| `surface-hover` | `#E6E9EF` | `#272B33` | Row আর ghost button-এর hover, neutral pill |
| `surface-selected` | `#DDE2FB` | `#283166` | List-এ focus থাকা অবস্থায় selected row |
| `surface-selected-inactive` | `#E3E5EA` | `#2C3038` | Focus অন্য কোথাও থাকা অবস্থায় selected row |

Dark mode-এ overlay তার উচ্চতা বোঝায় হালকা হয়ে, shadow দিয়ে নয়।

**লেখা**

| Role | Light | Dark |
|---|---|---|
| `text-primary` | `#1B1E25` | `#E4E7EE` |
| `text-secondary` | `#555B69` | `#A3A9B7` |
| `text-disabled` | `#8D93A0` | `#646A77` |
| `text-on-accent` | `#FFFFFF` | `#FFFFFF` |
| `text-link` | `#3442B8` | `#97A3FF` |

**রেখা আর action**

| Role | Light | Dark | মন্তব্য |
|---|---|---|---|
| `border-subtle` | `#DADDE3` | `#2B2F37` | শুধু সাজসজ্জা: pane divider, table-এর row line, indent guide। কোনো control-এর একমাত্র সীমারেখা কখনো নয় |
| `border-strong` | `#767C8A` | `#7C8291` | Input, checkbox, radio আর secondary button-এর border। প্রতিটা surface-এ 3:1 পূরণ করে |
| `focus-ring` | `#3D4FD1` | `#8A98FF` | 2 px outline |
| `accent` | `#3D4FD1` | `#4C5AD6` | Primary button-এর fill, checkbox-এর fill |
| `accent-hover` | `#3343BA` | `#5967DD` | |
| `accent-indicator` **new** | `#3D4FD1` | `#8A98FF` | Selected row-এর bar, active sidebar bar, active tab-এর underline, splitter hover, `merge-active` outline। `accent` থেকে আলাদা করা হয়েছে, কারণ dark accent একসাথে সাদা লেখার background আর 3:1-এর indicator হতে পারে না |
| `danger-action` | `#C02C2C` | `#BE3434` | Destructive button-এর fill |
| `danger-action-hover` **new** | `#A32323` | `#C94141` | |
| `indicator-glyph` **new** | `#FFFFFF` | `#131519` | Merge checkbox-এর fill-এর উপর check mark আর চালু switch-এর knob। Dark theme-এ গাঢ়, কারণ dark edge আর `accent-indicator` হালকা (তাদের উপর সাদা 2.39–2.76:1) |

**Feedback।** প্রতিটা feedback role-এর একটা foreground আর একটা soft background আছে, যার নাম `<role>-soft`।

| Role | Light fg / soft | Dark fg / soft |
|---|---|---|
| `success` | `#136B33` / `#E3F4E8` | `#4CC46E` / `#15301F` |
| `warning` | `#8F5400` / `#FDF1DC` | `#E3A43A` / `#33270F` |
| `danger` | `#B42323` / `#FBE6E6` | `#F68A84` / `#3A1A1A` |
| `info` | `#1F5FB8` / `#E3EEFB` | `#6EA8F5` / `#152740` |

Soft background শুধু সেটাকেই রাঙায় যেটায় মনোযোগ দরকার: pause হওয়া আর ব্যর্থ cell, যে row-এ সিদ্ধান্ত নিতে হবে, confirmation block, banner। শেষ হওয়া আর বাদ পড়া row সাধারণ surface-এই থাকে।

**Git status অক্ষর**

| Role | অক্ষর | Tooltip | Light | Dark |
|---|---|---|---|---|
| `status-modified` | M | Modified | `#8F5400` | `#E3A43A` |
| `status-added` | A | Added | `#136B33` | `#4CC46E` |
| `status-deleted` | D | Deleted | `#B42323` | `#F68A84` |
| `status-renamed` | R | Renamed | `#1F5FB8` | `#6EA8F5` |
| `status-untracked` | U | Untracked (new, not yet added) | `#0E6F66` | `#3FC2B4` |
| `status-conflicted` | ! | Conflicted | `#A3218C` | `#E77BD3` |

- প্রতিটা অক্ষর 12 px-এ JetBrains Mono 600, একটা 16 px column-এর মাঝখানে।
- "Conflicted" magenta, লাল নয়, যাতে কখনো "deleted"-এর মতো না দেখায়। এটাই একমাত্র অক্ষর যেটা badge হিসেবে আঁকা হয়: 16 × 16 px, radius 3 px, `merge-unresolved` background-এর উপর।
- অক্ষরটাই অর্থ। রং শুধু চোখ বুলিয়ে দেখতে সাহায্য করে।

**Diff**

| Role | Light | Dark |
|---|---|---|
| `diff-inserted-line` | `#E6F6EA` | `#17301F` |
| `diff-deleted-line` | `#FCEBEB` | `#36191B` |
| `diff-inserted-word` | `#C6EDD0` | `#1B4025` |
| `diff-deleted-word` | `#F9D3D3` | `#522125` |
| `diff-spacer-1` / `diff-spacer-2` **new** | `#EEF0F3` / `#E2E5EA` | `#1A1D22` / `#23262D` |
| `diff-spacer` | উপরের দুটোর ডোরা | উপরের দুটোর ডোরা |
| `diff-gutter` | `#F6F7F9` | `#181B20` |

- Spacer হলো `repeating-linear-gradient(135deg, var(--gh-diff-spacer-1) 0 0.25rem, var(--gh-diff-spacer-2) 0.25rem 0.5rem)`।
- Gutter-এ থাকে `text-secondary`-তে line number আর `success` / `danger`-এ 1ch চওড়া একটা `+` / `−` চিহ্নের column। চিহ্নটা সবসময় দেখানো হয়, তাই রং ছাড়াও inserted আর deleted line পড়া যায়।

**Merge।** প্রতিটা merge role হলো একটা background আর একটা edge রং (`-edge`, **new** sub-role), যেটা 3 px region bar, gutter marker আর checkbox-এর fill-এ ব্যবহার হয়।

| Role | Light bg / edge | Dark bg / edge | অর্থ |
|---|---|---|---|
| `merge-incoming` | `#E2F3F6` / `#0F7285` (teal) | `#12303A` / `#3FB6CC` | Incoming দিক আর তার region |
| `merge-current` | `#EFE7FB` / `#6B3FC2` (violet) | `#2A2140` / `#A88BF0` | Current দিক আর তার region |
| `merge-auto-applied` | `#ECF0F6` / `#55698A` | `#1D2533` / `#8696B3` | CONF-05-এর স্বয়ংক্রিয়ভাবে বসানো পরিবর্তন |
| `merge-unresolved` | `#F8E6F4` / `#A3218C` | `#3A1834` / `#E77BD3` | Result-এ placeholder; `!`-এর একই রং |
| `merge-edited` | `#FFF3D6` / `#8F5400` | `#33290F` / `#E3A43A` | হাতে edit করা region |
| `merge-active` **new** | outline = `accent-indicator` | outline = `accent-indicator` | তিনটা pane-এই active conflict-এর চারপাশে 2 px outline |

**Run cell**

| Role | Lucide icon | শব্দ | Icon-এর রং | Cell-এর background |
|---|---|---|---|---|
| `run-done` | `check` | Done, Merged, Pushed, Up to date | = `success` | নেই |
| `run-failed` | `x` | Failed: rejected | = `danger` | `danger-soft` |
| `run-paused` | `pause` | Paused · 3 conflicts | = `warning` | `warning-soft` |
| `run-skipped` | `minus` | Nothing to do, Cancelled, Stopped | = `text-secondary` | নেই |
| `run-waiting` | `circle` | Waiting | `#6E7482` / `#7D8391` | নেই |
| `run-running` **new** | `loader-circle`, ঘুরছে | Running · 12 s | = `info` | নেই |

Waiting আর skipped-এর শব্দ `text-secondary`, বাকিগুলোর `text-primary`। Waiting icon ইচ্ছে করেই `text-secondary`-র চেয়ে ম্লান: তবুও এটা 3:1 পূরণ করে, আর অর্থ বহন করে শব্দটা।

**Syntax highlighting।** `surface-sunken`, সব diff আর merge background (line আর word দুই স্তরেই), editor selection, active line আর search match-এর বিপরীতে যাচাই করা।

| Role | Light | Dark |
|---|---|---|
| `syntax-keyword` | `#7A2FB5` | `#C49AF0` |
| `syntax-string` | `#0F6435` | `#8BD49C` |
| `syntax-number` | `#923F07` | `#F0A56B` |
| `syntax-comment` | `#575E6C` (italic নয়) | `#A2A9B5` (italic নয়) |
| `syntax-type` | `#0B627A` | `#5FC9D9` |
| `syntax-function` | `#2D46B5` | `#94A8FF` |
| `syntax-tag` | `#A0215A` | `#F28BB0` |
| `syntax-attribute` | `#7B4B00` | `#E8C170` |

**Editor, overlay আর logo-র role (new)**

| Role | Light | Dark |
|---|---|---|
| `editor-selection` | `#D9DEF9` | `#2A3266` |
| `editor-active-line` | `#F4F6FA` | `#1A1D22` |
| `editor-search-match` | `#FBE3A6` | `#3F3210` (প্রথম খসড়ার `#5A4614`-এর চেয়ে গাঢ়, যার উপর dark syntax রং 3.83:1-এ নেমে গিয়েছিল) |
| `editor-cursor` | = `text-primary` | = `text-primary` |
| `scrim` | `rgb(15 18 24 / 0.32)` | `rgb(0 0 0 / 0.55)` |
| `logo-tile` | `#3D4FD1` | `#5967DD` |
| `logo-thread` | `#F4F5FB` | `#F4F5FB` |

Scrim একটা সমতল রং, আর কখনো `backdrop-filter` ব্যবহার করে না (ui-architecture §১৭)।

### ৩.৩ Contrast-এর ফলাফল (WCAG 2.x)

নিচের প্রতিটা সংখ্যা হাতে নয়, `mockups/tokens.css` থেকে [`mockups/contrast-check.js`](mockups/contrast-check.js) দিয়ে হিসাব করা (WCAG relative-luminance সূত্র)। প্রতিটা সংখ্যা হলো সেই জোড়া যত background-এ দেখা যেতে পারে তার সবচেয়ে খারাপ অবস্থা: surface-এর বেলায় base, raised, sunken, overlay, hover, selected আর selected-inactive; editor-এর বেলায় এর সাথে line- আর word-স্তরের diff background, merge background, selection, active line আর search match। Script-এর জোড়ার তালিকাটাই CI-র contrast test: কোনো মান তার threshold-এর নিচে নামলে (লেখায় 4.5:1, লেখা ছাড়া অন্য কিছুতে 3:1) build ব্যর্থ করে, আর table-টা এখান থেকেই নতুন করে বানানো হয়, কখনো হাতে edit হয় না।

| জোড়া | দরকার | Light min | Dark min |
|---|---|---|---|
| Surface-এর উপর `text-primary` | 4.5:1 | 12.98 (selected) | 9.85 (selected) |
| Surface-এর উপর `text-secondary` | 4.5:1 | 5.30 (selected) | 5.18 (selected) |
| Soft, diff আর merge bg-এর উপর `text-secondary` | 4.5:1 | 4.95 (diff-deleted-word) | 4.94 (diff-inserted-word) |
| Surface-এর উপর `text-link` | 4.5:1 | 6.25 (selected) | 5.23 (selected) |
| `accent` / `accent-hover`-এর উপর `text-on-accent` | 4.5:1 | 6.49 / 7.92 | 5.61 / 4.76 |
| `danger-action` / hover-এর উপর `text-on-accent` | 4.5:1 | 5.77 / 7.44 | 5.63 / 4.87 |
| নিজের soft bg-এর উপর feedback fg (৪টার মধ্যে সবচেয়ে খারাপ) | 4.5:1 | 5.28 (info-soft) | 6.15 (info-soft) |
| Surface-এর উপর feedback fg (৪টার মধ্যে সবচেয়ে খারাপ) | 4.5:1 | 4.76 (selected, warning) | 4.99 (selected, info) |
| যেকোনো soft bg-এর উপর `text-primary` | 4.5:1 | 13.95 (danger-soft) | 11.51 (success-soft) |
| Surface-এর উপর status অক্ষর | 4.5:1 | 4.69 (selected, untracked) | 4.75 (selected, conflicted) |
| `merge-unresolved`-এর উপর `!` (badge) | 4.5:1 | 5.59 (merge-unresolved) | 6.01 (merge-unresolved) |
| Diff bg-এর উপর `text-primary` (line, word, gutter, spacer) | 4.5:1 | 12.14 (diff-deleted-word) | 9.39 (diff-inserted-word) |
| Diff line bg আর gutter-এর উপর line number | 4.5:1 | 5.90 (diff-deleted-line) | 6.03 (diff-inserted-line) |
| Inserted line ও word-এর উপর `+` / deleted line ও word-এর উপর `−` | 4.5:1 | 5.17 / 4.77 | 5.22 / 5.54 |
| Merge bg-এর উপর `text-primary` | 4.5:1 | 13.89 (merge-current) | 11.24 (merge-incoming) |
| `surface-sunken`, `surface-raised` আর নিজের bg-এর উপর merge edge | 3:1 | 4.87 (merge-auto-applied) | 5.15 (merge-auto-applied) |
| প্রতিটা editor bg-এর উপর syntax role (selection, active line, search match সহ) | 4.5:1 | 4.74 (diff-deleted-word, comment) | 4.91 (diff-inserted-word, comment) |
| `editor-selection` / `editor-search-match`-এর উপর `text-primary` | 4.5:1 | 12.52 (editor-selection) | 9.71 (editor-selection) |
| Surface আর soft bg-এর উপর `border-strong` | 3:1 | 3.26 (selected) | 3.17 (selected) |
| Surface-এর উপর `focus-ring` | 3:1 | 5.05 (selected) | 4.66 (selected) |
| Soft, diff আর merge bg-এর উপর `focus-ring` | 3:1 | 4.72 (diff-deleted-word) | 4.44 (diff-inserted-word) |
| Surface-এর উপর `accent-indicator` (row bar, checked radio আর switch) | 3:1 | 5.05 (selected) | 4.66 (selected) |
| Merge bg-এর উপর `accent-indicator` (`merge-active`) | 3:1 | 5.40 (merge-current) | 5.31 (merge-incoming) |
| Surface-এর উপর run-waiting icon | 3:1 | 3.65 (selected) | 3.21 (selected) |
| `accent` checkbox-এর উপর check (`text-on-accent`) | 3:1 | 6.49 (accent) | 5.61 (accent) |
| Merge checkbox-এর উপর check, switch-এর উপর knob (incoming / current edge আর `accent-indicator`-এর উপর `indicator-glyph`) | 3:1 | 5.58 (merge-incoming-edge) | 6.63 (merge-current-edge) |
| Tile-এর উপর logo-র সুতো | 3:1 | 5.96 (logo-tile) | 4.38 (logo-tile) |

`text-disabled` (সবচেয়ে খারাপে light-এ 2.40, dark-এ 2.25) ব্যবহার হয় **শুধু নিষ্ক্রিয় control-এ**, যেগুলোকে WCAG 1.4.3 ছাড় দেয়। যা কিছু user-কে কোনো তথ্য দেয়, যেমন preview-এর একটা "Left out" row, সেটা `text-secondary` ব্যবহার করে।

Dark theme-এর পাঁচটা ক্ষেত্রে সাবধান হতে হয়, আর ভাগাভাগি করা class-গুলো সেটা সামলায়:

- **টিক দেওয়া checkbox:** `surface-raised`-এর বিপরীতে dark `accent` 2.91, তাই টিক দেওয়া checkbox fill-এর চারপাশে তার 1 px `border-strong` outline রেখে দেয়।
- **Merge checkbox:** dark merge edge হালকা, তাই তার উপরের check mark সাদা নয়, `indicator-glyph` (`#131519`) দিয়ে আঁকা হয়।
- **Checked radio আর switch:** ring আর track-এ এরা `accent` নয়, `accent-indicator` ব্যবহার করে (surface-এর উপর dark `accent` 2.17–2.91); switch-এর knob `indicator-glyph`।
- **Primary button-এর outline:** dark-এ এটাও 2.91। লেবেল থাকা button-এর outline-কে WCAG 3:1 পূরণ করতে বলে না; লেবেলটা 5.61।
- **Primary button-এ focus:** ring 2 px offset ব্যবহার করে, তাই সেটা fill-এর উপর নয়, button-এর চারপাশের surface-এর উপর বসে।

Selected row: `surface-sunken`-এর বিপরীতে `surface-selected` মাত্র 1.28 (light) আর 1.50 (dark), তাই selected row-এর বাঁ কিনারায় সবসময় একটা 2 px `accent-indicator` bar-ও থাকে, যেটা 3:1-এর state সংকেত বহন করে (WCAG 1.4.11)।

### ৩.৪ Typography

**Font** (দুটোই SIL OFL 1.1, bundle করা, CI-তে `pyftsubset` দিয়ে subset করে WOFF2 বানানো, কখনো developer-এর machine-এ নয়):

- **UI: Inter 4**, variable, `wght` 400–700। বড় x-height, tabular figure (`tnum`), আর `cv05` ও `cv08` feature চালু, যাতে branch-এর নামে `Il1` পড়া যায়। `font-optical-sizing: none`।
- **Monospace: JetBrains Mono 2**, variable। `0O`, `1lI` আলাদা করে চেনা যায়। **Ligature সবসময় বন্ধ** (`font-variant-ligatures: none; font-feature-settings: "calt" 0, "liga" 0`), যাতে `<<<<<<<`, `!=` আর `=>` হুবহু অক্ষরগুলোই দেখায়। Tab size 4।
- Subset range: Basic Latin, Latin-1 Supplement, Latin Extended-A, General Punctuation, Arrows, `·` `…` `−`, Box Drawing-এর মৌলিক অংশ। আনুমানিক আকার প্রায় 90–120 KB (Inter) আর 60–80 KB (JetBrains Mono), M0-তে PERF-09 job-এ মাপা হবে। দুটো licence file-ই `styles/fonts/`-এ আর About screen-এ যায়।

**Fallback stack** (mockup-ও এগুলো ব্যবহার করে, কারণ mockup font bundle করতে পারে না):

- UI: `"Inter", system-ui, "Segoe UI", "Noto Sans", "Noto Sans Bengali", sans-serif`
- Mono: `"JetBrains Mono", ui-monospace, "Cascadia Mono", Menlo, "DejaVu Sans Mono", monospace`

প্রতিটা line height স্পষ্ট করে set করা, যাতে কোনো fallback glyph (commit message-এ বাংলা বা CJK) row-এর উচ্চতা বা merge editor-এর line height বদলাতে না পারে।

**Type role।** Root font size হলো 16 px × zoom। মানগুলো 100 %-এ।

| Role | Family | Size | Weight | Line height | কোথায় ব্যবহার |
|---|---|---|---|---|---|
| `text-caption` | Inter | 0.75rem (12 px) | 400 | 1rem (16 px) | Bottom bar, badge, tooltip, key hint, count, সাহায্যকারী লেখা। App-এর সবচেয়ে ছোট লেখা |
| `text-body` | Inter | 0.8125rem (13 px) | 400 | 1.25rem (20 px) | Default: row, button, input, menu, dialog-এর body |
| `text-body-strong` | Inter | 0.8125rem | 600 | 1.25rem | Repo-র নাম, table header-এর label, selected nav item |
| `text-section-title` | Inter | 0.75rem (12 px) | 600, sentence case | 1rem | Sidebar group ("Tasks"), pane title ("Incoming"), panel section। রং `text-secondary` |
| `text-screen-title` | Inter | 1rem (16 px) | 600 | 1.5rem (24 px) | প্রতি screen-এ একটা; dialog title; empty state-এর headline। Letter spacing −0.01em |
| `text-code` | JetBrains Mono | 0.8125rem (13 px) | 400 | 1.25rem (20 px) | Editor, diff, branch-এর নাম, hash, command, Git output |

- Row বা table-এর প্রতিটা সংখ্যা `font-variant-numeric: tabular-nums` ব্যবহার করে।
- লেখার ভেতরে দেখানো branch-এর নাম, hash আর path আশেপাশের লেখার মাপেই `text-code` ব্যবহার করে।
- Weight 700 আর uppercase লেখা কখনো ব্যবহার হয় না। একমাত্র ব্যতিক্রম key hint, যেগুলো key-এর নাম OS যেভাবে লেখে সেভাবে দেখায় (`Ctrl`, `⌘`)।
- **Key-এর লেখার ধরন** আসে shortcut registry থেকে আর OS মেনে চলে (PLAT-05), প্রতি OS-এ একটাই ধরন, কখনো মেশানো নয়। Key hint chip-এ key-গুলো space দিয়ে আলাদা: Windows আর Linux-এ `Ctrl Shift B`, macOS-এ `⇧⌘B`। সাধারণ লেখা, tooltip আর shortcut table ব্যবহার করে `Ctrl+Shift+B` / `⇧⌘B`। Windows বা Linux-এর hint কখনো `⇧`-এর মতো macOS glyph ব্যবহার করে না।
- যেসব badge-এ লেখা থাকে (initials, order badge, rail count, coach-strip-এর সংখ্যা), সেগুলোও `text-caption` ব্যবহার করে আর লেখা অনুযায়ী বড় হয়: initials 20 px, order আর number badge 16 px।

### ৩.৫ Spacing, মাপ, radius আর border

**Spacing scale** (2 px ভিত্তি, 4 px ছন্দ):

| Token | `space-0` | `space-1` | `space-2` | `space-3` | `space-4` | `space-5` | `space-6` | `space-7` | `space-8` |
|---|---|---|---|---|---|---|---|---|---|
| rem | 0 | 0.125 | 0.25 | 0.375 | 0.5 | 0.75 | 1 | 1.5 | 2 |
| px | 0 | 2 | 4 | 6 | 8 | 12 | 16 | 24 | 32 |

**নির্দিষ্ট মাপ**

| Token | মান | মন্তব্য |
|---|---|---|
| `row-height` | 1.5rem (24 px) | প্রতিটা list, tree, table আর sidebar row। Row button 24 × 24 |
| `pane-gap` | 1 px | Pane-গুলোর মাঝে দৃশ্যমান divider, `border-subtle`-এ। Splitter-এর hit area 6 px |
| `control-sm` **new** | 1.5rem (24 px) | Row button, toolbar icon button, filter chip, segmented choice |
| `control-md` **new** | 1.75rem (28 px) | Default button, input, select |
| `control-lg` **new** | 2rem (32 px) | শুধু first run আর empty state-এর মূল call to action |
| Tree indent | প্রতি স্তরে 1rem | সাথে 1 px `border-subtle` indent guide |
| Row padding | বাঁয়ে `space-4` (8 px) | |
| Button padding | দুই পাশে `space-5` (12 px); icon-এর ফাঁক `space-3`; ন্যূনতম চওড়া 4rem | |
| Checkbox / radio | 1.5rem hit area-র ভেতরে 0.875rem (14 px) box | |

**Radius (new)**

| Token | মান | কোথায় ব্যবহার |
|---|---|---|
| `radius-none` | 0 | Row, pane, editor, table |
| `radius-sm` | 3 px | Checkbox, key hint, ছোট badge, inline code, variable chip |
| `radius-md` | 4 px | Button, input, select, menu item, banner |
| `radius-lg` | 6 px | Popover, menu, dialog, toast, palette, card |
| `radius-full` | 9999 px | State pill, initials badge, count pill |

**Border px-এ, rem-এ নয়:** রেখার জন্য 1 px, focus ring আর selection bar-এর জন্য 2 px, merge region-এর edge আর invalid-step marker-এর জন্য 3 px। ভগ্নাংশ zoom-এ rem-এর সরু রেখা ঝাপসা দেখায় (§২৬ দেখুন)।

**ঘনত্ব।** v0.1-এ একটাই ঘনত্ব: 24 px row, 13 px লেখা, সাধারণত 8 px padding। 1080p screen-এ প্রায় 30টা dashboard row ধরে। 22 px-এর একটা compact mode খোলা প্রশ্ন (§২৫)।

### ৩.৬ Elevation (নতুন token)

Elevation মানে একটা সমতল surface, সাথে 1 px `border-subtle`, আর বড়জোর একটা ছোট shadow (blur ≤ 12 px)। কোনো `backdrop-filter` নেই।

| Token | Light | Dark | কোথায় ব্যবহার |
|---|---|---|---|
| `elevation-0` | নেই | নেই | Shell-এর সব কিছু |
| `elevation-1` | `0 2px 6px rgb(16 20 30 / 0.12)` | `0 2px 6px rgb(0 0 0 / 0.45)` | Menu, popover, tooltip, toast, overlay details panel |
| `elevation-2` | `0 4px 12px rgb(16 20 30 / 0.16)` | `0 4px 12px rgb(0 0 0 / 0.55)` | `scrim`-এর উপর dialog আর palette |

### ৩.৭ Icon

**Lucide** (ISC licence, GPL-3.0-এর সাথে মেলে), `ui/Icon`-এর ভেতরে `lucide-react` থেকে প্রতিটা icon আলাদা করে import করা, `currentColor` সহ inline SVG হিসেবে render হয়। কোনো icon font নেই, কোনো remote request নেই। Codicon ব্যবহার হয় না (তাতে VS Code-এর চেহারা নকল হয়ে যেত)। Mockup-গুলো SVG path inline করে রাখে।

| Token | মাপ | Stroke | কোথায় ব্যবহার |
|---|---|---|---|
| `icon-sm` | 12 px | 2 | Chevron, inline badge icon |
| `icon-md` | 16 px | 1.5 | Default: button, row, run cell |
| `icon-lg` | 20 px | 1.5 | Sidebar rail icon, dialog title icon |
| `icon-xl` | 32 px | 1.5 | শুধু empty state |

Icon default-ভাবে `text-secondary`, আর hover বা selection-এ `text-primary`। শুধু-icon button-এর সবসময় একটা accessible name আর একটা tooltip থাকে।

**State-এর জন্য কোনো Unicode glyph নয়।** Windows আর macOS-এ `⏸` রঙিন emoji হিসেবে দেখায়, আর `✓ ✗ ○` fallback font-এর উপর নির্ভর করে। PRD-র sketch-এর glyph-গুলো শুধু লেখার ধরন; app Lucide SVG আঁকে।

| Action বা জায়গা | Lucide icon | Action বা জায়গা | Lucide icon |
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
| Expand | `chevron-right` (90° ঘোরে) | Side by side / inline | `columns-2` / `rows-2` |
| Detached HEAD | `unlink` | Diverged | `split` |
| Not published | `cloud-off` | Help / term | `circle-help` |

Icon-এর নাম M0-তে যাচাই করা হবে।

### ৩.৮ Motion (নতুন token)

| Token | সময় | কোথায় ব্যবহার |
|---|---|---|
| `motion-instant` | 0 ms | Hover, press, selection, theme বদল, row যোগ আর সরানো |
| `motion-fast` | 80 ms | সব exit; chevron ঘোরা; tooltip fade |
| `motion-base` | 120 ms | Menu আর popover-এর enter (`opacity`, `translateY(-4px → 0)`); toast-এর enter (`translateY(8px → 0)`) |
| `motion-slow` | 150 ms | Dialog আর palette-এর enter (`opacity`, `scale(0.98 → 1)`) |

- Easing: enter `cubic-bezier(0.2, 0, 0, 1)`, exit `cubic-bezier(0.3, 0, 1, 1)`।
- শুধু `opacity` আর `transform` animate হয়। Layout, রং বা scroll কখনো নয় (ui-architecture §১৮)।
- একটানা animation (150 ms-এর বেশি শুধু এগুলোই): spinner `rotate` 900 ms linear; indeterminate bar `translateX` 1.2 s; determinate progress `scaleX` 120 ms-এর ধাপে।
- **Reduced motion** (`prefers-reduced-motion: reduce`, core যে OS setting জানায়, বা Settings → Motion: Reduce): প্রতিটা সময় 0; spinner তার শব্দসহ একটা স্থির `hourglass` icon হয়ে যায়; indeterminate bar হয়ে যায় "Working…" লেখা; skeleton সমতল থাকে।

### ৩.৯ Logo আর wordmark

Heddle হলো মাঝখানে একটা চোখওয়ালা তার; প্রতিটা চোখের ভেতর দিয়ে একটা করে warp সুতো যায়। চিহ্নটায় তিনটা খাড়া সুতো দেখানো হয়েছে। মাঝেরটা একটা সরু চোখে খুলে আবার বন্ধ হয়, যেটাকে পড়া যায় "heddle-এর পথ দেখানো সুতো" হিসেবেও, "branch, তারপর merge" হিসেবেও। এতে Git-এর diamond নেই, node graph নেই, octocat নেই।

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

- Tile-এর উপর সুতো: 5.96:1। Dark mode-এ tile `#5967DD` ব্যবহার করে (`surface-base`-এর বিপরীতে 3.69:1), যাতে ডুবে না যায়।
- একরঙা একটা সংস্করণ (`currentColor`, tile ছাড়া) forced colours-এ আর UI-র ছোট জায়গায় ব্যবহার হয়। 16 px-এ stroke হয় 1.5।
- App icon: macOS-এ standard template-এ 1024 squircle; Windows-এ 16, 24, 32, 48, 256-এ ICO; Linux-এ PNG 512 আর SVG।
- **Wordmark:** "GitHeddle", Inter 600, letter spacing −0.01em, এক শব্দ, এক রং (`text-primary`)। Top bar-এ এটা 14 px, 20 px চিহ্নের পাশে, মাঝে `space-3` ফাঁক।

### ৩.১০ Control-এর state

**Button**

| Variant | স্বাভাবিক | Hover | চাপা | Disabled |
|---|---|---|---|---|
| Primary | `accent` fill, `text-on-accent` | `accent-hover` | `accent-hover` + `scale(0.98)` | `surface-hover` fill, `text-disabled` |
| Secondary | স্বচ্ছ, 1 px `border-strong`, `text-primary` | `surface-hover` | + `scale(0.98)` | border `border-subtle`, `text-disabled` |
| Ghost / icon | স্বচ্ছ, `text-secondary` | `surface-hover`, `text-primary` | + `scale(0.98)` | `text-disabled` |
| Danger | `danger-action` fill, `text-on-accent` | `danger-action-hover` | + `scale(0.98)` | primary disabled-এর মতো |
| Danger text | স্বচ্ছ, 1 px `border-strong`, `danger` লেখা | `danger-soft` | + `scale(0.98)` | secondary disabled-এর মতো |

- Disabled কখনো `opacity` ব্যবহার করে না, কারণ তাতে contrast অনুমান করা যায় না।
- **Busy** button নিজের চওড়া ধরে রাখে, সামনের icon-টা বদলে ঘুরন্ত `loader-circle` বসায়, `aria-busy` set করে, আর বলে কী হচ্ছে: "Pushing 4 repos…"।
- Dialog-এর **এখনো ব্যবহারযোগ্য নয়** এমন primary button (Run, Commit, Accept merge, Continue) `aria-disabled="true"` ব্যবহার করে আর focus পাওয়ার মতো থাকে। কারণটা button-এর পাশে চোখে পড়ার মতো লেখায় থাকে, `aria-describedby` দিয়ে যুক্ত। চাপলে focus প্রথম অপূর্ণ শর্তে চলে যায় আর সেটা announce করে (§২০)।

**Row**

| State | চেহারা |
|---|---|
| Hover | `surface-hover` |
| Selected, list-এ focus | `surface-selected` + `accent-indicator`-এ বাঁয়ে 2 px bar (`box-shadow: inset 2px 0 0`) |
| Selected, focus অন্য কোথাও | `surface-selected-inactive` + `border-strong`-এ bar |
| Keyboard focus | 2 px `focus-ring` outline, ভেতরের দিকে (`outline-offset: -2px`) |
| অপেক্ষমাণ (optimistic stage) | কোনো bar নেই, কারণ bar থাকলে selection bar-এর মতো দেখাত। Core নিশ্চিত না করা পর্যন্ত 72 px-এর জায়গায় একটা 12 px ঘুরন্ত `loader-circle` আর `text-caption` `text-secondary`-তে "Staging…" দেখায়; accessible name-এ ", staging" যোগ হয় |
| Needs review / পাওয়া যায় না | সব cell `text-secondary` (কখনো opacity নয়) |

**Focus ring।** Control: `:focus-visible`-এ `outline: 2px solid var(--gh-focus-ring); outline-offset: 2px`। Row, grid cell আর editor pane: ভেতরের দিকে (`-2px`), যাতে virtualised container সেটা কেটে না ফেলে। Focus থাকা tree বা grid-এর ভেতরে mouse click-এর পরেও focus থাকা row ring দেখায়। এটা সবসময় outline, কখনো box-shadow নয়, তাই forced colours-এও টিকে থাকে।

**State pill।** `text-caption` 600, 18 px উঁচু, `radius-full`, `space-3` padding, শুরুতে একটা 12 px icon, নিজের foreground রঙের সাথে soft background, sentence case: "Merging · 3 conflicted", "Behind 4", "Needs review"। পুরো তালিকা §৫.৩-এ।

**Pull request-এর state।** Draft (neutral pill + `git-pull-request-draft`), Open (`success`), Merged (violet: `merge-current` bg-এর উপর `merge-current` edge), Closed (`danger`)। CI: `check` "Checks passed" (`success`), `x` "1 check failed" (`danger`), `circle-dot` "Checks running" (`warning`), `minus` "No checks"। শব্দটা সবসময় দেখানো হয়।

**Scrollbar।** `scrollbar-width: thin; scrollbar-color: var(--gh-border-strong) transparent`, আর WebKit pseudo-element শুধু বাড়তি সাজ হিসেবে (8 px thumb, `radius-full`)।

## ৪. App shell আর layout

### ৪.১ Window

- **v0.1-এ তিনটা OS-এই native window frame।** App-এর top bar OS-এর title bar-এর নিচে বসে। Custom title bar মানে তিন রকম hit-test ব্যবস্থা, আর WebKitGTK/Wayland-এ সেটা ঝুঁকিপূর্ণ; M1-এর পরে আবার ভেবে দেখা হবে।
- **ন্যূনতম window: 1024 × 640 px** (Tauri `minWidth` / `minHeight`)। প্রথম launch: 1280 × 800, বা work area ছোট হলে তার 90 %, মাঝখানে। Window-এর মাপ আর অবস্থান মনে রাখা হয় (UX-09)।

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

### ৪.২ Region

| Region | মাপ | Min / max | গুটিয়ে যাওয়া | Landmark |
|---|---|---|---|---|
| Top bar | 2.5rem (40 px), `surface-base`, নিচে 1 px `border-subtle` | — | Item-গুলো ধাপে ধাপে ছোট হয় (§৪.৪) | `banner` |
| Sidebar | 15rem (240 px), `surface-raised` | 11.25rem / 22.5rem (180 / 360) | 3rem (48 px) icon rail; Mod+B | `navigation` "Main" |
| Centre | নমনীয়, content `surface-sunken` | ন্যূনতম 35rem (560 px) | কখনো নয় | `main` |
| Details panel | 20rem (320 px), `surface-raised` | 16rem / 32rem | লুকানো, বা জায়গা কম হলে overlay; Mod+I | `complementary` "Details" |
| Job panel **new** | default 16rem, মাপ বদলানো যায়, `surface-raised` | 8rem / উচ্চতার 60 % | default-ভাবে বন্ধ; Mod+J | `region` "Jobs" |
| Bottom bar | 1.5rem (24 px), `surface-base`, `text-caption`, উপরে 1 px `border-subtle` | — | কখনো নয় | `contentinfo` |
| Screen header | 2.5rem | — | — | — |
| Screen toolbar | 2.25rem | — | — | `toolbar` |
| Pane header | 2rem, `surface-raised`, `text-section-title` | — | — | — |

### ৪.৩ Splitter

- দৃশ্যমান রেখা: 1 px `border-subtle`। Hit area: 6 px, মাঝখানে, `col-resize` / `row-resize` cursor। Hover (150 ms পরে) আর focus-এ একটা 2 px `accent-indicator` রেখা দেখায়।
- Role `separator`, focus পাওয়া যায়, সাথে `aria-valuenow` / `aria-valuemin` / `aria-valuemax`, আর নাম যেমন "Resize sidebar", "Resize details panel", "Resize diff"।
- Key: ←/→ (বা ↑/↓) 1rem সরায়; Shift 4rem সরায়; Home / End min / max-এ লাফ দেয়; Enter গোটানো চালু/বন্ধ করে। Double-click default-এ ফিরিয়ে দেয়।
- Min − 40 px-এর নিচে টানলে গুটিয়ে যায় (sidebar-এর বেলায় rail, panel-এর বেলায় লুকানো)। শুধু ছেড়ে দিলেই layout পাকা হয়; টানার সময় শুধু একটা transform নড়ে।
- মাপগুলো 100 % zoom-এ রাখা হয় আর zoom factor দিয়ে scale হয় (UX-09)।

### ৪.৪ Breakpoint

Breakpoint **কার্যকর চওড়া** (window px ÷ zoom) ব্যবহার করে, তাই 200 %-এ zoom করলে layout কেটে না গিয়ে নতুন করে সাজে। জায়গা ছাড়ার ক্রম: details panel → sidebar → top bar-এর item।

| কার্যকর চওড়া | Sidebar | Details panel | Top bar |
|---|---|---|---|
| ≥ 1440 | 240 docked | 320 docked, default-ভাবে খোলা | লেবেলসহ সব কিছু |
| 1200–1439 | 240 docked | শুধু user খুললে docked, আর শুধু যতক্ষণ centre 720 px ধরে রাখে (তাই 1280 থেকে উপরে); না হলে overlay | Fetch / Pull / Push শুধু-icon হয়ে যায় (tooltip আর নাম থাকে) |
| 960–1199 | 48 rail | centre-এর ডান কিনারার উপর overlay (`elevation-1`, Esc বন্ধ করে, focus ভেতরে যায়) | Search field একটা icon button "Search (Ctrl+K)" হয়ে যায় |
| 720–959 | 48 rail | overlay | Start task, task chip আর Search থাকে; বাকিগুলো "More actions ▾"-এ চলে যায় (একমাত্র এই জায়গায় item লুকায়; palette-এ সব আছে) |
| < 720 (শুধু zoom-এ পৌঁছানো যায়) | একটা "Menu" button-এর পেছনে | overlay | উপরের মতো। Changes list আর diff "← Back to files" সহ দুটো view হয়ে যায়; dashboard row ২-লাইনের card হয়ে যায়; merge editor-এর উপরের pane-গুলো tab হয়ে যায় "Incoming · Current" |

কার্যকর উচ্চতা 480-এর নিচে হলে: dialog পুরো-window sheet হয়ে যায়, body scroll করে আর footer আটকে থাকে। User স্পষ্টভাবে যা গুটিয়েছেন, সেটা সবসময় স্বয়ংক্রিয় প্রসারণের উপরে জেতে।

**Docked panel-এর কারণে centre কখনো 720 px-এর নিচে নামে না।** Details panel খুললে বা চওড়া করলে যদি centre 720 px-এর নিচে নেমে যেত, তাহলে panel overlay হিসেবে খোলে। 720 আর পুরো চওড়ার মাঝে কী লুকাবে তা প্রতিটা screen নিজে ঠিক করে (dashboard §৫.২ আর §৫.৭, Changes §৮.১)।

Changes, Conflicts আর merge editor default-ভাবে details panel লুকিয়ে রাখে, কারণ তাদের চওড়া দরকার; user Mod+I দিয়ে সেটা দেখাতে পারেন, আর পছন্দটা প্রতি screen-এ মনে রাখা হয়।

### ৪.৫ Top bar (বাঁ → ডান)

1. **চিহ্ন আর wordmark** (button নয়)।
2. **Workspace picker** `acme-works ▾`, বড়জোর 200 px, কেটে ছোট করা। Menu: Open folder…, Import VS Code workspace…, Rescan for repos, Workspace settings। v0.2-এ (DASH-08) উপরে workspace-এর তালিকা আসবে।
3. **Target picker** `Target: Task TK-2636 · 2 ▾`, বড়জোর 240 px (§৪.৭)।
4. **Active-task chip** (§৪.৮)।
5. নমনীয় ফাঁকা জায়গা।
6. **[Start task]** (primary, Mod+N) আর **[Run pipeline ▾]** (secondary)।
7. 1 px divider, তারপর icon আর লেবেলসহ ghost button-এর toolbar হিসেবে **Fetch · Pull · Push**। Tooltip target-এর নাম বলে: "Pulls 2 repos (Task TK-2636). Brings new commits from origin. Stops if it can't fast-forward."। সেই ধরনের job চলার সময় button একটা spinner দেখায়, আর দ্বিতীয় click job panel খোলে, কখনো দ্বিতীয় job নয়।
8. **Search field**, 200–320 px, placeholder "Search or run a command…", key hint `Ctrl K` / `⌘K`। Click করলে palette খোলে।
9. **Account badge**, initials সহ 24 px বৃত্ত (TH-07)। Sign in করা থাকলে: `surface-selected`-এর উপর initials; menu "Signed in as dev-taosif-net", Open GitHub profile, Sign out। Sign in না থাকলে: `user` icon সহ একটা ফাঁপা বৃত্ত, tooltip "Not signed in to GitHub"; click করলে sign-in খোলে।

Top bar একটাই toolbar tab stop, ভেতরে ←/→।

### ৪.৬ Sidebar

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

- **আগে screen, পরে object, Activity log আর Settings নিচে আটকানো**, তাই task যতই থাকুক, navigation কখনো সরে না। লেবেল "Repositories", "Repos" নয়।
- Item-গুলো `row-height`, বাঁয়ে 12 px padding, 16 px icon, `text-body` লেবেল, ডানে `text-caption`-এ count। Selected: `surface-selected` + 2 px `accent-indicator` bar + `text-body-strong`।
- **Count** শুধু trusted repo-র উপর store selector। Repositories: repo-র সংখ্যা, আর কোনো repo-র review দরকার হলে বা ঝুঁকির badge থাকলে `warning`-এ একটা `triangle-alert` icon। Changes: সব repo-তে বদলানো file। Pull requests: active task-এর খোলা PR, আর কোনোটার check ব্যর্থ হলে বা changes requested থাকলে একটা 6 px `danger` বিন্দু। Conflicts: merge, rebase বা cherry-pick-এর মাঝে থাকা **repo**; tooltip "1 repo, 3 conflicted files"। Count "99+"-এ থামে। State cache থেকে আসার সময় count `text-secondary`, সাথে tooltip "Updating…"।
- **Icon আর বিন্দু কখনো একমাত্র সংকেত নয়।** প্রত্যেকটার এক বাক্যের tooltip আছে, আর item-এর accessible name একই কথা বলে: "Repositories, 6, 1 needs review", "Pull requests, 1 open, 1 has a failing check" (বা "…, 1 has changes requested")। §২০.১ দেখুন।
- **Section header** "Tasks", "Pipelines", "Groups" হলো `text-section-title`-এ Disclosure, সাথে একটা `+` icon button ("Start task", "New pipeline", "New group")।
- **Tasks** প্রথমে active task দেখায় একটা "Active" শব্দসহ (শুধু বিন্দু নয়), তারপর বড়জোর ৪টা সাম্প্রতিক task, তারপর "Show all (n)", যেটা task-এ filter করা palette খোলে। Row-এ hover করলে [Switch] দেখায়। Context menu: Open task, Switch to this task, Run pipeline on task ▸, Add repos…, Rename…, Finish task… (v0.2)।
- **Pipelines** row-এ hover করলে একটা ▶ দেখায়: "Run on Target: Task TK-2636", যেটা preview খোলে (চালাতে ২ click)। Built-in pipeline একটা `lock` icon দেখায়, tooltip "Ready-made. Duplicate it to change it"।
- **Groups**: একটা group-এ click করলে dashboard সেই group-এ filter হয় আর target সেটাই হয়ে যায় (§৪.৭)।
- **Rail mode** (48 px): শুধু ৫টা screen icon, Activity log আর Settings, 40 px বর্গ, count কোণার badge হিসেবে, লেবেল tooltip আর accessible name হিসেবে।
- **Keyboard:** একটা tab stop, ↑/↓ roving focus, Enter চালু করে, type-ahead।

### ৪.৭ Target-এর নিয়ম

Target হলো সেটা, যার উপর Fetch, Pull, Push, Run pipeline আর task ছাড়া action কাজ করে। Picker-এ তালিকা:

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

**অগ্রাধিকার:**

1. Dashboard-এ একটা checkbox-এ টিক দিলে target **Selection (n)**-এ বদলে যায়। আগের target মনে রাখা হয়, আর picker-এর পাশে একটা chip "← Back to Task TK-2636" দেখায়। Selection মুছে দিলে সেটা ফিরে আসে।
2. Sidebar-এ একটা group-এ click করলে dashboard সেই group-এ filter হয় আর target সেটাই হয়, তাই যে row-গুলো দেখা যাচ্ছে, কাজও হয় সেগুলোর উপরেই। Group filter সরালে আগের target ফিরে আসে।
3. Filter field-এ লিখলে target কখনো বদলায় না। Toolbar বলে "Showing 2 of 6 · target unchanged: Task TK-2636"।
4. Picker-এ বেছে নেওয়া স্পষ্ট সিদ্ধান্ত, আর সেটা থেকে যায় (UX-09)।
5. কোনো active task না থাকলে আর কিছু বেছে না নিলে target হলো All repos।
6. যেসব repo-র review দরকার, সেগুলো কখনো target-এ থাকে না।

Target বদলালে picker-এর background 600 ms ধরে `info-soft` দেখায় (opacity fade, reduced motion-এ নেই) আর announcer বলে "Target: selection, 3 repos"। প্রতিটা preview তার title-এ target-টা আবার বলে।

### ৪.৮ Active-task chip

| State | চেহারা | Click |
|---|---|---|
| Active task | `● TK-2636 Onboarding ▾`: `accent`-এ বিন্দু, `text-code`-এ key, title 160 px-এ কেটে ছোট করা | Menu: Open task · Commit task… · Sync with dev · Create pull requests · Merge task into… · Run pipeline on task ▸ · Switch task… · Finish task… (v0.2) |
| আংশিক switch হয়েছে | `● TK-2636 ⚠ ▾`, tooltip "app-api isn't on the task branch." | একই menu, সবার উপরে "Switch remaining repos" |
| Switch হচ্ছে | spinner + "Switching to TK-2601…" | Job খোলে |
| কোনো task নেই | `text-secondary`-তে `No active task ▾` | Start task… · Switch task… (সাম্প্রতিক task) |

"Sync with **dev**" task-এর আসল base ব্যবহার করে। Repo-গুলোর base আলাদা হলে বলে "Sync with base"।

**প্রতিটা menu item কোথায় নিয়ে যায়:** Open task → Task screen। **Commit task…** → Changes screen, task-এর repo-তে filter করা, commit scope "Task TK-2636 · 2 repos"-এ set করা আর focus message field-এ (§৮.৬); আলাদা কোনো dialog নেই। Sync with dev, Create pull requests আর Run pipeline on task → তাদের preview। Merge task into… → §৭.৭। Switch task… → §৭.৫। Add repos… → §৭.৬।

### ৪.৯ Bottom bar

| জায়গা | Content |
|---|---|
| বাঁয়ে: job chip | কিছু না চললে: "Nothing running" (`text-secondary`)। চলার সময়: spinner + "Push · 2 of 4 repos" + একটা 80 × 4 px progress bar। Pause হলে: `warning`-এ `pause` + "Update from main → dev · 1 paused"। ব্যর্থ হলে: `danger`-এ `x` + "Fetch · 1 failed"। শেষ হলে: `check` + "Push · done", যেটা 10 s পরে job panel-এর Recent তালিকায় গুটিয়ে যায়। বড়জোর ৩টা chip, তারপর "+2 more"। নতুন job-এর chip একবার স্পন্দিত হয় (opacity 1 → 0.6 → 1, 300 ms; reduced motion-এ নেই)। Click করলে সেই job-এ job panel খোলে |
| মাঝে | "Fetched 2 min ago" (সবচেয়ে সাম্প্রতিক fetch)। Tooltip: "Oldest: knowledge-hub, 3 days ago"। 60 min পরে: "Fetched 2 h ago · Fetch now" |
| ডানে | `warning`-এ "Offline" chip (শুধু network ব্যর্থ হলে) · zoom "110%" (শুধু 100 % না হলে; click করলে reset হয়) · "Activity log" link |

### ৪.১০ Job panel

Bottom bar থেকে উপরের দিকে খোলা একটা docked, non-modal region (default-ভাবে বন্ধ; Mod+J বা job chip-এ click)। Action-flow dialog বন্ধ হওয়ার পর progress আর ফলাফল এখানেই থাকে, তাই 30টা repo-র ফলাফলের জন্যও জায়গা হয়।

- বাঁয়ের 14rem column: job-এর তালিকা, ভাগ করা **Running**, **Paused**, **Needs attention** (failure নিয়ে শেষ হয়েছে), **Recent**-এ। প্রতিটা row: "Sync with dev · Task TK-2636 · 1 succeeded, 1 paused" আর একটা [Dismiss] icon। Footer: "Dismiss all finished"।
- ডানে: বেছে নেওয়া job-এর progress view বা ফলাফল (§১২.৬–§১২.৭)। Pipeline একটা ছোট grid আর [Open run] দেখায়, যেটা Pipelines → run grid-এ নিয়ে যায়।
- Esc panel বন্ধ করে। Dismiss না করা পর্যন্ত ফলাফল থাকে।
- খালি: "Nothing running. Actions you run show their progress here."

### ৪.১১ Banner আর notice

Banner screen toolbar-এর নিচে বসে: 2.25rem উঁচু, নিজের tone-এর soft background, একটা 16 px icon, এক বাক্য, একটা action, আর blocking না হলে dismiss করার ×। বড়জোর দুটো দেখায়; বেশি হলে "1 of 3 ▾" switcher-এ গুটিয়ে যায়। অগ্রাধিকার:

| # | Tone | লেখা | Action |
|---|---|---|---|
| 1 | warning | GitHeddle closed while "Update from main → dev" was running. app-api is paused at Push (interrupted). 1 repo finished. | [Review run] |
| 2 | warning | 1 repo needs review before GitHeddle runs Git in it. | [Review repos] |
| 3 | warning | Your GitHub sign-in has expired. Pull request status and creation are paused. | [Sign in again] |
| 4 | info | Can't reach github.com. Local work still works. Fetch, Pull, Push and pull requests will wait. | [Try again] |
| 5 | info | The team file for acme-works changed. (v0.2) | [Review it] |

### ৪.১২ Toast

- নিচে ডানে, bottom bar-এর (বা job panel-এর) `space-4` উপরে, 22.5rem চওড়া, `surface-overlay`, `elevation-1`, `radius-lg`, tone-এর রঙে বাঁয়ে 4 px bar, icon, ১–২ লাইন, ইচ্ছামতো একটা action, ×।
- বড়জোর ৩টা স্তূপ করা, সবচেয়ে নতুনটা নিচে।
- সময়: success 4 s; info আর failure 6 s; action থাকলে 8 s; Undo থাকলে 10 s। Hover বা focus থাকার সময় থেমে থাকে।
- Failure বা pause-এর একমাত্র জায়গা কখনো toast নয়: dismiss না করা পর্যন্ত job chip সেটা ধরে রাখে।
- Toast region F6 চক্রের মধ্যে আছে; role `status`।

## ৫. Repositories dashboard (DASH-01..08)

### ৫.১ গঠন

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

এই ডকুমেন্টের প্রতিটা section-এ যে উদাহরণের state ব্যবহার হয়েছে: **vendor-sdk**-এর review দরকার। **app-api** আছে `dev`-এ, `TK-2636-taosif-Onboarding`-কে `dev`-এ merge করার মাঝপথে (3টা conflicted file, 6টা conflict); এর task branch `dev`-এর চেয়ে 5টা commit এগিয়ে, এখনো origin-এ নেই আর কোনো pull request নেই। **app-front** আছে task branch-এ, push করার মতো 2টা commit, `dev`-এর চেয়ে 4টা পিছিয়ে, 2টা বদলানো file আর pull request #412 (checks passed 4/4, approved)। কিছুতে টিক দেওয়া নেই, তাই target এখনো Task TK-2636 আর filter toolbar দেখাচ্ছে (§৫.৬)। Row-গুলো default "Needs attention" ক্রমে আছে (§৫.২)। Getting started 6-এর মধ্যে 4-এ: commit করা আর pull request বানানো (app-api-তে এখনো নেই) এখনো বাকি।

Table-টা `surface-sunken`-এর উপর একটা React Aria Table: 24 px row, row-গুলোর মাঝে 1 px `border-subtle`, `surface-raised`-এর উপর `text-body-strong`-এ আটকে থাকা 28 px header।

### ৫.২ Column

মানগুলো শব্দে লেখা। শব্দের পাশে তীর-glyph থাকতে পারে, শব্দের বদলে কখনো নয়।

| # | Column | চওড়া | Content | Sort |
|---|---|---|---|---|
| 1 | ☐ | 32 px | Checkbox; header-টা tri-state, "Select all 6 visible" | — |
| 2 | Repo | flex, min 160 | `text-body-strong`। Row cache থেকে এলে `text-secondary`-তে একটা 12 px `history` icon (tooltip "Showing last known state, updating…")। Cell-এর ডান প্রান্তে row action (§৫.৫) | name |
| 3 | Branch | 220 | `text-code`, ticket আর শেষ অংশ রেখে মাঝখান থেকে কাটা (`TK-2636-taos…Onboarding`); পুরো নাম tooltip-এ। Detached: `unlink` + `a1b2c3d`। Unborn: "No commits yet" | name |
| 4 | Origin | 112 | "2 to push", "1 to pull", "Up to date", "Not published", "Diverged · 2 ↑ 1 ↓"। সব `text-primary`-তে, "to push"-এর আগে একটা 12 px `arrow-up-from-line` আর "to pull"-এর আগে `arrow-down-to-line` (কখনো `text-link` নয়, তাতে সাধারণ লেখা link-এর মতো দেখাত) | behind, তারপর ahead |
| 5 | vs dev | 96 | সব repo-র base একই হলে header-এ লেখা "vs dev", না হলে "vs base"। "4 behind", "3 ahead · 4 behind", "Up to date", base-এ থাকলে "–"। Tooltip: "dev has 4 commits this branch doesn't have. Sync to bring them in." | behind |
| 6 | Changes | 96 | বদলানো file, আর কিছু staged থাকলে সাথে "· 3 staged" ("6 · 3 staged"); tooltip "3 staged · 2 changed · 1 untracked"; clean হলে "·" | total |
| 7 | State | flex, min 200 | একটা প্রধান pill, বড়জোর একটা secondary pill, তারপর "+N" (§৫.৩)। Row কখনো উঁচু হয় না | priority |
| 8 | Task / PR | 140 | Task key chip (click করলে task খোলে), তারপর CI icon সহ `#412` | task |
| 9 | Fetched | 72 | "2 min", "1 h", "3 d"। 24 h-এর বেশি: `warning` লেখা + `triangle-alert`, tooltip "Last fetched 3 days ago. Fetch to see new commits." | age |

- **সরু centre।** উপরের চওড়াগুলোর জন্য প্রায় 1,130 px দরকার। তার নিচে column-গুলো এই ক্রমে জায়গা ছাড়ে, আর কিছুই কখনো পাশে scroll করে না:

  | Centre-এর চওড়া | কী বদলায় | ন্যূনতম মোট |
  |---|---|---|
  | ≥ 1,130 | উপরের চওড়ায় প্রতিটা column | 1,128 |
  | 960–1,129 | Fetched (9) লুকায়: 24 h-এর বেশি বয়স Repo cell-এ একই tooltip সহ একটা `triangle-alert` হিসেবে দেখায়। Repo min 140, Branch 180, State min 160 | 956 |
  | 720–959 | Task / PR (8)-ও লুকায়: task key State-এ একটা secondary pill হয়ে যায়, PR নম্বর row-এর tooltip-এ যায়। Origin (4) আর vs dev (5) মিলে একটা 128 px "Sync" column হয় ("2 to push · 4 behind")। Branch 160 | 716 |

  Details panel খোলা রেখে default 1,280 × 800 window-এ centre ঠিক 720 px, তাই শেষ row-টা খাটে। Panel docked থাকা অবস্থায় centre কখনো 720 px-এর চেয়ে সরু হয় না (§৪.৪); তার নিচে শুধু zoom নিতে পারে, আর তখন row ২-লাইনের card হয়ে যায়। [Columns ▾] column 3–9 দেখায় বা লুকায়; পছন্দটা প্রতি workspace-এ save হয় আর এই নিয়মগুলোর উপরে খাটে।
- Header-এ একবার click করলে ঊর্ধ্বক্রমে sort, দ্বিতীয় click-এ অধঃক্রমে, তৃতীয় click-এ মুছে যায়। Shift+click একটা দ্বিতীয় key যোগ করে।
- **Default ক্রম হলো "Needs attention"**: State-এর অগ্রাধিকার, তারপর নাম। User অন্য sort বেছে না নেওয়া পর্যন্ত header বলে "Sorted by: Needs attention"।

### ৫.৩ State pill-এর তালিকা

একটাই তালিকা, dashboard, details panel, Task screen আর preview — সবাই ভাগ করে নেয়।

| অগ্রাধিকার | Pill-এর লেখা | Tone | Icon | কখন | Details panel-এ action |
|---|---|---|---|---|---|
| 1 | Needs review | warning | `shield-question` | GS-08 untrusted | [Review] |
| 2 | Can't read repo | danger | `x` | Status ব্যর্থ, folder নেই, `safe.directory` প্রত্যাখ্যান করেছে | [Show Git output] [Locate…] [Remove from workspace] |
| 3 | Merging · 3 conflicted / Rebasing 2 of 5 · 1 conflicted / Cherry-picking · 1 conflicted | `merge-unresolved`-এর উপর `status-conflicted` | `git-compare` | Conflict সহ operation | [Resolve conflicts] [Abort merge…] |
| 4 | Merging · ready to continue | info | `git-merge` | 0 conflict সহ operation | [Continue merge] |
| 5 | Pulling… | info | spinner | এই repo-তে একটা job চলছে | Open ছাড়া অন্য row action aria-disabled: "Pull is running here" |
| 6 | Detached HEAD | warning | `unlink` | DASH-07 | [Create branch here…] [Switch branch…] |
| 7 | Diverged · 2 ↑ 3 ↓ | warning | `split` | DASH-07 | "This branch and origin both have new commits. Pull will stop; merge or rebase is needed." |
| 8 | 2 commits on dev | warning | `shield` | Protected branch-এ local commit (DASH-07) | [Create branch from here…] |
| 9 | Can't push: no Git login | warning | `key-round` | First-run-এর reachability check ব্যর্থ হয়েছে (§১৭.৫) | [How to set up a Git login] |
| 10 | Behind 4 | info | `arrow-down-to-line` | Upstream-এর চেয়ে পিছিয়ে | [Pull app-report-api] |
| 11 | 2 to push | info | `arrow-up-from-line` | Upstream-এর চেয়ে এগিয়ে | [Push app-front] |
| 12 | Not published | neutral | `cloud-off` | কোনো upstream নেই | [Publish branch] |
| 13 | 6 changed | neutral | `circle-dot` | শুধু dirty | [Open in Changes] |
| secondary | 1 stash · githeddle/TK-2636 | neutral | `archive` | GitHeddle-এর বানানো stash (v0.1); v0.2-এ যেকোনো stash (DASH-07) | Stash-গুলোর তালিকা দেয় |
| 14 | Clean | `success` লেখা, fill নেই | `check` | আর কিছু খাটে না | — |

Neutral pill হলো `surface-hover`-এর উপর `text-secondary`। প্রতিটা pill-এর এক বাক্যের tooltip আছে, আর row-এর accessible name-এ pill-এর লেখা থাকে।

### ৫.৪ Row-এর state

| State | চেহারা |
|---|---|
| Cached (প্রথম paint, PERF-02) | স্বাভাবিক contrast, `history` চিহ্ন, cache-এর মান। সব live না হওয়া পর্যন্ত toolbar-এ "Updating 6 repos…", তারপর "Updated just now" |
| খোঁজা হচ্ছে (cache নেই) | Core repo খুঁজে পাওয়ার সাথে সাথে row আসে। 150 ms পরে cache ছাড়া cell-এ একটা স্থির 40 × 8 px `surface-hover` bar দেখায়। State বলে "Reading…" |
| Live | কোনো চিহ্ন নেই |
| Live-এ বদলেছে | বদলানো cell 400 ms ধরে `info-soft` দেখায় (শুধু opacity, reduced motion-এ নেই)। Announce হয় না |
| Busy | Busy pill। Checkbox ব্যবহার করা যায় (PERF-05) |
| Needs review | প্রতিটা cell `text-secondary`, প্রতিটা status cell "—"। Checkbox disabled, tooltip "Review this repo before GitHeddle can act on it."। [Review] শুধু এই repo নিয়ে trust dialog খোলে |
| Error | Danger pill। অন্য cell-গুলো `text-secondary`-তে শেষ মান ধরে রাখে, tooltip "Last known value" |
| Offline | Row বদলায় না (local status তবুও কাজ করে)। Offline banner দেখায়, আর Fetched-এর বয়স বাড়তে থাকে |

### ৫.৫ Row action আর context menu

Hover বা focus-এ Repo cell-এর ডানে তিনটা 24 px icon button আসে: **Open in VS Code** (লেবেল configure করা editor মেনে চলে, যেমন "Open in Rider"), **Open terminal** আর **⋯**। Focus থাকা row-এ এগুলো দেখা যায়, আর নামের cell থেকে → দিয়ে পৌঁছানো যায়।

⋯ menu-টাই context menu (right-click, Shift+F10, Menu key):

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

"Open in file manager" প্রতিটা OS-এ একই লেবেল। এই menu-র Fetch, Pull আর Push শুধু এই repo-তে কাজ করে, আর লেবেলও সেটাই বলে।

### ৫.৬ Selection (DASH-05)

- Checkbox-এ click করলে সেটা চালু/বন্ধ হয়; Shift+click একটা range বেছে নেয়। Table-এ: Space চালু/বন্ধ করে, Shift+Space বাড়ায়, Mod+A দেখা যাওয়া সব row বেছে নেয়, Esc মুছে দেয়।
- **Row-এ নিজে click করলে (checkbox-এ নয়) সেটায় focus আসে আর details panel-এ সেটা দেখায়। Selection বদলায় না।** Details panel লুকানো থাকলে Enter সেটা খোলে আর focus সেখানে নিয়ে যায়।
- Refresh আর filter-এর পরেও selection থাকে। Filter-এ লুকানো selected row-ও গোনা হয়।
- এক বা একাধিক row বাছা থাকলে filter toolbar-এর জায়গায় একটা **selection bar** আসে (একই 36 px): `3 selected (1 hidden by filter) · Clear │ [Pull 3 repos] [Push 3 repos] [Switch branch…] [Start task with these] [Run pipeline ▾] [More ▾]`। Centre 960 px-এর নিচে হলে [Switch branch…] আর [Start task with these]-ও More ▾-এ চলে যায়।
- **More ▾**-এ BULK-01-এর বাকিগুলো থাকে, প্রত্যেকটা তার preview খোলে (§৫.৯): Fetch 3 repos · Create branch… · Stash 3 repos · Pop stash… · Merge a branch into… · Delete local branch… · Commit… (selection-এ scope set করে Changes খোলে) · Add to task ▸ · Add to group ▸।

### ৫.৭ Toolbar আর filter (DASH-03)

- Filter field 240 px, placeholder "Filter repos…"। Mod+F বর্তমান screen-এর filter-এ focus দেয়।
- Toggle chip: Dirty, Behind, Conflicts, Unpushed (24 px)। চালু chip তার count দেখায়: "Behind · 2"। Group ▾ আর Task ▾ হলো select chip। Chip-গুলো AND দিয়ে মেলে, আর কোনোটা চালু থাকলে "Clear filters" দেখায়।
- "Updated 12 s ago" সহ Refresh (F5 / ⌘R)। Refresh-এর সময় icon ঘোরে আর button busy থাকে।
- **সরু centre (960 px-এর নিচে)।** Filter field হয় 180 px (focus-এ 240 px); চারটা toggle chip থাকে; Group ▾, Task ▾ আর [Columns ▾] একটা **"More filters ▾"** menu-তে চলে যায়, যার লেবেল চালুগুলো গোনে ("More filters · 1"); "Updated 12 s ago" শুধু refresh icon হয়ে যায়, বয়সটা থাকে তার tooltip আর accessible name-এ। 720 px-এ মোট: প্রায় 650 px।

### ৫.৮ খালি আর আটকে দেওয়া state (UX-06)

| ক্ষেত্র | Content |
|---|---|
| কোনো workspace নেই | `icon-xl` `folder-git-2`। Headline "Open your repos"। Body "Choose the folder where your Git repos live, or import a VS Code workspace."। [Choose folder…] (primary, `control-lg`) [Import VS Code workspace…] |
| কোনো repo পাওয়া যায়নি | "No Git repos found in C:\Work\acme. GitHeddle looked 2 folders deep." [Look 3 levels deep] [Choose another folder] |
| Filter-এ কিছু মেলে না | "No repos match "sched" with Behind." [Clear filters] |
| Git নেই বা খুব পুরনো (GS-01) | পুরো centre জুড়ে blocker (§১৭.১) |
| সব repo-র review দরকার | ম্লান row, আর focus review banner-এ যায় |

### ৫.৯ Selection থেকে bulk operation (BULK-01)

Selection bar আর More ▾-এর প্রতিটা item selection-এর উপর ভাগাভাগি করা action flow (§১২) খোলে, শুধু Fetch ছাড়া, যেটা read-only আর একটা toast সহ সাথে সাথে চলে। নিচের প্রতিটা row বলে input, প্রতি repo-র plan বাক্য, inline choice (কিছুই আগে থেকে বাছা নয়, §১২.৫) আর primary button।

| Operation | Input (§১২.২) | প্রতি repo-র plan বাক্য | Inline choice আর বিশেষ row | Button |
|---|---|---|---|---|
| Switch branch… | Branch: যেকোনো selected repo-তে পাওয়া branch-এর নামের একটা ComboBox | "Switch from `TK-2636-taosif-Onboarding` to `dev`" | Uncommitted changes: Take them along (শুধু clean switch-এ) · Stash · Skip। Branch শুধু origin-এ: Check it out and track origin · Skip। Branch কোথাও নেই: Skipped "No branch `dev` in app-report-api" | Switch 3 repos to dev |
| Create branch… | Name (§৭.৪-এর মতো যাচাই) · From: ( ) Each repo's current branch ( ) `origin/<base>`, কিছুই আগে থেকে বাছা নয় · ☐ Switch to it | "Create `spike-logging` from `dev` and switch to it" | নাম আগে থেকেই আছে: Switch to it · Skip। Switch করার সময় uncommitted changes: Switch branch-এর মতো | Create branch in 3 repos |
| Stash | Name, আগে থেকে ভরা `githeddle/TK-2636` (task না থাকলে `githeddle/manual`) · ☐ Include new (untracked) files, বন্ধ | "Stash 4 changed files as `githeddle/TK-2636`" | Clean repo: "Nothing to do"-এর নিচে | Stash 3 repos |
| Pop stash… | — | "Bring back `githeddle/TK-2636` (4 files, 2 h ago) into `TK-2636-taosif-Onboarding`" | কয়েকটা stash: প্রতি row-এ একটা picker, কিছুই আগে থেকে বাছা নয়, GitHeddle-এর stash আগে। Stash-এর পরে বদলানো file: `warning` sub-line "Program.cs changed since. This may conflict; if it does, the stash is kept and the repo pauses."। কোনো stash নেই: "Nothing to do" | Pop stash in 2 repos |
| Merge a branch into… | যে branch merge করতে হবে: একটা ComboBox, default `origin/<base>` (`origin/dev`) · Into: প্রতিটা repo-র current branch, প্রতি row-এ দেখানো, কখনো সবার জন্য একসাথে বাছা নয় | "Merge `origin/dev` (4 new commits) into `TK-2636-taosif-Onboarding`" | Uncommitted changes: Stash · Skip। Current branch protected: confirmation block (§১২.৮)। আগে থেকেই আছে: "Nothing to do"। Conflict হলে repo pause হয় (§১২.৭) | Merge into 3 repos |
| Delete local branch… | Branch: selection-এর local branch-এর নামের একটা ComboBox | "Delete local `spike-logging` (already merged into `dev`)" | Unmerged commit: `danger-soft`-এর উপর একটা loss row, যেটা প্রতিটা commit-এর তালিকা দেয় (§১২.৯)। এখানে checked out: Skipped "`spike-logging` is checked out in app-api. Switch first." [Switch branch…]। Protected: Skipped "GitHeddle doesn't delete protected branches." | Delete branch in 2 repos · loss থাকলে: Delete branch in 2 repos, losing 4 commits (`danger-action`) |
| Commit… | — | — | Selection-এ commit scope set করে Changes খোলে (§৮.৬) | — |

Delete local branch destructive-এর নিয়ম মানে: শুরুর focus Cancel-এ, Mod+Enter কিছু করে না (§১২.১০)। এখান থেকে remote branch কখনো ছোঁয়া হয় না।

### ৫.১০ Group editor (GRP-01)

খোলে sidebar-এর Groups header-এর `+` ("New group") থেকে, group-এর context menu (Rename…, Edit group…, Delete group…) থেকে, target picker-এর "Manage groups…" থেকে, আর Settings → Workspace → Groups থেকে।

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

- একটা `gh-dialog--md` dialog। Name দেওয়া বাধ্যতামূলক আর workspace-এ অনন্য হতে হবে: "A group named backend already exists."। Repos হলো filter সহ একটা checklist; নতুন group-এ কিছুতে টিক দেওয়া থাকে না, যদি না সেটা dashboard selection থেকে খোলা হয় ("New group from selection"), তখন সেই row-গুলোতে টিক দেওয়া থাকে।
- **কোনো preview নেই।** Group হলো GitHeddle-এর একটা setting, Git-এ কিছুই বদলায় না, তাই সরাসরি save হয় (R38)। Button ফলাফলের নাম বলে: "Create group · 4 repos" বা "Save group · 4 repos"।
- ফলাফল: toast "Group backend created with 4 repos. [Make it the target]"। Group সাথে সাথে sidebar আর target picker-এ চলে আসে।
- Delete: একটা AlertDialog "Delete the group backend? Its 4 repos stay in the workspace; only the group goes." [Cancel] [Delete group]। এটা SAFE-03-এর ক্ষেত্র নয়: Git-এ কিছুই হারায় না।
- Team file দিয়ে group ভাগ করা (GRP-02, CFG-03) এই dialog-এ একটা v0.2 toggle, "Coming in v0.2" সহ disabled দেখানো।

## ৬. ডানের details panel

- **Header** (40 px): ধরনের icon, title, [Pin] আর [×]। Pin করা panel তার object ধরে রাখে; pin না করা panel focus থাকা row-কে অনুসরণ করে।
- **Body** scroll করে। Section-গুলো `text-section-title` header আর 12 px padding সহ Disclosure। খোলা বা বন্ধ অবস্থা প্রতি ধরনের জন্য মনে রাখা হয়।
- **Footer** (44 px, আটকে থাকে): object-এর action।
- **খালি:** "Select a repo, task or pull request to see its details."

### ৬.১ Repo

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

কয়েকটা repo বাছা থাকলে panel বলে "3 repos selected" আর মোট হিসাব দেখায় (changes, behind, to push), যে pill-গুলো খাটে ("1 merging"), [Start task with these] আর [Run pipeline ▾]।

### ৬.২ Task

Header হলো "TK-2636 · Onboarding"। তার নিচে: [Copy] সহ `text-code`-এ branch; "Base dev · 2 repos · Active"; Next step card (§৭.২); repo-র একটা ছোট তালিকা (নাম, pill, PR নম্বর); "1 pull request · checks passed · app-api has none yet"। Footer: [Sync with dev] [Create pull requests] [Open task]।

### ৬.৩ Pull request

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

ছবি কখনো load হয় না। প্রতিটা ছবি একটা [Copy link] button সহ `[image: name]` হিসেবে দেখানো হয় (TH-07)। `https://github.com/…`-এর link system browser-এ খোলে। অন্য যেকোনো URL [Copy] সহ পুরোটা দেখানো হয় আর কখনো খোলা হয় না।

## ৭. Task screen আর Start task

### ৭.১ Task screen

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

- Header-এর badge বলে "Active task" বা "Not active"।
- Action bar-এর প্রথম button হলো Next step-এর action, primary-র মতো সাজানো। বাকিগুলো secondary।
- ⋯ menu: Add repos…, Remove repo from task…, Rename…, Copy branch name, Finish task… (v0.2), Show in activity log।
- Repo-র table হলো dashboard-এর table, "Task / PR"-এর জায়গায় একটা "Pull request" column সহ।

### ৭.২ Next step card

Card-টা store state-এর উপর একটা selector। এটা `info-soft`, `radius-lg`, 12 px padding। প্রথম যে নিয়ম মেলে, সেটা এক বাক্য আর একটা button দেখায়:

| নিয়ম | লেখা | Button |
|---|---|---|
| Task-এর একটা repo conflict-এ আছে | "app-api has 3 conflicted files. Resolve them before anything else." | Resolve conflicts |
| একটা repo task branch-এ নেই | "app-api is on dev, not on the task branch." | Switch app-api |
| বদলানো file | "app-front has 2 changed files. Next: commit them." | Open Changes |
| এমন commit যা pull request-এ নেই | "2 repos have commits that aren't in a pull request yet." | Create pull requests |
| Base-এর চেয়ে পিছিয়ে | "dev has 4 new commits. Sync to stay up to date." | Sync with dev |
| একটা PR-এর check ব্যর্থ হচ্ছে | "#412 in app-front has a failing check." | Open pull request |
| সব PR approved আর merge করা যায় | "Both pull requests are approved and can merge." | Open on GitHub (v0.2: Merge pull requests…) |
| কিছু করার নেই | — | Card লুকানো থাকে |

### ৭.৩ Task screen-এর state

| State | কী দেখায় |
|---|---|
| নিষ্ক্রিয় task | `info` banner: "This isn't the active task. Actions here still apply to its repos." [Make active] |
| কোনো repo নেই | "TK-2636 has no repos. Add the repos this ticket touches." [Add repos] |
| Workspace থেকে repo সরানো হয়েছে | Row `text-secondary`-তে: "Not in this workspace" [Remove from task] |
| Sign out করা | PR section: "Sign in to GitHub to create and track pull requests." [Sign in to GitHub] |
| Loading | Cache চিহ্নসহ cache-এর মান |

### ৭.৪ Start task dialog (Flow 1, TASK-01/02)

এটা ভাগাভাগি করা action flow, preview-এর উপরে একটা **input section** সহ (§১২.২), 55rem চওড়া। Click-এর একই frame-এ খোলে, cursor থাকে Ticket-এ।

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

**Input**

- **Ticket** (160 px, `text-code`), placeholder "TK-1234", hint "Used at the start of branch names and commit messages."। v0.1-এ বাধ্যতামূলক (§২৫ দেখুন)।
- **Title**, placeholder "Short title, like Onboarding"। Branch-এর নামে এটা PascalCase হয়ে যায় (PRD-র অনুমান 2)।
- **Branch** হিসাব করে বের করা, আর [Edit] সেটাকে field না বানানো পর্যন্ত read-only। তখন "Reset to pattern" দেখায়।
- **Base** হলো টিক দেওয়া repo-গুলোর সবার মধ্যে থাকা branch-এর একটা ComboBox, default setting অনুযায়ী।
- **Repos** default-ভাবে dashboard selection নেয়, যদি থাকে (chip "Selected on dashboard 2" চালু)। না থাকলে target group-এ টিক দেওয়া থাকে। তাও না থাকলে কিছুতে টিক থাকে না আর button-এ লেখা থাকে "Choose repos"। Group chip তার সব repo একসাথে চালু/বন্ধ করে।
- **Publish** default-ভাবে বন্ধ আর শেষ পছন্দটা মনে রাখে।

**Live plan।** শেষ keystroke বা টিকের 300 ms পরে core নতুন করে plan করে। আগের preview কম জোর দিয়ে "Updating…" সহ থেকে যায়, তাই কখনো খালি হয়ে ঝলকায় না। Fetch হয় চালানোর সময়, আর plan সেটা বলে ("fetches first")।

**প্রতি repo-র choice** (SAFE-04, TASK-02)। কখনো কিছুই আগে থেকে বাছা থাকে না।

| ক্ষেত্র | Choice |
|---|---|
| Uncommitted changes আছে, আর switch clean | **Take them along** (tag "Recommended: nothing is lost") · Stash · Skip |
| Uncommitted changes আছে, আর switch-এ conflict হবে | Stash · Skip |
| Branch local-এ আছে | Switch to it · Skip |
| Branch origin-এ আছে | Check it out and track origin · Skip |
| Base-এ এমন local commit যা origin-এ নেই ("2 commits on dev" pill) | **Bring them into the task branch** (branch local `dev` থেকে শুরু হয়, তাই সেগুলো থাকে) · **Leave them on dev** (branch `origin/dev` থেকে শুরু হয়; pill থেকে যায়)। Sub-line commit-গুলোর তালিকা দেয়: "a1b2c3d Fix typo · 9f3e2a1 Add field" |
| Base fast-forward করা যায় না (`dev` আর `origin/dev` দুটোই এগিয়েছে) | Leave them on dev · Skip। Sub-line: "Your dev has 2 commits origin doesn't, and origin has 4 new ones, so GitHeddle can't update dev. The task branch starts from origin/dev and dev is left as it is." |
| Merge-এর মাঝপথে, review দরকার, পড়া যায় না | কোনো choice নেই। কারণ আর ঠিক করার link সহ "Skipped (n)"-এর নিচে তালিকায় থাকে |

Stash `githeddle/TK-2636` বানায়, আর sub-line বলে "Stash as githeddle/TK-2636. You can bring it back when you switch back."।

**যাচাই**, field-এর নিচে inline, core-এর code থেকে: "Enter a ticket key, like TK-2636." · "Branch names can't contain spaces or `..`, or start with `-`. Try TK-2636-taosif-Onboarding."

**Key।** সব কিছু তৈরি হলে Mod+Enter চালায়। Esc বাতিল করে; কিছু লেখা হয়ে থাকলে জিজ্ঞেস করে "Discard this task? [Keep editing] [Discard task]"।

**ফলাফল।** Dialog বন্ধ হয়ে একটা job-এ চলে যায়। Toast: "Task TK-2636 started in 2 repos. Now the active task. [Open task]"। আংশিক: "Task TK-2636 started in 1 of 2 repos. app-api: fetch failed (can't reach origin). [View result]"। Top bar-এর chip সাথে সাথে update হয়।

### ৭.৫ Switch task dialog (TASK-03, SAFE-04)

খোলে task chip (Switch task…), Mod+T, sidebar-এর task row-এর [Switch], বা palette থেকে। একটা dialog, দুই ধাপ:

1. **Task বেছে নিন।** Dialog-এর input section-এ একটা তালিকা, লিখতে লিখতে filter হয়: "TK-2601 · Cost centres · 3 repos · active 2 days ago"। বর্তমান task তালিকায় থাকে কিন্তু disabled ("Active now")। Enter বা click একটা task বেছে নেয় আর নিচে একই frame-এ preview load হয়।
2. **Preview** (ভাগাভাগি করা action flow), title "Switch to TK-2601 · 3 repos"।

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

| ক্ষেত্র | Row |
|---|---|
| Branch local-এ আছে | "Switch from `<current>` to `TK-2601-taosif-CostCentres`" |
| Branch শুধু origin-এ | "Check out `TK-2601-…` from origin and track it" |
| Branch কোথাও নেই | Skipped: "`TK-2601-…` doesn't exist in app-api any more." [Remove from task] |
| Uncommitted changes (SAFE-04) | Take them along (শুধু switch clean হলে, Recommended tag সহ) · Stash · Skip। Stash-এর নাম হয় যে task ছেড়ে যাওয়া হচ্ছে তার নামে: "Stash as githeddle/TK-2636" |
| নতুন task-এর জন্য GitHeddle-এর একটা stash আছে | Row-এর নিচে একটা **টিক না দেওয়া** checkbox: "Bring back your stashed changes (githeddle/TK-2601 · 3 files · 2 days ago)"। কখনো আগে থেকে বাছা নয় (L6) |
| Merge-এর মাঝপথে, review দরকার, পড়া যায় না | কারণ আর ঠিক করার link সহ Skipped |
| পুরনো task-এর এমন repo যা নতুনটায় নেই | গুটানো "Not part of TK-2601 (n)": "app-front stays on TK-2636-taosif-Onboarding."। সেখানে কিছুই চলে না |

- **Pop conflict।** Stash ফিরিয়ে আনতে গিয়ে conflict হলে সেই repo অন্য যেকোনো conflict-এর মতো pause হয় ("app-front: 1 file needs you to choose what to keep. The stash is kept."), Git stash রেখে দেয়, আর ফলাফলের row [Resolve conflicts] দেয়। Switch নিজে তো আগেই হয়ে গেছে।
- **ফলাফল।** Chip সাথে সাথে নতুন task দেখায়। Toast: "TK-2601 is now the active task. 3 repos switched. [Open task]"। কিছু repo skip বা ব্যর্থ হলে chip আংশিক switch-এর state দেখায় (§৪.৮), যার menu শুরু হয় "Switch remaining repos" দিয়ে।

### ৭.৬ Repo যোগ করা আর একটা repo সরানো (TASK-04)

**Add repos…** (task chip-এর menu, Task screen-এর [+ Add repos] আর ⋯, sidebar-এর task menu, dashboard row-এর Add to task ▸, বা selection-এ টিক দিয়ে More ▾ → Add to task ▸)। এটা Start task dialog (§৭.৪), যেখানে Ticket, Title, Branch আর Base read-only, title "Add repos to TK-2636 · 2 repos"। Repo picker শুধু workspace-এর সেই repo-গুলো দেখায় যেগুলো task-এ নেই। টিক দেওয়া প্রতিটা repo Start task-এর plan আর প্রতি repo-র একই choice পায় ("Create `TK-2636-taosif-Onboarding` from `origin/dev` and switch to it"; "The branch exists on origin: Check it out and track origin · Skip")। Button: "Add 2 repos to TK-2636"। Toast: "app-report-api and knowledge-hub added to TK-2636."

**Remove repo from task…** (Task screen-এর row-এর ⋯, বা ⋯ menu, যেটা আগে জিজ্ঞেস করে কোন repo)। একটা ছোট action-flow dialog, title "Remove from TK-2636 · 1 repo":

```text
 ☑ app-front   Remove from TK-2636. TK-2636-taosif-Onboarding stays, locally and on origin,
               and so does pull request #412.      ( ) Stay on the task branch  ( ) Switch to dev
```

- কিছুই আগে থেকে বাছা নয়। প্রযোজ্য হলে "Switch to dev" uncommitted changes-এর choice নিয়ে আসে (Take them along · Stash · Skip)।
- এখানে কোনো branch delete হয় না; delete করা হলো Finish task (TASK-07, v0.2)। তাই এটা destructive নয় আর সাধারণ key-এর নিয়ম মানে।
- Button: "Remove 1 repo from TK-2636"। শেষ repo-টা সরালে একটা খালি task থাকে (§৭.৩ "No repos")।

### ৭.৭ Merge task into… (TASK-06)

খোলে task chip, Task screen-এর [Merge into… ▾] বা palette থেকে। এটা built-in pipeline "Merge task into…" চালায় (§১৩.২), তাই input target বেছে নেয় আর preview হলো pipeline-এর preview।

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

(Sketch-টা app-api-র merge শুরুর আগের state দেখায়; §১০ একই repo-কে তার মাঝে pause অবস্থায় দেখায়।)

- **Target picker** হলো সেই branch-এর নামের একটা ComboBox যেগুলো task-এর প্রতিটা repo-তে আছে, task-এর base সবার আগে আর "(base)" চিহ্ন দেওয়া। Repo-গুলোর base আলাদা হলে প্রথম option হয় "Each repo's base (dev; main for app-report-api)", আর সেটাই default।
- Push default-ভাবে চালু (PIPE-03) আর সবসময় block-এ নিশ্চিত করতে হয়; সেই repo-তে merge সফল হলেই শুধু push হয়।
- Row: uncommitted changes → Stash · Skip; target-এ task branch আগে থেকেই আছে → "Nothing to do"; operation-এর মাঝপথে বা review দরকার → Skipped। Target origin থেকে fast-forward করতে না পারলে সেই repo merge-এর আগেই থামে: "dev and origin/dev have both moved. Pull dev first." [Open terminal]।
- Conflict হলে run grid-এ repo pause হয় (§১৩.৫), [Resolve conflicts] সহ। শেষ হলে প্রতিটা repo যে branch থেকে শুরু করেছিল সেখানে ফিরে যায় (pipeline-এর default, §২২.৪)।

## ৮. Changes screen (CHG-01..07, BULK-06)

### ৮.১ Layout

Centre ভাগ হয় বাঁয়ে একটা **list pane** আর ডানে একটা **diff pane**-এ।

| অংশ | মাপ |
|---|---|
| Screen toolbar | 36 px, list pane জুড়ে |
| Commit box | List pane-এর **উপরে**, toolbar-এর নিচে আটকানো (VS Code-এর মতো)। ৩-লাইনের অবস্থায় প্রায় 136 px |
| List pane | কার্যকর চওড়া 1440 বা তার বেশি হলে default 380 px, তার নিচে 320 px; min 280 px; বড়জোর centre-এর 55 % |
| Splitter | 1 px রেখা, 6 px hit area; key 1rem সরায়, Shift 4rem |
| Diff pane | Min 400 px, নিজের 64 px header সহ |

1440 px-এ: sidebar 240 + list 380 + diff 820। Default 1280 × 800-এ: sidebar 240 + list 320 + diff 720, তাই side by side দেখায় (§৯.২)। 1024 × 640-এ: rail 48 + list 320 + diff 656, তবুও side by side; list-এ প্রায় 15টা row দেখায়।

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

### ৮.২ Toolbar

| অংশ | বিস্তারিত |
|---|---|
| Title | "Changes" (`text-screen-title`) আর `text-secondary`-তে "8 files · 2 repos" |
| List / Tree | ToggleButtonGroup, 24 px। Tooltip "Shows files as a flat list with their folder." / "Shows files grouped in folders." |
| Filter | SearchField 200 px (focus-এ 280 px), placeholder "Filter files…", Mod+F |
| Collapse all | `list-collapse` icon। Tooltip "Collapses every repo." |
| Refresh | `refresh-cw`। Tooltip "Re-reads every repo's changes from Git." |

### ৮.৩ Row-এর ধরন

সব row 24 px উঁচু, প্রতি স্তরে 16 px indent, বাঁয়ে 8 px padding।

**Repo header** (স্তর 0), তার row-গুলো দেখা যাওয়া পর্যন্ত আটকে থাকে:
- `surface-raised`, উপরে 1 px `border-subtle`।
- Twisty, repo icon, `text-body-strong`-এ নাম, তারপর `text-code` আর `text-secondary`-তে branch, মাঝখান থেকে কাটা।
- কোনো operation চললে তার pill: "Merging", "Rebasing 2 of 5", "Cherry-picking"।
- ডানে একটা সারাংশ: "3 ! · 3 staged · 2 changes"। Hover আর focus-এ তার জায়গায় action আসে: Open in VS Code, Open terminal, ⋯ (Commit this repo only, Open on GitHub, Open in file manager)।
- Repo কোনো operation-এর মাঝপথে থাকলে সারাংশের জায়গায় থাকে link **"Finish on Conflicts →"**।

**Section header** (স্তর 1): twisty, `text-body-strong`-এ নাম ("Merge changes", "Staged changes", "Changes") আর একটা count pill। এর action ডানে বসে আর **সবসময় দেখা যায়**, শুধু hover-এ নয়, কারণ নতুন user শুধু-hover control খুঁজে পান না।

| Section | Action |
|---|---|
| Merge changes | **[Resolve all…]** প্রথম অমীমাংসিত file-এ merge editor খোলে। এখানে **কোনো "+ all" নেই** |
| Staged changes | **[− all]**, tooltip "Unstages all 3 files in app-api. Your edits stay." |
| Changes | **[↶ all]**, tooltip "Discards all changes in app-front, after showing what will be lost." · **[+ all]**, tooltip "Stages all 2 files in app-front." |

**Folder row** (শুধু tree mode-এ): twisty, folder icon, নাম। একটাই child থাকা folder-এর শিকল ছোট করে দেখানো হয় (`src/app/hrm`)।

**File row:**

```text
| 8 pad | indent | 16 icon | 6 | name (text-body) | 6 | folder (text-secondary, 12 px) … | ≥8 | [ 72 px slot ] | 8 | 16 letter | 8 pad |
```

- নাম শেষ থেকে কাটা হয়। Folder কাটা হয় শুরু থেকে ("…/HrmService/Features"), তাই file-এর সবচেয়ে কাছের অংশটা দেখা যায়। Tree mode folder লুকিয়ে রাখে।
- **72 px-এর জায়গা** স্বাভাবিক অবস্থায় `+8 −2` দেখায় (`text-caption`, tabular সংখ্যা, + `status-added`-এ, − `status-deleted`-এ)। Hover, focus বা selection-এ তার বদলে বড়জোর তিনটা 24 px button দেখায়, তাই কিছুই সরে না। Count থাকে tooltip আর accessible name-এ। Count আসার আগে জায়গাটা একটা 32 × 8 px `surface-hover` bar দেখায়, কখনো spinner নয়। Binary file "bin" দেখায়। Conflicted file "6 ⓘ" দেখায় (tooltip "6 conflicts")।
- Status অক্ষরের column: 16 px (§৩.২)।

**প্রতি section-এ row button।** Danger button সবচেয়ে বাঁয়ে বসে, + থেকে দূরে।

| Section | Button, বাঁ থেকে ডানে |
|---|---|
| Changes, tracked file | Discard changes (`undo-2`) · Open file · **Stage** (`plus`) |
| Changes, untracked file (U) | Delete file (`trash-2`) · Open file · **Stage** |
| Staged changes | Open file · **Unstage** (`minus`) |
| Merge changes | Open file · **Resolve** (`git-compare`, merge editor খোলে) · **Mark as resolved** (`check`) |

**Mark as resolved** শুধু তখনই চালু থাকে যখন core-এর marker scan file-এ কোনো conflict marker পায় না, যেমন user VS Code-এ ঠিক করার পরে। না হলে এটা aria-disabled, সাথে "Api.csproj still has conflict markers (first at line 42). Resolve it first."। Conflicted row-এ Space stage করার বদলে merge editor খোলে।

**একাধিক বাছাই** (Shift, Mod): list-এর উপরে একটা 24 px bar আসে: "3 files selected · [+ Stage 3] [− Unstage 3] [↶ Discard 3…]"।

**Filter-এর মিল:** মেলা অক্ষরগুলো `text-body-strong`, সাথে 1 px `accent-indicator` underline। যে repo আর section-এ কিছু মেলে না সেগুলো লুকায়, আর filter চালু থাকার সময় গুটানো section খুলে যায়। Field-এর নিচে একটা caption বলে "12 of 348 files match"। Esc filter মুছে দেয়, আর দ্বিতীয় Esc focus list-এ ফিরিয়ে দেয়।

### ৮.৪ Context menu (CHG-06)

1. Open diff (Enter)
2. Open in editor
3. —
4. Stage / Unstage / Mark as resolved
5. —
6. Copy path · Copy relative path · Open in file manager
7. —
8. **Discard changes…** (`danger` লেখা), বা "Delete untracked file…"

Conflicted file-এর বেলায় item 1 হলো "Resolve in merge editor", আর Discard দেওয়া হয় না।

### ৮.৫ Discard-এর confirmation (SAFE-03)

একটা AlertDialog, 30rem চওড়া, শুরুর focus Cancel-এ। Enter বা Mod+Enter কোনোটাই এটা নিশ্চিত করে না।

> **Discard changes to 2 files in app-front?**
> These edits will be lost. Git doesn't keep a copy of them.
> • `cost-center.service.ts` — 22 added, 4 removed lines
> • `cost-center-list.component.html` — 5 added, 1 removed lines
> [Cancel] [Stash instead] **[Discard 2 files]**

Untracked file-এর বেলায়: "Delete 1 new file? `notes.md` (3.2 KB) has never been committed. It will be deleted from disk."। Button হলো "Delete 1 file"। কয়েকটা repo জুড়ে discard action-flow-এর loss list ব্যবহার করে (§১২.৯)।

### ৮.৬ Commit box (CHG-07, BULK-06)

**Scope picker**, "Commit in [ … ▾ ]", ঠিক করে এক repo না অনেক। কোনো লুকানো mode নেই।

| পরিস্থিতি | Default scope | Primary button |
|---|---|---|
| ঠিক 1টা repo-তে staged file আছে | সেই repo | "Commit app-api" |
| 2 বা তার বেশি repo-তে staged file আছে | "2 repos with staged files" | "Commit 2 repos" |
| Repo header-এ "Commit this repo only" বাছা হয়েছে | সেই repo | "Commit app-front" |
| Scope-এর কোনো repo-তে কিছু staged নেই | যেসব repo-তে change আছে (বা focus থাকা repo) | "Commit 2 files" / "Commit 5 files in 2 repos" (commit-all mode) |

- **Commit-all mode।** Scope-এ কিছু staged না থাকলে চোখে পড়ার মতো সাহায্যকারী লেখা সেটা বলে: "Nothing staged, so all 2 changed files will be committed. [Choose files…]"। **Commit-all শুধু tracked file নেয়।** নতুন (untracked, U) file কখনো চুপচাপ যোগ হয় না: সাহায্যকারী লেখার নিচে তাদের নিজের একটা লাইন থাকে, একটা **টিক না দেওয়া** checkbox সহ যেটা তাদের নাম বলে, "☐ Also add 2 new files: `.env`, `notes.md`" (৩টার বেশি হলে: "`.env`, `notes.md` and 4 more", পুরো তালিকা tooltip-এ)। টিক দিলে সেগুলো শুধু এই commit-এ যোগ হয়, আর preview line ও button সেগুলো গোনে ("Commit 4 files · 2 new")। Button file-এর সংখ্যা বলে। Scope-এর কিছু repo-তে staged file থাকলে শুধু staged file-ই commit হয়, আর যেসব repo-তে কিছু staged নেই সেগুলো preview-তে আসে "Nothing staged · [Include all 3 changes]" হিসেবে। Settings → Git and branches → "Require staging before commit" (default-ভাবে বন্ধ) তাঁদের জন্য commit-all mode বন্ধ করে দেয় যাঁরা stage করতে পছন্দ করেন।
- **Message field।** একাধিক লাইনের, 3 লাইন (60 px) উঁচু, 8 লাইন পর্যন্ত বাড়ে, তারপর scroll করে। আগে থেকে "TK-2636: " দিয়ে ভরা, cursor space-এর পরে। Scope-এর repo-গুলোর ticket আলাদা হলে field খালি দিয়ে শুরু হয়, placeholder "Message for 2 repos (different tickets: TK-2636, TK-2601)"। খসড়াটা restart-এর পরেও প্রতি scope-এ রাখা হয় (UX-09), তাই ব্যর্থ commit-এ কখনো সেটা হারায় না।
- **Preview line** (`text-caption`, `text-secondary`, button-এর উপরে)। এক repo-র বেলায় এই লাইনটাই preview: "Will commit 3 staged files to TK-2636-taosif-Onboarding in app-api."। যে নতুন file যোগ হবে, তাদের নাম সবসময় বলে: "Will commit 4 files to TK-2636-taosif-Onboarding in app-front, including 2 new files: .env, notes.md."। কয়েকটা repo-র বেলায়: "Will commit 5 files in 2 repos. You'll see each repo before it runs."
- **নরম hint, কখনো আটকায় না:** "First line is 84 characters. Under 72 reads better on GitHub."
- **Button**, ডানে সাজানো: [Commit & push] (secondary), তারপর primary commit button, ভেতরে key hint `Ctrl Enter` / `⌘Enter`। Mod+Shift+Enter হলো Commit & push।
- **তৈরি নয়।** Button aria-disabled, আর কারণটা `warning`-এ preview line-এর জায়গা নেয়: "Write what you changed after TK-2636:" · "app-api is in the middle of a merge. Finish it on Conflicts."। Merge, rebase বা cherry-pick-এর মাঝপথে থাকা repo সবসময় scope-এর বাইরে থাকে (SAFE-06)।
- **Protected branch (SAFE-02)।** এক repo: একটা AlertDialog, "app-api is on dev, a protected branch. Usually you'd start a task first.", সাথে [Cancel] [Start a task with these changes] [Commit to dev]। কয়েকটা repo: preview-তে confirmation block।
- **Detached HEAD:** "app-scheduler-api isn't on a branch, so this commit will be easy to lose. [Create a branch here first]"।
- **কয়েকটা repo** ভাগাভাগি করা action flow দিয়ে যায়। প্রতি repo-তে একটা row: "☑ app-api · 3 files → TK-2636-taosif-Onboarding"। Message একবার দেখানো হয়, read-only, আর [Edit] box-এ ফিরিয়ে নিয়ে যায়। Button হলো "Commit 2 repos" বা "Commit & push 2 repos"।
- **ফলাফল।** এক repo: একটা toast, "Committed 3 files to TK-2636-taosif-Onboarding in app-api · 9f3e2a1. Not pushed yet."। Push সহ: "…and pushed to origin."। Hook ব্যর্থ হলে: "Commit stopped: app-front's pre-commit hook failed. Your changes are still there and nothing was committed. [Show Git output]"। Message box-এ থেকে যায়।

### ৮.৭ Keyboard

ui-architecture §১০.৫ খাটে। এখানে যোগ হয়েছে: Mod+Enter commit করে; Mod+Shift+Enter commit আর push করে; Alt+M (macOS-এ ⌃⌥M) focus message field-এ নিয়ে যায়; Mod+Delete (macOS-এ ⌘⌫) Discard-এর confirmation খোলে। শুধু Delete কিছু করে না।

### ৮.৮ State

| State | User কী দেখেন |
|---|---|
| Loading, cache নেই | 150 ms পরে: 3টা skeleton repo header আর 6টা row (স্থির `surface-hover` bar) |
| কোনো change নেই | `icon-xl` `check`। "No changes in 6 repos. Edit files in your editor and they show up here."। Caption "Checked 10 s ago."। [Open in VS Code ▾] [Refresh] |
| Task active, change শুধু তার বাইরে | "No changes in this task's repos. 3 changes in other repos." [Show all repos] |
| কোনো repo নেই | "No repositories in this workspace yet." [Open a folder] |
| Filter-এ কিছু দেখায় না | "No files match "csproj" in 2 repos." [Clear filter] |
| Stage ব্যর্থ (ফিরিয়ে নেওয়া হয়েছে) | Toast: "Couldn't stage Program.cs in app-api: another Git program is using the repo (index.lock). Close it, then try again." [Retry] [Show Git output] |
| Busy repo | Repo header-এ spinner আর "Pushing…"। সেই repo-তে stage, unstage আর discard aria-disabled: "Wait for Push to finish in app-api"। Diff তবুও খোলে |
| Needs review | Repo header "Needs review" আর [Review] দেখায়, কোনো row নেই |
| 5,000 file | অপরিবর্তিত; virtualised (PERF-08) |

## ৯. Diff view (CHG-04)

### ৯.১ Header (64 px, দুই row)

- **Row 1:** একটা status chip (অক্ষর আর শব্দ, "M Modified"), file-এর নাম (`text-body-strong`), folder (`text-secondary`), "· app-api · dev"।
- **Row 2:** তুলনার লেবেল; [Side by side | Inline]; ↑ ↓ সহ "Change 3 of 9" (tooltip F7 / Shift+F7 দেখায়); প্রসঙ্গ অনুযায়ী action **[+ Stage file]**, **[− Unstage file]** বা **[Resolve conflicts]**; [Open in editor]; ⋯ (Copy path, Open in file manager, Show whitespace changes ✓, Wrap lines)।

| Row-এর section | বাঁয়ের pane | ডানের pane |
|---|---|---|
| Changes (tracked) | "Staged / last commit" | "Your working copy" |
| Staged changes | "Last commit (HEAD)" | "Staged" |
| Untracked | — (একটাই pane) | "New file" |

### ৯.২ Body

- **Side by side:** প্রতিটা দিকে একটা line-number gutter (অন্তত 3 অঙ্ক, 32–48 px), একটা 14 px চিহ্নের column, তারপর code। একটা 1 px `border-subtle` রেখা দুই দিককে আলাদা করে। একদম ডানে একটা 10 px overview ruler বসে; তাতে click করলে সেখানে লাফ দেয়। Spacer `diff-spacer` ব্যবহার করে।
- **Inline:** পুরনো আর নতুন line-number-এর একটা করে column (প্রতিটা 40 px), চিহ্নের column, তারপর code।
- **সরু pane:** diff pane 640 px-এর চেয়ে সরু হলে (তখন প্রতিটা দিকে code-এর জন্য প্রায় 270 px, 34টা অক্ষর থাকে), side by side নিজে থেকে inline-এ বদলে যায়, আর toggle-এর tooltip বলে "Inline · not enough room for side by side"। জায়গা হলে মনে রাখা পছন্দটা ফিরে আসে।
- **Context:** 3 লাইন। এর চেয়ে লম্বা অপরিবর্তিত অংশ `surface-raised`-এর উপর একটা 24 px row-এ গুটিয়ে যায়: "⋯ 48 unchanged lines · Show 20 above · Show all · Show 20 below"। প্রতিটা control একটা আসল button।
- Word highlight 2 px radius সহ `diff-*-word` ব্যবহার করে। Side by side-এ wrapping বন্ধ, inline-এ চালু।

### ৯.৩ বিশেষ ক্ষেত্র

প্রতিটা বিশেষ ক্ষেত্র মাঝখানে একটা card, বড়জোর 30rem চওড়া, একটা icon, একটা title আর এক বাক্য সহ। কখনো ফাঁকা pane থাকে না।

| ক্ষেত্র | লেখা | Action |
|---|---|---|
| Binary | "Binary file. GitHeddle can't show its changes as text."। Caption "24.1 KB → 25.3 KB" | [Open in editor] [Open in file manager] |
| শুধু rename | Header R chip সহ `old/Path.cs → new/Path.cs` দেখায়। "Renamed only. The content didn't change." | — |
| Edit সহ rename | একটা 28 px `info-soft` strip, "Renamed from `Services/Old.cs` (92 % similar)", তারপর diff | — |
| শুধু line ending | "Only line endings changed (CRLF → LF). The text is the same."। Caption "This often happens when another editor or OS saved the file." | [Show line endings] [Discard changes…] |
| শুধু whitespace | "Only spaces or tabs changed, on 12 lines." | [Show whitespace changes] |
| শুধু mode | "Only the file permission changed: it's now executable (644 → 755)." | — |
| শুধু encoding | "Only the encoding changed: UTF-16 → UTF-8." | — |
| যোগ বা delete করা file | একটাই pane। Header "New file · 40 lines" বা "Deleted file · 120 lines" | — |
| খুব বড় | "This file is too large to show here (12.4 MB; the limit is 5 MB)." | [Open in editor] · "Change the limit in Settings" |
| Conflicted | "This file has 6 conflicts. Choose what to keep in the merge editor."। Marker কখনো কাঁচা অবস্থায় দেখানো হয় না | **[Resolve conflicts]** |
| Submodule | "Submodule moved from a1b2c3d to e4f5a6b." | — |

### ৯.৪ State

| State | User কী দেখেন |
|---|---|
| কিছু বাছা নেই | "Select a file to see its changes." আর "↑ ↓ move · Space stage · Enter open", OS-এর key সহ |
| Loading | Header-এর row 1 row-এর data থেকে সাথে সাথে render হয়। 150 ms পরে header-এর নিচে একটা 2 px indeterminate `accent-indicator` bar আসে। নতুনটা না আসা পর্যন্ত আগের diff থাকে, তাই দ্রুত তীর চাপলেও কখনো ঝলকায় না |
| Error | "Couldn't load the diff of Program.cs in app-api: the file changed while it was being read." [Try again] [Show Git output] |
| খোলা অবস্থায় file বদলেছে | Diff নিজের জায়গায় refresh হয় আর scroll anchor ধরে রাখে। 1.5 s ধরে একটা "Updated" caption দেখায় |

## ১০. Conflicts screen (CONF-01, CONF-02, CONF-10, CONF-11)

### ১০.১ Layout

একটাই scroll করা column, বড়জোর 60rem চওড়া, মাঝখানে। Merge, rebase বা cherry-pick-এ থাকা প্রতিটা repo একটা করে card পায়। Card কম, তাই list virtualised নয়।

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

### ১০.২ Card-এর গঠন

- `surface-raised`, `radius-lg`, 16 px padding, card-গুলোর মাঝে 12 px।
- **Title:** `text-body-strong`-এ repo-র নাম।
- **Operation-এর বাক্য** (`text-body`):
  - "Merging `TK-2636-taosif-Onboarding` into `dev`"
  - "Rebasing `TK-2636-taosif-Onboarding` onto `dev` · commit 2 of 5: a1b2c3d "Add delete endpoint""
  - "Cherry-picking a1b2c3d "Fix validation" onto `dev`"
- **উৎস**, ডানে `text-secondary`-তে: "Started by Sync with dev · paused" (run-এর link) বা "Started outside GitHeddle"।
- **Progress:** একটা Meter, 4 × 160 px, আর "1 of 3 files resolved"।
- **File row**, 32 px উঁচু (list row-এর চেয়ে উঁচু, কারণ এগুলোই মূল target): `!` badge বা `success`-এ একটা `check`; নাম; `text-secondary`-তে folder; ধরনের একটা শব্দ ("6 conflicts", "Resolved", "Resolved outside GitHeddle", "Deleted on one side", "Binary file"); primary **[Resolve]** (resolve হয়ে গেলে [Open]); CONF-02-এর option সহ একটা ▾ menu, আসল branch-এর নামে:
  - **Use dev for all 6 conflicts**
  - **Use TK-2636-taosif-Onboarding for all 6 conflicts**
  - —
  - Open in external merge tool
  - Open in editor
  - Open in file manager
- **Footer:** বাঁয়ে **[Abort merge…]** (danger-text button); ডানে কারণের caption আর **[Continue merge]** (primary)। লেবেল operation মেনে চলে: "Continue rebase" / "Abort rebase…", "Continue cherry-pick" / "Abort cherry-pick…"।

পুরো file-এর জন্য "Use … for all" row-এ আটকানো একটা popover-এ নিশ্চিত করে: "Use dev's side for all 6 conflicts in Api.csproj? Changes that didn't conflict stay in the file." [Cancel] [Use dev for 6 conflicts]। তারপর file save আর stage হয় (এক file-এর পরিবর্তন, পুরো preview-এর বদলে popover-এ নিশ্চিত করা, §২৬ #32)। এর মানে "প্রতিটা conflict সেই দিক দিয়ে resolve করো", পুরো file checkout নয় (§২৬ দেখুন)।

### ১০.৩ Continue আর Abort

**Continue তৈরি নয়** (aria-disabled, কারণ দেখা যায়): "Resolve 2 more files first." · "Api.csproj is marked resolved but still has conflict markers at line 42." [Open], আর row একটা `warning` "Markers at line 42" দেখায়।

**Protected নয় এমন branch-এ Continue** card থেকেই dialog ছাড়া commit করে (preview-এর নিয়মের একটা ব্যতিক্রম, §২৬ #32)। চাপার আগেই footer-এর caption message দেখায়: "Will commit: Merge branch 'TK-2636-taosif-Onboarding' into feature-x"।

**Protected branch-এ Continue** (SAFE-02), যদি না run-এর preview-তে আগেই নিশ্চিত করা হয়ে থাকে: একটা AlertDialog "Continue the merge in app-api? This creates a merge commit on dev, a protected branch. Nothing is pushed."। এটা default message read-only দেখায় ("Merge branch 'TK-2636-taosif-Onboarding' into dev"), সাথে [Cancel] [Commit merge to dev]।

**Continue-এর পরে:**
- Merge বা cherry-pick: card একটা 48 px success strip হয়ে যায়, "Merge finished in app-api · 9f3e2a1 on dev · not pushed"।
- সেখানে কোনো run pause থাকলে strip যোগ করে "Resume Sync with dev for app-api? [Resume] [Later]"। Resume কখনো স্বয়ংক্রিয় নয়।
- যে rebase আবার থামে: card থেকে যায় আর update হয় ("commit 3 of 5 · 2 new conflicted files"), পরিবর্তনটা announce হয়, আর focus প্রথম নতুন file-এ যায়।

**Abort** একটা AlertDialog খোলে (SAFE-03), focus নিরাপদ button-এ:

> **Abort the merge in app-api?**
> app-api goes back to dev at a1b2c3d, as it was before the merge.
> You'll lose: your choices in 1 resolved file (DeleteOnboardingTests.cs).
> Uncommitted edits from before the merge may not come back: `Program.cs`.
> [Keep resolving] [Stash them first] **[Abort merge in app-api]**

- **Merge-এর আগের edit।** Operation শুরুর সময় যেসব file-এ uncommitted changes ছিল, core সেগুলো জানায় (core-এর নতুন data, §২৬)। থাকলে loss list তাদের নাম বলে, উপরের মতো, আর [Stash them first] শুধু সেই file-গুলো `githeddle/before-abort` হিসেবে stash করে, তারপর abort করে। Merge-এর মাঝখানে Git সেগুলো stash করতে না পারলে core dialog খোলার আগেই সেটা বলে, আর button-এ লেখা থাকে [Save copies first], যেটা সেগুলো `.git/githeddle/backup/<time>/`-এ copy করে আর ফলাফলে সেই folder-এর নাম দেয়। এমন কোনো file না থাকলে লাইন বা button কোনোটাই আসে না।

Abort কোনো pause হওয়া run-এর অংশ হলে যোগ করে "Sync with dev will stop for app-api."

**Continue all** নিচে একটা 56 px আটকানো bar হিসেবে আসে, যখন 2 বা তার বেশি card পুরোপুরি resolve হয়ে যায়: "All 2 repos are resolved. [Continue all · 2 repos]"। এটা ভাগাভাগি করা preview দিয়ে যায়, প্রতিটা repo-র commit message আর একটা protected-branch confirmation block সহ।

### ১০.৪ State

| State | User কী দেখেন |
|---|---|
| খালি | `icon-xl` `git-compare`। "No conflicts. Repos that stop in a merge or rebase show up here." [Go to repositories] |
| সব শেষ | "All conflicts resolved. 2 merges finished." [Back to the run] (যদি থাকে) [Go to Changes] |
| Loading | 150 ms পরে একটা skeleton card |
| Busy | Continue বা Abort-এর সময় footer-এর button busy ("Continuing…") আর file row disabled |
| Error | Card-এর ভেতরে inline: "Continue stopped: app-api's pre-commit hook failed. Fix what it reports, then Continue again." [Show Git output] |

## ১১. Merge editor (CONF-03..09)

### ১১.১ Focus mode আর মাপ

Editor খুললে sidebar rail-এ গুটিয়ে যায় আর details panel লুকায়, top আর bottom bar থাকে। বের হলে আগের layout ফিরে আসে।

| অংশ | উচ্চতা | Content |
|---|---|---|
| File bar | 40 px | [← Conflicts] · `app-api / Api/Api.csproj` · operation-এর বাক্য · ডানে: "File 1 of 3 in app-api · 6 conflicts in this repo" |
| Conflict toolbar | 36 px | "Conflict 2 of 6" · [‹ Previous] [Next ›] · "4 unresolved" chip (`merge-unresolved`-এর রং) · [?] · ⋯ (Open in external merge tool, Open in editor, Show Base: disabled "Coming in v0.2", CONF-12) |
| Pane title bar | প্রতিটা 28 px | দিকের edge রঙে উপরে 3 px border |
| উপরের pane | বাকি জায়গার 55 %, min 100 px | 50 / 50, 30–70 % পর্যন্ত মাপ বদলানো যায় |
| আড়াআড়ি splitter | 6 px | Key এক লাইন (20 px) সরায়; মনে রাখা হয় |
| Result | 45 %, min 100 px | |
| Footer | 48 px | |

1024 × 640-এ বাকি জায়গা 640 − 40 − 24 − 76 − 48 = 452 px। দুটো title bar আর splitter বাদ দিলে: 390 px, তাই উপরের pane-গুলো প্রায় 10 লাইন আর Result প্রায় 8 লাইন পায়। Window 720 px-এর চেয়ে খাটো হলে file bar আর conflict toolbar মিলে একটা 40 px row হয়, যাতে 36 px ফেরত পাওয়া যায়।

আড়াআড়িভাবে, ন্যূনতম window-এ উপরের প্রতিটা pane 488 px: line number 40, checkbox gutter 28, region stripe 4, overview ruler 10, **code 406 px (প্রায় 52টা অক্ষর)**। কার্যকর চওড়া 720 px পর্যন্ত side by side থাকে; তার নিচে (শুধু zoom-এ পৌঁছানো যায়) উপরের pane-গুলো Result-এর উপরে tab হয়ে যায় "Incoming · Current"।

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

### ১১.২ Pane-এর title: আসল নাম আর সহজ ভূমিকা

প্রতিটা title `text-section-title`-এ লেবেল, `text-code`-এ আসল নাম, আর `text-caption` `text-secondary`-তে একটা দ্বিতীয় লাইন দেখায়, যেটা বলে সেই দিকের মানে কী।

| Operation | Incoming title / ভূমিকা | Current title / ভূমিকা |
|---|---|---|
| Merge | Incoming · `TK-2636-taosif-Onboarding` / "Changes being merged in" | Current · `dev` / "The branch you're on" |
| Merge task into… (`dev`-এ) | Merge-এর মতো, সাথে একটা "Your task" tag | Merge-এর মতো |
| Rebase | Incoming · `a1b2c3d Add delete endpoint` / "Your commit, being replayed" + "Your commit" tag | Current · onto `dev` / "What you're rebasing onto, plus your commits already replayed" |
| Cherry-pick | Incoming · `a1b2c3d Fix validation` / "The commit being picked" | Current · `dev` / "The branch you're on" |

"Your task" / "Your commit" tag হলো একটা 18 px `info-soft` pill, দেখানো হয় যখন core বলে যে সেই দিকটা active task-এর branch বা user-এর নিজের commit। Ours আর theirs-এর মানে না জেনেও নতুন user সবসময় "আমারটা" খুঁজে পান। Rebase-এর সময় file bar বলে "Rebasing `TK-2636-taosif-Onboarding` onto `dev`: commit 2 of 5"।

### ১১.৩ উপরের pane

| Region | চেহারা |
|---|---|
| অপরিবর্তিত | সাধারণ `surface-sunken` |
| Conflict, সিদ্ধান্ত হয়নি | দিকের bg, উপরে আর নিচে 1 px রেখা আর তার edge রঙে একটা 4 px stripe |
| Conflict, এই দিকে টিক | সিদ্ধান্ত না হওয়ার মতো, সাথে একটা টিক দেওয়া checkbox |
| Conflict, শুধু অন্য দিকে টিক | লেখা `text-secondary`, background সাধারণ surface-এ নামানো, শুধু stripe থাকে ("not used")। Checkbox click করা যায় |
| এই দিক থেকে স্বয়ংক্রিয়ভাবে বসানো | `merge-auto-applied` bg, এই দিকের edge রঙে stripe, gutter-এর tooltip "Applied automatically, no conflict" |
| Active conflict | তিনটা pane-এই region-এর চারপাশে 2 px `merge-active` outline। Navigation এটাকে উপর থেকে এক-তৃতীয়াংশ নিচে scroll করে আনে |

**Checkbox** (CONF-04):
- Region-এর প্রথম লাইনে 28 px gutter-এর মাঝখানে একটা 16 px box। Hit target পুরো 28 × 20 px cell। টিক দেওয়া: দিকের edge রঙের fill, `indicator-glyph`-এ check (light-এ সাদা, dark-এ `#131519`, কারণ dark edge হালকা) আর একটা 1 px `border-strong` outline।
- **টিকের ক্রম।** দুই দিকেই টিক দেওয়া হলে প্রতিটা box 12 px লেখা সহ একটা 16 px order badge পায় ("1", "2"), আর দ্বিতীয়বার টিক দেওয়া দিকের gutter-এ একটা "Swap order" link আসে।
- **হাতে edit করা।** Result-এ region হাতে edit করা হলে দুটো box-ই মিশ্র state (–) দেখায়, tooltip "You edited this conflict in Result. Ticking a side replaces your edit."
- **Accessible name:** "Take incoming for conflict 2 of 6, lines 14 to 16, TK-2636-taosif-Onboarding"; মিশ্র হলে যোগ হয় ", edited by hand"।

Spacer `diff-spacer` ব্যবহার করে। উপরের pane-গুলো একটা খাড়া আর একটা আড়াআড়ি scroll offset ভাগ করে নেয়।

### ১১.৪ Result pane

- **Title:** "Result · Api.csproj · editable", ডানে "Saved into app-api when you accept" (`text-caption`)।
- **Gutter:** line number (40 px) আর একটা 14 px উৎসের column, প্রতিটা region-এর প্রথম লাইনে একটা অক্ষর সহ: **I** (incoming edge রং), **C** (current edge রং), হাতে edit-এর জন্য একটা `pencil` icon, অপরিবর্তিত লাইনে কিছু নয়। উৎস কখনো রঙের উপর নির্ভর করে না।
- **Region:** স্বয়ংক্রিয়ভাবে বসানো `merge-auto-applied`-এ; resolve হওয়া conflict বেছে নেওয়া দিকের রঙে বাঁয়ে 3 px stripe সহ (দুটোই হলে অর্ধেক-অর্ধেক ভাগ); হাতে edit করা `merge-edited` bg-এ 3 px stripe সহ।
- **অমীমাংসিত placeholder** (একটা block widget, কখনো লেখা নয়): 44 px উঁচু, 8 px ভেতরে, 1 px dashed `merge-unresolved` edge, `merge-unresolved` fill। Content "Unresolved conflict 3 of 6"। এটা active conflict হলে border হয় 2 px solid, আর যোগ হয় "Tick a side above, or:" সাথে তিনটা ছোট button **[Use incoming] [Use current] [Use both]**, Tab দিয়ে পৌঁছানো যায়।
- **Resolve হওয়া conflict-এর ভেতরে**, region-এর উপরে ডানে একটা hover/focus action: "Reset to unresolved" (undo করা যায়)।
- হাতে edit-এর উপর একটা দিকে টিক দিলে: toast "Replaced your edit in conflict 3. [Undo]"।

### ১১.৫ Footer (48 px)

- **বাঁয়ে:** [Take all incoming] [Take all current] (secondary)। Tooltip branch-এর নাম বলে: "Uses TK-2636-taosif-Onboarding's side for every conflict in this file. Changes that didn't conflict stay."। কিছু conflict-এর সিদ্ধান্ত আগেই হয়ে থাকলে বা হাতে edit হয়ে থাকলে একটা popover জিজ্ঞেস করে: "This replaces 2 choices you already made, including 1 hand edit." [Replace all 6] [Only the 4 unresolved]। যেকোনোটা undo করা যায় এমন এক ধাপ (CONF-08)।
- **মাঝে:** "4 of 6 conflicts left", বা `success`-এ `check` সহ "All conflicts resolved. Check Result, then accept."।
- **ডানে:** **[Accept merge]** (primary, ভেতরে key hint), নিচে caption "Saves this file and opens the next"। Conflict বাকি থাকা পর্যন্ত এটা aria-disabled, দৃশ্যমান কারণ "Resolve 4 more conflicts first."; চাপলে (বা Mod+S) প্রথম অমীমাংসিত conflict-এ লাফ দেয় আর তার placeholder-এর outline দুবার ঝলকায় (প্রতিবার ≤ 150 ms; reduced motion-এ নেই)। Merge, rebase আর cherry-pick-এ লেবেল একই।
- **Accept-এর পরে:** toast "Api.csproj resolved and staged. Opening DeleteOnboarding.cs (2 of 3)."। পরের file একই view-তে খোলে। শেষ repo-র শেষ file-এর পরে editor Conflicts screen-এ ফিরে যায়, focus সেই repo-র [Continue merge]-এ।
- **Marker প্রত্যাখ্যান (CONF-11):** Result-এর উপর জুড়ে একটা `danger-soft` strip: "Not saved: line 42 still has a conflict marker (<<<<<<<). Remove it, then accept again." [Go to line 42]।

### ১১.৬ বিশেষ file

Pane-গুলোর জায়গায় মাঝখানে একটা card আসে:

- **Delete / modify:** "TK-2636-taosif-Onboarding deleted this file. dev changed it (12 lines)."। দুটো choice card (RadioGroup, 200 × 88 px): "Keep the file · dev's version" / "Delete the file"। তারপর [Accept merge]।
- **Binary, বা কঠোর সীমার বেশি:** "Both sides changed this binary file. Choose one." [Use incoming · 24.1 KB] [Use current · 25.3 KB] [Open in external merge tool]।

### ১১.৭ State

| State | User কী দেখেন |
|---|---|
| Loading | File bar আর pane title সাথে সাথে render হয়; 150 ms পরে line skeleton। 500 ms-এর মধ্যে তৈরি (PERF-06) |
| Busy (save হচ্ছে) | Accept busy ("Saving…") আর এর মধ্যে Result read-only |
| Load করতে error | "Couldn't open Api.csproj in app-api: the file changed on disk." [Reload] [Open in external merge tool] [Show Git output] |
| খোলা অবস্থায় বাইরে বদলেছে | Non-modal strip: "Api.csproj changed on disk (maybe in VS Code)." [Reload and lose my choices] [Keep mine] |
| পরিবর্তন রেখে বের হওয়া | "Leave Api.csproj? Your 2 choices aren't saved yet." [Keep editing] [Discard my changes] |

### ১১.৮ নতুন user-কে conflict-এর মধ্য দিয়ে নিয়ে যাওয়া

1. **ফলাফল সোজা কথায় বলে**, pause হিসেবে, failure হিসেবে নয়: "app-api: 3 files need you to choose what to keep. [Resolve conflicts]"। Sidebar দেখায় "Conflicts 1"।
2. **Conflicts screen** লুকানো না পর্যন্ত "What's a conflict?" box দেখায়, operation-টা কথায়, একটা progress meter আর প্রতি file-এ একটা স্পষ্ট [Resolve]। Abort সবসময় দেখা যায়, তার ফলাফল খুলে বলা থাকে।
3. **Coach strip**, প্রতিটা ধরনের operation-এ প্রথমবার editor খোলার সময়: toolbar-এর নিচে একটা 32 px `info-soft` strip। এর কথাগুলো operation মেনে চলে, pane title-এর মতো (§১১.২):
   - Merge: "① Top left: the changes coming in. ② Top right: what's on dev now. ③ Bottom: the file that will be saved. For each conflict, tick the side to keep, or both. [Got it]"
   - Rebase: "① Top left: your commit, being replayed. ② Top right: dev, plus your commits already replayed. ③ Bottom: the file that will be saved. For each conflict, tick the side to keep, or both. [Got it]"
   - Cherry-pick: "① Top left: the commit you're picking. ② Top right: what's on dev now. ③ Bottom: the file that will be saved. …"

   এই সময় pane title-এ ①②③ badge দেখায়: 16 px বৃত্ত, `info-soft`-এর উপর `info`-এ 12 px লেখা, সাথে 1 px `info` ring (dark-এ `info`-এর উপর সাদা ব্যর্থ হয়)। উচ্চতা 720 px-এর নিচে হলে এর বদলে একবারের একটা popover।
4. **Editor conflict 1-এ খোলে**, active outline সহ। Placeholder-এর তিনটা "Use…" button সেই user-দের একটা পথ দেয়, যাঁরা checkbox খেয়াল করেন না।
5. **প্রতিটা সিদ্ধান্তের পরে** counter update হয় আর announce হয় ("Conflict 1 resolved. 5 left.")। Active conflict resolve হয়ে গেলে আর অন্যগুলো বাকি থাকলে [Next ›] primary হয়ে যায়। কোনো স্বয়ংক্রিয় লাফ নেই।
6. **কিছু বাকি না থাকলে** footer `success` হয়ে যায় আর announcer বলে "All 6 conflicts resolved. Press Ctrl+S to accept."
7. **[?]** একটা 20rem popover খোলে: "Not sure? Tick both, then fix Result by hand." · "Everything in grey shading was combined automatically." · "Changed your mind? Ctrl+Z."
8. **শেষ:** Accept পরের file-এ যায়; শেষটার পরে user message দেখানো অবস্থায় [Continue merge]-এ পৌঁছান; ফলাফল "Merge finished · not pushed", সাথে পরের ধাপের প্রস্তাব (Resume run, বা Push)।

## ১২. Action flow (preview → run → result)

নিয়মগুলো ঠিক করে ui-architecture §৭। এই section ঠিক করে চেহারা, কথা আর key। প্রতিটা পরিবর্তন এর মধ্য দিয়ে যায়; read-only action (Fetch) এটা বাদ দেয়। একমাত্র ব্যতিক্রমগুলোর তালিকা §২৬ #14 আর #32-এ।

### ১২.১ Dialog-এর গঠন

`scrim`-এর উপর একটা React Aria Modal + Dialog, `surface-overlay`, `radius-lg`, `elevation-2`।

| অংশ | মাপ | Content |
|---|---|---|
| চওড়া | `min(55rem, 100vw − 4rem)`; Create pull requests `min(64rem, 100vw − 4rem)` | |
| উচ্চতা | content অনুযায়ী, বড়জোর `min(80vh, 45rem)`; body scroll করে | Header, confirmation block আর footer কখনো scroll হয়ে সরে যায় না |
| Header | 3rem, দুই পাশে `space-5` padding | Action আর count সহ title · target chip · × |
| Input | ঐচ্ছিক | Action-এর যে field দরকার (Start task, Commit, Create pull requests) |
| Toolbar | 2.25rem | Select all/none checkbox, "2 of 2 selected", "Choose for all: [Stash all 2] [Skip all 2]", 12টা repo থেকে একটা filter field |
| Body | preview row (24 px আর sub-line) | |
| Confirmation block | দরকার হলে footer-এর উপরে আটকানো | §১২.৮ |
| Footer | 3.5rem | বাঁয়ে: অবস্থার বাক্য। ডানে: secondary button, তারপর primary |

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

**Footer-এর অবস্থার বাক্য।** এটা সবসময় primary button-এর অবস্থা কথায় ব্যাখ্যা করে, কারণ disabled button-এর tooltip keyboard আর screen-reader user-দের নাগালের বাইরে: "2 repos will change." · "Choose Stash or Skip for app-front." · "Tick the confirmation to push to dev." · "Nothing to do: all 4 repos are up to date." (primary হয়ে যায় [Close])।

### ১২.২ Input section

Start task, Switch task, Add repos, Merge task into…, §৫.৯-এর bulk operation আর Create pull requests-এর parameter দরকার। সেগুলো একই dialog-এ preview-এর উপরে থাকে, আর শেষ পরিবর্তনের 300 ms পরে core নতুন করে plan করে। Preview কখনো খালি হয়ে ঝলকায় না: আগেরটা কম জোর দিয়ে "Updating…" সহ থেকে যায়। এতে এই flow-গুলো ৩ click-এর মধ্যে থাকে (UX-07)।

### ১২.৩ Loading (PERF-03)

- Click-এর একই frame-এ dialog খোলে। Target UI-তে জানা, তাই **repo row সাথে সাথে render হয়**, প্রত্যেকটায় একটা spinner আর "Checking…"।
- Footer: "Checking 4 repos…"; primary তৈরি নয়।
- Plan আসার সাথে সাথে row ভরে ওঠে (core প্রতি repo-তে stream করলে; না হলে একসাথে সব, §২৫ দেখুন)।
- 3 s পরেও load হতে থাকা row core-এর কারণ সহ বলে "Still checking: fetching from origin…"।

### ১২.৪ Preview row

Grid: `[2rem checkbox][1.25rem state icon][11rem repo, ellipsis][1fr plan][auto choice]`।

| অংশ | বিবরণ |
|---|---|
| Checkbox | টিক তুলে দিলে plan-এর জায়গায় একটা `minus` icon-এর পরে `text-secondary`-তে "Left out" আসে। `text-disabled` শুধু নিষ্ক্রিয় control-এর জন্য (§৩.৩) |
| State icon | `circle-dot` plan তৈরি (`text-secondary`) · `triangle-alert` মনোযোগ দরকার (`warning`) · `octagon-x` আটকে আছে (`danger`) · `minus` কিছু করার নেই |
| Repo | `text-body-strong`; current branch `text-code`-এ শুধু pipeline preview-তে |
| Plan | Git-এর ক্রিয়াপদ সহ এক সহজ বাক্য, branch-এর নাম `text-code`-এ: "Merge origin/dev (5 new commits) into TK-2636-taosif-Onboarding" |
| Sub-line | ঐচ্ছিক, `text-caption` `text-secondary`, বড়জোর 2 লাইন, তারপর "Show all 14 files" |
| Choice | Inline radio group (§১২.৫) |

**ক্রম:** যে row-এ সিদ্ধান্ত দরকার; যে row চলবে; একটা গুটানো "Nothing to do (3)" Disclosure (টিক নেই, কারণ সহ "Already up to date", "No commits ahead of dev"); আটকে থাকা row-এর জন্য একটা গুটানো "Skipped (1)" Disclosure (disabled checkbox, কারণ, আর ঠিক করার একটা link যেমন [Review repo] বা [Open conflicts])। "Show Git commands" প্রতি repo-র হুবহু command-এর তালিকা দেয় (স্বচ্ছতা); এর খোলা অবস্থা মনে রাখা হয়।

**Preview error।** যে repo-র plan ব্যর্থ হয়েছে সেটা `octagon-x` আর তিন অংশের একটা message দেখায়: "Couldn't check app-report-api: origin didn't answer within 120 s. Retry or leave it out." [Retry check]। এতে টিক থাকে না; বাকিগুলো ব্যবহার করা যায়।

**পুরনো preview (SAFE-07, UI-র অংশ)।** Dialog খোলা অবস্থায় preview করা কোনো repo বদলালে row-গুলোর উপরে একটা `warning` strip আসে: "app-front changed since this preview (new commit). [Refresh preview]"। Primary চালু থাকে; আসল পাহারাদার core-এর preflight।

### ১২.৫ Inline choice (SAFE-04, TASK-02)

- Segmented control হিসেবে আঁকা একটা React Aria RadioGroup, 24 px, লেবেল যেমন `Stash` · `Skip`। **কিছুই আগে থেকে বাছা নয়।** সিদ্ধান্ত না হওয়া পর্যন্ত row `warning-soft`-এ রাঙানো থাকে।
- Stash-এর পরে: "Stash as githeddle/TK-2636 · you can bring it back when you switch back"। Skip-এর পরে: row নিজের জায়গাতেই skipped row হয়ে যায় (সরানো হয় না, তাই focus লাফায় না)।
- "Choose for all" সিদ্ধান্ত বাকি থাকা প্রতিটা row-এ খাটে, লেবেলে count সহ।
- SAFE-04-এর "Cancel" হলো dialog-এর [Cancel]; প্রতি row-এ আলাদা Cancel নেই।
- একই control ব্যবহার হয়: Take them along / Stash / Skip (Start task), Switch to it / Skip, Merge origin in / Skip (pull-এ diverged), Include all 3 changes / Skip (commit)।

### ১২.৬ চলছে

1. একই frame-এ primary চাপা আর busy দেখায়।
2. Core একটা job ID ফেরত দেয়। Dialog fade হয়ে চলে যায় (80 ms) আর focus যে control এটা খুলেছিল সেখানে ফিরে যায়।
3. Bottom bar-এ একটা job chip আসে (§৪.৯)। Announcer বলে "Push started in 4 repos."

Progress (job panel-এ):

```text
Push · Target: Task TK-2636 · 4 repos · 6.1 s                         [Cancel remaining (2)]
  ✓ app-api            Pushed 3 commits to origin/TK-2636-taosif-Onboarding     1.2 s
  ⟳ app-front          Pushing… (remote: Resolving deltas 40%)                  4.0 s
  ○ app-report-api     Waiting for a free slot
  ○ app-scheduler-api  Waiting for a free slot
```

- [Cancel remaining (n)], tooltip "Stops repos that haven't started. Repos that are running finish their current Git command, so nothing is cut off midway."। চাপার পরে: "Cancelling: 1 still running…"।
- Git-এর progress লাইন `text-caption`-এ দেখায়, এক লাইনে কাটা।
- কোনো write-এ 60 s পরে: "Still running (a hook may be working). You can wait or cancel the remaining repos."
- Row live sort হয়: চলছে, অপেক্ষায়, তারপর শেষ হওয়ার ক্রমে শেষ হওয়াগুলো।

### ১২.৭ ফলাফল

```text
Push finished in 4.2 s · 2 succeeded · 1 skipped · 1 failed             [Retry 1 failed]  [Dismiss]
  ✗ app-front     Push rejected: origin/TK-2636-taosif-Onboarding has commits you don't have.
                  Pull first, then push again.
                  [Pull app-front]  [Show Git output]  [Open terminal]  [Show in activity log]
  – app-report-api  Skipped: nothing to push.
  ✓ app-api        Pushed 3 commits.
  ✓ app-scheduler-api  Pushed 1 commit.
```

- ক্রম: failed, paused, skipped, done। Count-এর লাইনটাই একমাত্র সারাংশ।
- **Conflict মানে pause, কখনো failed নয়**: "⏸ app-api: 3 files need you to choose what to keep. [Resolve conflicts]"। "Retry failed" শুধু আসল failure গোনে।
- Failure row: `x` icon, repo (bold), কী-আর-কোথায়-এর লাইন, পরের ধাপের লাইন, তারপর button। প্রথম button হলো core যে সমাধান জানায় (Pull app-front, Open conflicts, Sign in to GitHub); এটা একটা নতুন preview খোলে আর কখনো সরাসরি চালায় না।
- **Show Git output** একটা `surface-sunken` `text-code` block খুলে দেয় (বড়জোর 12 লাইন, তারপর scroll করে): command, exit code, সময়, stdout আর stderr, control character escape করা (UN-05), আর [Copy]।
- **Retry n failed** শুধু সেই repo-গুলো নিয়ে একটা নতুন preview খোলে।
- **কী বদলেছে** (UX-10): cancel বা আংশিক failure-এর পরে একটা box: "Changed: app-api, app-scheduler-api (pushed). Not changed: app-front (failed), app-report-api (nothing to push)."। v0.1-এ activity log-ও প্রতিটা repo-র আগের আর পরের HEAD দেখায়, "Copy command to go back" সহ।
- **Undo** (BULK-09) শুধু v0.2-এ, একটা নির্দিষ্ট লেবেল সহ ("Undo: delete 2 new branches and switch back"), আর push-এর জন্য কখনো নয়।
- **Focus:** user ফলাফল খুললে focus যায় প্রথম failure বা pause হওয়া repo-র প্রথম button-এ। পেছনে শেষ হওয়া কোনো ফলাফল কখনো focus কেড়ে নেয় না।
- শেষ হলে: একটা toast ("Push finished: 2 succeeded, 1 skipped, 1 failed. [View result]") আর announcement হিসেবে একই বাক্য। Toast, announcement আর count-এর লাইন সবসময় একই count ব্যবহার করে। 0 failure হলে Retry button একেবারেই নেই (কখনো "Retry 0 failed" নয়)।

### ১২.৮ Protected-branch আর force-with-lease block (SAFE-01, SAFE-02, PIPE-05)

প্রতি preview-তে একটা block, footer-এর উপরে আটকানো। `warning-soft`, 1 px `warning` border, `radius-lg`, 12 px padding, `shield` icon। Force with lease থাকলে border `danger` আর icon `triangle-alert`।

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

- প্রতি ধরনের ঝুঁকিতে একটা checkbox (বড়জোর 2টা)। লেবেল হুবহু action আর count আবার বলে; কখনো "I understand" নয়।
- সবগুলোতে টিক না দেওয়া পর্যন্ত primary তৈরি থাকে না; footer বলে "Tick the confirmation to push to dev."
- প্রতিটা লাইন তার repo row-এর সাথে link করা। Repo থেকে টিক তুলে দিলে block live update হয়; কোনো ঝুঁকিপূর্ণ row না থাকলে block আর তার টিক চলে যায়।
- নিশ্চিত করতে কিছু টাইপ করতে হয় না। সাধারণ `--force` কোথাও কখনো দেওয়া হয় না।

### ১২.৯ Destructive confirmation (SAFE-03)

ব্যবহার হয় discard, unmerged commit সহ branch delete, resolve হওয়া file সহ merge abort, stop-and-abort, আর পরে reset-এর জন্য। Flow-এ row-গুলো `danger-soft`-এর উপর একটা **loss list** হয়ে যায়:

```text
Discard changes · 2 repos · 3 files
  app-front   cost-center.service.ts           modified   22 added, 4 removed lines lost
              cost-center-list.component.html  modified   5 added, 1 removed lines lost
  app-api     notes-draft.md                   untracked  whole file deleted (4 KB)
  Discarded changes can't be recovered. Git doesn't keep a copy of them.
                                    [Cancel]  [Stash instead]  [Discard 3 files]
```

- Primary `danger-action` ব্যবহার করে আর ক্ষতির নাম বলে: "Discard 3 files", "Delete branch with 4 unmerged commits"।
- যেখানেই uncommitted changes হারাবে, সেখানে [Stash instead] দেওয়া হয়।
- শুরুর focus Cancel-এ। **Enter বা Mod+Enter কোনোটাই নিশ্চিত করে না**: destructive button-এ click লাগে, বা তাতে focus থাকা অবস্থায় Space/Enter।
- Delete branch প্রতিটা unmerged commit-এর তালিকা দেয় (ছোট hash + subject, 10টা পর্যন্ত, তারপর "and 6 more"): "These commits exist only on this branch."

### ১২.১০ Dialog-এর key

- শুরুর focus: প্রথম না-নেওয়া সিদ্ধান্ত; না থাকলে non-destructive action-এর বেলায় primary; destructive-এর বেলায় Cancel।
- **শুধু Enter কখনো dialog submit করে না**; এটা শুধু focus থাকা control চালু করে।
- **Mod+Enter** non-destructive action চালায়, block-এ টিক দেওয়ার পরে protected action-ও। Destructive dialog-এ এটা কিছু করে না।
- কিছু শুরু না হওয়া পর্যন্ত Esc = Cancel। Esc কখনো চলমান job বাতিল করে না।

### ১২.১১ লেখার সময় বন্ধ করা

AlertDialog "2 Git commands are still writing" / "app-api and app-front are pushing." [Keep GitHeddle open] [Quit when they finish] (default) [Quit now] (`danger-action`, নিচের লেখা "They may stop midway. GitHeddle checks these repos next time it starts.")।

## ১৩. Pipeline (PIPE-01..11)

### ১৩.১ তালিকা

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

- ধাপের সারাংশ `text-secondary`, ellipsis দিয়ে কাটা।
- ⋯: Edit, Duplicate, Rename, Delete…, আর ready-made-গুলোর জন্য "Copy to My pipelines"। Delete: "Delete pipeline "Update from main → dev". Runs that already happened stay in the activity log." [Cancel] [Delete pipeline]।
- উৎসের badge: "Ready-made", আর v0.2-এ "Team"। `radius-sm`, `text-caption`, neutral।
- শেষ run: v0.1-এ journal-এ শুধু সর্বশেষ run রাখা হয় (PIPE-14 হলো P1)।
- খালি (আমার কোনোটা নেই): "No pipelines of your own yet. Save steps you repeat every day and run them on many repos at once. Pipelines run on this computer and don't build or deploy anything." [New pipeline] [Copy a ready-made one]।

### ১৩.২ Ready-made আর built-in pipeline

| নাম | ধাপ |
|---|---|
| Update from main | Fetch → Update from `main` (merge) → Push `{current}` |
| Update from main, merge into dev | Fetch → Update from `main` → Push → Integrate into `dev` (merge, push চালু) |
| Update from main, pull request to dev | Fetch → Update from `main` → Push → Integrate into `dev` (pull request) |
| Sync with base (task action) | Fetch → Update from `{base}` (merge, বা setting অনুযায়ী rebase) → Push |
| Merge task into… (task action) | Fetch → `{task}`-কে বেছে নেওয়া branch-এ Integrate (merge, push চালু) → Back to start branch |

Ready-made pipeline read-only খোলে, banner সহ "Ready-made pipeline. Duplicate it to change the steps." [Duplicate]। চালানোর প্রবেশপথ: sidebar-এর ▶, [Run pipeline ▾] (5টা সাম্প্রতিক + "All pipelines…"), Task screen, palette। সবগুলোই preview খোলে।

### ১৩.৩ Editor

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

- ধাপের row 2.5rem, দরকার হলে sub-line সহ। Column: drag handle 1rem · নম্বর 1.5rem · ধাপের ধরন 10rem · field 1fr · action 5.5rem (24 px icon button, নাম "Move step 2 up", "Move step 2 down", "Remove step 2")। Alt+↑ / Alt+↓ (⌥↑ / ⌥↓) focus থাকা ধাপ সরায়, announce হয় "Moved Push to position 2 of 4"। Delete একটা Undo toast সহ focus থাকা ধাপ সরিয়ে দেয়।
- **Add step ▾** menu-র item, এক লাইনের বর্ণনা সহ: Fetch — "Downloads new commits from origin. Changes no branch." · Update from branch — "Brings another branch into the current one." · Push — "Sends the current branch to origin." · Switch branch — "Moves the repo to another branch." · Integrate into branch — "Brings the current branch into another one by merge, rebase or pull request." · Wait for confirmation — "Pauses every repo here until you click Continue."
- **Variable (PIPE-04)।** Branch field একটা ComboBox; `{` টাইপ করলে বা খুললে প্রথমে একটা "Variables" section দেখায়: `{current}` "the branch each repo is on when the run starts", `{base}` "each repo's base branch, usually dev", `{task}` "the active task's branch"। বেছে নেওয়া variable field-এর ভেতরে একটা chip (`info-soft`, `text-code`, `radius-sm`, 20 px, ×), পাশে তার মানে। Hover বা focus দেখায় এখন সেটা কী হয়: "app-api → dev, app-front → dev, app-report-api → main"। কোনো active task ছাড়া `{task}`: "No active task. {task} needs one when the pipeline runs."
- **Method** select: merge · rebase · pull request, তালিকার ভেতরে প্রত্যেকটার বর্ণনা সহ। Rebase যোগ করে "Rebase rewrites the current branch. If it's already on origin, the push needs force with lease, which you confirm when you run."। Pull request দেখায় Draft, Reviewers আর Title `{ticket}: {title}`।
- Wait for confirmation-এ আছে "Message to show" (placeholder "Check CI before merging into dev")।
- একটা Disclosure-এ ধাপের option (PIPE-11, P1): "Skip if there's nothing to do", "Stop this repo if the step fails"।
- **যাচাই:** অবৈধ ধাপ একটা 3 px `danger` বাঁ border আর একটা inline message পায় ("Choose a branch for step 2.")। [Save] চালু থাকে; সমস্যা থাকলে এটা একটা খসড়া save করে আর ধাপগুলোর উপরে সেগুলোর তালিকা দেয়: "2 problems: step 2 has no branch; step 4 integrates into its own branch."। ঠিক না হওয়া পর্যন্ত [Run…] তৈরি নয়।
- Save না করা edit রেখে বের হলে: "You have unsaved changes to "Update from main → dev"." [Keep editing] [Discard changes] [Save]।
- কোনো ধাপ নেই: "Add the first step. Steps run in order in each repo; repos run side by side." [+ Add step]।

### ১৩.৪ Pipeline preview

Grid body সহ ভাগাভাগি করা dialog: row হলো repo, column হলো ধাপ, cell পরিকল্পিত ফলাফল কথায় দেখায় ("5 new commits", "Nothing to do", "Protected: dev")। এটা run grid-এর জ্যামিতি ব্যবহার করে, তাই user একটাই ছবি শেখেন। Confirmation block এর নিচে বসে। চওড়া pipeline 56rem dialog ব্যবহার করে।

### ১৩.৫ Run grid

একটা centre view (Pipelines → run), grid mode-এ React Aria Table।

```text
Update from main, merge into dev · Task TK-2636 · started 10:42 · 1 min 12 s    1 done · 1 paused   [Cancel remaining]
                 │ Fetch     │ Update from main │ Push       │ Integrate into dev │ Back to start │
 app-front  ✓    │ ✓ Done    │ ✓ Merged         │ ✓ Pushed   │ ✓ Merged, pushed   │ ✓ Done        │
 app-api    ⏸    │ ✓ Done    │ ⏸ 3 conflicts    │ ○ Waiting  │ ○ Waiting          │ ○ Waiting     │ [Open conflicts] [Resume (3 conflicts left)] [Skip step] [Stop]
 Legend: ✓ done · ✗ failed · ⏸ paused · – skipped · ○ waiting
```

- **Cell:** ন্যূনতম চওড়া 7.5rem, উচ্চতা 2rem, 16 px Lucide icon + `text-caption` শব্দ। Pause আর ব্যর্থ cell তাদের soft bg পায়। শব্দগুলো নির্দিষ্ট: done (Merged, Pushed, Up to date), failed (Failed: rejected), paused (3 conflicts, Changed since preview, Waiting for you, Interrupted), skipped (Nothing to do, Cancelled, Stopped), waiting (Waiting), running (spinner, "Running · 12 s")। Restart-এর পরে নিশ্চিত হওয়া cell একটা ছোট `rotate-ccw` badge পায়, "Confirmed after restart"। Accessible name: "app-api, Update from main, paused, 3 conflicts"।
- **Column**-এর title ধাপের নাম আর তার argument ("Integrate into dev")। Repo column (11rem) সার্বিক icon সহ বাঁয়ে আটকানো; action column ডানে আটকানো আর শুধু pause বা ব্যর্থ row-এ দেখায়। Grid-এর নিচে সবসময় একটা legend row দেখানো হয়।
- একটা Wait-for-confirmation column তার message দেখায়, আর প্রতিটা repo সেখানে অপেক্ষা করলে header-এ একটা button [Continue all 2]।
- তীর key cell-এর মধ্যে সরায়; Enter details panel-এ cell-এর command আর output খোলে; focus থাকা cell-এ ভেতরের দিকে ring থাকে।

**Pause হওয়া row-এর action** (PIPE-07):

| কারণ | Action (প্রথমটা primary) |
|---|---|
| Conflict | Open conflicts · Resume · Skip step · Stop |
| Preview-এর পরে বদলেছে | Show what changed · Resume · Stop |
| Failure | Show Git output · Retry step · Skip step · Stop |
| বাধা পেয়েছে (restart) | Check repo · Resume · Skip step · Stop |

- Conflict বাকি থাকা পর্যন্ত Resume তৈরি নয়: "Resume (3 conflicts left)"। পরের ধাপ protected branch-এ লিখলে: "Resume · pushes to dev"।
- **Stop কখনো চুপচাপ merge abort করে না।** Merge-এর মাঝপথে Stop জিজ্ঞেস করে: "Stop the run for app-api" / "app-api is still in the middle of a merge: 3 files conflicted, 1 already resolved." [Keep the merge and stop] (default) [Abort the merge and stop] (`danger-action`, loss list resolve হওয়া file-এর নাম বলে)।
- শেষ হলে: "Finished in 3 min 4 s · 2 done", সাথে [Run again] (P1) আর [Dismiss]।

## ১৪. Pull request

### ১৪.১ Task-এর pull request-এর অবস্থা (v0.1, PR-05, PR-11)

Header "Pull requests · Task TK-2636", সাথে [Create pull requests] আর Refresh ("Updated 3 min ago")।

| Column | চওড়া | মান |
|---|---|---|
| Repo | 140 | app-front |
| PR | 64 | `#412` (details panel খোলে); `external-link` icon GitHub খোলে |
| Title | flex | TK-2636: Onboarding |
| State | 88 | Draft (neutral) · Open (`success`) · Merged (violet) · Closed (`danger`) |
| Checks | 120 | "Checks passed 4/4" · "1 check failed" · "2 checks running" · "No checks" |
| Review | 136 | Approved (1) · Changes requested · Review required · No reviewers |
| Merge | 136 | Can merge · Conflicts with dev · Blocked: review required · Checking… |
| Comments | 56 | 3 |
| Updated | 72 | 12 min |

PR ছাড়া task-এর repo-গুলো নিচে `text-secondary`-তে তালিকায় থাকে: "app-api · No pull request: 5 commits ahead of dev. [Create pull requests]"।

| State | Content |
|---|---|
| Sign out করা | "Sign in to GitHub to create and track pull requests. GitHeddle never sees your password." [Sign in to GitHub] |
| কোনো active task নেই | "No active task. Your task's pull requests and their checks show here." [Start task] [Switch task] |
| Task আছে, PR নেই, commit এগিয়ে | "No pull requests for TK-2636 yet. 2 repos have commits ahead of dev." [Create pull requests] |
| Task আছে, কিছুই এগিয়ে নেই | "Nothing to open yet. Commit your changes first." [Open Changes] |
| Loading | Cache চিহ্নসহ cache-এর row, "Updating from GitHub…" |
| Rate limit | `info` banner: "GitHub asked GitHeddle to slow down. Status refreshes again at 14:32." |
| Token-এর মেয়াদ শেষ বা বাতিল (SEC-08) | `warning` banner "Your GitHub sign-in has expired. [Sign in again]"; cache-এর row `text-secondary`-তে |
| অনুমতি নেই / SSO | Row-এর message: "GitHub says you can't see acme/app-api. If your organisation uses single sign-on, authorise GitHeddle on github.com." [Open on GitHub] |
| Offline | Offline banner, cache-এর row, "Updated 2 h ago" |

v0.2 (PR-06/07/08) যোগ করে tab "Current task 2 · Created by me 5 · Review requested 3", একটা repo filter, আর একটা selection bar [Mark ready for review] [Add reviewers…] [Merge in order…] [Close…], সবই ভাগাভাগি করা preview দিয়ে।

### ১৪.২ Create pull requests preview (Flow 3, PR-02, PR-03)

চওড়া action-flow dialog (64rem), ভাগাভাগি করা field-এর নিচে দুটো column: একটা repo list (20rem) আর বাছা repo-র জন্য একটা editor।

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

- ভাগাভাগি করা field প্রতিটা repo-তে খাটে। কোনো repo-র জন্য একটা edit করলে সেই row "● edited" চিহ্ন পায় (`info` বিন্দু), field-এর পাশে [Use shared value] সহ।
- প্রতি repo-র target একটা ComboBox, default repo-র base (CFG-02)।
- Reviewer initials badge ব্যবহার করে, avatar নয় (TH-07); group-এর default reviewer থেকে পরামর্শ, আগে থেকে ভরা।
- **Assignee** (PR-02) default-ভাবে sign in করা user, আগে থেকে "(TA) dev-taosif-net" হিসেবে ভরা, সরাতে × আর আরও যোগ করতে +। প্রতি repo-র editor Title-এর নিচে একই field দেখায়, edit না হওয়া পর্যন্ত "Same as shared" সহ।
- "Create as draft" default-ভাবে বন্ধ, tooltip "Drafts are visible but don't ask anyone to review yet."। Button সেটা মেনে চলে: "Create 2 draft pull requests"।
- Body Write | Preview sanitised markdown view দিয়ে render হয়; ছবি `[image: diagram.png]` হিসেবে দেখায়; GitHub ছাড়া অন্য link [Copy] সহ পুরোটা দেখায়।
- Related pull requests একটা read-only placeholder, যাতে user জানেন এটা যোগ হবে (PR-03)।
- আগে থেকেই আছে (T-21): "#412 already open · will only update the related links"; button "Create 1 pull request, update 1"।
- কিছুই এগিয়ে নেই কিন্তু change আছে: "Skipped: app-front has no commits yet, but 2 changed files. [Commit them first]" — এটা সেই repo খোলা অবস্থায় Changes-এ লাফ দেয়, dialog-এর state রেখে দেয় আর "Back to pull requests" দেয়।
- Sign out করা: device-code sign-in (§১৭.৬) ডানের column-এ inline খোলে, তারপর preview চলতে থাকে। কখনো "go to Settings" নয়।
- ফলাফলের row-এ link থাকে: "✓ app-front  #413 created (draft)  [Open on GitHub]"। সারাংশ: "2 pull requests created and linked to each other."

## ১৫. Activity log (BULK-08)

```text
Activity log                         [Filter commands…] [Repo ▾] [Source ▾] [Failed only]      Kept 30 days
▾ 14:02:11  Pull · Task TK-2636 · 4 repos · 3 succeeded, 1 failed                                    6.1 s
    14:02:11  app-api    git pull --ff-only                                      ✗ 128     1.2 s
    14:02:11  app-front  git pull --ff-only                                        0       0.8 s
▸ 13:40:03  Background status · 6 repos                                                              0.9 s
```

- উৎস অনুযায়ী ভাগ করা (একটা bulk action, একটা pipeline run, background status)। Background status default-ভাবে গুটানো, আর Source ▾ দিয়ে লুকানো যায়।
- Command row (24 px, virtualised, সবচেয়ে নতুনটা আগে): Time 72 (HH:MM:SS, 24 h) · Repo 140 · Command (flex, `text-code`, credential `[credentials removed]` হিসেবে দেখানো, SEC-05) · Exit 48 (`0` neutral, শূন্য নয় এমন হলে `x` সহ `danger`) · Duration 64।
- Row খুললে `surface-sunken` mono block-এ stdout আর stderr দেখায় (বড়জোর 320 px), control character escape করা (UN-05), সাথে [Copy command] (terminal-এ চালানোর মতো `git -C "<path>" …`) আর [Copy output]। Write-এর বেলায় আগের আর পরের HEAD, আর [Copy command to go back]।
- চলমান command Exit-এ spinner দেখায় আর output stream করে।
- কোনো job-এর "Show in activity log" থেকে খুললে screen সেই job-এ filter হয়, chip সহ "Job: Pull · 14:02 ×"।
- খালি: "Nothing has run yet. Every Git command GitHeddle runs appears here, so you can repeat it in a terminal."

## ১৬. Settings (CFG-01, CFG-02)

- বাঁয়ে একটা 200 px খাড়া tab list (↑/↓), ডানে একটা form (বড়জোর 680 px, field-এর উপরে label)। Tab-গুলোর উপরে "Search settings" সব tab জুড়ে field filter করে।
- **প্রতিটা পরিবর্তন নিজেই save হয়** (300 ms debounce; template-এর বেলায় blur-এ), আর field-এর পাশে 2 s ধরে একটা `check` সহ "Saved" দেখায়। অবৈধ মান save হয় না আর তার error inline দেখায়।
- প্রতিটা field-এর একটা scope tag আছে, `App` বা `Workspace` (`text-caption` pill)। নিচের ভাগটা অস্থায়ী (§২৫)।

| Tab | Field (হুবহু label) |
|---|---|
| General | Theme: System / Light / Dark (App) · Zoom: 90–300 % with [Reset] (App) · Motion: System / Reduce / Full (App) · Editor: VS Code (খুঁজে পাওয়া path দেখানো) / Other… (App) · Terminal: System terminal / Other… (App) · Remember window layout (App, চালু) |
| Git and branches | Your short name `taosif`, caption "Used in branch names" (App) · Branch name pattern `{ticket}-{user}-{title}`, live উদাহরণ আর variable-এর তালিকা সহ (Workspace) · Default base branch `dev` (Workspace) · Protected branches: chip `main` `master` `dev` + যোগ (Workspace) · Sync method: Merge (recommended) / Rebase (Workspace) · Require staging before commit (App, বন্ধ) · Parallel limit 1–16, default 4 (App) · Background fetch: Off / 5 / 15 / 30 / 60 min, default Off (Workspace) · Git: path আর version, read-only, [Check again] |
| Pull requests | Title template `{ticket}: {title}` · Body template (markdown, [Preview]) · Create as draft by default (বন্ধ) · Default reviewers per group (group → login-এর table) |
| Conflicts and tools | Resolve conflicts with: Built-in merge editor (default) / External tool… · External merge tool command (শুধু local, কখনো team file থেকে নয়) |
| Accounts | GitHub: initials badge, "Signed in as dev-taosif-net", [Sign out]; বা [Sign in with GitHub] আর [Use a personal access token…]; প্রাসঙ্গিক হলে Linux keyring-এর notice (SEC-02) |
| Workspace | Name · Folders (যোগ / সরানো) · Search depth 1–5, default 2 · Groups (GRP-01): [New group] সহ তালিকা, rename, edit, delete · Trusted repos: trust-এর তারিখ আর [Review again] সহ তালিকা |
| Repositories (CFG-02) | Repo list (220 px) আর একটা override form। প্রতিটা field উত্তরাধিকারে পাওয়া মান placeholder হিসেবে দেখায় ("dev, from Git and branches"), সাথে একটা [Override] toggle। Override করা field 2 px `accent-indicator` বাঁ border আর [Reset to default] পায়। Field: base branch, protected branches, sync method, default merge method (v0.2) |
| Keyboard shortcuts | v0.1: এই OS-এর জন্য read-only table। v0.2: conflict-এর সতর্কতা সহ edit করা যায় (PIPE-12) |
| About | Version, licence GPL-3.0, font আর icon-এর licence, [Open logs folder], repository আর install guide-এর link |

## ১৭. First run আর GitHub sign-in (Flow 0, UX-01)

### ১৭.১ UI-র আগে: Git check (GS-01)

Git না থাকলে বা 2.30-এর চেয়ে পুরনো হলে পুরো window জুড়ে একটা blocker সব কিছুর জায়গা নেয়:

- Title: "GitHeddle needs Git 2.30 or newer"। পাওয়া গেছে কিন্তু পুরনো: "Found Git 2.25 at /usr/bin/git. GitHeddle needs 2.30 or newer."
- প্রতি OS-এর ধাপ, প্রতিটা command [Copy] সহ: Windows — "Install Git for Windows from github.com/git-for-windows/git/releases" (অনুমোদিত link, UN-04); macOS — `xcode-select --install`; Linux — `sudo apt install git` বা `sudo dnf install git`।
- [Check again]।

macOS WKWebView-এর ন্যূনতম সীমার message (ui-architecture §১৭) native: "GitHeddle needs macOS 13.3 or newer. Update macOS in System Settings → General → Software Update."

### ১৭.২ কাঠামো

- পুরো window, shell-এর কোনো chrome নেই, `surface-base`-এর উপর মাঝখানে 35rem চওড়া (বড়জোর 90vw) একটা card, `surface-overlay` card, `radius-lg`।
- ধাপের indicator: "Step 1 of 4", লেবেল করা বিন্দু সহ **Folder · Review · You · GitHub** (screen reader-এর জন্য একটা list-ও)। Review শুধু তখনই থাকে যখন কোনো repo চিহ্নিত হয়েছে; না হলে "of 3"।
- Footer: বাঁয়ে [Back]; ডানে [Skip this step] (text button) আর primary। Primary বলে কোথায় যাবে: "Continue to review", "Continue to your details", "Continue to GitHub sign-in"; শেষ ধাপেরটা "Open dashboard"। কখনো শুধু "Continue" নয়।
- Skip করা প্রতিটা ধাপ Getting started checklist-এর একটা item হয়ে যায় (§২২.২), তাই skip করলে কখনো কানাগলিতে পড়তে হয় না। লক্ষ্য: 2 মিনিটের কম, কিছু টাইপ করতে হয় না।

### ১৭.৩ ধাপ 1 — Folder

> **Welcome to GitHeddle**
> Do Git and pull request work in many repos at once. GitHeddle uses your own Git, lists everything it runs in the Activity log, and asks before anything that changes your repos.
> **Where do your repos live?**

- দুটো 240 × 96 px choice tile: **Choose a folder** · **Import a VS Code workspace** (`.code-workspace`)।
- তারপর একটা live scan: [Stop] সহ "Looking in C:\Work\acme… 6 repos found", আর ম্লান path সহ টিক দেওয়া repo-র একটা list (বড়জোর 200 px, scroll করে)। [Look deeper]।
- "Workspace name [acme-works]", folder-এর নাম থেকে আগে থেকে ভরা।
- একটাও পাওয়া যায়নি: "No Git repos in C:\Work\acme\app-api\src. GitHeddle looks 2 folders deep." [Choose another folder] [Look 3 levels deep]। একটা repo-র folder-ও 1-repo-র workspace হিসেবে গ্রহণ করা হয়।
- 50-এর বেশি পাওয়া গেছে: "Found 214 repos. That's more than GitHeddle is built for (up to 50). Pick a narrower folder, or untick the ones you don't need."
- অন্য user-এর folder: "Git refuses this folder because it belongs to another user." [How to fix] — কখনো পাশ কাটানো হয় না (GS-08)।
- Skip → dashboard-এর "Open your repos" state।

### ১৭.৪ ধাপ 2 — Repo review (GS-08)

> **2 repos need review before GitHeddle runs Git in them**
> These repos have settings that make Git start other programs. If you cloned them from your team, trusting them is usually fine.
> ☑ `app-api`   `core.fsmonitor = "rs-git-fsmonitor"`
> ☑ `app-front` `include.path = ../shared.gitconfig`
> ▸ What does trusting mean? — "GitHeddle will run Git here, and Git will run these programs. Don't trust repos from people you don't know."
> [Not now] **[Trust 2 repos]**

Primary সংখ্যাটা বলে। "Not now" সেগুলোকে "Needs review" অবস্থায় রেখে দেয়।

### ১৭.৫ ধাপ 3 — আপনি

- "Your short name [taosif]", `git config user.name` থেকে আগে থেকে ভরা (§২৫ দেখুন), ছোট হাতের `a–z 0–9 -`; টাইপ করার সময় space dash হয়ে যায়, hint "Spaces become dashes in branch names."। Live caption: "Branch names will look like TK-2636-taosif-Onboarding"।
- "Base branch [dev ▾]", সাথে "dev exists in 5 of 6 repos."। ব্যতিক্রম: "app-report-api has no dev branch. It will use main. [Change]"।
- তথ্যের লাইন: "main, master and dev are protected. GitHeddle asks before committing, merging or pushing to them. Change this in Settings."
- **Git identity check।** `user.name` বা `user.email` না থাকলে: "Git doesn't know your name and email yet. Commits need them." Name [ ] Email [ ] ☐ Use for all repos on this computer। Save করার আগে দেখায় "GitHeddle will run: `git config --global user.name "…"`" আর সেটা log করে। (নতুন; §২৬ দেখুন।)

### ১৭.৬ ধাপ 4 — GitHub (PR-01, SEC-03/04)

একই UI sign-in dialog-এ (30rem) আর Create pull requests-এ inline ব্যবহার হয়।

**A. শুরু।** "Sign in to GitHub" / "You need this to create and track pull requests. GitHeddle opens github.com in your browser; you approve it there and never type a password here." [Sign in with GitHub] · "Use a personal access token instead" · "Skip for now. You can sign in later from Pull requests or Settings."

**B. Code।**

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

Countdown প্রতি সেকেন্ডে update হয় আর শুধু 5 min আর 1 min-এ announce হয়। Code-এর accessible name হলো "Your code: W D J B, dash, M J H T"।

**C. সফল।** Initials badge সহ "Signed in as dev-taosif-net", তারপর নিচে "Can Git reach GitHub?" check। First run-এ primary হলো [Open dashboard]; sign-in dialog-এ [Done: signed in]। এটা নিজে থেকে বন্ধ হয় না।

| ক্ষেত্র | Message | Action |
|---|---|---|
| Code-এর মেয়াদ শেষ | "The code expired before it was approved." | [Get a new code] |
| প্রত্যাখ্যাত | "Sign-in was cancelled on GitHub." | [Try again] |
| Network | "Can't reach github.com. Check your connection or proxy." | [Try again] |
| Secret Service নেই (Linux, SEC-02) | "Signed in for this session only. Your desktop has no password store, so you'll sign in again next time. Installing GNOME Keyring or KWallet fixes this." | [How to set up a keyring] |
| Org OAuth app সীমিত করে | "GitHeddle can't see repos in acme yet. An organisation owner must approve GitHeddle." | [Request access on GitHub] · token ব্যবহার করুন |

**Personal access token:** একটা লুকানো field "Paste a personal access token", Show আর [Check and save] সহ; "Use a fine-grained token. It needs:" সাথে core থেকে আসা অনুমতির তালিকা (scope M9-এ ঠিক হবে)। অবৈধ: "GitHub didn't accept this token. Check that it isn't expired and has the permissions above."

**Can Git reach GitHub?** ধাপের শেষে প্রতিটা trusted repo-তে একটা read-only `git ls-remote --heads origin` (একসাথে, log করা)। প্রতিটা repo দেখায় "Git can reach github.com" বা "Git has no saved login for github.com in app-front. GitHeddle can't type a password for Git." [Set up Git Credential Manager] [Use SSH instead]। Failure হলে dashboard row-এ "Can't push: no Git login" pill-ও বসে। (নতুন; §২৬ দেখুন।)

**শেষ:** "You're set up." [Open dashboard]।

## ১৮. Command palette (Mod+K)

| অংশ | বিবরণ |
|---|---|
| Container | একটা React Aria Modal-এর ভেতরে cmdk; 40rem চওড়া; উপরের কিনারা 12vh-এ; `surface-overlay`, `radius-lg`, 1 px `border-strong`, `elevation-2` |
| Input | 2.75rem উঁচু, 14 px লেখা, placeholder "Type an action, pipeline, repo or task…" |
| Row | 2rem: 16 px icon · title, মেলা অক্ষর weight 600-এ (রঙে নয়) · `text-secondary`-তে প্রসঙ্গ ("on Task TK-2636 · 2 repos") · ডানে key hint chip |
| List | বড়জোর 22.5rem (প্রায় 10টা row); section header 1.5rem, `text-section-title`-এ |
| Footer | 1.75rem: "↑↓ move · Enter choose · Esc close · Backspace back" |

- **Section, ক্রম অনুযায়ী:** Suggested (state থেকে, বড়জোর 3টা: "Resolve 3 conflicts in app-api", "Pull 1 repo that's behind", "Resume paused run") · Recent (5) · Actions · Pipelines · Repos ("Go to app-api") · Tasks · Screens।
- **Scope prefix** `>` action, `@` repo, `#` task, `/` screen; প্রথম 3 বার footer-এ hint দেওয়া হয়।
- **দ্বিতীয় স্তর:** একটা repo বেছে নিলে তার action খোলে (Open in VS Code, Open terminal, Open in file manager, Open on GitHub, Fetch app-api, Go to app-api)। খালি input-এ Backspace পেছনে যায়।
- **পাওয়া যায় না এমন action** ম্লান থাকে, key hint-এর জায়গায় কারণ সহ ("No conflicts to resolve"); একটা বেছে নিলে কারণটা toast হিসেবে দেখায়।
- পরিবর্তন সবসময় তার preview খোলে। Read-only action একটা toast সহ সরাসরি চলে।
- কোনো ফল নেই: "No action matches "pshu". Try a Git verb like Push or Pull, or a repo name."
- Mod+P palette "Go to" mode-এ খোলে (repo, screen, task)।

## ১৯. Keyboard map

### ১৯.১ নিয়ম

1. `Mod` মানে Windows আর Linux-এ Ctrl, macOS-এ ⌘ (PLAT-05)।
2. Windows বা Linux-এ কোনো Ctrl+Alt combination নয়: অনেক layout-এ Ctrl+Alt হলো AltGr।
3. যে key layout ভেদে জায়গা বদলায় (`[ ] \ ; '`), তাতে কোনো shortcut নয়, macOS-এর প্রচলিত ⌘[ ⌘] ⌘, ছাড়া।
4. OS-এর key এড়িয়ে চলুন: Linux Ctrl+Shift+U আর Ctrl+Shift+E (IBus), Ctrl+. আর Ctrl+; (emoji), Alt+F5/F7/F8, Super; macOS ⌘H ⌘M ⌘Q ⌘W ⌘\` আর ⌃⌘ system key; Windows Win+, Alt+F4, Alt+Space।
5. প্রতিটা F-key command-এর একটা macOS বিকল্প আছে (laptop-এ Fn লাগে)।
6. যে shortcut কিছু বদলায় সেটা তার preview খোলে, তাই ভুল চাপলেও ক্ষতি নেই।
7. একক অক্ষর শুধু text input-এর বাইরে কাজ করে। Merge editor-এর read-only pane বাইরে বলে ধরা হয় (§১৯.৩)।
8. প্রতিটা shortcut M1-এ তিনটা webview-এই যাচাই করা হয়।

### ১৯.২ Global

| Action | Windows / Linux | macOS |
|---|---|---|
| Command palette | Ctrl+K (alias Ctrl+Shift+P) | ⌘K (alias ⇧⌘P) |
| Go to repo, screen or task | Ctrl+P | ⌘P |
| Start task | Ctrl+N | ⌘N |
| Switch task | Ctrl+T | ⌘T |
| Fetch target (preview নেই) | Ctrl+Shift+F | ⇧⌘F |
| Pull target | Ctrl+Shift+D | ⇧⌘D |
| Push target | Ctrl+Shift+H | ⇧⌘H |
| Sync with base | Ctrl+Shift+B | ⇧⌘B |
| Create pull requests | Ctrl+Shift+R | ⇧⌘R |
| Run pipeline… | Ctrl+Shift+X | ⇧⌘X |
| Refresh status | F5 | ⌘R |
| Filter this screen | Ctrl+F | ⌘F |
| Screen 1–7-এ যান: Repositories, Changes, Pull requests, Conflicts, Pipelines, Task, Activity log | Ctrl+1…7 | ⌘1…7 |
| Back / forward | Alt+← / Alt+→, mouse 4/5 | ⌘[ / ⌘] |
| পরের / আগের region | F6 / Shift+F6 | F6 / ⇧F6, বা ⌃⌘→ / ⌃⌘← |
| Toggle sidebar | Ctrl+B | ⌘B |
| Toggle details panel | Ctrl+I | ⌘I |
| Toggle job panel | Ctrl+J | ⌘J |
| Focus থাকা repo বা file editor-এ খোলা | Ctrl+O | ⌘O |
| Focus থাকা repo-তে terminal খোলা | Ctrl+Shift+T | ⇧⌘T |
| Settings | Ctrl+, | ⌘, |
| Zoom in / out / reset | Ctrl+= (Ctrl++) / Ctrl+− / Ctrl+0 | ⌘= / ⌘− / ⌘0 |
| Keyboard shortcuts sheet | ? (লেখার বাইরে) | ? |
| Context menu | Shift+F10, Menu key | ⇧F10, ⌃Return |
| Dialog বা popover বন্ধ, filter বা selection মোছা | Esc | Esc |

### ১৯.৩ Screen-এর scope

| Scope | Key |
|---|---|
| Dashboard table | ↑/↓ row, ←/→ cell, Space toggle, Shift+Space / Shift+↑↓ বাড়ায়, Mod+A দেখা যাওয়া সব, Enter details, Home/End, type-ahead |
| Changes tree | ui-architecture §১০.৫, সাথে Mod+Enter commit, Mod+Shift+Enter commit & push, Alt+M (⌃⌥M) message box, Mod+Delete (⌘⌫) discard confirmation |
| Diff | পরের / আগের change F7 / Shift+F7 (সব OS-এ); শুধু Windows-এ alias Alt+F5 / Shift+Alt+F5; macOS-এ ⌃⌘↓ / ⌃⌘↑ |
| Merge editor | F8 / Shift+F8 পরের/আগের অমীমাংসিত (macOS-এ ⌃⌘↓ / ⌃⌘↑-ও) · take incoming Alt+I (⌃⌘I), বা read-only pane-এ I · take current Alt+C (⌃⌘C), বা C · take both Alt+B (⌃⌘B), বা B · reset conflict Alt+R (⌃⌘0), বা R · Space focus থাকা দিকের checkbox চালু/বন্ধ করে · Mod+S accept · Mod+Z / Mod+Shift+Z (Ctrl+Y) undo/redo · F6 ঘোরে Incoming → Current → Result → footer · Esc তারপর Tab Result থেকে বের হয় · Alt+← (⌘[) Conflicts-এ ফেরে, save না থাকলে আগে জিজ্ঞেস করে |
| Pipeline editor | ↑/↓ ধাপ, Alt+↑/↓ (⌥↑/⌥↓) ধাপ সরায়, Delete সরিয়ে দেয় (Undo toast), Mod+S save |
| Run grid | Cell-এর মধ্যে তীর, Enter cell-এর output খোলে, Tab pause হওয়া row-এর action-এ পৌঁছায় |
| Action-flow dialog | Tab ঘোরে, Mod+Enter চালায় (destructive নয়), শুধু Enter শুধু focus থাকা control চালু করে, Esc বাতিল করে |

### ১৯.৪ Focus-এর ক্রম

Shell-এর tab ক্রম: **Skip to main content** → top bar toolbar (একটা stop, ভেতরে ←/→) → sidebar (একটা stop) → main → details panel → job panel → bottom bar। F6 ঘোরে top bar → sidebar → main-এর প্রতিটা sub-region → details → job panel → bottom bar → toast। প্রতিটা region তার শেষ focus থাকা element মনে রাখে আর কোথায় পৌঁছানো হলো তা announce হয় ("Changes list", "Diff, Program.cs")।

| Screen | Main-এর sub-region (F6 ক্রম) | শুরুর focus |
|---|---|---|
| Repositories | Toolbar, table | Table, শেষ focus থাকা row |
| Changes | Toolbar, commit box, tree, diff (চোখে দেখার ক্রম, উপর থেকে নিচে তারপর বাঁ থেকে ডানে) | Tree-র প্রথম file; কিছু staged থাকলে message box |
| Conflicts | Card, Continue all | প্রথম অমীমাংসিত file |
| Merge editor | Header, Incoming, Current, Result, footer | Active conflict-এর Incoming checkbox |
| Task | Header-এর action, repo table, PR list | Header-এর প্রথম action |
| Pipelines | List, editor, run grid | List-এর selection |
| Settings | Tab, panel | Tab |
| Action-flow dialog | — | প্রথম না-নেওয়া সিদ্ধান্ত; না থাকলে primary (non-destructive) বা Cancel (destructive) |
| Palette | — | Input |

## ২০. Accessibility (UX-08)

লক্ষ্য **WCAG 2.2 AA**, যার মধ্যে আছে 2.5.8 target size, 2.4.11 focus not obscured আর 3.3.7 redundant entry।

### ২০.১ Accessible name

| Widget | Role | Name (description) |
|---|---|---|
| Task chip | button (menu) | "Active task: TK-2636 Onboarding, 2 repos. Task actions" |
| Target picker | combobox | "Target: Task TK-2636, 2 repos" ("Fetch, Pull, Push and pipelines act on these repos") |
| Fetch / Pull / Push | button | "Pull 2 repos" (tooltip-এর বাক্য) |
| Sidebar item | link | "Changes, 8 files" · "Conflicts, 1 repo needs you" · "Repositories, 6, 1 needs review" · "Pull requests, 1 open, 1 has a failing check"। `triangle-alert` icon আর `danger` বিন্দু কখনো একমাত্র সংকেত নয়: নাম আর একটা tooltip একই বাক্য বলে |
| Dashboard row | row | "app-api, on dev, merging, 3 conflicted, 6 changed, selected" |
| Needs-review row | row | "vendor-sdk, needs review before GitHeddle runs Git. Review button" |
| Changes-এর repo header | treeitem level 1 | "app-api, on dev, merging TK-2636-taosif-Onboarding, 6 files, expanded" |
| Section header | treeitem level 2 | "Staged changes, 3 files, expanded" |
| File row | treeitem | "Program.cs, Api, modified, 8 added, 2 removed, staged" |
| Row button | button | "Stage Program.cs" · "Open Program.cs in editor" |
| Commit message | textbox | "Commit message" ("Commits 5 files in 2 repos: app-api, app-front. Nothing staged, so all changes are committed.") |
| Diff pane | textbox, read-only | "Program.cs, last commit, app-api, read only" |
| Merge checkbox | checkbox | "Take incoming for conflict 2 of 6, lines 14 to 16, TK-2636-taosif-Onboarding" |
| Result | textbox | "Result, Api.csproj, editable" ("2 of 6 conflicts unresolved. Press Escape then Tab to leave.") |
| অমীমাংসিত placeholder | group | "Unresolved conflict 3 of 6", cursor ভেতরে ঢুকলে announce হয় (M1-এ যাচাই) |
| Run grid cell | gridcell | "app-api, Update from main, paused, 3 conflicts" |
| Job chip | button, ভেতরে একটা `progressbar` সহ (`aria-describedby` দিয়ে যুক্ত) | "Push, 3 of 4 repos done. Open in job panel" |
| Account badge | button | "Signed in to GitHub as dev-taosif-net. Account menu" |
| Splitter | separator | "Resize sidebar", মান সহ |
| শব্দকোষের term | button | "stash, what does this mean?" |
| Getting started | list | "Getting started, 2 of 6 done" |

### ২০.২ Announcement (একটা polite announcer)

| ঘটনা | লেখা | Politeness |
|---|---|---|
| Stage / unstage | "Program.cs staged" / "3 files staged" | polite, 500 ms-এর মধ্যে একসাথে মেলানো |
| Filter | "12 files match" | polite, টাইপ থামার 400 ms পরে |
| Job শুরু / progress / শেষ | "Push started in 4 repos" · "2 of 4 done" (বড়জোর প্রতি 3 s-এ) · "Push finished: 2 succeeded, 1 skipped, 1 failed." | polite |
| Repo pause হয়েছে | "app-api paused at Update from main: 3 files need you" | polite (শুধু focus সেই job-এর view-তে থাকলে assertive) |
| Conflict navigation / টিক / accept | "Conflict 3 of 6, 2 unresolved" · "Incoming taken for conflict 3. 1 unresolved" · "Api.csproj saved and marked resolved. Opened DeleteOnboarding.cs, 2 conflicts" | polite |
| Target বদল | "Target: selection, 3 repos" | polite |
| Copy, zoom, sign-in, region | "Code copied" · "Zoom 150%" · "Signed in as dev-taosif-net" · region-এর নাম | polite |
| দরকারের সময় sign-in বাতিল হয়েছে | "Signed out of GitHub: your sign-in was revoked. Sign in again to create pull requests." | assertive |
| Background refresh, watcher-এর update | — | কখনো announce হয় না |

Toast role `status` ব্যবহার করে। Undo toast অন্তত 10 s থাকে আর focus বা hover-এ থেমে থাকে (WCAG 2.2.1)।

### ২০.৩ Zoom আর reflow

- ধাপ: 90, **100**, 110, 125, 150, 175, 200, 250, 300 %। 200 % পর্যন্ত reflow নিশ্চিত (breakpoint কার্যকর চওড়া ব্যবহার করে, §৪.৪); 250–300 % ব্যবহারযোগ্য থাকে।
- Zoom বদলালে 2 s ধরে toast দেখায় "Zoom 150% · Reset (Ctrl+0)"।
- First run-এর default OS-এর text scale মেনে চলে, যেখানে core সেটা পড়তে পারে (Windows "Text size", GNOME `text-scaling-factor`); §২৫ দেখুন।
- কাটা: path file-এর নাম রেখে মাঝখান থেকে কাটা; branch ticket আর শেষ অংশ রেখে; পুরো লেখা সবসময় tooltip আর accessible name-এ। Action-flow dialog-এ repo-র নাম কাটা না হয়ে পরের লাইনে যায়।

### ২০.৪ Reduced motion

§৩.৮ দেখুন। উৎস: `prefers-reduced-motion`, core থেকে আসা OS setting (GNOME `enable-animations`), আর Settings → Motion।

### ২০.৫ বাড়ানো contrast (`prefers-contrast: more`)

macOS "Increase contrast", আর core জানালে GNOME high contrast:

- `border-subtle` `border-strong`-এর মান নেয়।
- `text-secondary` হয় light `#3A3F4B`, dark `#C4C9D4`।
- Selection bar 3 px হয়ে যায়।
- Elevation-এর shadow বাদ যায়; overlay একটা 1 px `border-strong` border পায়।

### ২০.৬ Forced colours (Windows contrast theme)

| অংশ | Mapping |
|---|---|
| Surface | `Canvas` |
| লেখা, secondary লেখা | `CanvasText` (কখনো `GrayText` নয়, যার মানে disabled) |
| Disabled | `GrayText` |
| Link | `LinkText` |
| Border, panel, input | `CanvasText`; প্রতিটা panel আর input-এর আসল border আছে, কারণ background মুছে যায় |
| Button | `ButtonFace` / `ButtonText`, 1 px `ButtonText` border; primary-র 2 px border |
| Selected row | `Highlight` / `HighlightText`; bar হলো `HighlightText` |
| Focus ring | 2 px `Highlight` outline |
| Status অক্ষর, run icon, pill | 1 px `CanvasText` pill border সহ `CanvasText`; অক্ষর, শব্দ আর icon অর্থ বহন করে |
| Diff | Background বাদ যায়; `+` / `−` চিহ্ন থাকে; inserted শব্দে underline, deleted শব্দে কাটা দাগ |
| Spacer | Hatch-এর বদলে dashed border |
| Merge region | Gutter label "Conflict 2" সহ 1 px `CanvasText` frame; Incoming edge solid, Current edge dashed; অমীমাংসিত placeholder 1 px dashed `Highlight`; স্বয়ংক্রিয়ভাবে বসানো region একটা "auto" gutter label পায় |

Editor-এ `forced-color-adjust: none` ব্যবহার হয় না। Screenshot আর axe-এর জন্য Playwright `forcedColors: 'active'` emulate করে।

### ২০.৭ রং দেখার ক্ষমতা

লাল আর সবুজ কখনো একমাত্র সংকেত নয়: diff-এ gutter চিহ্ন আছে, run cell-এ icon + শব্দ, CI-তে icon + শব্দ, status অক্ষর তো অক্ষরই। Merge-এর দুই দিক শুধু রঙে নয়, অবস্থান, title, I/C gutter অক্ষর আর edge-এর ধরনেও আলাদা; M0-তে একটা colour-vision simulation screenshot check চলে।

## ২১. Copy deck

সব string থাকে `copy/`-এ (ui-architecture §১৬)। Sentence case; button action আর তার object-এর নাম বলে; কখনো "OK", "Yes" বা "Something went wrong" নয়।

### ২১.১ Button-এর লেবেল

| প্রসঙ্গ | লেবেল |
|---|---|
| Top bar | Start task · Run pipeline · Fetch · Pull · Push · Search or run a command… |
| Flow-এর footer | Cancel · Start task in 2 repos · Switch 3 repos to TK-2601 · Add 2 repos to TK-2636 · Remove 1 repo from TK-2636 · Create branch in 3 repos · Pop stash in 2 repos · Merge into 3 repos · Delete branch in 2 repos · Create group · 4 repos · Pull 4 repos · Push 4 repos · Commit app-api · Commit 2 repos · Commit 5 files in 2 repos · Commit & push 2 repos · Switch 3 repos to dev · Stash 2 repos · Run pipeline on 2 repos · Create 2 pull requests · Create 2 draft pull requests · Sync 2 repos with dev · Merge into dev in 2 repos · Close |
| Inline choice | Take them along · Stash · Skip · Switch to it · Check it out and track origin · Merge origin in · Include all 3 changes · Stash all 2 · Skip all 2 |
| Destructive | Discard 3 files · Discard file · Delete 1 file · Stash instead · Delete branch with 4 unmerged commits · Abort merge in app-api · Abort the merge and stop · Quit now |
| Progress / ফলাফল | Cancel remaining (2) · Retry 1 failed · Show Git output · Hide Git output · Open terminal · Show in activity log · Open conflicts · Resolve conflicts · View result · Dismiss · Copy · Undo: … (v0.2) |
| Run grid | Open conflicts · Resume · Resume (3 conflicts left) · Resume · pushes to dev · Skip step · Retry step · Stop · Keep the merge and stop · Continue all 2 · Show what changed · Check repo · Run again (v0.2) |
| Pipelines | New pipeline · Run… · Save · Discard changes · Duplicate · Copy to My pipelines · Delete pipeline · + Add step |
| Conflicts | Resolve · Resolve all… · Mark as resolved · Use dev for all 6 conflicts · Take all incoming · Take all current · Use incoming · Use current · Use both · Accept merge · Continue merge · Continue rebase · Continue cherry-pick · Continue all · 2 repos · Abort merge… · Keep resolving |
| Trust আর sign-in | Trust 2 repos · Not now · Review · Review repos · Sign in with GitHub · Copy code · Open it again · Get a new code · Check and save · Done: signed in |
| First run | Continue to review · Continue to your details · Continue to GitHub sign-in · Open dashboard · Skip this step · Back |
| Save না করা | Keep editing · Discard my changes · Discard task |

### ২১.২ Tooltip (এক বাক্য, ক্রিয়াপদ দিয়ে শুরু, নিরাপদ সীমাটা বলে)

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

### ২১.৩ Error message (কী হয়েছে, কোথায়, এরপর কী)

প্রতিটা message [Show Git output]-ও দেয়।

| Code (প্রস্তাবিত) | Message | Action |
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

### ২১.৪ Empty state

| Screen / state | লেখা | Button |
|---|---|---|
| Repositories, workspace নেই | Open your repos. Choose the folder where your Git repos live, or import a VS Code workspace. | Choose folder… · Import VS Code workspace… |
| Repositories, কিছু পাওয়া যায়নি | No Git repos found in C:\Work\acme. GitHeddle looked 2 folders deep. | Look 3 levels deep · Choose another folder |
| Repositories, filter | No repos match "sched" with Behind. | Clear filters |
| Task-এর জায়গা, task নেই | No task yet. A task creates the same branch in every repo it touches. | Start task |
| Task, repo নেই | TK-2636 has no repos. Add the repos this ticket touches. | Add repos |
| Changes, clean | No changes in 6 repos. Edit files in your editor and they show up here. | Open in VS Code |
| Changes, filter | No files match "service". | Clear filter |
| Conflicts | No conflicts. Repos that stop in a merge or rebase show up here. | Go to repositories |
| Pull requests, task নেই | No active task. Your task's pull requests and their checks show here. | Start task |
| Pull requests, এখনো নেই | No pull requests for TK-2636 yet. 2 repos have commits ahead of dev. | Create pull requests |
| Pull requests, sign out করা | Sign in to GitHub to create and track pull requests. | Sign in to GitHub |
| Pipelines, আমার কোনোটা নেই | No pipelines of your own yet. Save steps you repeat every day and run them on many repos at once. | New pipeline · Copy a ready-made one |
| Pipeline editor | Add the first step. Steps run in order in each repo; repos run side by side. | + Add step |
| Groups | No groups. Group related repos to target them together. | New group |
| Activity log | Nothing has run yet. Every Git command GitHeddle runs appears here. | — |
| Job panel | Nothing running. Actions you run show their progress here. | — |
| Details panel | Select a repo, task or pull request to see its details. | — |
| Palette | No action matches "pshu". Try a Git verb like Push or Pull, or a repo name. | — |

### ২১.৫ শব্দকোষের term (`components/Term`)

সাধারণ লেখায় (empty state, preview, dialog) একটা Git term `text-secondary`-তে 1 px dotted underline পায়। Hover (500 ms) বা focus (সাথে সাথে) ১–২ বাক্যের একটা 20rem tooltip দেখায়। Term শুধু সাধারণ লেখায় focus পায়, table-এ কখনো নয়। বাক্যগুলো থাকে `copy/glossary`-তে।

| Term | সহজ বাক্য |
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

## ২২. নতুন user-এর যাত্রা

Persona **Rina**, Ubuntu 24.04-এ frontend developer। তিনি VS Code-এর Source Control থেকে commit আর push করেন, কখনো rebase করেননি। তাঁর short name `rina`; তিনি `app-api` আর `app-front`-এ TK-2636 নিয়ে কাজ করেন। সাফল্যের মাপকাঠি (PRD §১১) হলো কোনো Git term না জেনেই "প্রথম launch থেকে pull request তৈরি পর্যন্ত"।

### ২২.১ ধাপে ধাপে

| # | ধাপ | তিনি কী দেখেন | কোথায় আটকে যেতে পারেন | ডিজাইনের সমাধান |
|---|---|---|---|---|
| 0 | Launch | Git check | Git নেই | প্রতি OS-এর ধাপ সহ পুরো-window blocker (§১৭.১) |
| 1 | Folder | Welcome + দুটো tile | Home বা একটা subfolder বেছে নেন | শূন্য/50-এর বেশি-র message, 1-repo-র workspace গ্রহণযোগ্য (§১৭.৩) |
| 2 | Review | Trust-এর তালিকা | Trust মানে কী জানেন না | এক বাক্যের ব্যাখ্যা, "Trust 2 repos" সংখ্যাটা বলে |
| 3 | আপনি | Short name, base, identity | Git-এ `user.email` নেই, তাই প্রথম commit ব্যর্থ হতো | হুবহু command দেখিয়ে Git identity check (§১৭.৫) |
| 4 | GitHub | Device code | পরে push ব্যর্থ হয়, কারণ তাঁর HTTPS login শুধু VS Code-এ আছে | প্রথম দিনেই "Can Git reach GitHub?" check (§১৭.৬) |
| 5 | Dashboard | Repo + Getting started | একটা repo আগে থেকেই merge-এর মাঝপথে | [Resolve conflicts] [Abort merge…] সহ banner |
| 6 | Start task | Input + preview | "Stash" দুর্বোধ্য শব্দ; ভুলে যাওয়া stash হারানো কাজের মতো দেখায় | "Take them along (Recommended)", সহজ লেবেল, row-এ stash pill |
| 7 | Edit | Checklist "Make your changes in your editor" [Open both in VS Code] | Editor-এ save না করা buffer | Hint "Unsaved edits in your editor aren't seen by Git." |
| 8 | Commit | Commit box | কিছু staged নেই → "nothing to commit" | Button-এ সংখ্যা সহ commit-all mode (§৮.৬) |
| 9 | ভুল করে dev-এ commit | Protected confirm | একটা ভাগাভাগি করা branch-এ commit করেন | প্রথম option হিসেবে [Start a task with these changes] |
| 10 | PR তৈরি | চওড়া preview | Sign in করা নেই; একটা repo commit করতে ভুলে গেছেন | Inline sign-in; "[Commit them first]" dialog-এর state রেখে দেয় |
| 11 | শেষ | Link সহ ফলাফল | "Push হলো কি?" | "2 pull requests created and linked to each other", GitHub-এর link |

৪টা setup ধাপ আর ৩টা task dialog জুড়ে মোটামুটি 10টা click।

### ২২.২ Getting started checklist (`components/GettingStarted`)

Dashboard table-এর উপরে আর Task screen-এ গোটানো যায় এমন একটা card (গুটানো অবস্থায় একটা 36 px লাইন: "Getting started · 2 of 6 done · Next: Start a task [Start task]")। Item-গুলো click থেকে নয়, **আসল state** থেকে টিক পায়:

1. Choose your repos — workspace-এ ≥ 1টা trusted repo আছে।
2. Sign in to GitHub — sign in করা। "Needed to create pull requests."
3. Start a task — একটা active task আছে।
4. Make changes in your editor — task-এর একটা repo-তে change আছে বা commit এগিয়ে আছে। [Open both in VS Code]
5. Commit — change থাকা task-এর প্রতিটা repo-তে একটা commit এগিয়ে আছে।
6. Create pull requests — base-এর চেয়ে commit এগিয়ে থাকা task-এর প্রতিটা repo-র একটা pull request আছে।

পরের না-করা item এক বাক্য আর একটা button সহ খোলা থাকে; বাকিগুলো গুটানো। সব শেষ হলে: "All done, your pull requests are open. [Hide this guide]" — সাদামাটা লেখা, কোনো confetti নয়। [Hide] এটাকে palette-এ সরিয়ে দেয় ("Show getting started")। এটা প্রতি user-এ save হয়।

### ২২.৩ কোথায় কাজ হারাতে পারে, আর সমাধান

| # | পরিস্থিতি | সমাধান |
|---|---|---|
| L1 | Merge changes-এ "+ all" এমন file stage করত যেগুলোতে এখনো marker আছে | সেখানে কোনো "+ all" নেই; [Resolve all…]; প্রতি row-এর Mark as resolved শুধু marker না থাকলে (§৮.৩) |
| L2 | Discard changes | Loss list, [Stash instead], ক্ষতির নামে button, Enter কখনো নিশ্চিত করে না (§১২.৯) |
| L3 | Resolve করার পরে merge abort | Dialog resolve হওয়া file আর হারানো conflict-এর নাম বলে (§১০.৩) |
| L4 | Merge editor থেকে বের হওয়া | Keep editing / Discard my changes; খসড়া autosave খোলা প্রশ্ন (§২৫) |
| L5 | Switch-এর সময় editor-এ save না করা buffer | Start, Switch আর Finish task-এর preview-তে hint |
| L6 | ভুলে যাওয়া stash | Row-এ stash pill; ফিরে switch করলে একটা **টিক না দেওয়া** choice দেখায় "Bring back your stashed changes (githeddle/TK-2636)" (কিছুই আগে থেকে বাছা নয়, R17)। Pop-এ conflict হলে repo conflict হিসেবে pause হয় আর Git stash রেখে দেয় (§৭.৫) |
| L7 | Run চলার সময় বন্ধ করা | Quit dialog (§১২.১১) |
| L8 | Rebase / force push | কখনো আগে থেকে বাছা নয়; block কথায় বলে কী বদলে যাবে (§১২.৮) |
| L9 | Detached HEAD-এ commit | [Create a branch here first] সহ commit box-এর সতর্কতা |
| L10 | Protected branch-এ commit | প্রথমে [Start a task with these changes] |
| L11 | Conflict-কে failure হিসেবে দেখানো | Conflict মানে pause ("need you"); Retry failed সেগুলো বাদ দেয় |
| L12 | Rebase-এ দিকের মানে | সহজ ভাষায় pane-এর ভূমিকা আর "Your commit" tag (§১১.২) |
| L13 | কারণ ছাড়া Accept merge disabled | দৃশ্যমান কারণ; চাপলে প্রথম conflict-এ লাফ দেয় |
| L14 | v0.1-এ undo নেই | ফলাফল বলে কী বদলেছে; activity log আগের/পরের HEAD দেখায় "Copy command to go back" সহ |
| L15 | Commit-all এলোমেলো নতুন file তুলে নেয় (`.env`, build output) | Commit-all শুধু tracked file নেয়; নতুন file-এর নিজের টিক লাগে আর preview line-এ তাদের নাম থাকে (§৮.৬) |
| L16 | Abort merge-এর আগে করা edit হারায় | Abort dialog তাদের নাম বলে আর [Stash them first] দেয় (§১০.৩) |
| L17 | dev-এর local commit নতুন task branch-এর বাইরে থেকে যায় | Start task জিজ্ঞেস করে: Bring them into the task branch · Leave them on dev (§৭.৪) |

### ২২.৪ নিরাপদ default

Pull শুধু fast-forward · merge দিয়ে sync · background fetch বন্ধ (60 min পরে bottom bar মনে করিয়ে দেয়) · কোনো choice আগে থেকে বাছা নয় (Take them along recommended) · প্রতিটা repo-কে তার শুরুর branch-এ ফিরিয়ে দেওয়া চালু · publish branch বন্ধ · draft PR বন্ধ · force with lease কখনো আগে থেকে বাছা নয় · parallel limit 4 · protected `main`, `master`, `dev`।

## ২৩. Mockup

Static HTML mockup থাকে [mockups/](mockups/index.html)-এ। দুজন mockup লেখক এই তালিকা মেনে এগুলো বানিয়েছেন, আর design review-এর পরে সংশোধন করেছেন। প্রতিটা `tokens.css` link করে, শুধু তার token variable আর ভাগাভাগি করা class ব্যবহার করে, প্রতিটা app window একটা "Skip to main content" link দিয়ে শুরু হয়, `<html>`-এ `data-theme="light" | "dark"` দিয়ে theme বদলায়, Lucide SVG inline রাখে, আর network থেকে কিছুই load করে না।

| File | কী দেখায় | কী কভার করে |
|---|---|---|
| `mockups/tokens.css` | Light আর dark-এ প্রতিটা token-এর মান, সাথে base style আর ভাগাভাগি করা component class | §৩ |
| `mockups/contrast-check.js` | §৩.৩-এর contrast table আর CI-র জোড়ার তালিকা, `tokens.css` থেকে হিসাব করা (`node mockups/contrast-check.js`) | §৩.৩ |
| `mockups/index.html` | Gallery: প্রতিটা mockup-এর link, এক লাইনের বর্ণনা আর যে PRD ID কভার করে সেগুলো সহ | — |
| `mockups/dashboard.html` | App shell + Repositories dashboard, স্বাভাবিক state, app-api-তে details panel খোলা | DASH-01..07, §৪, §৫, §৬ |
| `mockups/task.html` | TK-2636-এর Task screen আর Start task dialog | TASK-01/02, §৭ |
| `mockups/first-run.html` | First-run-এর ধাপ, repo trust-এর ধাপ আর GitHub device-flow sign-in সহ | UX-01, GS-08, PR-01, §১৭ |
| `mockups/pull-requests.html` | Task-এর PR অবস্থা (PR-05) আর Create pull requests preview (Flow 3) | PR-02/03/05/11, §১৪ |
| `mockups/settings.html` | Settings | CFG-01/02, §১৬ |
| `mockups/changes.html` | Changes screen (list mode), diff view খোলা আর commit box সহ | CHG-01..07, BULK-06, §৮, §৯ |
| `mockups/merge-editor.html` | Conflicts screen আর তিন-pane-এর merge editor, rebase-এর রূপসহ | CONF-01..11, §১০, §১১ |
| `mockups/pipelines.html` | Pipeline editor আর একটা pause হওয়া repo সহ run grid | PIPE-01..10, §১৩ |
| `mockups/action-flow.html` | Preview, bottom bar আর job panel-এ চলা, failure সহ একটা ফলাফল; protected-branch confirmation; destructive confirmation | BULK-03..05, SAFE-01..04, §১২ |
| `mockups/palette-states.html` | Command palette, empty state, error message, toast, cache থেকে loading | UX-04/05/06, PERF-02, §১৮, §২১ |

**`tokens.css`-এ ভাগাভাগি করা class** (mockup লেখকেরা নিজে style বানানোর বদলে এগুলো ব্যবহার করেন; প্রতিটা রং একটা `--gh-<role>` variable):

| এলাকা | Class |
|---|---|
| Shell | `gh-shell`, `gh-shell__body`, `gh-topbar`, `gh-topbar__spacer`, `gh-wordmark`, `gh-sidebar`, `gh-sidebar--rail`, `gh-sidebar__group`, `gh-sidebar__bottom`, `gh-nav-item` (`--sub`, `.is-selected`), `gh-main`, `gh-screen-header`, `gh-toolbar`, `gh-details` (`--overlay`, `__header`, `__body`, `__footer`), `gh-jobpanel` (`__list`, `__view`), `gh-bottombar`, `gh-jobchip` (`--running`, `--paused`, `--failed`, `--done`), `gh-splitter` (`--h`), `gh-pane` (`__header`, `__body`), `gh-card` |
| লেখা আর icon | `gh-screen-title`, `gh-section-title`, `gh-strong`, `gh-caption`, `gh-secondary`, `gh-disabled`, `gh-code`, `gh-link`, `gh-num`, `gh-icon` (`--sm`, `--lg`, `--xl`, `--inherit`), `gh-spin`, `gh-term` |
| Button | `gh-btn` (`--primary`, `--danger`, `--danger-text`, `--ghost`, `--link`, `--icon`, `--sm`, `--lg`, `.is-busy`, `[aria-disabled="true"]`), `gh-btn__hint`, `gh-btn-group`, `gh-segmented`, `gh-chip` |
| Form | `gh-input` (`--code`, `.is-invalid`), `gh-select`, `gh-textarea`, `gh-search`, `gh-field` (`__label`, `__hint`, `__error`), `gh-check` (`aria-checked`, `--incoming`, `--current`), `gh-checkrow`, `gh-radio`, `gh-switch` |
| Badge | `gh-pill` (`--success`, `--warning`, `--danger`, `--info`, `--conflict`, `--merged`, `--clean`), `gh-badge`, `gh-count` (`--danger`), `gh-dot`, `gh-initials`, `gh-varchip`, `gh-status` (`--M`, `--A`, `--D`, `--R`, `--U`, "!"-এর জন্য `--C`), `gh-counts` (`__add`, `__del`), `gh-kbd` |
| List আর table | `gh-table`, `gh-row` (`--repo`, `--section`, `.is-selected`, `.is-selected-inactive`, `.is-focus`, `.is-pending`, `.is-muted`, `.is-attention`, `.is-loss`), `gh-row__actions`, `gh-row__slot`, `gh-indent-1..3`, `gh-folder`, `gh-twisty`, `gh-skeleton`, `gh-cache-mark` |
| Overlay | `gh-scrim` (`--static`), `gh-dialog` (`--sm`, `--alert`, `--md`, `--wide`, `__header`, `__inputs`, `__toolbar`, `__body`, `__footer`, `__status`), `gh-preview-row` (`__sub`), `gh-confirm` (`--force`), `gh-menu`, `gh-menu__item` (`--danger`), `gh-menu__sep`, `gh-popover`, `gh-tooltip`, `gh-palette` (`__input`, `__list`, `__section`, `__row`, `__footer`) |
| Feedback | `gh-banner` (`--info`, `--warning`, `--danger`, `--success`, `__text`), `gh-toast-region`, `gh-toast` (`--success`, `--warning`, `--danger`), `gh-empty` (`__actions`), `gh-progress`, `gh-meter`, `gh-steps` |
| Run | `gh-run-cell` (`--done`, `--failed`, `--paused`, `--skipped`, `--waiting`, `--running`), `gh-run-legend` |
| Editor | `gh-editor`, `gh-line` (`__num`, `__sign`, `__gutter`, `__source`, `__code`, `--active`), `gh-diff-line--ins`, `gh-diff-line--del`, `gh-diff-word--ins`, `gh-diff-word--del`, `gh-diff-spacer`, `gh-diff-collapsed`, `gh-diff-divider`, `gh-ruler`, `gh-merge-region` (`--incoming`, `--current`, `--auto`, `--auto-incoming`, `--auto-current`, `--edited`, `--resolved-incoming`, `--resolved-current`, `--unused`, `.is-active`), `gh-merge-source--I/C/E`, `gh-merge-pane-title--incoming/current/result`, `gh-merge-placeholder`, `gh-order-badge`, `tok-*` syntax class, `gh-output` |
| Helper | `gh-stack`, `gh-hstack`, `gh-spacer`, `gh-truncate`, `gh-mock-label`, `gh-sr-only`, `gh-divider`, `gh-vdivider` |

## ২৪. Panel-এর সিদ্ধান্ত

যেখানে প্রস্তাবগুলো মেলেনি, সেখানে chair সিদ্ধান্ত দিয়েছেন। প্রতিটা সিদ্ধান্ত বলে কী প্রস্তাব ছিল, কী ঠিক হলো আর কেন।

| # | বিষয় | প্রস্তাব | সিদ্ধান্ত | কেন |
|---|---|---|---|---|
| R1 | রঙের মান | পাঁচটা আলাদা palette; শুধু Agent 1-এরটা প্রতিটা surface-এ, selected row সহ, contrast যাচাই করা | Agent 1-এর palette, accent indigo `#3D4FD1` | যাচাই করা সংখ্যা অনুমানের চেয়ে ভালো, আর অন্যগুলো যে selected-row-এর ক্ষেত্রে ব্যর্থ হয়েছিল এটা সেগুলো পাস করে |
| R2 | Row-এর উচ্চতা | 24 px (Agent 1, 3, 5) বনাম 28 px (Agent 2, 4) | প্রতিটা row 24 px; dialog আর palette যেখানে বলা আছে সেখানে বড় row ব্যবহার করে | 24 × 24 row button দিয়ে WCAG 2.5.8 পূরণ করে আর IDE-র ঘনত্ব রাখে |
| R3 | লেখার মাপ | Caption 11 px (Agent 2) বনাম 12 px (অন্যরা); screen title 16 বনাম 18 px | Caption 12 px হলো ন্যূনতম; screen title 16 px; code 13 px | 12 px-এর নিচে কোনো লেখা নয় (Agent 5); 16 px title ঘন shell-এ মানায় |
| R4 | Section title-এর case | Uppercase 11 px (Agent 1) বনাম sentence case 12 px (Agent 2, 4, 5) | Sentence case 12 px 600; কোথাও uppercase নয় | কম আত্মবিশ্বাসী user-দের জন্য পড়া সহজ; ui-architecture §১৬ sentence case চায় |
| R5 | Window frame | Native (Agent 2); অন্যরা কিছু বলেনি | v0.1-এ তিনটা OS-এই native frame | একটাই hit-test ব্যবস্থা, WebKitGTK/Wayland-এর ঝুঁকি নেই |
| R6 | ন্যূনতম window | 960 × 600 (A1), 1024 × 640 (A2, A3), 800 × 560 (A5) | 1024 × 640; কার্যকর চওড়ায় breakpoint (A5) | Merge editor-কে প্রতি দিকে ≈ 52টা অক্ষরে রাখে; zoom তবুও single column পর্যন্ত reflow করে |
| R7 | Shell-এর মাপ | Top bar 40/44, bottom bar 24/26/28, sidebar 220/240, details 320/340 | Top 40, bottom 24, sidebar 240, details 320 | সংখ্যাগরিষ্ঠের মান; ঘন shell content-এর জন্য বেশি জায়গা রাখে |
| R8 | Sidebar-এর ক্রম | PRD sketch: আগে object; A2 আর A5: আগে screen | আগে screen, Activity log আর Settings নিচে আটকানো; "Repositories" লেবেল | Navigation কখনো সরে না; নতুন user আগে খোঁজেন "আমি কোথায়" |
| R9 | Target বনাম checkbox | A2 আর A5: টিক দিলে target বদলায়; A2: group click-ও এটা set করে | দুটোই গৃহীত, একটা "← Back to …" chip সহ আর প্রতিটা preview-তে target আবার বলা | PRD sketch-এর অস্পষ্টতা দূর করে; যে row দেখানো হচ্ছে কাজ হয় সেগুলোর উপরেই |
| R10 | ফলাফল কোথায় থাকে | Job tray popover (A2) বনাম docked job panel (A4) | Bottom bar-এর উপরে docked, non-modal job panel (Mod+J) | Failure row সহ 30টা repo-র ফলাফল popover বা 20rem details panel-এ ধরে না |
| R11 | Icon আর state glyph | Doc-এ Unicode; A1 আর A4: SVG | সব জায়গায় Lucide SVG; Unicode doc-এর লেখার ধরন হিসেবে থাকে | দুটো OS-এ `⏸` emoji হিসেবে render হয়; font আলাদা |
| R12 | Merge-এর দুই দিকের রং | Teal/violet (A1) বনাম blue/teal (A3) | Teal Incoming, violet Current, `-edge` sub-role আর একটা নতুন `merge-active` সহ | যাচাই করা contrast; VS Code বা Visual Studio নকল করে না; add/delete হিসেবে পড়া এড়ায় |
| R13 | Merge changes-এ "+ all" | PRD sketch-এ আছে; A3 আর A5 সরিয়ে দেয় | সরানো হয়েছে; [Resolve all…] আর marker scan দিয়ে নিয়ন্ত্রিত প্রতি row-এর Mark as resolved | Marker থাকা file stage করলে সেটা resolved চিহ্নিত হয় আর পরে কাজ হারায় |
| R14 | কিছু staged না থাকলে commit | Skip (BULK-06), stage-all button (A3), preview choice (A2), লেবেল সহ commit all (A5) | Scope-এ কিছু staged না থাকলে commit-all mode, button-এ file-এর সংখ্যা আর দৃশ্যমান সাহায্যকারী লেখা সহ; অভিজ্ঞদের জন্য "Require staging" setting; মিশ্র scope শুধু staged commit করে, প্রতি repo-তে "Include all" choice সহ | নতুন user-এর এক নম্বর ফাঁদ দূর করে, কিছুই চুপচাপ না করে |
| R15 | Commit box-এর অবস্থান | List-এর নিচে (PRD, ui-architecture §১০.৮, A3) বনাম উপরে (A5) | List-এর উপরে, আটকানো | VS Code-এর সাথে মেলে, যেটাকে PRD এই screen-এর আদর্শ বলে |
| R16 | এক repo-র commit preview | পুরো flow খোলা বনাম inline preview line (A3) | সবসময় দেখা যায় এমন preview line, সাথে protected-branch AlertDialog | এক repo-র commit এক click-এ রাখে; তবুও দেখায় কী হবে |
| R17 | Uncommitted changes-এর choice | আগে থেকে কিছু বাছা নয় (A2, A4) বনাম default "Take them along" (A5) | Switch clean হলে "Take them along" দেওয়া হয় আর Recommended tag থাকে, কিন্তু কিছুই আগে থেকে বাছা নয় | নতুন user-কে পথ দেখিয়েও ui-architecture §৭-এর "প্রতিটা সিদ্ধান্ত নেওয়া হয়েছে" নিয়ম রাখে |
| R18 | Disabled primary button | `disabled` + tooltip বনাম দৃশ্যমান কারণ সহ aria-disabled (A4, A5) | aria-disabled, focus পাওয়া যায়, দৃশ্যমান কারণ, focus প্রথম অপূর্ণ শর্তে যায় | Disabled button-এর tooltip keyboard আর screen reader-এর নাগালের বাইরে |
| R19 | ফলাফলে conflict | ✗ failed (PRD preview sketch) বনাম paused (A5, PIPE-08) | Paused, "need you"; Retry failed সেগুলো বাদ দেয় | আতঙ্ক আর conflicted repo-তে আবার merge চালানো এড়ায় |
| R20 | Dialog-এ Enter | Mod+Enter চালায় (A4); protected-এ Enter কিছু করে না (A5) | শুধু Enter কখনো submit করে না; Mod+Enter non-destructive action submit করে (protected টিক দেওয়ার পরে); destructive-এ ইচ্ছাকৃত চাপ লাগে | একটা নিয়ম, যেটা ভুল করে push বা discard আটকায় |
| R21 | Confirmation-এর জোর | প্রতি ঝুঁকিতে checkbox (A4) বনাম টাইপ করে নিশ্চিত করা | প্রতি ধরনের ঝুঁকিতে একটা checkbox, লেবেল action আবার বলে; টাইপ নয় | এই team-এর জন্য protected push নিয়মিত ব্যাপার; আসল কথা নামগুলো দেখা |
| R22 | Action-এর পরে focus | প্রথম failure (ui-architecture §১৫) বনাম যে খুলেছিল সেখানে ফেরা (A4) | যে খুলেছিল সেখানে ফেরা; প্রথম failure বা pause হওয়া repo শুধু user ফলাফল খুললে | Run শুরুতেই dialog বন্ধ হয়; পরে focus সরালে সেটা কেড়ে নেওয়া হতো |
| R23 | Pause হওয়া merge-এর সময় Stop | বলা ছিল না | Stop জিজ্ঞেস করে; default "Keep the merge and stop" | চুপচাপ abort-এ resolve হওয়া file হারাতে পারত (G6) |
| R24 | Screen আর panel-এর shortcut | Mod+1..5 + Mod+Alt+B (A2) বনাম Mod+1..7 + Mod+I (A5) | Mod+1..7 screen, Mod+B sidebar, Mod+I details, Mod+J job panel; merge-এর "take" key Alt+I/C/B (macOS-এ ⌃⌘) | কোনো Ctrl+Alt নয় (AltGr); অঙ্ক সব জায়গায় screen বোঝায় |
| R25 | Diff-এ পরের change | Alt+F5 (ui-architecture §১১) বনাম F7 (A5) | সব জায়গায় F7 / Shift+F7, Windows-এ Alt+F5 alias, macOS-এ ⌃⌘↓/↑ | Alt+F5 GNOME-এর unmaximise; macOS-এ F-key-এর জন্য Fn লাগে |
| R26 | Discard-এর key | Delete (A3) বনাম Mod+Delete (A5) | Mod+Delete / ⌘⌫, সবসময় confirmation খোলে | ভুল করে চাপা কঠিন |
| R27 | Mod+F | "Search repos" (PRD) | "Filter this screen": repo, file, বা editor search | একটা key, প্রতি screen-এ অনুমানযোগ্য |
| R28 | Zoom-এর ধাপ | 90–200 (A1) বনাম 70–300 (A5) | 90–300 %; 200 % পর্যন্ত reflow নিশ্চিত | 90 % caption-কে ≥ 10.8 px রাখে; বেশি zoom কম দৃষ্টিশক্তির user-দের সাহায্য করে |
| R29 | Focus ring-এর offset | 1 px (A2, A4) বনাম 2 px (A1, A5) | বাইরে 2 px, row আর cell-এ ভেতরে −2 px | Dark accent fill-এর জন্য ring-কে তার চারপাশের surface-এ থাকতে হয় |
| R30 | Toast-এর সময় | চার রকমে 4–10 s | Success 4 s, info/failure 6 s, action 8 s, Undo 10 s; hover/focus-এ থামে | কাজ করার মতো যথেষ্ট লম্বা; failure job chip-এও থেকে যায় |
| R31 | Border-এর একক | সব জায়গায় rem (ui-architecture §৮) বনাম px-এর সরু রেখা (A1) | Border, ring, bar আর shadow offset-এ px; বাকি সব rem | ভগ্নাংশ zoom-এ rem-এর সরু রেখা ঝাপসা হয় |
| R32 | Wordmark | দুই রঙের (A1) বনাম এক রঙের | এক রঙের | "Git" + "Heddle" ভাগ করা brand হিসেবে পড়া এড়ায় |
| R33 | First-run-এর ধাপ | 4 ধাপ (A2) বনাম Welcome সহ 5 (A5) | 4 ধাপ (Folder · Review · You · GitHub), ধাপ 1-এ Welcome লেখা, সাথে Git identity আর reachability check | 2 মিনিটের কম; দুটো check পরের সবচেয়ে খারাপ দুটো failure দূর করে |
| R34 | পথ দেখানো | Next step card (A2); checklist, শব্দকোষের term আর "?" help (A5) | v0.1-এ Next step card, Getting started checklist আর শব্দকোষের term; "?" help panel P1-ই থাকে (§২৫) | এখন সস্তা, state-নির্ভর সাহায্য; help panel হলো owner-এর পরিধির সিদ্ধান্ত |
| R35 | Dashboard-এর মান | তীর-সংখ্যা (A2) বনাম শব্দ (A5) | শব্দ ("2 to push", "4 behind"), ইচ্ছামতো তীর সহ, সাথে A2-র অগ্রাধিকারের pill তালিকা | PRD-র "2/0" দুর্বোধ্য; একটা তালিকা প্রতিটা screen-এর কাজে লাগে |
| R36 | CONF-02-এর মানে | পুরো file checkout বনাম প্রতিটা conflict এক দিক দিয়ে resolve (A3) | প্রতিটা conflict সেই দিক দিয়ে resolve; পুরো file শুধু delete/modify, binary আর সীমার বেশি file-এ | Conflict নেই এমন পরিবর্তন রাখে; CONF-08-এর সাথে মেলে |
| R37 | Stash দেখা যাওয়া | DASH-07-এর stash হলো P1 | v0.1-এ GitHeddle-এর বানানো stash pill হিসেবে দেখায় | v0.1 stash বানায় (SAFE-04), তাই সেগুলো দেখাতেই হবে |
| R38 | Group editor আর action flow | Design review: GRP-01-এর কোনো editor ছিল না | একটা ছোট dialog (নাম + repo checklist), যেটা preview ছাড়া সরাসরি save করে | Group হলো GitHeddle-এর setting, Git-এ কিছুই বদলায় না; preview Git-এর পরিবর্তনের জন্য |
| R39 | Commit-all-এ নতুন file | Design review: commit-all untracked file যোগ করতে পারত | Commit-all শুধু tracked file নেয়; নতুন file-এর নিজের টিক লাগে আর preview line-এ তাদের নাম থাকে | এক click-এ কখনো একটা এলোমেলো `.env` বা build output publish হওয়া চলবে না |
| R40 | অপেক্ষমাণ row-এর চেহারা | 2 px `info` bar (প্রথম খসড়া) | কোনো bar নেই; row-এর জায়গায় একটা spinner আর "Staging…" | `info` bar আর selection bar-এর পার্থক্য মাত্র 1.05–1.07:1, তাই অপেক্ষমাণ row selected-এর মতো দেখাত |
| R41 | Default window-এ ধরানো | Design review: 1280 × 800-এ dashboard-এর column আর side-by-side diff ধরছিল না | Docked panel কখনো centre-কে 720 px-এর নিচে নামায় না (না হলে overlay হয়); dashboard-এর column নির্দিষ্ট ক্রমে জায়গা ছাড়ে (§৫.২) আর filter "More filters ▾"-এ চলে যায় (§৫.৭); 1440-এর নিচে Changes list 320 px; 640 px diff pane পর্যন্ত side by side | Default window-কে জোড়াতালি ছাড়াই ডিজাইন করা layout দেখাতে হবে |
| R42 | Dark mode-এ হালকা fill-এর উপর glyph | সব জায়গায় সাদা (প্রথম খসড়া) | Merge edge-এর উপর check আর switch knob-এর জন্য নতুন `indicator-glyph` role (light-এ সাদা, dark-এ `#131519`); checked radio আর switch `accent-indicator` ব্যবহার করে | Dark edge-এর উপর সাদা 2.39–2.76:1 আর dark `accent` ring ছিল 2.17–2.91:1; দুটোই এখন 3:1 পাস করে |
| R43 | Search-match-এর রং | Dark-এ `#5A4614` (প্রথম খসড়া) | Dark-এ `#3F3210` | পুরনো মানে dark syntax রং 3.83:1-এ নেমে গিয়েছিল; গাঢ়টা প্রতিটা role-কে 4.91:1 বা তার বেশিতে রাখে |
| R44 | ছোট badge | Initials, order badge, key hint, rail count-এ 9–11 px লেখা | সব `text-caption`-এ (12 px); তার বদলে badge বড় হয় (initials 20 px, order আর number badge 16 px) | R3-এর ন্যূনতম সীমা রাখে, ব্যতিক্রমের কোনো তালিকা রক্ষণাবেক্ষণ করতে হয় না |
| R45 | Key-এর লেখার ধরন | Mockup-এ তিন রকম ধরন, কয়েকটায় `Ctrl`-এর সাথে `⇧` মেশানো | Registry থেকে প্রতি OS-এ একটা ধরন: chip `Ctrl Shift B` / `⇧⌘B`, সাধারণ লেখা `Ctrl+Shift+B` | PLAT-05; মেশানো hint কোনো keyboard-এর সাথে মেলে না |
| R46 | Job chip-এর role | `progressbar` | ভেতরে progress bar সহ `button` | এটা job panel খোলে; progressbar click করা যায় বলে announce হয় না |
| R47 | Start task-এ base-এ local commit | চুপচাপ `origin/dev` থেকে branch (TASK-02) | জিজ্ঞেস করা: Bring them into the task branch · Leave them on dev; কিছুই আগে থেকে বাছা নয় | না হলে dev-এ নতুন user-এর ভুল commit কোনো কথা ছাড়াই task branch থেকে উধাও হয়ে যায় |
| R48 | Merge-এর আগে করা edit-এর উপর Abort | Loss list শুধু resolve হওয়া file-এর নাম বলত | Operation-এর আগে dirty ছিল এমন file core জানায়; dialog তাদের নাম বলে আর [Stash them first] (বা [Save copies first]) দেয় | `git merge --abort` সেই edit-গুলো আবার বানাতে না-ও পারে |
| R49 | একটাই উদাহরণের state | Section-গুলো app-api আর app-front-এর জন্য আলাদা state ব্যবহার করত | একটা state, §৫.১-এর নিচে লেখা, প্রতিটা section ব্যবহার করে | পরস্পরবিরোধী উদাহরণে spec যাচাই করা কঠিন হতো |

## ২৫. খোলা প্রশ্ন

1. **Accent-এর রং:** brand-এর জন্য indigo `#3D4FD1` কি ঠিক?
2. **বাংলা লেখা:** Noto Sans Bengali-র একটা subset (≈ 100–200 KB) bundle করা হবে, যাতে বাংলা commit message সব জায়গায় একই রকম দেখায়, নাকি system font-এর উপর ভরসা?
3. **Compact ঘনত্ব:** v0.2-এ 22 px row-এর setting?
4. **Linux high contrast:** core কি GTK-র high-contrast theme ধরে `prefers-contrast: more` জানাবে?
5. **Preview streaming:** core কি প্রতি repo-তে preview row stream করবে (§১২.৩ ধরে নেয় পারবে)?
6. **ছোট job:** প্রায় 3 s-এর কম job-এর বেলায় (2টা repo-তে Start task) dialog খোলা রেখে ফলাফল সেখানেই দেখানো হবে?
7. **Pull preview:** সাধারণ fast-forward Pull কি কখনো preview বাদ দেবে? UX-03 বলে না।
8. **পুরনো protected confirmation:** confirmation-এর কি মেয়াদ শেষ হওয়া উচিত, যেমন pause হওয়া run পরের দিন resume করলে?
9. **Merge Result-এর খসড়া:** core কি Result-এর খসড়া autosave করবে, যাতে crash-এ কখনো সিদ্ধান্ত না হারায় (নতুন core command)?
10. **Discard snapshot:** core কি discard করা file-এর snapshot রাখবে (`refs/githeddle/discarded/*`, 14 দিন), যাতে discard undo করা যায়?
11. **Push credential:** allow-list করা GitHub remote-এর জন্য একটা সীমিত askpass bridge মেনে নেওয়া হবে (GS-13 বদলায়), নাকি reachability check আর একটা guide-এর উপর ভরসা?
12. **Git identity:** first run কি `git config --global user.name/email` লিখতে পারবে, নাকি শুধু প্রতি repo-তে, নাকি শুধু ব্যাখ্যা করবে?
13. **Ticket key:** বাধ্যতামূলক? Ticket ছাড়া team Start task-এ আটকে যায়; ফাঁকা key-তে হতো `rina-Onboarding`।
14. **Short name কীভাবে বের হবে:** `git config user.name`-এর প্রথম শব্দ, শেষ শব্দ, নাকি `user.email`-এর local অংশ?
15. **Settings-এর scope:** কোন setting প্রতি workspace-এ আর কোনটা পুরো app-এ খাটে (§১৬ অস্থায়ী)?
16. **Group click:** sidebar-এ group-এ click করলে কি target বদলাবে (R9), নাকি শুধু filter?
17. **v0.1-এ "?" help:** Repositories, Start task, Changes, Create pull requests আর Conflicts-এর জন্য ন্যূনতম help দেওয়া হবে, যেহেতু সাফল্যের মাপকাঠি v0.1-এর লক্ষ্য (UX-11 হলো P1)?
18. **Pull requests-এর count:** খোলা PR, নাকি শুধু মনোযোগ দরকার এমন PR?
19. **Activity log:** 30 দিন রাখা; background status আদৌ log হবে?
20. **Dashboard-এ Next step card:** active task-এর জন্য table-এর উপরে এক লাইন হিসেবেও দেখাবে?
21. **GitHub থেকে protected branch:** GitHub যেগুলোকে protected বলে, সেগুলোকেও protected ধরা হবে?
22. **Rebase skip:** rebase card-এ SAFE-03 confirmation সহ "Skip this commit" দেওয়া হবে?
23. **Whitespace toggle:** "Show whitespace changes" v0.1-এ নাকি P1?
24. **Merge-এর take key:** default হিসেবে Alt+I/C/B, নাকি assign না করা পর্যন্ত শুধু palette-এ?
25. **Coach strip:** প্রতি user-এ একবার, নাকি প্রতি ধরনের operation-এ একবার (প্রস্তাবিত)?
26. **macOS বিকল্প:** WKWebView, CodeMirror আর macOS-এর বিপরীতে ⌃⌘ key-এর M1 checklist-এর দায়িত্ব কার?
27. **Zoom OS মেনে চলবে:** first run-এর পরেও OS-এর text scale মেনে চলবে?
28. **Reviewers field:** ভাগাভাগি করা Reviewers field প্রতিটা group-এর default-এর সাথে মিলবে, নাকি সেগুলোর জায়গা নেবে?
29. **Getting started:** নতুন workspace খোলা পুরনো user-এর জন্যও?

## ২৬. আগের ডকুমেন্টের সাথে অমিল

Owner মেনে নিলে এগুলোর জন্য উল্লিখিত ডকুমেন্টে (দুই ভাষাতেই) পরিবর্তন লাগবে। এখানকার কিছুই এখনো বদলানো হয়নি।

1. **ui-architecture §৮, অনুপস্থিত token role।** যোগ করুন: `accent-indicator`, `danger-action-hover`, `indicator-glyph`, `merge-*-edge`, `merge-active`, `run-running`, `diff-spacer-1`, `diff-spacer-2`, `editor-selection`, `editor-active-line`, `editor-search-match`, `editor-cursor`, `scrim`, `logo-tile`, `logo-thread`, `elevation-0..2`, `radius-*`, `motion-*`, `control-sm/md/lg`, `icon-sm..xl`। এগুলো সংযোজন।
2. **ui-architecture §৮, "All sizes are in rem"।** Border, focus ring, selection bar, merge edge, `pane-gap` আর shadow offset-এর (px) জন্য ব্যতিক্রম (R31)।
3. **ui-architecture §৮, "forced-colors is respected"।** macOS-এর জন্য `prefers-contrast: more` যোগ করুন আর Linux-এর বিষয়ে সিদ্ধান্ত নিন (§২০.৫, খোলা প্রশ্ন 4)।
4. **ui-architecture §১৩ আর PRD §৭ M / §৮-এর glyph।** ✓ ✗ ⏸ – ○ শব্দ সহ SVG icon হিসেবে render করুন; glyph লেখার ধরন হিসেবে থাকুক (R11)।
5. **ui-architecture §৩ / PRD §৮ main window: নতুন job panel region** bottom bar-এর উপরে (R10)।
6. **ui-architecture §৭: input ধাপ** Preview-এর আগে, একই dialog-এ, live নতুন করে plan সহ (§১২.২)।
7. **ui-architecture §৭: "Run stays disabled"** হয়ে যায় দৃশ্যমান কারণ সহ aria-disabled (R18)।
8. **ui-architecture §৭.১ / §১৬: button "Trust selected repos"** হয়ে যায় "Trust 2 repos" (সংখ্যা সহ)।
9. **ui-architecture §৭.১: "dimmed row"** মানে `text-secondary` cell, opacity নয়।
10. **ui-architecture §১০.৪ আর PRD §৮ Changes sketch: Merge Changes-এ "+ all"** সরানো (R13)।
11. **ui-architecture §১০.৮: list-এর নিচের commit box** উপরে চলে যায় (R15)।
12. **PRD §৮ Changes sketch: merge-এর মাঝপথে থাকা repo-র নিচে commit box।** কোনো operation-এ থাকা repo সবসময় commit scope-এর বাইরে থাকে।
13. **PRD Flow 2 ধাপ 4 আর BULK-06: কিছু staged নেই এমন repo skip হয়।** Commit-all mode (R14)।
14. **UX-03 / ui-architecture §১০.৮: এক repo-র commit preview** হলো inline preview line, সাথে protected-branch dialog (R16)।
15. **SAFE-04 "Stash / Skip / Cancel"।** প্রতি repo-তে: Stash / Skip (clean হলে সাথে "Take them along"); Cancel হলো dialog-এর button (R17)।
16. **PRD §৮ preview sketch: `[ Stash and continue ▾ ]`** আগে থেকে বাছা মনে হয়; choice হলো radio, কিছুই আগে থেকে বাছা নয়।
17. **PRD §৮ preview sketch: conflict ✗ failed হিসেবে আর `[Run]`।** Conflict মানে pause (R19); button action-এর নাম বলে ("Sync 2 repos")।
18. **BULK-05 "Show log"।** ভাগ করে "Show Git output" (inline) আর "Show in activity log" (filter করা log)।
19. **ui-architecture §১৫: action-এর পরে focus** (R22), আর pause হওয়া repo failure-এর সাথে গোনা হয়।
20. **ui-architecture §৭ ধাপ 4 / §৯: Undo** v0.1-এ শুধু UI-র local edit-এর জন্য (merge editor); run-এর undo v0.2 (BULK-09)।
21. **Architecture §৯ / PIPE-07: merge-এর সময় Stop** merge রেখে দেয়, যদি না user abort বেছে নেন (R23)।
22. **CONF-02-এর ভাষা** বলা উচিত "resolve every conflict with that side" (R36)।
23. **PRD §৮ sidebar sketch**-এর ক্রম আর "Repos" লেবেল (R8)।
24. **PRD §৮ shortcut table।** "Search repos"-এর নাম বদলে "Filter current screen" (R27); যোগ করুন Mod+P, Mod+T, Mod+Shift+F/D/H/B/R/X, Mod+1..7, Mod+B, Mod+I, Mod+J, F6, ? (shortcut sheet), Mod+O, Mod+Shift+T।
25. **ui-architecture §১১: পরের change-এর জন্য Alt+F5** হয়ে যায় F7, alias সহ (R25)।
26. **ui-architecture §১৪ নিয়ম 2: editor-এর ভেতরে একক-অক্ষরের key।** Merge editor-এর read-only pane ছাড় পায় (I, C, B, R, Space)।
27. **PRD Flow 0 / UX-01: Git identity check আর "Can Git reach GitHub?" check** first run-এর নতুন ধাপ। Identity check Git config লেখে (একটা নতুন, log করা core command)।
28. **GS-05 / GS-13: push credential।** যাঁদের HTTPS login শুধু VS Code-এ আছে, তাঁরা push করতে পারেন না; reachability check সেটা ধরে (খোলা প্রশ্ন 11)।
29. **DASH-07 (P1): stash।** GitHeddle-এর বানানো stash v0.1-এ দেখায় (R37)।
30. **UN-04 link allow-list।** "Git is needed" screen git-scm.com-এর বদলে github.com-এর Git for Windows releases page-এ link করে; নিশ্চিত করুন, বা একটা documentation host allow-list করুন।
31. **PRD §৮ "MERGING · 3 conflicted"** বড় হাতের অক্ষরে লেখার ধরন মাত্র; UI বলে "Merging · 3 conflicted"।
32. **ui-architecture §৭: "every change goes through the preview"।** এক repo-র commit (#14) ছাড়াও তিনটা পরিবর্তন পুরো flow খোলে না: protected নয় এমন branch-এ **Continue merge** Conflicts card থেকে commit করে, যার footer আগে commit message দেখায় ("Will commit: Merge branch 'TK-2636-taosif-Onboarding' into feature-x"); **Use dev for all 6 conflicts** একটা popover-এ নিশ্চিত করে আর একটা file save ও stage করে; **group edit** সরাসরি save হয় (R38)। এগুলোকে ব্যতিক্রম হিসেবে মেনে নিন, বা এক row-এর preview দিয়ে পাঠান।
33. **ui-architecture §১২: "Accept merge … is disabled"**, conflict বাকি থাকার সময়, হয়ে যায় দৃশ্যমান কারণ সহ aria-disabled (R18)।
34. **TASK-02: "create the branch from `origin/<base>`"**, local base-এ এমন commit থাকলে যা origin-এ নেই, R47-এর choice পায়।
35. UI-র জন্য **core-এর নতুন data**: merge, rebase বা cherry-pick শুরুর আগে dirty ছিল এমন file (R48); base-এ শুধু local commit (R47); stash pop এমন file ছোঁবে কি না যা তারপর বদলেছে (§৫.৯, §৭.৫)।

## ২৭. সংশোধনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ৩ নভেম্বর ২০২৬ | প্রথম সংস্করণ, পাঁচটা design-panel প্রস্তাব থেকে panel chair মিলিয়েছেন: যাচাই করা contrast সহ visual language, shell আর layout, প্রতিটা screen-এর গঠন আর state, action flow, pipeline, keyboard map, accessibility, copy deck, নতুন user-এর যাত্রা, mockup-এর তালিকা আর 37টা panel সিদ্ধান্ত। Design review-এর পরে সংশোধিত: script দিয়ে `tokens.css` থেকে নতুন করে বানানো contrast table, dark theme-এর সমাধান (merge check glyph, search match, radio আর switch, coach badge), Switch task, Add/Remove repos, Merge task into…, bulk operation, group editor আর PR Assignees-এর ডিজাইন, একটাই সামঞ্জস্যপূর্ণ উদাহরণের state, default window-এ ধরানোর নিয়ম, আরও নিরাপদ commit-all, abort আর Start task-এর ক্ষেত্র, আর R38–R49 সিদ্ধান্ত। |
