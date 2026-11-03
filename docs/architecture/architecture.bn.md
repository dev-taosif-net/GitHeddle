# GitHeddle — আর্কিটেকচার

**English version:** [architecture.en.md](architecture.en.md)

| | |
|---|---|
| **ডকুমেন্ট** | আর্কিটেকচার |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। কিছু সিদ্ধান্ত M1 go/no-go gate-এর ফলের অপেক্ষায় আছে (§১৮) |

**সম্পর্কিত ডকুমেন্ট:** [PRD](../product/PRD.bn.md) · [ADR 0001: tech stack](../decisions/0001-tech-stack.bn.md) · [UI আর্কিটেকচার](../design/ui-architecture.bn.md) · [Build আর release](../engineering/build-and-release.bn.md) · [Test strategy](../engineering/test-strategy.bn.md) · [Security](../engineering/security.bn.md) · [AI দিয়ে development-এর workflow](../process/ai-development-workflow.bn.md) · [Roadmap](../plan/roadmap.bn.md)

> এই file আর এর ইংরেজি সংস্করণ [architecture.en.md](architecture.en.md)-এ একই content আছে। একটা বদলালে অন্যটাও একই commit-এ update করতে হবে।

---

## ১. উদ্দেশ্য আর পরিধি

GitHeddle ভেতরে কীভাবে তৈরি, এই ডকুমেন্ট সেটা বলে: কোন কোন process আছে, Rust crate-গুলো কী কী আর তাদের সীমানা কোথায়, core আর UI-এর মধ্যে data কীভাবে যায়, আর PRD-র গতি ও নির্ভরযোগ্যতার লক্ষ্যগুলো কীভাবে পূরণ হয়। Backend আর IPC contract এখানে বিস্তারিত আছে। React UI-এর ভেতরের গঠন আছে [UI আর্কিটেকচার](../design/ui-architecture.bn.md) ডকুমেন্টে, আর build ও installer আছে [Build আর release](../engineering/build-and-release.bn.md)-এ।

প্রতিটা section এমনভাবে লেখা, যাতে একটা Claude Code session অনুমান না করেই একটা work item (`M<n>-<nn>`) বানাতে পারে। প্রতিটা section এটাও বলে দেয় যে code গভীরভাবে না পড়েও owner কীভাবে ফলাফল যাচাই করবেন।

## ২. লক্ষ্য আর সীমাবদ্ধতা

| # | লক্ষ্য বা সীমাবদ্ধতা | PRD-তে কোথায় |
|---|---|---|
| ১ | প্রতিটা কাজে user-এর নিজের `git` ব্যবহার হবে, তাঁর config, credential আর hook সহ। কখনো hook বাদ দেওয়া হবে না। | SAFE-05, §৯ স্বচ্ছতা, §১০ |
| ২ | Git আর network-এর কাজ কখনো window আটকাবে না। লম্বা কাজ সাথে সাথে progress দেখাবে। | PERF-03, PERF-05 |
| ৩ | চালু হওয়া মাত্র শেষ জানা state দেখানো, তারপর ২ সেকেন্ডের মধ্যে 30টা repo-র live state। | PERF-01, PERF-02, DASH-04 |
| ৪ | হালকা থাকা: 30টা repo খোলা থাকলেও RAM 250 MB-এর কম, বসে থাকা অবস্থায় CPU প্রায় শূন্য, installer 60 MB-এর কম। | PERF-07, PERF-09 |
| ৫ | Changes screen, diff view আর merge editor-এর জন্য একটাই diff engine। Git নিজে যা করেছে, merge editor সেটাই মেনে চলে। | CHG-04, CONF-03..06, §১০, §১৩ |
| ৬ | Bulk action বা pipeline কোনো repo-কে অজানা অবস্থায় ফেলে রাখবে না, crash হলেও না। Pause হওয়া run restart-এর পরেও টিকে থাকবে। | PIPE-07, BULK-05, §৯ নির্ভরযোগ্যতা |
| ৭ | Windows, macOS আর Linux-এ একই আচরণ। Platform-এর পার্থক্য সামলানো হবে এক জায়গায়। | PLAT-01, PLAT-03, §১৩ |
| ৮ | যে Git command চলে, তার প্রতিটা log করা আর দেখতে পাওয়া। | BULK-08, §৯ স্বচ্ছতা |
| ৯ | Token থাকবে শুধু OS-এর keychain-এ, আর কখনো webview-এ পাঠানো হবে না। | PR-01, §৯ Security |
| ১০ | প্রথমে GitHub। পরে অন্য host যোগ করা যাবে বাকি কিছু না বদলে। | §১০ Hosting provider |
| ১১ | Code লিখবে একটা AI agent। তাই সীমানাগুলো কড়া হবে আর tool দিয়ে যাচাই হবে, যাতে ভুল হলে run time-এ না, build-এই ধরা পড়ে। | Decision brief §২ |

## ৩. Process model

GitHeddle চলে একটা native Rust process (Tauri shell আর core crate-গুলো) আর UI আঁকার জন্য একটা webview নিয়ে। Webview দেয় OS নিজে: Windows-এ WebView2, macOS-এ WKWebView, Linux-এ WebKitGTK। Core দরকার মতো `git` child process চালায়। এর বাইরে background-এ আর কিছু চলে না, কোনো local server-ও নেই।

```text
+-------------------------- GitHeddle process (Rust) ---------------------------+
|                                                                                 |
|  apps/desktop/src-tauri  (Tauri shell: command, event, capability)              |
|        |  ডাকে                          ^ event (delta, progress)               |
|        v                                |                                       |
|  pipeline -----> workspace      repo-state <---- watcher (notify)               |
|     |   \           |              |                                            |
|     |    \--> github (reqwest) ----+---> HTTPS: GitHub REST / GraphQL           |
|     v               v              v                                            |
|  git-runner  (job queue, parallel limit, cancel, timeout, activity log)         |
|     |                                                                           |
|  diff-engine (pure)     storage (SQLite + JSON)     platform (OS স্তর)          |
+-----|---------------------------------------------------------------------------+
      | চালায় (shell ছাড়া)                       ^ typed IPC (tauri-specta)
      v                                        |
  git process (user-এর git, প্রতি job-এ একটা,  Webview: React UI (apps/desktop/src)
  আর ব্যবহারের সময় প্রতি repo-তে একটা         WebView2 / WKWebView / WebKitGTK
  দীর্ঘস্থায়ী cat-file --batch)
```

Thread আর runtime:

- **Tauri main thread:** শুধু window, menu আর IPC ভাগ করে দেওয়া। Git, disk বা network-এর কোনো কাজ এখানে কখনো চলে না (PERF-03, PERF-05)।
- **tokio runtime:** shell এটা চালু করে। Job runner, watcher, refresh-এর logic আর GitHub client এর ওপর চলে। যেসব library crate IO করে না, যেমন `diff-engine` আর parser-গুলো, সেগুলো সাধারণ synchronous Rust, tokio-র ওপর নির্ভর করে না।
- **Blocking pool:** CPU-ভারী pure কাজ, যেমন বড় file-এর diff, tokio-র blocking pool-এ চলে, যাতে async task কখনো আটকে না যায়।
- **Webview:** শুধু UI চালায়। File system, shell বা network-এ এর সরাসরি কোনো access নেই। এটা শুধু GitHeddle-এর নিজের command ডাকতে পারে, যেগুলো Tauri capability allow-list-এ লেখা আছে। `tauri-plugin-shell` আর fs plugin-গুলো খোলা রাখা হয় না। দেখুন [Security](../engineering/security.bn.md)।

**একটাই instance।** `tauri-plugin-single-instance` নিশ্চিত করে যে প্রতি user-এর জন্য একটাই GitHeddle process চলে। দ্বিতীয়বার চালু করলে সেটা নিজের argument প্রথম process-কে দিয়ে দেয়, প্রথমটা তার window সামনে নিয়ে আসে, আর দ্বিতীয়টা বন্ধ হয়ে যায়। এটা জরুরি, কারণ `state.db`, pipeline journal আর updater, তিনটাই ধরে নেয় যে এগুলোর মালিক একজনই।

**Shell-এর দায়িত্ব।** Command আর event-এর বাইরে, window-স্তরের এই কাজগুলো Tauri shell-এর। UI এগুলোর ওপর নির্ভর করে (দেখুন [UI architecture](../design/ui-architecture.bn.md) §১৪ আর §৮):

| দায়িত্ব | কেন | কী দিয়ে যাচাই |
|---|---|---|
| Webview-এর নিজের browser key (F5 আর Ctrl+R-এ reload, print, find, release-এ devtools) আর webview-এর নিজের zoom বন্ধ রাখা | F5, Ctrl+R আর Ctrl+± হলো GitHeddle-এর shortcut (refresh আর zoom, UX-08), আর reload হলে UI-এর state হারিয়ে যেত | তিন webview-এ M1 spike-এর check, তারপর M0-01 আর M3-08-এর acceptance test |
| macOS-এ standard app menu আর Edit menu সহ native menu bar দেওয়া | ⌘C, ⌘V, ⌘X, ⌘A আর ⌘Z চলার জন্য WKWebView-এর এটা লাগে। Menu item register করা UI command ডাকে | M1 spike-এর check, তারপর M3-08 |
| Window-এ native file-drop handling বন্ধ রাখা | নইলে এটা page-এর ভেতরের drag-and-drop (pipeline step-এর ক্রম বদলানো) গিলে ফেলে | M1 spike-এর check, তারপর M3-08 |
| System theme (light, dark, high contrast) UI-কে পাঠানো, আর বদলালে একটা event পাঠানো | সব Linux desktop-এ `prefers-color-scheme`-এর ওপর ভরসা করা যায় না (PLAT-06) | M1 spike-এর check, তারপর M3-03 |
| Webview-এর data folder ঠিক করে দেওয়া (§১০) | Webview-এর নিজের cache GitHeddle-এর local data folder-এ রাখা | M0-01 |

## ৪. Crate আর dependency-র দিক

Repository-টা একটা Cargo workspace, সাথে UI package। নামগুলো নির্দিষ্ট, বদলানো যাবে না। Shell ছাড়া প্রতিটা crate একটা library, যার Tauri-র ওপর কোনো নির্ভরতা নেই। তাই শুধু `cargo nextest` দিয়েই এগুলো test করা যায়।

| Crate | দায়িত্ব | Public surface (কথায়) | ভেতরের dependency |
|---|---|---|---|
| `crates/platform` | OS অনুযায়ী যা যা আলাদা: `git` খুঁজে বের করা আর তার version যাচাই (2.30 বা নতুন), PATH (macOS-এ login shell-এর PATH), app data folder, path normalise করা আর তুলনা, volume অনুযায়ী case sensitivity, line ending আর encoding চেনা, process তৈরির flag, keychain access, system theme, আর **launcher** module, যেটা editor, terminal আর file manager চালায় (DASH-06) আর allow-list-এ থাকা link খোলে। | শুরুতে একবার তৈরি হওয়া একটা `Platform` value, যেটা উত্তর দেয় "git কোথায়", "data folder কোথায়", "এই দুটো path কীভাবে তুলনা করব", "এই folder terminal-এ খোলো"। এর সাথে secret রাখা, পড়া আর মোছার function। | নেই |
| `crates/diff-engine` | Line diff (`imara-diff`, histogram) আর word diff (`similar`), conflict marker আর index stage 1/2/3 থেকে conflict-এর অংশ বের করা, merge editor-এর alignment data, আর conflict marker খোঁজা (CONF-11)। Pure: byte নেয়, data ফেরত দেয়। কোনো IO করে না। | একটা function, যেটা দুটো text-এর diff করে line range আর word-level পরিবর্তনের range সহ hunk ফেরত দেয়। একটা function, যেটা base, current, incoming আর worktree-এর text নিয়ে merge model ফেরত দেয় (chunk, range, spacer line)। একটা function, যেটা বলে text-এ এখনো conflict marker আছে কি না। | নেই |
| `crates/storage` | সব persistence: একটা SQLite database (`rusqlite`, bundled, WAL, `synchronous=FULL`) আর atomic JSON file (temp file লেখা, fsync, rename)। Schema version আর migration। | State cache, pipeline journal আর activity log-এর জন্য typed repository (data-access অর্থে)। প্রতিটা JSON ডকুমেন্টের ধরনের জন্য load আর save function। Data folder-এর কোনো file অন্য কোনো crate খোলে না। | `platform` |
| `crates/git-runner` | `git` চালু করার একমাত্র জায়গা। **Command guard** (§৬, GS-07), job queue, parallel limit, repo-প্রতি write lock, cancel, watchdog timeout, দীর্ঘস্থায়ী `cat-file --batch` session, Git error-এর শ্রেণীবিভাগ, আর activity record পাঠানো (BULK-04, BULK-08)। | একটা job জমা দেওয়া (repo, argument, ধরন, priority, timeout, confirmation token) আর এমন একটা handle পাওয়া, যেটা progress আর শেষ ফল জানায় (exit code, stdout, stderr, সময়), অথবা guard-এর মানা করার খবর। একটা group-এর সব job cancel করা। Repo-র cat-file session দিয়ে blob পড়া। কোন repo-গুলো trusted তা জানিয়ে দেওয়া (§৭)। Activity record-এ subscribe করা। | `platform` |
| `crates/repo-state` | Porcelain parse করা, repo status-এর model, file watcher, debounce করা refresh, delta হিসাব, আর cache করা শেষ জানা state। | কয়েকটা repo watch করা শুরু করা। একটা বা সব repo-র বর্তমান snapshot নেওয়া। Delta-তে subscribe করা। একটা repo সাথে সাথে refresh করানো (job শেষ হলে এটা লাগে, PERF-04)। Changes screen-এর জন্য line count সহ change-এর list পড়া। একটা file-এর diff, আর conflict হওয়া file-এর merge model নেওয়া (§৮)। | `platform`, `git-runner`, `storage`, `diff-engine` |
| `crates/workspace` | Workspace, `.code-workspace` import, ঠিক করে দেওয়া গভীরতা পর্যন্ত repo খোঁজা (DASH-01), group, task, setting, repo-প্রতি override, team file `.githeddle.json`, branch name-এর pattern (TASK-01), আর repo trust check (§৭, GS-08)। | Workspace খোলা আর save করা। Repo খুঁজে বের করা। একটা repo-র config দেখে কী কী review করা দরকার তা জানানো, তারপর user-এর trust-এর সিদ্ধান্ত লিখে রাখা। Group আর task তৈরি, edit আর delete করা। একটা target set (সব, group, selection, task) থেকে repo-র list বানানো (GRP-03)। Override বসিয়ে একটা repo-র আসল setting পড়া। | `platform`, `git-runner`, `storage` |
| `crates/github` | `HostingProvider` trait আর তার GitHub implementation: OAuth device flow, personal access token, আর একটা পাতলা `reqwest` client (rustls + `rustls-platform-verifier`) দিয়ে `graphql_client`-এর typed query সহ REST আর GraphQL call। | বিস্তারিত §১১-এ। Token keychain থেকে এই crate-এর ভেতরেই পড়া হয়, আর কোনো caller-কে ফেরত দেওয়া হয় না। | `platform`, `storage` |
| `crates/pipeline` | Operation catalogue (BULK-01/02, TASK-02/05/06), pipeline-এর step-এর সংজ্ঞা (PIPE-02/03), built-in pipeline (PIPE-09), variable বসানো (PIPE-04), preview আর safety check (BULK-03, SAFE-01..07), repo-প্রতি run-এর state machine আর তার journal (PIPE-07)। | একটা target set-এ কোনো operation বা pipeline-এর preview বানানো। নিশ্চিত করা preview থেকে run শুরু করা। একটা repo-র run resume, skip বা stop করা। Run-এর list দেখা, crash-এ থেমে যাওয়াগুলো সহ। Run-cell update-এ subscribe করা। | `platform`, `git-runner`, `repo-state`, `workspace`, `github`, `storage`, `diff-engine` |
| `apps/desktop/src-tauri` | Tauri shell: runtime আর core service-গুলো তৈরি করে, IPC command আর event সংজ্ঞায়িত করে, capability allow-list রাখে। পাতলা: প্রতিটা command input যাচাই করে, একটা core function ডাকে আর error-টা রূপান্তর করে। কোনো business logic নেই। | IPC contract (§৫), `tauri-specta` দিয়ে TypeScript-এ generate করা। | সব crate |

**Dependency কোন দিকে যেতে পারে।** Dependency শুধু নিচের দিকে যায়, এই ক্রমে: shell → `pipeline` → (`workspace`, `repo-state`, `github`) → (`git-runner`, `storage`) → `platform`। `diff-engine` একটা pure leaf, যেটা `repo-state` বা তার ওপরের যেকোনো crate ব্যবহার করতে পারে। কোনো cycle নেই, আর নিচের crate কখনো ওপরের crate-এর নাম নেয় না। নিচের crate-কে ওপরে কিছু জানাতে হলে (যেমন `git-runner` activity record পাঠায়) সে একটা subscription বা callback দেয়, কখনো dependency নয়।

**যে নিয়মগুলো CI-তে tool দিয়ে যাচাই হয়** (তাই owner-কে শুধু CI-এর ফল দেখতে হবে):

1. শুধু `git-runner` `git` চালু করতে পারে। এর বাইরে একমাত্র যে code process চালু করতে পারে, সেটা `platform`-এর launcher module। এটা editor, terminal আর file manager চালায়, login shell থেকে PATH বের করে আর `git --version` চালায়, আর Windows-এর `.cmd` launcher-এর জন্য Rust-এর batch-file argument escaping ব্যবহার করে (GS-11)। বাকি সব জায়গায় Clippy-র `disallowed-methods` `std::process::Command` আর `tokio::process` আটকায়, শুধু এই দুটো module-এর জন্য ছাড় আছে।
2. শুধু `github` `reqwest`-এর ওপর নির্ভর করে। শুধু shell `tauri`-র ওপর নির্ভর করে। শুধু `storage` `rusqlite`-এর ওপর নির্ভর করে। শুধু `platform` `keyring`-এর ওপর, আর শুধু `repo-state` `notify`-এর ওপর নির্ভর করে। প্রতিটা crate-এর জন্য `cargo-deny` ban দিয়ে, অথবা `tools/`-এ `cargo metadata`-র ওপর একটা ছোট check দিয়ে এটা আটকানো।
3. Test-এর বাইরে কোনো `unwrap`/`expect` নেই (`clippy::unwrap_used`), আর `platform` ছাড়া সব জায়গায় `forbid(unsafe_code)`। `platform`-এ প্রতিটা `unsafe` block-এর পাশে কেন লাগল সেই comment থাকতে হবে।
4. Generate করা TypeScript binding commit করা থাকে। CI এগুলো আবার generate করে, আর আলাদা হলে fail করে। ফলে IPC contract-এর এক দিকে বদল হলে আর অন্য দিকে না হলে build fail করে।

## ৫. IPC contract

Message দুই রকম, আর প্রত্যেকটার একটাই কাজ।

| ধরন | দিক | কীসের জন্য | উদাহরণ |
|---|---|---|---|
| **Command** | UI → core, async request আর response | Data চাওয়া, আর কিছু শুরু করা | workspace খোলা, repo snapshot নেওয়া, diff নেওয়া, preview বানানো, run শুরু, cancel, file stage করা, sign in |
| **Event** | core → UI, push | যা নিজে থেকে বদলায়, বা progress | repo-state delta, job progress, run-cell update, activity record, GitHub status update, crash-এর পরে recovery-র নোটিশ |

নিয়ম:

1. **Command দ্রুত উত্তর দেয়।** যে command লম্বা কাজ শুরু করে (bulk action, pipeline, fetch), সেটা সাথে সাথে একটা job বা run id ফেরত দেয়। Progress আর ফলাফল আসে event হিসেবে (PERF-03, PERF-05)। কোনো command network বা write operation-এর জন্য অপেক্ষা করে উত্তর দেয় না।
2. **Snapshot নয়, delta।** প্রতিটা repo state-এর একটা revision নম্বর থাকে, যেটা প্রতি পরিবর্তনে এক করে বাড়ে। একটা delta event-এ থাকে repo id, নতুন revision আর শুধু যে field-গুলো বদলেছে। UI একটা delta তখনই বসায়, যখন তার revision UI-এর কাছে যা আছে তার ঠিক এক বেশি। মাঝে ফাঁক দেখলে UI একটা command দিয়ে ওই repo-র নতুন snapshot চায়। পুরো snapshot পাঠানো হয় শুধু শুরুতে, workspace খোলার সময়, বা ফাঁক দেখা দিলে।
3. **একসাথে পাঠানো।** Core event-গুলো জমিয়ে মোটামুটি প্রতি 16 ms-এ (এক frame) একবার পাঠায়। ফলে 30টা repo একসাথে refresh হলে UI একবার update হয়, 30 বার নয়।
4. **বড় payload।** যে response 1 MB-এর মতো ছাড়িয়ে যেতে পারে, সেটা এক message-এ ফেরত না দিয়ে page করে বা Tauri channel (`tauri::ipc::Channel`) দিয়ে stream করে পাঠানো হয়। এটা diff, file list আর command output-এর বেলায় খাটে। 10,000 লাইনের বেশি file-এর diff hunk-এর ভাগে ভাগে পাঠানো হয়, আর user scroll করলে UI পরের ভাগ চায় (PERF-06)। File-এর content প্রতি pane-এ একবারই পাঠানো হয়। Hunk আর alignment data line নম্বর দিয়ে উল্লেখ করে, text আবার পাঠায় না।
5. **দুই দিকেই typed।** প্রতিটা command-এর argument, result আর event-এর payload একটা Rust type, যেটায় `serde` আর `specta` derive আছে। `tauri-specta` TypeScript type আর call function generate করে। UI কখনো string জোড়া দিয়ে command-এর নাম বানায় না।
6. **Error** boundary পার হয় শুধু §১৩-এ বলা আকারে।
7. **Secret কখনো পার হয় না।** Webview GitHub-এর login name আর sign in করা আছে কি না, শুধু এটুকু দেখতে পায়, token কখনো না। v0.1-এ কোনো avatar ছবি দেখানো হয় না, শুধু নামের আদ্যক্ষরের একটা badge, কারণ webview বাইরে থেকে কিছুই load করে না (TH-07)।
8. **Subscription screen অনুযায়ী চলে।** খরচের stream শুধু তখনই তৈরি হয়, যখন কোনো screen-এর সেটা দরকার। যেমন Changes screen খুললে UI file-প্রতি line count-এর update-এ subscribe করে, আর বন্ধ হলে unsubscribe করে। অন্তত একটা subscription খোলা থাকলেই core `--numstat` পড়ে (§৭ ধাপ ৬, [UI architecture](../design/ui-architecture.bn.md) §৫.১-এর সাথে মিলিয়ে)।

Owner কীভাবে যাচাই করবেন: generate করা binding file সেই একই pull request-এ বদলায়, যেখানে তার উৎস Rust type বদলেছে, আর CI-এর "bindings up to date" job সবুজ থাকে।

## ৬. Job runner (`git-runner`)

প্রতিটা `git` command এই crate দিয়েই যায়, সেটা dashboard refresh, bulk action, pipeline বা Run Git command, যেখান থেকেই আসুক।

**একটা job**-এ থাকে একটা repo, argument-এর list, ধরন (read, write বা network), priority, timeout, ইচ্ছে হলে একটা group id (যেমন কোনো bulk action-এর run id), আর preview থেকে পাওয়া confirmation token, যদি থাকে।

**Command guard (GS-07)।** Process চালু হওয়ার আগে প্রতিটা argument-এর list একটা কেন্দ্রীয় guard পার হয়। Guard যে job মানা করে, সেটা কখনো চালু হয় না, আর কারণ সহ মানা করা হয়েছে বলে জানানো হয়। Guard:

- push-এ `--force`, `-f` আর `+` refspec মানা করে। একমাত্র অনুমোদিত রূপ হলো স্পষ্ট ref আর প্রত্যাশিত value সহ `--force-with-lease`, তাও শুধু সেই action-এর confirmation token থাকলে (SAFE-01)
- ওই repo, ওই branch আর ওই run-এর সাথে বাঁধা confirmation token ছাড়া protected branch-এ write মানা করে (SAFE-02)
- `--no-verify`, commit-এ `-n`, আর `core.hooksPath` বা `credential.helper` বদলানো যেকোনো `-c` মানা করে (SAFE-05)
- trusted নয় এমন repo-তে প্রতিটা command মানা করে, শুধু trust check-এর config পড়া ছাড়া (§৭, GS-08)
- revision-এর আগে `--end-of-options` আর path-এর আগে `--` বাধ্যতামূলক করে, আর branch ও tag-এর নাম `git check-ref-format` দিয়ে যাচাই করে (GS-04)

Guard হলো শেষ পাহারা। `pipeline` প্রতিটা step-এর আগে তবুও নিজের preflight check চালায় (§৯), তাই স্তর দুটো, আর একটায় bug থাকলেও সুরক্ষা চলে যায় না।

**Scheduling:**

| নিয়ম | বিস্তারিত | PRD |
|---|---|---|
| Action-এর parallel limit | Bulk action আর pipeline-এর write ও network job একটা semaphore ভাগ করে নেয়, যার আকার user-এর parallel limit (default 4, CFG-01)। | BULK-04, PIPE-06 |
| আলাদা read pool | Refresh-এর status read নিজের একটা ছোট pool-এ চলে (প্রস্তাবিত default 8), যাতে লম্বা bulk push-এর সময় dashboard আটকে না যায়। | PERF-02, PERF-05 |
| প্রতি repo-তে একজন writer | Repo-প্রতি একটা lock, যাতে একটা repo-তে একসাথে একটাই write job চলে। ওই repo-তে read পাশাপাশি চলতে পারে, কারণ সেগুলো `GIT_OPTIONAL_LOCKS=0` ব্যবহার করে আর কখনো `index.lock` নেয় না। | SAFE-07 |
| Priority | User-এর শুরু করা job আগে, তারপর refresh, তারপর background fetch (default-এ বন্ধ, DASH-04)। | PERF-03 |

**Process চালু করা।** শুরুতে `platform` একবার `git`-এর যে absolute path খুঁজে পেয়েছে, runner সেটাই ব্যবহার করে। `.bat` আর `.cmd` wrapper নেয় না। কখনো shell-এর মধ্য দিয়ে যায় না। Argument যায় list হিসেবে, path-এর আগে সবসময় `--` থাকে। BULK-07-এর জন্য user-এর লেখা text `shell-words` দিয়ে ভাঙা হয়। প্রতিটা process পায়:

- stdin null করা
- `GIT_TERMINAL_PROMPT=0`, যাতে credential না থাকলে আটকে না থেকে সাথে সাথে fail করে। User-এর নিজের credential helper, Git Credential Manager-এর মতো graphical-গুলো সহ, তবুও কাজ করে (SAFE-05)।
- background read-এর জন্য `GIT_OPTIONAL_LOCKS=0`
- Windows-এ `CREATE_NO_WINDOW`
- `process-wrap`: Windows-এ একটা Job Object, যেটা GitHeddle বন্ধ হলে পুরো process tree মেরে ফেলে; Unix-এ একটা process group

**Cancel (BULK-04)।** Cancel করলে group-টা cancelled হিসেবে চিহ্নিত হয়। যে job এখনো শুরু হয়নি, সেগুলো বাদ পড়ে আর "skipped: cancelled" হিসেবে দেখায়। যে Git command চলছে, সেগুলো শেষ হতে দেওয়া হয়, যাতে কোনো repo write-এর মাঝপথে কেটে না যায়। Process tree মারা হয় শুধু app বন্ধ হওয়ার সময় (write চললে আগে user-কে জিজ্ঞেস করে), বা watchdog-এ সময় ফুরালে।

**Timeout।** প্রতিটা ধরনের job-এর একটা watchdog আছে। প্রস্তাবিত default, M2-তে ঠিক করা হবে: read 30 s। Network job 120 s কোনো output না দিলে fail করে, কিন্তু output আসতে থাকলে কখনো কাটা হয় না। যে write-এ hook চলতে পারে, তার কোনো কড়া সীমা নেই; 60 s পরে UI "এখনো চলছে" দেখায় আর Cancel করার সুযোগ দেয়। Watchdog-এ থামা job "timed out" কারণ দিয়ে failed হিসেবে দেখায়, আর ওই repo-তে অন্য কিছু চালানোর আগে repo-টা আবার পড়া হয়।

**cat-file session।** Diff আর merge editor-এর জন্য, কোনো repo-র Changes বা Conflicts view ব্যবহার হতে থাকলে runner ওই repo-র জন্য একটা `git cat-file --batch` process চালু রাখে। প্রতিবার নতুন process না চালিয়েই এর মধ্য দিয়ে blob পড়া হয়। প্রায় 60 s কিছু না হলে session বন্ধ হয়ে যায়, যাতে 30টা দীর্ঘস্থায়ী process memory খেয়ে না ফেলে (PERF-07)।

**ফলাফল।** প্রতিটা শেষ হওয়া job দেয় exit code, stdout, stderr, সময়, আর error থাকলে তার শ্রেণী (§১৩)। প্রতিটা job, সফল হোক বা না হোক, একটা activity record পাঠায় (§১৪)।

Owner কীভাবে যাচাই করবেন: parallel limit 2 করে একটা group-এ bulk Fetch চালান, তারপর activity log-এ দেখুন যে একসাথে দুটোর বেশি network command চলেনি। এরপর 10টা repo-তে pull চলার সময় Cancel চাপুন, আর দেখুন বাকি repo-গুলো skipped হিসেবে দেখাচ্ছে।

## ৭. Repo-state pipeline (`repo-state`)

এভাবেই polling ছাড়া dashboard live থাকে (DASH-04, PERF-02, PERF-04, PERF-07)।

**আগে repo trust (GS-08)।** `git status`-ও repo-র নিজের config-এ লেখা program চালাতে পারে, যেমন `core.fsmonitor`-এ দেওয়া কোনো command। তাই কোনো repo workspace-এ যোগ হলে, আর কিছু চলার আগে `workspace` তার local config পড়ে। এর জন্য সে শুধু `git-runner` দিয়ে config পড়ে, যেটা trusted নয় এমন repo-তে guard-এর অনুমতি পাওয়া একমাত্র command, আর `include.path` ও `includeIf`-এর target-গুলোও অনুসরণ করে। সে খোঁজে:

- `core.fsmonitor`-এ কোনো command (`true` আর `false` value চলবে)
- `core.sshCommand`
- GitHeddle যে command চালায় তাতে `core.pager` আর `core.editor` override
- filter, diff আর merge driver
- `include.path` আর `includeIf`-এর target

কিছু না পেলে repo trusted হয়। নইলে user-কে **প্রতি workspace-এ একবার** জিজ্ঞেস করা হয়, চিহ্নিত সব repo আর key-এর একটা list দিয়ে। User trust না করা পর্যন্ত repo-টা "Needs review" দেখায়, আর কোনো `git` command পায় না, background `status`-ও না। Guard এটা নিশ্চিত করে (§৬)। Trust-এর সিদ্ধান্ত repo-র path আর যে config দেখে সিদ্ধান্ত হয়েছে তার hash সহ রাখা হয় (§১০)। Config বদলালে repo আবার যাচাই হয়।

Refresh-এর ধাপ:

1. **Cache থেকে শুরু।** Workspace খুললে `storage` SQLite থেকে প্রতিটা repo-র শেষ জানা state load করে। UI সেটা সাথে সাথে দেখায়, প্রতিটা row-তে ছোট একটা "update হচ্ছে" চিহ্ন সহ (PERF-02)। Window দেখা যাওয়ার আগে কোনো `git` চলে না।
2. **Watch।** প্রতিটা repo-র জন্য `notify` Git folder (HEAD, index, refs, packed-refs, `MERGE_HEAD`, `rebase-merge`, `rebase-apply`, `CHERRY_PICK_HEAD`, `FETCH_HEAD`) আর worktree watch করে। Git folder খুঁজে বের করা হয় repo-র `.git` entry থেকে, Git না চালিয়েই: সেটা হয় একটা folder, নয়তো linked worktree-এর জন্য একটা `gitdir:` file। Worktree-এর event ignore rule দিয়ে ছেঁকে নেওয়া হয়, আর `.git/objects`-এর ভেতরের পরিবর্তন উপেক্ষা করা হয়।
3. **Debounce।** `notify-debouncer-full` একসাথে আসা অনেক event এক করে ফেলে। তারপর event-গুলো জুড়ে প্রতি repo-তে মোটামুটি প্রতি 150 ms-এ সর্বোচ্চ একটা refresh হয়।
4. **অন্য trigger।** Window আবার focus পেলে সব repo refresh হয় (DASH-04)। কোনো repo-তে job শেষ হলে debounce বাদ দিয়ে সাথে সাথে ওই repo refresh হয় (PERF-04)। Background fetch-এর timer ইচ্ছামূলক, default-এ বন্ধ।
5. **প্রতি repo-তে একবারে একটা refresh।** Refresh চলার সময় event এলে, পরে একটা refresh queue-তে রাখা হয়। Refresh কখনো জমে স্তূপ হয় না।
6. **পড়া।** একটা refresh read pool দিয়ে চালায়:
   - `git status --porcelain=v2 --branch -z`: branch, upstream, upstream-এর তুলনায় ahead/behind, আর staged, changed, untracked ও conflicted entry
   - repo-র base branch-এর (`dev` বা তার override, CFG-02) সাথে `git rev-list --left-right --count`
   - stash-এর সংখ্যা
   - ধাপ ২-এ বলা চলমান operation-এর file আছে কি না

   File-প্রতি line count (`git diff --numstat -z --no-ext-diff --no-textconv`, `--cached` সহ ও ছাড়া) পড়া হয় শুধু তখন, যখন line count-এর কোনো subscription খোলা থাকে, মানে Changes screen দেখা যাচ্ছে (§৫ নিয়ম ৮), কারণ এটার খরচ বেশি (CHG-02, PERF-08)। `--no-ext-diff` আর `--no-textconv` নিশ্চিত করে যে বাইরের কোনো program চলে না (GS-09)। `for-each-ref` দিয়ে branch-এর list পড়া হয় branch picker খুললে।
7. **Parse।** Pure parser `-z` output থেকে repo status model বানায়। এগুলো snapshot দিয়ে test করা হয় আর `cargo-fuzz` দিয়ে fuzz করা হয়, কারণ Git-এর output এমন input, যেটা আমাদের নিয়ন্ত্রণে নেই।
8. **Delta।** নতুন model আগেরটার সাথে মেলানো হয়। কিছু না বদলালে কিছুই পাঠানো হয় না। নইলে revision বাড়ে আর একটা delta event queue-তে যায় (§৫)।
9. **Cache লেখা।** নতুন state background-এ SQLite cache-এ লেখা হয়, প্রতি repo-তে কয়েক সেকেন্ডে সর্বোচ্চ একবার, যাতে পরের বার চালু হলে প্রায় সত্যিকারের অবস্থা দেখা যায়।

**বসে থাকা মানে সত্যিই বসে থাকা।** কোনো file না বদলালে আর focus না বদলালে GitHeddle কোনো `git` command চালায় না, আর core-এর কোনো thread জেগে ওঠে না (PERF-07)।

**Watcher-এর সীমা।** Linux-এ inotify-তে user-প্রতি watch-এর একটা সীমা আছে, আর বড় worktree (যেমন `node_modules` থাকলে) সেটা ছুঁয়ে ফেলতে পারে। কোনো worktree watch করা না গেলে GitHeddle ওই repo-র শুধু Git folder watch করে, focus পেলে refresh চালিয়ে যায়, আর সীমা কীভাবে বাড়াতে হয় তা এক লাইনে জানিয়ে দেয়। কখনো polling-এ ফিরে যায় না।

## ৮. Diff আর merge-এর data flow (`diff-engine`)

**Changes screen আর diff view-এর diff (CHG-04):**

1. UI একটা repo-র একটা file-এর diff চায়: staged (HEAD → index) বা unstaged (index → worktree)।
2. `git-runner` repo-র cat-file session দিয়ে পুরোনো দিকটা পড়ে (`HEAD:path` বা `:path`)। `platform` disk থেকে worktree-এর file পড়ে।
3. `platform` binary content (প্রথম 8 KB-তে NUL byte), encoding আর line ending-এর ধরন চেনে। Binary file আর একটা আকারের সীমার (প্রস্তাবিত 5 MB) বেশি বড় file-এর জন্য diff-এর বদলে একটা সারাংশ দেখানো হয়।
4. `diff-engine` histogram line diff (`imara-diff`) চালায়, তারপর বদলানো প্রতিটা লাইনের জোড়ার জন্য word diff (`similar`)। Screen-এ যে hunk-গুলো দেখা যাচ্ছে, সেগুলোর word diff আগে হিসাব হয়।
5. ফলাফল হলো দুই দিকের line range আর বদলানো character-এর range সহ hunk। প্রতিটা দিকের text একবার পাঠানো হয়, আর hunk-গুলো line নম্বর দিয়ে উল্লেখ করে। UI-এর CodeMirror 6 view এগুলো থেকে decoration বানায় আর syntax highlighting নিজেই করে, language pack load করে শুধু দরকার হলে।
6. **View যা-ই হোক, diff engine একটাই।** Rust-এ হিসাব করা এই chunk `@codemirror/merge` নিতে পারে কি না, M1-02 তা যাচাই করে। পারলে diff view এটা ব্যবহার করে। না পারলে দুই diff mode-ই merge editor-এর ভাগাভাগি করা aligned-panes layer-এ আঁকা হয়। যেভাবেই হোক, JavaScript-এ কখনো দ্বিতীয় কোনো diff engine থাকে না, তাই diff view, Changes-এর সংখ্যা আর merge editor সবসময় একমত থাকে।

**Merge editor (CONF-03..09):**

1. `git ls-files -u -z` প্রতিটা conflict হওয়া file-এর stage 1 (base), stage 2 আর stage 3-এর blob id দেয়। কোন stage কোন pane-এ যাবে, তা নির্ভর করে কোন operation চলছে তার ওপর:

   | Operation | Current pane (ডানে) | Incoming pane (বাঁয়ে) |
   |---|---|---|
   | Merge | Stage 2: HEAD, আপনি যে branch-এ আছেন | Stage 3: `MERGE_HEAD`, যে branch merge হয়ে আসছে |
   | Rebase | Stage 2: যে commit-এর ওপর তৈরি হচ্ছে (যে branch-এর ওপর rebase করছেন, সাথে আগেই replay হওয়া commit-গুলো) | Stage 3: আপনার যে commit replay হচ্ছে |
   | Cherry-pick | Stage 2: HEAD | Stage 3: যে commit pick করা হচ্ছে |

   প্রতিটা pane-এর শিরোনামের জন্য core আসল branch-এর নাম, অথবা ছোট commit id আর subject পাঠায় (CONF-03)। Rebase-এ শিরোনাম বলে দেয় কোন দিকটা আপনার, কারণ সেখানে "current" আপনার branch নয়।
2. তিনটা blob cat-file session দিয়ে পড়া হয়। Worktree-এর file-ও পড়া হয়, কারণ Git যে conflict marker লিখেছে সেগুলো ওখানে আছে।
3. `diff-engine` দুই উৎস থেকে merge model বানায়:
   - **Conflict-এর অংশগুলো আসে worktree file-এ Git-এর নিজের marker থেকে,** তাই conflict-এর সংখ্যা আর জায়গা হুবহু Git-এর সিদ্ধান্তের সাথে মেলে (CONF-05, PRD-র §১০ "Git যা করত তার সাথে মেলে")। Parser `merge`, `diff3` আর `zdiff3`, তিন conflict style-ই বোঝে, user-এর `merge.conflictStyle`-এ যেটাই থাকুক।
   - **Incoming আর Current pane-এর পুরো text আসে stage 3 আর 2 থেকে।** Base আসে stage 1 থেকে, Base view-এর জন্য তৈরি থাকে (CONF-12)।
   - **Conflict-এর বাইরের পরিবর্তন worktree-এর text-এ আগেই বসানো আছে।** Core Result পাঠায় worktree-এর text হিসেবে, যেখানে **প্রতিটা conflict-এর range খালি রাখা**, সাথে region-এর list। UI প্রতিটা খালি range-এ একটা "unresolved" placeholder আঁকে, তাই conflict marker কখনো ভুল করে save হতে পারে না।
   - `git merge-file` এই model-এর জন্য শুধু test oracle হিসেবে ব্যবহার হয়, run time-এ কখনো নয়।
4. **Alignment data:** প্রতিটা chunk-এর (অপরিবর্তিত, নিজে থেকে বসানো, বা conflict) জন্য Incoming, Current আর Result-এ line range, আর প্রতিটা pane-এ কয়টা spacer line লাগবে, যাতে মেলানো লাইনগুলো পাশাপাশি থাকে আর pane-গুলো একসাথে scroll করে (CONF-06)। প্রতিটা conflict-এর একটা স্থির id আছে, যেটা checkbox, Next/Previous আর "Conflict 2 of 6" counter-এ ব্যবহার হয় (CONF-04, CONF-07)।
5. UI তিনটা CodeMirror view দেখায়। Checkbox-এ টিক দিলে সেটা একটা editor change হয়ে যায়, যেটা Result-এ ওই conflict-এর range ভরে দেয়। User হাতে edit করলেও CodeMirror-এর position mapping range-গুলো ঠিক রাখে। প্রতিটা conflict-এ কোনটায় আগে টিক পড়েছে, সেই ক্রম রাখা হয় (CONF-04)।
6. **Accept merge (CONF-09):** UI শেষ Result text `pipeline`-এর "resolve file" operation-এ পাঠায়। এটা marker খোঁজে (CONF-11), আর marker থেকে গেলে মানা করে দেয়। নইলে আসল line ending আর encoding রেখে file-টা atomic ভাবে লেখে, `git add -- <path>` চালায়, আর UI পরের conflict হওয়া file-এ চলে যায়।
7. **বিশেষ ক্ষেত্র** (worktree-এ marker নেই: delete/modify conflict, binary file, submodule): model-এ পুরো file নিয়ে একটাই conflict থাকে, যেখানে শুধু take current বা take incoming করা যায় (CONF-02, CONF-08)।

Owner কীভাবে যাচাই করবেন: `tests/fixtures`-এর fixture repo-গুলোতে প্রতিটা conflict style-এর conflict আছে। Snapshot test প্রতিটার merge model দেখায়, আর একটা Playwright test mock করা IPC দিয়ে এগুলোর ওপর merge editor খোলে।

## ৯. Pipeline-এর state machine আর crash-safe journal (`pipeline`)

Bulk action আর pipeline একই engine ভাগ করে নেয়। একটা bulk action (BULK-01)-কে এক step-এর run হিসেবে ধরা হয়, তাই pipeline-এর মতো এটাও একই preview, result grid, journal আর crash recovery পায় (PRD-র §৯ নির্ভরযোগ্যতা)।

**একটা run** রাখে: run শুরুর সময় pipeline-এর সংজ্ঞা যেমন ছিল তার একটা copy, target repo-গুলো, প্রতিটা repo-র বসানো variable (`{current}`, `{base}`, `{task}`, PIPE-04), preview-এ দেওয়া সম্মতি (protected branch-এ push, force with lease, SAFE-01/02, PIPE-05), আর শুরুর branch-এ ফিরে যাওয়ার setting (PIPE-06)।

**Repo-প্রতি state:**

| State | অর্থ | যে cell দেখায় (PIPE-08) |
|---|---|---|
| Waiting | এখনো শুরু হয়নি, বা খালি slot-এর অপেক্ষায় | ○ |
| Running (step *n*) | একটা step চলছে | spinner |
| Paused (step *n*, কারণ) | Conflict, failure, Wait for confirmation step, বা crash-এর কারণে একটা step-এ থেমে আছে | ⏸ |
| Done | সব step শেষ | প্রতি step-এ ✓ |
| Failed (step *n*) | একটা step fail করেছে আর "step fail করলে এই repo থামাও" চালু আছে | ✗ |
| Stopped | User Stop বেছে নিয়েছেন | যে step-গুলো চলেছে সেগুলোর চিহ্ন থাকে, বাকিগুলো – দেখায় |

করার কিছু ছিল না বলে যে step skip হয়েছে (PIPE-11), সেগুলোও – দেখায়।

**Transition:**

1. Slot খালি হলে Waiting → Running। তার আগে একটা preflight repo-র state আবার পড়ে আর safety check চালায়: dirty tree, আগে থেকেই merge বা rebase চলছে, protected branch, diverged (SAFE-06, SAFE-07)। Preflight আটকালে repo কারণ সহ Paused-এ যায়।
2. Step-এর ফল অনুযায়ী Running → পরের step, Done, Paused (conflict বা failure) বা Failed।
3. **Resume**-এ Paused → Running (নতুন preflight-এর পরে একই step আবার চলে), **Skip step**-এ পরের step-এ, আর **Stop**-এ Stopped, যেখানে নিরাপদ হলে undo করার সুযোগ দেওয়া হয় (BULK-09, P1)।
4. **Wait for confirmation** step একটা বাধার মতো কাজ করে: যে repo ওখানে পৌঁছায়, সেটা ওখানে pause হয়, আর একবার Continue চাপলে সবাই একসাথে ছাড়া পায়।
5. শেষ step-এর পরে, শুরুর branch-এ ফেরার setting চালু থাকলে, একটা শেষ step প্রতিটা repo-কে তার শুরুর branch-এ ফিরিয়ে নেয় (PIPE-06)।

**Journal (SQLite-এ, আগে লেখা হয়):**

1. Step চলার আগে একটা "step started" row commit হয়, তখনকার branch আর HEAD সহ (undo-র জন্য লাগে, BULK-09)। Database WAL আর `synchronous=FULL` ব্যবহার করে, তাই `git` শুরু হওয়ার আগেই row-টা disk-এ পৌঁছে যায়।
2. Git command চলে।
3. ফল, exit code আর activity record-এর একটা pointer সহ একটা "step finished" row commit হয়।
4. Run আর repo-র state-এর পরিবর্তনও একইভাবে লেখা হয়। Row শুধু যোগ হয়, কখনো বদলায় না, তাই সবচেয়ে নতুন row-টাই সবসময় সত্যি।

**Restart-এর পরে মিলিয়ে দেখা:**

1. চালু হওয়ার সময় core এমন run খোঁজে, যেখানে "step started" row আছে কিন্তু "step finished" row নেই, বা যেখানে কোনো repo Done, Failed বা Stopped কোনোটাই নয়।
2. এমন প্রতিটা repo-র live state আবার পড়া হয়:
   - **Merge, rebase বা cherry-pick চলছে:** repo "conflicts" কারণে Paused হয়।
   - **Step-এর কাজ স্পষ্টভাবে শেষ:** যেমন push-এর বেলায় remote branch এখন প্রত্যাশিত commit-এ, বা switch branch-এর বেলায় HEAD target-এ। Step-টা "restart-এর পরে নিশ্চিত" চিহ্ন দিয়ে done হিসেবে লেখা হয়, আর repo পরের step-এ paused থাকে।
   - **বাকি সব ক্ষেত্রে:** "interrupted: এই repo-টা দেখে নিন" কারণে Paused।
3. **Crash-এর পরে কোনো write step কখনো নিজে থেকে আবার চলে না।** User Resume, Skip step বা Stop দিয়ে সিদ্ধান্ত নেন।
4. App একটা recovery নোটিশ দেখায়, যেখানে প্রভাবিত repo আর তাদের state-এর list থাকে (PRD-র §৯ নির্ভরযোগ্যতা)। তারপর paused run-গুলো স্বাভাবিকভাবে run screen-এ দেখা যায় (PIPE-07)।

Owner কীভাবে যাচাই করবেন: `tests/`-এর একটা test fixture repo-তে pipeline চলার মাঝখানে app-এর process মেরে ফেলে, আবার চালু করে, আর recovery list যাচাই করে। Owner হাতেও এটা করতে পারেন: তিনটা repo-তে "Update from main" চালু করে Task Manager বা Activity Monitor থেকে process বন্ধ করে দিন।

## ১০. OS অনুযায়ী storage-এর বিন্যাস (`storage`)

**নাম।** App আর folder-এর দেখা যাওয়া নাম `GitHeddle`। Bundle identifier হলো `net.devtaosif.githeddle` (অনুমান: `dev-taosif-net` GitHub account থেকে নেওয়া; M0-01-এ নিশ্চিত করতে হবে, কারণ পরে বদলালে data folder সরে যায়)। Data folder-গুলো পড়তে সহজ `GitHeddle` নাম ব্যবহার করে, যেটা identifier থেকে না নিয়ে আলাদা করে ঠিক করে দেওয়া হয়।

| কী | Windows | macOS | Linux |
|---|---|---|---|
| Setting, workspace (group, task, pipeline, repo-প্রতি override সহ), window আর layout-এর state: JSON | `%APPDATA%\GitHeddle\` | `~/Library/Application Support/GitHeddle/` | `$XDG_CONFIG_HOME/GitHeddle/` (default `~/.config/GitHeddle/`) |
| `state.db` (SQLite: repo-state cache, pipeline journal, activity log, cache করা pull request status) | `%LOCALAPPDATA%\GitHeddle\` | `~/Library/Application Support/GitHeddle/` | `$XDG_DATA_HOME/GitHeddle/` (default `~/.local/share/GitHeddle/`) |
| Diagnostic log (ঘুরিয়ে লেখা) | `%LOCALAPPDATA%\GitHeddle\logs\` | `~/Library/Logs/GitHeddle/` | `$XDG_STATE_HOME/GitHeddle/logs/` (default `~/.local/state/…`) |
| GitHub token | Windows Credential Manager | macOS Keychain | Secret Service (না থাকলে: শুধু ওই session-এর জন্য memory-তে, কখনো disk-এ লেখা হয় না) |
| Repo trust-এর সিদ্ধান্ত (`trust.json`: repo-র path + config-এর hash, §৭) | `%APPDATA%\GitHeddle\` | `~/Library/Application Support/GitHeddle/` | `$XDG_CONFIG_HOME/GitHeddle/` |
| Webview-এর data (engine-এর নিজের cache আর storage; GitHeddle সেখানে কোনো state রাখে না) | `%LOCALAPPDATA%\GitHeddle\WebView2\` (WebView2-এর user-data folder, shell ঠিক করে দেয়) | `~/Library/WebKit/net.devtaosif.githeddle/` আর `~/Library/Caches/net.devtaosif.githeddle/` (WKWebView বেছে নেয়) | `$XDG_DATA_HOME/net.devtaosif.githeddle/` আর `$XDG_CACHE_HOME/net.devtaosif.githeddle/` (WebKitGTK বেছে নেয়) |
| Single-instance lock | `tauri-plugin-single-instance` সামলায় (§৩) | একই | একই |
| Team file | workspace-এর root-এ `.githeddle.json` (CFG-03) | একই | একই |

নিয়ম:

1. প্রতিটা JSON ডকুমেন্টে একটা `schemaVersion` থাকে, আর load করার সময় নতুন version-এ migrate হয়। নতুন কোনো version-এর file সতর্কবার্তা সহ শুধু পড়ার জন্য খোলা হয়।
2. JSON atomic ভাবে লেখা হয়: একই folder-এ একটা temp file লেখা, fsync করা, তারপর পুরোনোটার ওপর rename। Crash হলে হয় পুরোনো file থাকে, নয় নতুনটা, কখনো আধখানা নয়।
3. SQLite-এর schema version থাকে `user_version`-এ। চালু হওয়ার সময় migration একটা transaction-এর মধ্যে চলে।
4. `state.db`-তে শুধু এমন জিনিস থাকে, যা আবার বানানো যায় বা যা ইতিহাস। Corrupt হলে সেটা নাম বদলে সরিয়ে রেখে নতুন করে তৈরি হয়, setting-এ হাত পড়ে না। একমাত্র আসল ক্ষতি journal, তাই app সেটা জানিয়ে দেয়।
5. কতদিন রাখা হবে (প্রস্তাবিত): activity log 30 দিন বা 50 MB, যেটা আগে আসে। শেষ হওয়া run রাখা হয় run history-র জন্য (PIPE-14, P1)।

## ১১. GitHub provider interface (`github`)

`HostingProvider` trait-ই একমাত্র পথ, যা দিয়ে app-এর বাকি অংশ কোনো hosting service-এর সাথে কথা বলে (PRD-র §১০)। কথায় বললে, এটা দেয়:

- **চেনা:** একটা repo-র remote URL দিলে বলে দেয় এই provider সেটা সামলায় কি না, আর owner ও repo-র নাম জানায়।
- **Sign in:** OAuth device flow শুরু করে দেখানোর code ফেরত দেওয়া, approve না হওয়া পর্যন্ত poll করা, বদলে personal access token নেওয়া, token যাচাই করে login ফেরত দেওয়া, আর sign out করা (PR-01)। Device flow `reqwest`-এর ওপর হাতে লেখা। Token সোজা `platform` দিয়ে keychain-এ যায়।
- **Pull request তৈরি:** title, body, draft flag, reviewer, assignee আর label সহ (PR-02)। একটা branch-এর জন্য আগে থেকে pull request আছে কি না দেখে নেওয়া, যাতে কখনো দুবার তৈরি না হয়।
- **Pull request update:** title, body, reviewer, label, draft বা ready, close (PR-03, PR-07)।
- **একসাথে status:** অনেকগুলো pull request-এর state, check, review-এর অবস্থা, merge করা যায় কি না আর comment-এর সংখ্যা, একটা GraphQL request-এ (PR-05)। এখানে `graphql_client`-এর typed query ব্যবহার হয়, প্রতিটা pull request-এর জন্য একটা alias সহ।
- **List:** আমার তৈরি, বা যেখানে আমার কাছে review চাওয়া হয়েছে এমন pull request (PR-06)।
- **Merge:** বেছে নেওয়া method দিয়ে (PR-08), আর repo-র pull request template পড়া (PR-04)।
- **Capability:** এই host কী কী সমর্থন করে (draft pull request, merge method, একসাথে status), যাতে যা খাটে না UI সেটা লুকিয়ে রাখে।

বিস্তারিত:

- **Related pull request (PR-03):** প্রতিটা body-তে section-টা দুটো নির্দিষ্ট লুকানো HTML-comment marker-এর মাঝে বসানো হয়। Update-এ শুধু ওই section বদলায়, body-র বাকি অংশ user যেমন লিখেছেন তেমনই থাকে।
- **Rate limit (PRD-র §১৩):** client GitHub-এর rate-limit header পড়ে আর সীমায় পৌঁছানোর আগেই গতি কমিয়ে দেয়। Status `state.db`-তে cache হয়, আর refresh হয় যখন কোনো pull request screen দেখা যায়, চাইলে, আর GitHeddle-এর নিজের কোনো action-এর পরে। একটানা polling নেই। REST read ETag ব্যবহার করে।
- **Base URL:** v0.1-এ github.com (PRD-র §১৪ প্রশ্ন ১)। API-এর base URL একটা setting, তাই design না বদলেই GitHub Enterprise যোগ করা যাবে।
- **Error** provider error-এর কয়েকটা ধরনে ভাগ হয়: sign in করা নেই, token-এর মেয়াদ শেষ, অনুমতি নেই, পাওয়া যায়নি, rate limited, validation fail (GitHub-এর message সহ), network। UI প্রতিটা ধরনকে §১৩-এ বলা উপায়ে একটা message-এ বদলায়।

## ১২. Platform স্তর (`platform`)

PLAT-03 আর PRD-র §১৩-এর সব পার্থক্য এখানেই সামলানো হয়, আর কোথাও না:

| বিষয় | পদ্ধতি |
|---|---|
| `git` খোঁজা | PATH-এ খোঁজা (আর প্রতিটা OS-এর স্বাভাবিক install-এর জায়গায়)। Absolute path একবার বের করে version যাচাই (2.30 বা নতুন)। না পেলে বা পুরোনো হলে এমন একটা error ফেরত দেওয়া, যেটা বলে এই OS-এ Git কীভাবে install করতে হয় (PRD-র §৯ সামঞ্জস্য)। |
| macOS-এ PATH | Finder থেকে খোলা app shell-এর PATH পায় না। User-এর login shell থেকে timeout সহ একবার সেটা পড়ে নেওয়া, যাতে Homebrew-র `git`, credential helper আর hook খুঁজে পাওয়া যায়। |
| Process flag | Windows-এ `CREATE_NO_WINDOW`। Job Object বা process group তৈরি। §৬-এর environment variable। |
| Path | OS-এর path আর Git-এর forward-slash path-এর মধ্যে রূপান্তর। Windows-এ লম্বা path সমর্থন। |
| Case sensitivity | OS দেখে ধরে না নিয়ে **প্রতিটা volume-এ আলাদা করে** যাচাই করা হয়। Windows-এর folder case-sensitive হতে পারে, macOS-এর volume case-sensitive করে format করা থাকতে পারে, আর Linux-এ case-insensitive drive mount করা থাকতে পারে। ফল অনুযায়ী path তুলনা হয়, যাতে দুবার খুঁজে পাওয়া একটা repo একবারই দেখায়, আর শুধু case বদলানো rename ঠিকঠাক দেখায়। |
| Line ending আর encoding | LF না CRLF চেনা, আর file লেখার সময় সেটাই রাখা (merge editor)। UTF-8 BOM আর UTF-16 চেনা। নিজে থেকে কখনো file-এর line ending না বদলানো; Git-এর `core.autocrlf`-ই নিয়ন্ত্রণে থাকে। |
| Keychain | `keyring`-কে মুড়ে রাখা: token রাখা, পড়া আর মোছা। Linux-এ Secret Service না থাকলে সেটা পরিষ্কার করে জানানো। |
| Launcher module | `git-runner`-এর বাইরে process চালু করার একমাত্র জায়গা (§৪ নিয়ম ১)। এটা editor (default `code`), terminal (Windows Terminal বা `cmd`, Terminal.app, Linux-এ desktop-এর default terminal) আর file manager খোলে, প্রতিটা বদলানো যায় (DASH-06, CFG-01)। এটা argument-এর list ব্যবহার করে, আর `code.cmd`-এর মতো `.cmd` launcher-এর জন্য Rust-এর batch-file escaping। নিরাপদে পাঠানো যায় না এমন path পরিষ্কার message দিয়ে মানা করা হয় (GS-11)। Login shell থেকে PATH বের করা আর `git --version` চালানোও এর কাজ। |
| Link খোলা | কড়া allow-list: `https://github.com/…`, আর setting-এ GitHub Enterprise host দেওয়া থাকলে সেটা। অন্য কোনো URL কখনো সরাসরি খোলা হয় না। UI সেটা পুরোটা দেখায়, সাথে একটা Copy button (UN-04)। |
| Theme | System theme (light, dark, high contrast) পড়া আর বদল জানানো, যাতে shell সেটা UI-কে পাঠাতে পারে (§৩, PLAT-06)। |
| Shortcut | UI-কে জানানো যে এটা কোন OS-এ চলছে, যাতে Ctrl না ⌘ ব্যবহার হবে তা ঠিক করতে পারে (PLAT-05)। |

এই crate-এর প্রতিটা function-এর test CI-তে তিনটা OS-এই চলে (PRD-র §১৩, PLAT-04)।

## ১৩. Error model আর user যে error দেখেন

1. **Crate-এর ভেতরে:** প্রতিটা library crate-এর নিজস্ব `thiserror` error enum আছে। `anyhow` ব্যবহার হয় শুধু shell-এ, চালু হওয়ার সময়ের জোড়া লাগানোর code-এ।
2. **Git error-এর শ্রেণীবিভাগ:** `git-runner` exit code আর চেনা stderr pattern থেকে একটা স্থির error code বের করে, যেমন pull-এর সময় dirty worktree, non-fast-forward push, authentication fail, `index.lock` আছে, branch আগে থেকেই আছে, merge conflict, hook মানা করেছে। যা চেনে না, সেটা raw message সহ "git failed" হয়। কোনো pattern ধরা না পড়লে message শুধু কম নির্দিষ্ট হতে পারে, কখনো ভুল নয়। **শ্রেণীবিভাগ শুধু message বাছে।** Repo-র অবস্থা নিয়ে GitHeddle কী বিশ্বাস করে, সেটা এটা কখনো বদলায় না; সেটা সবসময় আসে Git থেকে নতুন করে পড়া machine format থেকে (GS-12)।
3. **IPC পার হওয়ার সময়:** একটাই `UserError` আকার, যেটা **একটা code আর কিছু parameter** দিয়ে তৈরি, তৈরি করা কোনো বাক্য নেই:
   - একটা স্থির `code` (যেমন `git.pull.dirty_worktree`)
   - message-এর parameter (যেমন repo-র নাম, branch, file-এর সংখ্যা)
   - repo আর step
   - Retry করা অর্থপূর্ণ কি না
   - যে action button-গুলো খাটে (Retry failed, Open terminal, Show log, BULK-05)
   - technical বিস্তারিত: argument, exit code, stderr
4. **Message-এর লেখা** থাকে শুধু UI-এর `copy/` catalogue-এ, `code` অনুযায়ী সাজানো। এটাই code আর parameter থেকে সারাংশ আর পরের কাজটা বানায় (UX-04), যেমন "Pull stopped: app-front has local changes. Stash them or commit first."। বিস্তারিত এক click দূরে। এতে লেখার ধরন এক থাকে, আর পরে বাংলা UI করা সম্ভব হয় (PRD-র §১৪ প্রশ্ন ৭)।
5. **কিছুই লুকানো হয় না:** প্রতিটা fail করা job result-এর সারাংশে (BULK-05) আর activity log-এ দেখা যায়। নিজে থেকে কিছু আবার চালানো হয় না, শুধু `index.lock` ব্যস্ত থাকলে read একবার আবার চেষ্টা করা হয়।
6. **`index.lock`:** কখনো নিজে থেকে মোছা হয় না। কোনো lock থেকে গেলে app বুঝিয়ে বলে এটা কী আর মুছলে কী ঝুঁকি। মোছার প্রস্তাব দেয় শুধু তখন, যখন ওই repo-তে কোনো `git` process চলছে না, আর তাও স্পষ্ট সম্মতি পাওয়ার পরে।
7. **Panic:** একটা panic hook panic-টা diagnostic log-এ লেখে, আর panic কোনো job-এর ভেতরে হলে app চলতে থাকে। Panic হওয়া command একটা "internal error" `UserError` ফেরত দেয়, UI কখনো raw panic দেখে না।

## ১৪. Logging আর activity log

| ধারা | কী থাকে | কোথায় | কার জন্য |
|---|---|---|---|
| **Activity log** | প্রতিটা Git command-এর জন্য একটা record: সময়, repo, argument, working folder, exit code, কতক্ষণ লাগল, কোন job বা run-এর অংশ, আর stdout ও stderr (প্রতিটা 64 KB পর্যন্ত কাটা) | `state.db`, Activity log screen-এ repo, run আর ফল অনুযায়ী filter সহ দেখা যায় | User (BULK-08, PRD-র §৯ স্বচ্ছতা) |
| **Diagnostic log** | গোছানো `tracing` event: চালু হওয়ার সময়ের হিসাব, refresh-এর সময়, watcher-এর error, IPC error, panic | ঘুরিয়ে লেখা file (§১০), 5টা file × 10 MB (প্রস্তাবিত) | Owner আর bug report |

দুটোর জন্যই আড়াল করার নিয়ম: remote URL-এর user info (`https://user:token@…`) মুছে ফেলা হয়, `Authorization` header আর token কখনো log হয় না, আর file-এর content কখনো log হয় না। Diagnostic log প্রতিটা PERF লক্ষ্যের সময় লিখে রাখে (চালু হওয়া থেকে প্রথম paint, dashboard live, diff খোলা), যাতে performance job আর bug report একই সংখ্যা ব্যবহার করতে পারে।

## ১৫. Performance budget

| ID | লক্ষ্য | কীভাবে পূরণ হয় | কী দিয়ে যাচাই |
|---|---|---|---|
| PERF-01 | 1 s-এর কম সময়ে ব্যবহারযোগ্য window (cold-এ 2 s) | Native Rust start। প্রথম JS bundle ছোট; CodeMirror আর merge editor load হয় প্রথম ব্যবহারে। প্রথম paint-এর আগে কোনো `git` বা network নেই। প্রথম screen আঁকা হয় `state.db` থেকে। মোটামুটি budget: process আর webview প্রায় 400 ms, JS প্রায় 150 ms, cache পড়া আর render প্রায় 100 ms। | তিন OS-এ `tools/perf`-এর start-time job |
| PERF-02 | Cache করা state সাথে সাথে; 10টা repo live 1 s-এ, 30টা 2 s-এ | আগে cache (§৭ ধাপ ১)। 8-এর read pool। Repo-প্রতি মোটামুটি 3টা `git` process। M1-এ Windows-এ process চালুর খরচে লক্ষ্য না মিললে শুধু read-এর পথে `gix` (§১৮)। | 30টা fixture repo নিয়ে perf job |
| PERF-03 | 100 ms-এর মধ্যে সাড়া | Command সাথে সাথে ফেরত আসে (§৫)। প্রতি frame-এ event একসাথে পাঠানো। সব কাজ main thread-এর বাইরে। UI সাথে সাথে অপেক্ষার অবস্থা দেখায়। | Playwright timing test; M1-এর list spike |
| PERF-04 | Git operation-এর পরে 300 ms-এর মধ্যে repo-র row update | শেষ হওয়া job debounce বাদ দিয়ে সরাসরি ওই repo refresh করায় (§৭ ধাপ ৪)। | Integration test-এ সময় মাপা |
| PERF-05 | কখনো আটকায় না | সব Git, disk আর network-এর কাজ tokio আর blocking pool-এ। আলাদা read pool। Tauri main thread শুধু ভাগ করে দেয়। | 30টা repo-তে push চলার সময় browse করার test |
| PERF-06 | 10k লাইনের diff 300 ms-এ; merge editor 500 ms-এ | Blob আসে cat-file session থেকে (নতুন process নেই)। Rust-এ diff করতে কয়েক ms লাগে। Text যায় একবার, সাধারণ data হিসেবে। দেখা যাওয়া hunk-এর word diff আগে। বড় file যায় ভাগে ভাগে (§৫ নিয়ম ৪)। Budget-এর মধ্যে Tauri isolation pattern-এর খরচও ধরা, যেটা প্রতিটা IPC message যাচাই করে। M1 এটা production-এর security setting চালু রেখে মাপে (CSP, isolation, devtools বন্ধ)। | `criterion` benchmark + M1 spike |
| PERF-07 | 30টা repo নিয়ে RAM 250 MB-এর কম; বসে থাকা অবস্থায় CPU প্রায় শূন্য | 250 MB-এর হিসাবে ধরা হয় **GitHeddle process আর তার সব webview process** (WebView2 আর WebKit page চালায় সহায়ক process-এ), কিন্তু `git` child process নয়। ছোট Rust core। ঠাসা state model। View বন্ধ হলে file-এর text ছেড়ে দেওয়া। বসে থাকলে cat-file session বন্ধ। Polling নেই, শুধু watcher। Background fetch default-এ বন্ধ। | 30টা fixture repo নিয়ে RAM job, পুরো process tree যোগ করে; idle CPU-এর নমুনা |
| PERF-08 | 5,000টা বদলানো file মসৃণভাবে scroll হয় | TanStack Virtual। সমতল row একবার পাঠানো, তারপর delta। Line count পড়া হয় শুধু screen দেখা গেলে। | তিন webview-এ M1-এর list spike |
| PERF-09 | Installer 60 MB-এর কম | Tauri system-এর webview ব্যবহার করে, তাই কোনো browser bundle করা হয় না। WebView2 আসে evergreen bootstrapper থেকে। Dependency কম, `cargo-deny` দিয়ে যাচাই। **AppImage-এর ব্যতিক্রম:** AppImage-এর ভেতরে WebKitGTK আর তার library bundle করা থাকে। M1 প্রতিটা installer মাপে। Bundle করা library ছেঁটে ফেলার পরেও AppImage 60 MB-এর বেশি হলে ADR এটাকে শুধু AppImage-এর জন্য PERF-09-এর একটা জানা ব্যতিক্রম হিসেবে লিখে রাখে। `.exe`, `.dmg`, `.deb` আর `.rpm` তবুও 60 MB-এর কম হতে হবে। | CI-তে installer size job (50 MB-এ সতর্কবার্তা) |

CI এগুলো কীভাবে যাচাই করে (PRD-র §১৩): প্রতিটা pull request `main`-এর সাথে `criterion` benchmark মেলায়, আর 10 %-এর বেশি ধীর হলে fail করে। ওপরের পুরো budget (start, RAM, dashboard-এর সময়, আকার) প্রতি রাতে আর প্রতিটা release-এ চলে, আর `perf` label দিয়ে কোনো pull request-এও চালানো যায়। Job কীভাবে চলে আর তার সীমা কত, তা আছে [Test strategy](../engineering/test-strategy.bn.md) আর [Build আর release](../engineering/build-and-release.bn.md)-এ।

## ১৬. Extension point

| Extension | কীভাবে যোগ হয় | কী বদলায় না |
|---|---|---|
| GitLab, Azure DevOps (v0.3+) | নিজের module বা crate-এ `HostingProvider`-এর নতুন একটা implementation, যেটা প্রতিটা repo-র জন্য remote URL-এর host দেখে বেছে নেওয়া হয়, আর self-hosted server-এর জন্য setting-এ host mapping। Host নিজে যা-ই বলুক, UI সবসময় "pull request" বলে। | `pipeline`, UI screen, storage |
| নতুন ধরনের pipeline step (PIPE-15) | `pipeline`-এর step catalogue-এ একটা entry যোগ করা, তার preview, preflight, run আর মিলিয়ে দেখার নিয়ম সহ। State machine আর journal একই থাকে। | Run screen, journal, job runner |
| নতুন bulk operation (BULK-02) | Operation catalogue-এ একটা entry, যেটা এক step-এর run হয়ে যায়। | ওপরের মতোই |
| `gix` দিয়ে read (M1-এর বিকল্প) | `repo-state`-এর একই read function-এর পেছনে, তাই caller-দের কিছু বদলাতে হয় না। Write সবসময় CLI-তেই থাকে। | `repo-state`-এর ওপরের সবকিছু |
| UI-এর ভাষা (PRD-র §১৪ প্রশ্ন ৭) | Code অনুযায়ী সাজানো error আর message catalogue (§১৩)। | Core crate |
| Editor, terminal আর merge tool | `platform` যে launch setting বের করে। | বাকি সবকিছু |

## ১৭. আর্কিটেকচারের ঝুঁকি

| ঝুঁকি | প্রভাব | প্রতিকার |
|---|---|---|
| WebKitGTK বা WKWebView ধীর, বা WebView2-এর চেয়ে আলাদা আচরণ করে | Linux বা macOS-এ PERF-03, PERF-06 বা PERF-08 পূরণ হয় না | M1 spike প্রতিটা webview মাপে। সব virtualise করা, সাধারণ CSS, Playwright দিয়ে WebKit-এ test। Fallback Electron, যেখানে React UI থেকে যায়। |
| Windows-এ process চালু করার খরচ বেশি | 30টা repo-তে PERF-02 পূরণ হয় না | Refresh-প্রতি কম command, read pool, cat-file session। M1 gate বললে read-এর জন্য `gix`। |
| 2.30 আর সর্বশেষ version-এ Git-এর output আলাদা | কিছু machine-এ parse-এর bug | শুধু porcelain v2 আর `-z` format ব্যবহার। git 2.30 আর সর্বশেষ নিয়ে CI matrix। Fuzz করা parser। |
| অন্য ভাষায় Git-এর message, বা নতুন শব্দ | Error-এর শ্রেণীবিভাগ "git failed"-এ নেমে যায় | আগে exit code আর স্থির pattern দিয়ে শ্রেণীবিভাগ। Raw message সবসময় দেখানো হয়, তাই user তবুও কাজ করতে পারেন। ইংরেজি ছাড়া অন্য locale-এও test চলে। |
| বড় worktree-তে অনেক বেশি বা শোরগোলে watcher | Linux-এ refresh ফসকে যায়, বা CPU খরচ | Ignore দিয়ে ছাঁকা, শুধু Git folder watch করায় ফিরে যাওয়া, focus-এ refresh। কখনো polling নয় (§৭)। |
| Write চলার সময় crash | Repo-র অবস্থা অস্পষ্ট | আগে লেখা journal, মিলিয়ে দেখা, নিজে থেকে কখনো write আবার না চালানো (§৯)। |
| User একই সময়ে একই repo-তে কাজ করছেন (VS Code, terminal) | `index.lock` নিয়ে সংঘাত, পুরোনো preview | প্রতিটা step-এর ঠিক আগে preflight state আবার পড়ে (SAFE-07)। `index.lock` কখনো নিজে থেকে মোছা হয় না। App জানায় আর Retry-এর সুযোগ দেয়, আর মোছার প্রস্তাব দেয় শুধু §১৩ নিয়ম ৬-এ বলা উপায়ে। |
| Background read-এর সময় repo-র নিজের config program চালায় (`core.fsmonitor`, driver) | User-এর অজান্তে code চলে | যেকোনো background command-এর আগে trust check, যেটা command guard নিশ্চিত করে (§৬, §৭, GS-08)। |
| Credential prompt আটকে থাকে | Job আটকে থাকে | `GIT_TERMINAL_PROMPT=0`, stdin null, network watchdog। |
| বড় IPC payload | ধীর diff, webview-এ হঠাৎ memory বেড়ে যাওয়া | 1 MB-এর মতো ছাড়ালে page আর channel, text একবারই পাঠানো (§৫)। |
| AI-এর লেখা code স্তরের সীমানা পেরিয়ে যায় | Logic shell বা UI-তে ঢুকে পড়ে, test কঠিন হয় | §৪-এর CI নিয়ম, পাতলা shell-এর নিয়ম, আর এই ডকুমেন্টের সাথে মিলিয়ে review। |

## ১৮. সিদ্ধান্তের খাতা

পুরো stack-এর সিদ্ধান্ত, ভোটের রেকর্ড সহ, আছে [ADR 0001: tech stack](../decisions/0001-tech-stack.bn.md)-এ। এই ডকুমেন্ট যে আর্কিটেকচার সিদ্ধান্তগুলোর ওপর দাঁড়িয়ে:

| # | সিদ্ধান্ত | কারণ | অবস্থা |
|---|---|---|---|
| D-01 | Tauri 2: Rust core + React/TypeScript UI। Fallback: Electron | PERF-01/07/09-এর সাথে সবচেয়ে মানানসই। সর্বসম্মত ভোট। | নেওয়া হয়েছে; M1 gate-এ নিশ্চিত হবে |
| D-02 | v0.1-এ সব read আর write-এর জন্য `git` CLI | হুবহু terminal-এর মতো আচরণ (SAFE-05)। একটাই code-এর পথ। | নেওয়া হয়েছে; M1 gate-এ Windows-এ PERF-02 পূরণ না হলে শুধু read-এর জন্য `gix` |
| D-03 | octocrab-এর বদলে পাতলা `reqwest` + `graphql_client` client | Dependency tree ছোট, আর আমাদের লাগে মাত্র কয়েকটা call | নেওয়া হয়েছে |
| D-04 | Cache, journal আর activity log-এর জন্য SQLite; setting আর workspace-এর জন্য atomic JSON | যেখানে দরকার সেখানে crash-safe transaction। যেখানে দরকার সেখানে মানুষ পড়তে আর diff করতে পারে এমন file। | নেওয়া হয়েছে |
| D-05 | CodeMirror 6; diff view-এ `@codemirror/merge` শুধু তখনই, যদি সেটা Rust-এ হিসাব করা chunk নিতে পারে, নইলে ভাগাভাগি করা aligned-panes layer। Monaco বাদ | হালকা (PERF-07), তিনটা view নিখুঁতভাবে নিয়ন্ত্রণ করা যায়, আর JavaScript-এ কখনো দ্বিতীয় diff engine থাকে না | নেওয়া হয়েছে; `@codemirror/merge`-এর অংশটা M1-02-এ যাচাই হবে |
| D-06 | Merge editor-এর conflict আসে worktree-এ Git-এর marker থেকে; pane-এর text আসে index stage 1/2/3 থেকে, operation অনুযায়ী সাজিয়ে (§৮); Result পাঠানো হয় conflict-এর range খালি রেখে; `git merge-file` শুধু test oracle | Result সবসময় Git-এর সিদ্ধান্তের সাথে মেলে (PRD-র §১০) | নেওয়া হয়েছে (review-এর রায়) |
| D-07 | একটা bulk action এক step-এর journal করা run হিসেবে চলে | একটাই engine, সবকিছুর জন্য একই crash recovery (PRD-র §৯ নির্ভরযোগ্যতা) | নেওয়া হয়েছে (review-এর রায়); ছোট engine-টা আসে M5-01-এ |
| D-08 | BULK-04-এর parallel limit থেকে আলাদা একটা read pool | লম্বা bulk action-এর সময়ও dashboard live থাকে (PERF-05) | নেওয়া হয়েছে (review-এর রায়); আসে M2-03-এ |
| D-09 | প্রতি user-এর জন্য app-এর একটাই instance (`tauri-plugin-single-instance`) | `state.db`, journal আর updater ধরে নেয় যে মালিক একজনই | নেওয়া হয়েছে (review-এর রায়) |
| D-10 | `git-runner`-এ একটা কেন্দ্রীয় command guard, সাথে এমন repo trust check, যেটা trusted নয় এমন repo-তে প্রতিটা `git` command আটকায় | কোনো caller-এ bug থাকলেও safety-র নিয়ম টিকে থাকে (GS-07, GS-08) | নেওয়া হয়েছে (review-এর রায়) |
| D-11 | `UserError` হলো code + parameter; সব লেখা থাকে UI-এর catalogue-এ | লেখার একটাই জায়গা; বাংলা UI-এর জন্য তৈরি | নেওয়া হয়েছে (review-এর রায়) |

## ১৯. পরিবর্তনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ৩ নভেম্বর ২০২৬ | প্রথম খসড়া, Phase 2-এর decision brief থেকে। Review-এর রায় বসানো হয়েছে: একটাই instance আর shell-এর দায়িত্ব (§৩), command guard আর launcher-এর নিয়ম (§৪, §৬), repo trust check (§৭), stage থেকে pane-এর মিল আর খালি conflict range (§৮), নাম আর webview-এর data folder (§১০), volume অনুযায়ী case sensitivity আর কড়া link allow-list (§১২), code + parameter error আর `index.lock`-এর নিয়ম (§১৩), AppImage-এর ব্যতিক্রম আর CI-তে যাচাই (§১৫), D-09 থেকে D-11 (§১৮)। |
