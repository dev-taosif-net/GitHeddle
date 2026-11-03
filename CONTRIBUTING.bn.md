# GitHeddle-এ অবদান রাখা

**English version:** [CONTRIBUTING.md](CONTRIBUTING.md)

| | |
|---|---|
| **ডকুমেন্ট** | অবদান রাখার নির্দেশিকা |
| **ভার্সন** | 0.1 — খসড়া |
| **তারিখ** | ৩ নভেম্বর ২০২৬ |
| **দায়িত্বে** | Taosif |
| **অবস্থা** | খসড়া। Project এখন পরিকল্পনার পর্যায়ে; এখনো কোনো code নেই |

**সম্পর্কিত ডকুমেন্ট:** [PRD](docs/product/PRD.bn.md) · [ADR 0001: Tech stack](docs/decisions/0001-tech-stack.bn.md) · [Architecture](docs/architecture/architecture.bn.md) · [AI development workflow](docs/process/ai-development-workflow.bn.md) · [Test strategy](docs/engineering/test-strategy.bn.md) · [Build আর release](docs/engineering/build-and-release.bn.md) · [Roadmap](docs/plan/roadmap.bn.md) · [Security policy](SECURITY.bn.md)

> এই file আর এর ইংরেজি সংস্করণ [CONTRIBUTING.md](CONTRIBUTING.md)-এ একই content আছে। একটা বদলালে অন্যটাও একই pull request-এ update করতে হবে।

---

## ১. স্বাগতম

GitHeddle-এ সাহায্য করার জন্য ধন্যবাদ। এটা Windows, macOS আর Linux-এর জন্য একটা desktop app, যেটা দিয়ে একসাথে অনেকগুলো repository-র Git আর pull request-এর কাজ করা যায়। App-কে কী করতে হবে, তা আছে [PRD](docs/product/PRD.bn.md)-তে। এটা কীভাবে বানানো হচ্ছে, তা আছে [Architecture](docs/architecture/architecture.bn.md) আর [Build আর release](docs/engineering/build-and-release.bn.md) ডকুমেন্টে।

আপনি সাহায্য করতে পারেন bug জানিয়ে, feature-এর প্রস্তাব দিয়ে, যেকোনো ভাষার ডকুমেন্ট ভালো করে, বা code পাঠিয়ে।

## ২. কীভাবে একটা পরিবর্তনের প্রস্তাব দেবেন

1. বানান ভুলের চেয়ে বড় যেকোনো কিছুর জন্য **আগে একটা issue খুলুন**। লিখুন এটা কোন সমস্যার সমাধান করে, আর পারলে PRD-র কোন requirement-এ হাত দেয় (যেমন `DASH-03` বা `SAFE-04`)। নতুন feature হলে বলুন এটা PRD বদলায় কি না।
2. বড় কাজ শুরুর আগে **একটা ছোট উত্তরের অপেক্ষা করুন**, যাতে কেউ এমন কিছু না বানান যা merge হবে না। ছোট fix সরাসরি pull request হিসেবে পাঠানো যায়।
3. `main` থেকে **repository fork করুন** (write access থাকলে একটা branch বানান)।
4. ছোট, নির্দিষ্ট commit-এ **পরিবর্তনটা করুন** (§৩)।
5. `main`-এ **একটা pull request খুলুন**। Template পূরণ করুন আর checklist (§৬) মিলিয়ে নিন।
6. **CI আর review।** সব required CI check সবুজ হতে হবে; branch protection এটা নিশ্চিত করে। GitHeddle-এর maintainer একজন, আর GitHub কোনো maintainer-এর নিজের pull request-এ তাঁর নিজের approval গোনে না। তাই branch protection চায় সবুজ check, approval না। Maintainer-এর review হলো pull request-এর acceptance checklist, প্রমাণসহ tick করা (§৬)। `CODEOWNERS` ব্যবহার হয় review চাওয়া আর label দেওয়ার জন্য, বাধ্যতামূলক approval হিসেবে না।
7. **Merge।** Maintainer নিজে squash-merge করেন, তাই pull request-এর title-ই `main`-এর commit হয়ে যায়।

PRD-র পরিবর্তনও একই পথে যায়, সাথে তার revision history-তে একটা সারি যোগ হয় (PRD §১৬)।

## ৩. Branch, commit আর dependency

### ৩.১ Branch

- `main` protected। কেউ সরাসরি এতে push করে না; সবকিছু আসে pull request-এর মাধ্যমে।
- Branch-এর নাম দিন `<type>/<roadmap-id>-<short-description>`, ছোট হাতের অক্ষরে, hyphen দিয়ে, যেমন `feat/m4-03-changes-tree` বা `fix/m2-01-crlf-paths`। কাজটা roadmap-এর কোনো item না হলে ID বাদ দিন: `docs/fix-install-notes`।
- Type: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `ci`, `build`, `chore`।

### ৩.২ Commit message

- [Conventional Commits](https://www.conventionalcommits.org/) ব্যবহার করুন: `<type>(<scope>): <summary>`। Scope হলো একটা crate বা এলাকা, যেমন `git-runner`, `diff-engine`, `ui`, `docs` বা `ci`।
- Summary ইংরেজিতে লিখুন, আদেশের রূপে ("add", "added" না), ৭২ অক্ষর বা তার কম।
- Body-তে লিখুন কেন, আর requirement ID ও roadmap item-এর নাম দিন (যেমন `Implements BULK-04. Roadmap: M2-03.`)।
- পরিবর্তনটা কোনো AI agent লিখে থাকলে তার `Co-Authored-By` trailer রেখে দিন।
- Pull request-এর title-ও একই format মানে, কারণ সেটাই squash commit হয়।

### ৩.৩ নতুন dependency

**নতুন dependency-র জন্য maintainer-এর অনুমোদন লাগে** (security-র নিয়ম SC-05)। এর মধ্যে পড়ে নতুন crate, নতুন npm package আর নতুন GitHub Action। Pull request-এর description-এ dependency-টার নাম দিন, আর লিখুন কেন দরকার, কে maintain করেন, এর licence কী (GPL-3.0-এর সাথে মিলতে হবে), এটা আর কতগুলো crate বা package টেনে আনে, আর tree-তে আগে থেকে থাকা কিছু দিয়ে কাজটা হয় কি না। এটাকে `cargo-deny`-ও pass করতে হবে।

## ৪. দুই ভাষায় ডকুমেন্ট

এই repository-র মানুষের পড়ার মতো প্রতিটা ডকুমেন্ট **ইংরেজি আর বাংলা** দুই ভাষাতেই থাকে। নিয়মগুলো এসেছে project-এর `CLAUDE.md` থেকে:

1. নতুন ডকুমেন্ট সবসময় দুটো file হিসেবে তৈরি হয়: `<name>.en.md` (ইংরেজি) আর `<name>.bn.md` (বাংলা), একই folder-এ। Root-এর community file-গুলো (`README`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`) ইংরেজির জন্য `<NAME>.md` আর বাংলার জন্য `<NAME>.bn.md` ব্যবহার করে।
2. **দুটো file একই pull request-এ বদলায়।** শুধু এক ভাষায় পরিবর্তন মানে কাজ শেষ হয়নি। একটা দিক না থাকলে `docs-pair` CI check fail করে।
3. দুটো file-এ একই section, numbering, table আর requirement ID থাকে। কোনোটা অন্যটার সারসংক্ষেপ না।
4. প্রতিটা file-এর উপরে অন্য সংস্করণের link থাকে।
5. বাংলা লেখা হয় বাংলা লিপিতে, স্বাভাবিক বাংলায়। Git আর technical শব্দ ইংরেজিতে থাকে (repo, branch, commit, push, pull request, CI, command-এর নাম)। Section নম্বর বাংলা সংখ্যায়; ID, version আর code যেমন আছে তেমন থাকে। নম্বর দেওয়া list-এর marker ASCII সংখ্যায় থাকে (`1.`, `2.`), যাতে GitHub সেগুলোকে list হিসেবে দেখায়।
6. দুটো সংস্করণে অমিল পেলে কোনটা ঠিক তা আন্দাজ না করে একটা issue খুলুন।
7. সবসময় লিখুন **pull request** (সংক্ষেপে **PR**)। "merge request" আর "MR" শব্দ কোথাও ব্যবহার হয় না, আর এগুলো পেলে `terminology` CI check fail করে।

আপনি দুই ভাষার মধ্যে শুধু একটায় লিখতে পারলেও pull request খুলুন, আর সেটা জানিয়ে দিন। Merge-এর আগে একজন maintainer, বা কোনো মানুষের review করা AI-সহায়তায় অনুবাদ, অন্য দিকটা যোগ করবে।

Code, code comment (crate-level rustdoc comment সহ) আর config file শুধু ইংরেজিতে।

## ৫. AI-এর সহায়তায় development

GitHeddle অনেকটাই AI-এর সহায়তায় বানানো হচ্ছে: বেশিরভাগ code লেখে **Claude Code** session, যেগুলোকে maintainer দিক দেখান, review করেন আর test করেন। এটা কীভাবে চলে (work item, prompt, project-এর `CLAUDE.md` file, AI-এর লেখা পরিবর্তন কীভাবে review করতে হয়) তা আছে [AI development workflow](docs/process/ai-development-workflow.bn.md)-এ।

অবদানকারীদের জন্য এর মানে:

- আপনিও AI tool ব্যবহার করতে পারেন। আপনার পাঠানো প্রতিটা লাইনের **দায় আপনার**, সেটা যে-ই বা যা-ই লিখুক। Pull request খোলার আগে পড়ুন আর বুঝে নিন।
- **প্রতিটা pull request একজন মানুষ review করেন**, maintainer Claude Code দিয়ে নিজে যেগুলো বানান সেগুলো সহ। সেই review হলো maintainer merge করার আগে প্রমাণসহ tick করা acceptance checklist (§২)। AI review সাহায্য করতে পারে, কিন্তু কখনো এর জায়গা নেয় না।
- Pull request template-এ লিখুন AI tool ব্যবহার হয়েছে কি না, আর কী কাজে।
- Token, signing key, private repository-র content বা অন্য কোনো secret কখনো কোনো AI tool-এ paste করবেন না।
- AI-এর লেখা code-এ test আরো বেশি জরুরি। কাজ করে তা দেখানোর মতো test ছাড়া কোনো পরিবর্তন merge হবে না ([Test strategy](docs/engineering/test-strategy.bn.md) দেখুন)।
- **`tests-changed` নিয়ম:** কোনো pull request যদি কোনো test মুছে ফেলে, skip করে বা ঢিলা করে, snapshot নতুন করে লেখে, বা invariant কিংবা chaos test-এর folder-এ হাত দেয়, তাহলে তাতে প্রতিটা পরিবর্তনের ব্যাখ্যা সহ একটা "Tests changed" অংশ থাকতে হবে, আর সেটা `tests-changed` label পায়। তারপর merge-এর আগে maintainer একটা আলাদা "I agree with these test changes" checkbox tick করেন।

## ৬. Pull request checklist

Pull request template-এ এই তালিকা থাকে। প্রতিটা item tick করুন, অথবা কেন প্রযোজ্য না তা লিখুন।

1. Pull request একটাই কাজ করে, আর এর title ও branch-এর নাম §৩ মানে।
2. এতে issue-এর link আছে, আর যে PRD requirement ID বা roadmap item-এর জন্য এটা, তার নাম আছে।
3. **Roadmap item-এর acceptance criteria tick করা, প্রতিটার প্রমাণ সহ** (একটা test, CI job, screenshot বা demo flow)।
4. Windows, macOS আর Linux-এ সব required CI check সবুজ।
5. নতুন বা বদলানো আচরণের test আছে, [Test strategy](docs/engineering/test-strategy.bn.md) অনুযায়ী। Bug-এর জন্য এমন একটা test আছে যেটা fix-এর আগে fail করত।
6. "Tests changed" অংশ, `tests-changed` label আর maintainer-এর checkbox ছাড়া কোনো test দুর্বল করা হয়নি (§৫)।
7. `rustfmt`, `clippy` আর Biome কোনো নতুন warning ছাড়া pass করে, আর generate করা TypeScript binding হালনাগাদ।
8. Platform-এর পার্থক্য (path, line ending, বড়-ছোট হাতের অক্ষর আলাদা ধরা file-এর নাম, shell) `crates/platform` দিয়ে যায়, তাকে পাশ কাটিয়ে না (PLAT-03)।
9. PRD §৭ H-এর নিরাপত্তার নিয়ম এখনো খাটে: পরিষ্কার সতর্কবার্তা ছাড়া কিছুই কাজ হারাতে পারে না।
10. বদলানো প্রতিটা ডকুমেন্ট **ইংরেজি আর বাংলা দুটোতেই** বদলেছে (§৪)।
11. User দেখতে পান এমন পরিবর্তন `CHANGELOG.en.md` আর `CHANGELOG.bn.md` দুটোতেই একটা লাইন যোগ করে।
12. Code, test, fixture বা log-এ কোনো secret, token বা ব্যক্তিগত তথ্য নেই।
13. যেকোনো নতুন dependency §৩.৩ অনুযায়ী maintainer অনুমোদন করেছেন।
14. AI ব্যবহারের কথা লেখা আছে (§৫), আর একজন মানুষ পুরো diff পড়েছেন।

## ৭. Development setup

এখনো কোনো code নেই। [Roadmap](docs/plan/roadmap.bn.md)-এর M0 শেষ হলে এই অংশে বলা হবে local-এ কীভাবে build আর test করতে হয়। অবদান রাখতে আপনার local build লাগবে না: CI প্রতিটা pull request তিনটা system-এই test করে। কোনো pull request-এ `bundle` label দিলে তার branch থেকে installer build হয়, আর `main` থেকে build করা installer nightly workflow-এর artifact-এ থাকে ([Build আর release](docs/engineering/build-and-release.bn.md) দেখুন)।

## ৮. নিরাপত্তার সমস্যা জানানো

নিরাপত্তার সমস্যার জন্য public issue খুলবেন না। [Security policy](SECURITY.bn.md) অনুসরণ করুন।

## ৯. Licence

GitHeddle [GPL-3.0](LICENSE) licence-এর অধীনে। কোনো অবদান পাঠালে আপনি মেনে নিচ্ছেন যে সেটা একই licence-এ প্রকাশ হবে।

## ১০. Code of Conduct

একটা `CODE_OF_CONDUCT` file যোগ করা হবে; ততদিন প্রতিটা issue, pull request আর আলোচনায় সম্মানজনক আর গঠনমূলক থাকুন।

## ১১. পরিবর্তনের ইতিহাস

| ভার্সন | তারিখ | পরিবর্তন |
|---|---|---|
| 0.1 | ৩ নভেম্বর ২০২৬ | Planning panel-এর (Agent 2) প্রথম খসড়া, panel-এর review-এর রায়গুলো বসানো: একা maintainer-এর জন্য review, branch-এর নাম, dependency-র অনুমোদন, `tests-changed` নিয়ম। |
