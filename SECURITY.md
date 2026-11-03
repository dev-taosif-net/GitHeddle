# Security Policy

**Bangla version:** [SECURITY.bn.md](SECURITY.bn.md)

| | |
|---|---|
| **Document** | Security policy |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. In force from the first public release |

**Related documents:** [Security and threat model](docs/engineering/security.en.md) · [Test strategy](docs/engineering/test-strategy.en.md) · [PRD](docs/product/PRD.en.md) · [Contributing](CONTRIBUTING.md)

> This file and its Bangla version, [SECURITY.bn.md](SECURITY.bn.md), carry the same content. When one changes, update the other in the same commit.

GitHeddle runs Git in your repositories and holds a GitHub token, so we take security reports seriously. Thank you for helping keep its users safe.

## 1. Supported versions

GitHeddle is in early development. Until v1.0, only the newest release gets security fixes.

| Version | Security fixes |
|---|---|
| Latest 0.x release | Yes |
| Older 0.x releases | No. Please update to the latest release |
| Builds from `main` or from pull requests | No, but reports about them are welcome |

Before the first release (v0.1) there is no supported version. You can still report problems you find in the code.

## 2. How to report a vulnerability

**Please don't open a public issue, discussion or pull request for a security problem.**

Report it privately through GitHub's private vulnerability reporting:

1. Go to the [Security tab of the repository](https://github.com/dev-taosif-net/GitHeddle/security).
2. Choose **Report a vulnerability**. The form goes straight to [the new advisory page](https://github.com/dev-taosif-net/GitHeddle/security/advisories/new).
3. Describe the problem, and include:
   - the GitHeddle version and your operating system;
   - the steps to reproduce it, ideally with a small example repository or input;
   - what an attacker could do with it, and what they would need to control;
   - any idea you have for a fix.

Only you and the maintainer can see the report. If you can't use GitHub's form, open a public issue that says only "please contact me about a security issue", with no details, and the maintainer will reach out.

## 3. What to expect

GitHeddle is maintained by one person, so these are targets, not guarantees.

| Step | Target |
|---|---|
| We confirm we received your report | Within 7 days |
| We tell you whether we accept it as a vulnerability, and how serious we think it is | Within 14 days |
| We publish a fix for a critical or high severity issue | Within 30 days of accepting it |
| We publish a fix for a medium or low severity issue | Within 90 days, or in the next release |

While we work on it:

1. We keep you updated in the private advisory, and we may ask you for more details.
2. When the fix is released, we publish a GitHub security advisory and, where it fits, ask for a CVE.
3. We credit you in the advisory by the name you choose, unless you prefer to stay anonymous.
4. Please keep the issue private until the advisory is published. If we miss the targets above without telling you why, you may agree a disclosure date with us.

We won't take legal action against anyone who reports in good faith, follows this policy, doesn't access other people's data and doesn't harm other users.

## 4. Scope

**In scope:**

- The GitHeddle desktop app on Windows, macOS and Linux: the Rust core, the web UI and the communication between them.
- How GitHeddle runs `git` and other tools: argument handling, injection, unsafe handling of repository content or of the team file `.githeddle.json`.
- How GitHeddle stores and uses your GitHub token.
- Ways GitHeddle can lose your work or push without your confirmation, against its safety rules (SAFE-01..07 in the [PRD](docs/product/PRD.en.md)).
- Content from a pull request, commit or repository that can run code in GitHeddle.
- The installers, the update channel (from v0.2) and the build and release workflows in this repository.

**Out of scope:**

- Vulnerabilities in Git itself, in GitHub, in the operating system or in the system webview (WebView2, WKWebView, WebKitGTK). Please report those to their own projects. If GitHeddle makes such a problem worse, that part is in scope.
- Git hooks that run during commit or push. GitHeddle runs your hooks on purpose (SAFE-05), so a hook in a repository you chose to use is not a GitHeddle vulnerability.
- Attacks that need malware already running as your user, or physical access to an unlocked machine.
- Problems that occur only in unsupported versions, or in modified builds.
- Social engineering, spam, and reports from automated scanners without a demonstrated impact.

If you're not sure whether something is in scope, report it anyway.

## 5. Revision history

| Version | Date | Changes |
|---|---|---|
| 0.1 | 3 November 2026 | First draft by the planning panel (Agent 5) |
