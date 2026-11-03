# GitHeddle — Build আর Release

**English version:** [build-and-release.en.md](build-and-release.en.md)

| | |
|---|---|
| **ডকুমেন্ট** | Build আর Release: toolchain, CI, packaging, signing, update আর release প্রক্রিয়া |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। "M0-তে যাচাই" লেখা বিষয়গুলো প্রথম workflow লেখার আগে tool-এর বর্তমান version-এর সাথে মিলিয়ে দেখতে হবে |

**সম্পর্কিত ডকুমেন্ট:** [PRD](../product/PRD.bn.md) · [ADR 0001: Tech stack](../decisions/0001-tech-stack.bn.md) · [Architecture](../architecture/architecture.bn.md) · [Test strategy](test-strategy.bn.md) · [Security](security.bn.md) · [UI architecture](../design/ui-architecture.bn.md) · [AI development workflow](../process/ai-development-workflow.bn.md) · [Roadmap](../plan/roadmap.bn.md) · [Contributing](../../CONTRIBUTING.bn.md)

> এই file আর এর ইংরেজি সংস্করণ [build-and-release.en.md](build-and-release.en.md)-এ একই content আছে। একটা বদলালে অন্যটাও একই pull request-এ update করতে হবে।

---

## ১. উদ্দেশ্য আর মূলনীতি

GitHeddle কীভাবে build হবে, CI-তে test হবে, package হবে, sign হবে, update হবে আর Windows, macOS ও Linux-এ release হবে, এই ডকুমেন্ট সেটা বলে। এটা PLAT-01 থেকে PLAT-10, PERF-09 আর PRD §১২-এর release plan পূরণ করে। এখানে যে test level-গুলোর (L1–L7) নাম আছে, সেগুলোর সংজ্ঞা [Test strategy](test-strategy.bn.md)-তে।

মূলনীতি:

1. **সবকিছু GitHub Actions-এ build হয়।** Owner-এর machine-এ Rust, Node, Xcode বা কোনো SDK লাগবে না। Owner দিক ঠিক করবেন, pull request review করবেন, artifact download করে হাতে test করবেন। Local build করা যাবে, কিন্তু কখনো বাধ্যতামূলক না।
2. **একই input, একই output।** প্রতিটা tool-এর version pin করা (§২)। একটা নির্দিষ্ট commit থেকে build বারবার একই ফল দেয়।
3. **প্রথম দিন থেকেই তিনটা system।** প্রতিটা pull request Windows, macOS আর Linux-এ test হয় (PLAT-03, PLAT-04, PRD §১৩)।
4. **মনে করিয়ে দেওয়া না, gate।** Budget (size, start time, memory) আর নিয়ম (ডকুমেন্টের দুই ভাষা, পরিভাষা) হলো CI check যেটা fail করে, wiki-র কোনো note না।
5. **Owner ফলাফল দেখেন CI output পড়ে।** প্রতিটা workflow তার run page-এ একটা ছোট job summary table লেখে। Owner হাতে কী করবেন, সেটা §১৪-এ আছে।

## ২. Toolchain pin করা

এই ডকুমেন্টে নির্দিষ্ট version লেখা হবে না। M0-তে প্রতিটা tool-এর সর্বশেষ stable version pin করুন, তারপর update-এর প্রস্তাব Renovate দেবে।

| Tool | কোথায় pin করা | নিয়ম |
|---|---|---|
| Rust | Repo-র root-এ `rust-toolchain.toml`: একটা নির্দিষ্ট stable version (শুধু `stable` না), `rustfmt` আর `clippy` component, আর §৬-এর target-গুলো | Toolchain bump আসে আলাদা pull request-এ, আর merge-এর আগে পুরো nightly matrix pass করতে হয় |
| Rust dependency | `Cargo.lock` commit করা থাকে; CI `--locked` দিয়ে build করে | Renovate minor update সপ্তাহে একবার একসাথে আনে |
| Node.js | `.node-version` file (LTS line) | `actions/setup-node` এটা পড়ে |
| pnpm | Root `package.json`-এর `packageManager` field | CI `pnpm/action-setup` দিয়ে install করে; install হয় `--frozen-lockfile` দিয়ে; একটা allow-list ছাড়া install script বন্ধ |
| Tauri CLI | Lockfile-এ dev dependency হিসেবে `@tauri-apps/cli` | Tauri crate আর CLI একই pull request-এ একসাথে বদলায় |
| Cargo tool (`cargo-nextest`, `cargo-deny`, `cargo-audit`, `cargo-mutants`, `tauri-driver`, `sccache`) | Workflow-এ নির্দিষ্ট version, `taiki-e/install-action` দিয়ে prebuilt binary হিসেবে install | CI-তে কখনো source থেকে `cargo install` না (ধীর) |
| Playwright | Lockfile-এ version; browser সেই version অনুযায়ী install | Browser cache-এর key সেই version |
| Git 2.30 (সমর্থিত সবচেয়ে পুরনো, PRD §৯) | Workflow-এ নির্দিষ্ট 2.30.x version | Windows: Git for Windows-এর MinGit 2.30.x portable release। macOS আর Linux: একবার source থেকে build করে cache করা (§৩.২) |
| GitHub Actions | প্রতিটা third-party action পুরো commit SHA-তে pin করা, version tag comment-এ | Renovate SHA update করে |
| Runner image | নির্দিষ্ট label (§৩), build job-এ কখনো `*-latest` না | Image বদল আসে pull request হিসেবে |

**M0-তে যাচাই:** Rust-এর বর্তমান stable, Node LTS, pnpm-এর major version, Tauri 2.x-এর minor version, আর `taiki-e/install-action` এখনো prebuilt `tauri-driver` দেয় কি না।

## ৩. Runner matrix আর caching

### ৩.১ Runner

Repository public, তাই নিচের standard GitHub-hosted runner-গুলো বিনামূল্যে। **M0-তে যাচাই:** label-গুলো ঠিক কী, আর ARM runner এখনো public repository-র জন্য বিনামূল্যে কি না।

| Runner label | Arch | কী কাজে | প্রতিটা PR | চাইলে (label) | Nightly | Weekly | Release |
|---|---|---|---|---|---|---|---|
| `ubuntu-22.04` | x64 | Lint, L1–L5, Linux bundle, L6 `tauri-driver` E2E, fuzzing | হ্যাঁ | হ্যাঁ | হ্যাঁ | — | হ্যাঁ (build) |
| `windows-2025` (বা pin করা সবচেয়ে নতুন Windows image) | x64 | L1/L2, x64 আর ARM64-এর NSIS build (ARM64 cross-compile), L6 E2E | হ্যাঁ | হ্যাঁ | হ্যাঁ | — | হ্যাঁ (build) |
| `macos-15` | ARM64 | L1/L2, Chromium আর WebKit-এ L5, `aarch64` আর `x86_64`-এর `.dmg` build (`x86_64` cross-compile) | হ্যাঁ | হ্যাঁ | হ্যাঁ | — | হ্যাঁ (build) |
| `windows-11-arm` | ARM64 | ARM64 build-এর L1/L2 smoke আর install smoke | — | — | — | হ্যাঁ | Smoke |
| `macos-15-intel` | x64 | Intel build-এর L1/L2 smoke আর launch smoke, যতদিন GitHub runner-টা দেয় | — | — | — | হ্যাঁ | Smoke |
| `ubuntu-24.04` | x64 | নতুন WebKitGTK-তে L6 E2E; `.rpm` install test-এর জন্য Fedora container | — | — | — | হ্যাঁ | Smoke |
| `ubuntu-24.04-arm` | ARM64 | Linux ARM64 build (PLAT-10) | — | — | — | পরে | পরে |

Linux release build ইচ্ছা করেই `ubuntu-22.04`-এ চলে: সমর্থিত সবচেয়ে পুরনো distribution-ই glibc-র নিম্নসীমা ঠিক করে (§৭.৩)।

### ৩.২ Caching

| Cache | Tool | Key | মন্তব্য |
|---|---|---|---|
| Rust compile output | GitHub Actions cache backend সহ `sccache` (`mozilla-actions/sccache-action`) | OS, arch, Rust version | PR, nightly আর weekly run-এ |
| Cargo registry আর git dependency | `Swatinem/rust-cache`, target caching বন্ধ রেখে | OS, `Cargo.lock`-এর hash | Crate বারবার download হওয়া ঠেকায় |
| pnpm store | `cache: pnpm` সহ `actions/setup-node` | OS, `pnpm-lock.yaml`-এর hash | |
| Playwright browser | `actions/cache` | OS, Playwright version | |
| Git 2.30 | `actions/cache` | OS, arch, নির্দিষ্ট 2.30.x version | Windows-এ MinGit download; macOS আর Linux-এ source build |
| Reference workspace WS-30 আর WS-50 | `actions/cache` | OS, fixture builder code-এর hash | Fixture builder (Rust) দিয়ে বানানো; builder বদলালেই আবার বানানো হয় |
| অন্য fixture repo | Cache করা হয় না | — | `tests/fixtures`-এর fixture builder (Rust) প্রতিটা run-এ নতুন করে বানায়, যাতে test কখনো পুরনো অবস্থার উপর নির্ভর না করে |

নিয়ম:

- **Release build কোনো build cache ব্যবহার করে না।** এগুলো পরিষ্কারভাবে শুরু থেকে compile হয়, যাতে অন্য কোনো run-এর লেখা cache কখনো ship করা installer-এ ঢুকে না পড়ে।
- GitHub প্রতি repository-তে ১০ GB cache রাখে আর সবচেয়ে পুরনোটা মুছে ফেলে। PR check ধীর হয়ে গেলে আগে job summary-তে cache hit rate দেখুন।
- PR check-এর লক্ষ্য সময়: warm cache-এ ১৫ মিনিটের কম। ২০ মিনিট ছাড়িয়ে গেলে সবচেয়ে ধীর job-গুলো review করা একটা pull request-এ nightly-তে সরিয়ে নিন।

## ৪. CI workflow

পাঁচটা workflow আর একটা shared reusable workflow আছে। এখানে এগুলো table হিসেবে লেখা। YAML লেখা হবে M0-তে, এই অংশ দেখে।

| Workflow file | Trigger | উদ্দেশ্য |
|---|---|---|
| `.github/workflows/_test.yml` | অন্যগুলো এটাকে call করে | Shared test job, OS আর git-version matrix input হিসেবে |
| `.github/workflows/pr.yml` | `main`-এ `pull_request`, `main`-এ push; label যোগ হলে label job | যে check-গুলো প্রতিটা merge আটকাতে পারে (§৪.১), আর চাইলে চালানো `bundle` ও `perf` job (§৪.২) |
| `.github/workflows/nightly.yml` | প্রতিদিনের schedule, আর হাতে চালানো | পুরো matrix, chaos suite, bundle, E2E, performance budget, fuzzing, live GitHub contract (§৪.৩) |
| `.github/workflows/weekly.yml` | সাপ্তাহিক schedule, আর হাতে চালানো | বাড়তি platform আর mutation testing (§৪.৪) |
| `.github/workflows/screenshot-baseline.yml` | শুধু হাতে চালানো | প্রতিটা OS আর engine-এর জন্য নতুন Playwright screenshot baseline বানায়, owner-এর review-এর জন্য একটা pull request হিসেবে (test strategy §৮) |
| `.github/workflows/release.yml` | `v*.*.*` tag push | Build, sign, check, তারপর একটা GitHub Release-এর draft (§৪.৫) |

**অনুমতি।** প্রতিটা workflow-এর default হলো `permissions: contents: read`। যেখানে দরকার, শুধু সেখানেই job বাড়তি অনুমতি পায়:

| Job | বাড়তি অনুমতি | কেন |
|---|---|---|
| Release `build` (draft release তৈরি করে file upload করে) | `contents: write` | Release লেখা |
| Release `checksums` (build provenance attestation) | `id-token: write`, `attestations: write` | GitHub-এর OIDC token দিয়ে attestation sign করা |
| Nightly আর weekly-র issue reporter | `issues: write` | Failure issue খোলা বা update করা |
| PR `test-report` | `pull-requests: write` | Test-change report comment হিসেবে দেওয়া |

PR workflow `concurrency` ব্যবহার করে, যাতে একই pull request-এ নতুন push এলে পুরনো run বাতিল হয়।

### ৪.১ PR check (`pr.yml`)

"Required" চিহ্নিত প্রতিটা job `main`-এর branch protection-এ required status check। Branch protection চায় সবুজ check, approval না (§১৪.২)।

| Job | Runner | কী করে | Gate | Required |
|---|---|---|---|---|
| `docs-pair` | `ubuntu-22.04` | বদলানো প্রতিটা `*.en.md`-এর জোড়া `*.bn.md`-ও একই pull request-এ বদলেছে কি না, আর উল্টোটাও; root-এর community file (`README`, `CONTRIBUTING`, `SECURITY`, `CODE_OF_CONDUCT`)-এ `<NAME>.md`-এর জোড়া `<NAME>.bn.md`; প্রতিটা file-এর উপরে তার জোড়ার link আছে কি না | জোড়া না থাকলে বা না বদলালে fail | হ্যাঁ |
| `terminology` | `ubuntu-22.04` | Doc, UI string আর code-এ "merge request" আর সংক্ষেপ "MR" খোঁজে। যেসব file নিয়মটা নিজেই বলে বা তার ইতিহাস লিখে রাখে (`CLAUDE.md`, দুটো `CONTRIBUTING` file, এই ডকুমেন্টের দুটো file, `docs/design/ui-architecture.*.md`, `docs/product/PRD.*.md`), সেগুলো `tools/`-এর একটা allow-list-এ থাকে | Allow-list-এর বাইরে কিছু পেলেই fail | হ্যাঁ |
| `lint` | `ubuntu-22.04` | `rustfmt --check`, `cargo clippy -D warnings`, Biome, TypeScript `--noEmit`; `tauri-specta` binding আবার generate করে, commit করা binding-এর সাথে না মিললে fail; skip lint (issue নম্বর ছাড়া `#[ignore]`, `.skip`, `.only`, `test.fixme`) | যেকোনো warning, অমিল বা ব্যাখ্যাহীন skip-এ fail | হ্যাঁ |
| `supply-chain` | `ubuntu-22.04` | `cargo-deny` (advisory, GPL-3.0-এর সাথে মেলে এমন licence, ban, source), `cargo-audit`, frozen pnpm lockfile | নতুন advisory বা অননুমোদিত licence-এ fail | হ্যাঁ |
| `test-rust` | সর্বশেষ git সহ `ubuntu-22.04`, `windows-2025`, `macos-15`; সাথে git 2.30 সহ `ubuntu-22.04` | L1 আর L2: সব crate-এ `cargo nextest`, fixture builder-এর বানানো fixture repo দিয়ে | যেকোনো failure | হ্যাঁ |
| `test-contract` | `ubuntu-22.04` | L3: mock runtime দিয়ে Tauri command আর event; IPC transcript record করে | যেকোনো failure | হ্যাঁ |
| `test-ui` | `ubuntu-22.04` | L4: Vitest আর Testing Library | যেকোনো failure | হ্যাঁ |
| `test-browser` | `ubuntu-22.04`, `macos-15` | L5: Vite build-এ mocked IPC দিয়ে Chromium আর WebKit-এ Playwright; `@axe-core/playwright`; screenshot তুলনা। Playwright HTML report আর screenshot artifact হিসেবে upload করে | যেকোনো failure | হ্যাঁ |
| `bench` | `ubuntu-22.04` | `main`-এর baseline-এর সাথে `criterion` benchmark-এর তুলনা | Noise-এর বাইরে ১০%-এর বেশি ধীর হলে fail | হ্যাঁ |
| `test-report` | `ubuntu-22.04` | Test-change report (কোন test যোগ হলো, বদলালো, সরানো হলো), coverage ratchet (test strategy §৮), আর `tests-changed` label check | Coverage অনুমতির চেয়ে বেশি কমলে, বা "Tests changed" অংশ ছাড়া test সরানো হলে fail | হ্যাঁ |
| `build-shell` | ৩টা OS | `apps/desktop/src-tauri` release mode-এ compile করে (installer ছাড়া) | কোনো OS-এ compile না হলে fail | হ্যাঁ |
| `size-check` | `ubuntu-22.04` | Release binary আর build করা frontend asset §১১-এর budget-এর সাথে মাপে | Budget ছাড়ালে fail | হ্যাঁ |

Owner কীভাবে দেখবেন: pull request-এ সব required check সবুজ। কোনো check লাল হলে সেটা একটা job summary-তে নিয়ে যায়, যেখানে কোন নিয়ম ভেঙেছে তার নাম থাকে (যেমন "`docs/engineering/x.en.md` বদলেছে কিন্তু `x.bn.md` বদলায়নি")।

### ৪.২ চাইলে চালানো job (pull request label)

এগুলো `pr.yml`-এর অংশ, আর চলে শুধু তখন যখন owner, বা owner-এর সম্মতিতে Claude Code, pull request-এ label-টা যোগ করেন। Label যতক্ষণ থাকে, প্রতিটা নতুন push-এ এগুলো আবার চলে।

| Label | Job | Runner | কী করে |
|---|---|---|---|
| `bundle` | `bundle` | `windows-2025`, `macos-15`, `ubuntu-22.04` | Pull request-এর branch থেকে বর্তমান release-এর আওতার (§৬) unsigned installer build করে, ৭ দিনের জন্য artifact হিসেবে upload করে, যাতে owner আসল install করা app-এ demo flow চালাতে পারেন |
| `perf` | `perf` | `windows-2025`, `macos-15`, `ubuntu-22.04` | `tools/perf` চালায়: start time, WS-30 নিয়ে RAM আর installer size, শেষ nightly-র সাথে তুলনা করে। শুধু রিপোর্ট দেয়; কঠোর gate হলো nightly আর release |

কোনো item user যা দেখেন বা app যেভাবে চালু হয় তা বদলালে `bundle` দিন। Start-up, dashboard refresh, diff-এর পথ বা dependency-তে হাত দিলে `perf` দিন।

### ৪.৩ Nightly (`nightly.yml`)

`main`-এ প্রতিদিন একবার চলে, হাতেও চালানো যায়। শেষ সবুজ nightly-র পর `main`-এ নতুন commit না থাকলে চলে না, শুধু live contract job সবসময় চলে।

| Job | Runner | কী করে | Gate |
|---|---|---|---|
| `test-full` | `ubuntu-22.04`, `windows-2025`, `macos-15` × git 2.30 আর সর্বশেষ git | পুরো L1–L5 suite, macOS-এ পুরো L5 WebKit suite সহ | যেকোনো failure |
| `chaos` | ৩টা OS, সর্বশেষ git | Crash আর chaos suite (test strategy §৬) | যেকোনো failure |
| `bundle` | `windows-2025`, `macos-15`, `ubuntu-22.04` | বর্তমান release-এর আওতার (§৬) সব installer unsigned অবস্থায় build করে; ১৪ দিনের জন্য artifact হিসেবে upload করে | Build failure |
| `install-smoke` | `windows-2025`, `macos-15`, `ubuntu-22.04` | User যেভাবে করেন সেভাবে bundle install করে (per-user NSIS, `.dmg` থেকে Applications-এ copy, `apt` দিয়ে `.deb`, AppImage), চালায়, window আসা পর্যন্ত অপেক্ষা করে, বন্ধ করে, uninstall করে। Windows-এ এটাও দেখে যে machine-wide কোনো জায়গায় কিছু লেখা হয়নি (PLAT-02) | কোনো ধাপ fail করলে |
| `e2e` | `windows-2025`, `ubuntu-22.04` | Build করা app-এর উপর L6 `tauri-driver` E2E flow | যেকোনো failure |
| `perf` | `windows-2025`, `macos-15`, `ubuntu-22.04` | `tools/perf`: cold আর warm start (PERF-01), WS-30 নিয়ে dashboard-এর সময় (PERF-02), WS-30 নিয়ে app আর webview process মিলিয়ে RAM (PERF-07), installer size (PERF-09), WS-50 scale run | PRD-র budget ছাড়ালে fail; শেষ সবুজ nightly-র চেয়ে ১০%-এর বেশি খারাপ হলে warning |
| `fuzz` | `ubuntu-22.04` | `cargo-fuzz`, প্রতিটা target-এ ৩০ মিনিট | যেকোনো crash |
| `audit` | `ubuntu-22.04` | সর্বশেষ advisory database-এর সাথে `cargo-audit` (SC-02) | নতুন advisory |
| `live-contract` | `ubuntu-22.04` | `github-live` environment-এ (§১৩) github.com-এর একটা sandbox repository-র উপর pull request flow | যেকোনো failure |

Nightly fail করলে একটা ধাপ `nightly-failure` (বা `perf-regression`) label দেওয়া একটা GitHub issue খোলে বা update করে, সাথে link। Owner সেই issue থেকে Claude Code-কে ঠিক করতে বলেন।

### ৪.৪ Weekly (`weekly.yml`)

| Job | Runner | কী করে | Gate |
|---|---|---|---|
| `extra-platforms` | `windows-11-arm`, `macos-15-intel`, `ubuntu-24.04` (+ Fedora container) | সর্বশেষ git দিয়ে L1 আর L2 smoke; মিলে যাওয়া bundle-এর install smoke (ARM64 `.exe`, Intel `.dmg`, 24.04-এ AppImage আর `.deb`, v0.2 থেকে Fedora-তে `.rpm`); `ubuntu-24.04`-এ L6 E2E | যেকোনো failure |
| `mutants` | `ubuntu-22.04` | Command guard, pipeline state machine আর marker scan-এ `cargo-mutants` (test strategy §৮) | টিকে থাকা প্রতিটা mutant একটা issue খোলে |

### ৪.৫ Release (`release.yml`)

`v0.1.0`-এর মতো একটা tag push হলে চলে। শুধু owner `v*` tag তৈরি করতে পারেন (§১৪.২)। Build job-গুলো `release` environment ব্যবহার করে, যেটা শুরুর আগে owner-এর অনুমোদন চায় আর signing secret রাখে (§১৩)।

| ধাপ | Job | কী করে | Gate |
|---|---|---|---|
| ১ | `verify` | Tag-টা `main`-এ আছে; প্রতিটা manifest-এর version-এর সাথে মেলে (§৮); দুটো changelog file-এই এই version-এর অংশ আছে; release issue খোলে (§১২) | অমিল হলে থামে |
| ২ | `test` | Nightly matrix আর weekly-র বাড়তি platform দিয়ে `_test.yml` call করে, chaos suite সহ | যেকোনো failure |
| ৩ | `build` | §৬-এর প্রতিটা target-এর জন্য `tauri-action`, cache ছাড়া পরিষ্কার build; v0.2 (M15) থেকে Windows signing, macOS signing আর notarisation, আর updater signature (§৯, §১০)। একটা **draft** GitHub Release তৈরি করে file upload করে | Build বা signing failure |
| ৪ | `size-gate` | প্রতিটা installer PERF-09-এর সাথে মেলায় (§১১) | ৬০ MB-এর বেশি, লিখে রাখা AppImage ব্যতিক্রম ছাড়া |
| ৫ | `checksums` | সব file-এর জন্য `SHA256SUMS` লেখে; v0.2 থেকে GPG দিয়ে sign করে; GitHub build provenance attestation যোগ করে | Failure |
| ৬ | `smoke` | Draft-এর file download করে প্রতিটা OS আর arch-এ `install-smoke` চালায়, weekly-র বাড়তি platform সহ | যেকোনো failure |
| ৭ | হাতে | Owner release issue (§১২) ধরে কাজ করেন: macOS manual smoke, [security release checklist](security.bn.md) §১১ আর [v0.1 acceptance checklist](test-strategy.bn.md) §১৪, তারপর draft-এ **Publish** চাপেন | Owner-এর সিদ্ধান্ত |

Publish সবসময় হাতে হয়। Release publish হওয়ার পর, আর সেটা pre-release চিহ্নিত না থাকলে, তবেই install করা app-গুলো `latest.json` (§১০) দেখতে পায়।

## ৫. কাজের ক্রম

প্রতিটা সারি Claude Code-এর একটা session-কে একটা কাজ হিসেবে দেওয়া যায়। Milestone আর item [Roadmap](../plan/roadmap.bn.md) থেকে।

| Milestone | কাজ | কখন শেষ (owner কীভাবে দেখবেন) |
|---|---|---|
| M0 | Pin করার file (§২); §৪.১-এর সব required job আর `bundle` label job সহ `pr.yml` (M0-06 packaging smoke); branch protection আর §১৪.২-এর অন্য GitHub setting | শুধু একটা `.en.md` বদলানো একটা test pull request-এ `docs-pair` fail করে; সাধারণ pull request ৩টা OS-এ সবুজ হয়; `bundle` label দিলে artifact হিসেবে ৬টা installer আসে |
| M1 | `perf` label job আর `tools/perf`; `bundle`, `perf`, `install-smoke` সহ `nightly.yml` | Nightly run page-এ প্রতিটা OS-এর start time, RAM আর installer size-এর table দেখা যায় |
| M2–M9 | Test suite বাড়ার সাথে nightly job বাড়ে: M5 থেকে `chaos`, M2 থেকে `fuzz`, M9 থেকে `live-contract`; প্রথম bundle তৈরি হলেই `weekly.yml` | প্রতিটা নতুন job nightly summary-তে দেখা যায় আর সবুজ থাকে |
| M10 | `release.yml` (unsigned), `e2e`, release issue template, changelog file, `screenshot-baseline.yml` | একটা test tag `v0.1.0-rc.1` থেকে v0.1-এর সব file সহ একটা draft release তৈরি হয়, আর smoke pass করে |
| M15 (v0.2) | Windows signing, updater, `.rpm`, GPG-signed checksum। macOS ad-hoc signed-ই থাকে (§৯.১) | Windows installer "unknown publisher" সতর্কবার্তা ছাড়া চলে; macOS-এ শুধু ডকুমেন্টে লেখা "Open Anyway" পথটা আসে; v0.2.0 নিজে নিজে v0.1.x থেকে update হয় |

## ৬. Build target আর package format

### ৬.১ Target

| OS | Rust target | কোথায় build | Package | PLAT |
|---|---|---|---|---|
| Windows x64 | `x86_64-pc-windows-msvc` | `windows-2025` | NSIS `.exe`, per user | PLAT-01, PLAT-02 |
| Windows ARM64 | `aarch64-pc-windows-msvc` | `windows-2025` (cross) | NSIS `.exe`, per user | PLAT-01, PLAT-02 |
| macOS Apple Silicon | `aarch64-apple-darwin` | `macos-15` | `.dmg` | PLAT-01, PLAT-02 |
| macOS Intel | `x86_64-apple-darwin` | `macos-15` (cross) | `.dmg` | PLAT-01, PLAT-02 |
| Linux x64 | `x86_64-unknown-linux-gnu` | `ubuntu-22.04` | AppImage, `.deb`, `.rpm` | PLAT-01, PLAT-02, PLAT-09 |
| Linux ARM64 | `aarch64-unknown-linux-gnu` | `ubuntu-24.04-arm` | AppImage, `.deb`, `.rpm` | PLAT-10 |

macOS-এর জন্য একটা universal build-এর বদলে দুটো আলাদা `.dmg` দেওয়া হয়: প্রতিটা download অর্ধেক আকারের, আর একটা architecture-এর সমস্যা আলাদা করে ধরা সহজ। MSI build করা হয় না, কারণ সেটা পুরো machine-এ install হয় আর admin অধিকার চায়।

### ৬.২ কোন release-এ কী দেওয়া হয়

| Release | File | Signing | Update |
|---|---|---|---|
| **v0.1** | **৬টা installer:** Windows x64 আর ARM64 `.exe`; macOS ARM64 আর Intel `.dmg`; Linux x64 AppImage আর `.deb`। সাথে `SHA256SUMS` | Windows-এ unsigned; macOS-এ শুধু ad-hoc signed (§৯) | নেই; user নতুন version হাতে download করেন |
| **v0.2 (M15)** | v0.1-এর file, সাথে Linux x64 `.rpm` (PLAT-09); updater bundle আর `.sig` file; `latest.json` | Windows Authenticode (PLAT-08); Apple Developer account না হওয়া পর্যন্ত macOS ad-hoc signed-ই থাকে (PLAT-11); GPG-signed `SHA256SUMS` | `tauri-plugin-updater` (PLAT-07) |
| **v0.3 আর পরে (M18)** | Linux ARM64 AppImage, `.deb`, `.rpm` (PLAT-10) | v0.2-এর মতো | v0.2-এর মতো |
| প্রতিশ্রুতি নেই | winget, Homebrew cask, Flathub | — | v0.2-এর পরে সিদ্ধান্ত |

## ৭. Platform-ভিত্তিক note

### ৭.১ Windows: per-user install আর WebView2

- NSIS `installMode: currentUser` দিয়ে configure করা। এটা user-এর local app data folder-এ install হয়, শুধু user-এর registry hive-এ লেখে, আর কখনো admin অধিকার চায় না (PLAT-02)। Nightly-র `install-smoke` এটা যাচাই করে।
- **WebView2:** installer Evergreen **download bootstrapper** ব্যবহার করে (`webviewInstallMode: downloadBootstrapper`)। Windows 11 আর update করা Windows 10-এ runtime আগে থেকেই থাকে, তাই সাধারণত কিছু download হয় না। না থাকলে bootstrapper সেটা বর্তমান user-এর জন্য install করে, যাতে admin অধিকার লাগে না। Offline installer mode ব্যবহার করা হয় না: সেটা ১০০ MB-এর বেশি যোগ করে, ফলে PERF-09 ভেঙে যাবে।
- WebView2 বন্ধ করা থাকলে (কিছু অফিসের machine-এ policy দিয়ে বন্ধ থাকে) app চালু হতে পারে না। Download page আর first-run help এটা ব্যাখ্যা করে। About dialog আর diagnostics-এ WebView2-এর version দেখায়, তাই bug report-এ সেটা থাকে।
- প্রতিটা `git` process `CREATE_NO_WINDOW` দিয়ে চালু হয়, যাতে কোনো console window ঝলক দিয়ে না ওঠে ([Architecture](../architecture/architecture.bn.md), `crates/platform` দেখুন)।
- Windows ARM64 x64 runner-এ cross-compile হয়, আর প্রতি সপ্তাহে `windows-11-arm`-এ test হয়।

### ৭.২ macOS

- **কার্যত ন্যূনতম চাহিদা macOS 13.3 বা নতুন**, কারণ UI-এর WKWebView/Safari 16.4 বা নতুন লাগে (Tailwind CSS v4-এর browser-এর নিম্নসীমা, [UI architecture](../design/ui-architecture.bn.md) দেখুন)। macOS 13.0–13.2-এ থাকে Safari 16.0–16.3।
- Bundle-এর minimum system version 13.0-ই থাকে, যাতে 13.0–13.2-এও app খুলতে পারে। চালু হওয়ার সময়, মূল UI load হওয়ার আগে, core WebKit-এর version দেখে নেয়। 16.4-এর চেয়ে পুরনো হলে ভাঙা UI-এর বদলে app একটা সাধারণ native message দেখায়, যেটা বলে কীভাবে macOS update করতে হয়।
- WKWebView system-এর সাথে আসে, তাই এর engine version macOS-এর version আর তার Safari update অনুযায়ী চলে।
- Finder থেকে চালু হওয়া app shell-এর `PATH` পায় না। `crates/platform` একবার login-shell-এর `PATH` বের করে নেয়, যাতে Homebrew-এর `git` আর credential helper খুঁজে পাওয়া যায়। macOS manual smoke এটা test করে (§১২)।
- **আপাতত কোনো Apple Developer account নেই।** Apple Silicon শুধু signed code চালায়, তাই macOS-এর প্রতিটা build **ad-hoc signed** (signing identity `-`), notarised নয়। Owner account নেওয়ার সিদ্ধান্ত না নেওয়া পর্যন্ত এটাই চলবে (PLAT-11, কোনো তারিখ নেই)। User-এর জন্য এর মানে কী, আর তবুও তিনি কীভাবে app খুলবেন, তা আছে [install guide](../guides/install.bn.md)-এ (PLAT-12):
  - Download করার পর প্রথমবার খুললে Gatekeeper-এর "could not verify" বার্তা আসে। User System Settings → Privacy & Security → "Open Anyway" দিয়ে app খোলেন। এটা প্রতিবার চালুর সময় নয়, প্রতিটা download-এ একবার লাগে।
  - macOS যদি এর বদলে বলে app-টা "is damaged", তাহলে guide-এ দেওয়া একটা Terminal command দিয়ে quarantine flag সরিয়ে দিতে হয়।
  - Ad-hoc signature প্রতিটা build-এ বদলায়, তাই update-এর পরে macOS আরেকবার GitHeddle-এর Keychain item পড়ার অনুমতি চাইতে পারে। User "Always Allow"-এ click করেন। Guide-এ এটা বলা আছে, আর v0.2 থেকে macOS smoke এটা যাচাই করে।
  - App-এর নিজের updater যে update বসায়, সেটা browser নয়, app নিজে download করে, তাই তাতে quarantine flag পড়ে না আর Gatekeeper-এর বার্তা আবার আসে না। **M15-এ যাচাই করতে হবে।**

### ৭.৩ Linux: ন্যূনতম চাহিদা

| বিষয় | ন্যূনতম | কারণ |
|---|---|---|
| glibc | Ubuntu 22.04-এর version (2.35) | Release build `ubuntu-22.04`-এ চলে, তাই binary-র এর চেয়ে নতুন কিছু লাগে না; Fedora 39 আর নতুনে glibc আরো নতুন |
| WebKitGTK | `webkit2gtk-4.1` (Tauri 2 যে 4.1 API ব্যবহার করে) | Ubuntu 22.04 আর Fedora 39 ও নতুনে পাওয়া যায় |
| GTK | GTK 3 | Linux-এ Tauri 2-এর দরকার |
| Keychain | চালু থাকা একটা Secret Service (GNOME Keyring, KWallet-এর Secret Service API, KeePassXC) | কোনোটা চালু না থাকলে token শুধু ওই session-এর জন্য রাখা হয়, কখনো plain text-এ না ([Security](security.bn.md) দেখুন) |
| AppImage | FUSE 2 | Ubuntu 24.04 এটা default-এ install করে না; download note-এ বলা আছে `libfuse2t64` install করতে, অথবা `--appimage-extract-and-run` দিয়ে চালাতে |

- `.deb` তার dependency হিসেবে `libwebkit2gtk-4.1-0` আর `libgtk-3-0` ঘোষণা করে। `.rpm` ঘোষণা করে `webkit2gtk4.1`।
- WebKitGTK-এর একটা জানা সমস্যা: কিছু NVIDIA আর Wayland setup-এ window ফাঁকা দেখায়। App এই অবস্থা ধরতে পারলে `WEBKIT_DISABLE_DMABUF_RENDERER=1` set করে, আর help-এ হাতে কীভাবে set করতে হয় তা বলা আছে।
- E2E প্রতি রাতে `ubuntu-22.04`-এ আর প্রতি সপ্তাহে `ubuntu-24.04`-এ চলে, তাই পুরনো আর নতুন দুই রকম WebKitGTK-ই ধরা পড়ে।

## ৮. Versioning আর changelog

- **SemVer**, tag `vMAJOR.MINOR.PATCH`, যেমন `v0.1.0`। 1.0-এর আগে minor সংখ্যা PRD-র release plan অনুসরণ করে (v0.1, v0.2, v0.3), আর patch সংখ্যা fix-এর জন্য।
- Release candidate হলো `v0.1.0-rc.1`, GitHub pre-release হিসেবে publish করা। Updater pre-release উপেক্ষা করে।
- **একটা version, অনেক manifest।** Version থাকে Cargo workspace-এ, `apps/desktop/src-tauri/tauri.conf.json`-এ আর `apps/desktop/package.json`-এ। `tools/`-এর একটা script দেখে এগুলো মেলে কি না, আর release-এর `verify` job সেটা চালায়।
- Version বাড়ানো হয় নিজস্ব একটা pull request-এ, যার নাম "Release vX.Y.Z", আর সেটা changelog-ও চূড়ান্ত করে।
- **Changelog:** repository-র root-এ `CHANGELOG.en.md` আর `CHANGELOG.bn.md`, "Keep a Changelog" ধাঁচে (Added, Changed, Fixed, Removed, Security), সবার উপরে একটা "Unreleased" অংশ। User যা দেখেন তা বদলায় এমন যেকোনো pull request দুটো file-এই একটা লাইন যোগ করে, প্রযোজ্য হলে requirement ID সহ।
- GitHub Release-এর লেখা আর updater-এর "কী বদলেছে" note (PLAT-07) ইংরেজি অংশ থেকে copy করা হয়, কারণ v0.1-এ UI ইংরেজিতে (PRD §১৪ প্রশ্ন ৭)। Release থেকে বাংলা অংশের link দেওয়া থাকে।

## ৯. Signing আর notarisation

### ৯.১ পরিকল্পনা

| Platform | v0.1 | v0.2, M15 (PLAT-08) |
|---|---|---|
| Windows | Unsigned। [Install guide](../guides/install.bn.md) SmartScreen ব্যাখ্যা করে: "More info", তারপর "Run anyway" | **SignPath Foundation**-এর মাধ্যমে Authenticode (open-source project-এর জন্য বিনামূল্যে)। বিকল্প: **Certum open-source code signing** certificate |
| macOS | Ad-hoc signed, notarised না (§৭.২)। Install guide "Open Anyway" পথটা ব্যাখ্যা করে | **কোনো বদল নেই: ad-hoc signed।** Owner Apple Developer account নিলে তবেই Developer ID signing আর notarisation আসবে (PLAT-11)। তখন: **Developer ID Application** certificate, hardened runtime, App Store Connect API key দিয়ে `notarytool`-এ notarise, ticket app আর `.dmg`-এ staple করা |
| Linux | `SHA256SUMS` publish করা | Project-এর GPG key দিয়ে signed `SHA256SUMS`; public key-এর link README-তে |

### ৯.২ Windows signing build-এ কোথায় বসে

Updater signature (§১০) বানাতে হবে চূড়ান্ত, Authenticode-signed installer-এর উপর। তাই ক্রমটা হলো:

1. Tauri app-এর `.exe` build করে।
2. Tauri-র `signCommand` hook প্রতিটা binary (app, uninstaller, তারপর installer) SignPath-এ পাঠায় আর signed file ফেরত আসা পর্যন্ত অপেক্ষা করে।
3. Tauri signed installer-এর জন্য updater-এর `.sig` লেখে।

SignPath যাচাই করে যে file-গুলো এই repository-র একটা GitHub Actions run থেকে এসেছে, আর owner SignPath dashboard-এ প্রতিটা signing request অনুমোদন করেন। **M15-এ যাচাই:** SignPath-এর submit-and-wait `signCommand` থেকে কাজ করে কি না, নাকি signing-কে আলাদা একটা job-এ সরাতে হবে যেটা পরে updater signature আবার বানায়।

### ৯.৩ সময়রেখা

| কখন | কাজ | কে |
|---|---|---|
| ঠিক করা নেই | Owner সিদ্ধান্ত নিলে তবেই Apple Developer Program-এ (individual, বছরে টাকা লাগে) নাম লেখানো; ততদিন macOS ad-hoc signed থাকে (PLAT-11) | Owner |
| M10 | [Install guide](../guides/install.bn.md)-এর ধাপগুলো release note-এর template-এ বসানো (PLAT-12) | Claude Code, owner যাচাই করেন |
| M10, v0.1 public হওয়ার ঠিক পরে | SignPath Foundation-এ আবেদন; তাদের একটা release সহ public repository লাগে | Owner |
| M10 | GPG key তৈরি; তার public key publish | Owner |
| M15 (v0.2)-এর শুরুতে | Updater key তৈরি (§১০.২); signing secret যোগ (§১৩); একটা test tag `v0.2.0-rc.1` পুরো signed পথ যাচাই করে | Owner, তারপর CI |
| ৬ সপ্তাহের মধ্যে SignPath অনুমোদন না দিলে | Certum certificate order করা। এর cloud signing-এ প্রতি release-এ একটা হাতের ধাপ লাগতে পারে; সেটা checklist-এ লিখে রাখা | Owner |

খেয়াল রাখুন: certificate-এর সুনাম তৈরি হওয়ার আগ পর্যন্ত signed installer-ও শুরুতে SmartScreen সতর্কবার্তা দেখাতে পারে। Download note-এ সেটা বলা থাকে।

## ১০. Updater (v0.2, M15)

### ১০.১ নকশা

| অংশ | সিদ্ধান্ত |
|---|---|
| Plugin | `tauri-plugin-updater`, bundle config-এ `createUpdaterArtifacts` চালু |
| Endpoint | `https://github.com/dev-taosif-net/GitHeddle/releases/latest/download/latest.json`, GitHub Releases-এ একটা static file (PRD §১৪ প্রশ্ন ৬) |
| Manifest | `tauri-action`-এর বানানো `latest.json`: version, note, তারিখ, আর প্রতিটা platform-এর (`windows-x86_64`, `windows-aarch64`, `darwin-aarch64`, `darwin-x86_64`, `linux-x86_64`) download URL ও signature |
| Signature | প্রতিটা update file project-এর minisign key দিয়ে signed; public key `tauri.conf.json`-এ। Signature না মিললে file প্রত্যাখ্যান করা হয় আর log-এ লেখা হয় |
| কখন check করে | চালু হওয়ার সময়, তারপর timer দিয়ে প্রতি ২৪ ঘণ্টায় একবার, কখনো busy polling না (PERF-07)। একটা setting দিয়ে check বন্ধ করা যায়। Git remote আর GitHub ছাড়া এটাই একমাত্র network call (PRD §৯) |
| User কী দেখেন | "Version X.Y.Z is available", সাথে note; "Install on restart" আর "Later" button |
| কখন install হয় | শুধু restart-এর সময়, আর শুধু তখন যখন job runner-এ কোনো job চলছে না (PLAT-07, UPD-04)। থেমে থাকা pipeline run আগে থেকেই journal-এ save করা থাকে; journal আগে disk-এ flush হয়, আর update-এর পরে সেগুলো আবার চালানো যায় (PRD §৯ Reliability)। কোনো job চলতে থাকলে install পরের restart পর্যন্ত অপেক্ষা করে |
| Windows | NSIS update passive mode-এ চলে, per user, admin অধিকার ছাড়া |
| Linux | AppImage নিজেই update হয়। `.deb` আর `.rpm` install-এ (app দেখে নেয় সেটা AppImage থেকে চলছে কি না) শুধু download link সহ একটা নোটিশ দেখায় |
| পুরনো version | Plugin শুধু চলমান version-এর চেয়ে বড় version install করে |
| Pre-release | কখনো দেওয়া হয় না; GitHub-এর `latest` এগুলো বাদ দেয় |

### ১০.২ Key-এর হেফাজত

1. Owner একবার `npx @tauri-apps/cli signer generate` দিয়ে key pair তৈরি করেন। এতে Node.js লাগে, তবে কিছু compile হয় না: এটা একটা prebuilt CLI download করে। Key-টার একটা শক্ত password থাকে।
2. **Owner-এর machine-এ Node না থাকলে:** browser-এ repository-র উপর একটা GitHub Codespace খুলুন, সেখানে একই command চালান, key file সরাসরি password manager-এ download করুন, তারপর Codespace-টা delete করুন। Local-এ কিছুই install হয় না।
3. Private key আর তার password `release` environment-এ দুটো আলাদা secret হিসেবে রাখা হয় (§১৩)।
4. **দুটো offline backup:** key file owner-এর password manager-এ, আর একটা copy একটা encrypted USB drive-এ, অন্য কোনো জায়গায় রাখা। Password key file থেকে আলাদা রাখা হয়।
5. **Backup হয়ে গেলে plain key file মুছে ফেলা হয়**, যে machine বা Codespace-এ তৈরি হয়েছিল সেখান থেকে (download folder আর recycle bin থেকেও)। Owner-এর রোজকার machine-এ এটা কখনো plain অবস্থায় রাখা হয় না (UPD-05)।
6. Private key কখনো commit করা হয় না, কখনো Claude Code session-এ paste করা হয় না, আর কখনো log-এ print হয় না।
7. **Key হারালে:** install করা app-গুলো আর কোনো নতুন update যাচাই করতে পারবে না। User-দের পরের version হাতে download করে install করতে হবে। Release note আর README-তে সেটা বলা হয়।
8. **Key ফাঁস হলে:** secret সরিয়ে ফেলুন, নতুন key বানান, আর পুরনো key দিয়ে signed এমন একটা release দিন যাতে নতুন public key আছে। তারপর একটা security notice publish করুন ([SECURITY.bn.md](../../SECURITY.bn.md) দেখুন)।

## ১১. Size budget (PERF-09)

| Artifact | কঠোর সীমা | Warning | কোথায় check |
|---|---|---|---|
| প্রতিটা installer (`.exe`, `.dmg`, `.deb`, `.rpm`) | ৬০ MB (PERF-09) | ৫০ MB | `perf` label job, nightly `perf`, release `size-gate` |
| AppImage | ৬০ MB, অথবা লিখে রাখা ব্যতিক্রম (নিচে দেখুন) | ৫০ MB | Nightly, release |
| Release binary (Linux) | M1-এর baseline + ২০% | `main`-এর চেয়ে +১০% | PR `size-check` |
| Frontend asset (Vite build) | M1-এর baseline + ২০% | `main`-এর চেয়ে +১০% | PR `size-check` |

- Tauri-র প্রত্যাশিত size সীমার অনেক নিচে, মোটামুটি ৫–১৫ MB। **ব্যতিক্রম AppImage**: এটা WebKitGTK আর তার library-গুলো সাথে নেয়, তাই ৭০ MB বা তার বেশি হতে পারে। M1 প্রতিটা installer মাপে। Bundle করা library ছাঁটার পরেও AppImage ৬০ MB-এর বেশি থাকলে ADR-এ সেটা **শুধু AppImage-এর জন্য PERF-09-এর জানা ব্যতিক্রম** হিসেবে লেখা হয়। `.exe`, `.dmg`, `.deb` আর `.rpm` সব অবস্থাতেই ৬০ MB-এর নিচে থাকতে হবে।
- AppImage-এ GStreamer media framework bundle করা হয় না। GitHeddle কোনো media চালায় না।
- Release profile link-time optimisation, একটা codegen unit আর stripped symbol ব্যবহার করে। Panic abort না করে unwind করে, যাতে job runner প্রতিটা repo-র জন্য crash হওয়া job জানাতে পারে।
- প্রতিটা job summary-তে বর্তমান size, budget আর `main`-এর তুলনায় পরিবর্তনের একটা table থাকে, তাই owner log না খুলেই বৃদ্ধি দেখতে পান।

## ১২. Release checklist

Release-এর `verify` job একটা template থেকে "Release vX.Y.Z" নামে একটা GitHub issue খোলে, যাতে এই checklist থাকে। প্রতিটা box tick হলে তবেই release publish হয়।

1. এই release-এর roadmap-এর প্রতিটা item বন্ধ, আর release commit-এর nightly আর সর্বশেষ weekly run সবুজ।
2. "Release vX.Y.Z" pull request merge হয়েছে: প্রতিটা manifest-এ version বাড়ানো, আর দুটো changelog file চূড়ান্ত।
3. Owner `main`-এ `vX.Y.Z` tag তৈরি করেন, GitHub web UI-তে বা `git tag` দিয়ে, আর push করেন।
4. Owner workflow run page-এ `release` environment অনুমোদন করেন।
5. CI §৪.৫-এর ১–৬ ধাপ শেষ করে। Draft release-এ এই release-এর সব file (§৬.২) আছে, আর `size-gate` ও `smoke` সবুজ।
6. **Windows (owner-এর machine):** `.exe` download করুন, admin অধিকার ছাড়া install করুন, ছোট flow-টা চালান: reference workspace খুলুন, dashboard, একটা test repo-তে commit আর push, ২টা repo-তে Start Task, test repo-গুলোতে pull request তৈরি।
7. **macOS manual smoke** একটা আসল Mac-এ (কোনো সহকর্মীর বা ভাড়া করা; M10-এর আগে ব্যবস্থা করে রাখুন)। Apple Silicon বাধ্যতামূলক; Intel পাওয়া গেলে সেটাতেও (CI আগেই Intel-এ smoke test করে):
   1. `.dmg` খুলে app-টা Applications-এ টেনে আনুন।
   2. প্রথমবার খোলা: "could not verify" বার্তা আসে, আর [install guide](../guides/install.bn.md)-এর "Open Anyway" পথে, ঠিক যেভাবে লেখা আছে সেভাবে, app খোলে। PLAT-11 না হওয়া পর্যন্ত প্রতিটা release-এ এটাই প্রত্যাশিত। v0.2 থেকে, update-এর পরে: বড়জোর একবার Keychain-এর "Always Allow" প্রশ্ন, আর কোনো Gatekeeper বার্তা নয়।
   3. First run Homebrew-এর `git` খুঁজে পায় (login-shell `PATH`, §৭.২)।
   4. Device flow দিয়ে GitHub sign-in; token Keychain-এ save হয় (Keychain Access-এ দেখা যায়), আর restart-এর পরে আবার sign-in না করেও app কাজ করে।
   5. ৩০টা fixture repo-র একটা workspace খুলুন; dashboard PERF-02-এর সময়ের মধ্যে ভরে যায়।
   6. Shortcut-এ ⌘ ব্যবহার হয় (PLAT-05), আর text field-এ ⌘C, ⌘V আর ⌘Z কাজ করে; macOS light আর dark-এর মধ্যে বদলালে app-ও বদলায় (PLAT-06)।
   7. Changes screen: একটা test repo-তে diff, stage, commit আর push।
   8. একটা conflict তৈরি করুন, merge editor-এ resolve করুন, আর merge শেষ করুন।
   9. ২টা repo-তে একটা save করা pipeline চালান।
   10. একটা bulk action চলার সময় app বন্ধ করুন; পরের বার চালু হলে app প্রভাবিত repo-গুলো দেখায় (PRD §৯ Reliability)।
   11. v0.2 থেকে: আগের release install করুন, তারপর সেটাকে এই release-এ update হতে দিন।
   12. শুধু বড়-ছোট হাতের অক্ষরে আলাদা file-এর নাম, আর CRLF line ending-ওয়ালা একটা file, Changes-এ ঠিকভাবে দেখায় (PLAT-03)।
   13. Changes list, একটা action flow আর merge editor-এর checkbox-এর উপর একটা ছোট VoiceOver pass (UX-08)।
8. **Linux:** Ubuntu 22.04-এ CI-র `install-smoke` আর L6 `tauri-driver` E2E job, আর সাপ্তাহিক Ubuntu 24.04 ও Fedora run এটা দেখে। Linux-এ কোনো manual smoke বাধ্যতামূলক না। Linux hardware হাতে থাকলে একটা Orca screen reader pass-ও করা হয়।
9. **Windows-এ screen reader:** owner-এর machine-এ ধাপ ৭.১৩-এর মতো একই screen-গুলোর উপর একটা ছোট NVDA pass।
10. [Security release checklist](security.bn.md) §১১ release issue-তে tick করা।
11. [v0.1 acceptance checklist](test-strategy.bn.md) §১৪ tick করা (v0.1-এর জন্য; পরের release-এ এর যে item-গুলো এখনো খাটে সেগুলো)।
12. ফলাফল release issue-তে লিখে রাখুন, কোনো সতর্কবার্তার dialog এলে তার screenshot সহ।
13. Draft release-এ **Publish** চাপুন। v0.2 থেকে দেখুন যে v0.2.x install update অফার করছে।
14. ৪৮ ঘণ্টা issue-গুলোর দিকে নজর রাখুন। গুরুতর bug ঠিক হয় একটা patch release `vX.Y.(Z+1)`-এ।

**খারাপ release ফিরিয়ে নেওয়া:** GitHub-এ খারাপ release-টাকে আবার draft বা pre-release করে দিন। তখন `latest` আবার আগের release দেখায়, তাই আর কোনো install সেটায় update হয় না। যেগুলো আগেই update হয়ে গেছে, সেগুলো fix পাবে পরের patch release-এ, কারণ updater কখনো ছোট version install করে না।

## ১৩. CI-তে secret

| Secret | Environment | কে ব্যবহার করে | কবে থেকে |
|---|---|---|---|
| `GITHUB_LIVE_TOKEN` (fine-grained token, শুধু একটা sandbox repository-তে access) | `github-live` | Nightly-র `live-contract` job | M9 |
| `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | `release` | Updater signature | M15 (v0.2) |
| `APPLE_CERTIFICATE` (base64 `.p12`), `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY` | `release` | macOS Developer ID signing | শুধু PLAT-11 হলে (ঠিক করা নেই) |
| `APPLE_API_KEY`, `APPLE_API_ISSUER`, `APPLE_API_KEY_PATH`-এর content (App Store Connect API key) | `release` | Notarisation | শুধু PLAT-11 হলে (ঠিক করা নেই) |
| `SIGNPATH_API_TOKEN`, সাথে organisation আর project ID variable হিসেবে | `release` | Windows signing | M15 (v0.2) |
| `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE` | `release` | `SHA256SUMS` sign করা | M15 (v0.2) |

নিয়ম:

1. Signing secret শুধু `release` environment-এ থাকে। সেই environment শুধু `v*`-এর সাথে মেলে এমন tag অনুমতি দেয়, আর প্রতিটা run-এ owner-এর অনুমোদন চায়।
2. **Schedule করা run-এর একমাত্র ব্যতিক্রম** হলো `github-live` environment। এটা শুধু `main`-এর schedule করা run নেয় (কোনো pull request বা অন্য branch না), আর এর token শুধু sandbox repository-তে পৌঁছাতে পারে। ওই job ছাড়া PR, nightly আর weekly workflow কোনো secret পায় না।
3. `pull_request_target` ব্যবহার হয় না। Fork থেকে আসা pull request শুধু read-only অনুমতিতে চলে, আর কখনো কোনো environment-এ পৌঁছায় না।
4. প্রতিটা third-party action একটা commit SHA-তে pin করা (§২), তাই কোনো action-এর update review করা pull request ছাড়া secret পড়তে পারে না।
5. কোনো ধাপ secret print করে না। File ধরনের secret (`.p12`, API key) runner-এর temp folder-এ লেখা হয় আর job শেষে মুছে ফেলা হয়।
6. Secret কখনো issue, pull request বা Claude Code session-এ paste করা হয় না। Claude Code session workflow লেখার সময় secret-এর শুধু নাম উল্লেখ করে।
7. Apple, SignPath আর sandbox-এর token বছরে একবার বদলান, আর ফাঁস হওয়ার সন্দেহ হলে সাথে সাথে। ধাপগুলো [Security](security.bn.md)-এ আছে।

## ১৪. Owner বনাম CI

### ১৪.১ কে কী করেন

| কাজ | Owner হাতে | CI |
|---|---|---|
| ৩টা OS-এ build, test আর package | — | প্রতিটা pull request, nightly, weekly আর release |
| Rust, Node, Xcode বা SDK install | দরকার নেই | Runner-এ আছে |
| কোনো pull request-এর installer চালিয়ে দেখা | `bundle` label দেন, download করেন, demo flow চালান | Installer build করে |
| Pull request review আর merge | প্রমাণসহ acceptance checklist tick করেন, তারপর নিজে merge করেন | Required check |
| Release run অনুমোদন | হ্যাঁ (এক click) | অনুমোদনের অপেক্ষা করে |
| Release tag তৈরি | হ্যাঁ | যাচাই করে |
| Windows build test | হ্যাঁ, নিজের machine-এ (§১২ ধাপ ৬) | Install smoke |
| macOS build test | হ্যাঁ, ধার করা বা ভাড়া করা Mac-এ (§১২ ধাপ ৭) | Install smoke, Intel smoke |
| Linux build test | বাধ্যতামূলক না | E2E আর install smoke |
| Release publish | হ্যাঁ (এক click) | — |
| একবারের কাজ: SignPath, GPG key, updater key, sandbox token, secret (Apple Developer শুধু PLAT-11 নেওয়া হলে) | হ্যাঁ | — |
| Nightly failure ঠিক করা | Claude Code-কে বলেন, pull request review করেন | Issue খোলে |

### ১৪.২ একবারের GitHub setting (M0)

M0-এর সময় owner repository-র setting-এ একবার এগুলো ঠিক করেন:

1. **`main`-এ branch protection:** পরিবর্তন শুধু pull request দিয়ে, তবে owner (repository admin) নিয়ম এড়িয়ে সরাসরি push করতে পারেন, যেমন ডকুমেন্টের ছোট সংশোধনের জন্য। Claude Code-এর session তবুও সবসময় একটা branch-এ কাজ করে pull request খোলে; §৪.১-এর required check সবুজ হতে হবে; কোনো approval বাধ্যতামূলক না, কারণ GitHub একা maintainer-এর নিজের approval গোনে না। Owner-এর review হলো pull request-এ tick করা acceptance checklist, আর owner নিজে merge করেন। শুধু squash merge।
2. **Tag ruleset:** `v*`-এর সাথে মেলে এমন tag শুধু owner তৈরি, সরানো বা মুছতে পারেন।
3. **Environment:** `release` (শুধু `v*` tag, owner required reviewer) আর `github-live` (শুধু `main`-এর schedule করা run)।
4. **Private vulnerability reporting** চালু ([SECURITY.bn.md](../../SECURITY.bn.md) দেখুন)।
5. **Push protection সহ secret scanning** চালু।
6. **Dependabot alert** চালু (update-এর প্রস্তাব দেয় Renovate)।
7. `bundle`, `perf`, `tests-changed`, `nightly-failure`, `perf-regression` আর `flaky` label তৈরি।

## ১৫. Release-এর ঝুঁকি

| ঝুঁকি | প্রতিকার |
|---|---|
| AppImage WebKitGTK সাথে নেয় বলে ৬০ MB ছাড়িয়ে যায় | M1-এ মাপা; bundle করা library ছাঁটা; না হলে ADR-এ শুধু AppImage-এর জন্য PERF-09 ব্যতিক্রম লেখা (§১১) |
| Manual smoke-এর জন্য কোনো Mac নেই, তাই release আটকে যায় (PLAT-04) | M10-এর আগে সহকর্মীর Mac বা ভাড়া করা Mac ঠিক করে রাখা; ততদিন CI-র install smoke দুটো architecture-ই দেখে |
| macOS 13.0–13.2-এর user ভাঙা UI পান | চালু হওয়ার সময়ের WebKit check একটা পরিষ্কার "macOS update করুন" message দেখায় (§৭.২); download page-এ লেখা থাকে macOS 13.3 বা নতুন |
| SignPath-এর অনুমোদনে দেরি বা প্রত্যাখ্যান | v0.1-এর ঠিক পরে আবেদন; ৬ সপ্তাহ পরে Certum বিকল্প; ততদিন পরিষ্কার download note সহ unsigned (PRD §১৩) |
| Updater key হারানো বা ফাঁস হওয়া | দুটো offline backup, আলাদা password, plain file মুছে ফেলা, বদলানোর ধাপ (§১০.২) |
| Intel Mac সমর্থন ক্ষীণ হয়ে আসছে: Rust `x86_64-apple-darwin`-কে tier 2-তে নামিয়েছে, আর GitHub Intel macOS image বন্ধ করবে | PRD যতদিন চায় Intel target রাখা; runner বন্ধের ঘোষণায় নজর রাখা; কোনো Intel runner না থাকলে শুধু cross-build, আর release note-এ সেটা বলা |
| Runner image update build ভেঙে দেয় | Pin করা image label; image বদল আসে Renovate pull request হিসেবে, আর nightly pass করতে হয় |
| Windows 10-এ WebView2 নেই বা বন্ধ | Download bootstrapper; বন্ধ machine-এর জন্য first-run help; diagnostics-এ version দেখানো |
| WebKitGTK-এর পার্থক্য (NVIDIA বা Wayland-এ ফাঁকা window, 22.04-এ পুরনো engine) | প্রতি রাতে 22.04-এ আর প্রতি সপ্তাহে 24.04-এ E2E; DMABUF workaround (§৭.৩); CSS সমর্থিত baseline-এর মধ্যে রাখা |
| Gatekeeper-এর বার্তা দেখে macOS user পিছিয়ে যান, বা "Open Anyway" খুঁজে পান না | Download page আর release note-এ [install guide](../guides/install.bn.md)-এর link থাকে, macOS-এর প্রতিটা version-এর জন্য হুবহু ধাপসহ; macOS smoke guide-টা অক্ষরে অক্ষরে মেনে চলে; আসল সমাধান হিসেবে PLAT-11 (notarisation) খোলা থাকে |
| macOS-এ update-এর পরে ad-hoc signature বদলায়, আর Keychain token-এর জন্য আবার অনুমতি চায় | Install guide একবারের "Always Allow" ব্যাখ্যা করে; প্রশ্নের উত্তর দেওয়া না গেলে app fail না করে user-কে আবার sign in করতে বলে |
| Notarisation (PLAT-11 নেওয়ার পরে) ধীর, বা Apple-এর service বন্ধ | Release draft থাকে; শুধু fail করা job আবার চালানো |
| বিষাক্ত cache বা আপোস করা action release-এ ঢুকে পড়ে | Cache ছাড়া পরিষ্কার release build; SHA-তে pin করা action; build provenance attestation |
| `github-live`-এর sandbox token ফাঁস হয় | এটা শুধু sandbox repository-তে পৌঁছাতে পারে; শুধু `main`-এর schedule করা run; বছরে একবার বদলানো |
| Signed build-ও শুরুতে SmartScreen দেখায় | Certificate-এর সুনাম তৈরি হওয়ার সময় এটা প্রত্যাশিত; download note-এ ব্যাখ্যা করা |
| একটা ভাঙা release auto-update দিয়ে ছড়িয়ে পড়ে | Smoke test-এর পরে publish হাতে হয়; release-কে আবার draft করে ফিরিয়ে নেওয়া (§১২) |

## ১৬. পরিবর্তনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ৩ নভেম্বর ২০২৬ | Planning panel-এর (Agent 2) প্রথম খসড়া, panel-এর review-এর রায়গুলো বসানো: CI matrix, চাইলে চালানো আর সাপ্তাহিক job, `github-live` environment, macOS 13.3-এর নিম্নসীমা, v0.1-এ ৬টা installer, ৫০ MB warning, key-এর হেফাজত, GitHub setting। |
| 0.2 | ৩ নভেম্বর ২০২৬ | আপাতত কোনো Apple Developer account নেই: PLAT-11 না হওয়া পর্যন্ত প্রতিটা release-এ macOS ad-hoc signed থাকে; প্রতিটা system-এর সতর্কবার্তা পার হয়ে কীভাবে app খুলতে হয়, তা install guide (PLAT-12) ব্যাখ্যা করে; Apple-এর secret আর নাম লেখানো M15 থেকে সরানো হয়েছে। |
