# GitHeddle — Security and Threat Model

**Bangla version:** [security.bn.md](security.bn.md)

| | |
|---|---|
| **Document** | Security and threat model |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. Written by the planning panel (Agent 5). Review again at M9 (GitHub) and before every release |

**Related documents:** [PRD](../product/PRD.en.md) · [Tech stack decision](../decisions/0001-tech-stack.en.md) · [Architecture](../architecture/architecture.en.md) · [Test strategy](test-strategy.en.md) · [Build and release](build-and-release.en.md) · [UI architecture](../design/ui-architecture.en.md) · [AI development workflow](../process/ai-development-workflow.en.md) · [Roadmap](../plan/roadmap.en.md) · [Security policy (reporting)](../../SECURITY.md)

> This file and its Bangla version, [security.bn.md](security.bn.md), carry the same content. When one changes, update the other in the same commit.

---

## 1. Purpose and scope

This document lists what GitHeddle must protect, where untrusted data enters, what can go wrong and which rule prevents it. Every rule has an ID (`TH-`, `GS-`, `UN-`, `SEC-`, `SC-`, `UPD-`), so a work item, a code review or a test can point to it. The tests that prove these rules are described in the [test strategy](test-strategy.en.md).

The scope is the desktop app (the Rust core and the web UI), the way it runs Git and other tools, its connection to GitHub, its local files, its build pipeline and, from v0.2, its update channel. How to report a vulnerability is in [SECURITY.md](../../SECURITY.md).

## 2. Assets

| ID | Asset | Why it matters |
|---|---|---|
| AS-01 | The GitHub token (OAuth or personal access token) | It can read and write the user's repositories and pull requests (PR-01, §9 Security) |
| AS-02 | The user's uncommitted work, local commits, stashes and branches | Losing them is the worst failure of the product (§7 H, §9 Safety) |
| AS-03 | The shared branches on the remote (`main`, `dev`) | A wrong push or a force push hurts the whole team (SAFE-01, SAFE-02) |
| AS-04 | The user's machine and account | GitHeddle runs programs. A flaw can turn into code execution with the user's rights |
| AS-05 | The user's Git credentials (credential helpers, SSH keys) | GitHeddle never touches them directly but triggers their use (SAFE-05) |
| AS-06 | The integrity of GitHeddle itself: installers and updates | A tampered build or update compromises every user |
| AS-07 | Local data: settings, workspace, task list, activity log, pipeline journal | It contains paths, branch names and commands; it must stay correct for crash recovery (§9 Reliability) |

## 3. Who might attack

| Actor | What they control |
|---|---|
| A stranger on GitHub | Text in pull requests, comments, branch names and commit messages in repositories the user opens or reviews |
| The author of a repository the user opens | All file content, file names, `.gitattributes`, hooks only if the user installs them, and the `.githeddle.json` team file |
| Someone on the network | Traffic between the user and GitHub or the update server |
| A compromised dependency or build tool | Code inside GitHeddle, in the core or in the webview |
| Other software on the machine | Local files that are writable by the user; out of scope as an attacker, see §12 |
| A well-meaning bug, including AI-written code | Any action GitHeddle can take. Treated as a threat because it is the most likely one |

## 4. Trust boundaries

| ID | Boundary | Trusted side | Untrusted side |
|---|---|---|---|
| B1 | Webview ↔ Rust core (Tauri IPC) | The core | The webview, because it renders text from strangers and runs third-party JavaScript |
| B2 | Core ↔ `git` process | The core and the user's Git installation | Arguments built from untrusted text; Git's output; the repository's own config |
| B3 | Core ↔ GitHub API | The core | Everything GitHub returns, and the network in between |
| B4 | Core ↔ local storage and keychain | The keychain | Files in the app data folder, which can be damaged by crashes |
| B5 | Workspace content: repository files, `.githeddle.json`, `.code-workspace` | — | All of it is untrusted input |
| B6 | Core ↔ external tools (editor, terminal, merge tool, file manager, browser) | The tool the user configured | The paths and URLs passed to it |
| B7 | Build, release and update channel | The signing keys and the protected CI environment | Dependencies, pull requests from others, the download network |

## 5. Threats and mitigations

The letter in the second column is the STRIDE class: **S**poofing, **T**ampering, **R**epudiation, **I**nformation disclosure, **D**enial of service, **E**levation of privilege.

### 5.1 B1: Webview ↔ core

| ID | Class | Threat | Mitigation | Traces |
|---|---|---|---|---|
| T-01 | E | Script injection: a pull request body, commit message, branch name or file name contains HTML or script. It runs in the webview and calls privileged commands | UN-01..03 (text by default, DOMPurify for markdown), TH-01 (strict CSP), TH-02 (isolation pattern), TH-04 (commands check their inputs) | PR-05, CHG-02, §9 Security |
| T-02 | E | The webview navigates to a remote page that then gets IPC access | TH-05 (navigation and new windows blocked), TH-03 (capabilities name no remote URL), UN-04 (links open in the system browser) | PR-11 |
| T-03 | E | A compromised npm package runs code in the webview | SC-03 (small frontend tree, blocked install scripts), TH-02 and TH-04 (the core checks every call, whatever the webview sends) | §9 Security |
| T-04 | E | The webview, compromised or buggy, asks the core to read any file or run any command | TH-04: the webview names repositories by ID, never by raw path; paths must resolve inside the repository; Git arguments are built in the core; BULK-07 has its own command, preview and log | BULK-07, BULK-08 |
| T-05 | I | The token reaches the webview and can be read by injected script | SEC-03: the token never leaves the core; the webview only learns the login name and whether the user is signed in | PR-01 |

### 5.2 B2 and B5: Git and repository content

| ID | Class | Threat | Mitigation | Traces |
|---|---|---|---|---|
| T-06 | E | Argument injection: a branch name, ticket key or file name that starts with `-` is read by Git as an option (for example `--upload-pack=…`) | GS-04 (`git check-ref-format`, `--end-of-options`, `--` before paths), property tests in the test strategy §7 | TASK-01, BULK-01 |
| T-07 | E | A repository's own config runs code when GitHeddle runs Git in the background, for example `core.fsmonitor`, `core.sshCommand`, a filter driver or `diff.external` in a repository copied from someone else | GS-08 (trust check when a repository is added), GS-09 (our diff engine, so no external diff or textconv), Git's own `safe.directory` ownership check | DASH-01, SAFE-05 |
| T-08 | E | Hooks run during commit and push | Accepted by design (SAFE-05): hooks are the user's own code. GitHeddle never installs hooks. See §12 | SAFE-05 |
| T-09 | D | Git hangs waiting for a password or a slow network; processes are left behind | GS-05 (stdin closed, `GIT_TERMINAL_PROMPT=0`, watchdog timeouts), GS-06 (Job Object and process groups) | BULK-04, PERF-05 |
| T-10 | T | A bug, including AI-written code, force-pushes or pushes to a protected branch | GS-07: the command guard in `git-runner` allows only `--force-with-lease` with a confirmation token, and requires confirmation for protected branches; invariants INV-02 and INV-03 | SAFE-01, SAFE-02 |
| T-11 | T | Work is lost through discard, checkout, reset or a stash pop that conflicts | The command guard and the preview, with work snapshots (INV-01, INV-04) | SAFE-03, SAFE-04 |
| T-12 | T | Time-of-check to time-of-use: the repository changes between the preview and the run | Re-check just before each step (INV-07) | SAFE-07 |
| T-13 | E | A symbolic link in the repository makes the merge editor or a discard write outside the repository | GS-10: files are written only through paths resolved inside the working tree; a path that is a link is not followed | CONF-09, SAFE-03 |
| T-14 | T | Terminal control characters in Git output or file names change what the activity log shows | UN-05: control characters are shown escaped | BULK-08 |
| T-15 | R | A change happens and the user can't tell what GitHeddle did | Every spawned command is logged with repo, arguments, exit code and duration (INV-09). Secrets are removed from the log (SEC-05) | BULK-08, §9 Transparency |

### 5.3 B3: GitHub

| ID | Class | Threat | Mitigation | Traces |
|---|---|---|---|---|
| T-16 | S, I | Someone in the middle intercepts the API traffic | SEC-07: TLS with `rustls` and the system's trust store (`rustls-platform-verifier`); no option to turn certificate checks off | §9 Security |
| T-17 | I | The token is sent to the wrong host, for example after a redirect | SEC-06: the token is attached only to the allow-listed GitHub hosts; it is never forwarded on a redirect to another host | PR-01 |
| T-18 | S | Device flow phishing: the user is tricked into approving someone else's code | The app shows the code next to the official verification address on `github.com` and opens only that address; the user approves on github.com, where GitHub shows the app's name | PR-01 |
| T-19 | T, D | A response is malformed, huge or hostile | Typed parsing with size limits; all text is treated as untrusted (UN-01); errors are shown, never a crash | PR-05 |
| T-20 | D | Rate limits run out with many repositories | GraphQL batching, a cache and refresh on demand (PRD §13) | PR-05 |
| T-21 | T | A half-finished pull request creation leaves duplicates or missing links | Creation looks up an existing pull request for the head branch first, so running it again only adds what is missing (CH-08) | PR-02, PR-03 |

### 5.4 B4, B5 and B6: local data, team file and external tools

| ID | Class | Threat | Mitigation | Traces |
|---|---|---|---|---|
| T-22 | E, T | A hostile team file `.githeddle.json` tries to run commands, change the editor, add destructive pipeline steps or flood the app | UN-06: strict schema, no fields that name programs, no Run Git command steps, every pipeline still shows its preview, changes need the user's approval | CFG-03, PIPE-05, PIPE-13 |
| T-23 | T | The pipeline journal is damaged by a crash or edited, so Resume does the wrong thing | Git is the source of truth: on Resume, the state is read again and the preview is shown again (SAFE-07); SQLite in WAL mode with `synchronous=FULL`; JSON written atomically | PIPE-07, §9 Reliability |
| T-24 | I | The activity log or crash output exposes secrets | SEC-05: remote addresses with embedded credentials and token patterns are removed before anything is written; no telemetry | §9 Security |
| T-25 | E | A crafted path breaks out of its argument when an editor or terminal is opened, especially through Windows `.cmd` launchers such as `code.cmd` | GS-11: argument lists only, never a shell string; for `.cmd` launchers, Rust's batch-file argument escaping, and a path with characters that can't be passed safely is refused with a clear message | DASH-06, CHG-06, CONF-02 |

### 5.5 B7: build, release and updates

| ID | Class | Threat | Mitigation | Traces |
|---|---|---|---|---|
| T-26 | T, E | A malicious or compromised dependency (crates.io, npm, GitHub Actions) | SC-01..08 | §9 Security |
| T-27 | T | A tampered installer is downloaded | Signed Windows installer (v0.2; macOS stays ad-hoc signed until PLAT-11), GPG-signed `SHA256SUMS` that the install guide tells users how to check (PLAT-12), build provenance attestations (SC-07, PLAT-08) | PLAT-02, PLAT-08, PLAT-12 |
| T-28 | T, E | A malicious update, a downgrade to an old vulnerable version, or a stolen signing key | UPD-01..07 | PLAT-07 |
| T-29 | E | A pull request from a fork reaches CI secrets | SC-06: secrets live only in protected environments: `release` for release jobs, and `github-live` for the scheduled live contract job on `main`, with a token limited to one sandbox repository. Pull requests, including fork pull requests, never get them | — |

## 6. Tauri hardening rules

| ID | Rule |
|---|---|
| TH-01 | Content Security Policy: `default-src 'self'`; scripts only from the app bundle, never inline or `eval`; no remote origins in any directive; network connections only to the Tauri IPC. `'unsafe-inline'` is never used, in `script-src` or `style-src`. CodeMirror's injected styles get a nonce through `EditorView.cspNonce`, or use adopted style sheets. Verify at M1, with the M1 measurements taken under this CSP |
| TH-02 | Use Tauri's isolation pattern, so every IPC message passes through a sandboxed check before it reaches the core |
| TH-03 | Capabilities list only GitHeddle's own commands, per window. No shell, file system, HTTP or other general plugins are given to the webview. Every new command is added to the capability file in the same pull request as its code, and the security review (§11) looks at it |
| TH-04 | Every command checks its inputs in Rust: repository IDs instead of paths, lengths and character sets limited, enums instead of free strings. The webview is never trusted to have checked anything |
| TH-05 | The webview never leaves the app: navigation away from the bundle and new windows are blocked; links go to the system browser through UN-04 |
| TH-06 | Release builds have developer tools turned off. The global Tauri object is not exposed |
| TH-07 | No remote content is ever loaded: no web fonts, no remote images, no analytics. Images in pull request bodies are not loaded; a link is shown instead. v0.1 shows no avatar images; people are shown with an initials badge |
| TH-08 | Commands stay thin and call the core crates; no business logic or Git spawning in `apps/desktop/src-tauri` (see the [architecture](../architecture/architecture.en.md)) |

## 7. Git spawning rules

All of these live in `crates/platform` and `crates/git-runner`. Only `git-runner` spawns `git` for repository work. `platform` has one named launcher module, the only other code allowed to start processes: it opens the editor, terminal and file manager, reads the login-shell PATH and runs `git --version` (GS-01, GS-02, GS-11). A Clippy disallowed-methods rule allows exactly these two places.

| ID | Rule |
|---|---|
| GS-01 | Find the absolute path of `git` once at startup. Refuse a `.bat` or `.cmd` wrapper. Show the path and version in settings. If Git is missing or older than 2.30, explain how to install it (§9 Compatibility) |
| GS-02 | On macOS, read the PATH from the user's login shell, because apps started from the Dock don't get it, and Git hooks and credential helpers may need it |
| GS-03 | Spawn with an argument list, never through a shell. BULK-07 splits the user's text with `shell-words` and shows the result in the preview |
| GS-04 | Validate branch and tag names with `git check-ref-format`. Put `--end-of-options` before revisions and `--` before paths. Never put untrusted text in an option position |
| GS-05 | stdin is closed. `GIT_TERMINAL_PROMPT=0` so Git never waits for a typed password; graphical credential helpers such as Git Credential Manager still work. `GIT_OPTIONAL_LOCKS=0` for background reads, so GitHeddle doesn't fight the user's editor for the index lock. Every command has a watchdog timeout, longer for network commands |
| GS-06 | Each process is created in a Windows Job Object with kill-on-close, or in its own process group on Unix, with no console window on Windows. When the app exits, no Git process is left. Cancel follows BULK-04: no new repositories start, running commands finish |
| GS-07 | The central command guard in `git-runner` checks every argument list before spawning: no `--force` or `+` refspecs (only `--force-with-lease` with an explicit expected value and a confirmation token); protected-branch writes only with a confirmation token; no `--no-verify`; no `-c` overrides of `core.hooksPath` or `credential.helper`; no new operation in a repository that is mid-merge or mid-rebase; no command in a repository that isn't trusted, except the config read used by the trust check (GS-08). It also enforces GS-04. `pipeline` keeps its own preflight checks, so there are two layers (SAFE-01, 02, 05, 06) |
| GS-08 | When a repository is added to a workspace, `workspace` reads its local config with one config-only `git config` read through `git-runner`, the only command the guard allows in an untrusted repository, and looks for settings that can run programs: a command-valued `core.fsmonitor` (the values `true` and `false` are fine), `core.sshCommand`, `core.pager` or `core.editor` overrides that GitHeddle would trigger, filter, diff and merge drivers, credential helpers starting with `!`, `core.hooksPath` pointing outside the repository, and the files named by `include.path` and `includeIf`. The user is asked **once per workspace**, with one list of every flagged repository and setting. A repository not yet trusted shows "Needs review", and the guard (GS-07) lets **no** other Git command run in it, not even a background `status`. Trust is stored per repository path together with a hash of its config; if the config changes, the repository needs review again. Git's `safe.directory` refusals are respected and explained, never worked around |
| GS-09 | Diffs and the merge editor use GitHeddle's own diff engine on blobs from `cat-file --batch`, so `diff.external` and textconv programs are never run by GitHeddle. Commands that show diffs to the user pass `--no-ext-diff` |
| GS-10 | Files are written only through paths that resolve inside the repository's working tree. A symbolic link is never followed when writing |
| GS-11 | External tools (editor, terminal, merge tool, file manager) are started only by the launcher module in `platform`, with argument lists. Windows `.cmd` launchers are allowed only for these tools and only through Rust's batch-file escaping; a path that can't be passed safely is refused with a clear message |
| GS-12 | Git output is parsed only from machine formats (`--porcelain=v2`, `-z`, `--format`), never from messages meant for people, so a different language or a crafted message can't change what GitHeddle believes. Classifying stderr only chooses which error message to show; it never changes what the app believes about a repository's state. Errors cross to the UI as a code with parameters, and the UI owns the wording |
| GS-13 | The token is never passed to Git: not in arguments, not in remote addresses, not in the environment. Git uses the user's own credentials (SAFE-05) |

## 8. Handling untrusted input

| ID | Rule |
|---|---|
| UN-01 | All text from Git, repositories and GitHub is shown as plain text by default. React's escaping is used, and HTML is never inserted directly except through UN-02 |
| UN-02 | Pull request bodies and comments are rendered as markdown and then cleaned by DOMPurify with a strict allow-list: no scripts, no inline event handlers, no forms, no iframes, no styles, no remote images |
| UN-03 | Syntax highlighting in CodeMirror works on text only; file content is never turned into HTML |
| UN-04 | Strict allow-list: only `https://github.com/...` links, and links to a configured GitHub Enterprise host, open in the system browser. Any other URL is shown in full and can be copied, but is never opened directly |
| UN-05 | Control characters and terminal escape sequences in Git output and file names are shown escaped in the activity log and in error messages |
| UN-06 | The team file `.githeddle.json` is untrusted. It is checked against a strict schema with size limits, and unknown keys are rejected. It may define groups, patterns, templates, default reviewers and pipelines, but **never** the editor, terminal, merge tool or any other program or command, and its pipelines may not contain Run Git command steps. A new or changed team file is shown as a summary, and the user approves it before it takes effect. Pipelines from it always go through the normal preview and confirmations (PIPE-05) |
| UN-07 | `.code-workspace` files are read only for folder paths. Their settings, tasks and extension recommendations are ignored |
| UN-08 | Size limits: very large files in the diff view are shown in parts (PERF-06); very large GitHub responses and team files are refused |

## 9. Secret handling

| ID | Rule |
|---|---|
| SEC-01 | Tokens are stored only in the operating system keychain through the `keyring` crate: Windows Credential Manager, macOS Keychain, Linux Secret Service. Never in files, SQLite, logs or settings (§9 Security) |
| SEC-02 | If Linux has no Secret Service, the token is kept in memory for the session only, and the user is told why they must sign in again next time. There is no plain-text fallback |
| SEC-03 | The token stays in the Rust core. It is held in a type that is wiped from memory when dropped and that never prints itself in logs or errors. The webview gets only the login name and the signed-in state |
| SEC-04 | Sign-in uses the OAuth device flow (PR-01), so the app ships no client secret. It asks for the smallest set of scopes that PR-01..11 need; the exact list is decided at M9 and written here. For personal access tokens, the UI recommends a fine-grained token and lists the permissions it needs |
| SEC-05 | Before anything is written to the activity log, SQLite or an error message, a redaction step removes credentials embedded in remote addresses and anything that looks like a GitHub token |
| SEC-06 | The token is attached only to requests to the allow-listed GitHub hosts. Redirects to another host never carry it |
| SEC-07 | TLS through `rustls` with the system trust store, so corporate certificate authorities work. There is no setting to turn off certificate checks |
| SEC-08 | Sign-out deletes the token from the keychain. If GitHub answers that the token is invalid or revoked, it is deleted and the user is asked to sign in again |
| SEC-09 | Network calls go only to Git remotes (through Git), the GitHub API and, from v0.2, the update server. The first release has no telemetry and no crash upload (§9 Security) |
| SEC-10 | The app data folder is private to the user: Unix permissions allow only the owner; on Windows the default per-user folder rights are kept. The activity log has a size and age limit |

## 10. Supply chain, build and updates

### 10.1 Supply chain and build

| ID | Rule |
|---|---|
| SC-01 | `Cargo.lock` and `pnpm-lock.yaml` are committed. CI installs with a frozen lockfile |
| SC-02 | `cargo-deny` runs on every pull request: known advisories fail the run, licences must be compatible with GPL-3.0, crates come only from crates.io, and banned or duplicated crates are reported. `cargo-audit` also runs every day on `main` |
| SC-03 | Frontend packages: pnpm with install scripts blocked except for an explicit allow-list; the dependency list is kept small on purpose |
| SC-04 | Renovate opens update pull requests, grouped, with a minimum age for new versions before they are proposed (verify the setting at M0). Security updates come first. Each update goes through the normal CI |
| SC-05 | **A new dependency needs the owner's approval.** The pull request names it and says why it is needed, who maintains it, its licence, how many crates or packages it pulls in, and whether something already in the tree does the job. An AI session may suggest a dependency but may not add one silently |
| SC-06 | GitHub Actions are pinned to full commit hashes. Every workflow sets the smallest permissions it needs. Release secrets live in the protected `release` environment with the owner as required reviewer. The only other secret is the token for the live GitHub contract job, in the protected `github-live` environment: scheduled runs on `main` only, and a fine-grained token limited to one sandbox repository. Workflows never run code from fork pull requests with secrets, and `pull_request_target` is not used to check out pull request code |
| SC-07 | Release builds come only from CI, from a tagged commit on `main`. Each artifact gets a build provenance attestation and an entry in a GPG-signed `SHA256SUMS` (see [build and release](build-and-release.en.md)) |
| SC-08 | The owner turns these on in the GitHub settings at M0: private vulnerability reporting (needed by [SECURITY.md](../../SECURITY.md)), secret scanning with push protection, Dependabot alerts, a tag ruleset so only the owner can create `v*` tags, and branch protection on `main` that requires green CI (approvals are not required, because a solo maintainer can't approve their own pull request). Code scanning is added where available for TypeScript and Rust |

### 10.2 Update channel (v0.2)

| ID | Rule |
|---|---|
| UPD-01 | Updates use `tauri-plugin-updater`. Every update package is signed with a minisign key, and the public key is built into the app. An update whose signature doesn't verify is never installed |
| UPD-02 | The update manifest `latest.json` and the packages are fetched over HTTPS from GitHub Releases only |
| UPD-03 | Only a higher version is accepted, so an attacker can't push an old vulnerable version as an "update" |
| UPD-04 | The update is installed on restart, and only when no job or pipeline is running (PLAT-07) |
| UPD-05 | The private key and its password are stored as two separate secrets in the protected `release` environment, and in two offline backups: the owner's password manager, and an encrypted USB drive kept somewhere else, with the password kept apart from the key. Once the backups exist, the plain key file is deleted from the machine where it was generated. The key is never committed, never pasted into a Claude Code session and never printed in a log (see [build and release](build-and-release.en.md) §10.2) |
| UPD-06 | Key rotation: a new public key is shipped inside an update signed with the old key. If the key is stolen, the project publishes a security advisory and users reinstall from a verified download |
| UPD-07 | `.deb` and `.rpm` users only get a notice that an update exists; they update through their package manager or the download page |

## 11. Release security checklist

Done for every release and ticked in the release issue (test strategy §14, item 10).

1. `cargo-deny` and `cargo-audit` are clean, and there are no open high or critical Dependabot alerts.
2. Every dependency added since the last release was approved under SC-05.
3. The capability file and the list of Tauri commands are compared with the last release. Every new command checks its inputs (TH-03, TH-04).
4. The CSP is unchanged, or the change was reviewed (TH-01).
5. Invariants INV-01..12 and the chaos suite are green on all three systems and both Git versions.
6. The canary token test (INV-11) passed.
7. The hostile-input tests passed: script injection in pull request text, branch names starting with `-`, the hostile team file and repository configs that run programs (T-01, T-06, T-07, T-22).
8. Release workflows still pin actions by hash, and secrets are only in the protected environment (SC-06).
9. Artifacts have provenance attestations and match `SHA256SUMS`; from v0.2, installers are signed and the update signature verifies (SC-07, UPD-01).
10. Advisories since the last release for Git, WebView2, WebKitGTK, WKWebView, Tauri and `rustls` were read, and any that affect GitHeddle are dealt with.
11. Every security issue reported since the last release has been answered under [SECURITY.md](../../SECURITY.md).
12. This document was updated if anything above changed a rule.

## 12. Accepted risks and limits

| Risk | Why it is accepted |
|---|---|
| Git hooks run with the user's rights | SAFE-05 requires it. The hooks are the user's own or the team's. GitHeddle never installs or changes hooks |
| Other software running as the same user can read GitHeddle's local files and use the unlocked keychain | No desktop app can defend against code already running as the user. The token is still never in plain text |
| The webview engine on Linux (WebKitGTK) is updated by the distribution, not by GitHeddle | Users depend on their distribution's security updates. The release checklist reviews its advisories (§11, item 10) |
| Credentials for Git remotes are handled by the user's credential helper or SSH agent | By design (SAFE-05). GitHeddle doesn't store or see them |

## 13. Revision history

| Version | Date | Changes |
|---|---|---|
| 0.1 | 3 November 2026 | First draft by the planning panel (Agent 5), updated after the panel's cross-review (rulings R1–R32) |
| 0.2 | 3 November 2026 | T-27: macOS stays ad-hoc signed without an Apple Developer account (PLAT-11); users check downloads with the install guide (PLAT-12). |
