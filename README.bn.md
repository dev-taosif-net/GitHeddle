# GitHeddle

**English version:** [README.md](README.md)

GitHeddle হলো Windows, macOS আর Linux-এর জন্য একটা desktop app, যেটা অনেকগুলো repository-র Git আর pull request-এর কাজ এক window-এ নিয়ে আসে।

প্রতিটা repository-তে একই ধাপ বারবার না করে আপনি একবার একটা **task** শুরু করবেন (যেমন `TK-2636 Onboarding`)। তারপর task-টা যে যে repository-তে লাগে, সবগুলোতে GitHeddle branch তৈরি, commit, push, `dev`-এর সাথে sync আর pull request খোলার কাজ করে দেবে। প্রতিটা কাজের আগে preview দেখাবে, আর পরে প্রতিটা repository-র আলাদা ফলাফল দেখাবে।

> **অবস্থা:** পরিকল্পনার পর্যায়। এখনো কোনো code নেই। Product requirement, technology-র সিদ্ধান্ত (Tauri 2) আর development plan লেখা হয়েছে। Code লেখা শুরু হবে roadmap-এর M0 থেকে।

## লক্ষ্য

- **সব জায়গায় চলে।** Windows, macOS আর Linux — তিনটাই সমান গুরুত্বপূর্ণ।
- **খুব দ্রুত।** প্রায় এক সেকেন্ডে খোলে, আর ৩০টা repository থাকলেও সাথে সাথে সাড়া দেয়।
- **খুব সহজ।** Git-এ যিনি খুব একটা স্বচ্ছন্দ নন, তিনিও কারো সাহায্য ছাড়া task শুরু, commit আর pull request তৈরি করতে পারবেন, আর পরিষ্কার সতর্কবার্তা ছাড়া কোনো কাজ হারাবে না।

## ডকুমেন্ট

| ডকুমেন্ট | ইংরেজি | বাংলা |
|---|---|---|
| প্রোডাক্ট রিকোয়ারমেন্টস ডকুমেন্ট (PRD) | [PRD.en.md](docs/product/PRD.en.md) | [PRD.bn.md](docs/product/PRD.bn.md) |
| ADR 0001 — Technology stack | [0001-tech-stack.en.md](docs/decisions/0001-tech-stack.en.md) | [0001-tech-stack.bn.md](docs/decisions/0001-tech-stack.bn.md) |
| Architecture | [architecture.en.md](docs/architecture/architecture.en.md) | [architecture.bn.md](docs/architecture/architecture.bn.md) |
| UI architecture | [ui-architecture.en.md](docs/design/ui-architecture.en.md) | [ui-architecture.bn.md](docs/design/ui-architecture.bn.md) |
| Roadmap | [roadmap.en.md](docs/plan/roadmap.en.md) | [roadmap.bn.md](docs/plan/roadmap.bn.md) |
| AI development workflow (Claude Code) | [ai-development-workflow.en.md](docs/process/ai-development-workflow.en.md) | [ai-development-workflow.bn.md](docs/process/ai-development-workflow.bn.md) |
| Test strategy | [test-strategy.en.md](docs/engineering/test-strategy.en.md) | [test-strategy.bn.md](docs/engineering/test-strategy.bn.md) |
| Security (threat model) | [security.en.md](docs/engineering/security.en.md) | [security.bn.md](docs/engineering/security.bn.md) |
| Build ও release | [build-and-release.en.md](docs/engineering/build-and-release.en.md) | [build-and-release.bn.md](docs/engineering/build-and-release.bn.md) |
| Install guide | [install.en.md](docs/guides/install.en.md) | [install.bn.md](docs/guides/install.bn.md) |

## অবদান রাখা

Issue আর pull request — দুটোই স্বাগত। এই repository-র প্রতিটা ডকুমেন্ট ইংরেজি আর বাংলা দুই ভাষাতেই আছে: একটা বদলালে অন্যটাও একই pull request-এ বদলাবেন। বিস্তারিত আছে [CONTRIBUTING.bn.md](CONTRIBUTING.bn.md)-এ, আর security সমস্যা জানানোর নিয়ম আছে [SECURITY.bn.md](SECURITY.bn.md)-এ।

## License

GitHeddle একটা free software, [GNU General Public License v3.0](LICENSE)-এর অধীনে প্রকাশিত।
