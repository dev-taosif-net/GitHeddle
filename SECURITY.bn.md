# Security Policy

**English version:** [SECURITY.md](SECURITY.md)

| | |
|---|---|
| **ডকুমেন্ট** | Security policy |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। প্রথম public release থেকে কার্যকর |

**সম্পর্কিত ডকুমেন্ট:** [Security আর threat model](docs/engineering/security.bn.md) · [Test কৌশল](docs/engineering/test-strategy.bn.md) · [PRD](docs/product/PRD.bn.md) · [Contributing](CONTRIBUTING.bn.md)

> এই file আর এর ইংরেজি সংস্করণ [SECURITY.md](SECURITY.md)-এ একই content আছে। একটা বদলালে অন্যটাও একই commit-এ update করতে হবে।

GitHeddle আপনার repo-তে Git চালায় আর একটা GitHub token রাখে, তাই security report আমরা গুরুত্ব দিয়ে দেখি। এর user-দের নিরাপদ রাখতে সাহায্য করার জন্য ধন্যবাদ।

## ১. সমর্থিত version

GitHeddle এখনো development-এর শুরুর দিকে। v1.0 পর্যন্ত শুধু সবচেয়ে নতুন release security fix পাবে।

| Version | Security fix |
|---|---|
| সর্বশেষ 0.x release | হ্যাঁ |
| পুরনো 0.x release | না। দয়া করে সর্বশেষ release-এ update করুন |
| `main` বা pull request থেকে বানানো build | না, তবে এগুলো নিয়ে report-ও স্বাগত |

প্রথম release (v0.1)-এর আগে কোনো সমর্থিত version নেই। তবুও code-এ যে সমস্যা পান, সেটা report করতে পারেন।

## ২. কীভাবে vulnerability report করবেন

**Security সমস্যার জন্য দয়া করে public issue, discussion বা pull request খুলবেন না।**

GitHub-এর private vulnerability reporting দিয়ে গোপনে report করুন:

1. [Repo-র Security tab](https://github.com/dev-taosif-net/GitHeddle/security)-এ যান।
2. **Report a vulnerability** বেছে নিন। Form-টা সরাসরি [নতুন advisory-র page](https://github.com/dev-taosif-net/GitHeddle/security/advisories/new)-এ নিয়ে যায়।
3. সমস্যাটা বর্ণনা করুন, আর সাথে দিন:
   - GitHeddle-এর version আর আপনার operating system;
   - কীভাবে আবার ঘটানো যায় তার ধাপ, সম্ভব হলে একটা ছোট উদাহরণ repo বা input সহ;
   - এটা দিয়ে একজন আক্রমণকারী কী করতে পারে, আর তাকে কী কী নিয়ন্ত্রণে রাখতে হবে;
   - fix নিয়ে আপনার কোনো ধারণা থাকলে সেটাও।

Report-টা শুধু আপনি আর maintainer দেখতে পান। GitHub-এর form ব্যবহার করতে না পারলে একটা public issue খুলুন, যাতে শুধু লেখা থাকবে "একটা security issue নিয়ে আমার সাথে যোগাযোগ করুন", কোনো বিস্তারিত ছাড়া। Maintainer নিজে যোগাযোগ করবেন।

## ৩. কী আশা করতে পারেন

GitHeddle একজন মানুষ দেখাশোনা করেন, তাই এগুলো লক্ষ্য, নিশ্চয়তা নয়।

| ধাপ | লক্ষ্য |
|---|---|
| আপনার report পেয়েছি বলে জানানো | ৭ দিনের মধ্যে |
| এটাকে vulnerability হিসেবে মানছি কি না, আর কতটা গুরুতর মনে করছি তা জানানো | ১৪ দিনের মধ্যে |
| Critical বা high severity issue-এর fix প্রকাশ | মেনে নেওয়ার ৩০ দিনের মধ্যে |
| Medium বা low severity issue-এর fix প্রকাশ | ৯০ দিনের মধ্যে, অথবা পরের release-এ |

কাজ চলার সময়:

1. Private advisory-তে আমরা আপনাকে খবর জানাতে থাকব, আর আরও বিস্তারিত জানতে চাইতে পারি।
2. Fix release হলে আমরা একটা GitHub security advisory প্রকাশ করব, আর উপযুক্ত হলে একটা CVE চাইব।
3. আপনি যে নাম চান, সেই নামে advisory-তে আপনাকে কৃতিত্ব দেব, যদি না আপনি নাম গোপন রাখতে চান।
4. Advisory প্রকাশ না হওয়া পর্যন্ত দয়া করে issue-টা গোপন রাখুন। কারণ না জানিয়ে আমরা ওপরের লক্ষ্য মিস করলে, আপনি আমাদের সাথে মিলে প্রকাশের একটা তারিখ ঠিক করতে পারেন।

যিনি সৎ উদ্দেশ্যে report করেন, এই policy মানেন, অন্যের data-তে ঢোকেন না আর অন্য user-দের ক্ষতি করেন না, তাঁর বিরুদ্ধে আমরা কোনো আইনি ব্যবস্থা নেব না।

## ৪. পরিধি

**পরিধির মধ্যে:**

- Windows, macOS আর Linux-এ GitHeddle desktop app: Rust core, web UI আর এদের মধ্যের যোগাযোগ।
- GitHeddle কীভাবে `git` আর অন্য tool চালায়: argument সামলানো, injection, repo-র content বা team file `.githeddle.json` অনিরাপদভাবে সামলানো।
- GitHeddle কীভাবে আপনার GitHub token রাখে আর ব্যবহার করে।
- GitHeddle-এর নিজের safety rule ভেঙে (দেখুন [PRD](docs/product/PRD.bn.md)-এর SAFE-01..07) আপনার কাজ হারানো বা আপনার confirmation ছাড়া push হওয়ার পথ।
- Pull request, commit বা repo-র এমন content যেটা GitHeddle-এর ভেতরে code চালাতে পারে।
- এই repo-র installer, update channel (v0.2 থেকে) আর build ও release workflow।

**পরিধির বাইরে:**

- Git নিজে, GitHub, operating system বা system webview (WebView2, WKWebView, WebKitGTK)-এর vulnerability। দয়া করে এগুলো তাদের নিজেদের project-এ report করুন। GitHeddle যদি এমন কোনো সমস্যাকে আরও খারাপ করে, সেই অংশটা পরিধির মধ্যে।
- Commit বা push-এর সময় চলা Git hook। GitHeddle ইচ্ছা করেই আপনার hook চালায় (SAFE-05), তাই আপনার বেছে নেওয়া repo-র hook GitHeddle-এর vulnerability নয়।
- এমন আক্রমণ যার জন্য আপনার user হিসেবে আগে থেকে malware চলতে হয়, বা খোলা অবস্থায় থাকা machine-এ সরাসরি হাত দিতে হয়।
- যে সমস্যা শুধু অসমর্থিত version-এ, বা বদলে নেওয়া build-এ ঘটে।
- Social engineering, spam, আর প্রমাণিত প্রভাব ছাড়া automated scanner-এর report।

কোনো কিছু পরিধির মধ্যে কি না নিশ্চিত না হলেও report করুন।

## ৫. পরিবর্তনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ৩ নভেম্বর ২০২৬ | Planning panel (Agent 5)-এর প্রথম খসড়া |
