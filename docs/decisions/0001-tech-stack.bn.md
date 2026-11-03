# ADR 0001 — Technology stack

**English version:** [0001-tech-stack.en.md](0001-tech-stack.en.md)

| | |
|---|---|
| **ডকুমেন্ট** | Architecture Decision Record (ADR) 0001 |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | গৃহীত, তবে M1 go/no-go gate (§৬) পার হওয়া সাপেক্ষে |

**সম্পর্কিত ডকুমেন্ট:** [PRD](../product/PRD.bn.md) · [Architecture](../architecture/architecture.bn.md) · [UI architecture](../design/ui-architecture.bn.md) · [Build ও release](../engineering/build-and-release.bn.md) · [Test strategy](../engineering/test-strategy.bn.md) · [Security](../engineering/security.bn.md) · [AI development workflow](../process/ai-development-workflow.bn.md) · [Roadmap](../plan/roadmap.bn.md)

> এই file আর এর ইংরেজি সংস্করণে একই content আছে। একটা বদলালে অন্যটাও একই commit-এ update করতে হবে।

---

## ১. প্রেক্ষাপট

কোন technology ব্যবহার হবে, সেটা PRD-র ৯ নম্বর প্রশ্নে খোলা রাখা ছিল। GitHeddle-কে যা যা পারতে হবে:

- Windows, macOS আর Linux-এ একইভাবে চলা (PLAT-01..05);
- ১ সেকেন্ডের কমে চালু হওয়া, ৩০টা repo থাকলেও ২৫০ MB-র কম memory নেওয়া, আর ৬০ MB-র কম installer (PERF-01, PERF-07, PERF-09);
- VS Code-এর মতো Changes screen-এ ৫,০০০ পর্যন্ত file, diff, আর তিন pane-এর merge editor দেখানো (CHG-01..06, CONF-03..07, PERF-06, PERF-08);
- user-এর নিজের `git` নিরাপদে, একসাথে অনেকগুলো, cancel করার সুযোগসহ চালানো, আর crash হলেও pipeline হারিয়ে না যাওয়া (SAFE-01..07, BULK-04, PIPE-07)।

সিদ্ধান্ত নেওয়ার সময় owner-এর দুটো নিয়ম মানা হয়েছে:

1. **প্রোডাক্টের জন্য যেটা সবচেয়ে ভালো, সেটাই বেছে নিতে হবে।** Owner এখন কোন technology-তে কাজ করেন (C# / .NET), সেটার কোনো গুরুত্ব নেই। PRD-তে আগে এ নিয়ে যে কথা ছিল, সেটা বাতিল।
2. **পুরো app তৈরি হবে Claude Code দিয়ে vibe coding করে।** প্রায় সব code AI লিখবে; owner দিক ঠিক করবেন, review আর test করবেন। তাই কোন stack-এ AI agent ভরসাযোগ্যভাবে সঠিক code লিখতে, test করতে আর রক্ষণাবেক্ষণ করতে পারে, সেটাও বিচার করা হয়েছে।

## ২. সিদ্ধান্ত কীভাবে নেওয়া হলো

পাঁচটা agent-এর একটা panel বানানো হয়েছিল, প্রত্যেকের নিজের মনোযোগের জায়গা আছে। তারা একে অন্যের কাজ না দেখে আলাদাভাবে বিকল্পগুলো যাচাই করেছে, তারপর ranked vote দিয়েছে (প্রথম = ৩ পয়েন্ট, দ্বিতীয় = ২, তৃতীয় = ১):

| Agent | মনোযোগ |
|---|---|
| Agent 1 | System আর performance |
| Agent 2 | Cross-platform build আর release |
| Agent 3 | UX আর frontend |
| Agent 4 | AI দিয়ে development |
| Agent 5 | Git-এর সঠিকতা, security আর quality |

যেসব বিকল্প বিবেচনা করা হয়েছে: Tauri 2, Electron, Avalonia, Wails, Flutter desktop, Qt/QML, Slint, native Rust GUI (egui, iced, GPUI ধরনের) আর .NET MAUI।

## ৩. Vote

| Stack | Agent 1 | Agent 2 | Agent 3 | Agent 4 | Agent 5 | **মোট** |
|---|---|---|---|---|---|---|
| **Tauri 2** (Rust core + React/TypeScript UI) | 3 | 3 | 3 | 3 | 3 | **15** |
| Electron (Node + TypeScript) | 2 | 2 | 2 | 0 | 1 | 7 |
| Avalonia (.NET) | 1 | 1 | 1 | 2 | 2 | 7 |
| Wails v3 (Go + web UI) | 0 | 0 | 0 | 1 | 0 | 1 |

পাঁচজনই Tauri 2-কে প্রথম রেখেছে।

বাকিগুলো কেন বাদ গেল:

- **Flutter, Slint, egui/iced:** পরিপক্ব code editor বা merge view component নেই, accessibility-ও দুর্বল।
- **Qt/QML:** AI-র লেখা C++ code-এ memory-safety bug হওয়ার ঝুঁকি আছে, যেটা একজন non-expert ধরতে পারবেন না।
- **.NET MAUI:** Linux-এ চলে না।

## ৪. সিদ্ধান্ত

**GitHeddle তৈরি হবে Tauri 2 দিয়ে: Rust core আর React + TypeScript UI।**

কেন:

- **কঠিন requirement-গুলো আরামে পূরণ হয়।** Windows আর macOS-এর installer আর `.deb` মোটামুটি ১০–১৫ MB, কারণ এগুলো browser bundle না করে system-এর webview ব্যবহার করে। ব্যতিক্রম Linux-এর AppImage: এতে WebKitGTK bundle করা থাকে, তাই এটা অনেক বড় হতে পারে (§৬)। ভারী কাজগুলো Rust-এ চলে বলে memory কম লাগে (PERF-07, PERF-09)। PLAT-02 আর PLAT-09-এ যত package চাওয়া হয়েছে, সবগুলো Tauri bundler বানায়।
- **AI-র লেখা code-এর জন্য দুই স্তরের স্বয়ংক্রিয় সুরক্ষা।** Rust-এর compiler আর Clippy কিছু চালানোর আগেই অনেক ধরনের bug ধরে ফেলে, যেমন বাদ পড়া state, উপেক্ষা করা error আর data race। কড়া TypeScript UI-র ভুল ধরে। `tauri-specta` Rust command থেকে UI-র type বানিয়ে দেয়, তাই দুই দিকের মধ্যে অমিল থাকলে compile-ই হবে না।
- **সবচেয়ে কঠিন UI অংশগুলো web-এ আগে থেকেই তৈরি আছে।** Diff আর merge editor-এর pane-গুলো দেখায় CodeMirror 6। এর merge extension Rust-এ হিসাব করা hunk দেখাতে পারে কি না, সেটা M1-এ যাচাই হবে (§৬)। ৫,০০০ file-এর list সামলায় TanStack Virtual, accessible control দেয় React Aria, আর command palette দেয় cmdk।
- **কাউকে click না করেও test করা যায়।** Rust core-কে তিনটা system-এই আসল fixture repo-র ওপর `cargo test` দিয়ে test করা যায়। UI test হয় headless browser-এ, core-কে mock করে।
- **PRD §১০-এর design-এর সাথে মেলে।** PRD-তে আগে থেকেই আছে UI thread-এর বাইরে একটা job runner, একটাই shared diff engine, আর থেমে আবার চালু হতে পারে এমন pipeline state machine। এগুলো সবই pure logic, যেটা Rust-এ ভালো মানায়।

### ৪.১ প্রধান ছোট সিদ্ধান্তগুলো

| ক্ষেত্র | পছন্দ | কেন |
|---|---|---|
| UI framework | React 19 + TypeScript (strict) + Vite | AI-র training data সবচেয়ে বেশি, type check সবচেয়ে কড়া |
| State | Zustand + TanStack Query | ছোট আর স্পষ্ট; selector দিয়ে বড় list-ও হালকা থাকে |
| Styling | Design token-এর ওপর Tailwind CSS v4 | Theme বদলানো মানে শুধু token বদলানো; AI সহজে একই ধাঁচে লিখতে পারে |
| Accessible control | React Aria Components, cmdk | Keyboard আর screen reader-এর পূর্ণ সাপোর্ট (UX-05, UX-08) |
| Editor আর merge view | CodeMirror 6 + `@codemirror/merge` | হালকা, বড় file সামলাতে পারে; Monaco ভারী আর এতে three-way merge নেই |
| Diff engine | Rust-এ `imara-diff` + `similar` | সব screen-এর জন্য একটাই engine (PRD §১০) |
| Git access | v0.1-এ পড়া আর লেখা দুটোই user-এর `git` CLI দিয়ে | আচরণ, hook আর credential terminal-এর সাথে হুবহু মেলে (SAFE-05) |
| Process control | `process-wrap` দিয়ে নিজস্ব `GitRunner` | Cancel করলে বা app বন্ধ করলে কোনো `git` process ঝুলে থাকে না |
| GitHub | পাতলা `reqwest` client + typed GraphQL query | Dependency কম; pull request-এর status একসাথে অনেকগুলো আনা যায় |
| Keychain | `keyring` crate | Credential Manager, Keychain আর Secret Service (§৯) |
| Storage | Cache, pipeline journal আর log-এর জন্য SQLite (WAL); setting-এর জন্য JSON | Crash হলেও run হারায় না (PIPE-07); setting পড়ে বোঝা যায় |
| Test | nextest, insta, proptest; Vitest; Chromium আর WebKit-এ Playwright; tauri-driver | তিনটা system-এই CI-তে প্রতিটা স্তর test করা যায় |
| Build | শুধু GitHub Actions-এ | Owner-এর machine-এ ভারী কিছু চলে না |

Security আর release-এর setting-সহ পুরো তালিকা আছে [architecture](../architecture/architecture.bn.md) আর [build ও release](../engineering/build-and-release.bn.md) ডকুমেন্টে।

### ৪.২ মতের অমিল আর কীভাবে মীমাংসা হলো

| প্রশ্ন | অবস্থান | মীমাংসা |
|---|---|---|
| Git-এর state কি in-process `gix` (gitoxide) দিয়ে পড়া হবে, নাকি শুধু `git` CLI দিয়ে? | Agent 1: দ্রুত পড়ার জন্য `gix`, কারণ Windows-এ process চালু করা ধীর। Agent 4 আর 5: শুধু CLI, যাতে আচরণ সবসময় `git`-এর সাথে মেলে। | v0.1-এ শুধু CLI। M1 benchmark-এ Windows-এ PERF-02 পূরণ না হলে, তখন শুধু পড়ার কাজে `gix` নেওয়া হবে। |
| GitHub client: `octocrab` নাকি পাতলা client? | Agent 1: octocrab। Agent 5: পাতলা client। | পাতলা `reqwest` client, তাতে audit করার মতো dependency কম থাকে। |
| দ্বিতীয় পছন্দ: Electron নাকি Avalonia (দুটোই ৭)? | Agent 1–3: Electron। Agent 4–5: Avalonia। | **Fallback হলো Electron**, কারণ React UI হুবহু থেকে যায়, শুধু backend adapter নতুন করে লিখতে হবে। |

## ৫. ফলাফল

**ভালো দিক:**

- App ছোট আর দ্রুত।
- AI-র লেখা code compile-এর সময়েই কড়াভাবে যাচাই হয়।
- পরিপক্ব editor component।
- একটাই Rust core, যেটা headless-ভাবে test করা যায়।

**খরচ, আর তার জন্য কী করা হবে:**

| খরচ | প্রতিকার |
|---|---|
| প্রতিটা system-এ webview আলাদা (WebView2, WKWebView, WebKitGTK), আর Linux-এর WebKitGTK সবচেয়ে দুর্বল | শুধু সেই web feature ব্যবহার হবে যেগুলো তিনটা engine-ই সাপোর্ট করে। UI test Chromium-এর পাশাপাশি WebKit-এও চলবে। CI-তে তিনটা system-এই performance job চলবে। Fallback হিসেবে Electron থাকবে। |
| Rust build ধীর, আর borrow checker-এর কারণে AI-র code জোড়াতালির দিকে যেতে পারে | ছোট ছোট crate; কাজ চলার সময় `cargo check`; CI-তে sccache; Clippy-র নিয়মে `unwrap` নিষেধ, `unsafe` code বন্ধ। |
| AI agent Tauri v1 আর v2-এর API গুলিয়ে ফেলতে পারে | Version pin করা হবে, code-এর `CLAUDE.md`-এ v2-এর pattern রাখা হবে, typed binding বানানো হবে, আর একটা template command থাকবে যেটা প্রতিটা নতুন feature কপি করবে। |
| `tauri-driver` macOS-এর webview চালাতে পারে না | বেশিরভাগ UI test core-কে mock করে headless-ভাবে চলবে। প্রতিটা release-এর আগে macOS-এ একটা ছোট manual যাচাই হবে (PLAT-04)। |
| Owner Rust পড়েন না | প্রতিটা work item-এর acceptance criteria, CI check আর demo flow থাকবে ([AI development workflow](../process/ai-development-workflow.bn.md))। |
| Webview-এ অবিশ্বস্ত লেখা দেখানো হয় (commit message, branch-এর নাম, pull request-এর বর্ণনা), আর webview IPC দিয়ে বিশেষ ক্ষমতার core-এর সাথে কথা বলে | কড়া CSP, Tauri-র isolation pattern, শুধু আমাদের নিজেদের command-ওয়ালা capability allow-list, আর কোনো remote content নয় ([security](../engineering/security.bn.md))। |
| Tailwind CSS v4-এর জন্য Safari 16.4 লাগে, তাই বাস্তবে macOS-এর সর্বনিম্ন version 13.0 নয়, 13.3 | প্রথমবার চালুর সময় app webview-এর version যাচাই করে, আর macOS কীভাবে update করতে হয় তা বলে দেয়। PRD-র PLAT-01-এ 13.3-এর কথা লেখা আছে। |

## ৬. Go/no-go gate (milestone M1)

তিনটা system-এর CI runner-এ M1 spike-গুলো পার হলে তবেই সিদ্ধান্তটা চূড়ান্ত ([roadmap](../plan/roadmap.bn.md))। প্রতিটা সংখ্যা মাপা হবে production-এর security setting চালু রেখে (CSP, isolation pattern, devtools বন্ধ), যাতে isolation pattern-এর কারণে IPC-তে যে বাড়তি সময় লাগে সেটাও হিসাবে আসে।

| যাচাই | লক্ষ্য |
|---|---|
| ৫,০০০ row-এর virtual list | চোখে পড়ার মতো আটকানো ছাড়া scroll হবে, আর ১০০ ms-এর মধ্যে সাড়া দেবে (PERF-03, PERF-08) |
| ১০,০০০ লাইনের diff / তিন pane-এর merge view-এর prototype | যথাক্রমে ৩০০ ms / ৫০০ ms-এর মধ্যে খুলবে (PERF-06) |
| Rust-এর data থেকে diff দেখানো | CodeMirror-এর merge extension Rust-এ হিসাব করা hunk দেখাতে পারে কি না। না পারলে diff-এর দুটো mode-ই merge editor-এর aligned-pane layer-এ আঁকা হবে। যেভাবেই হোক, diff engine একটাই থাকবে, Rust-এ। |
| Cold start | PERF-01-এর লক্ষ্যের মধ্যে |
| ৩০টা fixture repo নিয়ে memory, webview process-সহ | ২৫০ MB-র কম (PERF-07) |
| Installer | `.exe`, `.dmg` আর `.deb` ৬০ MB-র কম (PERF-09)। AppImage-ও মাপা হবে (নিচে দেখুন)। |
| Shell-এর আচরণ | F5 বা browser-এর shortcut চাপলে page reload হবে না; macOS-এ ⌘C/⌘V কাজ করবে; Windows-এ page-এর ভেতরে drag and drop কাজ করবে; তিনটা system-এই theme system-এর setting মেনে চলবে |

- **WebKitGTK বা WKWebView ব্যর্থ হলে**, আর spike-এর মধ্যে ঠিক করা না গেলে, Electron-এ চলে যাওয়া হবে।
- **Process চালু করা ধীর বলে Windows-এ ৩০টা repo-র `git status` PERF-02 পূরণ না করলে**, শুধু পড়ার কাজে `gix` নেওয়া হবে।
- **Bundle করা library ছাঁটাই করার পরেও AppImage ৬০ MB-র বেশি হলে**, এখানে সেটাকে শুধু AppImage-এর জন্য PERF-09-এর জানা ব্যতিক্রম হিসেবে লিখে রাখা হবে। বাকি সব installer-কে সীমার মধ্যেই থাকতে হবে।

## ৭. পরিবর্তনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ৩ নভেম্বর ২০২৬ | প্রথম সংস্করণ: পাঁচ agent-এর vote, সিদ্ধান্ত, ছোট সিদ্ধান্তগুলো আর M1 gate। Panel-এর review-এর পরে যোগ হয়েছে: AppImage-এর আকারের নিয়ম; M1 gate-এ diff দেখানোর যাচাই, shell-এর যাচাই আর security setting; আর webview-এর security ও macOS 13.3-এর খরচ। |
