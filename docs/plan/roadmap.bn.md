# GitHeddle — Roadmap

**English version:** [roadmap.en.md](roadmap.en.md)

| | |
|---|---|
| **প্রোডাক্ট** | GitHeddle |
| **ডকুমেন্ট** | Roadmap: v0.1 পর্যন্ত milestone আর work item, আর v0.2 ও v0.3-এর রূপরেখা |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। Effort মাপা হয়েছে Claude Code session-এ, তারিখে না |

**সম্পর্কিত ডকুমেন্ট:** [PRD](../product/PRD.bn.md) · [AI development workflow](../process/ai-development-workflow.bn.md) · [ADR 0001: tech stack](../decisions/0001-tech-stack.bn.md) · [Architecture](../architecture/architecture.bn.md) · [UI architecture](../design/ui-architecture.bn.md) · [Build আর release](../engineering/build-and-release.bn.md) · [Test strategy](../engineering/test-strategy.bn.md) · [Security](../engineering/security.bn.md)

> এই file আর এর ইংরেজি সংস্করণে একই content আছে। একটা বদলালে অন্যটাও একই commit-এ update করতে হবে।

---

## ১. এই roadmap কীভাবে পড়বেন

- **Milestone** `M0` থেকে `M10` পৌঁছে দেয় v0.1-এ, যাতে PRD-র সব P0 requirement আছে। প্রতিটা milestone-এর একটা লক্ষ্য, তার dependency, exit criteria, আর সে কোন কোন PRD ID কভার করে তা দেওয়া আছে।
- **Work item**-এর নাম `M<n>-<nn>` (যেমন `M4-03`)। প্রতিটার মাপ ১ থেকে ৩টা Claude Code session ([AI development workflow §৫](../process/ai-development-workflow.bn.md) দেখুন), আর প্রতিটা সেই ডকুমেন্টের §৪-এর loop মেনে চলে। ID স্থির থাকে: পরে যোগ হওয়া item পরের খালি নম্বর পায়, তাই কোনো table-এ item নম্বরের ক্রমে নাও থাকতে পারে। Table-এ item-গুলো সাজানো আছে যে ক্রমে কাজ হবে সেভাবে।
- **Effort** দেওয়া আছে session-এ (S)। কোনো ক্যালেন্ডার তারিখ নেই। মোট হিসাব মোটামুটি, M1-এর পরে আবার হিসাব করা হবে।
- **"যাচাই"** কলামে আছে owner item-টা কীভাবে check করবেন: **T** = তিন OS-এ CI-তে নামওয়ালা automated test, **S** = CI-এর screenshot, **P** = perf job-এর সংখ্যা, **D** = CI-এর বানানো app-এ demo flow, **R** = pull request-এ লিখিত report।
- Crate আর path-এর নাম [architecture](../architecture/architecture.bn.md) ডকুমেন্টের মতোই। Fixture repo বানায় `tests/fixtures`-এর fixture builder (Rust)। `GS-08` বা `INV-02`-এর মতো নিয়মের ID এসেছে [security](../engineering/security.bn.md) আর [test strategy](../engineering/test-strategy.bn.md) ডকুমেন্ট থেকে।
- প্রতিটা item-কে [workflow](../process/ai-development-workflow.bn.md)-এর §৯-এর Definition of Done-ও মানতে হবে। নিচের acceptance criteria শুধু item-এর নিজস্ব অংশ।
- যেসব item কোনো safety feature বানায়, সেগুলোর test আগে লেখা হয়, নিজস্ব commit বা session-এ, implementation-এর আগে (test strategy §৮)।

## ২. Milestone-এর সারসংক্ষেপ

| Milestone | লক্ষ্য | নির্ভর করে | Effort (S) |
|---|---|---|---|
| M0 | Project setup: repo-র কাঠামো, code `CLAUDE.md`, তিন OS-এ CI-এর কাঠামো, lint/test gate, security-র ভিত্তি | — | ~11 |
| M1 | Spike আর go/no-go gate | M0 | ~11 |
| M2 | Core: `platform`, `git-runner` (command guard সহ), `repo-state`, `storage`, repo trust, error classification | M1 (go) | ~21 |
| M3 | Workspace, dashboard, group | M2 | ~17 |
| M4 | Changes screen, diff view, commit | M2, M3-03 | ~13 |
| M5 | Run engine, bulk operation আর safety rule | M2, M3 | ~16 |
| M6 | Task | M5 | ~7 |
| M7 | Conflicts screen আর merge editor | M4-01, M4-04, M5-07 | ~13 |
| M8 | Pipeline | M5, M6, M7-06 | ~15 |
| M9 | GitHub sign-in আর pull request | M2 (M9-01, M9-02); M6 (M9-03 থেকে) | ~10 |
| M10 | পোক্ত করা: UX, accessibility, performance, installer → v0.1 release | M3–M9 | ~17 |
| | **v0.1 পর্যন্ত মোট** | | **~151** |

## ৩. Milestone আর work item

### ৩.১ M0 — Project setup

**লক্ষ্য:** একটা খালি কিন্তু সম্পূর্ণ project, যেখানে ছোট্ট একটা pull request তিন system-এই প্রতিটা gate পার হয়, আর security-র ভিত্তি শুরু থেকেই চালু।
**নির্ভর করে:** কিছুর ওপর না। **কভার করে:** PLAT-01, PLAT-02, PLAT-04 (ভিত্তি), PERF-09 (মাপা)।
**Exit criteria:** সব gate চালু রেখে ছোট্ট একটা pull request Windows, macOS আর Linux-এ সবুজ; `bundle` label দিলে ৬টা unsigned installer আর তাদের আকার পাওয়া যায়; code `CLAUDE.md`, Claude Code-এর setup আর owner-এর GitHub settings ঠিকঠাক আছে।

| ID | Scope | PRD ID | Acceptance criteria | যাচাই | S |
|---|---|---|---|---|---|
| M0-01 | Repo-র কাঠামো: খালি crate-সহ Cargo workspace, `apps/desktop`-এ Tauri 2 app, React 19 + Vite + strict TS, frozen lockfile আর বন্ধ install script-সহ pnpm, `rust-toolchain.toml`। সর্বশেষ stable version pin করে লিখে রাখা। Security-র ভিত্তি: CSP `default-src 'self'`, isolation pattern, শুধু আমাদের command-ওয়ালা capability file, release build-এ devtools বন্ধ। `tauri-plugin-single-instance`। Shell-এর দায়িত্ব: WebView2-এর browser key আর webview-এর নিজের zoom বন্ধ, native file-drop বন্ধ, macOS-এর native Edit menu, system theme বদলালে UI-কে জানানো। Webview-এর data folder (Windows-এ WebView2-এর user-data folder আর প্রতিটা OS-এর webview data folder) GitHeddle-এর local data folder-এ রাখা, [architecture](../architecture/architecture.bn.md) §১০-এর মতো | PLAT-01 | তিন OS-এই app একটা window খোলে যাতে "GitHeddle" লেখা; প্রতিটা crate compile হয় আর তার একটা pass করা test আছে; দ্বিতীয়বার চালালে প্রথম window-টাই সামনে আসে; F5 আর Ctrl+R page reload করে না; window-এ file ফেললে কিছু হয় না; release build-এ কোনো devtools নেই; প্রতিটা OS-এ webview-এর cache আর data শুধু GitHeddle-এর local data folder-এর ভেতরে লেখা হয় | T, S | 3 |
| M0-02 | Lint, format আর type-এর gate: `rustfmt`, `unwrap_used` বাতিল আর `unsafe_code` নিষিদ্ধ রেখে `cargo clippy -D warnings`, Biome, TS type-check, skip/`.only` lint, GPL-3.0-এর সাথে মানানসই licence নিয়ে `cargo-deny` | — | ইচ্ছে করে `unwrap`, `any` বা `.only` রাখা pull request CI-তে fail করে; পরিষ্কারটা pass করে | T | 1 |
| M0-03 | Test harness: `cargo-nextest`, `insta`, `proptest`; প্রথম fixture builder (একটা পরিষ্কার repo); Vitest + Testing Library; mocked IPC নিয়ে Vite build-এর ওপর Chromium আর WebKit-এ Playwright; `apps/desktop/src/testing/`-এ fake core-এর কাঠামো, যার প্রথম scenario উদাহরণ command-এর record করা L3 transcript থেকে generate করা (scripted scenario চলবে শুধু timing, বিরল error আর scale-এর জন্য, আর scripted বলে চিহ্নিত থাকবে) | PLAT-04 | প্রতিটা ধরনের একটা করে উদাহরণ test CI-তে চলে; fake-core scenario generate করা binding দিয়ে typed; screenshot CI artifact হিসেবে আসে | T, S | 2 |
| M0-04 | [Build আর release](../engineering/build-and-release.bn.md) §৪ অনুযায়ী CI workflow। **প্রতিটা pull request-এ:** তিন OS-এ সর্বশেষ git দিয়ে L1/L2, সাথে Linux-এ git 2.30; Linux আর macOS-এ L5 Playwright (Chromium, WebKit); Linux-এ L3/L4; `main`-এর সাথে `criterion`-এর তুলনা (10 %-এ fail); docs-pair, terminology, skip lint, test-পরিবর্তনের report, coverage ratchet; Playwright report আর screenshot upload। **Label দিলে:** `bundle` আর `perf`। **প্রতি রাতে:** তিন OS × git 2.30 আর সর্বশেষ, পুরো perf বাজেট, chaos suite, fuzzing। **প্রতি সপ্তাহে:** বাড়তি platform, `cargo-mutants`। Windows-এ git 2.30 আসে MinGit থেকে, macOS আর Linux-এ source থেকে build করে cache করা | PLAT-01, PLAT-04 | তালিকার প্রতিটা job ঠিক trigger-এ চলে; job summary-তে যোগ, বদল আর বাদ পড়া test-এর তালিকা থাকে; `perf` label দিলে perf job শুরু হয় | T | 2 |
| M0-05 | `CLAUDE.md`-এর code অংশ; প্রতিটা crate-এর `lib.rs`-এর ওপরে একটা crate-level rustdoc comment (workflow §৬.২); Claude Code-এর project settings (hook, permission, subagent); acceptance checklist আর `tests-changed` checkbox-সহ pull request template; template হিসেবে একটা উদাহরণ `tauri-specta` command | — | Content workflow-এর §৬–§৭-এর সাথে মেলে; উদাহরণ command-এর binding generate আর commit করা | R | 1 |
| M0-06 | `bundle` label দিয়ে packaging smoke: `tauri-action` v0.1-এর ৬টা installer unsigned অবস্থায় বানায়: Windows x64 আর ARM64 `.exe` (NSIS per user), macOS arm64 আর x64 `.dmg`, AppImage আর `.deb` | PLAT-02, PERF-09 | ৬টা installer-ই CI artifact; আকারের table job summary-তে | P, D | 1 |
| M0-07 | Owner-এর GitHub settings (owner-এর কাজ; checklist লেখে Claude Code): private vulnerability reporting, push protection-সহ secret scanning, Dependabot alert, একটা tag ruleset যাতে শুধু owner `v*` tag বানাতে পারেন, আর `main`-এ এমন branch protection যা সবুজ CI চায় কিন্তু approve করা review চায় না | — | Pull request-এর checklist-এ owner প্রতিটা setting-এর screenshot দিয়ে টিক দেন | R | 1 |

### ৩.২ M1 — Spike আর go/no-go gate

**লক্ষ্য:** feature বানানোর আগে প্রমাণ করা যে stack-টা তিনটা webview-তেই গতি, memory আর আকারের কঠিন লক্ষ্য মেটাতে পারে।
**নির্ভর করে:** M0। **কভার করে:** PERF-01, PERF-02, PERF-03, PERF-06, PERF-07, PERF-08, PERF-09, CONF-03, CONF-06 (শুধু prototype)।
**Exit criteria:** নিচের gate-এর সিদ্ধান্ত হয়ে গেছে আর দুই ভাষায় লিখে রাখা হয়েছে। Spike-এর code ফেলে দেওয়া যায়; `tools/perf`-এর মাপার harness থেকে যায়।

**M1 go/no-go gate।** তিন OS-এর CI runner-এ এগুলো হলে Tauri নিশ্চিত হবে: 5,000 row-এর virtualised list চোখে পড়ার মতো jank ছাড়া scroll হয় আর 100 ms-এর মধ্যে সাড়া দেয় (PERF-03/08); 10,000 লাইনের diff 300 ms-এর মধ্যে আর একটা prototype 3-pane merge view 500 ms-এর মধ্যে খোলে (PERF-06); cold start PERF-01-এর লক্ষ্যের নিচে; 30টা fixture repo নিয়ে RAM 250 MB-এর নিচে (PERF-07); installer 60 MB-এর নিচে (PERF-09)। WebKitGTK বা WKWebView fail করলে আর spike-এর মধ্যে ঠিক করা না গেলে Electron-এ যাওয়া হবে। আলাদাভাবে, Windows-এ 30টা repo-র `status` যদি process spawn-এর খরচের কারণে PERF-02 মিস করে, তাহলে শুধু read path-এর জন্য `gix` নেওয়া হবে।

Gate কীভাবে মাপা হয়:

- M1-এর প্রতিটা সংখ্যা মাপা হয় production-এর security settings চালু রেখে: CSP, isolation pattern আর devtools বন্ধ। Isolation pattern-এর IPC খরচ PERF-06-এর হিসাবে ধরা হয়।
- প্রতিটা installer মাপা হয়। Bundle করা library ছাঁটার পরেও AppImage 60 MB-এর বেশি হলে ADR-এ সেটা শুধু AppImage-এর জন্য PERF-09-এর একটা জানা ব্যতিক্রম হিসেবে লেখা হয়। `.exe`, `.dmg`, `.deb` আর `.rpm`-কে তখনও 60 MB-এর নিচে থাকতে হবে।
- RAM-এর হিসাবে app আর তার সব webview process ধরা হয়।

| ID | Scope | PRD ID | Acceptance criteria | যাচাই | S |
|---|---|---|---|---|---|
| M1-01 | Virtual list spike: TanStack Virtual দিয়ে 5,000টা file row, Playwright-এ (Chromium, WebKit) আর তিন OS-এর আসল app-এ মাপা; tree-র জন্য React Aria-র নিজের virtualiser-ও চেষ্টা করা | PERF-03, PERF-08 | প্রতিটা OS-এর input-to-paint আর frame-এর সময় report করা; gate মেটে, নয়তো কোন webview fail করছে আর কেন তা বলা; বেছে নেওয়া virtualiser screen reader-কে ঠিক level, position আর set size দেয় | P, R | 2 |
| M1-02 | Diff আর merge spike: 10,000 লাইনের fixture file-এ `imara-diff`; `@codemirror/merge` Rust-এ হিসাব করা chunk নেয় কি না তা যাচাই; Rust-এ হিসাব করা data দিয়ে তিনটা EditorView align করা, scroll একসাথে | PERF-06, CONF-03, CONF-06 | প্রতিটা OS-এ খোলার সময় 300 ms / 500 ms-এর সাথে তুলনা; record করা screenshot-এর ক্রমে scroll করার সময়ও alignment ঠিক থাকে; `@codemirror/merge` নিয়ে লিখিত হ্যাঁ/না। না হলে দুটো diff mode-ই shared aligned-panes layer-এ করার পরিকল্পনা; JS-এ কখনো দ্বিতীয় কোনো diff engine থাকবে না | P, S, R | 3 |
| M1-03 | Git spawn spike: `tokio::process` + `process-wrap` দিয়ে 30টা fixture repo-তে `status --porcelain=v2 --branch -z`, Windows-এ `CREATE_NO_WINDOW` | PERF-02, PERF-05 | প্রতিটা OS-এ 10 আর 30টা repo-র মোট সময়; কোনো console window ঝলকে ওঠে না; app বন্ধ করলে child process-ও বন্ধ হয়। `gix` read লাগবে কি না তা লিখে রাখা | P, R | 2 |
| M1-04 | `tools/perf`-এ start, RAM আর আকারের harness: cold আর warm start থেকে প্রথম paint, 30টা repo খোলা অবস্থায় RAM (app আর webview process), প্রতিটা installer-এর আকার, AppImage মাপা হয় ছাঁটার পরে | PERF-01, PERF-07, PERF-09 | Harness তিন OS-এ চলে আর তুলনা করার মতো table লেখে; পরের বাজেটের জন্য রেখে দেওয়া হয়; 60 MB-এর বেশি AppImage ওপরের ব্যতিক্রম হিসেবে লিখে রাখা হয় | P | 2 |
| M1-06 | প্রতিটা webview-এ shell-এর দায়িত্ব যাচাই: browser key আর webview-এর নিজের zoom বন্ধ, file-drop বন্ধ অথচ page-এর ভেতরের drag-and-drop চলে, macOS Edit menu দিয়ে ⌘C/⌘V/⌘X/⌘A/⌘Z কাজ করে, system theme বদলালে UI-তে পৌঁছায় | PLAT-05, PLAT-06, UX-08 | Report-এ প্রতিটা webview-এর pass/fail table; প্রতিটা failure-এর জন্য নির্দিষ্ট fix বা workaround | R, S | 1 |
| M1-05 | Gate-এর সিদ্ধান্ত: সংখ্যাগুলো জড়ো করা, সিদ্ধান্ত (Tauri না Electron; শুধু CLI না `gix` read; AppImage ব্যতিক্রম কি না; `@codemirror/merge` না aligned-panes layer) ADR-এর update হিসেবে দুই ভাষায় লেখা; roadmap আবার হিসাব করা | ওপরের সবগুলো | সিদ্ধান্তে gate-এর প্রতিটা সংখ্যা উল্লেখ আছে; owner sign off করেন | R | 1 |

### ৩.৩ M2 — Core crate

**লক্ষ্য:** যে core-এর ওপর প্রতিটা feature দাঁড়ায়: command guard-সহ নিরাপদে git চালানো, job runner, repo trust, repo-র status, watcher, error classification আর persistence।
**নির্ভর করে:** M1 (go)। **কভার করে:** SAFE-01, SAFE-02, SAFE-05, SAFE-06 (guard layer), PLAT-03, BULK-04, BULK-05, BULK-08, DASH-01 (trust), DASH-02, DASH-04, PERF-02, PERF-04, PERF-05, PERF-07, UX-04 (code)।
**Exit criteria:** কোনো UI ছাড়াই একটা test তিন OS-এ 30টা fixture repo খুলতে, untrusted repo-তে প্রতিটা command বাতিল করতে, trusted repo-গুলোর পুরো status পড়তে, PERF-04-এর বাজেটের মধ্যে file পরিবর্তনে সাড়া দিতে, read চলতে থাকা অবস্থায় cancel-সহ একটা parallel job চালাতে, আর activity log-এ প্রতিটা command খুঁজে পেতে পারে।

| ID | Scope | PRD ID | Acceptance criteria | যাচাই | S |
|---|---|---|---|---|---|
| M2-01 | `crates/platform`: `git` খুঁজে বের করা (absolute path, version ≥ 2.30, `.bat`/`.cmd` বাতিল), macOS-এর login-shell PATH, path আর line ending-এর helper, প্রতিটা volume ধরে case-sensitivity check, পরিষ্কার "git নেই" error, আর একমাত্র launcher module যেটা editor, terminal আর file manager চালাতে পারে | PLAT-03, SAFE-05 | তিন OS-এ test pass করে, git না থাকার case আর space ও non-ASCII অক্ষরওয়ালা path সহ; Clippy-র নিয়ম শুধু launcher module-এ process চালানোর অনুমতি দেয় | T | 2 |
| M2-06 | `crates/storage`: migration-সহ SQLite (bundled, WAL, `synchronous=FULL`); atomic JSON লেখা (temp file, fsync, rename) | Reliability (PRD §৯) | লেখার মাঝখানে writer kill করা একটা test-এ হয় পুরনো file থাকে নয়তো নতুনটা, কখনো ভাঙা file না | T | 2 |
| M2-02 | `crates/git-runner`-এর process layer: শুধু argv দিয়ে spawn, stdin null, `GIT_TERMINAL_PROMPT=0`, background read-এ `GIT_OPTIONAL_LOCKS=0`, watchdog timeout, বন্ধ হলে kill; ফলাফলে exit code, output আর সময় | SAFE-05, PERF-05 | Test দেখায় user-এর hook আর config ব্যবহার হয়, আটকে যাওয়া command timeout-এর পরে kill হয়, আর কখনো কোনো shell জড়িত থাকে না | T | 2 |
| M2-09 | `git-runner`-এ command guard (GS-07): `--force` বাতিল (শুধু confirmation token-সহ `--force-with-lease`), `+` refspec, `--no-verify`, `-c core.hooksPath` আর `-c credential.helper` বাতিল, confirmation token ছাড়া protected branch-এ লেখা বাতিল, আর untrusted repo-তে যেকোনো command বাতিল; `--end-of-options` / `--` আর `check-ref-format` বাধ্যতামূলক। আগে test | SAFE-01, SAFE-02, SAFE-05, SAFE-06 | INV-02 আর INV-05-এর property test pass করে; guard পার না হয়ে কোনো argument list process-এ পৌঁছাতে পারে না (test) | T | 2 |
| M2-03 | `git-runner`-এর job queue: action-এর parallel limit (default 4), আলাদা 8-এর read pool, প্রতি repo-তে write lock, প্রতিটা repo-র আলাদা ফল, progress event, এমন cancel যা নতুন repo শুরু করে না আর চলতি command শেষ হতে দেয়, একটার failure অন্যগুলো থামায় না | BULK-04, BULK-05, PERF-05 | 10টা fixture repo দিয়ে test-এ limit, cancel আর মাঝপথে একটা failure কভার করা; ৪টা লম্বা write action-এর limit ভরে রাখলেও status read চলতে থাকে | T | 2 |
| M2-04 | Activity log: `git-runner` প্রতিটা command-এর জন্য একটা activity record (repo, command, exit code, সময়, output) একটা subscription দিয়ে পাঠায়; shell-এ জোড়া একটা log sink record-গুলো `storage`-এ লেখে। `git-runner` কখনো `storage`-এর ওপর নির্ভর করে না | BULK-08 | M2-02/03-এর প্রতিটা test log-এ নিজের command খুঁজে পায়; INV-09 (spawn-এর সংখ্যা = log entry-র সংখ্যা) pass করে | T | 1 |
| M2-11 | Core-এর error classification: `git-runner` exit code আর জানা stderr pattern-কে স্থির error code-এ রূপান্তর করে; command `UserError` ফেরত দেয় code আর parameter হিসেবে, আর লেখা থাকে UI-এর `copy/` catalogue-এ। Classification শুধু message বাছে, repo-র state নিয়ে app যা বিশ্বাস করে তা কখনো বদলায় না (GS-12) | UX-04, BULK-05 | Fixture-এ প্রতিটা জানা failure-এর code-এর snapshot test (dirty pull, non-fast-forward push, `index.lock`, hook rejected, auth failed); অজানা error হয় raw লেখাসহ "git failed" | T | 2 |
| M2-10 | `crates/workspace`-এ repo trust (GS-08): repo যোগ হলে তার local config পড়ে এগুলো চিহ্নিত করা: command-মানের `core.fsmonitor` (`true`/`false` না), `core.sshCommand`, আমরা ব্যবহার করব এমন `core.pager`/`core.editor` override, filter/diff/merge driver, আর `include.path`/`includeIf`-এর target। Trust সেভ হয় repo-র path আর তার config-এর hash ধরে; untrusted repo-তে বাকি সব command guard (M2-09) বাতিল করে | DASH-01, SAFE-05 | Fixture FX-28 (বিপজ্জনক config): trust-এর আগে config পড়া ছাড়া আর কিছু চলে না; config বদলালে repo আবার untrusted হয়ে যায় | T | 2 |
| M2-05 | `crates/repo-state`-এর parser আর model: porcelain v2 status, `for-each-ref`, `rev-list --left-right --count` দিয়ে ahead/behind, চলতি operation চেনা, `ls-files -u -z`; প্রতিটা parser-এর জন্য `proptest` আর একটা fuzz target | DASH-02 | পরিষ্কার, dirty, staged, untracked, renamed, merging, rebasing, cherry-picking, detached আর diverged repo-র fixture-এ snapshot test; parser কখনো panic করে না | T | 3 |
| M2-07 | Watcher আর cache: `.git` আর worktree-এ debouncing-সহ `notify`, ignore filtering, প্রতি repo-তে মোটামুটি 150 ms-এ একবার refresh, window focus পেলে refresh, শেষ জানা state disk-এ cache; শুধু trusted repo | DASH-04, PERF-02, PERF-04, PERF-07 | Fixture repo-তে একটা পরিবর্তন বাজেটের মধ্যে একটাই refresh দেয়; 60 সেকেন্ডের idle test-এ idle CPU প্রায় শূন্য; untrusted repo কখনো refresh হয় না | T, P | 2 |
| M2-08 | Blob আর index stage পড়ার জন্য প্রতি repo-তে দীর্ঘস্থায়ী `cat-file --batch` | CHG-04, CONF-03 (ভিত্তি) | Conflicted fixture-এর base/current/incoming stage পড়ে; process মরে গেলে আবার চালু হয় | T | 1 |

### ৩.৪ M3 — Workspace, dashboard আর group

**লক্ষ্য:** User একটা folder খোলেন, untrusted repo-গুলো একবারেই approve করেন, আর এক screen-এ প্রতিটা repo-র live state দেখেন, repo select করতে আর group সামলাতে পারেন।
**নির্ভর করে:** M2। **কভার করে:** DASH-01–06, GRP-01–03, CFG-01, CFG-02, PLAT-05, PLAT-06, UX-05, UX-08, UX-09, PERF-02, PERF-03।
**Exit criteria:** "30-repo fixture খোলো, চিহ্নিত repo-টাকে trust করো, 2 সেকেন্ডের মধ্যে live state দেখো, dirty repo filter করো, ৩টা select করো, একটা group বানাও" demo-টা তিন OS-এ CI-এর বানানো app-এ চলে।

| ID | Scope | PRD ID | Acceptance criteria | যাচাই | S |
|---|---|---|---|---|---|
| M3-01 | `crates/workspace`: একটা folder বা `.code-workspace` file খোলা (শুধু folder path), nested repo-সহ repo খুঁজে বের করা, depth configure করা যায়; নতুন repo trust scan (M2-10) দিয়ে যায় | DASH-01 | Nested repo আর একটা `.code-workspace` file-ওয়ালা fixture-এ ঠিক প্রত্যাশিত repo-গুলোই পাওয়া যায় | T | 2 |
| M3-02 | Per-repo override-সহ settings model, JSON-এ সেভ; CFG-01-এর প্রতিটা field-এর জন্য settings screen | CFG-01, CFG-02 | Per-repo base branch status-এ default-কে override করে; restart-এর পরও settings থাকে | T, S | 2 |
| M3-03 | App shell-এর UI: top bar, sidebar, মাঝখান, right panel, bottom bar; core-এর পাঠানো system theme অনুসরণ করা light আর dark theme-সহ design token; আমাদের নিজের zoom পথ দিয়ে zoom; window-এর আকার আর layout মনে রাখা | PLAT-06, UX-08, UX-09 | দুই theme-এর screenshot; system theme বদলালে app-ও বদলায়; Ctrl+= / ⌘= লেখা বড় করে আর webview-এর নিজের zoom কিছু করে না; restart-এর পরে layout ফিরে আসে; দ্বিতীয়বার চালালে এই window-টাই সামনে আসে | S, T | 2 |
| M3-09 | Trust prompt: প্রতিটা workspace-এ একবারই জিজ্ঞেস করা, চিহ্নিত repo আর তাদের config key-এর তালিকাসহ; untrusted repo dashboard-এ "Needs review" দেখায় | DASH-01, UX-04 | Prompt-এর screenshot; একটা Playwright test একটা repo trust করে আর একটাকে "Needs review" রেখে দেয় | S, T | 2 |
| M3-04 | Dashboard table: DASH-02-এর প্রতিটা column (virtualised না, বড়জোর 50টা repo), শেষ জানা state সাথে সাথে দেখানো, তারপর event দিয়ে live পরিবর্তন | DASH-02, PERF-02, PERF-03 | 30-repo fixture: প্রথম paint-এ cache করা state, তিন OS-এ 2 সেকেন্ডের মধ্যে live | S, P, D | 3 |
| M3-05 | Search, filter আর sort (dirty, behind, conflict, unpushed, group, task); checkbox দিয়ে selection | DASH-03, DASH-05 | প্রতিটা filter আর sort-এর UI test; refresh-এর পরও selection থাকে | T, S | 2 |
| M3-06 | Row-এর action: configure করা editor, terminal, file manager-এ খোলা (`platform` launcher দিয়ে); GitHub-এ খোলা | DASH-06 | প্রতিটা OS-এ প্রতিটা action repo-র path দিয়ে ঠিক program চালায় (spawn test); macOS-এ হাতে check | T, D | 1 |
| M3-07 | Group: বানানো, নাম বদলানো, edit, মোছা, workspace-এর সাথে সেভ; target picker (সব, group, selection, task) | GRP-01, GRP-02, GRP-03 | Restart-এর পরও group থাকে; test-এ target picker ঠিক repo-গুলো বের করে | T, S | 2 |
| M3-08 | Command palette (React Aria dialog-এর ভেতরে cmdk) আর shortcut-এর কাঠামো, Windows/Linux-এ Ctrl আর macOS-এ ⌘; macOS Edit menu-র item registry-র command ডাকে | UX-05, PLAT-05 | Register করা প্রতিটা action নাম দিয়ে পাওয়া যায়; প্রতিটা OS-এ shortcut PRD-র table-এর সাথে মেলে; F5 (macOS-এ ⌘R) page reload না করে repo refresh করে; Windows-এ page-এর ভেতরের drag and drop কাজ করে (native file-drop বন্ধ) | T, S | 1 |

### ৩.৫ M4 — Changes screen, diff view আর commit

**লক্ষ্য:** সব repo জুড়ে VS Code-এর মতো change, দ্রুত diff আর একটা repo-তে commit।
**নির্ভর করে:** M2, M3-03। **কভার করে:** CHG-01–07, SAFE-02 (commit), SAFE-03 (discard), PERF-06, PERF-08।
**Exit criteria:** "২টা fixture repo-তে file বদলাও, সেগুলো দলে ভাগ হয়ে দেখো, একটা diff খোলো, একটা file stage করো, ticket prefix দিয়ে commit করো" demo-টা তিন OS-এ চলে; diff-এর সময়ের বাজেট মেটে।

| ID | Scope | PRD ID | Acceptance criteria | যাচাই | S |
|---|---|---|---|---|---|
| M4-01 | `crates/diff-engine`-এর line diff (`imara-diff`, histogram) আর word diff (`similar`), বড় file-এর জন্য chunking | CHG-04, PERF-06 | Fixture জোড়ায় snapshot test; `criterion`-এ 10,000 লাইনের diff 300 ms-এর অনেক ভেতরে হিসাব হয় | T, P | 2 |
| M4-02 | Changes list: প্রতিটা repo-র জন্য একটা section, তাতে Merge Changes, Staged Changes আর Changes, count, folder, `+/−` আর status letter-সহ file row; virtualised; screen দেখা গেলে তবেই line count-এর subscription | CHG-01, CHG-02, PERF-08 | 5,000 file-এর fixture মসৃণভাবে scroll হয়; screenshot design-এর সাথে মেলে; accessibility tree-তে level, position আর set size দেখা যায় | S, P | 3 |
| M4-03 | Flat list / folder tree-এর toggle আর সব repo জুড়ে file-এর নাম দিয়ে filter | CHG-03 | দুটো view আর filter-এর UI test | T, S | 1 |
| M4-04 | Diff view: পাশাপাশি আর inline, syntax highlighting, word-level highlight, বড় file অংশে ভাগ করে দেখানো; M1-05-এর সিদ্ধান্ত অনুযায়ী `@codemirror/merge` বা aligned-panes layer দিয়ে আঁকা | CHG-04, PERF-06 | তিন OS-এ 10,000 লাইনের diff 300 ms-এর মধ্যে খোলে; UI নিজে কোনো diff হিসাব করে না | S, P | 3 |
| M4-05 | একটা file, আর পুরো একটা section, stage আর unstage | CHG-05 | প্রতিটা action-এর পরে fixture test index দেখে | T | 1 |
| M4-06 | Context menu: editor-এ খোলা, diff খোলা, stage/unstage, কী হারাবে তার তালিকা দেখিয়ে confirm করে discard, path copy, file manager-এ দেখানো | CHG-06, SAFE-03 | Confirm ছাড়া discard অসম্ভব (test); dialog হুবহু file-গুলোর তালিকা দেখায় | T, S | 2 |
| M4-07 | Branch-এর ticket key দিয়ে আগে থেকে ভরা message-সহ একটা repo-তে commit; protected branch-এ সতর্কবার্তা আর confirmation | CHG-07, SAFE-02 | Default pattern-এর prefill test; `dev`-এ commit করতে গেলে আগে জিজ্ঞেস করে | T, D | 1 |

### ৩.৬ M5 — Run engine, bulk operation আর safety rule

**লক্ষ্য:** প্রথম দিন থেকেই crash-safe একটা run engine, preview → run → result-সহ P0-এর প্রতিটা bulk operation, আর প্রতিটা safety rule দুই স্তরে প্রয়োগ (guard আর preflight)।
**নির্ভর করে:** M2, M3। **কভার করে:** BULK-01, BULK-03–06, BULK-08, SAFE-01–07, UX-02, UX-03, UX-04, PIPE-07 (ভিত্তি)।
**Exit criteria:** প্রতিটা `SAFE-*` নিয়মের একটা fixture test আছে যা তিন OS-এ pass করে; bulk action-এ CH-01..03 chaos test pass করে; "৫টা repo-তে Pull, একটা dirty, একটা fail করছে" demo-তে preview, progress আর ঠিকঠাক result summary দেখা যায়।

| ID | Scope | PRD ID | Acceptance criteria | যাচাই | S |
|---|---|---|---|---|---|
| M5-01 | `crates/pipeline`-এ ন্যূনতম run engine আর journal: operation catalogue, প্রতিটা bulk action এক ধাপের run হিসেবে, SQLite-এ write-ahead journal, restart-এর পরে reconciliation (কোনো write নিজে থেকে আবার চলে না)। M8-03 একে বহু ধাপের pipeline পর্যন্ত বাড়ায় | BULK-04, BULK-05, PIPE-07, Reliability (PRD §৯) | Bulk push আর pull-এ CH-01..03 chaos test: kill-এর পরে recovery তালিকা ঠিক প্রভাবিত repo-গুলো আর তাদের আসল state দেখায় | T | 3 |
| M5-07 | Preview engine: প্রতিটা repo-র plan, সাথে সতর্কবার্তা (dirty, diverged, protected, করার কিছু নেই), repo-র টিক তুলে দেওয়া, চালানোর ঠিক আগে preflight-এ state আবার check | BULK-03, UX-03, SAFE-07, GRP-03 | Preview-এর পরে বদলানো repo আবার check হয় আর report হয়, অন্ধভাবে চলে না (INV-07) | T, S | 3 |
| M5-02 | Fetch (preview ছাড়া), শুধু fast-forward pull, push; force শুধু force-with-lease হিসেবে, স্পষ্ট confirmation দিয়ে | BULK-01, SAFE-01 | কোনো code path সাধারণ `--force` তৈরি করতে পারে না (guard আর INV-02); diverged pull থেমে report করে (INV-08) | T | 2 |
| M5-03 | Local branch switch, তৈরি আর মোছা; uncommitted change থাকলে Stash (`githeddle/<task>`), Skip বা Cancel, আর ফেরার সময় pop | BULK-01, SAFE-03, SAFE-04 | INV-01 আর INV-04: কোনো change কখনো হারায় না; unmerged branch মুছতে গেলে commit-গুলোর তালিকা দেখিয়ে জিজ্ঞেস করে | T | 2 |
| M5-04 | Stash / pop, merge, আর অনেক repo-র জন্য এক message-এ Commit Selected, যেসব repo-তে কিছু stage করা নেই সেগুলো বাদ | BULK-01, BULK-06 | প্রতিটার fixture test; বাদ পড়া repo result-এ skipped হিসেবে দেখায় | T | 2 |
| M5-05 | Protected branch (default `main`, `master`, `dev`, configure করা যায়) আর preflight-এ চলতি-operation guard (merging বা rebasing repo-তে কোনো operation না, যদি না সেটা ওই অবস্থার জন্যই হয়) | SAFE-02, SAFE-06 | প্রতিটা protected action আর প্রতিটা চলতি অবস্থার জন্য INV-03 আর INV-06 | T | 1 |
| M5-06 | Progress আর result-এর UI: প্রতিটা repo-র progress, cancel, সফল/বাদ/ব্যর্থ-এর summary, Retry failed, Open terminal, Show log; activity log screen; M2-11-এর প্রতিটা error code-এর জন্য `copy/` catalogue; UX-02 অনুযায়ী tooltip | BULK-04, BULK-05, BULK-08, UX-02, UX-04 | প্রতিটা অবস্থার screenshot; প্রতিটা error repo, ধাপ আর পরের করণীয়ের নাম বলে | S, D | 3 |

### ৩.৭ M6 — Task

**লক্ষ্য:** একাধিক repo জুড়ে কাজের একক হবে task।
**নির্ভর করে:** M5। **কভার করে:** TASK-01–04, BULK-06, UX-06, UX-07।
**Exit criteria:** "২টা fixture repo-তে Start Task `TK-2636 Onboarding`, একটা dirty repo থাকা অবস্থায় অন্য task-এ switch, আবার ফিরে এসে stash pop" demo-টা তিন OS-এ চলে।

| ID | Scope | PRD ID | Acceptance criteria | যাচাই | S |
|---|---|---|---|---|---|
| M6-01 | Task model আর branch pattern (`{ticket}-{user}-{title}`), workspace-এর সাথে সেভ | TASK-01 | Default pattern থেকে `TK-2636-taosif-Onboarding` আসে; তৈরি হওয়া প্রতিটা নাম `git check-ref-format` পার হয়; preview-তে নাম edit করা যায় | T | 1 |
| M6-02 | Start Task: tree check, fetch, base fast-forward, `origin/<base>` থেকে branch, switch, ঐচ্ছিকভাবে upstream-সহ push; branch আগে থেকে থাকলে switch করার প্রস্তাব | TASK-02, UX-07 | নতুন, আগে থেকে local-এ থাকা আর remote-এ থাকা branch-এর fixture test; dashboard থেকে বড়জোর ৩ click | T, D | 2 |
| M6-03 | Top bar-এ active task; SAFE-04-এর নিয়ম মেনে Switch Task | TASK-03, SAFE-04 | Fixture test: dirty repo stash বা skip হয়, কখনো discard না | T, D | 2 |
| M6-04 | Task-এ repo যোগ বা task থেকে বাদ | TASK-04 | দুটোরই test; task-এর repo-র তালিকা সব জায়গায় update হয় | T | 1 |
| M6-05 | Task screen আর Commit Task; খালি অবস্থার লেখা ("No task yet. Start a task") | BULK-06, UX-06 | Screenshot; Commit Task শুধু staged repo-তেই commit করে | S, T | 1 |

### ৩.৮ M7 — Conflicts screen আর merge editor

**লক্ষ্য:** সব repo জুড়ে প্রতিটা conflict খুঁজে বের করা, আর Visual Studio-র মতো তিন pane-এর editor-এ resolve করা।
**নির্ভর করে:** M4-01, M4-04, M5-07। **কভার করে:** CONF-01–11।
**Exit criteria:** "২টা fixture repo-তে conflict হয় এমন একটা branch merge করো, merge editor-এ দুটোই resolve করো, Continue all" demo-টা তিন OS-এ চলে; merge editor 10,000 লাইনের file 500 ms-এর মধ্যে খোলে।

| ID | Scope | PRD ID | Acceptance criteria | যাচাই | S |
|---|---|---|---|---|---|
| M7-01 | `diff-engine`-এর conflict model: conflict region আসে Git-এর worktree marker থেকে (`merge`, `diff3`, `zdiff3` style), pane-এর লেখা stage 2 আর 3 থেকে (base stage 1 থেকে), Result-এর লেখা পাঠানো হয় conflict-এর অংশ ফাঁকা রেখে আর সাথে region-এর তালিকা, তিন pane-এর alignment data, marker খোঁজা | CONF-05, CONF-06, CONF-11 | Conflict fixture-এ snapshot test (৬টা conflict-ওয়ালা একটা `.csproj` সহ); `git merge-file` ব্যবহার হয় শুধু test-এর মানদণ্ড হিসেবে (take all current / all incoming এর সাথে মেলে) | T | 3 |
| M7-02 | Conflicts screen: merge, rebase বা cherry-pick চলা repo, তাদের file আর conflict-এর সংখ্যা; প্রতিটা file-এ: খোলা, take current, take incoming, external tool-এ খোলা | CONF-01, CONF-02 | প্রতিটা action-এর fixture test; screenshot | T, S | 2 |
| M7-03 | Merge editor-এর pane: বাঁয়ে Incoming, ডানে Current, নিচে Result, align করা লাইন, একসাথে scroll, syntax আর word highlight, resolve না হওয়া conflict placeholder হিসেবে আঁকা। Operation অনুযায়ী pane-এর title: **merge**-এ Current = stage 2 (আপনি যে branch-এ আছেন), Incoming = stage 3 (`MERGE_HEAD`); **rebase**-এ Current = stage 2 (যে commit-এর ওপর গড়া হচ্ছে), Incoming = stage 3 (আপনার যে commit আবার বসানো হচ্ছে); **cherry-pick**-এ Current = stage 2 (HEAD), Incoming = stage 3 (বেছে নেওয়া commit) | CONF-03, CONF-06 | Screenshot-এর ক্রম দেখায় scroll-এর সময় alignment ঠিক থাকে, Chromium আর WebKit-এ; merge, rebase আর cherry-pick fixture-এ title ঠিক; খোলার সময় 500 ms-এর মধ্যে | S, P | 3 |
| M7-04 | প্রতিটা conflict-এ checkbox (দুই দিকই, টিক দেওয়ার ক্রমে), হাতে edit করা যায় এমন Result, take all incoming / current | CONF-04, CONF-08 | প্রতিটা checkbox-এর সমন্বয় আর ক্রমের UI test | T, S | 2 |
| M7-05 | Button আর F8 / Shift+F8 দিয়ে পরের / আগের conflict, "Conflict 2 of 6" counter, বাকি থাকা conflict-এর সংখ্যা | CONF-07 | UI test | T | 1 |
| M7-06 | Accept merge (সেভ, stage, repo-র পরের file খোলা, তারপর পরের repo), resolve না হওয়া পর্যন্ত বন্ধ; Continue, Abort, Continue all; marker থেকে গেলে Continue বন্ধ | CONF-09, CONF-10, CONF-11 | Fixture test: marker থাকলে Continue বাতিল হয়; Continue all প্রতিটা repo শেষ করে | T, D | 2 |

### ৩.৯ M8 — Pipeline

**লক্ষ্য:** সেভ করা, edit করা যায়, আবার চালু করা যায় এমন বহু ধাপের run, অনেক repo জুড়ে, built-in Sync with Base আর Merge Task Into সহ।
**নির্ভর করে:** M5, M6, M7-06। **কভার করে:** PIPE-01–10, TASK-05, TASK-06, SAFE-01, SAFE-02, UX-03।
**Exit criteria:** "২টা repo-তে 'Update from main, merge into dev' চালাও, একটা conflict-এ থেমে যায়, resolve করো, Resume, run-এর মাঝখানে app বন্ধ করে আবার খোলো, শেষ করো" demo-টা তিন OS-এ চলে; CH-01..07 chaos suite pass করে।

| ID | Scope | PRD ID | Acceptance criteria | যাচাই | S |
|---|---|---|---|---|---|
| M8-01 | `crates/pipeline`-এ pipeline-এর data model: ধাপের ক্রমিক তালিকা, `{current}`, `{base}`, `{task}` variable, workspace-এর সাথে সেভ | PIPE-01, PIPE-04 | Round-trip test; প্রতিটা repo-র জন্য variable ঠিক মান পায় | T | 2 |
| M8-02 | ধাপ: Fetch, Update from branch, Push, Switch branch, Integrate into branch (merge, rebase), Wait for confirmation | PIPE-02, PIPE-03 | প্রতিটা ধাপ আর পদ্ধতির fixture test; push করা branch-এ rebase করলে force-with-lease confirmation লাগে | T | 3 |
| M8-03 | M5-01-এর run engine-কে বহু ধাপের run পর্যন্ত বাড়ানো: প্রতিটা repo-র state machine, failure বা conflict-এ থামা, Resume, Skip step, Stop; শুরুর branch-এ ফেরা; restart-এর পরও টিকে থাকা | PIPE-06, PIPE-07, Reliability (PRD §৯) | CH-01..07 chaos suite pass করে; stateful property test reference model-এর সাথে মেলে; ফল বদলে যাবে এমন ক্ষেত্রে Resume কখনো একটা ধাপ দুবার চালায় না | T | 3 |
| M8-04 | পুরো run-এর preview: প্রতিটা repo × ধাপ, সতর্কবার্তা, protected branch আর force-with-lease push-এর জন্য একবারই confirmation | PIPE-05, SAFE-01, SAFE-02, UX-03 | Run-level confirmation ছাড়া কোনো protected push হয় না, তার test | T, S | 2 |
| M8-05 | Run screen-এর grid (✓ ✗ ⏸ – ○), cell-এ click করলে তার command আর output দেখায় | PIPE-08 | প্রতিটা cell অবস্থার screenshot | S, T | 2 |
| M8-06 | Pipeline editor-এর UI; ৩টা তৈরি pipeline; built-in হিসেবে Sync with Base আর Merge Task Into; sidebar, task আর palette থেকে চালানো | PIPE-09, PIPE-10, TASK-05, TASK-06 | Built-in-গুলো fixture-এ প্রত্যাশিত ফল দেয়; প্রতিটা প্রবেশপথ একটা run শুরু করে | T, D | 3 |

### ৩.১০ M9 — GitHub sign-in আর pull request

**লক্ষ্য:** নিরাপদে sign in, আর browser ছাড়াই একটা task-এর pull request তৈরি আর অনুসরণ।
**নির্ভর করে:** M9-01 আর M9-02-এর জন্য M2; M9-03 থেকে M6; M9-06-এর জন্য M8-02। **কভার করে:** PR-01, PR-02, PR-03, PR-05, PR-11, PIPE-03 (pull request পদ্ধতি), DASH-06 (GitHub-এ খোলা)।
**Exit criteria:** "device flow দিয়ে sign in, ২-repo-র task-এর pull request তৈরি, related link আর status দেখা" demo-টা তিন OS-এ একটা test GitHub account-এ চলে; canary token test pass করে।

| ID | Scope | PRD ID | Acceptance criteria | যাচাই | S |
|---|---|---|---|---|---|
| M9-01 | `crates/github`: `HostingProvider` trait, `reqwest` client, OAuth device flow, personal access token-এর বিকল্প, `keyring` দিয়ে OS keychain-এ token (Linux Secret Service না থাকলে শুধু session-এর জন্য); log আর error-এ SEC-05 অনুযায়ী redaction; UI login-এর নাম দেখায় initials badge দিয়ে, কোনো avatar ছবি না | PR-01 | Record করা HTTP mock দিয়ে test; INV-11 canary test: token কোনো log, file, IPC payload বা Git-এর environment-এ দেখা যায় না | T, D | 2 |
| M9-02 | Remote (HTTPS আর SSH) থেকে GitHub repo চেনা; কড়া link allow-list দিয়ে browser-এ repo বা pull request খোলা | PR-11, DASH-06 | Remote URL-এর বিভিন্ন রূপের parser test; GitHub-এর বাইরের URL দেখানো হয়, কখনো খোলা হয় না | T | 1 |
| M9-03 | Task-এর pull request তৈরি: দরকার হলে আগে push, title আর body-র template, draft, reviewer, assignee, label, প্রতিটার preview আর edit | PR-02 | প্রতিটা option-এর mock test; test account-এ হাতে demo | T, D | 3 |
| M9-04 | প্রতিটা body-তে "Related pull requests" অংশ, পরে আরেকটা যোগ হলে update | PR-03 | Mock test: তৃতীয় pull request যোগ করলে বাকি দুটো update হয় | T | 1 |
| M9-05 | Batched GraphQL দিয়ে task-এর pull request-এর status (state, check, review, mergeable, comment), cache করা, চাইলে refresh। v0.1-এ Pull Requests screen শুধু active task-এর pull request দেখায়; পুরো screen (PR-06) v0.2-তে | PR-05 | Task-এর সব pull request-এর জন্য একটাই request (test); dashboard, task screen আর Pull Requests screen-এ status দেখায় | T, S | 2 |
| M9-06 | Pipeline-এ pull request দিয়ে Integrate into branch | PIPE-03 | Provider mock করে pipeline test | T | 1 |

### ৩.১১ M10 — পোক্ত করা আর v0.1 release

**লক্ষ্য:** v0.1-কে সহজ, accessible, প্রতিটা system-এ দ্রুত, crash-এর পরে সামলে নেওয়ার মতো, আর ship করার উপযোগী করা।
**নির্ভর করে:** M3–M9। **কভার করে:** UX-01–09, PERF-01–08, PLAT-01–04, PLAT-12, Reliability (PRD §৯), PRD §১২-এর "v0.1 তখনই শেষ" নিয়ম।
**Exit criteria:** প্রতিটা P0 ID pass করে; তিন OS-এ CI-তে perf বাজেট বাধ্যতামূলক; ৬টা installer GitHub Releases-এ; owner PRD §১২-এর dogfood ticket শেষ করেন।

| ID | Scope | PRD ID | Acceptance criteria | যাচাই | S |
|---|---|---|---|---|---|
| M10-01 | প্রথমবার চালানোর গাইড: folder, নাম আর base branch, GitHub sign-in, প্রতিটা ধাপ বাদ দেওয়া যায়; git না থাকলে সাহায্য; webview-এর version check, যা update কীভাবে করতে হয় তা বুঝিয়ে দেয় (macOS 13.3 বা নতুন) | UX-01, Compatibility (PRD §৯) | সময় মেপে demo-তে নতুন user 2 মিনিটের কমে শেষ করেন | D, S | 2 |
| M10-02 | লেখার পর্যালোচনা: সব screen-এর tooltip, খালি অবস্থা, error message | UX-02, UX-04, UX-06 | Screenshot-সহ প্রতিটা screen-এর checklist; প্রতিটা error code-এর catalogue-এ লেখা আছে; কোনো সাধারণ error থাকে না | S, T | 2 |
| M10-03 | Accessibility: প্রতিটা screen-এ `@axe-core/playwright`, শুধু keyboard দিয়ে পুরোটা ঘোরা, screen reader label, দুই theme-এ contrast, zoom; hardware থাকলে NVDA (Windows), VoiceOver (macOS) আর Orca (Linux) দিয়ে হাতে যাচাই | UX-05, UX-08 | কোনো serious বা critical axe violation নেই; শুধু-keyboard একটা Playwright test প্রতিটা প্রধান flow চালায়; screen reader-এর যাচাই লিখে রাখা | T, R | 2 |
| M10-04 | Fail করানো perf বাজেট: start, 10 আর 30 repo-র dashboard-এর সময়, click-এর সাড়া, row update, diff আর merge editor খোলা, RAM, Changes-এর scroll; 50-repo-র scale test। প্রতিটা pull request-এ `criterion`; পুরো বাজেট প্রতি রাতে আর release-এ | PERF-01–08 | বাজেট ছাড়ালে CI fail করে; তিন OS-এর সংখ্যা §৭ K-এর ভেতরে | P | 3 |
| M10-05 | Crash থেকে ফেরা: শুরুতে দেখানো কোন repo-তে মাঝপথে থামা operation হাত দিয়েছিল আর সেগুলো কী অবস্থায়; থেমে থাকা run আবার চালানোর প্রস্তাব; chaos suite প্রতি রাতে আর release-এ চলে | Reliability (PRD §৯), PIPE-07 | তিন OS-এ operation-এর মাঝে kill করার test | T, D | 2 |
| M10-06 | চূড়ান্ত installer: v0.1-এর ৬টা installer (admin ছাড়া per-user Windows x64 আর ARM64 `.exe`, macOS arm64 আর x64 `.dmg`, AppImage আর `.deb`), আকার check, আর download page ও release note থেকে link দেওয়া install guide `docs/guides/install.{en,bn}.md`: Windows-এ SmartScreen-এর "Run anyway", macOS-এ Gatekeeper-এর "Open Anyway" আর quarantine-এর বিকল্প পথ (Apple Developer account নেই, তাই macOS build ad-hoc signed), Linux-এ FUSE আর `.deb`-এর ধাপ, আর `SHA256SUMS` মিলিয়ে দেখা | PLAT-01, PLAT-02, PLAT-12, PERF-09 | একটা tag থেকে installer বানানো; প্রতিটা OS-এ install করে চালানো (Windows আর Linux-এ CI-এর install smoke আর `tauri-driver`, macOS-এ হাতের smoke checklist); macOS-এ owner বা একজন সাহায্যকারী guide-টা অক্ষরে অক্ষরে মেনে download করা `.dmg` খোলেন, screenshot-সহ | T, D, P | 2 |
| M10-07 | Release প্রক্রিয়া: release checklist, macOS-এ হাতের smoke, v0.1-এর প্রতিটা flow সব OS-এ চালানো, দুই ভাষায় release note | PLAT-04 | Release candidate-এর জন্য checklist পূরণ | R, D | 2 |
| M10-08 | Start Task, Commit Task, Create Pull Requests, Sync with Base, Run Pipeline-এর তিন-click যাচাই | UX-07 | একটা Playwright test প্রতিটা flow-এর click গোনে | T | 1 |
| M10-09 | Dogfood: owner একটা আসল ২-repo-র ticket Start Task থেকে তৈরি pull request পর্যন্ত নেন, একটা conflict resolve আর একটা সেভ করা pipeline run সহ | PRD §১১, §১২ | Owner-এর sign-off আর খুঁজে পাওয়া bug-গুলো ঠিক করা | D | 1 |

## ৪. Dependency আর critical path

**Critical path:** M0 → M1 (gate) → M2 → M3 → M5 → M6 → M8 → M10। ~151টা session-এর প্রায় 115টা এই পথের milestone-গুলোতে। M4, M7 আর M9 এর পাশাপাশি চলে, কিন্তু M8-03-এর আগে M7-06 শেষ হতে হবে।

| Item বা milestone | যার অপেক্ষায় | কেন |
|---|---|---|
| পুরো M2 | M1-05 | Gate ঠিক করে shell (Tauri না Electron), আর read-এর জন্য `gix` লাগবে কি না |
| M2-09, M2-03, M2-11 | M2-02 | এগুলো process layer-এর ওপর দাঁড়ায় |
| M2-04 | M2-02, M2-06 | Log sink runner-এর record storage-এ লেখে |
| M2-10 | M2-09 | Trust প্রয়োগ করে guard |
| M2-05, M2-08 | M2-02, M2-09 | সব git read runner আর তার guard দিয়ে যায় |
| M2-07 | M2-05, M2-10 | Repo trusted হওয়ার আগে কোনো background status চলে না |
| M3-04 | M2-05, M2-07, M3-03 | Dashboard shell-এর ভেতরে parse করা state আর live update দেখায় |
| M3-09 | M2-10, M3-03 | Prompt trust scan-এর ফল দেখায় |
| পুরো M4 | M2, M3-03 | Status model আর app shell লাগে |
| M5-01 | M2-03, M2-04, M2-06 | Run engine job queue, log আর journal-এর storage ব্যবহার করে |
| M5-07 | M5-01, M3-05, M3-07 | Preview engine-এর ওপর চলে আর selection ও group-কে target করে |
| M5-02 থেকে M5-06 | M5-01, M5-07 | প্রতিটা bulk action হলো preview করা এক ধাপের run |
| M6 | M5-07, M5-03 | Start আর Switch Task preview engine আর SAFE-04-এর flow আবার ব্যবহার করে |
| M7 | M4-01, M4-04, M5-07 | Diff engine, CodeMirror view আর preview engine আবার ব্যবহার করে |
| M8-03 | M5-01, M7-06 | Run engine-কে বাড়ায়; থেমে থাকা repo তার conflict resolve হওয়ার পরে আবার চলে |
| M8-06 | M6 | Sync with Base আর Merge Task Into হলো task-এর pipeline |
| M9-03 থেকে | M6 | Pull request তৈরি হয় task ধরে |
| M9-06 | M8-02 | Pull request পদ্ধতি একটা pipeline ধাপ |
| M10 | M3–M9 | পোক্ত করার কাজ পুরো app জুড়ে |

## ৫. পাশাপাশি কাজ (আলাদা worktree)

একসাথে বড়জোর ২ বা ৩টা item চলে, প্রতিটা নিজের worktree আর session-এ ([workflow §৭.৪](../process/ai-development-workflow.bn.md) দেখুন)। একই crate-এর public API বদলায় এমন দুটো item কখনো একসাথে চলে না।

| পর্ব | যেসব item পাশাপাশি চলতে পারে |
|---|---|
| M0 | M0-01-এর পরে M0-02 আর M0-03; M0-04-এর পাশে M0-06; M0-07 যেকোনো সময় |
| M1 | M1-01, M1-02 আর M1-03 একসাথে; এগুলোর যেকোনোটার পাশে M1-04 আর M1-06 |
| M2 | M2-01 আর M2-06 একসাথে; M2-02-এর পরে M2-05-এর (শুধু parser) পাশে M2-09; তারপর M2-10-এর পাশে M2-03; তারপর M2-08-এর পাশে M2-04; M2-07-এর পাশে M2-11 |
| M3 | M3-01 আর M3-03 একসাথে; M3-04-এর পাশে M3-02; M3-06, M3-07, M3-08 আর M3-09 যেকোনো জোড়ায় |
| M3–M5 | M3-এর UI item-এর পাশে M4-01 (Rust); M5-এর core item-এর পাশে M4-এর UI item; M3 থেকে যেকোনো কিছুর পাশে M9-01 আর M9-02 |
| M6–M7 | M6-এর পাশে M7-01; M6-এর পাশে M7-এর UI item |
| M8–M9 | M8-01 থেকে M8-05-এর পাশে M9-03 থেকে M9-05 |
| M10 | M10-02, M10-03 আর M10-06 একসাথে; M10-05-এর পাশে M10-04 |

## ৬. Traceability: প্রতিটা P0 requirement থেকে work item

PRD-র প্রতিটা P0 ID অন্তত একটা work item-এ পৌঁছায়। PRD-তে PERF-09 হলো P1, কিন্তু এটা M1 gate-এর অংশ, তাই এটাও তালিকায় আছে।

| এলাকা | PRD ID → work item |
|---|---|
| A. Dashboard | DASH-01 → M3-01, M2-10, M3-09 · DASH-02 → M2-05, M3-04 · DASH-03 → M3-05 · DASH-04 → M2-07 · DASH-05 → M3-05 · DASH-06 → M3-06, M9-02 |
| B. Group | GRP-01 → M3-07 · GRP-02 → M3-07 · GRP-03 → M3-07, M5-07 |
| C. Task | TASK-01 → M6-01 · TASK-02 → M6-02 · TASK-03 → M6-03 · TASK-04 → M6-04 · TASK-05 → M8-06 · TASK-06 → M8-06 |
| D. Change | CHG-01 → M4-02 · CHG-02 → M4-02 · CHG-03 → M4-03 · CHG-04 → M4-01, M4-04, M2-08 · CHG-05 → M4-05 · CHG-06 → M4-06 · CHG-07 → M4-07 |
| E. Bulk | BULK-01 → M5-02, M5-03, M5-04 · BULK-03 → M5-07 · BULK-04 → M2-03, M5-01, M5-06 · BULK-05 → M2-03, M5-01, M5-06 · BULK-06 → M5-04, M6-05 · BULK-08 → M2-04, M5-06 |
| F. Conflict | CONF-01 → M7-02 · CONF-02 → M7-02 · CONF-03 → M1-02, M7-03 · CONF-04 → M7-04 · CONF-05 → M7-01 · CONF-06 → M7-01, M7-03 · CONF-07 → M7-05 · CONF-08 → M7-04 · CONF-09 → M7-06 · CONF-10 → M7-06 · CONF-11 → M7-01, M7-06 |
| G. Pull request | PR-01 → M9-01 · PR-02 → M9-03 · PR-03 → M9-04 · PR-05 → M9-05 · PR-11 → M9-02 |
| H. নিরাপত্তা | SAFE-01 → M2-09, M5-02, M8-04 · SAFE-02 → M2-09, M4-07, M5-05, M8-04 · SAFE-03 → M4-06, M5-03 · SAFE-04 → M5-03, M6-03 · SAFE-05 → M2-01, M2-02, M2-09, M2-10 · SAFE-06 → M2-09, M5-05 · SAFE-07 → M5-07 |
| I. Configuration | CFG-01 → M3-02 · CFG-02 → M3-02 |
| J. Platform | PLAT-01 → M0-01, M0-04, M10-06 · PLAT-02 → M0-06, M10-06 · PLAT-03 → M2-01 · PLAT-04 → M0-03, M0-04, M10-07 · PLAT-05 → M1-06, M3-08 · PLAT-06 → M1-06, M3-03 · PLAT-12 → M10-06 |
| K. গতি | PERF-01 → M1-04, M10-04 · PERF-02 → M1-03, M2-07, M3-04, M10-04 · PERF-03 → M1-01, M3-04, M10-04 · PERF-04 → M2-07, M10-04 · PERF-05 → M1-03, M2-02, M2-03, M10-04 · PERF-06 → M1-02, M4-01, M4-04, M10-04 · PERF-07 → M1-04, M2-07, M10-04 · PERF-08 → M1-01, M4-02, M10-04 · (PERF-09 → M0-06, M1-04, M10-06) |
| L. সহজে ব্যবহার | UX-01 → M10-01 · UX-02 → M5-06, M10-02 · UX-03 → M5-07, M8-04 · UX-04 → M2-11, M5-06, M10-02 · UX-05 → M3-08, M10-03 · UX-06 → M6-05, M10-02 · UX-07 → M6-02, M10-08 · UX-08 → M1-06, M3-03, M10-03 · UX-09 → M3-03 |
| M. Pipeline | PIPE-01 → M8-01 · PIPE-02 → M8-02 · PIPE-03 → M8-02, M9-06 · PIPE-04 → M8-01 · PIPE-05 → M8-04 · PIPE-06 → M8-03 · PIPE-07 → M5-01, M8-03, M10-05 · PIPE-08 → M8-05 · PIPE-09 → M8-06 · PIPE-10 → M8-06 |

PRD-তে কোনো P0 ID যোগ হলে বা বদলালে এই table আর প্রভাবিত item-গুলো একই পরিবর্তনে, দুই ভাষাতেই, update হবে।

## ৭. v0.1-এর পরে (শুধু milestone পর্যায়ে)

এই milestone-গুলো অস্থায়ী। v0.1 ship হলে তবেই এগুলো work item-এ ভাগ করা হবে।

### ৭.১ v0.2 (সব P1 requirement)

| Milestone | Scope | PRD ID |
|---|---|---|
| M11 | Undo আর বাড়তি নিরাপত্তা: শেষ bulk action undo, cancel/failure-এর পরিষ্কার report, ঝুঁকির badge | BULK-09, UX-10, DASH-07 |
| M12 | Pull request-এর বাড়তি ক্ষমতা: repo-র template, পুরো Pull Requests screen, একসাথে update, ক্রম মেনে merge | PR-04, PR-06, PR-07, PR-08 |
| M13 | Task, workspace আর team file: Finish Task, branch থেকে task চেনা, একাধিক workspace, `.githeddle.json` (কোনো program না, কোনো Run Git command ধাপ না, পরিবর্তন user approve করেন), pipeline-এর option, shortcut, শেয়ার আর run-এর ইতিহাস | TASK-07, TASK-08, DASH-08, CFG-03, PIPE-11–14 |
| M14 | Git-এর গভীরতা: merge editor-এ Base view, commit history, আরও operation, Run Git command, built-in help | CONF-12, CHG-08, BULK-02, BULK-07, UX-11 |
| M15 | বিতরণ: automatic update, signed Windows installer (macOS ad-hoc signed-ই থাকে), `.rpm` | PLAT-07, PLAT-08, PLAT-09 |

### ৭.২ v0.3 আর তার পরে (P2 আর নতুন host)

| Milestone | Scope | PRD ID |
|---|---|---|
| M16 | লাইন আর hunk ধরে staging, Conventional Commits | CHG-09, CHG-10 |
| M17 | Review flow আর notification | PR-09, PR-10 |
| M18 | আরও pipeline ধাপ, Linux ARM64; ততদিনে owner Apple Developer account নিলে তবেই notarised macOS app | PIPE-15, PLAT-10, PLAT-11 |
| M19 | `HostingProvider`-এর পেছনে GitLab আর Azure DevOps; issue tracker থেকে title; AI-এর লেখা pull request description | PRD §১২ |

## ৮. Roadmap-এর ঝুঁকি

| ঝুঁকি | প্রভাব | প্রতিকার |
|---|---|---|
| WebKitGTK বা WKWebView-এ M1 gate fail করে | Electron-এ যেতে হয়; M0-এর shell-এর কাজ আংশিক আবার করতে হয় | React UI আর Rust core থেকে যায়; বদলায় শুধু shell adapter। M1-05-এর পরে আবার হিসাব |
| Windows-এ process spawn-এর খরচে PERF-02 মিস হয় | `gix` read path M2-05-এ কাজ বাড়ায় | Gate-এ সিদ্ধান্ত; read থাকে `repo-state` API-র পেছনে, তাই UI বদলায় না |
| AppImage 60 MB-এর বেশি | একটা package-এ PERF-09 মিস | Bundle করা library ছাঁটা; না হলে M1-05-এ ADR-এ শুধু AppImage-এর ব্যতিক্রম লেখা |
| `@codemirror/merge` Rust-এর chunk নেয় না | M4-04 বড় হয় | M1-02-এ সিদ্ধান্ত; তখন দুটো diff mode-ই aligned-panes layer ব্যবহার করে, যেটা M7-এর এমনিতেই লাগে |
| Merge editor হিসাবের চেয়ে কঠিন | M7 বড় হয় | আগে M1-02 prototype; alignment Rust-এ হিসাব করে snapshot দিয়ে test; external merge tool (CONF-02) বিকল্প হিসেবে থাকে |
| তিন OS-এ CI ধীর, তাই agent-এর loop ধীর | প্রতি session-এ কম item | Caching আর `sccache`; installer আর পুরো perf শুধু label দিলে বা প্রতি রাতে |
| macOS পুরোপুরি automate করা যায় না (`tauri-driver` macOS সমর্থন করে না) | macOS-এর bug দেরিতে ধরা পড়ে | প্রতিটা pull request-এ macOS-এ Playwright WebKit, আর প্রতি release-এ macOS-এর হাতের smoke checklist |
| Session-এ করা হিসাব মোটামুটি | মোট সংখ্যা সরে যায় | M1-এর পরে আর প্রতিটা milestone-এর পরে আবার হিসাব; ৩ session ছাড়ানো যেকোনো item ভাগ করা |
| P1-এর আইডিয়া থেকে scope creep | v0.1 পিছিয়ে যায় | v0.1-এ শুধু P0; আইডিয়া যায় M11+-এর follow-ups তালিকায় |
| পাশাপাশি worktree-তে সংঘর্ষ | আবার কাজ আর merge conflict | একসাথে বড়জোর ২–৩টা item; একই crate API বদলায় এমন দুটো কখনো না |
| Review-এ owner আটকে যান | Item review-এর অপেক্ষায় বসে থাকে | প্রমাণ-আগে pull request (workflow §১০); ছোট item |
| Build চলার সময় pin করা version পুরনো হয়ে যায় | Security advisory, পুরনো docs | Renovate আর `cargo-deny`; upgrade শুধু আলাদা item-এ |

## ৯. পরিবর্তনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ৩ নভেম্বর ২০২৬ | প্রথম খসড়া, panel review-এর পরে সংশোধিত: M0-তে security-র ভিত্তি আর shell-এর দায়িত্ব, owner-এর GitHub settings (M0-07), shell-এর যাচাই (M1-06), command guard (M2-09), repo trust (M2-10, M3-09), error classification (M2-11), M5-01 থেকে run engine, preview engine (M5-07), ৬টা installer, CI-এর বিন্যাস। |
| 0.2 | ৩ নভেম্বর ২০২৬ | আপাতত কোনো Apple Developer account নেই: M10-06-এ install guide যোগ হয়েছে (PLAT-12); M15 শুধু Windows installer sign করে; notarised macOS app (PLAT-11) M18-এর তালিকায়, শুধু ততদিনে account থাকলে। |
