# GitHeddle — Build and Release

**Bangla version:** [build-and-release.bn.md](build-and-release.bn.md)

| | |
|---|---|
| **Document** | Build and Release: toolchain, CI, packaging, signing, updates and release process |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. Items marked "verify at M0" must be checked against current tool versions before the first workflow is written |

**Related documents:** [PRD](../product/PRD.en.md) · [ADR 0001: Tech stack](../decisions/0001-tech-stack.en.md) · [Architecture](../architecture/architecture.en.md) · [Test strategy](test-strategy.en.md) · [Security](security.en.md) · [UI architecture](../design/ui-architecture.en.md) · [AI development workflow](../process/ai-development-workflow.en.md) · [Roadmap](../plan/roadmap.en.md) · [Contributing](../../CONTRIBUTING.md)

> This file and its Bangla version, [build-and-release.bn.md](build-and-release.bn.md), carry the same content. When one changes, update the other in the same pull request.

---

## 1. Purpose and principles

This document says how GitHeddle is built, tested in CI, packaged, signed, updated and released on Windows, macOS and Linux. It serves PLAT-01 to PLAT-10, PERF-09 and the release plan in PRD §12. The test levels (L1–L7) named here are defined in the [Test strategy](test-strategy.en.md).

Principles:

1. **Everything builds in GitHub Actions.** The owner's machine does not need Rust, Node, Xcode or any SDK. The owner steers, reviews pull requests, downloads artifacts and tests them by hand. A local build is allowed, never required.
2. **Same inputs, same output.** Every tool version is pinned (§2). A build from a given commit is repeatable.
3. **Three systems from day one.** Every pull request is tested on Windows, macOS and Linux (PLAT-03, PLAT-04, PRD §13).
4. **Gates, not reminders.** Budgets (size, start time, memory) and rules (both document languages, terminology) are CI checks that fail, not notes in a wiki.
5. **The owner checks results by reading CI output.** Each workflow writes a short job summary table on its run page. Section 14 says what the owner does by hand.

## 2. Toolchain pinning

Don't write exact versions in this document. At M0, pin the latest stable version of each tool, then let Renovate propose updates.

| Tool | Where it is pinned | Rule |
|---|---|---|
| Rust | `rust-toolchain.toml` in the repo root: an exact stable version (not just `stable`), components `rustfmt` and `clippy`, and the targets listed in §6 | Toolchain bumps arrive as their own pull request and must pass the full nightly matrix before merge |
| Rust dependencies | `Cargo.lock`, committed; CI builds with `--locked` | Renovate groups minor updates weekly |
| Node.js | `.node-version` file (LTS line) | Used by `actions/setup-node` |
| pnpm | `packageManager` field in the root `package.json` | CI installs with `pnpm/action-setup`; installs use `--frozen-lockfile`; install scripts are blocked except an allow-list |
| Tauri CLI | `@tauri-apps/cli` as a dev dependency in the lockfile | Tauri crates and the CLI move together in one pull request |
| Cargo tools (`cargo-nextest`, `cargo-deny`, `cargo-audit`, `cargo-mutants`, `tauri-driver`, `sccache`) | Explicit versions in the workflow, installed as prebuilt binaries with `taiki-e/install-action` | Never `cargo install` from source in CI (slow) |
| Playwright | Version in the lockfile; browsers installed by that version | Browser cache keyed on that version |
| Git 2.30 (oldest supported, PRD §9) | Exact 2.30.x version in the workflow | Windows: the MinGit 2.30.x portable release from Git for Windows. macOS and Linux: built from source once and cached (§3.2) |
| GitHub Actions | Each third-party action pinned to a full commit SHA, with the version tag in a comment | Renovate updates the SHA |
| Runner images | Explicit labels (§3), never `*-latest` for build jobs | Image changes arrive as a pull request |

**Verify at M0:** the current Rust stable, Node LTS, pnpm major, Tauri 2.x minor, and that `taiki-e/install-action` still ships prebuilt `tauri-driver`.

## 3. Runner matrix and caching

### 3.1 Runners

The repository is public, so the standard GitHub-hosted runners below are free. **Verify at M0:** the exact labels, and that the ARM runners are still free for public repositories.

| Runner label | Arch | Used for | Every PR | On demand (label) | Nightly | Weekly | Release |
|---|---|---|---|---|---|---|---|
| `ubuntu-22.04` | x64 | Lint, L1–L5, Linux bundles, L6 `tauri-driver` E2E, fuzzing | Yes | Yes | Yes | — | Yes (builds) |
| `windows-2025` (or the newest pinned Windows image) | x64 | L1/L2, NSIS builds for x64 and ARM64 (cross-compiled), L6 E2E | Yes | Yes | Yes | — | Yes (builds) |
| `macos-15` | ARM64 | L1/L2, L5 in Chromium and WebKit, `.dmg` builds for `aarch64` and `x86_64` (cross-compiled) | Yes | Yes | Yes | — | Yes (builds) |
| `windows-11-arm` | ARM64 | L1/L2 smoke and install smoke of the ARM64 build | — | — | — | Yes | Smoke |
| `macos-15-intel` | x64 | L1/L2 smoke and launch smoke of the Intel build, while GitHub offers the runner | — | — | — | Yes | Smoke |
| `ubuntu-24.04` | x64 | L6 E2E on a newer WebKitGTK; Fedora container for the `.rpm` install test | — | — | — | Yes | Smoke |
| `ubuntu-24.04-arm` | ARM64 | Linux ARM64 build (PLAT-10) | — | — | — | Later | Later |

The Linux release build runs on `ubuntu-22.04` on purpose: the oldest supported distribution sets the glibc floor (§7.3).

### 3.2 Caching

| Cache | Tool | Key | Notes |
|---|---|---|---|
| Rust compile outputs | `sccache` with the GitHub Actions cache backend (`mozilla-actions/sccache-action`) | OS, arch, Rust version | Used in PR, nightly and weekly runs |
| Cargo registry and git deps | `Swatinem/rust-cache` with target caching off | OS, `Cargo.lock` hash | Avoids re-downloading crates |
| pnpm store | `actions/setup-node` with `cache: pnpm` | OS, `pnpm-lock.yaml` hash | |
| Playwright browsers | `actions/cache` | OS, Playwright version | |
| Git 2.30 | `actions/cache` | OS, arch, exact 2.30.x version | MinGit download on Windows; source build on macOS and Linux |
| Reference workspaces WS-30 and WS-50 | `actions/cache` | OS, hash of the fixture builder code | Built by the fixture builders (Rust); rebuilt whenever the builders change |
| Other fixture repos | Not cached | — | The fixture builders (Rust) in `tests/fixtures` make them fresh in every run, so tests never depend on stale state |

Rules:

- **Release builds use no build cache.** They compile clean, so a cache written by another run can never end up inside a shipped installer.
- GitHub keeps 10 GB of cache per repository and evicts the oldest. If PR checks get slow, look at cache hit rates in the job summary first.
- Target time for PR checks: under 15 minutes on a warm cache. If they grow beyond 20 minutes, move the slowest jobs to nightly in a reviewed pull request.

## 4. CI workflows

There are five workflows and one shared reusable workflow. They are described here as tables. The YAML is written in M0 from this section.

| Workflow file | Trigger | Purpose |
|---|---|---|
| `.github/workflows/_test.yml` | Called by the others | Shared test jobs, with the OS and git-version matrix as inputs |
| `.github/workflows/pr.yml` | `pull_request` to `main`, push to `main`; label jobs when a label is added | Checks that gate every merge (§4.1), plus the on-demand `bundle` and `perf` jobs (§4.2) |
| `.github/workflows/nightly.yml` | Daily schedule, plus manual run | Full matrix, chaos suite, bundles, E2E, performance budgets, fuzzing, live GitHub contract (§4.3) |
| `.github/workflows/weekly.yml` | Weekly schedule, plus manual run | Extra platforms and mutation testing (§4.4) |
| `.github/workflows/screenshot-baseline.yml` | Manual run only | Makes new Playwright screenshot baselines per OS and engine, as a pull request for the owner to review (test strategy §8) |
| `.github/workflows/release.yml` | Push of a tag `v*.*.*` | Build, sign, check and draft a GitHub Release (§4.5) |

**Permissions.** Every workflow defaults to `permissions: contents: read`. Jobs get more only where they need it:

| Job | Extra permissions | Why |
|---|---|---|
| Release `build` (creates the draft release and uploads files) | `contents: write` | Write the release |
| Release `checksums` (build provenance attestations) | `id-token: write`, `attestations: write` | Sign attestations with GitHub's OIDC token |
| Nightly and weekly issue reporters | `issues: write` | Open or update the failure issue |
| PR `test-report` | `pull-requests: write` | Post the test-change report as a comment |

PR workflows use `concurrency`, so a new push cancels the older run on the same pull request.

### 4.1 PR checks (`pr.yml`)

Every job marked "Required" is a required status check in branch protection on `main`. Branch protection requires green checks, not approvals (§14.2).

| Job | Runner(s) | What it does | Gate | Required |
|---|---|---|---|---|
| `docs-pair` | `ubuntu-22.04` | For each changed `*.en.md`, the matching `*.bn.md` also changed in the same pull request, and the reverse; the root community files (`README`, `CONTRIBUTING`, `SECURITY`, `CODE_OF_CONDUCT`) pair `<NAME>.md` with `<NAME>.bn.md`; each file links to its pair at the top | Fails on a missing or unchanged pair | Yes |
| `terminology` | `ubuntu-22.04` | Searches docs, UI strings and code for "merge request" and the abbreviation "MR". Files that state the rule itself or record its history (`CLAUDE.md`, both `CONTRIBUTING` files, both files of this document, `docs/design/ui-architecture.*.md`, `docs/product/PRD.*.md`) are listed in an allow-list in `tools/` | Fails on any match outside the allow-list | Yes |
| `lint` | `ubuntu-22.04` | `rustfmt --check`, `cargo clippy -D warnings`, Biome, TypeScript `--noEmit`; regenerates `tauri-specta` bindings and fails if they differ from the committed ones; the skip lint (`#[ignore]`, `.skip`, `.only`, `test.fixme` without an issue number) | Fails on any warning, drift or unexplained skip | Yes |
| `supply-chain` | `ubuntu-22.04` | `cargo-deny` (advisories, licences compatible with GPL-3.0, bans, sources), `cargo-audit`, frozen pnpm lockfile | Fails on a new advisory or a disallowed licence | Yes |
| `test-rust` | `ubuntu-22.04`, `windows-2025`, `macos-15` with the latest git; plus `ubuntu-22.04` with git 2.30 | L1 and L2: `cargo nextest` over all crates, with fixture repos made by the fixture builders | Any failure | Yes |
| `test-contract` | `ubuntu-22.04` | L3: Tauri commands and events through the mock runtime; records the IPC transcripts | Any failure | Yes |
| `test-ui` | `ubuntu-22.04` | L4: Vitest and Testing Library | Any failure | Yes |
| `test-browser` | `ubuntu-22.04`, `macos-15` | L5: Playwright on the Vite build with mocked IPC, in Chromium and WebKit; `@axe-core/playwright`; screenshot comparison. Uploads the Playwright HTML report and the screenshots as artifacts | Any failure | Yes |
| `bench` | `ubuntu-22.04` | `criterion` benchmarks compared with the `main` baseline | Fails on a slowdown over 10% beyond noise | Yes |
| `test-report` | `ubuntu-22.04` | The test-change report (tests added, changed, removed), the coverage ratchet (test strategy §8), and the `tests-changed` label check | Fails if coverage drops more than allowed, or a test was removed without the "Tests changed" section | Yes |
| `build-shell` | 3 OSes | Compiles `apps/desktop/src-tauri` in release mode (no installer) | Fails if it doesn't compile on any OS | Yes |
| `size-check` | `ubuntu-22.04` | Measures the release binary and the built frontend assets against the budgets in §11 | Fails over budget | Yes |

How the owner checks: the pull request shows all required checks green. A red check links to a job summary that names the failing rule (for example "`docs/engineering/x.en.md` changed but `x.bn.md` did not").

### 4.2 On-demand jobs (pull request labels)

These are part of `pr.yml` and run only when the owner, or Claude Code with the owner's agreement, adds the label to a pull request. They run again on each new push while the label stays.

| Label | Job | Runner(s) | What it does |
|---|---|---|---|
| `bundle` | `bundle` | `windows-2025`, `macos-15`, `ubuntu-22.04` | Builds the unsigned installers for the current release scope (§6) from the pull request branch and uploads them as artifacts kept for 7 days, so the owner can run the demo flow in a real installed app |
| `perf` | `perf` | `windows-2025`, `macos-15`, `ubuntu-22.04` | Runs `tools/perf`: start time, RAM with WS-30 and installer size, compared with the last nightly. Reports only; the hard gate is nightly and release |

Use `bundle` when an item changes what the user sees or how the app starts. Use `perf` when an item touches start-up, the dashboard refresh, the diff path or dependencies.

### 4.3 Nightly (`nightly.yml`)

Runs once a day on `main` and can be started by hand. It skips if `main` has no new commits since the last green nightly, except the live contract job, which always runs.

| Job | Runner(s) | What it does | Gate |
|---|---|---|---|
| `test-full` | `ubuntu-22.04`, `windows-2025`, `macos-15` × git 2.30 and latest | The whole L1–L5 suite, including the full L5 WebKit suite on macOS | Any failure |
| `chaos` | 3 OSes, latest git | The crash and chaos suite (test strategy §6) | Any failure |
| `bundle` | `windows-2025`, `macos-15`, `ubuntu-22.04` | Builds every installer for the current release scope (§6), unsigned; uploads them as artifacts kept for 14 days | Build failure |
| `install-smoke` | `windows-2025`, `macos-15`, `ubuntu-22.04` | Installs the bundle the way a user would (per-user NSIS, `.dmg` copy to Applications, `.deb` with `apt`, AppImage), launches it, waits for the window, quits, uninstalls. On Windows it also checks that nothing was written to machine-wide locations (PLAT-02) | Any step fails |
| `e2e` | `windows-2025`, `ubuntu-22.04` | L6 `tauri-driver` E2E flows against the built app | Any failure |
| `perf` | `windows-2025`, `macos-15`, `ubuntu-22.04` | `tools/perf`: cold and warm start (PERF-01), dashboard timing with WS-30 (PERF-02), RAM of the app plus webview processes with WS-30 (PERF-07), installer size (PERF-09), WS-50 scale run | Fails over a PRD budget; warns on a regression of more than 10% against the last green nightly |
| `fuzz` | `ubuntu-22.04` | `cargo-fuzz`, 30 minutes per target | Any crash |
| `audit` | `ubuntu-22.04` | `cargo-audit` against the latest advisory database (SC-02) | A new advisory |
| `live-contract` | `ubuntu-22.04` | The pull request flows against one sandbox repository on github.com, in the `github-live` environment (§13) | Any failure |

When the nightly fails, a step opens or updates one GitHub issue labelled `nightly-failure` (or `perf-regression`) with the link. The owner asks Claude Code to fix it from that issue.

### 4.4 Weekly (`weekly.yml`)

| Job | Runner(s) | What it does | Gate |
|---|---|---|---|
| `extra-platforms` | `windows-11-arm`, `macos-15-intel`, `ubuntu-24.04` (+ Fedora container) | L1 and L2 smoke with the latest git; install smoke of the matching bundle (ARM64 `.exe`, Intel `.dmg`, AppImage and `.deb` on 24.04, `.rpm` in Fedora from v0.2); L6 E2E on `ubuntu-24.04` | Any failure |
| `mutants` | `ubuntu-22.04` | `cargo-mutants` on the command guard, the pipeline state machine and the marker scan (test strategy §8) | Each surviving mutant opens an issue |

### 4.5 Release (`release.yml`)

Runs when a tag such as `v0.1.0` is pushed. Only the owner can create `v*` tags (§14.2). The build jobs use the `release` environment, which needs the owner's approval before it starts and holds the signing secrets (§13).

| Step | Job | What it does | Gate |
|---|---|---|---|
| 1 | `verify` | The tag is on `main`; it matches the version in every manifest (§8); both changelog files have a section for this version; opens the release issue (§12) | Stop on mismatch |
| 2 | `test` | Calls `_test.yml` with the nightly matrix plus the weekly extra platforms, and the chaos suite | Any failure |
| 3 | `build` | `tauri-action` per target in §6, clean build without caches; from v0.2 (M15) also Windows signing, macOS signing and notarisation, and updater signatures (§9, §10). Creates a **draft** GitHub Release and uploads the files | Build or signing failure |
| 4 | `size-gate` | Checks every installer against PERF-09 (§11) | Over 60 MB, except a recorded AppImage exception |
| 5 | `checksums` | Writes `SHA256SUMS` for all files; from v0.2 signs it with GPG; adds GitHub build provenance attestations | Failure |
| 6 | `smoke` | Downloads the draft files and runs `install-smoke` on every OS and arch, including the weekly extra platforms | Any failure |
| 7 | Manual | The owner works through the release issue (§12): the macOS manual smoke, the [security release checklist](security.en.md) §11 and the [v0.1 acceptance checklist](test-strategy.en.md) §14, then clicks **Publish** on the draft | Owner's decision |

Publishing is always by hand. `latest.json` (§10) only becomes visible to installed apps once the release is published and not marked as pre-release.

## 5. Implementation order

Each row can be given to a Claude Code session as one piece of work. Milestones and items are from the [Roadmap](../plan/roadmap.en.md).

| Milestone | Work | Done when (how the owner checks) |
|---|---|---|
| M0 | Pinning files (§2); `pr.yml` with every required job in §4.1 and the `bundle` label job (M0-06 packaging smoke); branch protection and the other GitHub settings in §14.2 | A test pull request with only a `.en.md` change fails `docs-pair`; a normal pull request goes green on 3 OSes; adding the `bundle` label produces 6 installers as artifacts |
| M1 | `perf` label job and `tools/perf`; `nightly.yml` with `bundle`, `perf`, `install-smoke` | The nightly run page shows a table of start time, RAM and installer size per OS |
| M2–M9 | The nightly jobs grow with the test suite: `chaos` from M5, `fuzz` from M2, `live-contract` from M9; `weekly.yml` once the first bundles exist | Each new job appears in the nightly summary and is green |
| M10 | `release.yml` (unsigned), `e2e`, release issue template, changelog files, `screenshot-baseline.yml` | A test tag `v0.1.0-rc.1` produces a draft release with every v0.1 file, and smoke passes |
| M15 (v0.2) | Windows signing, updater, `.rpm`, GPG-signed checksums. macOS stays ad-hoc signed (§9.1) | The Windows installer runs without the "unknown publisher" warning; macOS shows only the documented "Open Anyway" path; v0.2.0 updates itself from v0.1.x |

## 6. Build targets and package formats

### 6.1 Targets

| OS | Rust target | Built on | Package | PLAT |
|---|---|---|---|---|
| Windows x64 | `x86_64-pc-windows-msvc` | `windows-2025` | NSIS `.exe`, per user | PLAT-01, PLAT-02 |
| Windows ARM64 | `aarch64-pc-windows-msvc` | `windows-2025` (cross) | NSIS `.exe`, per user | PLAT-01, PLAT-02 |
| macOS Apple Silicon | `aarch64-apple-darwin` | `macos-15` | `.dmg` | PLAT-01, PLAT-02 |
| macOS Intel | `x86_64-apple-darwin` | `macos-15` (cross) | `.dmg` | PLAT-01, PLAT-02 |
| Linux x64 | `x86_64-unknown-linux-gnu` | `ubuntu-22.04` | AppImage, `.deb`, `.rpm` | PLAT-01, PLAT-02, PLAT-09 |
| Linux ARM64 | `aarch64-unknown-linux-gnu` | `ubuntu-24.04-arm` | AppImage, `.deb`, `.rpm` | PLAT-10 |

macOS ships two separate `.dmg` files rather than one universal build: each download is half the size, and a problem on one architecture is easier to isolate. MSI is not built, because it installs per machine and needs admin rights.

### 6.2 What each release ships

| Release | Files | Signing | Updates |
|---|---|---|---|
| **v0.1** | **6 installers:** Windows x64 and ARM64 `.exe`; macOS ARM64 and Intel `.dmg`; Linux x64 AppImage and `.deb`. Plus `SHA256SUMS` | Unsigned on Windows; macOS ad-hoc signed only (§9) | None; users download new versions by hand |
| **v0.2 (M15)** | v0.1 files plus Linux x64 `.rpm` (PLAT-09); updater bundles and `.sig` files; `latest.json` | Windows Authenticode (PLAT-08); macOS still ad-hoc signed until an Apple Developer account exists (PLAT-11); GPG-signed `SHA256SUMS` | `tauri-plugin-updater` (PLAT-07) |
| **v0.3 and later (M18)** | Linux ARM64 AppImage, `.deb`, `.rpm` (PLAT-10) | As v0.2 | As v0.2 |
| Not committed | winget, Homebrew cask, Flathub | — | Decide after v0.2 |

## 7. Platform notes

### 7.1 Windows: per-user install and WebView2

- NSIS is configured with `installMode: currentUser`. It installs under the user's local app data folder, writes only to the user's registry hive, and never asks for admin rights (PLAT-02). The nightly `install-smoke` checks this.
- **WebView2:** the installer uses the Evergreen **download bootstrapper** (`webviewInstallMode: downloadBootstrapper`). Windows 11 and up-to-date Windows 10 already have the runtime, so normally nothing is downloaded. If it is missing, the bootstrapper installs it for the current user, which needs no admin rights. The offline installer mode is not used: it adds over 100 MB and would break PERF-09.
- If WebView2 is blocked (some company machines disable it by policy), the app can't start. The download page and the first-run help explain this. The About dialog and diagnostics show the WebView2 version, so bug reports include it.
- Every `git` process starts with `CREATE_NO_WINDOW` so no console windows flash (see [Architecture](../architecture/architecture.en.md), `crates/platform`).
- Windows ARM64 is cross-compiled on the x64 runner and tested weekly on `windows-11-arm`.

### 7.2 macOS

- **The effective floor is macOS 13.3 or newer**, because the UI needs WKWebView/Safari 16.4 or newer (Tailwind CSS v4's browser floor, see [UI architecture](../design/ui-architecture.en.md)). macOS 13.0–13.2 ship Safari 16.0–16.3.
- The bundle's minimum system version stays at 13.0, so the app can still open on 13.0–13.2. At start, before the main UI loads, the core checks the WebKit version. If it is older than 16.4, the app shows a plain native message that explains how to update macOS, instead of a broken UI.
- WKWebView comes with the system, so its engine version follows the macOS version and its Safari updates.
- Apps started from Finder don't get the shell's `PATH`. `crates/platform` resolves the login-shell `PATH` once so that Homebrew `git` and credential helpers are found. The macOS manual smoke tests this (§12).
- **No Apple Developer account for now.** Apple Silicon only runs signed code, so every macOS build is **ad-hoc signed** (signing identity `-`) and not notarised. This stays so until the owner decides to get an account (PLAT-11, no date). What it means for users, and how they open the app anyway, is in the [install guide](../guides/install.en.md) (PLAT-12):
  - The first open after downloading shows Gatekeeper's "could not verify" message. The user opens the app through System Settings → Privacy & Security → "Open Anyway". This is needed once per download, not on every start.
  - If macOS instead says the app "is damaged", the quarantine flag is removed with one Terminal command given in the guide.
  - An ad-hoc signature changes with every build, so after an update macOS may ask once more for permission to read GitHeddle's Keychain item. The user clicks "Always Allow". The guide says so, and the macOS smoke checks it from v0.2.
  - Updates installed by the app's own updater are downloaded by the app, not the browser, so they don't get the quarantine flag and don't show the Gatekeeper message again. **Verify at M15.**

### 7.3 Linux: minimums

| Item | Minimum | Why |
|---|---|---|
| glibc | The version on Ubuntu 22.04 (2.35) | Release builds run on `ubuntu-22.04`, so the binary needs nothing newer; Fedora 39 and newer have a newer glibc |
| WebKitGTK | `webkit2gtk-4.1` (the 4.1 API used by Tauri 2) | Available on Ubuntu 22.04 and Fedora 39 and newer |
| GTK | GTK 3 | Required by Tauri 2 on Linux |
| Keychain | A running Secret Service (GNOME Keyring, KWallet's Secret Service API, KeePassXC) | If none is running, the token is kept for the session only, never in plain text (see [Security](security.en.md)) |
| AppImage | FUSE 2 | Ubuntu 24.04 doesn't install it by default; the download notes say to install `libfuse2t64` or run with `--appimage-extract-and-run` |

- The `.deb` declares its dependencies on `libwebkit2gtk-4.1-0` and `libgtk-3-0`. The `.rpm` declares `webkit2gtk4.1`.
- Known WebKitGTK issue: a blank window on some NVIDIA and Wayland setups. The app sets `WEBKIT_DISABLE_DMABUF_RENDERER=1` when it detects that case, and the help explains how to set it by hand.
- E2E runs nightly on `ubuntu-22.04` and weekly on `ubuntu-24.04`, so both an older and a newer WebKitGTK are covered.

## 8. Versioning and changelog

- **SemVer**, with tags `vMAJOR.MINOR.PATCH`, for example `v0.1.0`. Before 1.0, the minor number follows the PRD release plan (v0.1, v0.2, v0.3) and the patch number is for fixes.
- Release candidates are `v0.1.0-rc.1`, published as GitHub pre-releases. The updater ignores pre-releases.
- **One version, many manifests.** The version appears in the Cargo workspace, `apps/desktop/src-tauri/tauri.conf.json` and `apps/desktop/package.json`. A script in `tools/` checks they agree, and the release `verify` job runs it.
- A version is bumped in its own pull request named "Release vX.Y.Z", which also finalises the changelog.
- **Changelog:** `CHANGELOG.en.md` and `CHANGELOG.bn.md` in the repository root, in the "Keep a Changelog" style (Added, Changed, Fixed, Removed, Security), with an "Unreleased" section at the top. Any pull request that changes what a user sees adds a line to both files, with the requirement ID where one applies.
- The GitHub Release text and the updater's "what changed" notes (PLAT-07) are copied from the English section, because the UI is English in v0.1 (PRD §14 Q7). The release links to the Bangla section.

## 9. Signing and notarisation

### 9.1 Plan

| Platform | v0.1 | v0.2, M15 (PLAT-08) |
|---|---|---|
| Windows | Unsigned. The [install guide](../guides/install.en.md) explains SmartScreen: "More info", then "Run anyway" | Authenticode through **SignPath Foundation** (free for open-source projects). Fallback: a **Certum open-source code signing** certificate |
| macOS | Ad-hoc signed, not notarised (§7.2). The install guide explains the "Open Anyway" path | **Unchanged: ad-hoc signed.** Developer ID signing and notarisation come only when the owner gets an Apple Developer account (PLAT-11). Then: a **Developer ID Application** certificate, hardened runtime, notarised with `notarytool` using an App Store Connect API key, ticket stapled to the app and `.dmg` |
| Linux | `SHA256SUMS` published | `SHA256SUMS` signed with the project GPG key; the public key is linked from the README |

### 9.2 How Windows signing fits the build

The updater signature (§10) must be made over the final, Authenticode-signed installer. The order is therefore:

1. Tauri builds the app `.exe`.
2. Tauri's `signCommand` hook sends each binary (app, uninstaller, then installer) to SignPath and waits for the signed file.
3. Tauri writes the updater `.sig` for the signed installer.

SignPath checks that the files come from a GitHub Actions run of this repository, and the owner approves each signing request in the SignPath dashboard. **Verify at M15:** whether SignPath's submit-and-wait works from `signCommand`, or whether signing must move to a separate job that re-creates the updater signatures afterwards.

### 9.3 Timeline

| When | Action | Who |
|---|---|---|
| Not scheduled | Enrol in the Apple Developer Program (individual, paid yearly) only when the owner decides to; until then macOS stays ad-hoc signed (PLAT-11) | Owner |
| M10 | Write the [install guide](../guides/install.en.md) checks into the release notes template (PLAT-12) | Claude Code, owner checks |
| M10, right after v0.1 is public | Apply to SignPath Foundation; they need a public repository with a release | Owner |
| M10 | Create the GPG key; publish its public key | Owner |
| Start of M15 (v0.2) | Create the updater key (§10.2); add the signing secrets (§13); a test tag `v0.2.0-rc.1` checks the whole signed path | Owner, then CI |
| If SignPath is not approved within 6 weeks | Order the Certum certificate. Its cloud signing may need a manual step per release; document it in the checklist | Owner |

Note: even signed installers can show SmartScreen warnings at first, until the certificate builds a reputation. The download notes say so.

## 10. Updater (v0.2, M15)

### 10.1 Design

| Part | Decision |
|---|---|
| Plugin | `tauri-plugin-updater`, with `createUpdaterArtifacts` turned on in the bundle config |
| Endpoint | `https://github.com/dev-taosif-net/GitHeddle/releases/latest/download/latest.json`, a static file on GitHub Releases (PRD §14 Q6) |
| Manifest | `latest.json` made by `tauri-action`: version, notes, date, and per platform (`windows-x86_64`, `windows-aarch64`, `darwin-aarch64`, `darwin-x86_64`, `linux-x86_64`) a download URL and signature |
| Signature | Each update file is signed with the project's minisign key; the public key is in `tauri.conf.json`. A file whose signature doesn't verify is refused and logged |
| When it checks | At start, then once every 24 hours with a timer, never by busy polling (PERF-07). A setting turns checks off. This is the only network call besides Git remotes and GitHub (PRD §9) |
| What the user sees | "Version X.Y.Z is available" with the notes; buttons "Install on restart" and "Later" |
| When it installs | Only on restart, and only when the job runner has no running job (PLAT-07, UPD-04). Paused pipeline runs are already saved in the journal; it is flushed to disk first, and they can be resumed after the update (PRD §9 Reliability). If a job is running, the install waits for the next restart |
| Windows | The NSIS update runs in passive mode, per user, without admin rights |
| Linux | AppImage updates itself. `.deb` and `.rpm` installs (the app checks whether it runs from an AppImage) only show a notice with a download link |
| Older versions | The plugin only installs a version higher than the running one |
| Pre-releases | Never offered; `latest` on GitHub skips them |

### 10.2 Key custody

1. The owner creates the key pair once with `npx @tauri-apps/cli signer generate`. This needs Node.js, but compiles nothing: it downloads a prebuilt CLI. The key gets a strong password.
2. **Without Node on the owner's machine:** open a GitHub Codespace on the repository in the browser, run the same command there, download the key file directly into the password manager, then delete the Codespace. Nothing is installed locally.
3. The private key and its password are stored as two separate secrets in the `release` environment (§13).
4. **Two offline backups:** the key file in the owner's password manager, and a copy on an encrypted USB drive kept somewhere else. The password is kept apart from the key file.
5. **After the backups are made, the plain key file is deleted** from the machine or Codespace where it was created (and from the downloads folder and the recycle bin). It is never kept in plain form on the owner's everyday machine (UPD-05).
6. The private key is never committed, never pasted into a Claude Code session, and never printed in a log.
7. **If the key is lost:** installed apps can't verify any new update. Users must download and install the next version by hand. The release notes and README say so.
8. **If the key leaks:** remove the secret, create a new key, and ship a release signed with the old key that contains the new public key. Then publish a security notice (see [SECURITY.md](../../SECURITY.md)).

## 11. Size budget (PERF-09)

| Artifact | Hard limit | Warning | Checked in |
|---|---|---|---|
| Each installer (`.exe`, `.dmg`, `.deb`, `.rpm`) | 60 MB (PERF-09) | 50 MB | `perf` label job, nightly `perf`, release `size-gate` |
| AppImage | 60 MB, or a recorded exception (see below) | 50 MB | Nightly, release |
| Release binary (Linux) | Baseline at M1 + 20% | +10% against `main` | PR `size-check` |
| Frontend assets (Vite build) | Baseline at M1 + 20% | +10% against `main` | PR `size-check` |

- Expected sizes for Tauri are well under the limit, roughly 5–15 MB. The **AppImage is the exception**: it bundles WebKitGTK and its libraries and can reach 70 MB or more. M1 measures every installer. If the AppImage is still over 60 MB after the bundled libraries are stripped, it is recorded in the ADR as a **known PERF-09 exception for the AppImage only**. The `.exe`, `.dmg`, `.deb` and `.rpm` must stay under 60 MB in every case.
- The GStreamer media framework is not bundled into the AppImage. GitHeddle plays no media.
- The release profile uses link-time optimisation, one codegen unit and stripped symbols. Panics unwind rather than abort, so the job runner can report a crashed job per repo.
- Every job summary shows a table of current size, budget and change against `main`, so the owner sees growth without opening logs.

## 12. Release checklist

The release `verify` job opens a GitHub issue "Release vX.Y.Z" from a template with this checklist. The release is published only when every box is ticked.

1. Every roadmap item for this release is closed, and the nightly and the latest weekly run on the release commit are green.
2. The "Release vX.Y.Z" pull request is merged: version bumped in every manifest, and both changelog files finalised.
3. The owner creates the tag `vX.Y.Z` on `main`, in the GitHub web UI or with `git tag`, and pushes it.
4. The owner approves the `release` environment on the workflow run page.
5. CI finishes steps 1–6 of §4.5. The draft release lists every file for this release (§6.2), and `size-gate` and `smoke` are green.
6. **Windows (owner's machine):** download the `.exe`, install without admin rights, run the short flow: open the reference workspace, dashboard, commit and push to a test repo, Start Task on 2 repos, create pull requests on the test repos.
7. **macOS manual smoke** on a real Mac (a teammate's or a rented one; arrange access before M10). Apple Silicon is required; Intel if one is available (CI already smoke-tests Intel):
   1. Open the `.dmg` and drag the app to Applications.
   2. First open: the "could not verify" message appears, and the "Open Anyway" path in the [install guide](../guides/install.en.md) opens the app, step by step as written. Until PLAT-11 this is expected in every release. From v0.2, after an update: at most one Keychain "Always Allow" prompt, and no Gatekeeper message.
   3. First run finds a Homebrew `git` (login-shell `PATH`, §7.2).
   4. GitHub sign-in with the device flow; the token is saved in Keychain (Keychain Access shows it), and the app still works after a restart without signing in again.
   5. Open a workspace of 30 fixture repos; the dashboard fills within the PERF-02 times.
   6. Shortcuts use ⌘ (PLAT-05), and ⌘C, ⌘V and ⌘Z work in text fields; switching macOS between light and dark switches the app (PLAT-06).
   7. Changes screen: diff, stage, commit and push to a test repo.
   8. Create a conflict, resolve it in the merge editor, and complete the merge.
   9. Run a saved pipeline on 2 repos.
   10. Quit during a bulk action; on the next start the app shows the affected repos (PRD §9 Reliability).
   11. From v0.2: install the previous release, then let it update to this one.
   12. File names that differ only by case, and a file with CRLF line endings, show correctly in Changes (PLAT-03).
   13. A short VoiceOver pass over the Changes list, an action flow and the merge editor checkboxes (UX-08).
8. **Linux:** covered by the CI `install-smoke` and L6 `tauri-driver` E2E jobs on Ubuntu 22.04, and the weekly Ubuntu 24.04 and Fedora runs. No manual Linux smoke is required. If Linux hardware is available, an Orca screen-reader pass is done too.
9. **Screen readers on Windows:** a short NVDA pass on the owner's machine over the same screens as step 7.13.
10. The [security release checklist](security.en.md) §11 is ticked in the release issue.
11. The [v0.1 acceptance checklist](test-strategy.en.md) §14 is ticked (for v0.1; later releases use the same items that still apply).
12. Record the results in the release issue, with screenshots of any warning dialogs.
13. Click **Publish** on the draft release. From v0.2, check that a v0.2.x install offers the update.
14. Watch issues for 48 hours. A serious bug is fixed in a patch release `vX.Y.(Z+1)`.

**Rolling back a bad release:** change the bad release back to draft or pre-release on GitHub. `latest` then points to the previous release again, so no more installs update to it. Installs that already updated get the fix in the next patch release, because the updater never installs a lower version.

## 13. Secrets in CI

| Secret | Environment | Used by | Introduced |
|---|---|---|---|
| `GITHUB_LIVE_TOKEN` (fine-grained token, access to one sandbox repository only) | `github-live` | Nightly `live-contract` job | M9 |
| `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | `release` | Updater signatures | M15 (v0.2) |
| `APPLE_CERTIFICATE` (base64 `.p12`), `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY` | `release` | macOS Developer ID signing | Only with PLAT-11 (not scheduled) |
| `APPLE_API_KEY`, `APPLE_API_ISSUER`, `APPLE_API_KEY_PATH` content (App Store Connect API key) | `release` | Notarisation | Only with PLAT-11 (not scheduled) |
| `SIGNPATH_API_TOKEN`, plus organisation and project IDs as variables | `release` | Windows signing | M15 (v0.2) |
| `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE` | `release` | Signing `SHA256SUMS` | M15 (v0.2) |

Rules:

1. Signing secrets live only in the `release` environment. That environment allows only tags matching `v*` and needs the owner's approval for each run.
2. **The one exception for scheduled runs** is the `github-live` environment. It accepts only scheduled runs on `main` (no pull requests, no other branches), and its token can reach only the sandbox repository. Apart from that job, PR, nightly and weekly workflows get no secrets.
3. `pull_request_target` is not used. Pull requests from forks run with read-only permissions and never reach an environment.
4. Every third-party action is pinned to a commit SHA (§2), so an action's update can't read secrets without a reviewed pull request.
5. No step prints a secret. File-type secrets (`.p12`, API key) are written to the runner's temp folder and deleted at the end of the job.
6. Secrets are never pasted into issues, pull requests or Claude Code sessions. When a Claude Code session writes a workflow, it refers to secrets by name only.
7. Rotate the Apple, SignPath and sandbox tokens once a year, and immediately if a leak is suspected. The steps are in [Security](security.en.md).

## 14. Owner vs CI

### 14.1 Who does what

| Task | Owner by hand | CI |
|---|---|---|
| Build, test and package on 3 OSes | — | Every pull request, nightly, weekly and release |
| Install Rust, Node, Xcode or SDKs | Not needed | Runners have them |
| Try a pull request's installer | Adds the `bundle` label, downloads, runs the demo flow | Builds the installers |
| Review and merge pull requests | Ticks the acceptance checklist with evidence, then merges personally | Required checks |
| Approve a release run | Yes (one click) | Waits for approval |
| Create the release tag | Yes | Checks it |
| Test Windows build | Yes, on own machine (§12 step 6) | Install smoke |
| Test macOS build | Yes, on a borrowed or rented Mac (§12 step 7) | Install smoke, Intel smoke |
| Test Linux build | Not required | E2E and install smoke |
| Publish the release | Yes (one click) | — |
| One-time: SignPath, GPG key, updater key, sandbox token, secrets (Apple Developer only if PLAT-11 is taken up) | Yes | — |
| Fix nightly failures | Asks Claude Code, reviews the pull request | Opens the issue |

### 14.2 One-time GitHub settings (M0)

The owner sets these once in the repository settings during M0:

1. **Branch protection on `main`:** changes only through pull requests; the required checks of §4.1 must be green; no required approvals, because GitHub doesn't count a solo maintainer's own approval. The owner's review is the ticked acceptance checklist in the pull request, and the owner merges personally. Squash merge only.
2. **Tag ruleset:** only the owner can create, move or delete tags matching `v*`.
3. **Environments:** `release` (tags `v*` only, owner as required reviewer) and `github-live` (scheduled runs on `main` only).
4. **Private vulnerability reporting** turned on (see [SECURITY.md](../../SECURITY.md)).
5. **Secret scanning with push protection** turned on.
6. **Dependabot alerts** turned on (Renovate proposes the updates).
7. Labels `bundle`, `perf`, `tests-changed`, `nightly-failure`, `perf-regression` and `flaky` created.

## 15. Release risks

| Risk | Mitigation |
|---|---|
| AppImage is over 60 MB because it bundles WebKitGTK | Measure at M1; strip bundled libraries; otherwise record the AppImage-only PERF-09 exception in the ADR (§11) |
| No Mac available for the manual smoke, so the release is blocked (PLAT-04) | Arrange a teammate's Mac or a rented Mac before M10; CI install smoke covers both architectures meanwhile |
| Users on macOS 13.0–13.2 get a broken UI | The start-up WebKit check shows a clear "update macOS" message (§7.2); the download page states macOS 13.3 or newer |
| SignPath approval takes long or is refused | Apply right after v0.1; Certum fallback after 6 weeks; until then, unsigned with clear download notes (PRD §13) |
| Updater key lost or leaked | Two offline backups, separate password, plain file deleted, rotation steps (§10.2) |
| Intel Mac support fades: Rust moved `x86_64-apple-darwin` to tier 2, and GitHub will retire Intel macOS images | Keep the Intel target while the PRD requires it; watch runner retirement notices; if no Intel runner remains, cross-build only and say so in the release notes |
| A runner image update breaks the build | Pinned image labels; image changes arrive through Renovate pull requests and must pass the nightly |
| WebView2 missing or blocked on Windows 10 | Download bootstrapper; first-run help for blocked machines; the version is shown in diagnostics |
| WebKitGTK differences (blank window on NVIDIA or Wayland, older engine on 22.04) | E2E on 22.04 nightly and 24.04 weekly; the DMABUF workaround (§7.3); CSS limited to the supported baseline |
| macOS users are put off by the Gatekeeper message, or can't find "Open Anyway" | The download page and release notes link the [install guide](../guides/install.en.md) with the exact steps per macOS version; the macOS smoke follows the guide word for word; PLAT-11 (notarisation) stays open as the real fix |
| A macOS update changes the ad-hoc signature and Keychain asks again for the token | The install guide explains the one-time "Always Allow"; if the prompt can't be answered, the app asks the user to sign in again instead of failing |
| Notarisation (once PLAT-11 is taken up) is slow or Apple's service is down | The release stays a draft; re-run only the failed job |
| A poisoned cache or a compromised action gets into a release | Clean release builds without cache; SHA-pinned actions; build provenance attestations |
| The sandbox token in `github-live` leaks | It can reach only the sandbox repository; scheduled runs on `main` only; yearly rotation |
| Even signed builds trigger SmartScreen at first | Expected while the certificate builds a reputation; explained in the download notes |
| A broken release spreads through auto-update | Publishing is by hand after smoke tests; rollback by turning the release back to a draft (§12) |

## 16. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 3 November 2026 | First draft by the planning panel (Agent 2), with the panel's review rulings applied: CI matrix, on-demand and weekly jobs, `github-live` environment, macOS 13.3 floor, 6 installers in v0.1, 50 MB warning, key handling, GitHub settings. |
| 0.2 | 3 November 2026 | No Apple Developer account for now: macOS stays ad-hoc signed in every release until PLAT-11; the install guide (PLAT-12) explains how to open the app past each system's warning; Apple secrets and enrolment moved out of M15. |
