# GitHeddle

**Bangla version:** [README.bn.md](README.bn.md)

GitHeddle is a desktop app for Windows, macOS and Linux that brings Git and pull request work for many repositories into one window.

Instead of repeating the same step in every repository, you start a **task** once (for example `TK-2636 Onboarding`). GitHeddle then creates the branches, commits, pushes, syncs with `dev` and opens the pull requests in every repository the task touches. It shows a preview before each action and a per-repository result after it.

> **Status:** early planning. There is no code yet. The product requirements are being written first.

## Goals

- **Runs everywhere.** Windows, macOS and Linux are all first-class.
- **Very fast.** Opens in about a second and responds immediately, even with 30 repositories.
- **Very easy to use.** Someone who isn't confident with Git can start a task, commit and create pull requests without help, and nothing can lose work without a clear warning first.

## Documents

| Document | English | Bangla |
|---|---|---|
| Product Requirements Document (PRD) | [PRD.en.md](docs/product/PRD.en.md) | [PRD.bn.md](docs/product/PRD.bn.md) |

## Contributing

Issues and pull requests are welcome. Every document in this repository exists in both English and Bangla: when you change one, change the other in the same pull request.

## License

GitHeddle is free software, released under the [GNU General Public License v3.0](LICENSE).
