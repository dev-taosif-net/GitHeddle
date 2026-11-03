# GitHeddle — Test কৌশল

**English version:** [test-strategy.en.md](test-strategy.en.md)

| | |
|---|---|
| **ডকুমেন্ট** | Test কৌশল |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। Planning panel (Agent 5) লিখেছে। M1 শেষে নিশ্চিত করতে হবে |

**সম্পর্কিত ডকুমেন্ট:** [PRD](../product/PRD.bn.md) · [Tech stack সিদ্ধান্ত](../decisions/0001-tech-stack.bn.md) · [Architecture](../architecture/architecture.bn.md) · [Security আর threat model](security.bn.md) · [Build আর release](build-and-release.bn.md) · [UI architecture](../design/ui-architecture.bn.md) · [AI development workflow](../process/ai-development-workflow.bn.md) · [Roadmap](../plan/roadmap.bn.md)

> এই file আর এর ইংরেজি সংস্করণ [test-strategy.en.md](test-strategy.en.md)-এ একই content আছে। একটা বদলালে অন্যটাও একই commit-এ update করতে হবে।

---

## ১. উদ্দেশ্য আর মূলনীতি

GitHeddle মানুষের আসল repo-তে কাজ করে, তাই একটা bug মানে কারো কাজ হারিয়ে যাওয়া। এই ডকুমেন্ট বলে, আমরা কীভাবে তিনটা system-এই automatically প্রমাণ করব যে GitHeddle PRD-তে যা বলা আছে তাই করে, আর কখনো কারো কাজ হারায় না (PRD §৭ H, §৯)।

মূলনীতি:

1. **Mock নয়, আসল Git।** Git ছোঁয় এমন সবকিছু fixture builder দিয়ে বানানো আসল repo-র ওপর, আসল `git` binary দিয়ে test হবে। Core test-এ Git কখনো mock করা হবে না।
2. **প্রথম দিন থেকেই তিনটা system।** প্রতিটা pull request-এ Windows, macOS আর Linux তিনটাতেই test চলবে (PLAT-03, PLAT-04, PRD §১৩)।
3. **Safety rule মানে invariant।** প্রতিটা SAFE rule একটা নাম দেওয়া invariant হবে (§৫), যেটা একটা উদাহরণ test দিয়ে নয়, অনেকগুলো পরিস্থিতিতে check হবে।
4. **Logic থাকবে core-এ, test-ও সেখানে।** Webview একেক system-এ একেক রকম, আর automate করা সবচেয়ে কঠিন। তাই UI পাতলা রাখা হবে, যাতে বেশিরভাগ আচরণ window ছাড়াই Rust-এ test করা যায়।
5. **Test-কে দুর্বল করা আটকানো।** বেশিরভাগ code AI agent লিখবে। তাই §৮-এর নিয়মগুলো আটকায় যাতে কোনো session লাল test-কে ঢিলা করে "ঠিক" না করে ফেলে।
6. **ফলাফল owner পড়তে পারবেন।** প্রতিটা CI run শেষে একটা সহজ সারাংশ থাকবে (§১৫)। App নিরাপদ কি না জানতে owner-কে test code পড়তে হবে না।

## ২. Test-এর স্তর

| স্তর | নাম | Tool | এখানে কী থাকবে | কোথায় চলে |
|---|---|---|---|---|
| L1 | Unit | `cargo-nextest`, `insta`, `proptest` | IO ছাড়া pure function: porcelain আর ref parser, pipeline state machine-এর transition, diff engine, merge editor-এর alignment, conflict marker scan, branch name pattern, pull request template, command guard (§৫) | ৩টা OS, প্রতিটা pull request |
| L2 | আসল Git-এর সাথে crate integration | Fixture builder সহ `cargo-nextest` | Temporary folder-এ fixture repo-র ওপর `git-runner`, `repo-state`, `pipeline`, `workspace`, `storage`; safety invariant (§৫); chaos test (§৬) | প্রতিটা pull request: সর্বশেষ Git সহ ৩টা OS, আর Git 2.30 সহ Linux। Nightly: ৩টা OS × ২টা Git version |
| L3 | Core contract | Tauri-র mock runtime দিয়ে Rust test | প্রতিটা Tauri command আর event: input check, error-এর আকার, capability-র নিয়ম। প্রতিটা fixture পরিস্থিতির জন্য **IPC transcript** (আসল request আর response) রেকর্ড করে, যেগুলো L5 আবার চালায় | Linux, প্রতিটা pull request |
| L4 | UI component | Vitest + Testing Library | React component আর Zustand store: render, keyboard handling, event থেকে state বদল, খালি screen (UX-06) | Linux, প্রতিটা pull request |
| L5 | আসল browser-এ UI, mock IPC | Vite build-এর ওপর Playwright, Chromium **আর** WebKit | রেকর্ড করা IPC transcript দিয়ে পুরো screen চালানো: flow, শুধু keyboard দিয়ে ব্যবহার, `@axe-core/playwright`, screenshot তুলনা, input latency (PERF-03) | Linux আর macOS, প্রতিটা pull request |
| L6 | End to end | `tauri-driver` (WebDriver) | আসল packaged app, আসল core আর আসল fixture repo: PRD §৬-এর P0 flow | Windows আর Linux, nightly আর release |
| L7 | হাতে করা smoke | লিখিত checklist | macOS app (WKWebView-এর জন্য WebDriver নেই), signing আর installer-এর আচরণ, screen reader, আসল machine-এ Git Credential Manager আর SSH agent | প্রতি release-এ macOS; release candidate-এ ৩টা OS-ই |
| P | Performance | `criterion`, `tools/perf` | PERF budget (§৯) | ৩টা OS; nightly gate, release gate |

কোন স্তরে test লিখব, তার নিয়ম:

- কোনো আচরণ window ছাড়া check করা গেলে সেটা L1–L3-এ test হবে, L5 বা L6-এ নয়।
- L4 আর L5 যে fake-core scenario ব্যবহার করে, default-এ সেগুলো বানানো হয় L3-এর আসল fixture run থেকে রেকর্ড করা IPC transcript দিয়ে। ব্যতিক্রম শুধু **scripted scenario**: timing আর event-burst script, বিরল error, আর ৫,০০০ file-এর মতো scale-এর পরিস্থিতি। এগুলোও বাকিগুলোর মতো typed, আর নামে "scripted" চিহ্ন থাকে। TypeScript type আসে `tauri-specta` থেকে, তাই core বদলালে হয় type error হবে নয়তো transcript diff দেখা যাবে। Mock চুপচাপ আসল code থেকে সরে যেতে পারবে না।
- L6 প্রতিটা P0 flow শুরু থেকে শেষ পর্যন্ত একবার cover করে। L2 যেসব edge case cover করে, সেগুলো আবার করে না।
- L1–L6-এ GitHub call কখনো আসল github.com-এ যাবে না। যাবে রেকর্ড করা response ভরা একটা local mock server-এ (`wiremock` crate)। GraphQL query-গুলো compile-এর সময়েই `graphql_client` GitHub-এর প্রকাশিত schema-র সাথে মিলিয়ে দেখে। আলাদা একটা nightly **live contract job** github.com-এর একটা নির্দিষ্ট sandbox repo-তে PR flow চালায়। এটা চলে শুধু `main`-এ schedule করে, protected `github-live` environment-এ, এমন একটা fine-grained token দিয়ে যেটা শুধু ওই একটা sandbox repo-তেই সীমিত। Nightly job-গুলোর মধ্যে শুধু এটাই secret পায়, আর কোনো pull request-এ এটা কখনো চলে না।

## ৩. Fixture repo-র তালিকা

Fixture-গুলো test চলার সময় `tests/fixtures`-এর **fixture builder (Rust)** দিয়ে বানানো হয়। Binary repo কখনো commit করা হয় না। Builder-গুলো shell script নয়, Rust test helper, যাতে Windows-এও একই রকম কাজ করে। প্রতিটা builder:

- author আর committer-এর নাম আর তারিখ নির্দিষ্ট করে দেয়, যাতে প্রতিটা run-এ আর প্রতিটা OS-এ commit hash একই থাকে;
- `HOME`, `XDG_CONFIG_HOME` আর `GIT_CONFIG_GLOBAL` একটা temporary folder-এ দেখায় আর `GIT_CONFIG_NOSYSTEM` set করে, যাতে CI machine-এর Git config ঢুকে পড়তে না পারে। যেসব fixture user-এর নিজের config test করে (SAFE-05), সেগুলো ইচ্ছা করে নিজেদের global config লেখে;
- একটা local bare repo-কে `origin` হিসেবে ব্যবহার করে, যাতে fetch, pull আর push-এ network না লাগে;
- কোন অবস্থা আশা করা হচ্ছে তার একটা বিবরণ ফেরত দেয়। GitHeddle যা পড়ে, test সেটার সাথে এটা মিলিয়ে দেখে।

| ID | পরিস্থিতি | কাজে লাগে |
|---|---|---|
| FX-01 | Upstream সহ task branch-এ পরিষ্কার repo | প্রতিটা operation-এর ভিত্তি |
| FX-02 | Dirty working tree: modified, staged, আংশিক staged, untracked, deleted, renamed, mode change | DASH-02, CHG-01/02, SAFE-03/04 |
| FX-03 | Upstream-এর চেয়ে ahead | Push, DASH-02 |
| FX-04 | Upstream-এর চেয়ে behind | শুধু fast-forward pull (BULK-01) |
| FX-05 | Upstream থেকে diverged | Pull প্রত্যাখ্যান, preview-এর সতর্কতা (BULK-03) |
| FX-06 | কোনো upstream set করা নেই | Set-upstream সহ push, TASK-02 |
| FX-07 | Merge চলছে, দুই দিকেই একই line বদলানো | CONF-01..11 |
| FX-08 | Merge conflict add/add (stage 1 নেই) | Base ছাড়া merge editor |
| FX-09 | Merge conflict modify/delete আর delete/modify (একটা stage নেই) | Merge editor, take current বা take incoming |
| FX-10 | Binary file-এ conflict | শুধু take current, take incoming বা external tool |
| FX-11 | Rebase চলছে, একটা conflict-এ থেমে আছে; যে branch-এর ওপর rebase হচ্ছে আর যে commit আবার বসানো হচ্ছে, দুটোর নাম আলাদা | SAFE-06, CONF-10 Continue আর Abort; rebase-এ stage থেকে pane-এর mapping (Current = stage 2, যে branch-এর ওপর rebase হচ্ছে; Incoming = stage 3, আবার বসানো commit) আর pane-এর title (CONF-03) |
| FX-12 | Cherry-pick চলছে, একটা conflict-এ থেমে আছে | SAFE-06, CONF-01; cherry-pick-এর mapping (Current = stage 2, HEAD; Incoming = stage 3, বেছে নেওয়া commit) আর pane-এর title (CONF-03) |
| FX-13 | Staged file-এ conflict marker রয়ে গেছে | CONF-11 |
| FX-14 | Line ending: `core.autocrlf` true, input আর false; `eol` সহ `.gitattributes`; CRLF আর LF মেশানো file | PLAT-03, diff আর merge editor-এ save |
| FX-15 | Case clash: শুধু বড়-ছোট হাতের অক্ষরে আলাদা দুটো path; শুধু case বদলানো rename | Case-insensitive system-এ PLAT-03 |
| FX-16 | Unicode, space, শুরুতে dash আর খুব লম্বা path (Windows-এ ২৬০ অক্ষরের বেশি) | Argument quoting, `--` আর `--end-of-options` |
| FX-17 | Hook: প্রত্যাখ্যান করা `pre-commit`, message বদলানো `commit-msg`, ধীর `pre-push`; প্রতিটা hook একটা marker file লেখে | SAFE-05 |
| FX-18 | Protected branch: local commit সহ `dev`-এ; `main`-এ | SAFE-02, DASH-07 |
| FX-19 | Detached HEAD | DASH-02, DASH-07, প্রত্যাখ্যানের নিয়ম |
| FX-20 | Stash আছে, আগে থেকে থাকা একটা `githeddle/<task>` stash সহ | SAFE-04 stash আর pop |
| FX-21 | Submodule, linked worktree, shallow clone, commit ছাড়া খালি repo | DASH-01 আর DASH-02 যেন না ভাঙে |
| FX-22 | পুরনো `index.lock` (অন্য কোনো Git process-এর, বা মেরে ফেলা process-এর) | Error message (UX-04), chaos-এর পরে recovery |
| FX-23 | এমন একটা credential helper যেটা প্রতিটা call রেকর্ড করে | SAFE-05: user-এর helper-ই ব্যবহার হয়, কখনো এড়িয়ে যাওয়া হয় না |
| FX-24 | Diff সহ ১০,০০০ line-এর file, আর একটা বড় conflicted file | PERF-06 |
| FX-25 | কয়েকটা repo জুড়ে ৫,০০০ বদলানো file | PERF-08 |
| FX-26 | বিভিন্ন গভীরতায় nested repo সহ folder, আর একটা `.code-workspace` file | DASH-01 |
| FX-27 | Team file `.githeddle.json`: ঠিক, ভুল, অতিরিক্ত বড়, আর ক্ষতিকর (security ডকুমেন্ট দেখুন) | CFG-03, security test |
| FX-28 | ক্ষতিকর repo config: command দেওয়া `core.fsmonitor`, `core.sshCommand`, একটা filter, diff আর merge driver, আর একটা `include.path` / `includeIf` target; প্রতিটা command একটা marker file লেখে। শুধু `core.fsmonitor=true` থাকা একটা যমজ repo-কে চিহ্নিত করা চলবে না | Repo-র trust (security GS-08), INV-12 |
| WS-30 | Reference workspace: বাস্তব আকারের ৩০টা repo (ছোট-বড় মেশানো, লম্বা history সহ), FX-01..20 থেকে নেওয়া মিশ্র অবস্থায় | PERF-01/02/04/07, PRD §৯ Performance |
| WS-50 | Scale workspace: ৫০টা repo | PRD §৯ Scale |

FX-07, FX-11 আর FX-12-এর জন্য একটা merge editor test দেখে যে প্রতিটা operation-এ Current আর Incoming pane-এ ঠিক stage আছে, আর আসল branch বা commit-এর নাম দেখানো হচ্ছে (merge: Current = stage 2, HEAD; Incoming = stage 3, `MERGE_HEAD`)।

আসল ব্যবহারে পাওয়া প্রতিটা নতুন bug-এর জন্য একটা নতুন fixture বা কোনো fixture-এর নতুন রূপ বানানো হবে, সাথে এমন একটা test যেটা fix-এর আগে fail করে।

## ৪. CI matrix

| Job | Windows x64 | macOS (Apple Silicon) | Linux (Ubuntu 22.04) | Git version | কখন |
|---|---|---|---|---|---|
| Lint, docs-pair, terminology, skip/`.only` lint, test-পরিবর্তনের report, coverage ratchet | — | — | হ্যাঁ | — | প্রতিটা pull request |
| L1 আর L2 (invariant সহ) | হ্যাঁ | হ্যাঁ | হ্যাঁ | সর্বশেষ | প্রতিটা pull request |
| সবচেয়ে পুরনো Git-এ L1 আর L2 | — | — | হ্যাঁ | 2.30 | প্রতিটা pull request |
| L1 আর L2, পুরো matrix | হ্যাঁ | হ্যাঁ | হ্যাঁ | 2.30 আর সর্বশেষ | Nightly |
| L3 আর L4 | — | — | হ্যাঁ | — | প্রতিটা pull request |
| L5 Chromium + WebKit, Playwright report আর screenshot upload সহ | — | হ্যাঁ | হ্যাঁ | — | প্রতিটা pull request; nightly-তে আবার macOS WebKit |
| `main`-এর সাথে `criterion` তুলনা (১০ %-এ fail) | — | — | হ্যাঁ | — | প্রতিটা pull request |
| `bundle` (installer) আর `perf` (start, RAM, আকার) | হ্যাঁ | হ্যাঁ | হ্যাঁ | সর্বশেষ | চাইলে, pull request-এর label দিয়ে |
| পুরো performance budget (§৯) | হ্যাঁ | হ্যাঁ | হ্যাঁ | সর্বশেষ | Nightly, release |
| L6 `tauri-driver` | হ্যাঁ | — | হ্যাঁ | সর্বশেষ | Nightly, release |
| Chaos suite (§৬) | হ্যাঁ | হ্যাঁ | হ্যাঁ | সর্বশেষ | Nightly, release |
| Fuzzing (§৭) | — | — | হ্যাঁ | — | Nightly, প্রতি target-এ ৩০ মিনিট |
| Scale WS-50 | হ্যাঁ | হ্যাঁ | হ্যাঁ | সর্বশেষ | Nightly |
| বাড়তি platform: Windows ARM64, macOS Intel (GitHub যতদিন runner দেয়), Fedora container | L1 + L2 smoke | | | সর্বশেষ | সাপ্তাহিক আর release |
| `cargo-mutants` দিয়ে mutation testing (§৮) | — | — | হ্যাঁ | — | সাপ্তাহিক |
| Live GitHub contract (§২) | — | — | হ্যাঁ | সর্বশেষ | Nightly, শুধু `main`-এ schedule করে, `github-live` environment-এ |

টীকা:

- Git 2.30 হলো PRD-র সমর্থিত সবচেয়ে পুরনো version (PRD §৯ Compatibility)। Windows-এ এটা আসে MinGit 2.30.x portable release থেকে। macOS আর Linux-এ source থেকে একবার build করে cache রাখা হয়। সর্বশেষ version মানে runner image-এ যেটা আছে, আর সেই version job-এর সারাংশে দেখানো হয়।
- WS-30 আর WS-50 fixture workspace cache করা যায়, fixture builder code-এর hash দিয়ে। বাকি সব fixture প্রতিটা run-এ নতুন করে বানানো হয়।
- সব build আর test GitHub Actions-এ চলে। Owner-এর machine-এ ভারী কিছু চালাতে হয় না।

## ৫. Safety invariant

প্রতিটা SAFE rule দুই জায়গায় জোর করে মানানো হয়: `crates/git-runner`-এর ভেতরের একটা কেন্দ্রীয় **command guard**-এ, যেটা কোনো process spawn হওয়ার আগে প্রতিটা argument list check করে, আর test-এ। UI-ও সতর্ক করতে পারে, কিন্তু আসল বাধা guard-টাই। তাই UI-র bug বা AI-র লেখা code এটা পাশ কাটাতে পারে না।

Invariant-গুলো L2 test হিসেবে **operation × fixture**-এর একটা matrix জুড়ে চলে: প্রতিটা BULK-01 operation, প্রতিটা PIPE-02 ধাপ আর প্রতিটা TASK flow, যে যে fixture-এ সেটা অর্থবহ সেগুলোর প্রতিটার ওপর।

| ID | Invariant | কীভাবে test হয় | PRD |
|---|---|---|---|
| INV-01 | Uncommitted কোনো change কখনো হারায় না | প্রতিটা operation-এর আগে একটা **work snapshot** নেওয়া হয়: প্রতিটা tracked আর untracked (ignored নয়) file-এর content hash, index tree আর stash list। পরে প্রতিটা byte ফেরত পাওয়ার মতো থাকতে হবে: working tree-তে, index-এ, `githeddle/<task>` stash-এ, অথবা user যে তালিকা discard করার জন্য confirm করেছেন তাতে | SAFE-03, SAFE-04, §৯ Safety |
| INV-02 | সরাসরি force push কখনো হয় না | Push-এ guard `--force`, `-f` আর `+` refspec প্রত্যাখ্যান করে। একমাত্র অনুমোদিত রূপ হলো নির্দিষ্ট ref আর প্রত্যাশিত মান সহ `--force-with-lease`, তাও শুধু সেই action-এর confirmation token থাকলে। Property test সব রকম combination-এ push request তৈরি করে। প্রতিটা test run-এর পরে একটা **activity log audit** log-এর প্রতিটা command-এ নিষিদ্ধ রূপ খোঁজে | SAFE-01 |
| INV-03 | Confirmation ছাড়া protected branch-এ commit, merge বা push হয় না | Guard এমন একটা confirmation token চায় যেটা ওই repo, ওই branch আর ওই run-এর সাথে বাঁধা। Pipeline সহ (প্রতি run-এ একবার confirmation) সব পথ test চেষ্টা করে দেখে | SAFE-02, PIPE-05 |
| INV-04 | Destructive action ঠিক ততটুকুই মোছে যতটুকু preview-তে দেখানো হয়েছিল | Preview-এর তালিকা আর আগের-পরের work snapshot-এর পার্থক্য মিলিয়ে দেখা হয় | SAFE-03 |
| INV-05 | Hook আর credential helper কখনো এড়িয়ে যাওয়া বা বদলানো হয় না | Guard `--no-verify`, commit-এ `-n` ছোট রূপ, আর `core.hooksPath` বা `credential.helper` বদলানো যেকোনো `-c` প্রত্যাখ্যান করে। FX-17 আর FX-23-এর marker file প্রমাণ করে যে hook আর helper চলেছে | SAFE-05 |
| INV-06 | Merge, rebase বা cherry-pick-এর মাঝপথে থাকা repo-তে নতুন operation শুরু হয় না, যদি না সেটা ওই অবস্থার জন্যই হয় | FX-07, FX-11 আর FX-12-এর ওপর বাকি প্রতিটা operation: কোনো Git write-এর আগেই operation প্রত্যাখ্যাত হয় | SAFE-06 |
| INV-07 | চালানোর ঠিক আগে অবস্থা আবার check হয় | Test harness preview আর run-এর মাঝখানে repo বদলে দেয় (নতুন commit, branch switch, file edit)। Operation-কে নতুন করে plan করতে হবে বা প্রত্যাখ্যান করতে হবে, আর কারণ জানাতে হবে | SAFE-07 |
| INV-08 | User অন্য কিছু না বাছলে pull শুধু fast-forward; fetch কখনো local branch বা working tree বদলায় না | আগে-পরে ref আর work snapshot মিলিয়ে দেখা | BULK-01 |
| INV-09 | Spawn হওয়া প্রতিটা process activity log-এ আসে | `git-runner` নিজের spawn গোনে, আর test সেই সংখ্যা log entry (repo, command, exit code, সময়) এর সাথে মেলায় | BULK-08, §৯ Transparency |
| INV-10 | কোনো repo অজানা অবস্থায় পড়ে থাকে না | যেকোনো failure বা cancel-এর পরে GitHeddle যে অবস্থা জানায়, সেটা Git থেকে নতুন করে পড়া অবস্থার সমান হতে হবে | §৯ Reliability, BULK-05, UX-10 |
| INV-11 | Token কখনো বাইরে যায় না | একটা canary token দিয়ে sign in করে P0 flow-গুলো চালানো হয়। তারপর activity log, SQLite file, JSON file, প্রতিটা IPC payload আর Git-কে দেওয়া environment-এ খোঁজা হয়। Canary কোথাও থাকা চলবে না | PR-01, §৯ Security |
| INV-12 | বিশ্বাস করার আগে কোনো repo-তে config পড়া ছাড়া আর কিছু চলে না | একটা workspace-এ FX-28 যোগ করা হয়। User বিশ্বাস না করা পর্যন্ত GitHeddle ওই repo-তে শুধু তার local config পড়ে: background `status` নয়, fetch নয়, diff নয়। FX-28-এর কোনো marker file তৈরি হয় না। বিশ্বাস করার পরে repo স্বাভাবিকভাবে পড়া হয়। পরে repo-র config বদলালে সেটা আবার "Needs review" হয়ে যায়। `core.fsmonitor=true` থাকা যমজ repo চিহ্নিত হয় না | Security GS-07, GS-08 |

কোনো invariant test বদলানো বা সরানোর আগে owner-কে pull request-এ একটা আলাদা checkbox-এ টিক দিয়ে অনুমোদন দিতে হবে (§৮)।

## ৬. Crash আর chaos test

এগুলো PRD §৯ Reliability-র প্রতিশ্রুতি আর PIPE-07 ("app বন্ধ হলেও থেমে থাকা run রয়ে যায়") প্রমাণ করে। Harness fixture repo-তে একটা pipeline বা bulk action চালায়, আর বেছে নেওয়া একটা **crash point**-এ process মেরে ফেলে: macOS আর Linux-এ `kill -9`, Windows-এ `TerminateProcess`।

| ID | Crash point |
|---|---|
| CH-01 | Journal কোনো ধাপের intent লেখার পরে, Git spawn হওয়ার আগে |
| CH-02 | Git চলার সময়: শুধু app মারা; তারপর app আর Git একসাথে মারা |
| CH-03 | Git শেষ হওয়ার পরে, journal ফলাফল লেখার আগে |
| CH-04 | SQLite write-এর মাঝখানে |
| CH-05 | Atomic JSON write-এর মাঝখানে (settings, pipeline) |
| CH-06 | Merge editor-এর Result save হওয়ার সময় |
| CH-07 | Push বা fetch-এর মাঝপথে network বন্ধ (এমন remote যেটা আটকে যায় বা সংযোগ কেটে দেয়) |
| CH-08 | Pull request তৈরির মাঝপথে GitHub error, timeout বা rate limit ফেরত দেয় (PR-02/03) |

M5 থেকে bulk action pipeline-এর মতো একই engine-এ এক ধাপের journal করা run হিসেবে চলে। তাই CH-01..03 M5 থেকে bulk action-এর ওপর চলে, আর M8 থেকে বহু ধাপের pipeline-এর ওপর।

প্রতিবার আবার চালু হওয়ার পরে test দেখে:

1. Journal আর settings নষ্ট না হয়ে খোলে (দরকার হলে শেষ ভালো copy-তে ফিরে যায়)।
2. Recovery screen ঠিক প্রভাবিত repo-গুলো আর তাদের আসল অবস্থা দেখায় (PRD §৯ Reliability)।
3. **Resume** সঠিক ধাপ থেকে চালায়, আর ফলাফল বদলে যাবে এমন কোনো ধাপ দুবার চালায় না। যেমন, দ্বিতীয় একটা merge commit বানানো চলবে না। প্রতিটা ধাপ নিজের প্রত্যাশিত ফলাফল রেকর্ড করে রাখে, আর আবার চালানোর আগে সেটা হয়ে গেছে কি না দেখে।
4. কোনো ঝুলে থাকা `git` process থেকে যায় না। Windows-এ Job Object আর Unix-এ process group check করা হয়।
5. মেরে ফেলা Git-এর রেখে যাওয়া পুরনো `index.lock` ধরা পড়ে আর ব্যাখ্যা করা হয়, কিন্তু কখনো নিজে থেকে মোছা হয় না। ওই repo-তে কোনো Git process না চললে তবেই app সেটা মোছার প্রস্তাব দেয়, ঝুঁকিটা বুঝিয়ে বলার পরে, আর শুধু user-এর স্পষ্ট confirmation পেলে।
6. CH-08-এর পরে আবার চালালে শুধু বাকি থাকা pull request-গুলো তৈরি হয়, আর "Related pull requests" অংশগুলো ঠিক হয়ে যায় (PR-03)।

এই নির্দিষ্ট crash point-গুলোর পাশাপাশি একটা **stateful property test** (proptest) pipeline state machine-কে একটা সরল reference model-এর পাশাপাশি চালায়, এলোমেলো ধাপ, failure, pause আর crash point দিয়ে। দুটো সবসময় একমত কি না, সেটা দেখে।

## ৭. Property test আর fuzzing

| Target | Property test (`proptest`, L1) | Fuzzing (`cargo-fuzz`, nightly) |
|---|---|---|
| `status --porcelain=v2 --branch -z` parser | বানানো record লিখে আবার parse করলে একই model আসে। প্রতিটা record type সামলানো হয় | যেকোনো byte: panic নেই, অশেষ loop নেই |
| `for-each-ref`, `rev-list --left-right --count`, `ls-files -u -z` parser | Round trip | যেকোনো byte |
| `cat-file --batch` stream reader | যেকোনো size, না থাকা object আর খালি blob-এ ঠিক framing | যেকোনো byte |
| Conflict marker scan (CONF-11) | Merge আর diff3 style-এ আর CRLF সহ marker খুঁজে পায়; line-এর শুরুতে নেই এমন marker-এর মতো দেখতে লেখাকে কখনো marker ধরে না | যেকোনো লেখা |
| Merge editor তৈরি | **Git-এর সাথে differential test:** সব current বা সব incoming নিলে একই option-এ `git merge-file`-এর ফলাফলের সাথে মেলে; conflict নেই এমন change সবসময় Result-এ থাকে (CONF-05, CONF-08) | — |
| Diff engine | পুরনো লেখায় diff apply করলে নতুন লেখা আসে; word-level range নিজের line-এর ভেতরে থাকে | যেকোনো জোড়া লেখা |
| Branch name pattern (TASK-01) | **Differential test:** এটা যে নামই বানায়, সেটা `git check-ref-format` পাস করে | — |
| `shell-words` দিয়ে BULK-07-এর argument ভাগ করা | Quoting round trip; কোনো shell কখনো জড়িত নয় | যেকোনো string |
| Team file parser (CFG-03) | অজানা key আর অতিরিক্ত বড় মান প্রত্যাখ্যাত হয় | যেকোনো byte |
| GitHub response parsing আর device flow | Field না থাকলে বা বাড়তি থাকলে পরিষ্কার error, কখনো panic নয় | যেকোনো JSON |

Fuzzing-এ পাওয়া প্রতিটা crash একটা L1 regression test হয়ে যায়, আর তার input জমা রাখা corpus-এ যোগ হয়।

## ৮. Snapshot নীতি আর test-কে সৎ রাখা

Snapshot (`insta`) ব্যবহার হয় parser model, preview plan, error message (UX-04) আর IPC transcript-এর জন্য। দুই theme-এ screen-এর জন্য ব্যবহার হয় Playwright screenshot।

Snapshot-এর নিয়ম:

1. CI-তে snapshot update বন্ধ থাকে। নতুন বা বদলানো snapshot থাকলে run fail করে; কখনো নিজে থেকে গ্রহণ করা হয় না।
2. Snapshot-এর বদল আলাদা commit-এ যায়। Pull request-এর বিবরণে প্রতিটা বদলানো snapshot এক লাইনের কারণ সহ লেখা থাকে।
3. Screenshot baseline শুধু CI-তে, প্রতিটা OS আর engine-এর জন্য আলাদা করে, হাতে চালু করা একটা workflow দিয়ে বানানো হয়। Merge-এর আগে owner image diff দেখে নেন।

AI session যাতে test দুর্বল করতে না পারে, তার নিয়ম (এগুলো code-এর `CLAUDE.md`-তেও আছে, দেখুন [AI development workflow](../process/ai-development-workflow.bn.md)):

1. CI পাস করানোর জন্য কোনো test মোছা, skip করা, ignored চিহ্ন দেওয়া, timeout বাড়ানো বা assertion ঢিলা করা যাবে না। ব্যতিক্রম শুধু তখন, যখন pull request-এর "Tests changed" নামের অংশে সেটা লেখা থাকে আর owner রাজি হন।
2. `#[ignore]`, `.skip`, `.only` আর `test.fixme` থাকলে একটা CI lint fail করে, যদি না একই line-এ কোনো issue number উল্লেখ থাকে।
3. Invariant test (§৫) আর chaos test (§৬) নিজেদের folder-এ থাকে, যেগুলো `CODEOWNERS`-এ owner-এর নামে তালিকাভুক্ত। `CODEOWNERS` ব্যবহার হয় review request আর label-এর জন্য, বাধ্যতামূলক approval হিসেবে নয়, কারণ GitHub একা maintainer-এর নিজের approval গোনে না; branch protection চায় সবুজ CI। এই folder-গুলোতে কোনো বদল হলে `tests-changed` label লাগে, আর owner প্রতিটা test-এর বদল দেখেছেন বলে একটা আলাদা checkbox-এ টিক দেওয়ার পরেই pull request merge করা যায়।
4. প্রতিটা safety feature-এর জন্য test আগে লেখা হয়, PRD requirement থেকে, implementation-এর আগে আলাদা commit বা session-এ। এতে implementation নিজের test-কে নিজের মতো করে গড়তে পারে না।
5. **Coverage-এর নিম্নসীমা**, `cargo-llvm-cov` আর Vitest দিয়ে মাপা: core crate-গুলোতে অন্তত ৮০ % line, `git-runner`, `pipeline` আর `diff-engine`-এর marker scan-এ অন্তত ৯০ %, আর UI-তে অন্তত ৭০ %। নিম্নসীমা শুধু ওপরে ওঠে: কোনো pull request coverage ০.৫ পয়েন্টের বেশি কমাতে পারে না।
6. **Mutation testing** `cargo-mutants` দিয়ে প্রতি সপ্তাহে command guard, pipeline state machine আর marker scan-এ চলে। এই module-গুলোতে কোনো mutant বেঁচে গেলে সেটা একটা issue হয়। এতে বোঝা যায় test-গুলো সত্যিই কিছু check করছে কি না।

## ৯. Performance test

| PRD | কী মাপা হয় | Budget | কোথায় আর কীভাবে |
|---|---|---|---|
| PERF-01 | Launch থেকে app-এর পাঠানো "dashboard usable" চিহ্ন পর্যন্ত | Warm start: ১০ বারের median ১ s-এর কম। নতুন runner-এ প্রথম start (reboot-এর পরের অবস্থার সবচেয়ে কাছাকাছি যা CI-তে পাওয়া যায়): ২ s-এর কম | ৩টা OS-এ `tools/perf`; release-এর আগে আসল machine-এ হাতেও check |
| PERF-02 | WS-30 সহ dashboard: cache করা অবস্থা দেখা যায়; ১০টা আর ৩০টা repo-র live অবস্থা | প্রথম frame-এই cache করা অবস্থা; ১০টা repo ১ s-এর মধ্যে; ৩০টা ২ s-এর মধ্যে | আসল app সহ `tools/perf`; `gix` নিয়ে সিদ্ধান্ত নেওয়া M1-এর Windows spawn-cost check-ও এটাই |
| PERF-03 | Input থেকে পরের paint | 95th percentile-এ ১০০ ms-এর কম | Chromium আর WebKit-এ L5, সাথে L6-এ কিছু spot check |
| PERF-04 | Git process শেষ হওয়া থেকে repo-র row আবার আঁকা পর্যন্ত | ৩০০ ms-এর কম | L6-এ `git-runner`-এর timestamp আর UI-র render চিহ্ন |
| PERF-05 | WS-30-এ bulk action চলার সময় UI-র latency; লম্বা bulk push চলার সময় dashboard-এর read | PERF-03-এর সমান; main thread-এ ৫০ ms-এর বেশি কোনো task নেই। **Read pool-এর স্বাধীনতা:** action-এর ৪টা slot-ই ধীর push-এ ব্যস্ত থাকলেও বাকি repo-গুলোর status refresh PERF-02-এর সময়ের মধ্যে শেষ হয়, কারণ read-এর নিজের ৮টার pool আছে | ব্যস্ত event stream আবার চালিয়ে L5, L6, আর read pool-এর জন্য একটা L2 test |
| PERF-06 | ১০,০০০ line-এর file-এর diff; বড় conflict-এ (FX-24) merge editor | Diff ৩০০ ms-এর কমে খোলে; merge editor ৫০০ ms-এর কমে; Rust অংশের নিজস্ব `criterion` budget আছে | প্রতিটা pull request-এ `criterion`; পুরো খোলার সময় L5 আর L6-এ |
| PERF-07 | WS-30 খোলা অবস্থায় app **আর সব webview process** মিলিয়ে memory; ৬০ s অলস অবস্থায় CPU | মোট ২৫০ MB-এর কম; অলস অবস্থায় CPU প্রায় শূন্য, নিয়মিত জেগে ওঠা নেই | ৩টা OS-এ `tools/perf` |
| PERF-08 | FX-25 (৫,০০০ file) সহ Changes screen scroll | GPU ছাড়া CI runner-এ সীমা: ৯৫ % frame ৩৩ ms-এর কম, ১০০ ms-এর বেশি কোনো task নেই। আসল machine-এ লক্ষ্য: ৯৫ % frame ১৬.৭ ms-এর কম | দুই engine-এ L5 trace; আসল machine-এর লক্ষ্য release smoke-এ check হয় |
| PERF-09 | Installer-এর আকার | ৬০ MB-এর কম; ৫০ MB থেকে সতর্কতা | ৩টা OS-এ bundle job |

কীভাবে মানানো হয়:

- প্রতিটা pull request-এ `criterion` `main`-এর baseline-এর সাথে তুলনা করে। Noise বাদ দিয়ে ১০ %-এর বেশি ধীর হলে run fail করে। `perf` job (start, RAM, আকার) কোনো pull request-এ চলে চাইলে, যখন তাতে `perf` label লাগানো থাকে।
- ওপরের পুরো budget-গুলো nightly run আর প্রতিটা release-এর gate। Nightly run-এ কোনো budget না মিললে সাথে সাথে একটা issue খোলা হয় (PRD §১৩: "খুব দ্রুত" ধীরে ধীরে ক্ষয়ে যায়)।
- M1-এর go/no-go gate এই মাপগুলোই ব্যবহার করে (দেখুন [roadmap](../plan/roadmap.bn.md))।

## ১০. Accessibility test

| Check | Tool | পাসের নিয়ম | PRD |
|---|---|---|---|
| প্রতিটা screen আর অবস্থায়, দুই theme-এ automatic rule | L5-এ `@axe-core/playwright` | কোনো serious বা critical violation নেই | UX-08, PLAT-06 |
| শুধু keyboard: PRD §৬-এর প্রতিটা P0 flow mouse ছাড়া শেষ করা | L5-এ Playwright script | Flow শেষ হয়, focus সবসময় দেখা যায়, focus-এর ক্রম যুক্তিসঙ্গত, কোথাও focus আটকে যায় না | UX-05, UX-08 |
| Label আর role | Playwright accessibility-tree snapshot | প্রতিটা control-এর নাম আর role আছে; snapshot-এর বদল review হয় (§৮) | UX-08 |
| Virtualised Changes tree | FX-25-এ Playwright accessibility-tree check, ওপরে, মাঝখানে আর শেষে scroll করে | দেখা যাওয়া প্রতিটা row-এ ঠিক `aria-level`, `aria-setsize` আর `aria-posinset` আছে, তাই বেশিরভাগ row DOM-এ না থাকলেও screen reader ঠিকভাবে "3 of 12" বলে | UX-08, CHG-01 |
| Light আর dark-এ contrast | দুই theme-এ axe | WCAG AA | UX-08 |
| Zoom | ২০০ %-এ screenshot | কিছু কাটা পড়ে না বা একটার ওপর আরেকটা চড়ে না | UX-08 |
| Screen reader | হাতে (L7): Windows-এ NVDA, macOS-এ VoiceOver, Linux-এ Orca | Release smoke script শুধু শুনে শুনে অনুসরণ করা যায় | UX-08 |

## ১১. Platform-এর পার্থক্যের test

PRD §১৩ বলে, platform-এর পার্থক্য এক জায়গায় সামলাতে হবে আর সেখানেই test করতে হবে। সেই জায়গা হলো `crates/platform`, আর এর L2 test তিনটা system-এই চলে:

- Git খুঁজে পাওয়া, `.bat` আর `.cmd` wrapper প্রত্যাখ্যান করা, macOS-এ login shell থেকে PATH পড়া;
- Path: drive letter, UNC path, লম্বা path, separator, macOS-এ Unicode normalisation;
- Line ending (FX-14) আর case-insensitive file name (FX-15);
- ঝামেলার path (FX-16) দিয়ে editor, terminal, file manager আর external merge tool খোলা;
- Process flag: Windows-এ console window নেই, kill-on-close আর process group।

## ১২. Traceability: P0 ক্ষেত্র থেকে test-এর স্তর

| PRD ক্ষেত্র | L1 | L2 | L3 | L4 | L5 | L6 | L7 | Perf |
|---|---|---|---|---|---|---|---|---|
| A. Workspace আর dashboard (DASH-01..06) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PERF-01/02/04 |
| B. Group (GRP-01..03) | ✓ | ✓ | ✓ | ✓ | ✓ | | | |
| C. Task (TASK-01..06) | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | |
| D. Change আর commit (CHG-01..07) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PERF-06/08 |
| E. Bulk operation (BULK-01, 03..06, 08) | ✓ | ✓ | ✓ | | ✓ | ✓ | | PERF-05 |
| F. Conflict আর merge editor (CONF-01..11) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PERF-06 |
| G. Pull request (PR-01..03, 05, 11) | ✓ | mock server | ✓ | ✓ | ✓ | ✓ | live contract | |
| H. নিরাপত্তা (SAFE-01..07) | guard | invariant §৫ | ✓ | | ✓ | ✓ | | |
| I. Configuration (CFG-01, 02) | ✓ | ✓ | ✓ | ✓ | ✓ | | | |
| J. Platform (PLAT-01..06) | | ✓ §১১ | | | ✓ | ✓ | ✓ | PERF-09 |
| K. গতি (PERF-01..09) | | | | | ✓ | ✓ | | §৯ |
| L. সহজে ব্যবহার (UX-01..09) | | | | ✓ | ✓ §১০ | ✓ | ✓ | PERF-03 |
| M. Pipeline (PIPE-01..10) | ✓ | ✓ + chaos §৬ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| §৯ Reliability, Security, Transparency | | INV-09..11, chaos | ✓ | | | | | |

Development চলার সময় প্রতিটা work item (`M<n>-<nn>`) উল্লেখ করে কোন কোন requirement ID সে cover করে আর কোন test সেগুলো প্রমাণ করে। CI-র একটা script PRD-র সেই সব P0 ID-র তালিকা দেয় যেগুলো এখনো কোনো test-এ উল্লেখ নেই। v0.1-এর জন্য এই তালিকা খালি হতে হবে।

## ১৩. Test-এর অংশগুলো কখন বানানো হবে

| Milestone | Test-এর কাজ |
|---|---|
| M0 | ৩টা OS-এ CI, lint gate, skip/only lint, coverage report, CI সারাংশ (§১৫), `cargo-deny` |
| M1 | প্রথম `tools/perf` job; go/no-go gate-এর জন্য spike-এর মাপ |
| M2 | Fixture builder FX-01..23 আর FX-28; `platform`, `git-runner`, `repo-state`, `storage`-এর L1 আর L2; INV-02, 05 আর 09 সহ command guard; প্রথম background status-এর আগেই INV-12 সহ repo-র trust; read pool-এর স্বাধীনতার test (§৯, PERF-05); parser-এর property test আর fuzz target; Git 2.30-এর leg |
| M3–M6 | প্রতিটা screen-এর জন্য L3 transcript, L4 আর L5; INV-01, 03, 04, 06, 07, 08; WS-30; M5 থেকে bulk action-এ (এক ধাপের run) chaos test CH-01..03 |
| M7 | Merge editor-এর differential test, FX-07..13-এর coverage, CONF-11 scan |
| M8 | বহু ধাপের pipeline-এ chaos suite CH-01..07, stateful state-machine test, INV-10 |
| M9 | Mock GitHub server, CH-08, INV-11, live contract job |
| M10 | প্রতিটা P0 flow-এর L6, পুরো performance আর accessibility gate, WS-50, mutation testing, L7 script, গ্রহণযোগ্যতার checklist (§১৪) |

## ১৪. v0.1 গ্রহণযোগ্যতার checklist

প্রতিটা item-এ টিক পড়লে তবেই v0.1 ship হবে। প্রথম পাঁচটা সরাসরি PRD §১২ থেকে নেওয়া; বাকিগুলো সেগুলোকে বারবার যাচাইযোগ্য করে।

| # | Item | Owner কীভাবে check করবেন |
|---|---|---|
| 1 | ২টা repo জুড়ে থাকা একটা আসল ticket শুধু GitHeddle আর একটা editor দিয়ে Start Task থেকে pull request তৈরি পর্যন্ত যায় | Windows-এ হাতে করা; pull request-এর link সহ release issue-তে লেখা থাকে |
| 2 | ওই ticket-এ অন্তত একটা conflict merge editor-এ resolve করা হয়েছে | একই release issue |
| 3 | ওই ticket-এ অন্তত একবার একটা saved pipeline চালানো হয়েছে | একই release issue |
| 4 | একই flow-গুলো macOS আর Linux test machine-এ পাস করে | Linux: L6 `tauri-driver` E2E আর CI install smoke সবুজ, হাতে কিছু চালাতে হয় না। macOS: L7-এর হাতে করা smoke script-এ সই |
| 5 | তিনটা system-এই PERF-01 আর PERF-02 পূরণ হয় | Release-এর performance job সবুজ, সাথে আসল machine-এ হাতে check |
| 6 | প্রতিটা P0 requirement অন্তত একটা পাস করা test-এ উল্লেখ আছে | Traceability script-এর cover না হওয়া ID-র তালিকা খালি |
| 7 | ৩টা OS × ২টা Git version-এ INV-01..12 আর CH-01..08 সবুজ | Release candidate-এর CI সারাংশ |
| 8 | সব PERF budget আর accessibility check পাস করে | CI সারাংশ |
| 9 | Safety, chaos বা invariant গ্রুপে কোনো খোলা flaky test নেই | `flaky` issue-এর তালিকা |
| 10 | Release-এর security checklist শেষ, আর `cargo-deny` ও `cargo-audit` পরিষ্কার | [Security ডকুমেন্ট](security.bn.md) §১১, release issue-তে টিক দেওয়া |
| 11 | তিনটা system-এর installer ঠিকভাবে install হয়, চালু হয় আর uninstall হয় | প্রতিটা OS আর architecture-এ CI install smoke, সাথে L7-এর macOS smoke |

Release-এর পরে PRD §১১ দুই সপ্তাহের প্রতিদিনের ব্যবহারের একটা সময় যোগ করে। সেই সময়ে কোনো কাজ হারালে বা অনিচ্ছায় protected branch-এ push হলে সেটা v0.1.x-এর জন্য release আটকে দেওয়ার মতো bug।

## ১৫. Owner কীভাবে ফলাফল পড়বেন

প্রতিটা CI run job page-এর ওপরে একটা ছোট সারাংশ লেখে:

- প্রতিটা স্তর আর প্রতিটা OS-এ কতগুলো পাস আর কতগুলো fail;
- `main`-এর তুলনায় coverage-এর বদল;
- বদলানো snapshot আর screenshot, তাদের diff-এর link সহ;
- `main`-এর তুলনায় performance-এর বদল, আর কোনো budget না মিললে সেটা;
- axe violation-এর সংখ্যা;
- `tests-changed` label লাগানো আছে কি না।

একটা pull request review করার সময় owner-এর রুটিন: সব সবুজ; roadmap-এর acceptance checklist প্রমাণ সহ টিক দেওয়া; ব্যাখ্যা ছাড়া কোনো snapshot বদল নেই; `tests-changed` থাকলে "Tests changed" অংশ পড়ে প্রতিটা বদলে রাজি হওয়া আর তার checkbox-এ টিক দেওয়া; safety feature হলে দেখে নেওয়া যে test implementation-এর আগে এসেছে। তারপর owner নিজে merge করেন।

## ১৬. Flaky test-এর নীতি

একই code-এ একটা test fail করে তারপর পাস করলে সেটা **flaky**।

1. L1–L3 কোনো retry ছাড়া চলে, কারণ retry job runner-এর race লুকিয়ে ফেলবে। L5 আর L6 একবার retry পায়, আর প্রতিটা retry সারাংশে flaky হিসেবে দেখানো হয়।
2. যেদিন দেখা যায়, সেদিনই প্রতিটা flaky test-এর জন্য `flaky` label সহ একটা issue খোলা হয়। এটা বড়জোর ১৪ দিনের জন্য একটা quarantine তালিকায় যেতে পারে, যেখানে এটা চলতে থাকে কিন্তু কিছু আটকায় না। তারপর হয় ঠিক করা হয়, নয়তো owner মুছে ফেলার সিদ্ধান্ত নেন।
3. **Invariant, chaos আর guard test কখনো quarantine হয় না।** সেখানে flake মানে আসল bug, সম্ভবত GitHeddle-এর ভেতরের কোনো race, যতক্ষণ না উল্টোটা প্রমাণ হয়।
4. Flakiness ঠেকানোর নিয়ম: নির্দিষ্ট সময়ের sleep নয় (কোনো event বা অবস্থার জন্য অপেক্ষা); প্রতিটা test-এর জন্য আলাদা temporary folder; নির্দিষ্ট commit তারিখ; local mock server আর local bare remote ছাড়া কোনো network নয়; সময় আসে এমন একটা clock থেকে যেটা test নিয়ন্ত্রণ করতে পারে।

## ১৭. পরিবর্তনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ৩ নভেম্বর ২০২৬ | Planning panel (Agent 5)-এর প্রথম খসড়া, panel-এর cross-review-এর পরে update করা (rulings R1–R32) |
