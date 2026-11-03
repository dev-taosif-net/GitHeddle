# Contributing to GitHeddle

**Bangla version:** [CONTRIBUTING.bn.md](CONTRIBUTING.bn.md)

| | |
|---|---|
| **Document** | Contributing guide |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. The project is in planning; there is no code yet |

**Related documents:** [PRD](docs/product/PRD.en.md) · [ADR 0001: Tech stack](docs/decisions/0001-tech-stack.en.md) · [Architecture](docs/architecture/architecture.en.md) · [AI development workflow](docs/process/ai-development-workflow.en.md) · [Test strategy](docs/engineering/test-strategy.en.md) · [Build and release](docs/engineering/build-and-release.en.md) · [Roadmap](docs/plan/roadmap.en.md) · [Security policy](SECURITY.md)

> This file and its Bangla version, [CONTRIBUTING.bn.md](CONTRIBUTING.bn.md), carry the same content. When one changes, update the other in the same pull request.

---

## 1. Welcome

Thank you for helping with GitHeddle, a desktop app for Git and pull request work across many repositories, for Windows, macOS and Linux. What the app must do is in the [PRD](docs/product/PRD.en.md). How it is built is in the [Architecture](docs/architecture/architecture.en.md) and [Build and release](docs/engineering/build-and-release.en.md) documents.

You can help by reporting bugs, suggesting features, improving the documents in either language, or sending code.

## 2. How to propose a change

1. **Start with an issue** for anything bigger than a typo. Say what problem it solves and, where you can, which PRD requirement it touches (for example `DASH-03` or `SAFE-04`). For a new feature, say whether it changes the PRD.
2. **Wait for a short reply** before starting large work, so nobody builds something that won't be merged. Small fixes can go straight to a pull request.
3. **Fork the repository** (or create a branch, if you have write access) from `main`.
4. **Make the change** in small, focused commits (§3).
5. **Open a pull request** to `main`. Fill in the template and go through the checklist (§6).
6. **CI and review.** All required CI checks must be green; branch protection enforces this. GitHeddle has one maintainer, and GitHub doesn't count a maintainer's approval of their own pull request, so branch protection requires green checks, not approvals. The maintainer's review is the pull request's acceptance checklist, ticked with evidence (§6). `CODEOWNERS` is used to request reviews and add labels, not as a required approval.
7. **Merge.** The maintainer merges personally, as a squash merge, so the pull request title becomes the commit on `main`.

Changes to the PRD follow the same path, and also add a row to its revision history (PRD §16).

## 3. Branches, commits and dependencies

### 3.1 Branches

- `main` is protected. Nobody pushes to it directly; everything arrives through a pull request.
- Name branches `<type>/<roadmap-id>-<short-description>`, in lower case with hyphens, for example `feat/m4-03-changes-tree` or `fix/m2-01-crlf-paths`. When the work is not a roadmap item, leave out the ID: `docs/fix-install-notes`.
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `ci`, `build`, `chore`.

### 3.2 Commit messages

- Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>`. The scope is a crate or area, such as `git-runner`, `diff-engine`, `ui`, `docs` or `ci`.
- Write the summary in English, in the imperative ("add", not "added"), in 72 characters or fewer.
- In the body, say why, and name the requirement IDs and the roadmap item (for example `Implements BULK-04. Roadmap: M2-03.`).
- If an AI agent wrote the change, keep its `Co-Authored-By` trailer.
- The pull request title follows the same format, because it becomes the squash commit.

### 3.3 New dependencies

**A new dependency needs the maintainer's approval** (security rule SC-05). This covers new crates, new npm packages and new GitHub Actions. In the pull request description, name the dependency and say why it is needed, who maintains it, its licence (it must be compatible with GPL-3.0), how many other crates or packages it pulls in, and whether something already in the tree could do the job. It must also pass `cargo-deny`.

## 4. Documents in two languages

Every human-readable document in this repository exists in **English and Bangla**. These rules come from the project's `CLAUDE.md`:

1. A new document is always created as two files: `<name>.en.md` (English) and `<name>.bn.md` (Bangla), in the same folder. The community files in the root (`README`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`) use `<NAME>.md` for English and `<NAME>.bn.md` for Bangla.
2. **Both files change in the same pull request.** A change in only one language is not finished. The `docs-pair` CI check fails if one side is missing.
3. Both files have the same sections, numbering, tables and requirement IDs. Neither one is a summary of the other.
4. The top of each file links to the other version.
5. Bangla is written in Bengali script, in natural Bangla. Git and technical terms stay in English (repo, branch, commit, push, pull request, CI, command names). Section numbers use Bangla numerals; IDs, versions and code stay as they are. Numbered-list markers stay as ASCII digits (`1.`, `2.`) so that GitHub shows them as lists.
6. If you find the two versions disagree, open an issue rather than guessing which one is right.
7. Always write **pull request** (short form **PR**). The terms "merge request" and "MR" are not used anywhere, and the `terminology` CI check fails on them.

If you can write in only one of the two languages, open the pull request anyway and say so. A maintainer or an AI-assisted translation, reviewed by a person, will add the other side before merge.

Code, code comments (including crate-level rustdoc comments) and config files are in English only.

## 5. AI-assisted development

GitHeddle is built with heavy AI assistance: most code is written by **Claude Code** sessions that the maintainer steers, reviews and tests. How this works (work items, prompts, project `CLAUDE.md` files, how to review AI-written changes) is in the [AI development workflow](docs/process/ai-development-workflow.en.md).

For contributors this means:

- You may use AI tools too. **You are responsible** for every line you submit, whoever or whatever wrote it. Read it and understand it before opening the pull request.
- **Every pull request is reviewed by a person**, including the maintainer's own pull requests made with Claude Code. That review is the acceptance checklist ticked with evidence before the maintainer merges (§2). AI review can help, but it never replaces it.
- Say in the pull request template whether AI tools were used, and for what.
- Never paste tokens, signing keys, private repository content or other secrets into an AI tool.
- Tests matter even more with AI-written code. A change without tests that show it works will not be merged (see the [Test strategy](docs/engineering/test-strategy.en.md)).
- **The `tests-changed` rule:** if a pull request deletes, skips or loosens a test, rewrites a snapshot, or touches the invariant or chaos test folders, it must have a "Tests changed" section that explains each change, and it gets the `tests-changed` label. The maintainer then ticks an explicit "I agree with these test changes" checkbox before merging.

## 6. Pull request checklist

The pull request template contains this list. Tick each item, or explain why it doesn't apply.

1. The pull request does one thing, and its title and branch name follow §3.
2. It links the issue and names the PRD requirement IDs or roadmap item it serves.
3. **The roadmap item's acceptance criteria are ticked, each with its evidence** (a test, a CI job, a screenshot or a demo flow).
4. All required CI checks are green on Windows, macOS and Linux.
5. New or changed behaviour has tests, following the [Test strategy](docs/engineering/test-strategy.en.md). Bugs get a test that failed before the fix.
6. No test was weakened without a "Tests changed" section, the `tests-changed` label and the maintainer's checkbox (§5).
7. `rustfmt`, `clippy` and Biome pass with no new warnings, and the generated TypeScript bindings are up to date.
8. Platform differences (paths, line endings, case-sensitive file names, shells) go through `crates/platform`, not around it (PLAT-03).
9. Safety rules in PRD §7 H still hold: nothing can lose work without a clear warning.
10. Every changed document is changed in **both English and Bangla** (§4).
11. A user-visible change adds a line to both `CHANGELOG.en.md` and `CHANGELOG.bn.md`.
12. No secrets, tokens or personal data are in the code, the tests, the fixtures or the logs.
13. Any new dependency was approved by the maintainer as in §3.3.
14. AI use is stated (§5), and a human has read the whole diff.

## 7. Development setup

There is no code yet. Once M0 of the [Roadmap](docs/plan/roadmap.en.md) is done, this section will say how to build and test locally. You won't need a local build to contribute: CI tests every pull request on all three systems. Adding the `bundle` label to a pull request builds installers from its branch, and installers built from `main` are in the nightly workflow's artifacts (see [Build and release](docs/engineering/build-and-release.en.md)).

## 8. Reporting security problems

Don't open a public issue for a security problem. Follow the [Security policy](SECURITY.md).

## 9. Licence

GitHeddle is licensed under the [GPL-3.0](LICENSE). By sending a contribution, you agree that it is released under the same licence.

## 10. Code of Conduct

A `CODE_OF_CONDUCT` file will be added; until then, be respectful and constructive in every issue, pull request and discussion.

## 11. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 3 November 2026 | First draft by the planning panel (Agent 2), with the panel's review rulings applied: review for a solo maintainer, branch names, dependency approval, the `tests-changed` rule. |
