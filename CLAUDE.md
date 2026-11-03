# GitHeddle

GitHeddle is a desktop app (Windows, macOS, Linux) for doing Git and pull request work across many repositories at once. Product requirements: [docs/product/PRD.en.md](docs/product/PRD.en.md) (English) and [docs/product/PRD.bn.md](docs/product/PRD.bn.md) (Bangla).

## Terminology

Always say **pull request** (short form **PR**, IDs `PR-xx`). Never say "merge request" or "MR", in documents, UI text or code.

## Golden rule: every document exists in Bangla and English

1. Every document is created as two files: one fully in English and one fully in Bangla. Never create only one of them, and never mix both languages in one file.
2. When a document is updated, update both files in the same change. A change made in only one language is not finished.
3. The two files carry the same content: the same sections, numbering, tables and requirement IDs. Neither one is a summary of the other.
4. If the two files ever disagree, don't guess which one is right. Ask the user, then fix the wrong one.

This applies to every human-readable document in the repository: everything under `docs/`, READMEs, guides and plans. It does not apply to code, code comments, config files or this `CLAUDE.md`.

### File naming

- `<name>.en.md`: English
- `<name>.bn.md`: Bangla
- Both files sit in the same folder, and the top of each file links to the other version.
- Exception: GitHub community files in the repository root (`README`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`) use `<NAME>.md` for English and `<NAME>.bn.md` for Bangla, so GitHub finds the English one.

### Bangla style

- Write in Bengali script, in natural Bangla, not a word-by-word translation.
- Keep Git and technical terms in English: repo, branch, commit, push, pull, merge, rebase, stash, pull request, PR, CI, API, and the names of commands and settings.
- Use Bangla numerals for section numbers (১, ২, ৩). Requirement IDs, versions, code and UI text stay as they are (`DASH-01`, `v0.1`, `git fetch`).
