# GitHeddle install করা

**English version:** [install.en.md](install.en.md)

| | |
|---|---|
| **ডকুমেন্ট** | Install guide |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। প্রথম release (v0.1) থেকে প্রযোজ্য; এখনো কোনো release বের হয়নি। Requirement PLAT-12 |

**সম্পর্কিত ডকুমেন্ট:** [PRD](../product/PRD.bn.md) · [Build ও release](../engineering/build-and-release.bn.md) · [Security policy](../../SECURITY.bn.md)

> এই file আর এর ইংরেজি সংস্করণে একই content আছে। একটা বদলালে অন্যটাও একই commit-এ update করতে হবে।

---

## ১. শুরুর আগে

- **Git 2.30 বা নতুন** install করা থাকতে হবে। GitHeddle আপনার নিজের Git ব্যবহার করে, আপনার setting আর sign-in সহ। Git না থাকলে GitHeddle বলে দেবে কীভাবে install করতে হয়।
- GitHeddle শুধু project-এর **GitHub Releases** page থেকে download করুন: `https://github.com/dev-taosif-net/GitHeddle/releases`।
- আপনার system-এর জন্য ঠিক file-টা বেছে নিন:

| System | File (version নম্বর বদলাবে) |
|---|---|
| Windows 10 বা 11, বেশিরভাগ PC | `GitHeddle_<version>_x64-setup.exe` |
| ARM-এ চলা Windows (যেমন Surface Pro X, Snapdragon laptop) | `GitHeddle_<version>_arm64-setup.exe` |
| Apple Silicon-ওয়ালা Mac (M1, M2, M3, M4 …) | `GitHeddle_<version>_aarch64.dmg` |
| Intel processor-ওয়ালা Mac | `GitHeddle_<version>_x64.dmg` |
| Linux, যেকোনো distribution | `GitHeddle_<version>_amd64.AppImage` |
| Ubuntu, Debian আর এই ধরনের | `GitHeddle_<version>_amd64.deb` |

আপনার Mac কোনটা, তা দেখতে Apple menu → **About This Mac** খুলুন। "Chip: Apple M…" লেখা থাকলে Apple Silicon, আর "Processor: Intel" লেখা থাকলে Intel।

## ২. আপনার system কেন সতর্কবার্তা দেখায়

GitHeddle বিনামূল্যের, open-source software। টাকা দিয়ে কেনা certificate দিয়ে sign করা না থাকলে Windows আর macOS সেই app নিয়ে সতর্ক করে:

- **Windows:** v0.1-এ installer unsigned। v0.2 থেকে এটা signed হবে, তখন সতর্কবার্তা আর আসার কথা নয়।
- **macOS:** Project-এর এখনো টাকা দিয়ে নেওয়া Apple Developer account নেই, তাই app-টা Apple notarise করেনি। এটা না বদলানো পর্যন্ত প্রতিটা version-এ প্রথমবার খোলার সময় macOS সতর্ক করবে।

সতর্কবার্তার মানে এই নয় যে app-টা ক্ষতিকর; শুধু এটুকু যে Apple বা Microsoft এটা যাচাই করেনি। আপনার download করা file-টা হুবহু project-এর publish করা file কি না, তা নিশ্চিত হতে §৩-এ বলা উপায়ে মিলিয়ে নিন। §৪–§৬-এর ধাপগুলো দিয়ে তবুও app খোলা যায়।

## ৩. Download মিলিয়ে দেখুন (করা ভালো)

প্রতিটা release-এ `SHA256SUMS` নামে একটা file থাকে। এতে প্রতিটা installer-এর একটা আঙুলের ছাপ (fingerprint) লেখা থাকে। আপনার file-এর fingerprint মিলে গেলে বুঝবেন file-টা হুবহু project যা publish করেছে তাই।

1. একই release page থেকে `SHA256SUMS` download করুন।
2. আপনার file-এর fingerprint বের করুন:
   - **Windows:** Downloads folder-এ PowerShell খুলে চালান `Get-FileHash .\GitHeddle_<version>_x64-setup.exe`
   - **macOS:** Terminal খুলে চালান `shasum -a 256 ~/Downloads/GitHeddle_<version>_aarch64.dmg`
   - **Linux:** download folder-এ চালান `sha256sum --ignore-missing -c SHA256SUMS`, এটা নিজেই মিলিয়ে `OK` লিখে দেয়
3. Windows আর macOS-এ লম্বা code-টা `SHA256SUMS`-এ আপনার file-এর লাইনের সাথে মিলিয়ে দেখুন। বড় হাত বা ছোট হাতের অক্ষরে কিছু যায় আসে না। Code না মিললে install করবেন না: file-টা মুছে আবার download করুন, তারপরও না মিললে [security policy](../../SECURITY.bn.md)-তে যেভাবে বলা আছে সেভাবে জানান।

v0.2 থেকে `SHA256SUMS` project-এর GPG key দিয়েও sign করা থাকবে। Key আর signature কীভাবে যাচাই করতে হয়, তার link README-তে আছে।

## ৪. Windows

1. `.exe` file-টায় double-click করুন। Administrator অধিকার লাগে না; GitHeddle শুধু আপনার user-এর জন্য install হয়।
2. যদি একটা নীল box-এ লেখা আসে **"Windows protected your PC"**:
   1. **More info**-তে click করুন।
   2. দেখে নিন "App"-এর পাশে `GitHeddle_<version>_…-setup.exe` লেখা আছে।
   3. **Run anyway**-তে click করুন।
3. Installer-এর ধাপগুলো অনুসরণ করুন। GitHeddle Start menu-তে চলে আসবে।

App চালু না হলে: GitHeddle-এর Microsoft Edge WebView2 লাগে, যেটা Windows 11 আর update করা Windows 10-এ আগে থেকেই থাকে। না থাকলে installer নিজেই সেটা যোগ করে। কিছু অফিসের PC-তে policy দিয়ে এটা বন্ধ করা থাকে; সেক্ষেত্রে IT বিভাগকে "Microsoft Edge WebView2 Runtime" চালু করতে বলুন।

## ৫. macOS

GitHeddle-এর জন্য **macOS 13.3 বা নতুন** লাগে। পুরোনো version-এ app নিজেই macOS update করতে বলবে।

### ৫.১ Install

1. `.dmg` file-টায় double-click করুন।
2. **GitHeddle**-কে টেনে **Applications** folder-এর ওপর ছেড়ে দিন।
3. Finder-এ GitHeddle disk-টা eject করুন।

### ৫.২ প্রথমবার খোলা

1. **Applications** খুলে **GitHeddle**-এ double-click করুন।
2. macOS একটা বার্তা দেখাবে। Version অনুযায়ী লেখা থাকবে **"Apple could not verify 'GitHeddle' is free of malware…"** অথবা **"'GitHeddle' can't be opened because Apple cannot check it for malicious software."** **Done** বা **OK**-তে click করুন। **Move to Trash**-এ click করবেন না।
3. Apple menu → **System Settings** → **Privacy & Security** খুলুন।
4. নিচে **Security** অংশে scroll করুন। সেখানে লেখা থাকবে "'GitHeddle' was blocked to protect your Mac."। **Open Anyway**-তে click করুন।
5. আপনার Mac-এর password দিন, বা Touch ID ব্যবহার করুন।
6. যে box আসবে তাতে **Open** (বা **Open Anyway**)-এ click করুন।

এটা **প্রতিটা download-এ একবার** করতে হয়, প্রতিবার app চালুর সময় নয়।

macOS 13 আর 14-এ একটা ছোট উপায় আছে: Applications-এ **Control** চেপে ধরে GitHeddle-এ click করুন, **Open** বেছে নিন, তারপর আবার **Open**-এ click করুন। macOS 15 আর নতুন version-এ এই উপায় নেই, সেখানে ওপরের ধাপগুলো ব্যবহার করুন।

### ৫.৩ macOS যদি বলে app-টা "is damaged"

কখনো কখনো macOS বলে **"'GitHeddle' is damaged and can't be opened."**। File-টা আসলে নষ্ট নয়; macOS যে downloaded app যাচাই করতে পারে না, সেটাকে আটকে দিচ্ছে।

1. **Terminal** খুলুন (Applications → Utilities → Terminal)।
2. এই লাইনটা paste করে Return চাপুন: `xattr -dr com.apple.quarantine /Applications/GitHeddle.app`
3. আবার GitHeddle খুলুন।

এটা শুধু GitHeddle থেকে "internet থেকে download করা" চিহ্নটা সরায়। শুধু সেই file-এর জন্যই এটা করুন যেটা project-এর release page থেকে download করেছেন, আর সম্ভব হলে §৩-এর মতো মিলিয়ে দেখেছেন।

### ৫.৪ Update-এর পরে

GitHeddle আপনার GitHub sign-in macOS Keychain-এ রাখে। App-টা Apple দিয়ে sign করা নয় বলে update-এর পরে macOS একবার জিজ্ঞেস করতে পারে GitHeddle তার সেভ করা item ব্যবহার করতে পারবে কি না। Password দিয়ে **Always Allow**-তে click করুন। Deny-তে click করলে GitHeddle শুধু আবার GitHub-এ sign in করতে বলবে।

## ৬. Linux

### ৬.১ AppImage (যেকোনো distribution)

1. File-টা চালানোর যোগ্য করুন: right-click → **Properties** → **Permissions** → program হিসেবে চালানোর অনুমতি দিন, অথবা terminal-এ চালান `chmod +x GitHeddle_<version>_amd64.AppImage`।
2. Double-click করুন, অথবা চালান `./GitHeddle_<version>_amd64.AppImage`।

Ubuntu 24.04 আর নতুন version-এ AppImage-এর FUSE 2 লাগে। চালু না হলে `sudo apt install libfuse2t64` দিয়ে install করুন, অথবা file-টা শেষে `--appimage-extract-and-run` যোগ করে চালান।

### ৬.২ `.deb` (Ubuntu, Debian আর এই ধরনের)

Download folder-এ চালান `sudo apt install ./GitHeddle_<version>_amd64.deb`। এতে GitHeddle-এর যা লাগে (WebKitGTK) সেটাও install হয়ে যায়। তারপর GitHeddle আপনার application menu-তে চলে আসবে।

### ৬.৩ GitHub sign-in সেভ রাখা

GitHeddle আপনার sign-in system-এর keyring দিয়ে রাখে (GNOME Keyring, KWallet বা KeePassXC)। কোনোটাই চালু না থাকলেও GitHeddle কাজ করবে, তবে প্রতিবার চালুর সময় আবার sign in করতে বলবে। Token কখনো সাধারণ file-এ সেভ করা হয় না।

### ৬.৪ ফাঁকা window

NVIDIA graphics বা Wayland-ওয়ালা কিছু computer-এ window ফাঁকা থেকে যায়। Terminal থেকে command-এর সামনে `WEBKIT_DISABLE_DMABUF_RENDERER=1` বসিয়ে GitHeddle চালু করুন। GitHeddle নিজেও এই অবস্থা ধরে নিজে থেকে এটা বসানোর চেষ্টা করে।

## ৭. সাহায্য পাওয়া

- এই guide-এর কোনো কিছু আপনি যা দেখছেন তার সাথে না মিললে: আপনার system-এর version আর একটা screenshot দিয়ে GitHub-এ একটা issue খুলুন।
- কোনো download-এ কারসাজি হয়েছে বলে মনে হলে: প্রকাশ্যে post করবেন না; [security policy](../../SECURITY.bn.md) অনুসরণ করুন।

## ৮. পরিবর্তনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ৩ নভেম্বর ২০২৬ | প্রথম সংস্করণ, প্রথম release-এর জন্য লেখা। এখনো Apple Developer account নেই বলে macOS build ad-hoc signed (PLAT-11)। |
