# GitHeddle — AI দিয়ে development-এর workflow

**English version:** [ai-development-workflow.en.md](ai-development-workflow.en.md)

| | |
|---|---|
| **প্রোডাক্ট** | GitHeddle |
| **ডকুমেন্ট** | AI দিয়ে development-এর workflow: Claude Code দিয়ে GitHeddle কীভাবে বানানো হবে |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। অনুমানগুলো "অনুমান" লিখে চিহ্নিত |

**সম্পর্কিত ডকুমেন্ট:** [PRD](../product/PRD.bn.md) · [Roadmap](../plan/roadmap.bn.md) · [ADR 0001: tech stack](../decisions/0001-tech-stack.bn.md) · [Architecture](../architecture/architecture.bn.md) · [UI architecture](../design/ui-architecture.bn.md) · [Build আর release](../engineering/build-and-release.bn.md) · [Test strategy](../engineering/test-strategy.bn.md) · [Security](../engineering/security.bn.md)

> এই file আর এর ইংরেজি সংস্করণে একই content আছে। একটা বদলালে অন্যটাও একই commit-এ update করতে হবে।

---

## ১. উদ্দেশ্য আর পরিসর

GitHeddle-এর প্রায় পুরোটাই লিখবে Claude Code। Owner দিক ঠিক করে দেবেন, review করবেন আর test করবেন; তাঁর Rust, TypeScript বা React-এ expert হওয়ার দরকার নেই। এই ডকুমেন্টে আছে প্রতিদিনের কাজটা কীভাবে চলবে: কে কী করবে, একটা work item-এর loop, Claude Code-এর setup, "done" মানে কী, গভীর জ্ঞান ছাড়াই owner কীভাবে কাজ যাচাই করবেন, আর AI সাধারণত যেসব ভুল করে সেগুলো কোন guardrail দিয়ে আটকানো হবে।

Stack ঠিক হয়ে গেছে [ADR 0001](../decisions/0001-tech-stack.bn.md)-এ: Tauri 2, ছোট ছোট crate-এ ভাগ করা একটা Rust core, আর React 19 + TypeScript UI। Work item-গুলো আসে [roadmap](../plan/roadmap.bn.md) থেকে (`M<n>-<nn>`)।

নিচের সবকিছু দুটো শর্ত মেনে চলে:

- **Owner-এর machine হালকা থাকবে।** সব build, পুরো test run আর installer চলবে GitHub Actions-এ। Local-এ কিছু চালানো ঐচ্ছিক, আর তা ছোট রাখা হবে (একটা crate-এর test, একটা type-check)।
- **শেষ কথা বলবে CI।** Claude Code "হয়ে গেছে" বললেই work item শেষ হয় না। শেষ হয় তখন, যখন তিন system-এই CI সবুজ আর owner acceptance criteria মিলিয়ে দেখেছেন।

## ২. ভূমিকা

| ভূমিকা | যা করে | যা করে না |
|---|---|---|
| **Owner (Taosif)** | পরের work item বেছে নেন; plan approve করেন; প্রোডাক্ট নিয়ে প্রশ্নের উত্তর দেন; demo flow আর CI screenshot দেখে acceptance criteria মিলিয়ে নেন; acceptance checklist-এ টিক দেন আর নিজে pull request merge করেন (এটাই review, §১০.৫ দেখুন); আসল machine-এ release হাতে test করেন; PRD আর roadmap-এর অগ্রাধিকার তাঁর হাতে | হাতে Rust/TS লেখা বা debug করা (করতে পারেন, কিন্তু কখনো বাধ্যতামূলক না); লাল CI-ওয়ালা PR approve করা; প্রমাণ ছাড়া "আমার এখানে চলছে" মেনে নেওয়া |
| **Claude Code (মূল session)** | Work item আর দরকারি ডকুমেন্ট পড়ে; plan লেখে; একটা branch-এ implement করে; test লেখে আর চালায়; CI-এর failure পড়ে ঠিক করে; দুই ভাষার ডকুমেন্ট মিলিয়ে রাখে; acceptance checklist পূরণ করে pull request খোলে | না জিজ্ঞেস করে scope বদলানো; সবুজ করার জন্য test দুর্বল করা বা মুছে ফেলা; নিজের pull request নিজে merge করা; PRD edit করা |
| **Review subagent** | নতুন context নিয়ে acceptance criteria আর code `CLAUDE.md`-এর সাথে মিলিয়ে diff review করে | মূল session-এর যুক্তি দেখে না (তাকে code বিচার করতে হবে, গল্প না) |
| **GitHub Actions** | Windows, macOS আর Linux-এ format, lint, type-check আর সব test চালায়; installer বানায়; screenshot আর perf-এর সংখ্যা upload করে | — |

## ৩. মূলনীতি

1. **একটা work item, একটা branch, একটা pull request।** দুটো item কখনো এক pull request-এ মেশানো যাবে না।
2. **ডকুমেন্টই spec।** শুধু roadmap-এর entry, তাতে থাকা PRD ID আর design ডকুমেন্ট পড়েই একটা session যেন work item শেষ করতে পারে। না পারলে আগে ডকুমেন্ট ঠিক করা হবে।
3. **পরিষ্কার contract-ওয়ালা ছোট module।** `crates/`-এর প্রতিটা crate-এর একটাই কাজ আর নিজের test আছে ([architecture](../architecture/architecture.bn.md) দেখুন)। Claude Code একবারে একটা crate বা একটা screen নিয়ে কাজ করে।
4. **Type আর test-ই safety net।** Rust-এর compiler, `cargo clippy -D warnings`, strict TypeScript আর generate করা `tauri-specta` binding পুরো এক এক শ্রেণির ভুল ধরে ফেলে। বাকিটা ধরে test।
5. **দাবির বদলে প্রমাণ।** Pull request-এর প্রতিটা দাবি ("dashboard 300 ms-এর মধ্যে update হয়") একটা test, CI job বা screenshot-এর দিকে নির্দেশ করবে।
6. **অগ্রগতির জন্য safety rule ছাড় দেওয়া হয় না।** PRD-র §৭ H (`SAFE-01` থেকে `SAFE-07`) ছুঁয়ে যায় এমন যেকোনো কিছুর জন্য একটা test লাগবে, যেটা প্রমাণ করে নিয়মটা মানা হচ্ছে।

## ৪. একটা work item-এর সাধারণ loop

1. **বাছাই।** Owner dependency মেনে roadmap থেকে পরের item বেছে নেন আর নতুন একটা Claude Code session শুরু করেন।
2. **Context লোড।** Claude Code পড়ে code `CLAUDE.md`, roadmap-এর entry, তাতে থাকা ID-গুলোর PRD row, আর যে crate-এ হাত দেবে সেগুলোর crate-level documentation (§৬.২)।
3. **Plan (plan mode)।** Claude Code একটা ছোট plan লেখে: কোন file আর crate বদলাবে, কোন public type বা command যোগ করবে, কী কী test লিখবে (fixture repo সহ), প্রতিটা acceptance criterion কীভাবে দেখানো হবে, আর কোনো খোলা প্রশ্ন। এখনো কোনো code না।
4. **অনুমোদন।** Owner plan পড়েন। দেখার বিষয়: item-এর scope-এর ভেতরে আছে তো? প্রতিটা acceptance criterion-এর জন্য test বা screenshot আছে তো? প্রশ্নগুলোর উত্তর দেওয়া হয়েছে? তারপর approve করেন, নয়তো ফেরত পাঠান।
5. **Branch।** Claude Code [CONTRIBUTING](../../CONTRIBUTING.bn.md)-এর মতো `<type>/<roadmap-id>-<desc>` নামে একটা branch বানায় (যেমন `feat/m4-03-changes-tree`)। একসাথে কয়েকটা item চললে প্রতিটা নিজের worktree-তে (§৭.৪)।
6. **Test সহ implement।** যেখানে সম্ভব (parser, state machine, safety rule) আগে আচরণের test, তারপর code। প্রতিটা commit ছোট আর build হওয়ার মতো রাখা হবে।
7. **Local check (ঐচ্ছিক, নির্দিষ্ট)।** Environment-এ toolchain থাকলে শুধু যা বদলেছে তার সস্তা check: একটা crate-এর test, TS type-check, Biome। Owner-এর machine-এ কখনো পুরো build না।
8. **Push করে CI-এর অপেক্ষা।** Branch push করে একটা draft pull request খোলা হয়। CI fail করলে Claude Code `gh` CLI দিয়ে fail হওয়া job-এর log পড়ে, কারণটা ঠিক করে আবার push করে, যতক্ষণ না তিন system-এই CI সবুজ হয়। **সীমা:** একই সমস্যায় দুবার চেষ্টা ব্যর্থ হলে Claude Code থেমে owner-কে জিজ্ঞেস করে (§১৩)। Item যদি start-up, memory বা installer-এর আকার ছোঁয়, Claude Code `perf` বা `bundle` label যোগ করে, যাতে on-demand job-গুলো চলে (§৭.৬)।
9. **নিজে review।** Claude Code diff-এর ওপর review subagent আর `/code-review` চালায় (§৭.৩, §৭.৫), যা পায় ঠিক করে, আর Definition of Done (§৯) মিলিয়ে দেখে।
10. **Owner-এর check।** Claude Code pull request ready করে, আর acceptance checklist-এ test, CI job আর screenshot-এর link বসিয়ে দেয়। Owner checklist আর demo flow (§১০) ধরে ধরে দেখেন, আর প্রমাণ দেখার পরেই কেবল প্রতিটা item-এ টিক দেন।
11. **Merge।** Owner নিজে `main`-এ squash-merge করেন। Branch protection সবুজ CI চায়, approve করা review না, কারণ GitHub নিজের pull request-এ নিজের approval গোনে না (§১০.৫)। Branch আর worktree মুছে ফেলা হয়। Roadmap-এ item-এর অবস্থা দুই ভাষাতেই update হয়।

## ৫. Session-এর আকারের নিয়ম

- একটা **session** মানে একটা Claude Code conversation, যেটা শেষ হয় একটা pull request দিয়ে, অথবা item ভাগ করা হলে একটা লিখিত handover note দিয়ে। Roadmap effort দেখায় session-এ, কখনো তারিখে না।
- একটা item-এ লাগা উচিত **১ থেকে ৩টা session**। Plan-এ যদি মোটামুটি ১০টার বেশি file বদলানোর কথা থাকে, একটা crate আর একটা screen-এর বেশি থাকে, বা ৫টার বেশি acceptance criterion থাকে, তাহলে শুরুর আগেই item ভাগ করতে হবে।
- **এক session-এ এক বিষয়:** একটা parser, একটা state machine, একটা screen, একটা CI job। Rust core আর UI-এর কাজ এক session-এ মেশানো হবে না, যদি না item-টা শুধু দুটোর মাঝের পাতলা command হয়।
- **প্রতিটা item নতুন করে শুরু।** এক item থেকে পরের item-এ লম্বা conversation টেনে নেওয়া যাবে না। Context লম্বা হলে model শুরুর নিয়মগুলো ভুলে যায়।
- **মাঝপথে থামলে handover।** Pull request-এর description-এ একটা note দিয়ে শেষ করতে হবে: কী হয়েছে, কী বাকি, কোন test fail করছে আর কেন। পরের session শুরু হয় সেটা পড়ে।
- **Spike (M1)-এর সময় বাঁধা।** কোনো spike তার session-এর বাজেট ছাড়িয়ে গেলে থেমে যায়, আর তখন পর্যন্ত যা পাওয়া গেছে তা লিখে রাখা হয়।

## ৬. Code-level `CLAUDE.md` আর crate-level documentation

Repository-র root-এর `CLAUDE.md`-তে প্রোডাক্ট আর ডকুমেন্টের নিয়ম আগে থেকেই আছে। Work item `M0-05` এতে একটা code অংশ যোগ করবে, আর প্রতিটা crate-এ একটা crate-level documentation comment যোগ করবে। এই অংশে বলা আছে এগুলোতে কী থাকতে হবে; file-গুলো এখানে লেখা হচ্ছে না।

### ৬.১ Root `CLAUDE.md`-এর code অংশ

- **Repo-র মানচিত্র:** [architecture](../architecture/architecture.bn.md)-এ থাকা path-গুলো (`apps/desktop/src-tauri`, `apps/desktop/src`, `crates/*`, `tests/fixtures`, `tools/perf`), প্রতিটার জন্য এক লাইন, আর এই নিয়ম যে business logic কখনো `src-tauri`-তে যাবে না।
- **Pin করা version:** `rust-toolchain.toml`-এর Rust toolchain, Tauri 2, React 19, আর প্রধান crate ও package, সাথে এই নির্দেশ: "শুধু এই version-গুলোর API ব্যবহার করো; কোনো API নিয়ে নিশ্চিত না হলে ব্যবহারের আগে pin করা version-এর docs.rs বা package-এর docs দেখে নাও"।
- **Tauri 2-এর pattern:** একটা command কীভাবে declare, register আর `tauri-specta` দিয়ে export করা হয়; capability আর permission কীভাবে declare হয়; event কীভাবে emit হয়; আর নকল করার template হিসেবে একটা চলতি command-এর নাম। সাথে Tauri v1-এর যেসব pattern কখনো আসা যাবে না তার স্পষ্ট তালিকা (config-এর v1 allow-list, পুরনো `tauri::api` module, v1 plugin-এর নাম)।
- **Rust-এর নিয়ম:** library crate-এ `thiserror`, আর `anyhow` শুধু app shell-এ; test-এর বাইরে কোনো `unwrap`, `expect` বা `panic!` না; কোনো `unsafe` না (শুধু `crates/platform`-এ, লিখিত কারণসহ); tokio শুধু job runner আর IO-র সীমানায়; `git` চালাবে শুধু `crates/git-runner`।
- **UI-এর নিয়ম:** strict TypeScript, কোনো `any` না; backend-কে ডাকা হবে শুধু generate করা binding দিয়ে; state থাকবে event-চালিত Zustand store-এ; component আসবে React Aria Components থেকে; styling হবে design token দিয়ে; শুধু Baseline web feature, যাতে WebKitGTK আর WKWebView Chromium-এর মতোই আচরণ করে ([UI architecture](../design/ui-architecture.bn.md) দেখুন)।
- **Test-এর নিয়ম:** আচরণের প্রতিটা পরিবর্তনের সাথে test; Git-এর আচরণ test হবে `tests/fixtures`-এর fixture builder (Rust) দিয়ে বানানো fixture repo-তে, কখনো `git`-এর mock-এ না; snapshot update করলে pull request-এ কারণ লিখতে হবে; owner-এর অনুমতি ছাড়া কোনো test মোছা, skip করা বা ঢিলা করা যাবে না।
- **Command:** একটা crate বা UI-এর format, lint, type-check আর test চালানোর হুবহু command, আর `gh` দিয়ে CI-এর log কীভাবে পড়তে হয়।
- **Safety-র নিয়ম:** `SAFE-01` থেকে `SAFE-07`-এর ছোট একটা কপি, আর [security](../engineering/security.bn.md) ডকুমেন্টের git process-এর নিয়ম (কোনো shell না, path-এর আগে `--`, `GIT_TERMINAL_PROMPT=0`)।
- **ডকুমেন্টের নিয়ম:** দুই ভাষার নিয়ম, আর এই ডকুমেন্টের §১২-এর একটা pointer।
- **থেমে জিজ্ঞেস করার তালিকা:** এই ডকুমেন্টের §১৩-এর একটা কপি।

### ৬.২ Crate-level documentation

`crates/`-এর প্রতিটা crate-এর `lib.rs`-এর একদম ওপরে একটা crate-level rustdoc comment থাকবে। আলাদা কোনো notes বা README file থাকবে না। Comment-টায় থাকবে:

- crate-টার একমাত্র দায়িত্ব, আর সে কী **করবে না** (যেমন "`repo-state` কখনো process চালায় না; সে `git-runner`-কে বলে");
- তার public API, গদ্যে: প্রধান type আর function, আর সেগুলো কী নিশ্চয়তা দেয়;
- সে কোন কোন PRD ID-র কাজে লাগে;
- তার invariant (যেমন "parser কোনো input-এই panic করে না; এটা `proptest` আর `cargo-fuzz` দিয়ে যাচাই করা হয়");
- কীভাবে test করতে হয়, আর কোন fixture repo লাগে;
- জানা সীমাবদ্ধতা আর খোলা প্রশ্ন।

Public API বা কোনো invariant বদলালে Claude Code সেই একই pull request-এ এই comment update করে। এটা একটা code comment, তাই অন্য সব code comment-এর মতো শুধু ইংরেজিতে লেখা হয়।

## ৭. Claude Code-এর প্রস্তাবিত setup

Setup থাকবে repository-র ভেতরে (project settings আর project subagent), যাতে প্রতিটা session আর প্রতিটা worktree একই আচরণ পায়। এটা বানানো হবে `M0-05`-এ।

### ৭.১ Hook

- **প্রতিটা file edit-এর পর:** একটা hook edit হওয়া file format করে (Rust-এর জন্য `rustfmt`, TS, JSON আর CSS-এর জন্য Biome)। এটা চলে শুধু যেখানে toolchain install করা আছে। হালকা local setup-এ এই একই check CI-এর প্রথম job হিসেবে চলে, আর Claude Code log দেখে ঠিক করে।
- **একটা turn শেষ করার আগে:** toolchain থাকলে, যে crate বা screen বদলেছে তার নির্দিষ্ট test চালানোর কথা একটা hook মনে করিয়ে দেয়।
- **Shell command-এর আগে পাহারাদার hook:** force push, `main`-এ push, scratch worktree-এর বাইরে `git reset --hard`, আর secret file পড়ে এমন command আটকে দেয়।
- **ডকুমেন্টের জোড়া check:** কোনো `*.en.md` file edit হলে, একই branch-এ মিলের `*.bn.md` file-এ হাত না পড়লে একটা hook সতর্ক করে, উল্টোটাও।

### ৭.২ Permission

- **না জিজ্ঞেস করেই চলবে:** file পড়া; repository-র ভেতরে edit; read-only `git` command; pull request আর CI run পড়ার `gh` command; code `CLAUDE.md`-এ থাকা নির্দিষ্ট test, lint আর type-check command।
- **আগে জিজ্ঞেস করতে হবে:** `git push`, pull request খোলা বা edit করা, dependency যোগ করা (Cargo manifest বা `package.json` বদলানো), GitHub Actions workflow edit করা, Tauri capability file বা CSP edit করা, invariant আর chaos test-এর folder, `CODEOWNERS` বা `cargo-deny`-এর config edit করা, আর docs খোঁজা ছাড়া অন্য যেকোনো network access।
- **নিষিদ্ধ:** force push, `main`-এ push, PRD edit করা, credential file আর keychain dump পড়া, owner-এর machine-এ global tool install করা।
- **GitHub-এর branch protection** এর পেছনে থাকে: `main`-এ পরিবর্তন ঢোকে শুধু সবুজ CI-ওয়ালা pull request দিয়ে। এটা approve করা review চায় না (§১০.৫)। `CODEOWNERS` ব্যবহার হয় review চাওয়া আর label দেওয়ার জন্য, বাধ্যতামূলক approval হিসেবে না।

### ৭.৩ Subagent

- **Reviewer:** পায় শুধু diff, roadmap-এর entry আর code `CLAUDE.md`, মূল session-এর যুক্তি না। সে bug, বাদ পড়া test, scope creep আর নিয়ম ভাঙা ধরিয়ে দেয়।
- **Test auditor:** পরিবর্তনের আগে আর পরের test মিলিয়ে দেখে, আর কোনো test মোছা, skip বা ignore করা, assertion ঢিলা করা, বা কারণ ছাড়া snapshot নতুন করে লেখা হলে সেটা ধরিয়ে দেয়।
- **ডকুমেন্ট sync checker:** বদলানো প্রতিটা `*.en.md` / `*.bn.md` জোড়ায় section, numbering, table আর ID মিলছে কি না, আর বাংলা `CLAUDE.md`-এর style মানছে কি না, সেটা দেখে।
- **API checker (ঐচ্ছিক):** diff-এ কোনো crate বা package-এর API প্রথমবার ব্যবহার হলে, pin করা version-এর docs-এ সেটা খুঁজে নিশ্চিত করে যে API-টা আসলেই আছে।

### ৭.৪ পাশাপাশি item-এর জন্য worktree

[Roadmap](../plan/roadmap.bn.md)-এ (সেখানকার §৫) যেসব item পাশাপাশি চলতে পারে বলে চিহ্নিত, সেগুলো একই সময়ে চলতে পারে, প্রতিটা নিজের git worktree আর নিজের Claude Code session-এ। নিয়ম: এক worktree-তে এক item; পাশাপাশি চলা দুটো item একই crate-এর public API বদলাবে না; যে item দ্বিতীয়তে merge হবে সে `main`-এর ওপর rebase করে আবার CI চালাবে; একসাথে বড়জোর ২ বা ৩টা item, কারণ প্রতিটাই owner-কে review করতে হবে।

### ৭.৫ Merge-এর আগে `/code-review`

Pull request ready করার আগে Claude Code branch-এর ওপর medium বা high level-এ `/code-review` চালায়, আর প্রতিটা finding ঠিক করে বা তার জবাব দেয়। Safety-সংক্রান্ত item (যা `SAFE-*`, `git-runner`, `pipeline` বা `github`-এর token handling ছোঁয়) high level ব্যবহার করে। Owner যেকোনো সময় আবার চালাতে পারেন।

### ৭.৬ On-demand CI job

Installer build আর পুরো performance job প্রতিটা pull request-এ চালানোর জন্য খুব ধীর, তাই এগুলো চাহিদামতো চলে ([build আর release](../engineering/build-and-release.bn.md) §৪ দেখুন):

- তিন system-এর installer artifact হিসেবে বানাতে pull request-এ `bundle` label দিন। Item যখন packaging, shell, বা start-up-এ app কেমন দেখায় তা বদলায়, তখন এটা ব্যবহার করুন।
- Start time, RAM আর installer-এর আকারের job চালাতে `perf` label দিন। Item যখন start-up, dashboard, diff বা merge editor ছোঁয়, বা নতুন dependency যোগ করে, তখন এটা ব্যবহার করুন।
- নতুন push-এর পরে job আবার চালাতে label সরিয়ে আবার দিন। দুটো job-ই প্রতি রাতে `main`-এ পুরো বাজেট নিয়ে চলে।

## ৮. Prompt-এর pattern

Owner ছোট, গোছানো prompt দিয়ে session শুরু করেন। Pattern-গুলো, গদ্যে:

| পরিস্থিতি | Pattern |
|---|---|
| Item শুরু | "Roadmap অনুযায়ী `M4-03` implement করো। Code `CLAUDE.md`, roadmap-এর entry আর তাতে থাকা PRD row পড়ো। Plan mode-এ শুরু করো, আর প্রতিটা acceptance criterion কীভাবে দেখাবে তা লেখো।" |
| Item চালিয়ে যাওয়া | "`M4-03` চালিয়ে যাও। আগে pull request #N-এর handover note পড়ো। যা বাকি তা শেষ করো; যা হয়ে গেছে তাতে হাত দিও না।" |
| CI ঠিক করা | "Pull request #N-এ CI fail করেছে। `gh` দিয়ে fail হওয়া job-এর log পড়ো, আসল কারণ বের করে ঠিক করো। কোনো test skip বা ঢিলা করবে না।" |
| Spike | "Spike `M1-02` করো। বাজেট ৩টা session। Roadmap-এর gate-এর সাথে মেপে দেখো, আর সংখ্যাগুলো আর একটা সুপারিশ pull request-এ লেখো। Prototype code কাঁচা হতে পারে, কিন্তু মাপগুলো CI-তে আবার পাওয়া যেতে হবে।" |
| Bug | "Bug: [কী হয়েছে, কোন OS-এ, ধাপগুলো]। আগে একটা fixture repo দিয়ে bug-টা ধরে এমন একটা fail করা test লেখো, তারপর ঠিক করো।" |
| Refactor | "[crate]-কে [লক্ষ্য] অনুযায়ী refactor করো। আচরণ বদলাবে না: আগের সব test অপরিবর্তিত অবস্থায় pass করতে হবে। কোনো test বদলানো দরকার মনে হলে তালিকা দিয়ে আগে আমাকে জিজ্ঞেস করো।" |
| ডকুমেন্ট | "[পরিবর্তন]-এর জন্য [ডকুমেন্ট] update করো। ইংরেজি আর বাংলা file একই commit-এ বদলাও, section আর ID হুবহু এক রাখো, আর বাংলার style-এর নিয়ম মানো।" |
| Review | "Pull request #N-কে তার roadmap entry-র সাথে মিলিয়ে review করো। Reviewer আর test-auditor subagent আর `/code-review` চালাও, তারপর সহজ ভাষায় আমাকে বলো কী বদলেছে আর হাতে কী test করা উচিত।" |

## ৯. Definition of Done

একটা work item তখনই done, যখন এর **সবগুলো** সত্যি:

1. Roadmap entry-র প্রতিটা acceptance criterion মিটেছে আর প্রমাণের সাথে link করা (একটা test, CI job বা screenshot)।
2. Windows, macOS আর Linux-এ CI সবুজ: format, lint (`clippy -D warnings`, Biome), type-check, skip/`.only` lint, Rust test (`cargo-nextest`), UI test (Vitest; Linux আর macOS-এ Chromium আর WebKit-এ Playwright), `cargo-deny`, coverage ratchet, `main`-এর সাথে `criterion`-এর তুলনা, আর item start-up, memory বা আকার ছুঁলে `perf` বা `bundle` job (§৭.৬)।
3. নতুন আচরণের test আছে; Git-এর আচরণ fixture repo-তে test করা; parser-এর property test আছে।
4. কোনো test মোছা, skip বা ঢিলা করা হয়নি, আর owner-এর মেনে নেওয়া কারণ ছাড়া কোনো snapshot নতুন করে লেখা হয়নি।
5. অনুমোদিত জায়গার বাইরে কোনো `unwrap`, `expect`, `panic!`, `todo!` বা `unsafe` নেই; TypeScript-এ কোনো `any` নেই; নতুন কোনো warning নেই।
6. নতুন backend command `tauri-specta` দিয়ে যায়, আর generate করা binding commit করা ও মিলে যায়।
7. নতুন dependency থাকলে owner তা approve করেছেন, আর সেটা `cargo-deny` পার হয় (GPL-3.0-এর সাথে মানানসই licence)।
8. Crate-level documentation আর প্রভাবিত যেকোনো ডকুমেন্ট update হয়েছে, যেখানে দুই ভাষার নিয়ম খাটে সেখানে দুই ভাষাতেই।
9. Reviewer subagent, test auditor আর `/code-review` চলেছে, আর তাদের finding ঠিক করা হয়েছে বা জবাব দেওয়া হয়েছে।
10. Owner acceptance checklist আর demo flow দেখেছেন, আর pull request merge করেছেন।

## ১০. গভীর জ্ঞান ছাড়া owner কীভাবে যাচাই করবেন

Owner-কে Rust-এর প্রতিটা লাইন পড়তে হবে না। যাচাই চলে চার ধরনের প্রমাণের ওপর, এই ক্রমে।

### ১০.১ CI check

| Check | সবুজ মানে | Owner কী দেখবেন |
|---|---|---|
| Format, lint, type-check | Code নিয়ম মানে, কোনো type error নেই | শুধু সবুজ কি না |
| তিন OS-এ Rust আর UI test | প্রতিটা system-এ আচরণ ঠিক আছে | এই pull request-এ যোগ হওয়া test-এর নামগুলো acceptance criteria-র মতো পড়া যায় কি না |
| Test-পরিবর্তনের report | কোন test যোগ, বদল বা বাদ হয়েছে | বাদ পড়া বা বদলানো প্রতিটা test-এর কারণ pull request-এ আছে কি না |
| Perf | প্রতিটা pull request-এ: `main`-এর সাথে `criterion`-এর তুলনা (10 %-এর বেশি ধীর হলে fail)। `perf` label দিলে আর প্রতি রাতে: §৭ K-এর সাথে start time, RAM আর installer-এর আকার | Job summary-তে সংখ্যাগুলো, `main`-এর সাথে তুলনা করে |
| Coverage আর test lint | Coverage ratchet-এর নিচে নামেনি; issue নম্বর ছাড়া নতুন কোনো `#[ignore]`, `.skip` বা `.only` নেই | শুধু সবুজ কি না |
| Playwright report আর screenshot | প্রতিটা pull request-এ artifact হিসেবে upload করা: বদলানো screen-গুলো, light আর dark-এ, Chromium আর WebKit-এ | Screenshot design-এর মতো দেখাচ্ছে কি না, আর অন্য কিছু সরে গেছে কি না |
| Installer | তিন system-এই app build আর package হয় | Item app-এর চেহারা বা start-up বদলালে একটা download করে খুলে দেখা |

### ১০.২ Acceptance checklist

Pull request-এর template-এ roadmap entry-র প্রতিটা acceptance criterion-এর জন্য একটা checkbox থাকে। Claude Code প্রতিটায় তার প্রমাণ বসিয়ে দেয়। Owner প্রমাণ দেখার পরেই কেবল প্রতিটায় টিক দেন।

### ১০.৩ Demo flow

User যা দেখে তা বদলায় এমন প্রতিটা item-এর pull request-এ একটা ছোট demo flow থাকে: নম্বর দেওয়া ধাপ, যা owner CI-এর বানানো installer-এ একটা fixture workspace দিয়ে অনুসরণ করতে পারেন (যেমন "`30-repos` fixture খোলো, `app-api`-তে টিক দাও, Pull-এ click করো, preview দেখো")। UI ছাড়া core item-এর জন্য demo হলো নামওয়ালা একটা test, যার output owner CI-এর log-এ পড়তে পারেন।

### ১০.৪ সহজ ভাষায় সারাংশ

প্রতিটা pull request Claude Code শেষ করে সহজ ভাষার একটা ছোট সারাংশ দিয়ে: কী বদলেছে, কী ভুল হতে পারে, আর হাতে কী test করা উচিত। Owner যদি সারাংশ বুঝতে না পারেন, সেটা জিজ্ঞেস করার কারণ, merge করার না।

### ১০.৫ Owner-এর review বলতে কী বোঝায়

Project-এর maintainer একজনই, আর GitHub নিজের pull request-এ লেখকের নিজের approval গোনে না। তাই review মানে GitHub-এর approval না। Review হলো:

1. CI সবুজ (branch protection এটা চায়)।
2. Acceptance checklist-এর প্রতিটা item-এ owner টিক দিয়েছেন, প্রতিটার প্রমাণসহ।
3. Pull request যদি invariant, chaos বা guard folder-এর test বদলায়, অথবা তাতে `tests-changed` label থাকে, তাহলে owner একটা আলাদা checkbox-এ টিক দেন যে তিনি "Tests changed" অংশ পড়েছেন আর প্রতিটা পরিবর্তনে একমত।
4. Owner নিজে pull request merge করেন। Claude Code কখনো merge করে না।

## ১১. AI-এর সাধারণ ভুলের বিরুদ্ধে guardrail

| ভুলের ধরন | Guardrail |
|---|---|
| **বানানো API** (এমন function বা option যা নেই) | Code `CLAUDE.md`-এ pin করা version; compiler আর TS type-check সাথে সাথে fail করে; API checker subagent; নতুন API ব্যবহার করে এমন প্রতিটা plan-এ "pin করা version-এর docs দেখো" |
| **Tauri v1 / v2 গুলিয়ে ফেলা** | Code `CLAUDE.md`-এ v1-এর নিষিদ্ধ pattern-এর তালিকা; নকল করার জন্য একটা template command; শুধু v1-এ থাকা pattern খোঁজে এমন একটা CI check; capability file owner review করেন (আগে-জিজ্ঞেস permission) |
| **`unwrap`, `expect`, panic** | Test-এর বাইরে `clippy` `unwrap_used` আর `expect_used` বাতিল করে; `forbid(unsafe_code)`; error-গুলো `thiserror` দিয়ে typed, আর `UX-04` অনুযায়ী user-কে দেখানো হয় |
| **Skip করা বা বাদ পড়া test** | Definition of Done-এর ৩ আর ৪ নম্বর; test auditor; skip/`.only` lint; coverage ratchet; প্রতিটা pull request-এ test-পরিবর্তনের report |
| **চুপিচুপি দুর্বল করা test** (ঢিলা assertion, নতুন করে লেখা snapshot, বাড়ানো timeout) | Snapshot বদলাতে কারণ লাগে; CI-এর test-পরিবর্তনের report; test auditor আগে-পরের assertion মেলায় |
| **Scope creep** (বাড়তি feature, "এখানে যখন এসেছিই" ধরনের refactor) | Plan-এ বদলানোর file-এর তালিকা থাকতে হবে; reviewer plan-এর বাইরের পরিবর্তন ধরিয়ে দেয়; বাড়তি আইডিয়া যায় pull request-এর "follow-ups" তালিকায়, code-এ না |
| **Safety rule ভাঙা** (force push, চুপচাপ discard, hook skip) | Fixture repo দিয়ে `SAFE-*` test প্রতিটা pull request-এ চলে; `git` চালায় শুধু `git-runner`, যাতে force বা hook skip করার কোনো option নেই, শুধু একটা স্পষ্ট flag-এর পেছনে force-with-lease |
| **Platform-এর ফারাক** (Windows-এ চলে, Linux-এ ভাঙে) | সব test তিন OS-এ চলে; path, line ending আর case-এর logic থাকে শুধু `crates/platform`-এ |
| **Shell injection বা token ফাঁস** | কোথাও কোনো shell না; argument যায় তালিকা হিসেবে; token কখনো webview-তে পৌঁছায় না; [security](../engineering/security.bn.md) ডকুমেন্ট দেখুন |
| **আত্মবিশ্বাসী কিন্তু ভুল সারাংশ** | প্রতিটা দাবির জন্য প্রমাণের link বাধ্যতামূলক; reviewer subagent মূল session-এর যুক্তি দেখতে পায় না |
| **Dependency ফুলে ওঠা** | Dependency যোগ করতে owner-এর অনুমোদন লাগে; `cargo-deny`; CI-তে installer-এর আকারের বাজেট (`PERF-09`) |
| **লম্বা session-এ নিয়ম ভুলে যাওয়া** | Session-এর আকারের নিয়ম (§৫); প্রতিটা item-এর জন্য নতুন session |

## ১২. Development চলার সময় দুই ভাষার ডকুমেন্টের নিয়ম

- মানুষের পড়ার মতো যেকোনো ডকুমেন্টের (`docs/`-এর ভেতরের সবকিছু, README, `CONTRIBUTING`, `SECURITY`) যেকোনো পরিবর্তন `.en` আর `.bn` দুটো file-ই বদলায়, **একই commit-এ**। Claude Code আগে ইংরেজিটা লেখে, তারপর সেখান থেকে বাংলাটা।
- শুধু এক ভাষায় করা পরিবর্তন ধরে ফেলে ডকুমেন্ট sync checker subagent আর ডকুমেন্টের জোড়া hook (§৭.১)। CI চাইলে প্রতিটা জোড়ার section heading আর requirement ও work item-এর ID মিলিয়ে দেখতে পারে।
- বাংলা `CLAUDE.md` মেনে চলে: বাংলা হরফ, স্বাভাবিক বাংলা, Git আর technical শব্দ ইংরেজিতে, section নম্বর বাংলা সংখ্যায়, ID আর code অপরিবর্তিত।
- দুটো file না মিললে Claude Code আন্দাজ করে না কোনটা ঠিক। সে owner-কে জিজ্ঞেস করে, তারপর ভুলটা ঠিক করে।
- Code, code comment (§৬.২-এর crate-level documentation সহ), config file আর generate করা file এই নিয়মের আওতায় পড়ে না। এগুলো শুধু ইংরেজিতে লেখা হয়।
- v0.1-এ UI-এর লেখা ইংরেজিতে (PRD §১৪, প্রশ্ন ৭)। এটা ডকুমেন্ট না, তাই নিয়মটা এতে খাটে না।

## ১৩. কখন থেমে owner-কে জিজ্ঞেস করতে হবে

এই পরিস্থিতিগুলোতে Claude Code একা সিদ্ধান্ত না নিয়ে থেমে জিজ্ঞেস করে:

1. PRD, roadmap বা কোনো design ডকুমেন্ট অস্পষ্ট, নিজের সাথেই বিরোধী, বা ভুল মনে হচ্ছে।
2. কোনো ডকুমেন্টের দুই ভাষার সংস্করণ মিলছে না।
3. কোনো acceptance criterion মেটাতে item-এর scope-এর বাইরে পরিবর্তন লাগবে বলে মনে হচ্ছে, অথবা এমন public API বদলাতে হবে যার ওপর অন্য item নির্ভর করে।
4. কোনো test ভুল মনে হচ্ছে, আর ঠিক করতে গেলে সেটা বদলাতে বা বাদ দিতে হবে।
5. নতুন dependency, নতুন Tauri capability, বা GitHub Actions workflow-তে পরিবর্তন লাগবে।
6. Item-এ যা বলা আছে তার বাইরে কোনো কিছু safety rule (`SAFE-*`), token handling বা কোন `git` command চলবে, তা ছোঁয়।
7. কোনো performance বাজেট মেটানো যাচ্ছে না, অথবা কোনো spike-এর ফলাফল gate-এর সীমার খুব কাছাকাছি।
8. একই সমস্যা ঠিক করার দুটো চেষ্টার পরও CI fail করছে, অথবা শুধু একটা system-এ এমন কারণে fail করছে যা Claude Code ব্যাখ্যা করতে পারছে না।
9. Item তার session-এর হিসাব ছাড়িয়ে যাচ্ছে।
10. Design ডকুমেন্টে নেই এমন কোনো UX সিদ্ধান্ত user-এর চোখে পড়বে।

জিজ্ঞেস করার সময় Claude Code প্রশ্নটা, বিকল্পগুলো আর সেগুলোর সুবিধা-অসুবিধা, আর নিজের সুপারিশ লেখে, যাতে owner এক লাইনে উত্তর দিতে পারেন।

## ১৪. পরিবর্তনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ৩ নভেম্বর ২০২৬ | প্রথম খসড়া, panel review-এর পরে সংশোধিত: crate doc হলো rustdoc comment, on-demand CI job, একক maintainer-এর review, দুই চেষ্টার সীমা, branch-এর নাম। |
