# GitHeddle — Security আর Threat Model

**English version:** [security.en.md](security.en.md)

| | |
|---|---|
| **ডকুমেন্ট** | Security আর threat model |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। Planning panel (Agent 5) লিখেছে। M9 (GitHub)-এ আর প্রতিটা release-এর আগে আবার review করতে হবে |

**সম্পর্কিত ডকুমেন্ট:** [PRD](../product/PRD.bn.md) · [Tech stack সিদ্ধান্ত](../decisions/0001-tech-stack.bn.md) · [Architecture](../architecture/architecture.bn.md) · [Test কৌশল](test-strategy.bn.md) · [Build আর release](build-and-release.bn.md) · [UI architecture](../design/ui-architecture.bn.md) · [AI development workflow](../process/ai-development-workflow.bn.md) · [Roadmap](../plan/roadmap.bn.md) · [Security policy (report করা)](../../SECURITY.bn.md)

> এই file আর এর ইংরেজি সংস্করণ [security.en.md](security.en.md)-এ একই content আছে। একটা বদলালে অন্যটাও একই commit-এ update করতে হবে।

---

## ১. উদ্দেশ্য আর পরিধি

এই ডকুমেন্টে আছে GitHeddle-কে কী কী রক্ষা করতে হবে, অবিশ্বস্ত data কোথা দিয়ে ঢোকে, কী কী ভুল হতে পারে, আর কোন নিয়ম সেটা আটকায়। প্রতিটা নিয়মের একটা ID আছে (`TH-`, `GS-`, `UN-`, `SEC-`, `SC-`, `UPD-`), যাতে কোনো work item, code review বা test সরাসরি সেটার দিকে দেখাতে পারে। এই নিয়মগুলো যে test প্রমাণ করে, সেগুলোর বর্ণনা আছে [test কৌশল](test-strategy.bn.md)-এ।

পরিধির মধ্যে আছে desktop app (Rust core আর web UI), এটা কীভাবে Git আর অন্য tool চালায়, GitHub-এর সাথে এর সংযোগ, এর local file, এর build pipeline, আর v0.2 থেকে এর update channel। Vulnerability কীভাবে report করতে হয়, তা আছে [SECURITY.bn.md](../../SECURITY.bn.md)-এ।

## ২. সম্পদ

| ID | সম্পদ | কেন গুরুত্বপূর্ণ |
|---|---|---|
| AS-01 | GitHub token (OAuth বা personal access token) | এটা দিয়ে user-এর repo আর pull request পড়া ও লেখা যায় (PR-01, §৯ Security) |
| AS-02 | User-এর uncommitted কাজ, local commit, stash আর branch | এগুলো হারানো প্রোডাক্টের সবচেয়ে বড় ব্যর্থতা (§৭ H, §৯ Safety) |
| AS-03 | Remote-এর shared branch (`main`, `dev`) | ভুল push বা force push পুরো team-এর ক্ষতি করে (SAFE-01, SAFE-02) |
| AS-04 | User-এর machine আর account | GitHeddle program চালায়। একটা ত্রুটি user-এর অধিকার নিয়ে code চালানোর সুযোগে পরিণত হতে পারে |
| AS-05 | User-এর Git credential (credential helper, SSH key) | GitHeddle এগুলো সরাসরি ছোঁয় না, কিন্তু এগুলোর ব্যবহার শুরু করায় (SAFE-05) |
| AS-06 | GitHeddle-এর নিজের অখণ্ডতা: installer আর update | একটা বদলে দেওয়া build বা update সব user-কে বিপদে ফেলে |
| AS-07 | Local data: settings, workspace, task-এর তালিকা, activity log, pipeline journal | এতে path, branch-এর নাম আর command থাকে; crash-এর পরে recovery-র জন্য এটা ঠিক থাকতে হবে (§৯ Reliability) |

## ৩. কে আক্রমণ করতে পারে

| কে | কী তার নিয়ন্ত্রণে |
|---|---|
| GitHub-এর কোনো অচেনা মানুষ | User যেসব repo খোলেন বা review করেন, সেগুলোর pull request, comment, branch-এর নাম আর commit message-এর লেখা |
| User যে repo খোলেন তার লেখক | সব file-এর content, file-এর নাম, `.gitattributes`, hook (শুধু user নিজে install করলে), আর `.githeddle.json` team file |
| Network-এ থাকা কেউ | User আর GitHub বা update server-এর মাঝের traffic |
| আপস হয়ে যাওয়া কোনো dependency বা build tool | GitHeddle-এর ভেতরের code, core-এ বা webview-এ |
| Machine-এ চলা অন্য software | User লিখতে পারেন এমন local file; আক্রমণকারী হিসেবে পরিধির বাইরে, §১২ দেখুন |
| ভালো উদ্দেশ্যের bug, AI-র লেখা code সহ | GitHeddle যা কিছু করতে পারে তার সবই। এটাকেই সবচেয়ে সম্ভাব্য বিপদ ধরে হুমকি হিসেবে গণ্য করা হয় |

## ৪. বিশ্বাসের সীমানা

| ID | সীমানা | বিশ্বস্ত দিক | অবিশ্বস্ত দিক |
|---|---|---|---|
| B1 | Webview ↔ Rust core (Tauri IPC) | Core | Webview, কারণ এটা অচেনা মানুষের লেখা দেখায় আর third-party JavaScript চালায় |
| B2 | Core ↔ `git` process | Core আর user-এর Git installation | অবিশ্বস্ত লেখা থেকে বানানো argument; Git-এর output; repo-র নিজের config |
| B3 | Core ↔ GitHub API | Core | GitHub যা ফেরত দেয় তার সব, আর মাঝের network |
| B4 | Core ↔ local storage আর keychain | Keychain | App data folder-এর file, যেগুলো crash-এ নষ্ট হতে পারে |
| B5 | Workspace-এর content: repo-র file, `.githeddle.json`, `.code-workspace` | — | এর সবটাই অবিশ্বস্ত input |
| B6 | Core ↔ বাইরের tool (editor, terminal, merge tool, file manager, browser) | User যে tool বেছে দিয়েছেন | সেটাকে দেওয়া path আর URL |
| B7 | Build, release আর update channel | Signing key আর protected CI environment | Dependency, অন্যদের pull request, download-এর network |

## ৫. হুমকি আর প্রতিকার

দ্বিতীয় column-এর অক্ষরটা STRIDE শ্রেণি: **S**poofing (ছদ্মবেশ), **T**ampering (বদলে দেওয়া), **R**epudiation (অস্বীকার), **I**nformation disclosure (তথ্য ফাঁস), **D**enial of service (সেবা বন্ধ), **E**levation of privilege (অধিকার বাড়িয়ে নেওয়া)।

### ৫.১ B1: Webview ↔ core

| ID | শ্রেণি | হুমকি | প্রতিকার | সূত্র |
|---|---|---|---|---|
| T-01 | E | Script injection: কোনো pull request-এর body, commit message, branch-এর নাম বা file-এর নামে HTML বা script আছে। সেটা webview-এ চলে আর privileged command ডাকে | UN-01..03 (default-এ শুধু লেখা, markdown-এর জন্য DOMPurify), TH-01 (কড়া CSP), TH-02 (isolation pattern), TH-04 (command নিজের input check করে) | PR-05, CHG-02, §৯ Security |
| T-02 | E | Webview কোনো remote page-এ চলে যায়, আর সেই page IPC-র অধিকার পেয়ে যায় | TH-05 (navigation আর নতুন window বন্ধ), TH-03 (capability-তে কোনো remote URL নেই), UN-04 (link খোলে system browser-এ) | PR-11 |
| T-03 | E | আপস হয়ে যাওয়া কোনো npm package webview-এ code চালায় | SC-03 (ছোট frontend dependency tree, install script বন্ধ), TH-02 আর TH-04 (webview যা-ই পাঠাক, core প্রতিটা call check করে) | §৯ Security |
| T-04 | E | আপস হয়ে যাওয়া বা bug-ওয়ালা webview core-কে যেকোনো file পড়তে বা যেকোনো command চালাতে বলে | TH-04: webview repo-কে ID দিয়ে চেনায়, কাঁচা path দিয়ে কখনো নয়; path-কে repo-র ভেতরেই resolve হতে হবে; Git-এর argument core-এ বানানো হয়; BULK-07-এর নিজের command, preview আর log আছে | BULK-07, BULK-08 |
| T-05 | I | Token webview-এ পৌঁছায়, আর inject করা script সেটা পড়ে ফেলে | SEC-03: token কখনো core-এর বাইরে যায় না; webview শুধু login-এর নাম আর user sign in করা আছেন কি না জানে | PR-01 |

### ৫.২ B2 আর B5: Git আর repo-র content

| ID | শ্রেণি | হুমকি | প্রতিকার | সূত্র |
|---|---|---|---|---|
| T-06 | E | Argument injection: `-` দিয়ে শুরু হওয়া কোনো branch-এর নাম, ticket key বা file-এর নাম Git option হিসেবে পড়ে ফেলে (যেমন `--upload-pack=…`) | GS-04 (`git check-ref-format`, `--end-of-options`, path-এর আগে `--`), test কৌশল §৭-এর property test | TASK-01, BULK-01 |
| T-07 | E | GitHeddle background-এ Git চালালে repo-র নিজের config code চালিয়ে দেয়, যেমন অন্য কারো কাছ থেকে copy করা repo-তে `core.fsmonitor`, `core.sshCommand`, কোনো filter driver বা `diff.external` | GS-08 (repo যোগ করার সময় trust check), GS-09 (আমাদের নিজের diff engine, তাই external diff বা textconv চলে না), Git-এর নিজের `safe.directory` মালিকানা check | DASH-01, SAFE-05 |
| T-08 | E | Commit আর push-এর সময় hook চলে | নকশা অনুযায়ী মেনে নেওয়া (SAFE-05): hook user-এর নিজের code। GitHeddle কখনো hook install করে না। §১২ দেখুন | SAFE-05 |
| T-09 | D | Git password-এর জন্য বা ধীর network-এ আটকে থাকে; process পড়ে থাকে | GS-05 (stdin বন্ধ, `GIT_TERMINAL_PROMPT=0`, watchdog timeout), GS-06 (Job Object আর process group) | BULK-04, PERF-05 |
| T-10 | T | কোনো bug, AI-র লেখা code সহ, force push করে বা protected branch-এ push করে | GS-07: `git-runner`-এর command guard শুধু confirmation token সহ `--force-with-lease` অনুমতি দেয়, আর protected branch-এর জন্য confirmation চায়; invariant INV-02 আর INV-03 | SAFE-01, SAFE-02 |
| T-11 | T | Discard, checkout, reset বা conflict হওয়া stash pop-এ কাজ হারায় | Command guard আর preview, work snapshot সহ (INV-01, INV-04) | SAFE-03, SAFE-04 |
| T-12 | T | Check আর ব্যবহারের মাঝে সময়ের ফাঁক: preview আর run-এর মাঝখানে repo বদলে যায় | প্রতিটা ধাপের ঠিক আগে আবার check (INV-07) | SAFE-07 |
| T-13 | E | Repo-র ভেতরের একটা symbolic link merge editor বা discard-কে দিয়ে repo-র বাইরে লিখিয়ে নেয় | GS-10: শুধু working tree-র ভেতরে resolve হওয়া path দিয়েই file লেখা হয়; link হলে সেটা অনুসরণ করা হয় না | CONF-09, SAFE-03 |
| T-14 | T | Git-এর output বা file-এর নামের terminal control character activity log-এ যা দেখায় তা বদলে দেয় | UN-05: control character escape করে দেখানো হয় | BULK-08 |
| T-15 | R | কিছু একটা বদলায়, আর user বুঝতে পারেন না GitHeddle কী করেছে | Spawn হওয়া প্রতিটা command repo, argument, exit code আর সময় সহ log হয় (INV-09)। Log থেকে secret সরিয়ে ফেলা হয় (SEC-05) | BULK-08, §৯ Transparency |

### ৫.৩ B3: GitHub

| ID | শ্রেণি | হুমকি | প্রতিকার | সূত্র |
|---|---|---|---|---|
| T-16 | S, I | মাঝখানে থাকা কেউ API traffic আটকে পড়ে ফেলে | SEC-07: `rustls` আর system-এর trust store (`rustls-platform-verifier`) দিয়ে TLS; certificate check বন্ধ করার কোনো option নেই | §৯ Security |
| T-17 | I | Token ভুল host-এ চলে যায়, যেমন redirect-এর পরে | SEC-06: token শুধু অনুমোদিত তালিকার GitHub host-এই যোগ হয়; অন্য host-এ redirect হলে কখনো সাথে যায় না | PR-01 |
| T-18 | S | Device flow phishing: ধোঁকা দিয়ে user-কে দিয়ে অন্য কারো code approve করিয়ে নেওয়া | App code-টা `github.com`-এর আসল verification ঠিকানার পাশে দেখায় আর শুধু সেই ঠিকানাই খোলে; user github.com-এ approve করেন, যেখানে GitHub app-এর নাম দেখায় | PR-01 |
| T-19 | T, D | কোনো response বিকৃত, বিশাল বা ক্ষতিকর | Size-এর সীমা সহ typed parsing; সব লেখা অবিশ্বস্ত ধরা হয় (UN-01); error দেখানো হয়, crash কখনো নয় | PR-05 |
| T-20 | D | অনেক repo থাকায় rate limit শেষ হয়ে যায় | GraphQL batching, cache আর দরকার হলে refresh (PRD §১৩) | PR-05 |
| T-21 | T | আধা-শেষ pull request তৈরির ফলে duplicate তৈরি হয় বা link বাদ পড়ে | তৈরির আগে head branch-এর জন্য আগে থেকে থাকা pull request খোঁজা হয়, তাই আবার চালালে শুধু বাকিটুকু যোগ হয় (CH-08) | PR-02, PR-03 |

### ৫.৪ B4, B5 আর B6: local data, team file আর বাইরের tool

| ID | শ্রেণি | হুমকি | প্রতিকার | সূত্র |
|---|---|---|---|---|
| T-22 | E, T | ক্ষতিকর team file `.githeddle.json` command চালাতে, editor বদলাতে, destructive pipeline ধাপ যোগ করতে বা app-কে ভাসিয়ে দিতে চায় | UN-06: কড়া schema, program-এর নাম দেওয়ার মতো কোনো field নেই, কোনো Run Git command ধাপ নেই, প্রতিটা pipeline তবুও preview দেখায়, বদলের জন্য user-এর অনুমোদন লাগে | CFG-03, PIPE-05, PIPE-13 |
| T-23 | T | Crash-এ pipeline journal নষ্ট হয় বা কেউ edit করে, ফলে Resume ভুল কাজ করে | সত্যের উৎস Git: Resume-এর সময় অবস্থা আবার পড়া হয় আর preview আবার দেখানো হয় (SAFE-07); WAL mode আর `synchronous=FULL` সহ SQLite; JSON atomic ভাবে লেখা | PIPE-07, §৯ Reliability |
| T-24 | I | Activity log বা crash output-এ secret ফাঁস হয় | SEC-05: কিছু লেখার আগে remote ঠিকানায় বসানো credential আর token-এর মতো দেখতে লেখা সরিয়ে ফেলা হয়; কোনো telemetry নেই | §৯ Security |
| T-25 | E | Editor বা terminal খোলার সময় বানানো কোনো path নিজের argument ভেঙে বেরিয়ে যায়, বিশেষ করে `code.cmd`-এর মতো Windows `.cmd` launcher দিয়ে | GS-11: শুধু argument list, কখনো shell string নয়; `.cmd` launcher-এর জন্য Rust-এর batch-file argument escaping, আর যে path নিরাপদে পাঠানো যায় না সেটা পরিষ্কার message সহ প্রত্যাখ্যাত হয় | DASH-06, CHG-06, CONF-02 |

### ৫.৫ B7: build, release আর update

| ID | শ্রেণি | হুমকি | প্রতিকার | সূত্র |
|---|---|---|---|---|
| T-26 | T, E | ক্ষতিকর বা আপস হয়ে যাওয়া dependency (crates.io, npm, GitHub Actions) | SC-01..08 | §৯ Security |
| T-27 | T | বদলে দেওয়া installer download হয় | Signed Windows installer (v0.2; PLAT-11 না হওয়া পর্যন্ত macOS ad-hoc signed), GPG-signed `SHA256SUMS`, যেটা কীভাবে মিলিয়ে দেখতে হয় তা install guide বলে দেয় (PLAT-12), build provenance attestation (SC-07, PLAT-08) | PLAT-02, PLAT-08, PLAT-12 |
| T-28 | T, E | ক্ষতিকর update, পুরনো দুর্বল version-এ নামিয়ে দেওয়া, বা signing key চুরি | UPD-01..07 | PLAT-07 |
| T-29 | E | Fork থেকে আসা pull request CI-র secret-এ পৌঁছে যায় | SC-06: secret থাকে শুধু protected environment-এ: release job-এর জন্য `release`, আর `main`-এ schedule করা live contract job-এর জন্য `github-live`, যার token শুধু একটা sandbox repo-তে সীমিত। Pull request, fork-এর pull request সহ, কখনো সেগুলো পায় না | — |

## ৬. Tauri শক্ত করার নিয়ম

| ID | নিয়ম |
|---|---|
| TH-01 | Content Security Policy: `default-src 'self'`; script শুধু app bundle থেকে, কখনো inline বা `eval` নয়; কোনো directive-এ remote origin নেই; network সংযোগ শুধু Tauri IPC-তে। `script-src` বা `style-src`, কোথাও `'unsafe-inline'` কখনো ব্যবহার হয় না। CodeMirror যে style বসায়, সেগুলো `EditorView.cspNonce` দিয়ে nonce পায়, অথবা adopted style sheet ব্যবহার করে। M1-এ যাচাই করতে হবে, আর M1-এর মাপগুলো এই CSP চালু রেখেই নেওয়া হবে |
| TH-02 | Tauri-র isolation pattern ব্যবহার করা, যাতে প্রতিটা IPC message core-এ পৌঁছানোর আগে একটা sandbox-এর ভেতরের check পার হয় |
| TH-03 | Capability-তে প্রতিটা window-এর জন্য শুধু GitHeddle-এর নিজের command থাকে। Shell, file system, HTTP বা অন্য কোনো সাধারণ plugin webview-কে দেওয়া হয় না। প্রতিটা নতুন command তার code-এর সাথে একই pull request-এ capability file-এ যোগ হয়, আর security review (§১১) সেটা দেখে |
| TH-04 | প্রতিটা command Rust-এ নিজের input check করে: path-এর বদলে repo ID, দৈর্ঘ্য আর অক্ষরের সেট সীমিত, খোলা string-এর বদলে enum। Webview কিছু check করেছে বলে কখনো ধরে নেওয়া হয় না |
| TH-05 | Webview কখনো app ছেড়ে যায় না: bundle-এর বাইরে navigation আর নতুন window বন্ধ; link যায় system browser-এ, UN-04 অনুযায়ী |
| TH-06 | Release build-এ developer tool বন্ধ থাকে। Global Tauri object প্রকাশ করা হয় না |
| TH-07 | কখনো কোনো remote content load হয় না: web font নেই, remote image নেই, analytics নেই। Pull request body-র image load হয় না; বদলে একটা link দেখানো হয়। v0.1-এ কোনো avatar image দেখানো হয় না; মানুষকে দেখানো হয় নামের আদ্যক্ষরের একটা badge দিয়ে |
| TH-08 | Command পাতলা থাকে আর core crate-গুলোকে ডাকে; `apps/desktop/src-tauri`-তে কোনো business logic বা Git spawn নেই (দেখুন [architecture](../architecture/architecture.bn.md)) |

## ৭. Git spawn করার নিয়ম

এগুলোর সবই থাকে `crates/platform` আর `crates/git-runner`-এ। Repo-র কাজের জন্য `git` spawn করে শুধু `git-runner`। `platform`-এ একটা নাম দেওয়া launcher module আছে, process চালু করার অনুমতি আছে এমন একমাত্র অন্য code: এটা editor, terminal আর file manager খোলে, login shell-এর PATH পড়ে আর `git --version` চালায় (GS-01, GS-02, GS-11)। একটা Clippy disallowed-methods নিয়ম ঠিক এই দুই জায়গাকেই অনুমতি দেয়।

| ID | নিয়ম |
|---|---|
| GS-01 | Startup-এ একবার `git`-এর absolute path খুঁজে নেওয়া। `.bat` বা `.cmd` wrapper প্রত্যাখ্যান করা। Settings-এ path আর version দেখানো। Git না থাকলে বা 2.30-এর চেয়ে পুরনো হলে কীভাবে install করতে হয় বলে দেওয়া (§৯ Compatibility) |
| GS-02 | macOS-এ user-এর login shell থেকে PATH পড়া, কারণ Dock থেকে চালু হওয়া app সেটা পায় না, অথচ Git hook আর credential helper-এর সেটা লাগতে পারে |
| GS-03 | Argument list দিয়ে spawn করা, কখনো shell দিয়ে নয়। BULK-07 user-এর লেখা `shell-words` দিয়ে ভাগ করে আর ফলাফল preview-তে দেখায় |
| GS-04 | Branch আর tag-এর নাম `git check-ref-format` দিয়ে যাচাই করা। Revision-এর আগে `--end-of-options` আর path-এর আগে `--` দেওয়া। অবিশ্বস্ত লেখা কখনো option-এর জায়গায় না বসানো |
| GS-05 | stdin বন্ধ। `GIT_TERMINAL_PROMPT=0`, যাতে Git কখনো টাইপ করা password-এর জন্য অপেক্ষা না করে; Git Credential Manager-এর মতো graphical credential helper তবুও কাজ করে। Background-এ পড়ার জন্য `GIT_OPTIONAL_LOCKS=0`, যাতে GitHeddle index lock নিয়ে user-এর editor-এর সাথে টানাটানি না করে। প্রতিটা command-এর একটা watchdog timeout আছে, network command-এর জন্য বেশি |
| GS-06 | প্রতিটা process Windows-এ kill-on-close সহ একটা Job Object-এ, বা Unix-এ নিজের process group-এ তৈরি হয়, আর Windows-এ কোনো console window দেখায় না। App বন্ধ হলে কোনো Git process পড়ে থাকে না। Cancel চলে BULK-04 অনুযায়ী: নতুন কোনো repo শুরু হয় না, চলতে থাকা command শেষ হয় |
| GS-07 | Spawn-এর আগে `git-runner`-এর কেন্দ্রীয় command guard প্রতিটা argument list check করে: কোনো `--force` বা `+` refspec নয় (শুধু নির্দিষ্ট প্রত্যাশিত মান আর confirmation token সহ `--force-with-lease`); protected branch-এ লেখা শুধু confirmation token থাকলে; কোনো `--no-verify` নয়; `core.hooksPath` বা `credential.helper` বদলানো কোনো `-c` নয়; merge বা rebase-এর মাঝপথে থাকা repo-তে নতুন operation নয়; বিশ্বাস করা হয়নি এমন repo-তে trust check-এর config পড়া ছাড়া কোনো command নয় (GS-08)। এটা GS-04-ও মানায়। `pipeline` নিজের preflight check-ও রাখে, তাই সুরক্ষার দুটো স্তর থাকে (SAFE-01, 02, 05, 06) |
| GS-08 | Workspace-এ কোনো repo যোগ হলে `workspace` `git-runner`-এর মাধ্যমে শুধু config পড়ার একটা `git config` দিয়ে তার local config পড়ে (বিশ্বাস করা হয়নি এমন repo-তে guard শুধু এই command-টাই চলতে দেয়), আর program চালাতে পারে এমন setting খোঁজে: command দেওয়া `core.fsmonitor` (`true` আর `false` মান ঠিক আছে), `core.sshCommand`, GitHeddle চালু করবে এমন `core.pager` বা `core.editor` override, filter, diff আর merge driver, `!` দিয়ে শুরু হওয়া credential helper, repo-র বাইরে দেখানো `core.hooksPath`, আর `include.path` ও `includeIf` যে file-গুলোর নাম দেয় সেগুলো। User-কে **প্রতি workspace-এ একবার** জিজ্ঞেস করা হয়, চিহ্নিত সব repo আর setting-এর একটা তালিকা দিয়ে। এখনো বিশ্বাস করা হয়নি এমন repo "Needs review" দেখায়, আর guard (GS-07) সেখানে অন্য **কোনো** Git command চলতে দেয় না, background `status`-ও না। Trust রাখা হয় প্রতিটা repo-র path আর তার config-এর একটা hash সহ; config বদলালে repo-টা আবার review চায়। Git-এর `safe.directory` প্রত্যাখ্যান মেনে নেওয়া আর ব্যাখ্যা করা হয়, কখনো পাশ কাটানো হয় না |
| GS-09 | Diff আর merge editor `cat-file --batch` থেকে আনা blob-এর ওপর GitHeddle-এর নিজের diff engine ব্যবহার করে, তাই GitHeddle কখনো `diff.external` বা textconv program চালায় না। User-কে diff দেখায় এমন command `--no-ext-diff` দেয় |
| GS-10 | File লেখা হয় শুধু repo-র working tree-র ভেতরে resolve হওয়া path দিয়ে। লেখার সময় symbolic link কখনো অনুসরণ করা হয় না |
| GS-11 | বাইরের tool (editor, terminal, merge tool, file manager) চালু করে শুধু `platform`-এর launcher module, argument list দিয়ে। Windows `.cmd` launcher শুধু এই tool-গুলোর জন্য আর শুধু Rust-এর batch-file escaping দিয়ে অনুমোদিত; যে path নিরাপদে পাঠানো যায় না সেটা পরিষ্কার message সহ প্রত্যাখ্যাত হয় |
| GS-12 | Git-এর output parse হয় শুধু machine-এর জন্য বানানো format থেকে (`--porcelain=v2`, `-z`, `--format`), মানুষের জন্য লেখা message থেকে কখনো নয়। তাই অন্য ভাষা বা বানানো message GitHeddle-এর ধারণা বদলাতে পারে না। stderr-এর শ্রেণিবিভাগ শুধু ঠিক করে কোন error message দেখানো হবে; repo-র অবস্থা নিয়ে app-এর ধারণা এটা কখনো বদলায় না। Error UI-তে যায় parameter সহ একটা code হিসেবে, আর লেখাটা UI-র নিজের |
| GS-13 | Token কখনো Git-কে দেওয়া হয় না: argument-এ নয়, remote ঠিকানায় নয়, environment-এ নয়। Git user-এর নিজের credential ব্যবহার করে (SAFE-05) |

## ৮. অবিশ্বস্ত input সামলানো

| ID | নিয়ম |
|---|---|
| UN-01 | Git, repo আর GitHub থেকে আসা সব লেখা default-এ সাধারণ লেখা হিসেবে দেখানো হয়। React-এর escaping ব্যবহার হয়, আর UN-02 ছাড়া কখনো সরাসরি HTML বসানো হয় না |
| UN-02 | Pull request-এর body আর comment markdown হিসেবে render হয়, তারপর DOMPurify একটা কড়া অনুমোদিত তালিকা দিয়ে পরিষ্কার করে: কোনো script নয়, inline event handler নয়, form নয়, iframe নয়, style নয়, remote image নয় |
| UN-03 | CodeMirror-এর syntax highlighting শুধু লেখার ওপর কাজ করে; file-এর content কখনো HTML-এ রূপান্তর হয় না |
| UN-04 | কড়া অনুমোদিত তালিকা: শুধু `https://github.com/...` link, আর configure করা কোনো GitHub Enterprise host-এর link, system browser-এ খোলে। অন্য যেকোনো URL পুরোটা দেখানো হয় আর copy করা যায়, কিন্তু কখনো সরাসরি খোলা হয় না |
| UN-05 | Git-এর output আর file-এর নামের control character আর terminal escape sequence activity log আর error message-এ escape করে দেখানো হয় |
| UN-06 | Team file `.githeddle.json` অবিশ্বস্ত। এটা size-এর সীমা সহ একটা কড়া schema দিয়ে check হয়, আর অজানা key প্রত্যাখ্যাত হয়। এতে group, pattern, template, default reviewer আর pipeline থাকতে পারে, কিন্তু editor, terminal, merge tool বা অন্য কোনো program বা command **কখনো নয়**, আর এর pipeline-এ Run Git command ধাপ থাকতে পারে না। নতুন বা বদলানো team file একটা সারাংশ হিসেবে দেখানো হয়, আর কার্যকর হওয়ার আগে user সেটা অনুমোদন করেন। এর pipeline সবসময় সাধারণ preview আর confirmation-এর মধ্য দিয়ে যায় (PIPE-05) |
| UN-07 | `.code-workspace` file থেকে শুধু folder-এর path পড়া হয়। এর settings, task আর extension-এর সুপারিশ উপেক্ষা করা হয় |
| UN-08 | Size-এর সীমা: diff view-এ খুব বড় file অংশে অংশে দেখানো হয় (PERF-06); খুব বড় GitHub response আর team file প্রত্যাখ্যাত হয় |

## ৯. Secret সামলানো

| ID | নিয়ম |
|---|---|
| SEC-01 | Token শুধু operating system-এর keychain-এ `keyring` crate দিয়ে রাখা হয়: Windows Credential Manager, macOS Keychain, Linux Secret Service। কখনো file, SQLite, log বা settings-এ নয় (§৯ Security) |
| SEC-02 | Linux-এ Secret Service না থাকলে token শুধু ওই session-এর জন্য memory-তে থাকে, আর user-কে জানানো হয় কেন পরের বার আবার sign in করতে হবে। Plain text-এর কোনো বিকল্প নেই |
| SEC-03 | Token Rust core-এই থাকে। এটা এমন একটা type-এ রাখা হয় যেটা drop হলে memory থেকে মুছে যায়, আর log বা error-এ কখনো নিজেকে print করে না। Webview শুধু login-এর নাম আর sign in অবস্থা পায় |
| SEC-04 | Sign in OAuth device flow দিয়ে (PR-01), তাই app-এর সাথে কোনো client secret যায় না। PR-01..11-এর জন্য যতটুকু scope লাগে, তার সবচেয়ে ছোট সেট চাওয়া হয়; ঠিক তালিকাটা M9-এ ঠিক হবে আর এখানে লেখা হবে। Personal access token-এর জন্য UI একটা fine-grained token-এর পরামর্শ দেয় আর কোন permission লাগবে তার তালিকা দেয় |
| SEC-05 | Activity log, SQLite বা error message-এ কিছু লেখার আগে একটা redaction ধাপ remote ঠিকানায় বসানো credential আর GitHub token-এর মতো দেখতে যেকোনো কিছু সরিয়ে ফেলে |
| SEC-06 | Token শুধু অনুমোদিত তালিকার GitHub host-এর request-এ যোগ হয়। অন্য host-এ redirect হলে কখনো সাথে যায় না |
| SEC-07 | System-এর trust store সহ `rustls` দিয়ে TLS, যাতে প্রতিষ্ঠানের নিজস্ব certificate authority কাজ করে। Certificate check বন্ধ করার কোনো setting নেই |
| SEC-08 | Sign out করলে keychain থেকে token মুছে যায়। GitHub যদি বলে token অবৈধ বা বাতিল, তাহলে সেটা মুছে ফেলা হয় আর user-কে আবার sign in করতে বলা হয় |
| SEC-09 | Network call যায় শুধু Git remote-এ (Git-এর মাধ্যমে), GitHub API-তে আর v0.2 থেকে update server-এ। প্রথম release-এ কোনো telemetry নেই, crash upload-ও নেই (§৯ Security) |
| SEC-10 | App data folder শুধু user-এর নিজের: Unix-এ permission শুধু মালিককে অনুমতি দেয়; Windows-এ per-user folder-এর default অধিকার রাখা হয়। Activity log-এর আকার আর বয়সের সীমা আছে |

## ১০. Supply chain, build আর update

### ১০.১ Supply chain আর build

| ID | নিয়ম |
|---|---|
| SC-01 | `Cargo.lock` আর `pnpm-lock.yaml` commit করা থাকে। CI frozen lockfile দিয়ে install করে |
| SC-02 | প্রতিটা pull request-এ `cargo-deny` চলে: জানা advisory থাকলে run fail করে, licence-কে GPL-3.0-এর সাথে মানানসই হতে হবে, crate আসে শুধু crates.io থেকে, আর নিষিদ্ধ বা duplicate crate জানানো হয়। এছাড়া `main`-এ প্রতিদিন `cargo-audit` চলে |
| SC-03 | Frontend package: অনুমোদিত একটা তালিকা ছাড়া install script বন্ধ রেখে pnpm; dependency-র তালিকা ইচ্ছা করেই ছোট রাখা হয় |
| SC-04 | Renovate update-এর pull request খোলে, গুচ্ছ করে, আর নতুন version প্রস্তাব করার আগে একটা ন্যূনতম বয়স অপেক্ষা করে (M0-এ setting-টা যাচাই করতে হবে)। Security update আগে আসে। প্রতিটা update সাধারণ CI-র মধ্য দিয়ে যায় |
| SC-05 | **নতুন dependency-র জন্য owner-এর অনুমোদন লাগে।** Pull request-এ তার নাম থাকে, আর লেখা থাকে কেন লাগবে, কে এটা দেখাশোনা করে, এর licence কী, এটা কতগুলো crate বা package টেনে আনে, আর tree-তে আগে থেকে থাকা কিছু দিয়ে কাজটা হয় কি না। AI session dependency-র প্রস্তাব দিতে পারে, কিন্তু চুপচাপ যোগ করতে পারে না |
| SC-06 | GitHub Actions পুরো commit hash দিয়ে pin করা থাকে। প্রতিটা workflow যতটুকু দরকার ততটুকুই permission নেয়। Release-এর secret থাকে protected `release` environment-এ, যার required reviewer owner নিজে। একমাত্র অন্য secret হলো live GitHub contract job-এর token, protected `github-live` environment-এ: শুধু `main`-এ schedule করা run, আর শুধু একটা sandbox repo-তে সীমিত একটা fine-grained token। Workflow কখনো fork-এর pull request-এর code secret সহ চালায় না, আর pull request-এর code checkout করতে `pull_request_target` ব্যবহার হয় না |
| SC-07 | Release build আসে শুধু CI থেকে, `main`-এর একটা tag দেওয়া commit থেকে। প্রতিটা artifact একটা build provenance attestation আর GPG-signed `SHA256SUMS`-এ একটা entry পায় (দেখুন [build আর release](build-and-release.bn.md)) |
| SC-08 | M0-তে owner GitHub-এর settings-এ এগুলো চালু করেন: private vulnerability reporting ([SECURITY.bn.md](../../SECURITY.bn.md)-এর জন্য লাগে), push protection সহ secret scanning, Dependabot alert, একটা tag ruleset যাতে শুধু owner `v*` tag বানাতে পারেন, আর `main`-এ এমন branch protection যেটা সবুজ CI চায় (approval চাওয়া হয় না, কারণ একা maintainer নিজের pull request নিজে approve করতে পারেন না)। TypeScript আর Rust-এর জন্য যেখানে পাওয়া যায়, code scanning যোগ করা হয় |

### ১০.২ Update channel (v0.2)

| ID | নিয়ম |
|---|---|
| UPD-01 | Update ব্যবহার করে `tauri-plugin-updater`। প্রতিটা update package একটা minisign key দিয়ে signed, আর public key app-এর ভেতরেই বসানো। Signature যাচাই না হলে update কখনো install হয় না |
| UPD-02 | Update manifest `latest.json` আর package শুধু GitHub Releases থেকে HTTPS দিয়ে আনা হয় |
| UPD-03 | শুধু বড় version গ্রহণ করা হয়, যাতে কেউ পুরনো দুর্বল একটা version-কে "update" হিসেবে চালিয়ে দিতে না পারে |
| UPD-04 | Update install হয় restart-এর সময়, আর শুধু তখন যখন কোনো job বা pipeline চলছে না (PLAT-07) |
| UPD-05 | Private key আর তার password protected `release` environment-এ দুটো আলাদা secret হিসেবে রাখা হয়, আর দুটো offline backup-এ: owner-এর password manager-এ, আর অন্য জায়গায় রাখা একটা encrypted USB drive-এ; password রাখা হয় key থেকে আলাদা। Backup হয়ে গেলে, যে machine-এ key বানানো হয়েছিল সেখান থেকে খোলা key file মুছে ফেলা হয়। Key কখনো commit হয় না, কোনো Claude Code session-এ paste হয় না, আর কোনো log-এ print হয় না (দেখুন [build আর release](build-and-release.bn.md) §১০.২) |
| UPD-06 | Key বদল: নতুন public key পুরনো key দিয়ে signed একটা update-এর ভেতরে পাঠানো হয়। Key চুরি হলে project একটা security advisory প্রকাশ করে, আর user-রা যাচাই করা download থেকে আবার install করেন |
| UPD-07 | `.deb` আর `.rpm` user-রা শুধু update আছে বলে একটা notice পান; তাঁরা নিজেদের package manager বা download page দিয়ে update করেন |

## ১১. Release-এর security checklist

প্রতিটা release-এ করা হয় আর release issue-তে টিক দেওয়া হয় (test কৌশল §১৪, item 10)।

1. `cargo-deny` আর `cargo-audit` পরিষ্কার, আর কোনো খোলা high বা critical Dependabot alert নেই।
2. গত release-এর পরে যোগ হওয়া প্রতিটা dependency SC-05 অনুযায়ী অনুমোদিত।
3. Capability file আর Tauri command-এর তালিকা গত release-এর সাথে মেলানো হয়েছে। প্রতিটা নতুন command নিজের input check করে (TH-03, TH-04)।
4. CSP বদলায়নি, অথবা বদলটা review হয়েছে (TH-01)।
5. তিনটা system আর দুটো Git version-এই invariant INV-01..12 আর chaos suite সবুজ।
6. Canary token test (INV-11) পাস করেছে।
7. ক্ষতিকর input-এর test পাস করেছে: pull request-এর লেখায় script injection, `-` দিয়ে শুরু হওয়া branch-এর নাম, ক্ষতিকর team file আর program চালানো repo config (T-01, T-06, T-07, T-22)।
8. Release workflow এখনো action-গুলো hash দিয়ে pin করে, আর secret শুধু protected environment-এ আছে (SC-06)।
9. Artifact-গুলোর provenance attestation আছে আর `SHA256SUMS`-এর সাথে মেলে; v0.2 থেকে installer signed আর update-এর signature যাচাই হয় (SC-07, UPD-01)।
10. গত release-এর পরে Git, WebView2, WebKitGTK, WKWebView, Tauri আর `rustls`-এর যেসব advisory বেরিয়েছে সেগুলো পড়া হয়েছে, আর GitHeddle-কে প্রভাবিত করে এমন সবগুলোর ব্যবস্থা নেওয়া হয়েছে।
11. গত release-এর পরে report হওয়া প্রতিটা security issue-এর উত্তর [SECURITY.bn.md](../../SECURITY.bn.md) অনুযায়ী দেওয়া হয়েছে।
12. ওপরের কোনো কিছু কোনো নিয়ম বদলালে এই ডকুমেন্ট update করা হয়েছে।

## ১২. মেনে নেওয়া ঝুঁকি আর সীমা

| ঝুঁকি | কেন মেনে নেওয়া হয়েছে |
|---|---|
| Git hook user-এর অধিকার নিয়ে চলে | SAFE-05 এটাই চায়। Hook user-এর নিজের বা team-এর। GitHeddle কখনো hook install করে না বা বদলায় না |
| একই user হিসেবে চলা অন্য software GitHeddle-এর local file পড়তে পারে আর খোলা keychain ব্যবহার করতে পারে | User হিসেবে আগে থেকে চলা code-এর বিরুদ্ধে কোনো desktop app নিজেকে রক্ষা করতে পারে না। তবুও token কখনো plain text-এ থাকে না |
| Linux-এর webview engine (WebKitGTK) update করে distribution, GitHeddle নয় | User-রা নিজেদের distribution-এর security update-এর ওপর নির্ভর করেন। Release checklist এর advisory review করে (§১১, item 10) |
| Git remote-এর credential সামলায় user-এর credential helper বা SSH agent | নকশা অনুযায়ী (SAFE-05)। GitHeddle এগুলো রাখে না, দেখেও না |

## ১৩. পরিবর্তনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ৩ নভেম্বর ২০২৬ | Planning panel (Agent 5)-এর প্রথম খসড়া, panel-এর cross-review-এর পরে update করা (rulings R1–R32) |
| 0.2 | ৩ নভেম্বর ২০২৬ | T-27: Apple Developer account ছাড়া macOS ad-hoc signed থাকে (PLAT-11); user install guide দেখে download মিলিয়ে নেন (PLAT-12)। |
