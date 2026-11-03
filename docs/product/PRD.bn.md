# GitHeddle — প্রোডাক্ট রিকোয়ারমেন্টস ডকুমেন্ট (PRD)

**English version:** [PRD.en.md](PRD.en.md)

| | |
|---|---|
| **প্রোডাক্ট** | GitHeddle — Windows, macOS আর Linux-এর জন্য একটা desktop app, যেটা দিয়ে একসাথে অনেকগুলো repo-র Git আর pull request-এর কাজ করা যায় |
| **ডকুমেন্ট** | প্রোডাক্ট রিকোয়ারমেন্টস ডকুমেন্ট (PRD) |
| **ভার্সন** | 0.5 — খসড়া (পরিবর্তন §১৬-এ) |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। যেসব অনুমান এখনো নিশ্চিত করা বাকি, সেগুলো §১৪-এ আছে |

> এই file আর এর ইংরেজি সংস্করণ [PRD.en.md](PRD.en.md)-এ একই content আছে। একটা বদলালে অন্যটাও একই commit-এ update করতে হবে।

---

## ১. সারসংক্ষেপ

GitHeddle হলো Windows, macOS আর Linux-এর জন্য একটা desktop app, যেটা অনেকগুলো repository-র Git আর pull request-এর কাজ এক window-এ নিয়ে আসে। VS Code-এ প্রতিটা repository-র Source Control panel-এ একই ধাপ বারবার না করে developer একবার একটা **task** শুরু করবেন (যেমন `TK-2636 Onboarding`)। তারপর task-টা যে যে repository-তে লাগে, সবগুলোতে GitHeddle branch তৈরি, commit, push, `dev`-এর সাথে sync আর pull request খোলার কাজ করে দেবে। প্রতিটা কাজের আগে preview দেখাবে, আর পরে প্রতিটা repository-র আলাদা ফলাফল দেখাবে।

প্রতিদিন যে ধাপগুলো বারবার করতে হয়, সেগুলো নাম দিয়ে একটা **pipeline** হিসেবে সেভ করা যাবে — যেমন "current branch-কে `main` থেকে update করো, তারপর `dev`-এ merge করো" বা "…তারপর `dev`-এ pull request খোলো" — আর এক click-এ অনেক repository-তে চালানো যাবে। Changed file-গুলো দেখাবে VS Code-এর মতো করে, আর conflict resolve হবে Visual Studio-র মতো তিন pane-ওয়ালা merge editor-এ।

তিনটা গুণ সবকিছুর চেয়ে বেশি গুরুত্বপূর্ণ:

- **সব জায়গায় চলবে।** Windows, macOS আর Linux — তিনটাই সমান গুরুত্বের। প্রতিটা release তিনটার জন্যই বের হবে, আর তিনটাতেই test হবে।
- **খুব fast।** App প্রায় এক সেকেন্ডে খুলবে আর প্রতিটা click-এ সাথে সাথে সাড়া দেবে, ৩০টা repository থাকলেও।
- **খুব সহজে ব্যবহার করা যাবে।** Git-এ যিনি খুব একটা আত্মবিশ্বাসী নন, তিনিও কারো সাহায্য ছাড়াই task শুরু, commit আর pull request তৈরি করতে পারবেন। আর আগে পরিষ্কার সতর্কবার্তা না দেখিয়ে কোনো click-এ কাজ হারাবে না।

GitHeddle VS Code-এর ভেতরে না, পাশে থেকে কাজ করে। এটা repository আর file VS Code-এ (বা user-এর বেছে নেওয়া অন্য editor-এ) খোলে, আর VS Code-এর `.code-workspace` file সরাসরি import করা যায়।

## ২. সমস্যা

**বর্তমান setup (VS Code Source Control-এর screenshot থেকে):** একটা VS Code window-এ অন্তত সাতটা repository: `knowledge-hub`, `app-api`, `app-front`, `app-report-api`, `app-scheduler-api`, `app-signalr-api` আর `architecture-handbook`। একটা feature, `TK-2636`, অন্তত `app-api` আর `app-front`-এ লাগে, আর দুটোতেই একই নামের branch আছে।

এখন যেখানে কষ্ট হয়:

1. **প্রতিটা ধাপ প্রতিটা repo-তে আলাদা করে করতে হয়।** Branch তৈরি, commit, push, `dev` pull আর merge — সবই হাতে, প্রতিটা repository-তে একবার করে। এসব হয় একটা লম্বা Source Control list-এ, যেখানে প্রতিটা repo-র নিজস্ব message box আর Commit button।
2. **এক নজরে কিছু দেখা যায় না।** কোন repo কোন branch-এ, কোনটা `dev`-এর পেছনে, কোনটায় push না করা commit আছে, কোনটা merge-এর মাঝপথে — panel-টা এগুলো পাশাপাশি দেখাতে পারে না। Screenshot-এ `app-api` এখন `dev`-এ, `TK-2636-taosif-Onboarding` merge করার মাঝপথে, ৩টা conflicted file সহ (শুধু `Api.csproj`-এই ৬টা conflict)। অন্য repo-তে কাজ করার সময় এটা সহজেই চোখ এড়িয়ে যায়।
3. **Pull request একটা একটা করে browser-এ বানাতে হয়।** প্রতিটা repository-র জন্য GitHub খুলতে হয়, branch বাছতে হয়, একই title আর description লিখতে হয়, reviewer যোগ করতে হয়। তারপর reviewer-রা যেন বোঝেন pull request-গুলো একসাথের, সেজন্য একটার link আরেকটায় হাতে copy করতে হয়।
4. **Conflict ছড়িয়ে-ছিটিয়ে থাকে।** `dev` এগিয়ে গেলে প্রতিটা repo আলাদা করে sync করতে হয়, আর তার conflict আলাদা করে খুঁজে resolve করতে হয়।
5. **একই ধাপের ক্রম প্রতিদিন বারবার।** যেমন: সর্বশেষ `main` current branch-এ আনা, push করা, তারপর `dev`-এ merge করা বা pull request খোলা — ধাপে ধাপে, প্রতিটা repo-তে।
6. **ভুল করা সহজ।** ভুল করে `dev`-এ commit হয়ে যায়, একটা repo বাদ পড়ে যায়, একটা repo push হয় কিন্তু আরেকটা হয় না, বা কোনো repo ভুল branch-এ থেকে যায়।

ফলাফল: ২–৩টা repository-তে ছড়ানো একটা feature-এর জন্য প্রতিদিন অনেকটা সময় যায় একই Git কাজ বারবার করতে, আর এমন ভুল হয় যা এড়ানো যেত।

## ৩. লক্ষ্য এবং যা লক্ষ্য নয়

### লক্ষ্য

| ID | লক্ষ্য |
|---|---|
| G1 | Workspace-এর সব repository-র Git অবস্থা এক screen-এ দেখা। |
| G2 | যেকোনো সাধারণ Git operation একসাথে অনেক repository-তে চালানো, আগে preview আর পরে প্রতিটা repository-র পরিষ্কার ফলাফল সহ। |
| G3 | **Task**-কে (ticket + branch + repo-র সেট + pull request) কাজের একক বানানো, যাতে একটা action task-এর সব repo-তে কাজ করে। |
| G4 | Browser না খুলেই task-এর pull request-গুলো একসাথে তৈরি, track, update আর merge করা। |
| G5 | সব repository জুড়ে conflict খুঁজে পাওয়া আর resolve করা সহজ করা। |
| G6 | User-এর কাজ কখনো না হারানো। |
| G7 | Windows, macOS আর Linux-এ একইভাবে কাজ করা। |
| G8 | একদম তাৎক্ষণিক মনে হওয়া। User শুধু Git আর network-এর জন্য অপেক্ষা করবেন, app-এর জন্য কখনো না। |
| G9 | Git-এ দক্ষ না হয়েও ব্যবহার করা যাওয়া: পরিষ্কার শব্দ, ধাপে ধাপে নির্দেশনা আর নিরাপদ default। |
| G10 | বারবার করা ধাপের একটা ক্রম নাম দিয়ে pipeline হিসেবে সেভ করে এক click-এ অনেক repository-তে চালাতে দেওয়া। |

### যা লক্ষ্য নয় (আপাতত)

- Code editor হওয়া। Code edit হবে VS Code বা অন্য editor-এ, আর GitHeddle file-গুলো সেখানেই খোলে।
- Git-এর প্রতিটা advanced feature রাখা (interactive rebase, submodule, bisect)। এগুলোর জন্য terminal এক click দূরে থাকবে।
- CI/CD system হওয়া। GitHeddle-এর pipeline user-এর নিজের computer-এ Git আর pull request-এর ধাপ চালায়। এটা code build, test বা deploy করে না।
- বাকি সব কাজে GitHub website-এর বিকল্প হওয়া (repository settings, Actions configuration, issue)।
- প্রথম release-এ GitHub ছাড়া অন্য host। GitLab আর Azure DevOps পরে আসতে পারে (§১২)।
- প্রথম release-এ VS Code extension, web app বা mobile app।
- Monorepo tooling (build graph, কোন project প্রভাবিত তা বের করা)।
- নিজে থেকে conflict resolve বা AI code review।

## ৪. ব্যবহারকারী

- **প্রধান: লেখক নিজে।** একটা team-এর developer, যিনি একসাথে ৫–১৫টা GitHub repository নিয়ে কাজ করেন, সাধারণত সবগুলো VS Code-এ একসাথে খোলা থাকে। Branch-এর নাম হয় ticket অনুযায়ী (`TK-2636-taosif-Onboarding`), `dev` হলো shared integration branch, আর একটা feature প্রায়ই backend (`app-api`) আর frontend (`app-front`) দুটোতেই ছড়ায়।
- **দ্বিতীয়: একই setup-এর teammate-রা, যেকোনো operating system-এ,** যাঁদের মধ্যে Git-এ খুব আত্মবিশ্বাসী নন এমন মানুষও আছেন। শুধু configuration বদলেই app-টা তাঁদের জন্য কাজ করতে হবে, আর কোনো একজনের repository নিয়ে কিছুই code-এ hard-code করা যাবে না। সহজে ব্যবহারের চাহিদাগুলো (§৭ L) এই ব্যবহারকারীদের দিয়েই মাপা হবে।

## ৫. মূল ধারণা

| ধারণা | অর্থ |
|---|---|
| **Workspace** | GitHeddle-এ খোলা কয়েকটা folder-এর সেট: user-এর বেছে নেওয়া একটা folder, অথবা import করা একটা VS Code `.code-workspace` file। User কয়েকটা workspace রেখে একটা থেকে আরেকটায় যেতে পারবেন। |
| **Repo** | Workspace-এর folder-গুলোর ভেতরে পাওয়া যেকোনো Git repository। |
| **Group** | নাম দিয়ে সেভ করা কয়েকটা repo-র সেট, যেমন `backend` = `app-api`, `app-report-api`, `app-scheduler-api`, `app-signalr-api`। |
| **Task** | একটা কাজ: ticket key (`TK-2636`), title (`Onboarding`), branch-এর নাম, base branch (`dev`), যে repo-গুলোতে লাগে, আর তার pull request-গুলো। |
| **Bulk action** | অনেক repo-তে একসাথে চালানো একটা operation: preview → parallel-এ চালানো → প্রতিটা repo-র ফলাফল। |
| **Target set** | Bulk action বা pipeline যে repo-গুলোতে চলবে: সব repo, একটা group, হাতে বাছাই করা কয়েকটা, অথবা active task-এর repo-গুলো। |
| **Pipeline** | নাম দিয়ে সেভ করা ধাপের একটা ক্রম, যেমন "Fetch → `main` থেকে Update → Push → `dev`-এ Merge", যেটা এক click-এ একটা target set-এ চলে। Task-এর Sync with Base আর Merge Task Into… action দুটো আসলে built-in pipeline। |
| **Step** | Pipeline-এর একটা ধাপ, যেমন Fetch, Update from branch বা Integrate into branch। |
| **Run** | একটা target set-এ pipeline একবার চালানো। একটা run-এর ভেতরে প্রতিটা repo শেষ হতে পারে, fail করতে পারে, অথবা থেমে (যেমন conflict-এ) পরে আবার চালু হতে পারে। |
| **Pull request (PR)** | GitHub-এ একটা branch আরেকটায় merge করার অনুরোধ, review আর CI check সহ। |
| **Command palette** | একটা search box (Ctrl+K / ⌘K), যেখানে নাম লিখলেই যেকোনো action চলে। |

## ৬. প্রধান user flow

### Flow ০ — প্রথমবার চালানো

1. GitHeddle install করে খুলুন।
2. একটা folder বা একটা VS Code `.code-workspace` file বেছে নিন। GitHeddle যে repository-গুলো খুঁজে পায় তার তালিকা দেখাবে।
3. Branch-এর নামে যে ছোট নাম বসবে (`taosif`, Git config থেকে প্রস্তাব করা) আর default base branch (`dev`) নিশ্চিত করুন।
4. এক click-এ browser-এ GitHub-এ sign in করুন, কোনো token copy করতে হবে না। এই ধাপ বাদ দিয়ে পরেও করা যায়।
5. Dashboard খুলে যাবে। পুরো setup-এ ২ মিনিটের কম লাগবে।

### Flow ১ — Task শুরু করা

*এখন:* `app-api`-তে, তারপর আবার `app-front`-এ: `dev`-এ switch, pull, branch তৈরি, publish।

*GitHeddle দিয়ে:*

1. **Start Task**-এ click করুন (বা Ctrl+N / ⌘N চাপুন), তারপর `TK-2636` আর `Onboarding` লিখুন।
2. Repo বাছাই করুন (অথবা একটা group)। Base branch default-ভাবে `dev`।
3. Preview বলবে, `app-api` আর `app-front`-এ সর্বশেষ `origin/dev` থেকে `TK-2636-taosif-Onboarding` তৈরি হবে। ধরুন `app-front`-এ uncommitted change আছে — তখন preview জিজ্ঞেস করবে: "Stash and continue" নাকি "Skip this repo"।
4. চালান। ফলাফল: ✓ `app-api`, ✓ `app-front`। Top bar-এ active task দেখাবে।

### Flow ২ — Change দেখা, তারপর একসাথে commit আর push

1. **Changes** screen খুলুন। এটা দেখতে VS Code-এর Source Control-এর মতো: change আছে এমন প্রতিটা repo-র নিজস্ব অংশ, যেটা Merge Changes, Staged Changes আর Changes — এই তিন ভাগে বিভক্ত। প্রতিটা file-এর পাশে তার folder, একটা status অক্ষর (M, A, D, R, U, !) আর কয়টা line যোগ ও বাদ হয়েছে তা দেখা যায়।
2. কোনো file-এ click করলে তার diff দেখা যাবে। Row-এর + / − button দিয়ে file stage বা unstage করুন।
3. একটাই box-এ একটাই message লিখুন, আগে থেকে `TK-2636: ` বসানো।
4. সব repo-তে একসাথে commit, চাইলে সাথে সাথে push। যে repo-তে কিছু stage করা নেই সেটা বাদ।

### Flow ৩ — Pull request তৈরি

1. Task-এ **Create Pull Requests**-এ click করুন।
2. Preview-তে প্রতিটা repo-র জন্য দেখাবে: source → target (`TK-2636-taosif-Onboarding → dev`), কয়টা commit এগিয়ে, title `TK-2636: Onboarding`, template থেকে description, reviewer, draft হবে কি না। যেসব repo-তে এগিয়ে থাকা commit নেই সেগুলো বাদ। সবকিছু edit করা যাবে।
3. Create করুন। দরকার হলে GitHeddle branch push করে pull request তৈরি করবে। তারপর প্রতিটা description-এ "Related pull requests" অংশ যোগ করবে, যেখানে বাকিগুলোর link থাকবে।
4. Task screen-এ এখন প্রতিটা pull request তার CI আর review-এর অবস্থা সহ দেখাবে।

### Flow ৪ — `dev`-এর সাথে তাল মেলানো, অথবা `dev`-এ merge

- **Sync:** **Sync with Base** task-এর প্রতিটা repo-তে সর্বশেষ `origin/dev` task branch-এ নিয়ে আসে (default merge, setting দিলে rebase)। যেসব repo-তে সমস্যা নেই সেগুলো শেষ হয়ে যায়, আর conflict থাকা repo-গুলো Conflicts screen-এ দেখা যায়।
- **কোনো branch-এ merge:** Screenshot-এ দেখা যাচ্ছে task branch-কে local-এ `dev`-এ merge করা হচ্ছে। **Merge Task Into…** task-এর প্রতিটা repo-তে এটা করে: `dev` update, task branch merge, conflict-এর তালিকা, আর resolve হওয়ার পরে push — তবে `dev` protected বলে push-এর আগে confirm চাইবে (খোলা প্রশ্ন ৩ দেখুন)।

দুটো action-ই built-in pipeline, তাই user-এর নিজের pipeline-এর মতো একই run screen দেখায় (Flow ৮)।

### Flow ৫ — Conflict resolve

1. Conflicts screen-এ merge বা rebase-এর মাঝপথে থাকা প্রতিটা repo দেখাবে, তার conflicted file আর প্রতিটা file-এ কয়টা conflict।
2. একটা file-এ click করুন। সেটা GitHeddle-এর merge editor-এ খুলবে, যেখানে Visual Studio-র মতো তিনটা pane: বামে **Incoming** (যে branch merge হয়ে আসছে), ডানে **Current** (আপনি যে branch-এ আছেন) আর নিচে **Result** (যে file সেভ হবে)।
3. প্রতিটা conflict-এ Incoming দিক, Current দিক, অথবা দুটোতেই টিক দিন। Result pane সাথে সাথে update হয়, আর হাতেও edit করা যায়। যেসব change-এ conflict নেই, সেগুলো আগে থেকেই Result-এ বসানো।
4. Next / Previous দিয়ে এক conflict থেকে আরেকটায় যান। আর কোনোটা বাকি না থাকলে **Accept merge**-এ click করুন। File সেভ হবে, resolved চিহ্নিত হবে, আর পরের conflicted file খুলে যাবে।
5. কোনো repo-তে আর conflict না থাকলে: Continue (merge commit করা) অথবা Abort। সব repo পরিষ্কার হলে: **Continue all**।

### Flow ৬ — Review, merge আর task শেষ করা

1. Pull Requests screen-এ তিনটা তালিকা: আমার তৈরি, আমার কাছে review চাওয়া, আর বর্তমান task।
2. Task-এর pull request-গুলোতে একসাথে কাজ: ready for review করা, reviewer যোগ করা, আর merge (check pass করলে আর review approve হলে) — বাছাই করা ক্রমে, যেমন `app-api` আগে, `app-front` পরে।
3. **Finish Task** repo-গুলোকে `dev`-এ ফেরত নেয়, pull করে, local task branch delete করে (remote branch delete ঐচ্ছিক), আর task-টা archive করে।

### Flow ৭ — প্রতিদিনের bulk কাজ

- সকালে সব repo-তে **Fetch** / **Pull**। কোনগুলো পিছিয়ে আছে, dashboard-এ দেখা যায়।
- পুরো একটা group-কে এক branch-এ switch করা।
- বাছাই করা repo-গুলোতে যেকোনো Git command চালানো, আর প্রতিটা repo-র output দেখা।
- এক click-এ যেকোনো repo VS Code বা terminal-এ খোলা।

### Flow ৮ — Pipeline বানানো আর চালানো

1. **Pipelines** → **New pipeline** খুলে নাম দিন `Update from main → dev`।
2. ধাপগুলো যোগ করুন: **Fetch** → **Update from branch** `main` (merge) → **Push** → **Integrate into branch** `dev`, পদ্ধতি **merge**। এর বদলে `dev`-এ pull request খুলতে চাইলে শেষ ধাপে পদ্ধতি হিসেবে **pull request** বেছে নিন।
3. Save করুন। Pipeline-টা এখন sidebar আর command palette-এ দেখা যাবে।
4. **Run**-এ click করে target বেছে নিন, যেমন task `TK-2636`। Preview-তে `app-api` আর `app-front`-এর প্রতিটা ধাপ দেখাবে, আর পুরো run-এর জন্য একটাই প্রশ্ন করবে: "This run pushes to the protected branch `dev` in 2 repos. Continue?"
5. চালান। `app-front` সব ধাপ শেষ করে। `app-api` "Update from main" ধাপে ৩টা conflicted file নিয়ে থেমে যায়। Merge editor-এ সেগুলো resolve করুন (Flow ৫), **Resume**-এ click করুন, তাহলে `app-api`-ও শেষ হবে।

## ৭. Functional requirement

Priority: **P0** = প্রথম release (MVP), **P1** = পরের release, **P2** = আরও পরে।

### A. Workspace আর dashboard

| ID | চাহিদা | Priority |
|---|---|---|
| DASH-01 | একটা folder খোলা বা একটা VS Code `.code-workspace` file import করা, আর তার ভেতরের সব Git repository খুঁজে বের করা, এক level ভেতরে থাকা (nested) repo সহ। কত গভীর পর্যন্ত খুঁজবে, তা setting-এ বদলানো যাবে। | P0 |
| DASH-02 | প্রতিটা repo-র জন্য দেখানো: বর্তমান branch, upstream-এর তুলনায় ahead/behind, base branch (`dev`)-এর তুলনায় ahead/behind, changed, staged আর untracked file-এর সংখ্যা, চলমান কোনো operation (merging, rebasing, cherry-picking), conflicted file-এর সংখ্যা, শেষ fetch-এর সময়, আর repo-টা কোন task বা pull request-এর অংশ। | P0 |
| DASH-03 | নাম দিয়ে repo search। Filter আর sort: dirty, পিছিয়ে আছে, conflict আছে, push না করা commit আছে, group, task। | P0 |
| DASH-04 | File বা Git-এর অবস্থা বদলালে আর app window-এ ফিরে এলে নিজে থেকে refresh। ঐচ্ছিক background fetch নির্দিষ্ট সময় পরপর চলে, default-ভাবে বন্ধ। | P0 |
| DASH-05 | Checkbox দিয়ে repo বাছাই। এই বাছাই যেকোনো bulk action বা pipeline-এর target set হতে পারে। | P0 |
| DASH-06 | কোনো repo-র row থেকে: VS Code-এ (বা setting-এ রাখা editor-এ) খোলা, সেই repo-তে terminal খোলা, file manager-এ খোলা, অথবা GitHub-এ খোলা। | P0 |
| DASH-07 | ঝুঁকিপূর্ণ অবস্থায় warning badge: protected branch-এ local commit, detached HEAD, upstream থেকে diverged, stash জমে আছে। | P1 |
| DASH-08 | কয়েকটা workspace রেখে menu থেকে একটা থেকে আরেকটায় যাওয়া। App চালু হলে শেষবার খোলা workspace আবার খোলে। | P1 |

### B. Group

| ID | চাহিদা | Priority |
|---|---|---|
| GRP-01 | নাম দেওয়া repo group তৈরি, নাম বদল, edit আর delete। | P0 |
| GRP-02 | Group-গুলো workspace-এর সাথে GitHeddle-এর setting-এ সেভ হবে, আর চাইলে team file-এও (CFG-03), যাতে share করা যায়। | P0 |
| GRP-03 | প্রতিটা bulk action আর pipeline-এর target হতে পারে সব repo, একটা group, বর্তমান selection, অথবা active task-এর repo-গুলো। | P0 |

### C. Task

| ID | চাহিদা | Priority |
|---|---|---|
| TASK-01 | Start Task: ticket key আর title থেকে setting-এ রাখা pattern অনুযায়ী branch-এর নাম তৈরি হবে। Default pattern `{ticket}-{user}-{title}` থেকে হয় `TK-2636-taosif-Onboarding`। Preview-তে branch-এর নাম edit করা যাবে। | P0 |
| TASK-02 | প্রতিটা বাছাই করা repo-তে Start Task যা করবে: working tree check, fetch, base (`dev`) শুধু fast-forward করে update, `origin/<base>` থেকে branch তৈরি, সেই branch-এ switch, আর চাইলে push করে upstream set। Branch আগে থেকেই local বা remote-এ থাকলে নতুন না বানিয়ে সেটাতে switch করার প্রস্তাব দেবে। | P0 |
| TASK-03 | একসময়ে একটাই task active থাকে, top bar-এ দেখায়। Switch Task নতুন task-এর প্রতিটা repo-কে তার branch-এ নিয়ে যায়, uncommitted change-এর ক্ষেত্রে SAFE-04-এর নিয়ম মেনে। | P0 |
| TASK-04 | চলমান task-এ repo যোগ করা, অথবা বাদ দেওয়া। | P0 |
| TASK-05 | Sync with Base: task-এর প্রতিটা repo-তে সর্বশেষ `origin/<base>` task branch-এ আনা, merge (default) বা rebase (setting) দিয়ে। প্রতিটা repo-র ফল জানানো: clean, conflicted, অথবা failed। এটা built-in pipeline হিসেবে চলে (§৭ M)। | P0 |
| TASK-06 | Merge Task Into…: task-এর প্রতিটা repo-তে task branch-কে একটা বাছাই করা branch-এ (যেমন `dev`) merge করা। সেই branch update, merge, conflict জানানো, আর confirm করার পরেই কেবল push। এটা built-in pipeline হিসেবে চলে (§৭ M)। | P0 |
| TASK-07 | Finish Task: task-এর repo-গুলোকে base branch-এ ফেরত নেওয়া, pull, local task branch delete (remote branch delete ঐচ্ছিক), আর task archive। কোনো branch-এ merge বা push না হওয়া commit থাকলে সতর্ক করা। | P1 |
| TASK-08 | Task workspace-এর সাথে সেভ থাকে আর app restart-এর পরেও থাকে। Pattern-এর সাথে মেলে এমন branch-এর নাম থেকে task আবার চিনে নেওয়া যাবে, যেমন অন্য machine-এ clone করার পরে। | P1 |

### D. Change আর commit

| ID | চাহিদা | Priority |
|---|---|---|
| CHG-01 | একটা Changes screen, যেটা দেখতে আর চলতে VS Code-এর Source Control-এর মতো। Change আছে এমন প্রতিটা repo একটা ভাঁজ করা যায় এমন অংশ, যেটা **Merge Changes** (conflicted file), **Staged Changes** আর **Changes** — এই তিন ভাগে বিভক্ত, প্রতিটার পাশে file-এর সংখ্যা। | P0 |
| CHG-02 | প্রতিটা file-এর row-তে দেখাবে file-এর নাম, তার folder (হালকা রঙে), কয়টা line যোগ আর বাদ হয়েছে (`+12 −3`), আর একটা রঙিন status অক্ষর: **M** modified, **A** added, **D** deleted, **R** renamed, **U** untracked, **!** conflicted। | P0 |
| CHG-03 | সাধারণ list আর folder tree-র মধ্যে বদলানো যাবে। সব repo জুড়ে file-এর নাম দিয়ে filter করা যাবে। | P0 |
| CHG-04 | কোনো file-এ click করলে তার diff খুলবে, পাশাপাশি বা inline, syntax highlighting সহ, আর ঠিক কোন শব্দ বদলেছে তা আলাদা করে highlight করা। | P0 |
| CHG-05 | Row-এর + / − button দিয়ে একটা file stage বা unstage করা, আর একবারে পুরো একটা ভাগ stage বা unstage করা। | P0 |
| CHG-06 | File-এ right-click করে: editor-এ খোলা, diff খোলা, stage বা unstage, change discard (SAFE-03-এর confirm নেওয়ার পরে), path copy, অথবা file manager-এ দেখানো। | P0 |
| CHG-07 | একটা repo-তে commit। Message box-এ branch-এর নাম থেকে নেওয়া ticket key আগে থেকে বসানো থাকবে (`TK-2636: `)। | P0 |
| CHG-08 | প্রতিটা repo-র commit history, message, author আর file দিয়ে search সহ। | P1 |
| CHG-09 | আলাদা আলাদা line বা hunk stage আর unstage করা। | P2 |
| CHG-10 | ঐচ্ছিক Conventional Commits format (`feat(TK-2636): …`)। | P2 |

### E. Bulk Git operation

| ID | চাহিদা | Priority |
|---|---|---|
| BULK-01 | Operation: fetch, pull (default শুধু fast-forward), push, branch switch, branch create, stash / stash pop, commit, merge, local branch delete। | P0 |
| BULK-02 | আরও operation: rebase, একটা commit অনেক repo-তে cherry-pick, remote branch delete, change discard, tag। | P1 |
| BULK-03 | চালানোর আগে preview: প্রতিটা target repo-তে কী হবে, সাথে warning (dirty tree, diverged, protected branch, করার কিছু নেই)। User চাইলে কোনো repo-র টিক তুলে দিতে পারবেন। Fetch-এর মতো read-only operation-এ preview লাগবে না। | P0 |
| BULK-04 | Setting-এ ঠিক করা সীমা (default ৪) পর্যন্ত parallel-এ চালানো, প্রতিটা repo-র progress দেখানো, আর cancel করতে দেওয়া। Cancel দিলে নতুন কোনো repo-তে শুরু হবে না, আর যে Git command-গুলো চলছে সেগুলো শেষ হবে। | P0 |
| BULK-05 | একটা repo fail করলেও বাকিগুলো চলবে। শেষে summary দেখাবে: কোনগুলো সফল, কোনগুলো বাদ, কোনগুলো ব্যর্থ। প্রতিটা ব্যর্থতায় দেখাবে কোন ধাপে আটকেছে আর Git-এর error message, সাথে Retry failed, Open terminal আর Show log button। | P0 |
| BULK-06 | Commit Task / Commit Selected: সব repo-র জন্য একটাই message, ticket থেকে আগে থেকে বসানো (`TK-2636: `)। কোন file commit হবে তা Changes screen-এ বাছাই করা হয় (§৭ D), আর যে repo-তে কিছু stage করা নেই সেটা বাদ। | P0 |
| BULK-07 | Run Git command: target repo-গুলোতে যেকোনো `git …` argument চালানো আর প্রতিটা repo-র output আলাদা করে দেখানো। | P1 |
| BULK-08 | আসলে চালানো প্রতিটা command (repo, command, exit code, কত সময় লাগল) app-এর activity log-এ লিখে রাখা। | P0 |
| BULK-09 | যেখানে নিরাপদ, সেখানে শেষ bulk action undo করা। Action-এর আগে প্রতিটা repo-র branch আর HEAD লিখে রাখা, তারপর আগের অবস্থায় ফেরানোর প্রস্তাব দেওয়া — যেমন তৈরি করা branch delete করা, আগের branch-এ ফেরা, বা push না হওয়া local commit undo করা। | P1 |

### F. Conflict আর merge editor

| ID | চাহিদা | Priority |
|---|---|---|
| CONF-01 | Conflicts screen: merge, rebase বা cherry-pick-এর মাঝপথে থাকা প্রতিটা repo, তার conflicted file, আর প্রতিটা file-এ কয়টা conflict। | P0 |
| CONF-02 | প্রতিটা file-এর জন্য: built-in merge editor-এ খোলা (default), current নেওয়া, incoming নেওয়া, অথবা setting-এ বাছাই করা বাইরের কোনো merge tool-এ খোলা (যেমন VS Code-এর merge editor)। | P0 |
| CONF-03 | Visual Studio-র মতো তিন pane-ওয়ালা একটা built-in merge editor: বামে **Incoming** (যে branch merge হয়ে আসছে), ডানে **Current** (আপনি যে branch-এ আছেন) আর নিচে **Result** (যে file সেভ হবে)। প্রতিটা pane-এর title-এ তার branch-এর নাম দেখাবে। | P0 |
| CONF-04 | প্রতিটা conflict-এর Incoming দিকে আর Current দিকে একটা করে checkbox। একটায় টিক দিলে সেই দিকটা Result-এ যায়। দুটোতেই টিক দিলে দুটোই Result-এ যায়, যে ক্রমে টিক দেওয়া হয়েছে সেই ক্রমে। Result হাতেও edit করা যায়। | P0 |
| CONF-05 | যেসব change-এ conflict নেই, সেগুলো আগে থেকেই Result-এ বসানো আর চিহ্নিত থাকবে, যাতে user শুধু আসল conflict-গুলোর সিদ্ধান্ত নেন। | P0 |
| CONF-06 | তিনটা pane-এ মিলে যাওয়া line-গুলো এক সারিতে থাকবে আর একসাথে scroll হবে, syntax highlighting আর শব্দ ধরে পার্থক্যের highlight সহ। | P0 |
| CONF-07 | Next আর Previous conflict-এর button আর shortcut, একটা counter ("Conflict 2 of 6"), আর কয়টা এখনো resolve হয়নি তার সংখ্যা। | P0 |
| CONF-08 | এক click-এ পুরো file-এর জন্য সব incoming বা সব current নেওয়া। | P0 |
| CONF-09 | Accept merge Result সেভ করে, file-টা resolved চিহ্নিত করে (stage করে), আর পরের conflicted file খোলে: আগে একই repo-তে, তারপর পরের repo-তে। File-এ এখনো resolve না হওয়া conflict থাকলে এটা আটকে থাকবে। | P0 |
| CONF-10 | প্রতিটা repo-তে: Continue (default message দিয়ে merge বা rebase শেষ করা) অথবা Abort। সব repo resolve হলে **Continue all** দেখা যাবে। | P0 |
| CONF-11 | Stage করা file-এ এখনো conflict marker (`<<<<<<<`, `=======`, `>>>>>>>`) থাকলে Continue আটকে দেওয়া। | P0 |
| CONF-12 | **Base** version (দুই branch-এর common ancestor) ঐচ্ছিক চতুর্থ view হিসেবে দেখানো। | P1 |

### G. Pull request (GitHub)

| ID | চাহিদা | Priority |
|---|---|---|
| PR-01 | Browser দিয়ে GitHub-এ sign in: app একটা code দেখাবে আর user github.com-এ গিয়ে সেটা approve করবেন (OAuth device flow)। বিকল্প হিসেবে personal access token-ও নেওয়া যাবে। Token থাকবে operating system-এর keychain-এ। | P0 |
| PR-02 | Task-এর pull request তৈরি: target-এর চেয়ে এগিয়ে থাকা commit আছে এমন প্রতিটা task repo-তে একটা করে pull request, দরকার হলে আগে branch push। Title আসে template থেকে (`{ticket}: {title}`), body-ও template থেকে। Option: draft, reviewer, assignee (default: আমি), label। তৈরির আগে প্রতিটা pull request preview আর edit করা যাবে। | P0 |
| PR-03 | Pull request তৈরির পরে প্রতিটার body-তে "Related pull requests" অংশ যোগ করা, যেখানে অন্য repo-গুলোতে থাকা একই task-এর pull request-এর link। পরে নতুন pull request যোগ হলে এটা update হবে। | P0 |
| PR-04 | কোনো repo-র নিজস্ব pull request template (`.github/pull_request_template.md`) থাকলে সেটাকে GitHeddle-এর template-এর সাথে মিলিয়ে নেওয়া। | P1 |
| PR-05 | Task-এর pull request status: প্রতিটা pull request-এর অবস্থা (draft, open, merged, closed), CI check, review-এর অবস্থা, merge করা যাবে নাকি conflict আছে, আর কয়টা comment। | P0 |
| PR-06 | Workspace-এর সব repo জুড়ে Pull Requests screen: আমার তৈরি, আমার কাছে review চাওয়া, বর্তমান task। | P1 |
| PR-07 | Task-এর pull request-গুলো একসাথে update: title বা body edit, reviewer বা label যোগ/বাদ, ready for review, draft-এ ফেরত, close। | P1 |
| PR-08 | Task-এর pull request-গুলো একসাথে merge, শুধু তখনই যখন check pass করেছে আর দরকারি review হয়ে গেছে (GitHub যেমন জানায়)। প্রতিটা repo-র একটা default merge method থাকে (merge, squash বা rebase)। Merge-এর ক্রম ঠিক করা যায়, যেমন `app-api` আগে, `app-front` পরে। পরে branch delete করা ঐচ্ছিক। | P1 |
| PR-09 | অন্য কারো task review: একটা pull request থেকে শুরু করে সংশ্লিষ্ট প্রতিটা repo-তে তার branch checkout, app-এর ভেতরেই diff পড়া, আর approve, request changes বা comment। | P2 |
| PR-10 | আমার কোনো pull request-এ CI fail হলে, changes requested হলে, approve হলে বা নতুন comment এলে system notification। | P2 |
| PR-11 | যেকোনো pull request browser-এ খোলা। | P0 |

### H. নিরাপত্তা

| ID | চাহিদা | Priority |
|---|---|---|
| SAFE-01 | User নিজে সেই action-এর জন্য "force with lease" বেছে নিয়ে confirm না করলে কখনো force push নয়। সরাসরি `--force` কখনোই ব্যবহার হবে না। | P0 |
| SAFE-02 | Protected branch (default `main`, `master` আর `dev`; বদলানো যায়): এগুলোতে commit, merge বা push করার আগে সতর্ক করা আর confirm চাওয়া। Pipeline run-এ এটা preview-তে পুরো run-এর জন্য একবারই জিজ্ঞেস করা হয়। | P0 |
| SAFE-03 | Destructive action (change discard, merge না হওয়া commit সহ branch delete, reset) ঠিক কী কী হারাবে তার তালিকা দেখাবে আর স্পষ্ট confirm চাইবে। | P0 |
| SAFE-04 | কোনো repo-তে uncommitted change থাকা অবস্থায় branch switch-এর আগে বেছে নিতে দেওয়া: Stash (`githeddle/<task>` নামে), Skip this repo, অথবা Cancel। কখনো চুপচাপ change discard নয়। আবার ফেরত এলে stash pop করার প্রস্তাব। | P0 |
| SAFE-05 | User-এর নিজের Git installation, config, credential আর hook ব্যবহার করা। Hook কখনো এড়িয়ে যাওয়া হবে না। | P0 |
| SAFE-06 | কোনো repo আগে থেকেই merge বা rebase-এর মাঝপথে থাকলে সেখানে নতুন operation শুরু না করা, যদি না operation-টা সেই অবস্থার জন্যই হয় (resolve, continue, abort)। | P0 |
| SAFE-07 | কোনো operation বা pipeline-এর ধাপ চলার ঠিক আগে প্রতিটা repo-র অবস্থা আবার check করা, কারণ preview-এর পরে user হয়তো VS Code বা terminal থেকে সেটা বদলে ফেলেছেন। | P0 |

### I. Configuration

| ID | চাহিদা | Priority |
|---|---|---|
| CFG-01 | Setting: branch name pattern, user-এর ছোট নাম (`taosif`), default base branch, protected branch, parallel সীমা, sync পদ্ধতি (merge বা rebase), pull request-এর title আর body template, group অনুযায়ী default reviewer, background fetch interval, কোন editor, terminal আর merge tool খুলবে (default: VS Code আর system-এর terminal), theme। | P0 |
| CFG-02 | Repo অনুযায়ী আলাদা setting, যেমন কোনো repo-র base branch `dev` না হয়ে `main`। | P0 |
| CFG-03 | Workspace-এ ঐচ্ছিক team config file (`.githeddle.json`), যেখানে shared group, pattern, template আর pipeline থাকবে। এটা repository থেকে আসে বলে এতে চালানোর মতো কোনো program-এর নাম (editor, terminal, merge tool) বা Run Git command ধাপ রাখা যাবে না, আর এতে কোনো বদল user approve করার পরেই কার্যকর হবে। | P1 |

### J. Platform আর installation

| ID | চাহিদা | Priority |
|---|---|---|
| PLAT-01 | চলবে Windows 10 আর 11-এ (x64 আর ARM64), macOS 13.3 বা নতুনে (Apple Silicon আর Intel; UI-র যে Safari 16.4 webview লাগে সেটা আসে 13.3-এ, দেখুন ADR 0001), আর Linux x64-এ (Ubuntu 22.04 বা নতুন, Fedora 39 বা নতুন, আর এই ধরনের অন্য distribution)। | P0 |
| PLAT-02 | Installer: Windows-এর জন্য `.exe` installer, যেটা admin অধিকার ছাড়াই শুধু ওই user-এর জন্য install হয়; macOS-এর জন্য `.dmg`; Linux-এর জন্য AppImage আর `.deb`। | P0 |
| PLAT-03 | প্রতিটা feature তিনটা system-এ একইভাবে কাজ করবে। Platform-এর পার্থক্যগুলো user না, app নিজে সামলাবে: path, line ending, বড়-ছোট হাতের অক্ষর আলাদা ধরা file-এর নাম, shell আর credential helper। | P0 |
| PLAT-04 | প্রতিটা release বের হওয়ার আগে তিনটা system-এই test হবে। | P0 |
| PLAT-05 | Keyboard shortcut প্রতিটা system-এর নিয়ম মানবে: Windows আর Linux-এ Ctrl, macOS-এ ⌘। | P0 |
| PLAT-06 | Light আর dark theme, default-ভাবে system-এর setting অনুযায়ী। | P0 |
| PLAT-07 | Automatic update: app নতুন version আছে কি না দেখবে, কী বদলেছে দেখাবে, আর restart-এর সময় install করবে — কখনো কোনো operation-এর মাঝখানে না। | P1 |
| PLAT-08 | Windows-এ signed installer, যাতে SmartScreen "unknown publisher" সতর্কবার্তা না দেখায়। | P1 |
| PLAT-09 | Linux-এর জন্য `.rpm` package। | P1 |
| PLAT-10 | Linux ARM64 build। | P2 |
| PLAT-11 | Notarised macOS app (Developer ID), যাতে Gatekeeper কোনো সতর্কবার্তা না দেখায়। এর জন্য টাকা দিয়ে Apple Developer account লাগে, যেটা project-এর এখনো নেই। ততদিন macOS build ad-hoc signed থাকবে। | P2 |
| PLAT-12 | যতদিন কোনো installer unsigned বা notarised নয়, ততদিন একটা install guide থাকবে, download page আর প্রতিটা release থেকে যার link দেওয়া। Guide-টা ধাপে ধাপে বলে দেবে প্রতিটা system-এর সতর্কবার্তা পার হয়ে কীভাবে app খুলতে হয়: Windows-এ SmartScreen-এর "Run anyway", macOS-এ Privacy & Security-র "Open Anyway", আর download করা file `SHA256SUMS`-এর সাথে কীভাবে মিলিয়ে দেখতে হয়। | P0 |

### K. গতি

| ID | চাহিদা | Priority |
|---|---|---|
| PERF-01 | App চালু করা থেকে ব্যবহারযোগ্য window: দ্বিতীয়বার থেকে ১ সেকেন্ডের কম, আর reboot-এর পর প্রথমবার ২ সেকেন্ডের কম। | P0 |
| PERF-02 | খোলার সাথে সাথে dashboard শেষ জানা অবস্থা দেখাবে, তারপর ১০টা repo-র live অবস্থা ১ সেকেন্ডের মধ্যে আর ৩০টা repo-র ২ সেকেন্ডের মধ্যে। | P0 |
| PERF-03 | প্রতিটা click, key press আর scroll-এ ১০০ ms-এর মধ্যে চোখে পড়ার মতো সাড়া। লম্বা operation-এ সাথে সাথে progress দেখাবে। | P0 |
| PERF-04 | কোনো Git operation শেষ হলে সংশ্লিষ্ট repo-র row ৩০০ ms-এর মধ্যে update হবে। | P0 |
| PERF-05 | Git আর network-এর কাজ কখনো window আটকে রাখবে না। Bulk action আর pipeline চলার সময়ও user ঘোরাঘুরি, search আর বাছাই চালিয়ে যেতে পারবেন। | P0 |
| PERF-06 | ১০,০০০ line পর্যন্ত file-এর জন্য diff ৩০০ ms-এর মধ্যে আর merge editor ৫০০ ms-এর মধ্যে খুলবে। এর চেয়ে বড় file অংশে অংশে দেখানো হবে। | P0 |
| PERF-07 | ৩০টা repo খোলা থাকলেও memory ২৫০ MB-এর নিচে থাকবে, আর কিছু না করার সময় CPU প্রায় শূন্য (অনবরত poll করা হবে না)। | P0 |
| PERF-08 | Changes screen সব repo মিলিয়ে ৫,০০০ পর্যন্ত changed file দেখাবে, আর তখনও মসৃণভাবে scroll হবে। | P0 |
| PERF-09 | Installer ৬০ MB-এর কম। | P1 |

### L. সহজে ব্যবহার

| ID | চাহিদা | Priority |
|---|---|---|
| UX-01 | প্রথমবার চালানোর সময় app user-কে ধাপে ধাপে নিয়ে যাবে: folder বাছাই, নিজের নাম আর base branch নিশ্চিত করা, আর GitHub-এ sign in। ২ মিনিটের কম লাগবে, আর যেকোনো ধাপ বাদ দেওয়া যাবে। | P0 |
| UX-02 | Button-এ সেই Git শব্দগুলোই থাকবে যা user আগে থেকে চেনেন (Fetch, Pull, Push, Commit), আর tooltip এক লাইনের সহজ বাক্যে বলবে প্রতিটা কী করবে। | P0 |
| UX-03 | যে action কিছু বদলায়, সেটা চালানোর আগে কী করবে তার preview আর পরে ফলাফল দেখাবে (BULK-03, BULK-05, PIPE-05, PIPE-08)। | P0 |
| UX-04 | Error message বলবে কী ভুল হয়েছে, কোন repo-তে, আর এরপর কী করতে হবে — যেমন "Pull stopped: app-front has local changes. Stash them or commit first."। Git-এর আসল message এক click দূরে থাকবে। | P0 |
| UX-05 | Command palette (Ctrl+K / ⌘K)-এ নাম লিখে যেকোনো action বা pipeline চালানো যাবে, প্রতিটা নিয়মিত action-এর keyboard shortcut থাকবে, আর mouse ছাড়াই পুরো app ব্যবহার করা যাবে। | P0 |
| UX-06 | খালি screen আর প্রথমবারের screen বলবে এরপর কী করতে হবে, যেমন "No task yet. Start a task"। | P0 |
| UX-07 | সাধারণ flow-গুলো (Start Task, Commit Task, Create Pull Requests, Sync with Base, Run Pipeline) dashboard থেকে সর্বোচ্চ ৩ click-এ হবে। | P0 |
| UX-08 | দুই theme-এই পড়ার মতো contrast, প্রতিটা control keyboard দিয়ে পৌঁছানো যাবে আর screen reader-এর জন্য label করা থাকবে, আর লেখা zoom করা যাবে (Ctrl +/− বা ⌘ +/−)। | P0 |
| UX-09 | App এক session থেকে পরের session-এ window-এর size, layout, খোলা workspace আর filter মনে রাখবে। | P0 |
| UX-10 | Cancel বা ব্যর্থতার পরে app পরিষ্কার বলবে কী বদলেছে আর কী বদলায়নি, আর যেখানে নিরাপদ সেখানে undo-র প্রস্তাব দেবে (BULK-09)। | P1 |
| UX-11 | Built-in help: প্রতিটা screen-এ একটা "?" থাকবে, সেখানে ছোট ব্যাখ্যা আর পুরো guide-এর link। | P1 |

### M. Pipeline

| ID | চাহিদা | Priority |
|---|---|---|
| PIPE-01 | Pipeline তৈরি, নাম দেওয়া, edit, duplicate আর delete। Pipeline হলো ধাপের একটা ক্রমিক তালিকা, workspace-এর সাথে সেভ থাকে। | P0 |
| PIPE-02 | v0.1-এ যেসব ধাপ থাকবে: **Fetch**; **Update from branch**, যেটা অন্য একটা branch (যেমন `main`) merge বা rebase দিয়ে current branch-এ নিয়ে আসে; current branch **Push**; **Switch branch**; **Integrate into branch**, যেটা current branch-কে অন্য একটা branch-এ (যেমন `dev` বা `main`) নিয়ে যায় merge, rebase বা pull request দিয়ে (PIPE-03); আর **Wait for confirmation**, যেটা user Continue-তে click না করা পর্যন্ত থেমে থাকে। | P0 |
| PIPE-03 | Integrate into branch-এর তিনটা পদ্ধতি। **Merge:** target-কে তার remote থেকে update করা, current branch তাতে merge করা, আর target push করা (ঐচ্ছিক, default চালু)। **Rebase:** current branch-কে target-এর ওপর rebase করা, target-কে fast-forward করে সেখানে আনা, আর দুটোই push করা। Current branch আগেই push করা থাকলে তার push-এ force with lease লাগবে, যেটা preview-তে confirm করা হয় (SAFE-01)। **Pull request:** current branch push করে target-এ একটা pull request খোলা, PR-02-এর option সহ। | P0 |
| PIPE-04 | Branch-এর ঘরে একটা নির্দিষ্ট নাম বা একটা variable দেওয়া যাবে: `{current}` (run শুরুর সময় repo যে branch-এ আছে), `{base}` (repo-র base branch) অথবা `{task}` (active task-এর branch)। | P0 |
| PIPE-05 | Pipeline যেকোনো target set-এ চালানো যাবে। Preview-তে প্রতিটা repo আর প্রতিটা ধাপে কী হবে তা দেখাবে, warning সহ। Protected branch-এ push আর force-with-lease push-গুলোর তালিকা দেখিয়ে পুরো run-এর জন্য একবারই confirm নেওয়া হবে। | P0 |
| PIPE-06 | একটা repo-র ভেতরে ধাপগুলো ক্রম অনুযায়ী চলে। Repo-গুলো BULK-04-এর সীমা পর্যন্ত parallel-এ চলে। শেষ ধাপের পরে প্রতিটা repo যে branch-এ শুরু হয়েছিল সেখানে ফিরবে কি না, তা প্রতিটা pipeline-এর একটা setting ঠিক করে (default চালু)। | P0 |
| PIPE-07 | কোনো repo-তে কোনো ধাপ fail করলে বা conflict-এ পড়লে সেই repo ওই ধাপে থেমে যায়, আর বাকি repo-গুলো চলতে থাকে। Conflict resolve হওয়ার পরে (§৭ F) **Resume** থেমে থাকা ধাপ থেকে আবার চালায়, **Skip step** পরের ধাপে চলে যায়, আর **Stop** ওই repo-র run শেষ করে এবং যেখানে নিরাপদ সেখানে undo-র প্রস্তাব দেয় (BULK-09)। App বন্ধ হয়ে গেলেও থেমে থাকা run রাখা থাকে, পরে আবার চালানো যায়। | P0 |
| PIPE-08 | Run screen হলো repo × ধাপের একটা grid। প্রতিটা ঘরে দেখাবে ✓ শেষ, ✗ ব্যর্থ, ⏸ থেমে আছে, – বাদ অথবা ○ অপেক্ষায়, আর কোনো ঘরে click করলে সেখানে কোন command চলেছে আর তার output দেখা যাবে। | P0 |
| PIPE-09 | আগে থেকে বানানো pipeline, যেগুলো edit বা copy করা যায়: "Update from main" (Fetch → `main` থেকে Update → Push), "Update from main, merge into dev", আর "Update from main, pull request to dev"। | P0 |
| PIPE-10 | Sidebar থেকে, কোনো task থেকে, অথবা command palette-এ নাম লিখে pipeline চালানো। | P0 |
| PIPE-11 | প্রতিটা ধাপের option: করার কিছু না থাকলে বাদ দাও (default চালু), আর ধাপ fail করলে এই repo থামাও (default চালু)। | P1 |
| PIPE-12 | কোনো pipeline-এর জন্য keyboard shortcut ঠিক করা। | P1 |
| PIPE-13 | Team file (CFG-03) দিয়ে pipeline share করা। | P1 |
| PIPE-14 | Run history: প্রতিটা run-এর সময়, target repo আর প্রতিটা repo-র ফলাফল, সাথে **Run again**। | P1 |
| PIPE-15 | আরও ধরনের ধাপ: Git command চালানো, branch delete, tag তৈরি, আর check pass করলে pull request merge করা (PR-08)। | P2 |

## ৮. User experience

### মূল window

- **Top bar:** workspace বাছাই, target বাছাই, active task, প্রধান button-গুলো (Start Task, Run Pipeline, Fetch, Pull, Push) আর search / command palette।
- **বাম sidebar:** task, pipeline, group, আর screen-গুলো: Repositories, Changes, Pull Requests, Conflicts আর Pipelines, পাশে সংখ্যা সহ।
- **মাঝখানে:** বাছাই করা screen। Default হলো Repositories dashboard।
- **ডান panel:** যা বাছাই করা আছে (একটা repo, task বা pull request) তার বিস্তারিত: branch, change, pull request status আর তার action-গুলো।
- **নিচের bar:** চলমান operation, শেষ fetch-এর সময় আর activity log-এর link।

```text
GitHeddle   Workspace: acme-works ▾   Target: Task TK-2636 ▾   [Start Task] [Run Pipeline ▾] [Fetch] [Pull] [Push]   Search… Ctrl+K
──────────────────┬───────────────────────────────────────────────────────────────────────────────────────────
 TASKS            │    Repo                 Branch                      ↑/↓ origin   ↓ dev   Changes   State
 ● TK-2636        │ ☑  app-api              dev                         0/0          0       6         MERGING · 3 conflicted
   TK-2601        │ ☑  app-front            TK-2636-taosif-Onboarding   2/0          4       2         PR #412 ✓ CI
                  │ ☐  app-report-api       main                        0/1          –       0         behind
 PIPELINES        │ ☐  app-scheduler-api    main                        0/0          –       0         clean
   Update → dev   │ ☐  app-signalr-api      main                        0/0          –       0         clean
   Update → PR    │ ☐  knowledge-hub        main                        0/0          –       0         clean
                  │
 GROUPS           │
   backend        │
   frontend       │
   docs           │
                  │
 SCREENS          │
   Repos          │
   Changes      8 │
   Pull requests 1│
   Conflicts    1 │
   Pipelines      │
──────────────────┴───────────────────────────────────────────────────────────────────────────────────────────
 Nothing running · Last fetch 2 min ago · Activity log
```

*(উদাহরণের মান। Sketch সরু রাখতে ডান panel বাদ দেওয়া হয়েছে।)*

### Changes screen (VS Code-এর মতো)

```text
CHANGES                                                    [ List | Tree ]   Filter files…
▾ app-api          dev · merging TK-2636-taosif-Onboarding
  ▾ Merge Changes  3                                                              [+ all]
      Api.csproj                        Api                                         !
      DeleteOnboarding.cs               Services/HrmService/Features/…              !
      DeleteOnboardingTests.cs          Tests/HrmService.Integration/…              !
  ▾ Staged Changes  3                                                             [− all]
      Program.cs                        Api                             +8 −2       M
      ValidationExceptionMiddleware.cs  Api/Middleware                  +15 −0      M
      PayloadEncryptionTests.cs         Tests/Api.Integration/…         +40 −6      M
▾ app-front        TK-2636-taosif-Onboarding
  ▾ Changes  2                                                                    [+ all]
      cost-center.service.ts            src/app/hrm/…                   +22 −4      M
      cost-center-list.component.html   src/app/hrm/…                   +5 −1       M

  Message: TK-2636: ______________________________            [ Commit ]  [ Commit & Push ]
```

*(`app-api`-এর file-গুলো screenshot থেকে নেওয়া। `app-front`-এর file আর line-এর সংখ্যাগুলো উদাহরণের মান।)*

### Merge editor (Visual Studio-র মতো)

```text
Api.csproj · app-api · merging TK-2636-taosif-Onboarding into dev         Conflict 2 of 6   [Prev] [Next]

 INCOMING  TK-2636-taosif-Onboarding             │  CURRENT  dev
 ☐  <PackageReference Include="Serilog"          │  ☑  <PackageReference Include="Serilog"
         Version="4.1.0" />                      │          Version="4.0.2" />
─────────────────────────────────────────────────┴──────────────────────────────────────────────
 RESULT (editable)
    <PackageReference Include="Serilog" Version="4.0.2" />
────────────────────────────────────────────────────────────────────────────────────────────────
 [Take all incoming]  [Take all current]                                        [Accept merge]
```

*(উদাহরণের মান।)*

### Pipeline editor আর run screen

```text
PIPELINE  Update from main → dev                                       [ Save ]  [ Run… ]
  1  Fetch
  2  Update from branch    [ main ▾ ]    using  [ merge ▾ ]
  3  Push                  current branch
  4  Integrate into        [ dev ▾ ]     using  [ merge ▾ ]      (merge · rebase · pull request)
  [ + Add step ]
  ☑ Return each repo to the branch it started on

RUN  Update from main → dev · Task TK-2636 · 2 repos
               Fetch   Update from main   Push   Into dev
  app-front    ✓       ✓                  ✓      ✓
  app-api      ✓       ⏸ 3 conflicts      ○      ○        [ Open conflicts ]  [ Resume ]  [ Stop ]
```

*(উদাহরণের মান।)*

### Screen

| Screen | কী দেখায় |
|---|---|
| Repositories | Dashboard: প্রতিটা repo-র অবস্থা (DASH-02)। |
| Changes | VS Code-এর ধাঁচে প্রতিটা repo-র changed file-এর তালিকা, তাদের diff, আর commit box (§৭ D)। |
| Pull Requests | আমার তৈরি, আমার কাছে review চাওয়া, বর্তমান task। |
| Conflicts | Merge বা rebase-এর মাঝপথে থাকা repo আর তাদের conflicted file। প্রতিটা file তিন pane-ওয়ালা merge editor-এ খোলে (§৭ F)। |
| Pipelines | সেভ করা pipeline, pipeline editor, run screen আর run history (§৭ M)। |
| Task | Task-এর repo, branch আর pull request, সাথে Sync, Merge Into, Create Pull Requests আর Finish। |
| Activity log | এ পর্যন্ত চালানো প্রতিটা Git command, তার output সহ। |
| Settings | CFG-01 আর CFG-02-এর সবকিছু। |

### Keyboard shortcut (প্রস্তাবিত)

| Action | Windows / Linux | macOS |
|---|---|---|
| Command palette | Ctrl+K | ⌘K |
| Start Task | Ctrl+N | ⌘N |
| Repo search | Ctrl+F | ⌘F |
| Refresh | F5 | ⌘R |
| Commit | Ctrl+Enter | ⌘Enter |
| পরের / আগের conflict | F8 / Shift+F8 | F8 / ⇧F8 |
| Accept merge | Ctrl+S | ⌘S |
| Settings | Ctrl+, | ⌘, |

### Preview আর ফলাফল (উদাহরণের মান)

```text
Sync task TK-2636 with dev — 2 repos
  app-api     merge origin/dev (5 new commits) into TK-2636-taosif-Onboarding
  app-front   ⚠ 2 uncommitted files → [ Stash and continue ▾ ]
                                                        [ Cancel ]  [ Run ]

Sync task TK-2636 with dev — finished in 4.2 s
  ✓ app-front   merged, no conflicts
  ✗ app-api     3 conflicted files → [ Open conflicts ]
                                              [ Retry failed ]  [ Show log ]
```

### UX-এর নিয়ম

- প্রতিটা bulk action আর pipeline একই তিন ধাপে চলে: **preview → run → result**।
- কোনো action চালানোর আগে user সবসময় দেখতে পাবেন কোন কোন repo-তে সেটা চলবে।
- Error-এ repo-র নাম, কোন ধাপ, আর এরপর কী করতে হবে — তিনটাই থাকবে। কখনো শুধু "কিছু একটা সমস্যা হয়েছে" নয়।
- গুরুত্বপূর্ণ কিছু menu-র ভেতরে লুকানো থাকবে না। প্রধান action-গুলো screen-এই থাকবে, বাকি সব command palette-এ।
- যাঁরা VS Code চেনেন, Changes screen-এ তাঁদের চেনা চেনা লাগবে; আর যাঁরা Visual Studio চেনেন, merge editor-এ তাঁদের চেনা চেনা লাগবে।
- Shortcut key (Ctrl বা ⌘) ছাড়া Windows, macOS আর Linux-এ app দেখতে আর চলতে একই রকম।

## ৯. Non-functional requirement

| ক্ষেত্র | চাহিদা |
|---|---|
| **Performance** | §৭ K-এর লক্ষ্যগুলো, তিনটা system-এর প্রতিটাতে বাস্তব আকারের ৩০টা repo-র একটা reference workspace দিয়ে মাপা হবে। |
| **Scale** | প্রতি workspace-এ ১–৩০টা repo-র জন্য বানানো, ৫০টা দিয়ে test করা। |
| **Reliability** | কোনো bulk action বা pipeline কোনো repo-কে অজানা অবস্থায় ফেলে রাখবে না। প্রতিটা repo-র শেষ অবস্থা জানানো হবে। Operation চলার সময় app বন্ধ হয়ে গেলে বা crash করলে, পরের বার চালু হলে দেখাবে কোন কোন repo প্রভাবিত হয়েছিল আর সেগুলো এখন কী অবস্থায় আছে, আর থেমে থাকা pipeline run আবার চালানো যাবে। |
| **Safety** | কোনো কাজ হারাবে না (§৭ H)। |
| **Security আর privacy** | Token শুধু operating system-এর keychain-এ থাকবে (Windows Credential Manager, macOS Keychain, Linux Secret Service), কখনো plain text-এ না। Network call শুধু Git remote, GitHub API আর v0.2 থেকে update server-এ যাবে। প্রথম release-এ কোনো telemetry নেই। |
| **Compatibility** | PLAT-01-এর system-গুলো। Git 2.30 বা নতুন install করা থাকতে হবে, আর না থাকলে app বলে দেবে কীভাবে install করতে হয়। HTTPS আর SSH দুই রকম remote, user-এর নিজের credential helper দিয়ে। |
| **Transparency** | চালানো প্রতিটা Git command activity log-এ দেখা যাবে। GitHeddle এমন কিছু করবে না যা user terminal-এ নিজে করতে পারতেন না। |
| **ভাষা** | প্রথম release-এ UI ইংরেজিতে (খোলা প্রশ্ন ৭)। |

## ১০. Technical approach

| অংশ | প্রস্তাব |
|---|---|
| App | একটাই codebase, যেটা থেকে Windows, macOS আর Linux-এর native desktop app build হবে। Technology হলো Tauri 2 (প্রশ্ন ৯, [ADR 0001](../decisions/0001-tech-stack.bn.md))। |
| Git operation | প্রতিটা repo-তে user-এর নিজের `git` CLI চালানো, যাতে আচরণ, credential আর hook terminal-এর মতোই হয়। UI thread-এর বাইরে একটা job runner parallel সীমা, cancel আর প্রতিটা repo-র ফলাফল সামলাবে। |
| Repo-র অবস্থা | সরাসরি Git থেকে পড়া (যেমন `git status --porcelain=v2 --branch`), file system-এর বদল নজরে রাখা, আর শেষ জানা অবস্থা disk-এ cache করে রাখা, যাতে চালু হওয়ার সাথে সাথে dashboard দেখা যায়। |
| Diff আর merge | Changes screen, diff view আর merge editor — তিনটার জন্য একটাই shared diff engine। Merge editor একটা conflicted file-এর তিনটা version সরাসরি Git থেকে নেয় (index stage 1, 2 আর 3), আর conflict-এর অংশগুলো নেয় Git file-এর ভেতরে যে marker লিখেছে সেখান থেকে, ফলে এর ফলাফল সবসময় Git যা করেছে তার সাথে মেলে। কোন stage Current আর কোনটা Incoming হিসেবে দেখানো হবে, সেটা নির্ভর করে কাজটা merge, rebase নাকি cherry-pick তার ওপর (architecture ডকুমেন্ট দেখুন)। |
| Pipeline | Data হিসেবে সেভ থাকে: ধাপের একটা ক্রমিক তালিকা, প্রতিটার setting সহ। Bulk action-এর একই job runner-এ চলে। প্রতিটা repo-র run একটা ছোট state machine, যেটা থামতে আর আবার চলতে পারে, আর তার অবস্থা disk-এ সেভ থাকে, ফলে app restart-এর পরেও থেমে থাকা run টিকে থাকে। |
| GitHub | Sign in-এর জন্য OAuth device flow, আর GitHub REST ও GraphQL API। GraphQL দিয়ে এক request-এ অনেক pull request-এর status আনা যায়। |
| Storage | Setting, workspace, group, task আর pipeline থাকবে app-এর config folder-এ, প্রতিটা system-এর প্রচলিত জায়গায় (Windows-এ `%APPDATA%`, macOS-এ `~/Library/Application Support`, Linux-এ `~/.config`)। State cache, pipeline journal আর log থাকবে local data folder-এ (Windows-এ `%LOCALAPPDATA%`, Linux-এ `$XDG_DATA_HOME`); বিস্তারিত আছে architecture ডকুমেন্টে। ঐচ্ছিক team file `.githeddle.json` থাকবে workspace-এ। Token থাকবে system keychain-এ। |
| Editor আর tool | Default-ভাবে `code` command দিয়ে repo আর file VS Code-এ খোলা। Editor, terminal আর বাইরের merge tool setting-এ বদলানো যাবে। |
| Hosting provider | একটা provider interface (pull request তৈরি, তালিকা, update, merge; check আর review পড়া), যাতে পরে বাকি অংশ না বদলেই GitLab বা Azure DevOps যোগ করা যায়। |
| Update (v0.2) | Signed update package, publish হবে GitHub Releases-এ (প্রশ্ন ৬)। Updater কীভাবে কাজ করে, তা আছে [build ও release](../engineering/build-and-release.bn.md) ডকুমেন্টে। |

### Technology-র সিদ্ধান্ত

সিদ্ধান্তটা লেখা আছে [ADR 0001](../decisions/0001-tech-stack.bn.md)-এ। পাঁচ agent-এর একটা review panel সর্বসম্মত vote দিয়ে এটা ঠিক করেছে: **Tauri 2, Rust core আর React + TypeScript UI**। Fallback হলো Electron। [Roadmap](../plan/roadmap.bn.md)-এর M1 go/no-go gate তিনটা system-এই পার হলে সিদ্ধান্তটা চূড়ান্ত হবে। ওপরের table-এর প্রতিটা অংশ কীভাবে তৈরি হবে, সেটা আছে [architecture](../architecture/architecture.bn.md) ডকুমেন্টে।

## ১১. সাফল্যের মাপকাঠি

বানানো শুরুর আগে একবার হাতে করা flow-গুলোর সময় মেপে baseline রাখতে হবে।

| মাপকাঠি | লক্ষ্য |
|---|---|
| ২টা repo-তে task শুরু করা | ৩০ সেকেন্ডের কম |
| ২–৩টা repo-র task-এর pull request তৈরি | ১ মিনিটের কম, browser না খুলেই |
| Task-এর repo-গুলোতে সেভ করা pipeline চালানো | ২ click (Run, তারপর confirm) |
| একটা conflicted file resolve করা | পুরোটাই GitHeddle-এর merge editor-এ, অন্য কোনো tool না খুলে |
| App চালু হওয়া | তিনটা system-এই ১ সেকেন্ডের কম (দ্বিতীয়বার থেকে) |
| প্রথমবারের setup | ২ মিনিটের কম |
| সাহায্য ছাড়া নতুন user | GitHeddle আগে কখনো ব্যবহার করেননি এমন একজন teammate প্রথমবার খোলা থেকে ২টা repo-র task-এর pull request তৈরি পর্যন্ত কারো সাহায্য না চেয়েই যেতে পারবেন |
| সব জায়গায় একই আচরণ | v0.1-এর প্রতিটা flow Windows, macOS আর Linux-এ pass করবে |
| Uncommitted কাজ হারানো, অথবা অনিচ্ছাকৃতভাবে protected branch-এ push | শূন্য |
| প্রতিদিনের ব্যবহার | টানা ২ সপ্তাহ লেখক সব covered flow-তে হাতে না করে GitHeddle ব্যবহার করবেন |

## ১২. Release পরিকল্পনা

| Release | কী থাকবে |
|---|---|
| **v0.1 — MVP** | সব P0 চাহিদা: dashboard, group, diff আর commit সহ VS Code-এর ধাঁচের Changes screen, bulk operation, Start আর Switch Task, Sync with Base, Merge Task Into…, তিন pane-ওয়ালা merge editor সহ Conflicts screen, আগে থেকে বানানোগুলো সহ pipeline, related link সহ pull request তৈরি, task-এর pull request status, নিরাপত্তার নিয়ম, setting, তিনটা system-এর installer, আর গতি ও সহজে ব্যবহারের চাহিদাগুলো। |
| **v0.2** | সব P1 চাহিদা: merge editor-এ Base view, pipeline-এর ধাপের option, shortcut, share আর run history, automatic update, signed Windows installer, `.rpm` package, Pull Requests screen, pull request-গুলো একসাথে update আর merge, Finish Task, undo, commit history, আরও operation, Run Git command, team config file, repo-র pull request template, কয়েকটা workspace, built-in help। |
| **v0.3 এবং পরে** | P2 চাহিদা আর নতুন host: line ধরে stage, আরও ধরনের pipeline ধাপ, review flow, notification, Conventional Commits, Linux ARM64, Apple Developer account হলে notarised macOS app, GitLab আর Azure DevOps, issue tracker থেকে ticket title আনা, AI দিয়ে লেখা pull request description। |

**v0.1 শেষ ধরা হবে যখন** লেখক ২টা repo-তে ছড়ানো একটা আসল ticket শুধু GitHeddle আর একটা editor দিয়ে Start Task থেকে pull request তৈরি পর্যন্ত নিয়ে যেতে পারবেন — যার মধ্যে অন্তত একটা conflict merge editor-এ resolve করা আর একবার একটা সেভ করা pipeline চালানো থাকবে; একই flow-গুলো macOS আর Linux-এর test machine-এ pass করবে; আর তিনটা system-এই চালু হওয়া আর dashboard-এর লক্ষ্য (PERF-01, PERF-02) পূরণ হবে।

## ১৩. ঝুঁকি আর প্রতিকার

| ঝুঁকি | প্রতিকার |
|---|---|
| তিনটা system মানে তিন গুণ test | প্রথম দিন থেকেই CI-তে Windows, macOS আর Linux-এ automated test, একটা shared reference workspace দিয়ে। |
| Platform-এর পার্থক্য (path, line ending, বড়-ছোট হাতের অক্ষর, Linux-এ credential helper) থেকে শুধু একটা system-এ bug | এগুলো core-এর এক জায়গায় সামলানো, আর সেই অংশ তিনটা system-এই test করা। |
| Unsigned installer ভয় পাওয়ানো সতর্কবার্তা দেখায়, ফলে প্রথম অভিজ্ঞতা খারাপ হয় | v0.2-এ Windows signing। Apple Developer account না হওয়া পর্যন্ত macOS ad-hoc signed থাকবে (PLAT-11)। ততদিন download page থেকে link দেওয়া install guide প্রতিটা সতর্কবার্তা আর তা কীভাবে পার হতে হয় সেটা ব্যাখ্যা করবে (PLAT-12)। |
| Desktop app বড় কাজ: Changes screen, diff view আর তিন pane-ওয়ালা merge editor — সবই বানাতে হবে | আগে একটা shared diff engine বানানো, আর তিনটাতেই সেটা ব্যবহার করা। বিকল্প হিসেবে বাইরের merge tool খোলার ব্যবস্থা থাকবে। |
| Feature বাড়ার সাথে সাথে "খুব fast" ধীরে ধীরে হারিয়ে যায় | §৭ K-এর performance লক্ষ্যগুলো প্রতিটা change-এ CI-তে নিজে থেকে check হবে। |
| কোনো bulk action বা pipeline অর্ধেক সফল হয়ে repo-গুলোকে ভিন্ন ভিন্ন অবস্থায় রেখে দেয় | আগে preview, প্রতিটা repo-র ফলাফলের grid, Resume আর Retry, undo (v0.2)। এমন মিশ্র অবস্থা dashboard-এ চোখে পড়ে। |
| Rebase ধাপওয়ালা pipeline এমন history বদলে দেয় যা অন্যরা হয়তো আগেই pull করেছেন | Rebase ধাপ preview-তে দেখানো হয় আর force-with-lease confirm লাগে। আগে থেকে বানানো pipeline-গুলো merge ব্যবহার করে। |
| "Pipeline" শব্দ শুনে মানুষ CI/CD ভাবতে পারেন | UI আর guide-এ পরিষ্কার বলা থাকবে যে pipeline এই computer-এ Git আর pull request-এর ধাপ চালায়, কিছু build বা deploy করে না। |
| User একই সময়ে VS Code বা terminal থেকে একই repo বদলান | অবস্থা সবসময় Git থেকে পড়া হয়, file watcher সেটা refresh করে, আর প্রতিটা operation চলার ঠিক আগে অবস্থা আবার check করে (SAFE-07)। |
| অনেক repo আর pull request থাকলে GitHub API rate limit | GraphQL দিয়ে একসাথে pull request status আনা, cache রাখা, আর অনবরত poll না করে দরকারমতো refresh। |
| `.csproj`-এর মতো generated file-এ conflict ঝামেলার | প্রতিটা file-এ সব incoming / সব current নেওয়া, আর merge editor শুধু আসল conflict-গুলো দেখায়। নিজে থেকে কোনো resolve নয়। |
| Branch pattern সব ticket-এ খাটে না | Preview-তে branch-এর নাম edit করা যায়, আর pattern setting-এ বদলানো যায়। |
| Scope বাড়তে বাড়তে প্রথম ব্যবহারযোগ্য version দেরি হয় | v0.1-এ শুধু P0। বাকি সব পরে। |

## ১৪. খোলা প্রশ্ন আর অনুমান

| # | প্রশ্ন | উত্তর না পাওয়া পর্যন্ত অনুমান |
|---|---|---|
| ১ | কাজের সব repository কি GitHub-এ (github.com বা GitHub Enterprise), নাকি কিছু GitLab বা Azure DevOps-এ? | সব github.com-এ। |
| ২ | Branch pattern কি সবসময় `{ticket}-{user}-{Title}`? Title কি PascalCase (`Onboarding`), নাকি kebab-case? | `{ticket}-{user}-{Title}`, title PascalCase-এ। |
| ৩ | কাজ `dev`-এ যায় কীভাবে: pull request দিয়ে, নাকি local-এ merge করে push করে (screenshot-এর মতো)? এর ওপর নির্ভর করে push সহ `Merge Task Into…` প্রধান flow হবে নাকি বিশেষ ক্ষেত্র। | দুটোই হয়; দুটোই support করা হবে। |
| ৪ | Sync with Base default-ভাবে merge করবে নাকি rebase? | Merge। |
| ৫ | প্রথম release-এ কি issue tracker (যেমন Jira) থেকে ticket title আনা হবে? | না; title হাতে লেখা হবে। |
| ৬ | App কোথায় publish হবে (GitHub Releases, website, নাকি শুধু ভেতরে), আর এটা কি open source হবে? | GitHub Releases। GPL-3.0 license-এ open source, github.com/dev-taosif-net/GitHeddle-এ। প্রথমে ব্যক্তিগত ব্যবহার, তবে এমনভাবে বানানো যাতে team ব্যবহার করতে পারে। |
| ৭ | UI-এর ভাষা: শুধু ইংরেজি, নাকি বাংলাও? | v0.1-এ শুধু ইংরেজি। |
| ৮ | কোন repo-গুলো মিলে স্বাভাবিক group হয়? | `backend` = `app-api`, `app-report-api`, `app-scheduler-api`, `app-signalr-api`; `frontend` = `app-front`; `docs` = `knowledge-hub`, `architecture-handbook`। |
| ৯ | কোন technology? | **সিদ্ধান্ত হয়েছে:** Tauri 2 (Rust core + React/TypeScript UI)। লেখক কোন ভাষায় কাজ করেন সেটা দেখে নয়, প্রোডাক্টের যা দরকার আর Claude Code দিয়ে তৈরির সুবিধা দেখে এটা বেছে নেওয়া হয়েছে। দেখুন [ADR 0001](../decisions/0001-tech-stack.bn.md)। |
| ১০ | Signing-এর জন্য কি Windows code-signing certificate আর Apple Developer account নেওয়া হবে? | **আপাতত ঠিক হয়েছে:** Windows v0.1-এ unsigned, v0.2 থেকে SignPath Foundation দিয়ে signed (PLAT-08)। আপাতত কোনো Apple Developer account নেই, তাই macOS ad-hoc signed থাকবে (PLAT-11), আর install guide বলে দেবে কীভাবে খুলতে হয় (PLAT-12)। |
| ১১ | Pipeline-এ "`dev`-এ rebase" বলতে কী বোঝাবে? | Current branch-কে `dev`-এর ওপর rebase করা, তারপর `dev`-কে fast-forward করে সেখানে আনা (সোজা এক লাইনের history), PIPE-03-এর মতো। |
| ১২ | Pipeline কি নির্দিষ্ট সময়ে নিজে থেকে চলবে (যেমন প্রতিদিন সকালে), নাকি শুধু হাতে চালালে? | v0.1-এ শুধু হাতে চালালে। |

## ১৫. শব্দকোষ

| শব্দ | অর্থ |
|---|---|
| Pull request (PR) | GitHub-এ একটা branch আরেকটায় merge করার অনুরোধ, review আর CI check সহ। |
| Draft pull request | এমন pull request যেটা দেখা যায় কিন্তু এখনো review-এর জন্য তৈরি নয়। |
| Base branch | যে branch থেকে task branch শুরু হয় আর যেখানে আবার merge হয়, সাধারণত `dev`। |
| Upstream | Local branch যে remote branch-কে track করে, যেমন `origin/TK-2636-taosif-Onboarding`। |
| Ahead / behind | একটা branch-এ এমন কয়টা commit আছে যা অন্যটায় নেই (ahead), আর উল্টোটা (behind)। |
| Fast-forward only | শুধু তখনই branch update করা যখন merge commit লাগে না। নইলে থেমে গিয়ে জানানো। |
| Stash | Uncommitted change সাময়িকভাবে সরিয়ে রাখা, যাতে branch switch করা যায়, পরে আবার ফেরত আনা। |
| Force with lease | এমন force push যেটা মাঝখানে অন্য কেউ ওই branch-এ push করে থাকলে চলতে রাজি হয় না। |
| Conflict marker | Merge-এ conflict হলে Git file-এর ভেতরে যে `<<<<<<<`, `=======` আর `>>>>>>>` লাইনগুলো লিখে দেয়। |
| Incoming / Current / Result | Merge editor-এর তিনটা pane: যে branch merge হয়ে আসছে, আপনি যে branch-এ আছেন, আর যে file সেভ হবে। |
| Base (common ancestor) | দুই branch-এর শেষ যে commit-টা দুটোতেই আছে, সেখানকার file-এর version। |
| Pipeline | নাম দিয়ে সেভ করা Git আর pull request-এর ধাপের একটা ক্রম, যেটা এক click-এ অনেক repo-তে চলে। |
| OAuth device flow | এমন sign in, যেখানে app একটা ছোট code দেখায় আর user github.com-এ গিয়ে সেটা approve করেন, ফলে app-এ কোনো password বা token লিখতে হয় না। |
| Keychain | Operating system-এর নিরাপদ password-এর ভাণ্ডার: Windows Credential Manager, macOS Keychain, বা Linux-এ Secret Service। |

## ১৬. পরিবর্তনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ২ নভেম্বর ২০২৬ | প্রথম খসড়া, VS Code extension হিসেবে। |
| 0.2 | ২ নভেম্বর ২০২৬ | আলাদা desktop app-এ বদলানো হয়েছে, Windows, macOS আর Linux-এর জন্য। Platform আর installation (§৭ J), গতি (§৭ K), সহজে ব্যবহার (§৭ L), আর change ও commit (§৭ D)-এর চাহিদা যোগ হয়েছে। Technology option (§১০) যোগ হয়েছে। |
| 0.3 | ২ নভেম্বর ২০২৬ | "Merge request"-এর বদলে সব জায়গায় "pull request" ব্যবহার করা হয়েছে (requirement ID `MR-xx` এখন `PR-xx`)। Pipeline যোগ হয়েছে (§৭ M, Flow ৮)। Changes screen এখন VS Code-এর Source Control-এর মতো কাজ করে (§৭ D)। Conflict resolve হয় Visual Studio-র মতো তিন pane-ওয়ালা built-in merge editor-এ, যেটা এখন v0.1-এই থাকবে (§৭ F)। |
| 0.4 | ২ নভেম্বর ২০২৬ | Project-টা GPL-3.0 license-এ open source (§১৪, প্রশ্ন ৬)। উদাহরণগুলোতে অফিসের repository-র নাম আর ticket key-র বদলে সাধারণ নাম দেওয়া হয়েছে। |
| 0.5 | ৩ নভেম্বর ২০২৬ | Technology ঠিক হয়েছে: Tauri 2 (§১০, প্রশ্ন ৯), ADR 0001-এ লেখা আছে। Technology option-এর table-এর বদলে ADR-এর link দেওয়া হয়েছে। Planning review-এর পরে: macOS-এর সর্বনিম্ন version 13.3 (PLAT-01), team file-এর সীমা (CFG-03), আর §১০-এর diff ও merge, storage আর update-এর row-গুলো architecture আর build ডকুমেন্টের সাথে মেলানো হয়েছে। আপাতত কোনো Apple Developer account নেই: PLAT-08 এখন শুধু Windows-এর, নতুন PLAT-11 (notarised macOS app, P2) আর PLAT-12 (install guide, P0), প্রশ্ন ১০-এর উত্তর দেওয়া হয়েছে। |
