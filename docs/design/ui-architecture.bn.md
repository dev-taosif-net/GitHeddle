# GitHeddle — UI architecture

**English version:** [ui-architecture.en.md](ui-architecture.en.md)

| | |
|---|---|
| **ডকুমেন্ট** | UI architecture (`apps/desktop/src`-এর frontend design) |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। ADR 0001 মেনে লেখা। যেসব জায়গায় "M1-এ যাচাই" লেখা আছে, সেগুলো M1 spike-এর ফলাফলের উপর নির্ভর করে |

**সম্পর্কিত ডকুমেন্ট:** [PRD](../product/PRD.bn.md) · [ADR 0001 — Technology stack](../decisions/0001-tech-stack.bn.md) · [Architecture](../architecture/architecture.bn.md) · [Build ও release](../engineering/build-and-release.bn.md) · [Test strategy](../engineering/test-strategy.bn.md) · [Security](../engineering/security.bn.md) · [AI development workflow](../process/ai-development-workflow.bn.md) · [Roadmap](../plan/roadmap.bn.md)

> এই file আর এর ইংরেজি সংস্করণে একই content আছে। একটা বদলালে অন্যটাও একই commit-এ update করতে হবে।

---

## ১. উদ্দেশ্য ও পরিধি

GitHeddle-এর user interface কীভাবে বানানো হবে, এই ডকুমেন্টে সেটা বলা আছে। UI হলো `apps/desktop/src`-এর React app, যেটা Tauri 2-এর webview-এর ভেতরে চলে। এখানে আছে folder, screen, state, Rust core-এর সাথে UI কীভাবে কথা বলে, design token, component, আর কঠিন screen-গুলো (Changes, diff view, merge editor, pipeline run grid)। Keyboard, accessibility, লেখার ভাষা, webview compatibility আর performance-এর নিয়মও এখানে।

Rust crate, packaging বা পুরো test plan এখানে নেই; সেগুলো architecture, build-and-release আর test-strategy ডকুমেন্টে আছে। Screen-এর sketch PRD §৮-এ আছে, এখানে আবার আঁকা হয়নি।

Stack ADR 0001-এ ঠিক করা: React 19, সাথে TypeScript strict আর Vite; Zustand; TanStack Query; CSS custom-property design token-এর উপরে Tailwind CSS v4; React Aria Components; cmdk; CodeMirror 6, সাথে `@codemirror/merge`; আর TanStack Virtual। M0-তে প্রতিটার সর্বশেষ stable version pin করতে হবে।

## ২. মূলনীতি

1. **সিদ্ধান্ত নেয় core, UI শুধু দেখায়।** Git state, diff, merge alignment, preview আর safety check — সব Rust-এ হিসাব হয়। UI কখনো Git-এর output parse করে না, আর কোনো action নিরাপদ কি না সেটাও ঠিক করে না (SAFE-01..07)।
2. **আগে সাড়া, পরে data।** Core থেকে উত্তর আসার আগেই প্রতিটা click-এ চোখে পড়ার মতো কিছু বদলাবে (PERF-03)।
3. **এক সমস্যার এক সমাধান।** একটাই action flow (preview → run → result), একটাই command registry, একটাই aligned-pane editor layer, একটাই token set। নতুন screen এগুলোই ব্যবহার করবে, নিজের আলাদা কিছু বানাবে না।
4. **Keyboard আর screen reader "শেষ হয়েছে"-র অংশ।** কোনো component তখনই শেষ, যখন সেটা mouse ছাড়া চলে আর তার নাম ও role ঠিক থাকে (UX-05, UX-08)।
5. **সবচেয়ে দুর্বল webview-কে ধরে লেখা।** শুধু সেই feature-গুলো ব্যবহার হবে, যেগুলো WebView2, WKWebView আর WebKitGTK — তিনটাতেই চলে (§১৭)।
6. **AI agent-এর জন্য সহজে মানা যায় এমন।** কড়া folder নিয়ম, generated type আর ছোট file — যাতে Claude Code session কোনো পরিবর্তনের একমাত্র সঠিক জায়গাটা সহজে খুঁজে পায়।

## ৩. `apps/desktop/src`-এর folder গঠন

| Folder | কী থাকে | নিয়ম |
|---|---|---|
| `app/` | Entry point, `AppShell` (top bar, sidebar, centre, right panel, bottom bar), provider (query client, theme, platform-এর তথ্য), সবার উপরের error boundary | এখানে কোনো screen-এর logic নয় |
| `screens/<screen>/` | §৪-এর প্রতিটা screen-এর জন্য একটা folder: তার component, hook আর শুধু সেই screen-এর state | এক screen অন্য screen থেকে import করবে না। ভাগাভাগির জিনিস `components/`-এ যাবে |
| `components/` | ভাগাভাগি করা custom component: status অক্ষর, repo badge, empty state, error message, key hint, splitter, target picker | শুধু `ui/` আর token-এর উপর বানানো |
| `ui/` | React Aria Components-এর উপর পাতলা, style করা wrapper (button, checkbox, menu, dialog, table, combo box …) | একমাত্র এই folder সরাসরি `react-aria-components` import করে |
| `flows/` | ভাগাভাগি করা preview → run → result flow (§৭) | প্রতিটা bulk action, task action আর pipeline এটা ব্যবহার করে |
| `editor/` | CodeMirror-এর সব কিছু: সাধারণ setup, token থেকে বানানো editor theme, lazy language loading, aligned-pane layer, diff view আর merge editor | একমাত্র এই folder CodeMirror import করে |
| `stores/` | Zustand store (§৫) | Store-এ data আর action থাকে। Store render করে না, সরাসরি Tauri-ও call করে না |
| `ipc/` | `tauri-specta` থেকে generated binding (হাতে কখনো edit হবে না), core facade, event router আর error mapping (§৬) | একমাত্র এই folder `@tauri-apps/api` import করে |
| `commands/` | Command registry, keybinding, palette-এর source (§১৪) | User-এর প্রতিটা action এখানে register হয় |
| `styles/` | Light আর dark-এর token file, Tailwind entry, bundle করা font | রং, মাপ আর font শুধু এখানেই define হয় |
| `copy/` | User যত লেখা দেখেন তার সব, আর error message-এর template (§১৬) | Component লেখা এখান থেকে নেয়, নিজে literal লেখে না |
| `a11y/` | Live announcer, focus helper, skip-to-content target | |
| `lib/` | Pure helper: path দেখানো, platform-এর key-এর নাম, সংখ্যা আর সময় format করা | React নেই, I/O নেই |
| `testing/` | Fake core, scenario fixture আর test helper (§৬.৩) | Production bundle-এ যায় না |

Unit আর component test যে file test করে, তার পাশেই থাকে। Playwright spec কোথায় থাকবে তা test strategy ঠিক করে। একটা CI check বাতিল করে:

- `styles/`-এর বাইরে রঙের literal বা arbitrary Tailwind value
- উপরের table-এর নিয়ম ভাঙা import
- Generated binding-এ হাতে করা পরিবর্তন

## ৪. Screen আর navigation

| Screen | PRD §৮-এর screen | প্রধান requirement | মন্তব্য |
|---|---|---|---|
| Repositories | Repositories (default) | DASH-01..08, GRP-03 | Sorting, filtering আর row checkbox-সহ React Aria table (DASH-05)। ১–৫০টা repo-তে (scale-এর লক্ষ্য) virtualisation লাগে না |
| Changes | Changes | CHG-01..10, BULK-06 | Virtualised list বা tree, সাথে diff view আর commit box (§১০, §১১) |
| Pull Requests | Pull Requests | PR-05, PR-11 (v0.1); PR-06, PR-07 (v0.2) | v0.1-এ শুধু active task-এর pull request আর তাদের status দেখায় (PR-05)। তিনটা list (আমার তৈরি, আমার কাছে review চাওয়া, বর্তমান task, PR-06) P1, তাই v0.2-এ আসবে |
| Conflicts | Conflicts | CONF-01, CONF-02, CONF-10, CONF-11 | Merge বা rebase চলছে এমন repo, তাদের conflicted file, Continue / Abort / Continue all |
| Merge editor | Conflicts থেকে খোলে | CONF-03..09, CONF-12 | Conflicts-এর একটা sub-view, নিজস্ব keyboard scope সহ (§১২) |
| Pipelines | Pipelines | PIPE-01..14 | তালিকা, editor, run grid আর run history (§১৩) |
| Task | Task | TASK-01..08, PR-02, PR-03 | Task-এর repo, branch আর pull request, সাথে তার action |
| Activity log | Activity log | BULK-08 | Virtualised, শুধু-পড়ার list: command, exit code, সময় আর output |
| Settings | Settings | CFG-01, CFG-02, PLAT-06 | React Aria field দিয়ে বানানো form |
| First run | Flow ০ | UX-01 | ধাপগুলো বাদ দেওয়া যায়; শেষে dashboard খোলে |

যেকোনো screen-এর উপরে যেসব overlay বসে: command palette (§১৪), action-flow dialog (§৭), আর PRD §৮ "Main window"-এর right details panel ও bottom bar।

**Navigation.** কোনো router library নেই, URL bar-ও নেই। একটা ছোট `navigation` store বর্তমান screen, তার parameter (যেমন repo আর file) আর পেছনে/সামনে যাওয়ার history রাখে। Back আর forward হলো Windows ও Linux-এ Alt+Left / Alt+Right, macOS-এ ⌘[ / ⌘]। Sidebar-এর সংখ্যাগুলো (Changes 8, Conflicts 1) store-এর উপর selector। শেষ screen, layout আর filter core-এর settings storage-এ save হয়, webview storage-এ নয় (UX-09)।

## ৫. State architecture

### ৫.১ Store

| Store | কী রাখে | কোথা থেকে data আসে |
|---|---|---|
| `workspace` | Workspace, ID অনুযায়ী repo, group, task, active task, বর্তমান target set | শুরুতে command, তারপর event |
| `repoState` | প্রতিটা repo-র status (branch, ahead/behind, সংখ্যা, চলমান operation, conflict), প্রতিটা repo-র একটা version নম্বর সহ | Repo-state event (delta) |
| `changes` | প্রতিটা repo-র changed file, section অনুযায়ী (Merge Changes, Staged, Changes), `+/−` সংখ্যা আর status অক্ষর সহ | Change-list event (প্রতি repo-র delta) |
| `jobs` | চলমান আর শেষ হওয়া bulk action ও pipeline run: প্রতি repo আর প্রতি step-এর state, progress, ফলাফল | Job event |
| `ui` | Layout, pane-এর মাপ, theme, zoom, filter, ভাঁজ করা section, selection আর focus-এর anchor | User-এর action। Core-এর মাধ্যমে save হয় (UX-09) |
| `navigation` | বর্তমান screen, তার parameter আর history | User-এর action |

যে data চাইলে পরে আসে (diff-এর content, commit history, settings, pull request-এর বিস্তারিত, preview), সেটা store-এ নয়, TanStack Query দিয়ে চলে। প্রতিটা query-র key হলো যা দিয়ে content চেনা যায়, যেমন diff-এর জন্য repo + path + revision।

### ৫.২ Event subscription

1. শুরুতে `ipc/` generated binding-এর প্রতিটা typed core event-এ একবার subscribe করে, আর প্রতিটা event তার store-এ পাঠায়। Component নিজে কখনো Tauri event-এ subscribe করে না।
2. Core পুরো snapshot নয়, ছোট delta পাঠায়। প্রতিটা event-এ repo-ভিত্তিক একটা sequence নম্বর থাকে।
3. Event router আসা delta জমিয়ে রাখে আর **প্রতি animation frame-এ একবার** store-এ লাগায়। ৩০টা repo-র update একসাথে এলে render হয় একবার, ৩০ বার নয়।
4. Window আবার focus পেলে (DASH-04) core repo-গুলো refresh করে আর সাধারণ delta পাঠায়, তাই UI-কে আলাদা কিছু করতে হয় না। শুধু কোনো sequence নম্বর বাদ পড়লে router সেই repo-র নতুন snapshot core-এর কাছে চায় আর পুরনো entry বদলে দেয়।
5. শুরুতে store আগে core-এর cache থেকে শেষ জানা state load করে, তাই dashboard সাথে সাথে দেখা যায় (PERF-02)। তারপর live state সেটা বদলে দেয়।
6. কিছু data শুধু তখনই তৈরি হয়, যখন কোনো screen-এর সেটা লাগে। Changes screen খুললে প্রতি file-এর line সংখ্যার update-এ subscribe করে, আর বন্ধ হলে unsubscribe করে, কারণ core শুধু ওই screen দেখা যাওয়ার সময়ই line সংখ্যা পড়ে (architecture §৭)।

### ৫.৩ Selector আর ৫,০০০ row হালকা রাখা

- Data normalise করা থাকে: ID অনুযায়ী repo, আর স্থির key (repo ID + section + path) অনুযায়ী file। Row শুধু একটা key পায়, নিজের data নিজে select করে।
- Component তার যতটুকু দরকার শুধু ততটুকু select করে, shallow equality দিয়ে। কোনো row কখনো পুরো map বা array select করে না।
- Derived data (Changes screen-এর flat row list, filter করা list, সংখ্যা) input বদলালে একবার হিসাব হয়, আর memoise হয় **প্রতি repo আলাদাভাবে**। এক repo বদলালে শুধু সেই repo-র অংশ নতুন করে বানানো হয়।
- Store update শুধু বদলানো entry-গুলো replace করে। ফলে যে row বদলায়নি, তার object একই থাকে আর re-render হয় না।
- Filter-এর text input-এ React-এর deferred value ব্যবহার হয়। ফলে টাইপ করা মসৃণ থাকে, list পরে ধরে ফেলে।
- M0-তে React 19-এর জন্য React Compiler stable থাকলে সেটা চালু করা হবে (M0-তে যাচাই)। এটা নিজে থেকেই memoisation যোগ করে, ফলে AI-এর লেখা re-render bug-এর একটা পুরো শ্রেণি দূর হয়।

## ৬. UI কীভাবে core-এর সাথে কথা বলে

### ৬.১ Generated binding

- `tauri-specta` প্রতিটা command, event আর data type-এর TypeScript binding `ipc/`-এ generate করে। Rust দিক বদলালো কিন্তু UI update হলো না — এমন হলে TypeScript compile হবে না। ফলে অমিল ship হতে পারে না।
- `ipc/` binding-গুলোকে একটা **core facade**-এ মুড়ে রাখে: এলাকা অনুযায়ী ভাগ করা নামওয়ালা async function (repos, changes, diff, merge, jobs, pipelines, GitHub, settings)। Screen আর store facade-কে call করে, binding-কে সরাসরি কখনো নয়।
- প্রতিটা ব্যর্থতা একটা typed `UserError` হয়ে ফেরে: একটা স্থির code আর তার parameter (repo, step, আর message-এর দরকারি যেকোনো মান), সাথে বিস্তারিত হিসেবে Git-এর আসল output। Core কোনো বাক্য পাঠায় না। `ipc/` code-টাকে `copy/`-এর একটা message template-এ map করে, আর সব লেখার মালিক `copy/` (§১৬, UX-04)।
- বড় content, যেমন diff আর merge editor-এর file text, দরকার হলে নিজস্ব command দিয়ে আনা হয়। State event-এর সাথে কখনো আসে না। ধারাবাহিক output (activity log বা run cell-এর live Git output) Tauri channel দিয়ে আসে।
- Webview কখনো GitHub token পায় না, আর তার কাছে কোনো shell বা file-system plugin নেই (Security ডকুমেন্ট)। File editor-এ, terminal-এ বা file manager-এ খোলা একটা core command।

### ৬.২ Platform-এর তথ্য

কোন operating system, system কোন theme চায়, আর key-গুলোর নাম কী — এগুলো core UI-কে জানায়। UI user agent দেখে অনুমান করে না। এই তথ্য দিয়েই shortcut দেখানো হয় (PLAT-05), আর platform অনুযায়ী layout-এর অল্প কিছু খুঁটিনাটি ঠিক হয়।

### ৬.৩ Test-এর জন্য fake core আর mocked IPC

- `testing/`-এ একটা **fake core** থাকে: একই facade-এর একটা implementation, যেটা scenario data থেকে চলে আর Tauri-র IPC mock (`@tauri-apps/api/mocks`) দিয়ে যুক্ত।
- **Default-ভাবে scenario তৈরি হয় IPC transcript থেকে**, যেগুলো core contract test (test strategy-র L3) আসল fixture repo থেকে রেকর্ড করে। তখন একটা scenario মানে সেই fixture run-এর আসল request, response আর event।
- **অনুমোদিত ব্যতিক্রম হলো scripted scenario।** এগুলোও generated binding দিয়ে typed, আর নামে ও test report-এ "scripted" চিহ্ন দেওয়া থাকে। শুধু তিন ধরনের অনুমতি আছে:
  - সময় আর event-এর ঝড়ের script, যেমন "২০০ ms পরে app-api repo MERGING হবে, ৩টা conflict নিয়ে", বা একসাথে ৩০টা repo update হওয়া
  - বিরল error, যেগুলো আসল repo দিয়ে ঘটানো কঠিন
  - বড় মাপের ক্ষেত্র, যেমন ৫,০০০টা changed file
- রেকর্ড করা হোক বা scripted, প্রতিটা scenario generated binding দিয়ে typed। তাই কোনোটা core-এর সাথে আর না মিললে compile হবে না। শুরুর set:
  - খালি workspace (রেকর্ড করা)
  - ৬টা clean repo (রেকর্ড করা)
  - মিশ্র অবস্থার ৩০টা repo (রেকর্ড করা)
  - ৫,০০০টা changed file (scripted, বড় মাপ)
  - ৩টা conflicted file সহ একটা merge, আর একই রকম একটা rebase ও একটা cherry-pick (রেকর্ড করা)
  - conflict-এ থেমে থাকা একটা pipeline run (রেকর্ড করা)
  - offline / GitHub থেকে sign out (scripted, বিরল error)
  - review লাগবে এমন repo সহ একটা workspace (রেকর্ড করা, §৭.১) আর একটা বদলানো team file (রেকর্ড করা, §৭.২)
- Vitest component test, Chromium আর WebKit-এ Playwright test (`@axe-core/playwright` আর screenshot সহ), আর M1-এর performance spike — সবাই এই একই fake core ব্যবহার করে।
- **Owner কীভাবে UI-এর কাজ যাচাই করবেন:** CI প্রতিটা scenario-র Playwright HTML report আর screenshot, দুই theme আর দুই engine-এ, build artifact হিসেবে publish করে। Owner browser-এ সেগুলো দেখেন। Local-এ কিছু build করতে হয় না।

## ৭. Preview → run → result: একটাই ভাগাভাগি করা flow

যে action কিছু বদলায়, সেটা `flows/`-এর একই component আর hook ব্যবহার করে (UX-03, PRD §৮ "UX-এর নিয়ম")। Fetch-এর মতো শুধু-পড়ার action preview বাদ দেয় (BULK-03)।

1. **শুরু।** একটা command (button, shortcut বা palette) action-এর ধরন আর target set দিয়ে flow শুরু করে। Flow সাথে সাথে loading অবস্থায় খোলে (PERF-03)।
2. **Preview।** Core একটা plan ফেরত দেয়: প্রতি repo-র জন্য একটা row, যাতে থাকে কী হবে, তার warning (dirty tree, diverged, protected branch, কিছু করার নেই), আর দরকারি কোনো পছন্দ। পছন্দের উদাহরণ হলো SAFE-04-এর জন্য Stash / Skip this repo / Cancel। Preview দেখায়:
   - প্রতি repo-তে একটা checkbox, যাতে সেটা বাদ দেওয়া যায় (BULK-03)
   - যেসব row-এ পছন্দ লাগে, সেখানে row-এর ভেতরেই পছন্দের control
   - পুরো run-এর জন্য একটাই confirmation block, যাতে protected branch-এ প্রতিটা push আর প্রতিটা force-with-lease push-এর তালিকা থাকে (SAFE-01, SAFE-02, PIPE-05)
   - Destructive action-এ ঠিক কী কী হারাবে তার তালিকা, আর Run button-এর নাম সেই ক্ষতির নামে, যেমন "Discard 3 files" (SAFE-03)

   সব দরকারি পছন্দ আর confirmation না দেওয়া পর্যন্ত Run বন্ধ থাকে।
3. **Run।** Core একটা job ID দেয় আর flow তার dialog বন্ধ করে। Job চলতে থাকে bottom bar আর `jobs` store-এ, তাই user কাজ চালিয়ে যেতে পারেন (PERF-05)। Progress view-এ প্রতিটা repo দেখায় waiting, running, done, skipped (কিছু করার নেই, বা শুরুর আগেই cancel হয়েছে), paused বা failed। Cancel button-এর label বলে দেয় cancel করলে কী হয়: নতুন কোনো repo শুরু হবে না, আর যে Git command চলছে সেটা শেষ হবে (BULK-04)। Pipeline-এ list-এর বদলে run grid দেখায় (§১৩)।
4. **Result।** সারাংশে সফল, বাদ যাওয়া, থেমে থাকা আর ব্যর্থ repo-র সংখ্যা, তারপর repo-র row। প্রতিটা ব্যর্থতায় step, সহজ message আর এরপর কী করতে হবে দেখায়, সাথে Show Git output, Retry failed, Open terminal আর Show log (BULK-05, UX-04)। Preview আর run-এর মাঝে কোনো repo বদলে গেলে core-এর preflight সেটাকে কারণ সহ pause করে, আর row-এ সেটা Resume আর Stop সহ বলা থাকে (SAFE-07, architecture §৯)। Core নিরাপদ বললে Undo দেখায় (BULK-09, UX-10)। Dismiss না করা পর্যন্ত ফলাফল bottom bar থেকে খোলা যায়।

নতুন action নিজের ধরন, preview আর run command, আর নিজের লেখা register করে যুক্ত হয়। তারা নিজেদের dialog বানায় না।

### ৭.১ Repo trust prompt (security GS-08)

Core যখন workspace-এ repo যোগ করে (প্রথমবার চালানো, folder খোলা, repo যোগ করা), তখন প্রতিটা repo-র local config-এ এমন setting আছে কি না দেখে, যেটা Git-কে দিয়ে কোনো program চালাবে: command-মানের `core.fsmonitor` (`true` বা `false` নয়), `core.sshCommand`, `core.pager` বা `core.editor` override, filter, diff আর merge driver, আর `include.path` / `includeIf`-এর target। UI ফলাফলটা এভাবে দেখায়:

1. **প্রতি workspace-এ একবার, তালিকা সহ জিজ্ঞেস করা।** একটাই dialog, শিরোনাম যেমন "3 repos need review before GitHeddle runs Git in them"। এতে চিহ্নিত প্রতিটা repo আর তাতে পাওয়া প্রতিটা setting তার মান সহ সাধারণ লেখা হিসেবে থাকে। প্রতি repo-র জন্য আলাদা dialog কখনো নয়।
2. প্রতিটা row-এ একটা checkbox, default-ভাবে tick দেওয়া। Dialog-এ দুটো button: "Trust selected repos" আর "Not now"। Tooltip আর help-এর লেখা এক বাক্যে বলে trust করা মানে কী: "GitHeddle will run Git here, and Git will run these programs."
3. **বিশ্বাস না করা repo dashboard-এ "Needs review" দেখায়**: row ঝাপসা, status-এর জায়গায় একটা Review button। Trust না করা পর্যন্ত GitHeddle সেখানে কোনো Git command-ই চালায় না, background status-ও নয়। এটা UI নয়, core-এর command guard নিশ্চিত করে। এরা target set থেকে বাদ যায়, আর preview এদের "skipped: needs review" হিসেবে দেখায়।
4. Core trust রাখে repo-র path আর config-এর একটা hash অনুযায়ী। Config বদলালে repo আবার "Needs review"-এ ফেরে, আর পরের prompt শুধু যা বদলেছে তা দেখায়।
5. প্রথমবার চালানোর সময় (UX-01) prompt-টা folder-এর ধাপের পরে একটা বাদ দেওয়া যায় এমন ধাপ। বাদ দিলে repo-গুলো "Needs review" থাকে।

### ৭.২ Team file অনুমোদনের screen (security UN-06)

Team file (CFG-03) P1, তাই এই screen তার সাথে v0.2-এ আসবে। নতুন বা বদলানো `.githeddle.json` team file user অনুমোদন না করা পর্যন্ত কোনো প্রভাব ফেলে না:

1. Core এটাকে schema দিয়ে যাচাই করে। যে file কোনো program (editor, terminal, merge tool)-এর নাম দেয়, বা যাতে Run Git command step থাকে, সেটা বাতিল হয়, আর error message field-টার নাম বলে।
2. ঠিক থাকা নতুন বা বদলানো file একটা কাজ না আটকানো notice দেখায়: "The team file for acme-works changed. Review it"। Review screen দেখায় কী কী বদলাবে, ধরন অনুযায়ী ভাগ করে: group, branch pattern, template, default reviewer আর pipeline। প্রতিটা জিনিস added, changed বা removed হিসেবে, পুরনো আর নতুন মান পাশাপাশি।
3. শুধু দুটো button: "Apply team settings" আর "Keep my current settings"। User apply না করা পর্যন্ত পুরনো team setting (বা কিছুই না) চালু থাকে।
4. Team file থেকে আসা pipeline-গুলো Pipelines তালিকায় তাদের উৎস সহ চিহ্নিত থাকে, আর সবসময় সাধারণ preview-এর মধ্য দিয়ে যায় (§৭, PIPE-05)।

## ৮. Design token আর theme

সব মাপ `rem`-এ, আর সব রং `styles/`-এ define করা role token। Tailwind utility token-কে দেখায়, আর component কখনো সরাসরি value ব্যবহার করে না। Value M0-তে ঠিক হয় আর নিচের contrast test দিয়ে যাচাই হয়।

| দল | Role |
|---|---|
| Surface | `surface-base`, `surface-raised` (panel), `surface-sunken` (editor, list), `surface-overlay` (menu, dialog), `surface-hover`, `surface-selected`, `surface-selected-inactive` |
| লেখা | `text-primary`, `text-secondary` (ঝাপসা folder path, CHG-02), `text-disabled`, `text-on-accent`, `text-link` |
| রেখা | `border-subtle`, `border-strong`, `focus-ring` |
| Action | `accent` (প্রধান button), `accent-hover`, `danger-action` |
| Feedback | `success`, `warning`, `danger`, `info`, প্রতিটার সাথে মানানসই হালকা background |
| Git status অক্ষর | `status-modified` (M), `status-added` (A), `status-deleted` (D), `status-renamed` (R), `status-untracked` (U), `status-conflicted` (!) |
| Diff | `diff-inserted-line`, `diff-deleted-line`, `diff-inserted-word`, `diff-deleted-word`, `diff-spacer` (দাগকাটা ফাঁকা অংশ), `diff-gutter` |
| Merge | `merge-incoming`, `merge-current`, `merge-auto-applied` (CONF-05), `merge-unresolved`, `merge-edited` |
| Run cell | `run-done`, `run-failed`, `run-paused`, `run-skipped`, `run-waiting` |
| Syntax | CodeMirror theme-এর জন্য ছোট একটা highlight role-এর set (keyword, string, number, comment, type, function, tag, attribute) |

- **Spacing:** `space-0` থেকে `space-8` পর্যন্ত নামওয়ালা ধাপ, সাথে `row-height` (সব list row-এর একটাই স্থির উচ্চতা) আর `pane-gap`।
- **লেখার ধরন:** নামওয়ালা role `text-caption`, `text-body`, `text-body-strong`, `text-section-title`, `text-screen-title`, `text-code`। Font family দুটো: bundle করা একটা UI font আর একটা monospace font। দুটোই OFL licence-এর, installer ছোট রাখতে subset করা। M0-তে licence যাচাই করে বাছাই হবে। Bundle করলে তিন system-এই লেখার মাপ এক থাকে। Merge editor-এর alignment আর "সব জায়গায় একই রকম দেখায়" — এই UX নিয়ম, দুটোই এর উপর নির্ভর করে।
- **Light আর dark:** প্রতিটা theme একই role-গুলোর একটা পূর্ণ value set। Default-ভাবে theme system-কে অনুসরণ করে (PLAT-06)। System theme বদলের খবর আসে core থেকে, কারণ সব Linux desktop-এ `prefers-color-scheme`-এর উপর ভরসা করা যায় না। User Settings থেকে বদলাতে পারেন। Windows-এর high-contrast (`forced-colors`) মানা হয়, আর `prefers-reduced-motion`-এ animation বন্ধ থাকে।
- **Status অক্ষর:** কখনো শুধু রং দিয়ে নয়। অক্ষরটাই অর্থ বহন করে, tooltip তার নাম বলে ("Modified"), আর row-এর accessible name-এও সেটা থাকে (UX-08)।
- **Contrast:** একটা automated test দুই theme-এ লেখা/background-এর প্রতিটা token জোড়া যাচাই করে: লেখার জন্য 4.5:1, আর icon, border ও focus ring-এর জন্য 3:1 (UX-08)।
- **Zoom (UX-08):** Ctrl+= / Ctrl+− / Ctrl+0 (macOS-এ ⌘) ধাপে ধাপে একটা zoom factor বদলায়। Factor root font size বাড়ায়-কমায়, তাই `rem`-ভিত্তিক সব মাপ সাথে বদলায়, `row-height` আর editor-এর font-ও। Webview-এর নিজের zoom বন্ধ থাকে, যাতে zoom-এর পথ একটাই থাকে। Zoom বদলালে CodeMirror নতুন করে মাপে আর virtualiser তার row-height update করে। Factor save থাকে (UX-09)।

## ৯. Component-এর তালিকা

| React Aria Components থেকে (`ui/`-এ মোড়ানো) | কোথায় ব্যবহার |
|---|---|
| Button, ToggleButton, ToggleButtonGroup | সব button, List / Tree switch (CHG-03) |
| Checkbox, Switch, RadioGroup | Repo বাছাই, preview-এর পছন্দ, settings |
| TextField, SearchField, NumberField | Commit message, filter, parallel limit |
| Select, ComboBox | Method বাছাই, variable সহ branch picker (PIPE-04), workspace আর target picker |
| Menu, MenuTrigger, SubmenuTrigger, Popover | Context menu (CHG-06, DASH-06), Run Pipeline dropdown |
| Tooltip | প্রতিটা action button-এ এক বাক্যের ব্যাখ্যা (UX-02) |
| Dialog, Modal, AlertDialog | Action flow, confirmation, command palette-এর আধার |
| Table | Dashboard, pull request list, run grid (§১৩), preview আর result-এর list |
| GridList (drag-and-drop সহ) | Pipeline-এর step list, ক্রম বদলানো সহ |
| Tabs, Disclosure | Settings-এর section, right panel-এর বিস্তারিত, step-এর option |
| ProgressBar, Meter | Job-এর progress |
| Toast (M0-তে stability যাচাই) | ছোট, কাজ না আটকানো notice, Undo সহ |
| React Aria-র live announcer | Screen reader-এর ঘোষণা (§১৫) |

| Custom (`components/`, `editor/`, `flows/`-এ) | কেন custom |
|---|---|
| বদলানো যায় এমন pane আর splitter সহ app shell | React Aria-তে splitter নেই। Separator role-এর উপর বানানো, arrow key দিয়ে মাপ বদলানো যায় |
| Changes list/tree (virtualised) | ৫,০০০ row, নানা ধরনের row আর VS Code-এর মতো আচরণ লাগে (§১০) |
| Activity log list (virtualised) | বড়, ধারাবাহিকভাবে আসে, শুধু পড়ার |
| Diff view আর merge editor | CodeMirror, সাথে আমাদের aligned-pane layer (§১১, §১২) |
| Action flow | আমাদের নিজস্ব preview → run → result pattern (§৭) |
| Command palette | React Aria Modal-এর ভেতরে cmdk (§১৪) |
| Pull request-এর body আর comment-এর markdown view | Markdown প্রথমে HTML-এ render হয়, তারপর DOMPurify security-র অনুমোদিত তালিকা দিয়ে পরিষ্কার করে: কোনো script, event handler, form, iframe বা style নয় (security UN-02)। Image কখনো load হয় না; প্রতিটা একটা link হিসেবে দেখায় (TH-07)। Link অনুমোদিত তালিকা মানে: `https://github.com/…` আর configure করা GitHub Enterprise host browser-এ খোলে; অন্য যেকোনো URL পুরোটা দেখায়, সাথে একটা Copy button, কিন্তু কখনো খোলে না (UN-04) |
| Account badge | Sign in করা GitHub user-কে login-এর নাম সহ নামের আদ্যক্ষরের একটা badge হিসেবে দেখানো হয়। v0.1-এ কোনো avatar image load হয় না (TH-07) |
| Status অক্ষর, repo state badge, run-cell glyph, key hint, empty state, error message | Token-এর উপর বানানো ছোট, product-নির্দিষ্ট অংশ |

## ১০. Changes screen: list, tree আর virtualisation

1. **Row model।** `changes` প্রতি repo-র জন্য row descriptor-এর একটা flat array বানায়: repo header, section header (Merge Changes, Staged Changes, Changes, সংখ্যা সহ), folder row (শুধু tree mode-এ) আর file row। ভাঁজ করা অবস্থা আর filter হিসাবে ধরা হয়। Screen প্রতি repo-র array জোড়া লাগায়, আর প্রতিটা repo-র অংশ আলাদাভাবে memoise হয় (§৫.৩)।
2. **Tree mode** file-গুলোকে folder অনুযায়ী সাজায়, আর একটাই child থাকা folder-গুলোকে VS Code-এর মতো এক লাইনে জুড়ে দেয়। **List mode** file-এর নাম দেখায়, পাশে ঝাপসা করে folder (CHG-02, CHG-03)।
3. **Virtualisation।** TanStack Virtual শুধু দেখা যাওয়া row আর অল্প কিছু বাড়তি (overscan) render করে, zoom অনুযায়ী মাপা স্থির `row-height` দিয়ে। স্থির উচ্চতায় scroll সস্তা আর অনুমানযোগ্য হয় (PERF-08)। যে section দেখা যাচ্ছে, তার repo header উপরে আটকে থাকে।
4. **Row** হলো memoise করা component, যেটা একটা স্থির key পায়। Row দেখায় নাম, ঝাপসা folder, `+12 −3`, status অক্ষর, আর hover/focus-এ stage (+), unstage (−) আর open-এর button। Section header-এ থাকে "+ all" / "− all" (CHG-05)। Stage আর unstage করলে row সাথে সাথে বদলে যায় (optimistic), আর পরের change-list event সেটা নিশ্চিত করে বা ফিরিয়ে দেয়।
5. **Keyboard:**
   - Up আর Down দিয়ে row-এর মধ্যে চলাচল। Left আর Right দিয়ে ভাঁজ করা আর খোলা। Home আর End দিয়ে দুই প্রান্তে যাওয়া।
   - কোনো অক্ষর টাইপ করলে সেই অক্ষরে মেলা পরের নামে যায়।
   - Enter diff খোলে, আর Space focus করা file-এর staging উল্টে দেয়।
   - Shift আর Ctrl/⌘ দিয়ে selection বাড়ানো যায়।
   - Context-menu key আর Shift+F10 row-এর menu খোলে (CHG-06)।
6. **Accessibility।** Widget-টা ARIA tree pattern মেনে চলে। DOM-এ শুধু দেখা যাওয়া row থাকে, তাই প্রতিটা row তার level, অবস্থান আর তার set-এর মোট সংখ্যা বহন করে। ফলে screen reader ঠিকঠাক "12-এর মধ্যে 3" বলে। এটা একটা requirement, আর এর নিজস্ব test আছে: ৫,০০০-file scenario-তে একটা Playwright accessibility-tree check দুই engine-এই scroll করার আগে আর পরে render হওয়া row-গুলোর `aria-level`, `aria-setsize` আর `aria-posinset` নিশ্চিত করে। Focus DOM node দিয়ে নয়, key দিয়ে ধরা থাকে, তাই scroll আর update-এর পরও টিকে থাকে।
7. **Filter** (CHG-03) সব repo জুড়ে file-এর নাম মেলায়, মিলটা highlight করে আর কয়টা মিলেছে দেখায়।
8. **Commit box** (CHG-07, BULK-06) list-এর নিচে থাকে। Core থেকে আসা ticket key আগে থেকে বসানো থাকে। Ctrl+Enter / ⌘Enter commit করে, আর একাধিক repo-র commit action flow দিয়ে চলে (§৭)।
9. **M1-এ যাচাই:** brief TanStack Virtual ঠিক করেছে। M1 spike-এ tree-এর জন্য React Aria-র নিজস্ব virtualiser-ও চালিয়ে দেখা হবে। যেটা তিন webview-এই ঠিক screen-reader output আর মসৃণ scroll দেয়, সেটাই থাকবে।

## ১১. Diff view

- **Mode:** পাশাপাশি (side by side) আর একটার ভেতরে (inline) (CHG-04)। কোনটা বাছাই করা হয়েছে, app মনে রাখে।
- **Data:** core-এর `diff-engine` দুটো text, line hunk (histogram) আর বদলানো line-এর ভেতরের word-level range পাঠায়। UI নিজে কোনো diff হিসাব করে না, তাই diff view, Changes-এর সংখ্যা আর merge editor সবসময় একমত থাকে (একটাই engine)।
- **Render:** দুই mode-ই CodeMirror-এর শুধু-পড়ার view ব্যবহার করে:
  - line-এর background আর word mark আসে core-এর range থেকে
  - পাশাপাশি mode-এ spacer block বসানো হয়, যাতে মেলানো line সমান উচ্চতায় থাকে, আর দুই পাশ একসাথে scroll হয়
  - লম্বা না-বদলানো অংশ ভাঁজ করা থাকে, "expand N lines" control সহ
  - `@codemirror/merge` পাশাপাশি আর inline mode-এ তখনই ব্যবহার হবে, যদি সেটা আগে থেকে হিসাব করা chunk নিতে পারে (M1-এ যাচাই)। না পারলে দুই mode-ই `editor/`-এর ভাগাভাগি করা aligned-pane layer-এর উপর বানানো হবে — merge editor যেটা ব্যবহার করে, সেটাই (§১২)। JavaScript-এ দ্বিতীয় কোনো diff engine কখনো থাকবে না।
- **Syntax highlighting:** file-এর extension দেখে language support দরকার হলে load হয়। শুরুর set-এ আছে TS/JS, JSON, HTML, CSS, Markdown, XML (`.csproj` সহ), YAML, C#, Rust, Python আর SQL। অচেনা ধরন plain text হিসেবে দেখায়।
- **চলাচল:** আগের আর পরের change (Alt+F5 / Shift+Alt+F5, VS Code-এর মতো), সাথে "Change 3 of 9" লেখা।
- **বিশেষ ক্ষেত্র:** binary file, শুধু mode বদলানো file, rename (পুরনো → নতুন path), শুধু line ending বদলানো ("Only line endings changed") আর শুধু whitespace বদলানো — প্রতিটার জন্য খালি diff-এর বদলে একটা পরিষ্কার message দেখায়।
- **বড় file** (PERF-06): ১০,০০০ line পর্যন্ত ৩০০ ms-এর মধ্যে খোলে। এর বেশি হলে core hunk-গুলো ভাগে ভাগে (page) পাঠায়, আর না-বদলানো অংশ ভাঁজ করা থাকে। একটা কঠিন মাপের সীমার (একটা setting) বেশি হলে view তার বদলে "Open in editor" দেয়।
- **আগে থেকে আনা:** কোনো file row keyboard focus পেলে অল্প একটু debounce (মোটামুটি ১০০ ms)-এর পরে diff চাওয়া হয়, যাতে list-এ দ্রুত arrow চাপলে প্রতি row-এ একটা করে request না যায়। নতুন request পুরনোটা বাতিল করে, আর যে file আর বাছাই করা নেই তার দেরিতে আসা উত্তর ফেলে দেওয়া হয়।
- **আবার ব্যবহার:** user এক file থেকে আরেক file-এ গেলে editor view নতুন করে বানানো হয় না, শুধু তার state বদলানো হয়। একসাথে অল্প কয়েকটার বেশি view বেঁচে থাকে না।

## ১২. Merge editor (তিন pane, Visual Studio-র মতো)

**Pane** (CONF-03)। উপরে বাঁয়ে Incoming আর উপরে ডানে Current, প্রতিটার শিরোনামে তার আসল branch বা commit-এর নাম। নিচে Result: edit করা যায়, শিরোনামে file-এর নাম। Header-এ থাকে file, repo, operation ("merging X into dev"), "Conflict 2 of 6", কয়টা অমীমাংসিত, আর Prev / Next। Footer-এ Take all incoming, Take all current আর Accept merge। Base (CONF-12, P1) একটা ঐচ্ছিক চতুর্থ pane, header থেকে চালু-বন্ধ করা যায়। উপর আর নিচের ভাগের মাপ বদলানো যায়, আর app সেটা মনে রাখে।

**কোন পাশ কোনটা।** Current সবসময় index stage 2, আর Incoming সবসময় stage 3। তাদের মানে, আর তাই pane-এর শিরোনাম, operation অনুযায়ী বদলায়:

| Operation | Current (stage 2)-এর শিরোনাম | Incoming (stage 3)-এর শিরোনাম |
|---|---|---|
| Merge | আপনি যে branch-এ আছেন (HEAD), যেমন `dev` | যে branch merge হয়ে ঢুকছে (MERGE_HEAD), যেমন `TK-2636-taosif-Onboarding` |
| Rebase | যে branch-এর উপর rebase হচ্ছে, মানে যে commit-এর উপর গড়া হচ্ছে, যেমন "onto `dev`" | আপনার যে commit আবার বসানো হচ্ছে, তার ছোট hash আর subject সহ |
| Cherry-pick | আপনি যে branch-এ আছেন (HEAD) | যে commit pick করা হচ্ছে, তার ছোট hash আর subject সহ |

Rebase চলার সময় header কথাতেও সেটা বলে ("Rebasing TK-2636-taosif-Onboarding onto dev: commit 2 of 5"), কারণ সেখানে অনেকের কাছে "current" আর "incoming" উল্টো মনে হয়।

**Core থেকে data।** Editor Incoming (stage 3), Current (stage 2) আর Base (stage 1)-এর text load করে। সাথে পায় **region**-এর একটা তালিকা: প্রতিটা হয় অপরিবর্তিত, নয়তো এক পাশ থেকে নিজে থেকে লাগানো, নয়তো ID সহ একটা conflict। Conflict region আসে Git worktree file-এ যে conflict marker লিখেছে সেখান থেকে (architecture D-06), তাই Git যা ঠিক করেছে তার সাথে হুবহু মেলে। প্রতিটা region-এর প্রতিটা pane-এ তার line range থাকে, আর Result-এ তার জায়গা থাকে। Core Result-এর text পাঠায় conflict নয় এমন সব change আগে থেকে বসিয়ে (CONF-05), আর **প্রতিটা conflict-এর range খালি রেখে**। UI প্রতিটা খালি range-এ একটা placeholder আঁকে, তাই marker-এর লেখা কখনো editor-এ ঢোকে না। (`git merge-file` শুধু test-এর oracle হিসেবে ব্যবহার হয়, Result বানাতে কখনো নয়।)

**Alignment spacer** (CONF-06)।
- উপরের দুই pane-এ প্রতিটা region একই উচ্চতায় শুরু হয়। কোনো পাশে line কম থাকলে, যতটুকু কম ততটুকু উচ্চতার একটা দাগকাটা spacer block বসে। এটা text নয়, block widget, তাই select, copy বা save করা যায় না।
- Spacer-এর উচ্চতা = line-এর সংখ্যা × মাপা line height। Zoom বা font বদলালে আবার হিসাব হয়।
- উপরের pane-গুলোতে line wrap বন্ধ, কারণ wrap করলে alignment ভেঙে যায়। দুটোর horizontal scroll একসাথে চলে।

**একসাথে scroll।**
- উপরের দুই pane pixel পর্যন্ত মেলানো, তাই একই scroll offset ভাগ করে।
- Result edit হয় বলে তার line সংখ্যা আলাদা, তাই সেটা region-এর anchor দিয়ে মেলানো হয়। সক্রিয় pane-এর সবার উপরের region খুঁজে বের করা হয়, আর বাকি pane-গুলো একই region-এর ভেতরে একই আপেক্ষিক অবস্থানে scroll করে।
- যেকোনো pane নেতৃত্ব দিতে পারে, আর একটা ছোট lock pane-গুলোকে একে অপরকে বারবার ধাক্কা দেওয়া থেকে আটকায়।

**Checkbox gutter widget** (CONF-04)।
- Incoming আর Current pane-এর gutter-এ, region-এর প্রথম line-এ, প্রতিটা conflict-এর একটা আসল checkbox থাকে। তার accessible name হয় এমন: "Take incoming for conflict 2 of 6, lines 14 to 16"।
- এক পাশে tick দিলে Result-এ সেই conflict-এর region সেই পাশ দিয়ে ভরে যায়। দুই পাশে tick দিলে দুটোই বসে, যে ক্রমে tick দেওয়া হয়েছে সেই ক্রমে। Tick তুলে নিলে সেই পাশ সরে যায়।
- প্রতিটা tick দেওয়া আর তোলা Result-এ একটা undo করা যায় এমন ধাপ (Ctrl+Z / ⌘Z)।
- বর্তমান conflict-এর জন্য "take incoming", "take current" আর "take both" command আছে, তাই পুরো editor keyboard দিয়ে চলে।

**Result edit করা।**
- Result একটা সাধারণ CodeMirror editor। Text বদলালে editor Result-এর ভেতরে প্রতিটা region-এর range-এর হিসাব রাখে।
- User কোনো conflict region-এর ভেতরে টাইপ করলে region-টা "হাতে edit করা" (`merge-edited`) হিসেবে চিহ্নিত হয়, আর দুটো checkbox-ই মিশ্র অবস্থা দেখায়। এরপর কোনো box-এ tick দিলে হাতের edit সেই পাশ দিয়ে বদলে যায়। এটা undo করা যায়, আর একটা toast বলে "Replaced your edit · Undo"।
- অমীমাংসিত conflict Result-এ text হিসেবে নয়, highlight করা placeholder widget ("Unresolved conflict 3") হিসেবে দেখায়। ফলে conflict marker ভুল করে কখনো save হতে পারে না।
- নিজে থেকে লাগানো change-গুলো `merge-auto-applied` রঙে ছায়া করা থাকে, আর gutter-এ চিহ্ন থাকে কোন পাশ থেকে এসেছে।

**চলাচল** (CONF-07)। F8 আর Shift+F8 পরের ও আগের অমীমাংসিত conflict-এ যায় আর সব pane সেখানে scroll করে। অমীমাংসিত কিছু না থাকলে সব conflict-এর মধ্যে চলাচল করে। Counter আর অমীমাংসিতের সংখ্যা সাথে সাথে update হয় আর polite ভাবে ঘোষণা হয় (§১৫)।

**Accept merge-এর নিয়ম** (CONF-08, CONF-09, CONF-11)।
1. Take all incoming আর Take all current একবারে সব conflict মীমাংসা করে, একটা undo করা যায় এমন ধাপ হিসেবে।
2. কোনো conflict অমীমাংসিত থাকলে Accept merge (Ctrl+S / ⌘S) বন্ধ থাকে। Tooltip বলে কয়টা বাকি, আর shortcut চাপলে প্রথম বাকিটায় চলে যায়।
3. Accept করলে UI Result-এর text core-এ পাঠায়। Core file-এর আসল line ending আর encoding বজায় রাখে, conflict marker খোঁজে (CONF-11), file লেখে আর stage করে। Marker পাওয়া গেলে save বাতিল হয়, আর message ঠিক line-টা দেখিয়ে দেয়।
4. সফলভাবে save হলে পরের conflicted file খোলে: আগে একই repo-তে, তারপর পরের repo-তে। আর কিছু না থাকলে Conflicts screen প্রতি repo-তে Continue / Abort আর Continue all দেখায় (CONF-10)।
5. Result-এ save না করা পরিবর্তন রেখে editor ছাড়তে গেলে জিজ্ঞেস করে Keep editing / Discard my changes।

**বড় file।** ১০,০০০ line পর্যন্ত editor ৫০০ ms-এর মধ্যে খোলে (PERF-06)। CodeMirror শুধু দেখা যাওয়া অংশ render করে, আর core region-গুলো আগে থেকে হিসাব করা data হিসেবে পাঠায়। এর বেশি হলে লম্বা অপরিবর্তিত region তিন pane-এই ভাঁজ করা থাকে, anchor ঠিক রেখে। কঠিন সীমার বেশি হলে, আর binary file-এ, editor তার বদলে Take current, Take incoming বা বাইরের merge tool দেয় (CONF-02)।

## ১৩. Pipeline editor আর run grid

**Editor** (PIPE-01..04, PIPE-11)।
- Step-গুলো একটা React Aria GridList-এ থাকে, প্রতি row-এ একটা step। প্রতিটা row-এ থাকে step-এর ধরন, তার field, আর Move up / Move down / Remove button।
- Step-এর ক্রম drag করে বা keyboard দিয়ে বদলানো যায়। Page-এর ভেতরে drag-and-drop চালাতে window-এর জন্য Tauri-র native file-drop handling বন্ধ রাখতে হয় (M1-এ যাচাই)।
- Branch field একটা ComboBox: একটা নির্দিষ্ট নাম, অথবা `{current}`, `{base}` বা `{task}` variable নেয়। Variable-গুলো ব্যাখ্যা সহ chip হিসেবে দেখায় (PIPE-04)।
- Method field হলো Integrate into branch-এর জন্য merge / rebase / pull request-এর একটা Select (PIPE-03)।
- ভুল step-এর পাশে সেখানেই message দেখায়। Save চালু থাকে, কিন্তু সমস্যাগুলোর তালিকা দেয়।
- "Return each repo to the branch it started on" একটা checkbox (PIPE-06)। Step-এর option একটা Disclosure-এ থাকে (PIPE-11)।
- Save না করা edit রেখে বেরোতে গেলে আগে জিজ্ঞেস করে। Built-in pipeline শুধু-পড়ার মতো খোলে, Duplicate সহ (PIPE-09)।

**Run grid** (PIPE-05..08)।
- Preview হলো ভাগাভাগি করা action flow (§৭): প্রতিটা repo-র প্রতিটা step-এর তালিকা, আর পুরো run-এর জন্য একটা confirmation।
- Run screen হলো grid mode-এ একটা React Aria Table: row হলো repo, column হলো step। প্রতিটা cell দেখায় একটা glyph, একটা ছোট শব্দ আর একটা color role: ✓ done, ✗ failed, ⏸ paused ("3 conflicts" সহ), – skipped, ○ waiting, আর চলার সময় একটা spinner। শুধু glyph কখনো একমাত্র সংকেত নয়।
- Arrow key দিয়ে cell-এর মধ্যে চলাচল হয়। Enter cell-এর command আর output right panel-এ খোলে (PIPE-08)।
- থেমে থাকা বা ব্যর্থ repo-র row-এ থাকে Open conflicts, Resume, Skip step আর Stop (PIPE-07)। App restart-এর পর ফিরিয়ে আনা থেমে থাকা run-ও একই রকম দেখায়।
- Cell-এর update আসে job event আর প্রতি frame-এর batching দিয়ে (§৫.২)। সর্বোচ্চ মোটামুটি ৫০ × ১০টা cell, তাই grid virtualise করা নয়।
- Built-in task action (Sync with Base, Merge Task Into…) একই grid ব্যবহার করে (Flow ৪)।

## ১৪. Command palette আর keyboard shortcut

**Command registry।** User-এর প্রতিটা action `commands/`-এ একবার register হয়, সাথে থাকে:
- একটা ID, তার শিরোনাম (`copy/` থেকে) আর tooltip-এর বাক্য
- একটা "when" নিয়ম, যেটা বলে action কোথায় খাটে (screen, focus scope, selection, repo-র অবস্থা)
- একটা handler
- একটা portable notation-এ default keybinding, যেখানে "Mod" মানে Windows ও Linux-এ Ctrl আর macOS-এ ⌘ (PLAT-05)

Button, menu, palette, tooltip আর shortcut hint — সবাই registry থেকে পড়ে, তাই shortcut কখনো তার label থেকে সরে যায় না।

**Palette** (UX-05, PIPE-10)।
- Mod+K একটা React Aria Modal-এর ভেতরে cmdk খোলে। ফলাফলে থাকে action, save করা ও built-in pipeline, screen, repo ("Go to app-api"), task আর সাম্প্রতিক জিনিস, fuzzy matching সহ।
- প্রতিটা ফলাফলে বর্তমান OS-এর shortcut দেখায়। এই মুহূর্তে খাটে না এমন action ঝাপসা দেখায়, কারণ সহ ("No conflicts to resolve")।
- কিছু বদলায় এমন action বাছলে তার preview খোলে। Palette কখনো সরাসরি কোনো পরিবর্তন চালায় না।

**Scope আর অগ্রাধিকার।**
1. Scope এই ক্রমে চেষ্টা করা হয়: dialog, তারপর editor (CodeMirror-এর ভেতরে), তারপর screen, তারপর global। যে scope key-টা প্রথম সামলায়, সেটাই জেতে।
2. Text field আর editor-এর ভেতরে এক অক্ষরের shortcut কাজ করে না। শুধু Mod, Alt বা function key-এর combination পার হয়।
3. PRD §৮-এর shortcut-গুলোই default: Mod+K, Mod+N, Mod+F, refresh (Windows ও Linux-এ F5, macOS-এ ⌘R), Mod+Enter, F8 / Shift+F8, merge editor-এ Mod+S আর Mod+, (comma)।
4. User Settings থেকে shortcut বদলাতে পারেন, আর pipeline-এ shortcut দিতে পারেন (PIPE-12, P1)। মিল পড়ে গেলে registry সতর্ক করে।

**Webview আর OS-এর key।**
- Webview-এর নিজের browser key (F5 আর Ctrl+R-এ reload, print, find, zoom, devtools) Tauri shell-এ বন্ধ রাখা হয়, আর UI তাদের default আচরণ আটকায়। না হলে F5 repo refresh না করে পুরো app reload করে দিত (প্রতিটা webview-এ M1-এ যাচাই)।
- macOS-এ shell সাধারণ app menu আর Edit menu define করে, কারণ ⌘C, ⌘V, ⌘X, ⌘A আর ⌘Z চলার জন্য WKWebView-এর এগুলো লাগে। Menu item registry-র command call করে।
- Windows আর Linux-এ native menu bar নেই। সব কিছু app-এর top bar আর palette-এ থাকে।

## ১৫. Accessibility (UX-08)

- **Role:**
  - top bar, sidebar navigation, প্রধান অংশ, details panel আর bottom bar-এর জন্য landmark
  - Changes list-এর জন্য tree
  - dashboard আর run grid-এর জন্য table বা grid
  - flow আর confirmation-এর জন্য dialog / alertdialog
  - button-এর দলের জন্য toolbar
  - splitter-এর জন্য separator
  - প্রতিটা editor pane-এর জন্য label করা textbox ("Incoming, TK-2636-taosif-Onboarding, read only")
- **নাম:** প্রতিটা control-এর একটা accessible name থাকে। শুধু icon-ওয়ালা button-এর নাম আসে registry-র শিরোনাম থেকে, যেমন "Stage Program.cs"। File row-এর নামে status-এর শব্দ আর সংখ্যা থাকে ("Program.cs, Api, modified, 8 added, 2 removed")।
- **Focus ব্যবস্থাপনা:**
  - প্রতিটা composite widget-এ একটাই tab stop (ভেতরে roving focus), আর সব জায়গায় চোখে পড়ার মতো `focus-ring`
  - Dialog খুললে focus ভেতরে যায়, বন্ধ হলে আগের জায়গায় ফেরে
  - কোনো action-এর পরে focus যায় ফলাফলের প্রথম ব্যর্থতায়, নয়তো যেখান থেকে action শুরু হয়েছিল সেখানে
  - প্রথম tab stop হলো "Skip to main content"
  - F6 / Shift+F6 প্রধান অংশগুলোর মধ্যে ঘোরে
  - Editor pane-এ শুধু-পড়ার pane থেকে Tab focus বের করে নিয়ে যায়। Result-এ Tab indent করে, আর Escape-এর পরে Tab চাপলে বের হওয়া যায় (CodeMirror-এর নিয়ম)। Pane-এর description এটা বলে দেয়
- **Live region:** progress-এর জন্য একটাই polite announcer, React Aria-র announcer দিয়ে:
  - "Push started in 4 repos"
  - শেষ হওয়া repo-গুলো দলে দলে, কয়েক সেকেন্ডে সর্বোচ্চ একবার
  - শেষের সারাংশ ("Push finished: 3 succeeded, 1 failed")
  - conflict counter-এর পরিবর্তন

  Assertive ঘোষণা শুধু তখন, যখন কিছু user-কে আটকে দেয় আর সেটা আগে থেকে কোনো dialog-এ নেই।
- **Motion আর রং:** reduced motion আর forced colors মানা হয় (§৮)। কোনো তথ্য কখনো শুধু রং দিয়ে বোঝানো হয় না।
- **Automated যাচাই:** প্রতিটা scenario-তে, দুই theme আর দুই engine-এ, Playwright-এর ভেতরে axe চলে। Accessibility-tree snapshot নাম আর role যাচাই করে, virtual tree-র `aria-level`, `aria-setsize` আর `aria-posinset` সহ (§১০)। Contrast test token-গুলো দেখে (§৮)।
- **হাতে screen-reader যাচাই** (প্রতিটা release-এ, PLAT-04-এর smoke checklist-এর অংশ হিসেবে):

| OS | Webview | Screen reader | কোথায় মনোযোগ |
|---|---|---|---|
| Windows | WebView2 (Chromium) | NVDA, সাথে Narrator দিয়ে ছোট একটা পরীক্ষা | Changes tree, action flow, merge editor-এর checkbox, palette |
| macOS | WKWebView | VoiceOver | একই তালিকা, সাথে menu bar আর ⌘ shortcut |
| Linux | WebKitGTK | Orca | একই তালিকা। এটাই সবচেয়ে দুর্বল stack, তাই এখানের ব্যর্থতা WebKitGTK-এর version সহ লিখে রাখা হয় |

## ১৬. লেখা আর error message (UX-02, UX-04, UX-06)

UI v0.1-এ English, তাই নিচের উদাহরণগুলো ইংরেজিতেই রাখা হয়েছে।

- **শব্দ:**
  - User-এর চেনা Git ক্রিয়া: Fetch, Pull, Push, Commit, Stash, Merge, Rebase।
  - সবসময় "pull request" বা "PR" বলতে হবে, কখনো "merge request" নয়।
  - Sentence case।
  - Button action আর তার বস্তুর নাম বলে ("Discard 3 files", "Push 4 repos"), কখনো "OK" বা "Yes" নয়।
- **Tooltip:** একটা সহজ বাক্য, যেটা ক্রিয়া দিয়ে শুরু হয় আর বলে কী হবে, নিরাপদ সীমা সহ। যেমন: "Brings new commits from origin into this branch. Stops if it can't fast-forward." (UX-02)
- **Error** সবসময় একই তিন অংশে: কী হয়েছে, কোথায় (repo আর step), আর এরপর কী করতে হবে। যেমন: "Pull stopped: app-front has local changes. Stash them or commit first."। Git-এর আসল output এক click দূরে (Show Git output)। কখনো "Something went wrong" লেখা হবে না। অচেনা ধরনের error-ও repo আর step-এর নাম বলে, আর Git-এর text দেখায় (UX-04)।
- **Empty state** বলে screen-টা কীসের জন্য, আর পরের action একটা button হিসেবে দেয়, যেমন "No task yet. Start a task" (UX-06)।
- **Confirmation** সংখ্যা আর নাম দিয়ে ঠিক কী হবে বা কী হারাবে তার তালিকা দেয়। কখনো শুধু "Are you sure?"-এর উপর ভরসা করে না (SAFE-03)।
- **সংখ্যা আর সময়:** "3 repos", "1 repo", "2 min ago", "finished in 4.2 s"।
- **লেখা কোথায় থাকে:** প্রতিটা string `copy/`-এ, feature অনুযায়ী key দিয়ে। v0.1-এ UI English (PRD-র খোলা প্রশ্ন ৭), কিন্তু string এক জায়গায় রাখলে পরে component না ছুঁয়েই অনুবাদ করা যাবে।

## ১৭. Webview compatibility-র নিয়ম

GitHeddle তিনটা engine-এ চলে: Windows-এ WebView2 (Chromium, evergreen), macOS 13.3+-এ WKWebView (system-এর Safari engine), আর Linux-এ WebKitGTK (Ubuntu 22.04+, Fedora 39+)। UI এদের মধ্যে সবচেয়ে পুরনোটাকে লক্ষ্য ধরে।

**নিয়ম:**
1. **macOS-এর সর্বনিম্ন সীমা macOS 13.3 বা নতুন**, মানে Safari/WKWebView 16.4 বা নতুন। Tailwind v4-এর এই version লাগে। প্রতিবার চালু হওয়ার সময়, UI load হওয়ার আগেই, core WebKit-এর version যাচাই করে। WKWebView 16.4-এর চেয়ে পুরনো হলে app একটা native message দেখায়, যেটা বুঝিয়ে দেয় কীভাবে macOS update করতে হয়, আর web UI load হয় না (build-and-release §৭.২)।
2. শুধু সেই web platform feature ব্যবহার হবে, যেগুলো **Baseline "widely available"**, আর যেগুলো Safari 16.4-এ আর Ubuntu 22.04-এর update-এর WebKitGTK-তেও চলে। M0-তে যাচাই করে engine-এর সর্বনিম্ন version লিখে রাখতে হবে।
3. শুধু `styles/`-এর CSS নতুন feature ব্যবহার করতে পারে, তাও এমন fallback সহ যেটা দেখতে ঠিক থাকে।
4. প্রতিটা Playwright test Chromium আর WebKit দুটোতেই চলে। যে feature WebKit-এ ব্যর্থ হয়, সেটা ব্যবহার হয় না।
5. **Style-এর জন্যও CSP কড়া থাকে।** CodeMirror-এর style ঢোকে adoptedStyleSheets দিয়ে, আর যেখানে style element লাগে সেখানে `EditorView.cspNonce` দিয়ে দেওয়া nonce সহ। CSP-তে কখনো `unsafe-inline` যোগ হয় না (security TH-01)। React আর TanStack Virtual style বসায় DOM-এর style property দিয়ে, যেটা CSP অনুমতি দেয়।

**এড়িয়ে চলতে হবে:**
- `requestIdleCallback` আর `scheduler.postTask` (WebKit-এ নেই)। এর বদলে timeout আর animation frame।
- `SharedArrayBuffer` (cross-origin isolation লাগে), WebGPU, View Transitions, CSS anchor positioning, আর performance-এর ভরসা হিসেবে `content-visibility`।
- `backdrop-filter`, বড় blur আর shadow, আর layout property-র animation। WebKitGTK-তে এগুলো ধীর।
- Native `<select>`, date input আর native `<dialog>` element। Engine ভেদে এদের চেহারা আর আচরণ আলাদা, তাই React Aria-র সংস্করণ ব্যবহার করতে হবে।
- Web-এর file-system, clipboard-read আর notification API। এর বদলে core command।
- `localStorage` আর IndexedDB-কে সত্যের উৎস হিসেবে। Settings core-এ থাকে (UX-09)।
- Remote font, script আর image (CSP `default-src 'self'`), `eval`, আর inline event handler।
- শুধু WebKit-এর pseudo-element দিয়ে scrollbar style করা। Standard scrollbar width আর color property ব্যবহার করতে হবে, WebKit pseudo-element শুধু বাড়তি সাজ হিসেবে।
- List আর editor-এ smooth-scroll CSS।

**WebKitGTK-র সতর্কতা** (Linux):
- Scroll আর compositing ধীর, তাই DOM ছোট রাখতে হবে (আগেভাগে virtualise) আর paint effect যত কম সম্ভব।
- কিছু GPU, driver আর Wayland-এর মিলে window খালি বা ঝিলমিল দেখায়। জানা environment workaround shell document করে — এটা shell-এর কাজ, UI-এর নয়।
- Accessibility AT-SPI দিয়ে চলে আর কম পরিণত, তাই Orca-র যাচাই (§১৫) এখানেই সবচেয়ে জরুরি।
- System theme `prefers-color-scheme`-এ নাও পৌঁছাতে পারে, তাই theme আসে core থেকে (§৮)।
- Font rendering আর IME-র আচরণ আলাদা। Bundle করা font আর WebKit-এ Playwright চালানো এটা কমায়।

## ১৮. UI performance-এর নিয়ম (PERF-03, PERF-05, PERF-06, PERF-08)

1. **চোখে পড়ার মতো সাড়া ১০০ ms-এর কম।** Input-এর একই frame-এ চাপা, অপেক্ষমাণ বা optimistic অবস্থা দেখাতে হবে। কিছু হয়েছে দেখানোর আগে কখনো core-এর জন্য অপেক্ষা নয়।
2. **লম্বা task নয়।** Interaction-এর সময় main thread-এ ৫০ ms-এর বেশি কোনো task নয়। ভারী কাজ (diff, alignment, parsing, বড় set sort) Rust-এ হয়। ভারী কিছু UI-তে রাখতেই হলে সেটা Web Worker-এ যায়।
3. **Window কখনো আটকায় না** (PERF-05)। Job core-এ চলে। UI শুধু শোনে, আর job চলার সময়ও প্রতিটা screen ব্যবহার করা যায়।
4. **Virtualise** করতে হবে এমন প্রতিটা list, যেটা মোটামুটি ২০০ row ছাড়াতে পারে (Changes, activity log, commit history)। স্থির row height, আর স্থির key সহ memoise করা row।
5. **Update দলে দলে।** Core-এর event প্রতি frame-এ একবার লাগানো হয় (§৫.২), আর selector সরু রাখা হয় (§৫.৩)।
6. **ছোট IPC payload।** State event delta বহন করে। বড় text দরকার হলে আনা হয়, আর TanStack Query একটা মাপের সীমা সহ cache করে। ধারাবাহিক data channel দিয়ে আসে।
7. **Diff আর merge editor** (PERF-06): file row focus পেলেই diff আগে থেকে আনা, মোটামুটি ১০০ ms debounce করে আর পুরনো request বাতিল করে (§১১), editor view আবার ব্যবহার করা, language support দরকার হলে load করা, আর বড় file-এ না-বদলানো অংশ ভাঁজ করা।
8. **চালু হওয়া** (PERF-01, PERF-02): screen অনুযায়ী code ভাগ করা, যাতে merge editor, pipeline editor আর settings শুরুতে load না হয়। আগে shell আর cache করা dashboard আঁকা। Language pack শুধু তখনই, যখন কোনো diff-এর দরকার হয়।
9. **Memory** (PERF-07): অল্প কয়েকটা editor view বাঁচিয়ে রাখা, query cache-এর সীমা রাখা, আর merge editor বন্ধ হলে তার document ফেলে দেওয়া। ২৫০ MB-এর মধ্যে UI-এর ভাগ কতটা, সেটা M1 spike-এ মাপা হয়, আর ফলাফলটাই UI-এর budget হিসেবে লিখে রাখা হয়।
10. **Motion:** সর্বোচ্চ ১৫০ ms, শুধু transform আর opacity।
11. **অনুমান নয়, মাপা।** Performance-এর দিক থেকে স্পর্শকাতর work item input থেকে paint, আর খোলা থেকে প্রস্তুত হওয়া পর্যন্ত সময়ের mark যোগ করে। M1 spike আর `tools/perf` তিন system-এই এগুলো চালায়, আর কোনো budget ভাঙলে CI ব্যর্থ হয়।

## ১৯. Roadmap-এ এগুলো কোথায় পড়ে

| Milestone | এই ডকুমেন্টের UI কাজ |
|---|---|
| M0 | Folder-এর নিয়ম আর check (§৩), token আর theme (§৮), `ui/` wrapper, fake core-এর কাঠামো (§৬.৩), engine-এর সর্বনিম্ন version যাচাই (§১৭), font আর React Compiler বাছাই |
| M1 | Go/no-go gate-এর spike: তিন webview-এ ৫,০০০ row-এর Changes list (§১০), merge editor-এর alignment আর একসাথে scroll-এর prototype (§১২), বাইরের chunk নিয়ে `@codemirror/merge` (§১১), browser key আর drag-and-drop যাচাই (§১৩, §১৪) |
| M3 | App shell, navigation, "Needs review" অবস্থা আর repo trust prompt সহ dashboard table (§৭.১), command registry আর palette (§৪, §১৪) |
| M4 | Changes screen, diff view, commit box (§১০, §১১) |
| M5 | ভাগাভাগি করা action flow (§৭), লেখা আর error mapping (§১৬) |
| M6 | Task screen আর Start Task flow |
| M7 | Conflicts screen আর merge editor (§১২) |
| M8 | Pipeline editor আর run grid (§১৩) |
| M9 | Account badge সহ sign-in flow, আর active task-এর pull request ও তাদের status (PR-05)। পুরো Pull Requests screen (PR-06) P1, v0.2-এ |
| M10 | Trust-এর ধাপ সহ first-run guide (§৭.১), চালু হওয়ার সময়ের webview-version check (§১৭), accessibility-র কাজ আর screen-reader যাচাই (§১৫), performance-এর কাজ (§১৮), শেষ ঘষামাজা |

ঠিক কোন কোন work item, আর তাদের `M<n>-<nn>` ID, roadmap-এ আছে।

## ২০. UI-এর ঝুঁকি

| # | ঝুঁকি | প্রতিকার |
|---|---|---|
| ১ | Merge editor-এর alignment আর একসাথে scroll সূক্ষ্ম কাজ, আর AI-এর লেখা code প্রান্তিক ক্ষেত্রে ভুল করতে চায় (খালি পাশ, file-এর শেষে conflict, region-এর ভেতরে edit) | Alignment Rust-এ data হিসেবে হিসাব হয়, snapshot test সহ। UI শুধু render করে। Prototype M1-এ বানানো হয়। Fake-core scenario প্রান্তিক ক্ষেত্রগুলো ধরে, Playwright screenshot সহ |
| ২ | WebKitGTK (আর পুরনো WKWebView) খুব ধীর, বা অন্যভাবে render করে | সবচেয়ে কম সাধারণ feature-এর নিয়ম (§১৭), প্রতিটা UI test run-এ WebKit, তিন webview-এ মাপা M1 gate, আর gate ব্যর্থ হলে Electron fallback |
| ৩ | Virtualised tree screen reader-এ খারাপ শোনায় | Level, অবস্থান আর set-এর মাপ সহ ARIA tree pattern (§১০), M1-এ React Aria-র virtualiser-এর সাথে তুলনা, আর Orca, VoiceOver ও NVDA দিয়ে যাচাই |
| ৪ | `@codemirror/merge` core-এর diff নিতে পারে না, ফলে দুটো diff engine হয়ে যায় | M1-এ যাচাই। না পারলে দুই diff mode-ই ভাগাভাগি করা aligned-pane layer-এ render করা (§১১) |
| ৫ | Shortcut webview, OS বা editor-এর key-এর সাথে মিলে যায় (F5 reload, ⌘ menu key, CodeMirror-এর ভেতরের key) | Scope সহ একটাই registry (§১৪), shell-এ browser key বন্ধ, macOS-এ Edit menu, আর M1-এ প্রতিটা webview-এ যাচাই |
| ৬ | AI-এর বানানো UI system থেকে সরে যায় (সরাসরি রং, নিজের মতো dialog, সরাসরি Tauri call) | CI check সহ folder আর import-এর নিয়ম (§৩), ভাগাভাগি করা flow আর registry, আর শুধু token দিয়ে styling |
| ৭ | বড় workspace-এ event-এর ঝড় থেকে re-render-এর ঝড় | Delta, প্রতি frame-এ batching, সরু selector আর প্রতি repo-র memoisation (§৫), ৩০-repo আর ৫,০০০-file scenario দিয়ে মাপা |
| ৮ | Bundle করা font মাপ বাড়ায় বা licence-এর ঝামেলা আনে | Subset করা OFL font, M0-তে licence যাচাই, আর PERF-09 installer job-এ মাপ গোনা |
