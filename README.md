# GitHeddle

**Bangla version:** [README.bn.md](README.bn.md)

GitHeddle is a desktop app for Windows, macOS and Linux that brings Git and pull request work for many repositories into one window.

Instead of repeating the same step in every repository, you start a **task** once (for example `TK-2636 Onboarding`). GitHeddle then creates the branches, commits, pushes, syncs with `dev` and opens the pull requests in every repository the task touches. It shows a preview before each action and a per-repository result after it.

> **Status:** planning. There is no code yet. The product requirements, the technology decision (Tauri 2) and the development plan are written. Coding starts at roadmap milestone M0.

## Goals

- **Runs everywhere.** Windows, macOS and Linux are all first-class.
- **Very fast.** Opens in about a second and responds immediately, even with 30 repositories.
- **Very easy to use.** Someone who isn't confident with Git can start a task, commit and create pull requests without help, and nothing can lose work without a clear warning first.

## Documents

| Document | English | Bangla |
|---|---|---|
| Product Requirements Document (PRD) | [PRD.en.md](docs/product/PRD.en.md) | [PRD.bn.md](docs/product/PRD.bn.md) |
| ADR 0001 — Technology stack | [0001-tech-stack.en.md](docs/decisions/0001-tech-stack.en.md) | [0001-tech-stack.bn.md](docs/decisions/0001-tech-stack.bn.md) |
| Architecture | [architecture.en.md](docs/architecture/architecture.en.md) | [architecture.bn.md](docs/architecture/architecture.bn.md) |
| UI architecture | [ui-architecture.en.md](docs/design/ui-architecture.en.md) | [ui-architecture.bn.md](docs/design/ui-architecture.bn.md) |
| Roadmap | [roadmap.en.md](docs/plan/roadmap.en.md) | [roadmap.bn.md](docs/plan/roadmap.bn.md) |
| AI development workflow (Claude Code) | [ai-development-workflow.en.md](docs/process/ai-development-workflow.en.md) | [ai-development-workflow.bn.md](docs/process/ai-development-workflow.bn.md) |
| Test strategy | [test-strategy.en.md](docs/engineering/test-strategy.en.md) | [test-strategy.bn.md](docs/engineering/test-strategy.bn.md) |
| Security (threat model) | [security.en.md](docs/engineering/security.en.md) | [security.bn.md](docs/engineering/security.bn.md) |
| Build and release | [build-and-release.en.md](docs/engineering/build-and-release.en.md) | [build-and-release.bn.md](docs/engineering/build-and-release.bn.md) |
| Install guide | [install.en.md](docs/guides/install.en.md) | [install.bn.md](docs/guides/install.bn.md) |

## Contributing

Issues and pull requests are welcome. Every document in this repository exists in both English and Bangla: when you change one, change the other in the same pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for details and [SECURITY.md](SECURITY.md) for reporting security issues.

## License

GitHeddle is free software, released under the [GNU General Public License v3.0](LICENSE).
