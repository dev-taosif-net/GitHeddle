# GitHeddle

**English version:** [README.md](README.md)

GitHeddle হলো Windows, macOS আর Linux-এর জন্য একটা desktop app, যেটা অনেকগুলো repository-র Git আর pull request-এর কাজ এক window-এ নিয়ে আসে।

প্রতিটা repository-তে একই ধাপ বারবার না করে আপনি একবার একটা **task** শুরু করবেন (যেমন `TK-2636 Onboarding`)। তারপর task-টা যে যে repository-তে লাগে, সবগুলোতে GitHeddle branch তৈরি, commit, push, `dev`-এর সাথে sync আর pull request খোলার কাজ করে দেবে। প্রতিটা কাজের আগে preview দেখাবে, আর পরে প্রতিটা repository-র আলাদা ফলাফল দেখাবে।

> **অবস্থা:** একদম শুরুর পরিকল্পনা। এখনো কোনো code নেই। আগে product requirement লেখা হচ্ছে।

## লক্ষ্য

- **সব জায়গায় চলে।** Windows, macOS আর Linux — তিনটাই সমান গুরুত্বপূর্ণ।
- **খুব দ্রুত।** প্রায় এক সেকেন্ডে খোলে, আর ৩০টা repository থাকলেও সাথে সাথে সাড়া দেয়।
- **খুব সহজ।** Git-এ যিনি খুব একটা স্বচ্ছন্দ নন, তিনিও কারো সাহায্য ছাড়া task শুরু, commit আর pull request তৈরি করতে পারবেন, আর পরিষ্কার সতর্কবার্তা ছাড়া কোনো কাজ হারাবে না।

## ডকুমেন্ট

| ডকুমেন্ট | ইংরেজি | বাংলা |
|---|---|---|
| প্রোডাক্ট রিকোয়ারমেন্টস ডকুমেন্ট (PRD) | [PRD.en.md](docs/product/PRD.en.md) | [PRD.bn.md](docs/product/PRD.bn.md) |

## অবদান রাখা

Issue আর pull request — দুটোই স্বাগত। এই repository-র প্রতিটা ডকুমেন্ট ইংরেজি আর বাংলা দুই ভাষাতেই আছে: একটা বদলালে অন্যটাও একই pull request-এ বদলাবেন।

## License

GitHeddle একটা free software, [GNU General Public License v3.0](LICENSE)-এর অধীনে প্রকাশিত।
