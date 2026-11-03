# Installing GitHeddle

**Bangla version:** [install.bn.md](install.bn.md)

| | |
|---|---|
| **Document** | Install guide |
| **Version** | 0.1 — Draft |
| **Date** | 3 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. Applies from the first release (v0.1); no release exists yet. Requirement PLAT-12 |

**Related documents:** [PRD](../product/PRD.en.md) · [Build and release](../engineering/build-and-release.en.md) · [Security policy](../../SECURITY.md)

> This file and its Bangla version carry the same content. When one changes, update the other in the same commit.

---

## 1. Before you start

- **Git 2.30 or newer** must be installed. GitHeddle uses your own Git, with your settings and sign-ins. If Git is missing, GitHeddle tells you how to install it.
- Download GitHeddle only from the project's **GitHub Releases** page: `https://github.com/dev-taosif-net/GitHeddle/releases`.
- Pick the file for your system:

| System | File (the version number changes) |
|---|---|
| Windows 10 or 11, most PCs | `GitHeddle_<version>_x64-setup.exe` |
| Windows on ARM (for example Surface Pro X, Snapdragon laptops) | `GitHeddle_<version>_arm64-setup.exe` |
| Mac with Apple Silicon (M1, M2, M3, M4 …) | `GitHeddle_<version>_aarch64.dmg` |
| Mac with an Intel processor | `GitHeddle_<version>_x64.dmg` |
| Linux, any distribution | `GitHeddle_<version>_amd64.AppImage` |
| Ubuntu, Debian and similar | `GitHeddle_<version>_amd64.deb` |

To see which Mac you have, open the Apple menu → **About This Mac**. "Chip: Apple M…" means Apple Silicon, and "Processor: Intel" means Intel.

## 2. Why your system shows a warning

GitHeddle is free, open-source software. Windows and macOS warn about apps that aren't signed with a paid certificate:

- **Windows:** the installer is unsigned in v0.1. From v0.2 it is signed, and the warning should go away.
- **macOS:** the project doesn't have a paid Apple Developer account yet, so the app isn't notarised by Apple. macOS will warn you the first time you open it, in every version until that changes.

The warning doesn't mean the app is harmful, only that Apple or Microsoft hasn't checked it. To make sure your download is exactly the file the project published, check it as described in §3. The steps in §4–§6 open the app anyway.

## 3. Check your download (recommended)

Every release has a file called `SHA256SUMS`. It lists a fingerprint for every installer. If your file's fingerprint matches, the file is exactly what the project published.

1. Download `SHA256SUMS` from the same release page.
2. Work out your file's fingerprint:
   - **Windows:** open PowerShell in your Downloads folder and run `Get-FileHash .\GitHeddle_<version>_x64-setup.exe`
   - **macOS:** open Terminal and run `shasum -a 256 ~/Downloads/GitHeddle_<version>_aarch64.dmg`
   - **Linux:** in the download folder, run `sha256sum --ignore-missing -c SHA256SUMS`, which checks for you and prints `OK`
3. On Windows and macOS, compare the long code with the line for your file in `SHA256SUMS`. Capital or small letters don't matter. If the codes differ, don't install: delete the file, download it again, and if it still differs, report it as described in the [security policy](../../SECURITY.md).

From v0.2, `SHA256SUMS` is also signed with the project's GPG key. The key and how to check the signature are linked from the README.

## 4. Windows

1. Double-click the `.exe` file. You don't need administrator rights; GitHeddle installs for your user only.
2. If a blue box says **"Windows protected your PC"**:
   1. Click **More info**.
   2. Check that "App" says `GitHeddle_<version>_…-setup.exe`.
   3. Click **Run anyway**.
3. Follow the installer. GitHeddle appears in the Start menu.

If the app doesn't start: GitHeddle needs Microsoft Edge WebView2, which Windows 11 and up-to-date Windows 10 already have. The installer adds it if it's missing. On some company PCs it is blocked by policy; ask your IT department to allow "Microsoft Edge WebView2 Runtime".

## 5. macOS

GitHeddle needs **macOS 13.3 or newer**. On an older version, the app tells you to update macOS.

### 5.1 Install

1. Double-click the `.dmg` file.
2. Drag **GitHeddle** onto the **Applications** folder.
3. Eject the GitHeddle disk in Finder.

### 5.2 Open it the first time

1. Open **Applications** and double-click **GitHeddle**.
2. macOS shows a message. Depending on the version, it says **"Apple could not verify 'GitHeddle' is free of malware…"** or **"'GitHeddle' can't be opened because Apple cannot check it for malicious software."** Click **Done** or **OK**. Don't click **Move to Trash**.
3. Open the Apple menu → **System Settings** → **Privacy & Security**.
4. Scroll down to **Security**. You'll see "'GitHeddle' was blocked to protect your Mac." Click **Open Anyway**.
5. Enter your Mac password or use Touch ID.
6. In the box that appears, click **Open** (or **Open Anyway**).

You need to do this **once per download**, not each time you start the app.

On macOS 13 and 14 there is a shorter way: in Applications, hold **Control** and click GitHeddle, choose **Open**, then click **Open** again. macOS 15 and newer don't offer this, so use the steps above there.

### 5.3 If macOS says the app "is damaged"

Sometimes macOS says **"'GitHeddle' is damaged and can't be opened."** The file isn't damaged; macOS is blocking a downloaded app it can't check.

1. Open **Terminal** (Applications → Utilities → Terminal).
2. Paste this line and press Return: `xattr -dr com.apple.quarantine /Applications/GitHeddle.app`
3. Open GitHeddle again.

This removes only the "downloaded from the internet" mark from GitHeddle. Do it only for a file you downloaded from the project's release page and, ideally, checked as in §3.

### 5.4 After an update

GitHeddle keeps your GitHub sign-in in the macOS Keychain. Because the app isn't signed by Apple, macOS may ask once after an update whether GitHeddle may use its saved item. Enter your password and click **Always Allow**. If you click Deny, GitHeddle simply asks you to sign in to GitHub again.

## 6. Linux

### 6.1 AppImage (any distribution)

1. Make the file runnable: right-click it → **Properties** → **Permissions** → allow running it as a program, or run `chmod +x GitHeddle_<version>_amd64.AppImage` in a terminal.
2. Double-click it, or run `./GitHeddle_<version>_amd64.AppImage`.

On Ubuntu 24.04 and newer, the AppImage needs FUSE 2. If it doesn't start, install it with `sudo apt install libfuse2t64`, or run the file with `--appimage-extract-and-run` added at the end.

### 6.2 `.deb` (Ubuntu, Debian and similar)

Run `sudo apt install ./GitHeddle_<version>_amd64.deb` in the download folder. This also installs what GitHeddle needs (WebKitGTK). GitHeddle then appears in your applications menu.

### 6.3 Saving your GitHub sign-in

GitHeddle stores your sign-in through the system keyring (GNOME Keyring, KWallet or KeePassXC). If none is running, GitHeddle still works, but asks you to sign in again each time you start it. It never saves the token in a plain file.

### 6.4 Blank window

On some computers with NVIDIA graphics or Wayland, the window stays empty. Start GitHeddle from a terminal with `WEBKIT_DISABLE_DMABUF_RENDERER=1` in front of the command. GitHeddle tries to detect this case and set it itself.

## 7. Getting help

- Something in this guide doesn't match what you see: open an issue on GitHub with your system version and a screenshot.
- You think a download was tampered with: don't post it publicly; follow the [security policy](../../SECURITY.md).

## 8. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 3 November 2026 | First version, written for the first release. macOS builds are ad-hoc signed because there is no Apple Developer account yet (PLAT-11). |
