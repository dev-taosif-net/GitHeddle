# GitHeddle — Product Requirements Document (PRD)

**Bangla version:** [PRD.bn.md](PRD.bn.md)

| | |
|---|---|
| **Product** | GitHeddle — a desktop app for Git and pull request work across many repositories, for Windows, macOS and Linux |
| **Document** | Product Requirements Document (PRD) |
| **Version** | 0.4 — Draft (changes in §16) |
| **Date** | 2 November 2026 |
| **Owner** | Taosif |
| **Status** | Draft. Assumptions that still need confirming are listed in §14 |

> This file and its Bangla version, [PRD.bn.md](PRD.bn.md), carry the same content. When one changes, update the other in the same commit.

---

## 1. Summary

GitHeddle is a desktop app for Windows, macOS and Linux that brings Git and pull request work for many repositories into one window. Instead of repeating the same step in every repository's Source Control panel in VS Code, the developer starts a **task** once (for example `TK-2636 Onboarding`). GitHeddle then creates the branches, commits, pushes, syncs with `dev` and opens the pull requests in every repository the task touches. It shows a preview before each action and a per-repository result after it.

Steps that are repeated every day can be saved as a named **pipeline**, for example "update the current branch from `main`, then merge it into `dev`" or "…then open a pull request to `dev`", and run on many repositories with one click. Changed files are shown the way VS Code shows them, and conflicts are resolved in a three-pane merge editor like Visual Studio's.

Three qualities matter above everything else:

- **Runs everywhere.** Windows, macOS and Linux are all first-class. Every release ships for all three and is tested on all three.
- **Very fast.** The app opens in about a second and responds to every click immediately, even with 30 repositories.
- **Very easy to use.** Someone who isn't confident with Git can start a task, commit and create pull requests without help, and nothing they click can lose work without a clear warning first.

GitHeddle works next to VS Code, not inside it. It opens repositories and files in VS Code (or another editor the user picks), and a VS Code `.code-workspace` file can be imported directly.

## 2. Problem

**Current setup (from the VS Code Source Control screenshot):** one VS Code window with at least seven repositories: `knowledge-hub`, `app-api`, `app-front`, `app-report-api`, `app-scheduler-api`, `app-signalr-api` and `architecture-handbook`. One feature, `TK-2636`, touches at least `app-api` and `app-front`, and both have a branch with the same name.

What hurts today:

1. **Every step is repeated in every repo.** Creating the branch, committing, pushing, pulling `dev` and merging are all done by hand, once per repository. They happen in a long Source Control list where every repo has its own message box and Commit button.
2. **There is no overview.** The panel can't show side by side which repo is on which branch, which is behind `dev`, which has unpushed commits and which is in the middle of a merge. In the screenshot, `app-api` is on `dev`, halfway through merging `TK-2636-taosif-Onboarding`, with 3 conflicted files (6 conflicts in `Api.csproj` alone). That is easy to miss while working in another repo.
3. **Pull requests are created one at a time in the browser.** For each repository you open GitHub, choose the branches, write the same title and description, and add reviewers. Then you copy links between the pull requests by hand so reviewers know they belong together.
4. **Conflicts are scattered.** When `dev` moves, each repo has to be synced on its own, and its conflicts have to be found and resolved on their own.
5. **The same sequence repeats every day.** For example: pull the latest `main` into the current branch, push, then merge into `dev` or open a pull request — step by step, in every repo.
6. **Mistakes are easy.** You can commit to `dev` by accident, forget one repo, push one repo but not the other, or leave a repo on the wrong branch.

The result is that a feature touching 2–3 repositories costs a lot of repetitive Git work every day and leads to avoidable mistakes.

## 3. Goals and non-goals

### Goals

| ID | Goal |
|---|---|
| G1 | See the Git state of every repository in the workspace on one screen. |
| G2 | Run any common Git operation on many repositories at once, with a preview before it and a clear per-repository result after it. |
| G3 | Make the **task** (ticket + branch + set of repos + pull requests) the unit of work, so that one action covers every repo in the task. |
| G4 | Create, track, update and merge a task's pull requests together, without opening the browser. |
| G5 | Make conflicts across repositories easy to find and resolve. |
| G6 | Never lose the user's work. |
| G7 | Work the same way on Windows, macOS and Linux. |
| G8 | Feel instant. The user waits only for Git and the network, never for the app itself. |
| G9 | Be usable without Git expertise: clear words, guided steps and safe defaults. |
| G10 | Let the user save a repeated sequence of steps as a named pipeline and run it on many repositories with one click. |

### Non-goals (for now)

- Being a code editor. Code is edited in VS Code or another editor, and GitHeddle opens files there.
- Covering every advanced Git feature (interactive rebase, submodules, bisect). A terminal stays one click away for those.
- Being a CI/CD system. Pipelines in GitHeddle run Git and pull request steps on the user's computer. They don't build, test or deploy code.
- Replacing GitHub's website for everything else (repository settings, Actions configuration, issues).
- Hosts other than GitHub in the first release. GitLab and Azure DevOps may come later (§12).
- A VS Code extension, web app or mobile app in the first release.
- Monorepo tooling (build graphs, affected-project detection).
- Automatic conflict resolution or AI code review.

## 4. Users

- **Primary: the author.** A developer on a team who works with 5–15 GitHub repositories at once, usually opened together in VS Code. Branches are named after tickets (`TK-2636-taosif-Onboarding`), `dev` is the shared integration branch, and a feature often spans the backend (`app-api`) and the frontend (`app-front`).
- **Secondary: teammates with the same setup, on any operating system,** including people who aren't confident with Git. The app must work for them with configuration alone, and nothing about one person's repositories may be hard-coded. The ease-of-use requirements (§7 L) are judged against these users.

## 5. Key concepts

| Concept | Meaning |
|---|---|
| **Workspace** | A set of folders opened in GitHeddle: a folder the user picks, or an imported VS Code `.code-workspace` file. The user can keep several workspaces and switch between them. |
| **Repo** | Any Git repository found inside the workspace folders. |
| **Group** | A named, saved set of repos, for example `backend` = `app-api`, `app-report-api`, `app-scheduler-api`, `app-signalr-api`. |
| **Task** | One piece of work: a ticket key (`TK-2636`), a title (`Onboarding`), a branch name, a base branch (`dev`), the repos it touches, and its pull requests. |
| **Bulk action** | One operation applied to many repos: preview → run in parallel → per-repo result. |
| **Target set** | The repos a bulk action or pipeline applies to: all repos, a group, a manual selection, or the active task's repos. |
| **Pipeline** | A named, saved sequence of steps, for example "Fetch → Update from `main` → Push → Merge into `dev`", that runs on a target set with one click. The task actions Sync with Base and Merge Task Into… are built-in pipelines. |
| **Step** | One part of a pipeline, for example Fetch, Update from branch or Integrate into branch. |
| **Run** | One execution of a pipeline on a target set. Each repo in a run can finish, fail, or pause (for example at a conflict) and be resumed. |
| **Pull request (PR)** | GitHub's request to merge one branch into another, with review and CI checks. |
| **Command palette** | A search box (Ctrl+K / ⌘K) that runs any action when you type its name. |

## 6. Main user flows

### Flow 0 — First run

1. Install GitHeddle and open it.
2. Choose a folder or a VS Code `.code-workspace` file. GitHeddle lists the repositories it finds.
3. Confirm the short name used in branch names (`taosif`, suggested from Git config) and the default base branch (`dev`).
4. Sign in to GitHub in the browser with one click, without copying a token. This step can be skipped and done later.
5. The dashboard opens. The whole setup takes under 2 minutes.

### Flow 1 — Start a task

*Today:* in `app-api` and then again in `app-front`: switch to `dev`, pull, create the branch, publish it.

*With GitHeddle:*

1. Click **Start Task** (or press Ctrl+N / ⌘N) and enter `TK-2636` and `Onboarding`.
2. Pick the repos (or a group). The base branch defaults to `dev`.
3. The preview says that `TK-2636-taosif-Onboarding` will be created from the latest `origin/dev` in `app-api` and `app-front`. If, for example, `app-front` has uncommitted changes, the preview asks: "Stash and continue" or "Skip this repo".
4. Run it. Result: ✓ `app-api`, ✓ `app-front`. The top bar shows the active task.

### Flow 2 — See changes, commit and push together

1. Open the **Changes** screen. It looks like VS Code's Source Control: each repo with changes has its own section, split into Merge Changes, Staged Changes and Changes, and every file shows its folder, a status letter (M, A, D, R, U, !) and lines added and removed.
2. Click a file to see its diff. Stage or unstage it with the + / − button on its row.
3. Write one message in one box, prefilled with `TK-2636: `.
4. Commit in all repos at once, and optionally push right after. Repos with nothing staged are skipped.

### Flow 3 — Create the pull requests

1. Click **Create Pull Requests** on the task.
2. The preview shows, for each repo: source → target (`TK-2636-taosif-Onboarding → dev`), commits ahead, title `TK-2636: Onboarding`, the description from the template, reviewers, and draft yes/no. Repos with no commits ahead are skipped. Everything is editable.
3. Create. GitHeddle pushes the branch if needed and creates the pull requests. It then adds a "Related pull requests" section to each description that links to the others.
4. The task screen now shows every pull request with its CI and review status.

### Flow 4 — Keep up with `dev`, or merge into `dev`

- **Sync:** **Sync with Base** brings the latest `origin/dev` into the task branch in every task repo (merge by default, rebase if configured). Clean repos finish, and conflicted repos appear on the Conflicts screen.
- **Merge into a branch:** the screenshot shows the task branch being merged into `dev` locally. **Merge Task Into…** does this for every task repo: update `dev`, merge the task branch, list the conflicts and, after they are resolved, push, but only after a confirmation because `dev` is protected (see open question 3).

Both actions are built-in pipelines, so they show the same run screen as the user's own pipelines (Flow 8).

### Flow 5 — Resolve conflicts

1. The Conflicts screen lists every repo that is in a merge or rebase, with its conflicted files and the number of conflicts in each file.
2. Click a file. It opens in GitHeddle's merge editor, which has three panes like Visual Studio's: **Incoming** on the left (the branch being merged in), **Current** on the right (the branch you are on) and **Result** at the bottom (the file that will be saved).
3. For each conflict, tick the Incoming side, the Current side, or both. The Result pane updates straight away and can also be edited by hand. Changes that don't conflict are already in Result.
4. Move between conflicts with Next / Previous. When none are left, click **Accept merge**. The file is saved, marked as resolved, and the next conflicted file opens.
5. When a repo has no conflicts left: Continue (commit the merge) or Abort. When every repo is clean: **Continue all**.

### Flow 6 — Review, merge and finish

1. The Pull Requests screen has three lists: created by me, review requested from me, and the current task.
2. Bulk actions on a task's pull requests: mark ready for review, add reviewers, and merge (when checks pass and reviews are approved) in a chosen order, for example `app-api` before `app-front`.
3. **Finish Task** switches the repos back to `dev`, pulls, deletes the local task branches (deleting remote branches is optional) and archives the task.

### Flow 7 — Everyday bulk work

- In the morning, **Fetch** / **Pull** on every repo. The dashboard shows what is behind.
- Switch a whole group to one branch.
- Run any Git command in the selected repos and see each repo's output.
- Open any repo in VS Code or a terminal with one click.

### Flow 8 — Make and run a pipeline

1. Open **Pipelines** → **New pipeline** and name it `Update from main → dev`.
2. Add the steps: **Fetch** → **Update from branch** `main` (merge) → **Push** → **Integrate into branch** `dev` using **merge**. To open a pull request to `dev` instead, choose **pull request** as the method in the last step.
3. Save. The pipeline now appears in the sidebar and in the command palette.
4. Click **Run** and choose the target, for example task `TK-2636`. The preview shows every step for `app-api` and `app-front`, and asks one question for the whole run: "This run pushes to the protected branch `dev` in 2 repos. Continue?"
5. Run. `app-front` finishes every step. `app-api` pauses at "Update from main" with 3 conflicted files. Resolve them in the merge editor (Flow 5), click **Resume**, and `app-api` finishes too.

## 7. Functional requirements

Priority: **P0** = first release (MVP), **P1** = next release, **P2** = later.

### A. Workspace and dashboard

| ID | Requirement | Priority |
|---|---|---|
| DASH-01 | Open a folder or import a VS Code `.code-workspace` file, and find every Git repository in it, including repos nested one level down. The search depth is configurable. | P0 |
| DASH-02 | Show for each repo: the current branch, ahead/behind its upstream, ahead/behind the base branch (`dev`), counts of changed, staged and untracked files, any operation in progress (merging, rebasing, cherry-picking), the number of conflicted files, the last fetch time, and the task or pull request it belongs to. | P0 |
| DASH-03 | Search repos by name. Filter and sort by: dirty, behind, has conflicts, has unpushed commits, group, task. | P0 |
| DASH-04 | Refresh automatically when files or Git state change and when the app window regains focus. An optional background fetch runs on an interval and is off by default. | P0 |
| DASH-05 | Select repos with checkboxes. The selection can be the target set of any bulk action or pipeline. | P0 |
| DASH-06 | From a repo's row: open it in VS Code (or the configured editor), open a terminal in it, open it in the file manager, or open it on GitHub. | P0 |
| DASH-07 | Show a warning badge for risky states: local commits on a protected branch, detached HEAD, diverged from upstream, stashes present. | P1 |
| DASH-08 | Keep several workspaces and switch between them from a menu. The app reopens the last workspace on start. | P1 |

### B. Groups

| ID | Requirement | Priority |
|---|---|---|
| GRP-01 | Create, rename, edit and delete named groups of repos. | P0 |
| GRP-02 | Save groups with the workspace in GitHeddle's settings, and optionally in the team file (CFG-03) so they can be shared. | P0 |
| GRP-03 | Every bulk action and pipeline can target all repos, a group, the current selection or the active task's repos. | P0 |

### C. Tasks

| ID | Requirement | Priority |
|---|---|---|
| TASK-01 | Start Task: a ticket key and a title produce a branch name from a configurable pattern. The default pattern `{ticket}-{user}-{title}` produces `TK-2636-taosif-Onboarding`. The branch name can be edited in the preview. | P0 |
| TASK-02 | For each selected repo, Start Task will: check the working tree, fetch, update the base (`dev`) fast-forward only, create the branch from `origin/<base>`, switch to it, and optionally push it and set its upstream. If the branch already exists locally or on the remote, offer to switch to it instead. | P0 |
| TASK-03 | One task is active at a time and is shown in the top bar. Switch Task moves every repo of the new task to its branch, following the rules for uncommitted changes in SAFE-04. | P0 |
| TASK-04 | Add a repo to an existing task, or remove one from it. | P0 |
| TASK-05 | Sync with Base: bring the latest `origin/<base>` into the task branch in every task repo by merge (default) or rebase (setting). Report each repo as clean, conflicted or failed. It runs as a built-in pipeline (§7 M). | P0 |
| TASK-06 | Merge Task Into…: merge the task branch into a chosen branch (for example `dev`) in every task repo. Update that branch, merge, report conflicts, and push only after confirmation. It runs as a built-in pipeline (§7 M). | P0 |
| TASK-07 | Finish Task: switch the task repos back to the base branch, pull, delete the local task branch (deleting the remote branch is optional) and archive the task. Warn if a branch has unmerged or unpushed commits. | P1 |
| TASK-08 | Tasks are saved with the workspace and survive app restarts. A task can be recognised again from branch names that match the pattern, for example after cloning on another machine. | P1 |

### D. Changes and commits

| ID | Requirement | Priority |
|---|---|---|
| CHG-01 | A Changes screen that looks and works like VS Code's Source Control. Every repo with changes is a collapsible section, split into **Merge Changes** (conflicted files), **Staged Changes** and **Changes**, each with a file count. | P0 |
| CHG-02 | Each file row shows the file name, its folder (dimmed), lines added and removed (`+12 −3`), and a coloured status letter: **M** modified, **A** added, **D** deleted, **R** renamed, **U** untracked, **!** conflicted. | P0 |
| CHG-03 | Switch between a flat list and a folder tree. Filter by file name across all repos. | P0 |
| CHG-04 | Click a file to open its diff, side by side or inline, with syntax highlighting and word-level highlighting of what changed. | P0 |
| CHG-05 | Stage or unstage a file with the + / − button on its row, and stage or unstage a whole section at once. | P0 |
| CHG-06 | Right-click a file to: open it in the editor, open the diff, stage or unstage, discard changes (after the confirmation in SAFE-03), copy its path, or show it in the file manager. | P0 |
| CHG-07 | Commit in a single repo. The message box is prefilled with the ticket key taken from the branch name (`TK-2636: `). | P0 |
| CHG-08 | Commit history for each repo, with search by message, author and file. | P1 |
| CHG-09 | Stage and unstage individual lines or hunks. | P2 |
| CHG-10 | Optional Conventional Commits format (`feat(TK-2636): …`). | P2 |

### E. Bulk Git operations

| ID | Requirement | Priority |
|---|---|---|
| BULK-01 | Operations: fetch, pull (fast-forward only by default), push, switch branch, create branch, stash / pop stash, commit, merge, delete local branch. | P0 |
| BULK-02 | More operations: rebase, cherry-pick one commit into many repos, delete remote branch, discard changes, tag. | P1 |
| BULK-03 | Preview before running: each target repo with what will happen, plus warnings (dirty tree, diverged, protected branch, nothing to do). The user can untick repos. Read-only operations such as fetch skip the preview. | P0 |
| BULK-04 | Run in parallel up to a configurable limit (default 4), show progress per repo, and allow cancel. Cancel starts no new repos and lets running Git commands finish. | P0 |
| BULK-05 | If one repo fails, the others continue. The action ends with a summary of succeeded, skipped and failed repos. Each failure shows the step and Git's error message, with Retry failed, Open terminal and Show log buttons. | P0 |
| BULK-06 | Commit Task / Commit Selected: one message for all repos, prefilled from the ticket (`TK-2636: `). The files to commit are chosen on the Changes screen (§7 D), and repos with nothing staged are skipped. | P0 |
| BULK-07 | Run Git command: run any `git …` arguments in the target repos and show each repo's output separately. | P1 |
| BULK-08 | Log every command that is actually run (repo, command, exit code, duration) in the app's activity log. | P0 |
| BULK-09 | Undo the last bulk action where that is safe. Record each repo's branch and HEAD before the action, then offer to restore them, for example by deleting created branches, switching back, or undoing a local commit that was not pushed. | P1 |

### F. Conflicts and the merge editor

| ID | Requirement | Priority |
|---|---|---|
| CONF-01 | Conflicts screen: every repo in a merge, rebase or cherry-pick, with its conflicted files and the number of conflicts in each file. | P0 |
| CONF-02 | For each file: open it in the built-in merge editor (the default), take current, take incoming, or open it in an external merge tool chosen in settings (for example VS Code's merge editor). | P0 |
| CONF-03 | A built-in merge editor with three panes, like Visual Studio's: **Incoming** on the left (the branch being merged in), **Current** on the right (the branch you are on) and **Result** at the bottom (the file that will be saved). Each pane's title shows its branch name. | P0 |
| CONF-04 | Each conflict has a checkbox on the Incoming side and on the Current side. Ticking one puts that side into Result. Ticking both puts both into Result, in the order they were ticked. Result can also be edited by hand. | P0 |
| CONF-05 | Changes that don't conflict are already applied in Result and marked, so the user only decides the real conflicts. | P0 |
| CONF-06 | The three panes keep matching lines aligned and scroll together, with syntax highlighting and word-level highlighting of differences. | P0 |
| CONF-07 | Next and Previous conflict buttons and shortcuts, a counter ("Conflict 2 of 6") and the number still unresolved. | P0 |
| CONF-08 | Take all incoming or take all current for the whole file in one click. | P0 |
| CONF-09 | Accept merge saves Result, marks the file as resolved (stages it) and opens the next conflicted file: first in the same repo, then in the next repo. It is blocked while the file still has unresolved conflicts. | P0 |
| CONF-10 | For each repo: Continue (finish the merge or rebase with the default message) or Abort. **Continue all** appears when every repo is resolved. | P0 |
| CONF-11 | Block Continue if staged files still contain conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`). | P0 |
| CONF-12 | Show the **Base** version (the common ancestor) as an optional fourth view. | P1 |

### G. Pull requests (GitHub)

| ID | Requirement | Priority |
|---|---|---|
| PR-01 | Sign in to GitHub through the browser: the app shows a code and the user approves it on github.com (OAuth device flow). A personal access token is accepted as an alternative. The token is stored in the operating system's keychain. | P0 |
| PR-02 | Create pull requests for a task: one pull request in each task repo that has commits ahead of the target, pushing the branch first if needed. The title comes from a template (`{ticket}: {title}`) and so does the body. Options: draft, reviewers, assignees (default: me), labels. Each pull request can be previewed and edited before it is created. | P0 |
| PR-03 | After creating the pull requests, add a "Related pull requests" section to each body that links the task's pull requests in the other repos. Update it when a pull request is added later. | P0 |
| PR-04 | When a repo has its own pull request template (`.github/pull_request_template.md`), combine it with GitHeddle's template. | P1 |
| PR-05 | Task pull request status: for each pull request show its state (draft, open, merged, closed), CI checks, review state, whether it can merge or has conflicts, and its comment count. | P0 |
| PR-06 | Pull Requests screen across all workspace repos: created by me, review requested from me, current task. | P1 |
| PR-07 | Update a task's pull requests together: edit the title or body, add or remove reviewers or labels, mark ready for review, convert to draft, close. | P1 |
| PR-08 | Merge a task's pull requests together, only when checks pass and the required reviews are met (as GitHub reports them). Each repo has a default merge method (merge, squash or rebase). The merge order is configurable, for example `app-api` before `app-front`. Deleting the branch afterwards is optional. | P1 |
| PR-09 | Review someone else's task: starting from a pull request, check out its branch in every related repo, read the diff in the app, and approve, request changes or comment. | P2 |
| PR-10 | Show a system notification when one of my pull requests fails CI, gets changes requested, is approved or gets a new comment. | P2 |
| PR-11 | Open any pull request in the browser. | P0 |

### H. Safety

| ID | Requirement | Priority |
|---|---|---|
| SAFE-01 | Never force push unless the user picks "force with lease" for that action and confirms it. Plain `--force` is never used. | P0 |
| SAFE-02 | Protected branches (default `main`, `master` and `dev`; configurable): warn and ask for confirmation before committing to, merging into or pushing to them. In a pipeline run, this is asked once for the whole run in the preview. | P0 |
| SAFE-03 | Destructive actions (discarding changes, deleting a branch with unmerged commits, reset) list exactly what will be lost and need an explicit confirmation. | P0 |
| SAFE-04 | Before switching branches in a repo with uncommitted changes, offer: Stash (named `githeddle/<task>`), Skip this repo, or Cancel. Never discard changes silently. Offer to pop the stash when switching back. | P0 |
| SAFE-05 | Use the user's own Git installation, config, credentials and hooks. Never skip hooks. | P0 |
| SAFE-06 | Don't start an operation in a repo that is already in a merge or rebase, unless the operation is meant for that state (resolve, continue, abort). | P0 |
| SAFE-07 | Re-check each repo's state right before an operation or pipeline step runs, because the user may have changed it in VS Code or a terminal after the preview. | P0 |

### I. Configuration

| ID | Requirement | Priority |
|---|---|---|
| CFG-01 | Settings: branch name pattern, the user's short name (`taosif`), default base branch, protected branches, parallel limit, sync method (merge or rebase), pull request title and body templates, default reviewers per group, background fetch interval, the editor, terminal and merge tool to open (default: VS Code and the system terminal), theme. | P0 |
| CFG-02 | Per-repo overrides, for example a repo whose base branch is `main` instead of `dev`. | P0 |
| CFG-03 | An optional team config file in the workspace (`.githeddle.json`) for shared groups, patterns, templates and pipelines. | P1 |

### J. Platforms and installation

| ID | Requirement | Priority |
|---|---|---|
| PLAT-01 | Runs on Windows 10 and 11 (x64 and ARM64), macOS 13 or newer (Apple Silicon and Intel), and Linux x64 (Ubuntu 22.04 or newer, Fedora 39 or newer, and similar distributions). | P0 |
| PLAT-02 | Installers: a Windows `.exe` installer that installs per user without admin rights, a macOS `.dmg`, and a Linux AppImage and `.deb`. | P0 |
| PLAT-03 | Every feature works the same on all three systems. The app, not the user, handles platform differences: paths, line endings, case-sensitive file names, shells and credential helpers. | P0 |
| PLAT-04 | Every release is tested on all three systems before it ships. | P0 |
| PLAT-05 | Keyboard shortcuts follow each system's convention: Ctrl on Windows and Linux, ⌘ on macOS. | P0 |
| PLAT-06 | Light and dark themes, following the system setting by default. | P0 |
| PLAT-07 | Automatic updates: the app checks for a new version, shows what changed, and installs it on restart, never in the middle of an operation. | P1 |
| PLAT-08 | Signed installers on Windows and a notarised app on macOS, so the systems don't show "unknown developer" warnings. | P1 |
| PLAT-09 | A Linux `.rpm` package. | P1 |
| PLAT-10 | A Linux ARM64 build. | P2 |

### K. Speed

| ID | Requirement | Priority |
|---|---|---|
| PERF-01 | From launch to a usable window: under 1 second from the second launch on, and under 2 seconds on the first launch after a reboot. | P0 |
| PERF-02 | The dashboard shows the last known state immediately on opening, then the live state of 10 repos within 1 second and of 30 repos within 2 seconds. | P0 |
| PERF-03 | Every click, key press and scroll gets a visible response within 100 ms. Long operations show progress straight away. | P0 |
| PERF-04 | When a Git operation finishes, the affected repo's row updates within 300 ms. | P0 |
| PERF-05 | Git and network work never block the window. The user can keep browsing, searching and selecting while bulk actions and pipelines run. | P0 |
| PERF-06 | For files of up to 10,000 lines, a diff opens within 300 ms and the merge editor within 500 ms. Larger files are shown in parts. | P0 |
| PERF-07 | Memory use stays under 250 MB with 30 repos open, and idle CPU use stays near zero (no busy polling). | P0 |
| PERF-08 | The Changes screen lists up to 5,000 changed files across all repos and still scrolls smoothly. | P0 |
| PERF-09 | The installer is under 60 MB. | P1 |

### L. Ease of use

| ID | Requirement | Priority |
|---|---|---|
| UX-01 | The first run guides the user through choosing a folder, confirming their name and base branch, and signing in to GitHub. It takes under 2 minutes, and every step can be skipped. | P0 |
| UX-02 | Buttons use the Git terms users already know (Fetch, Pull, Push, Commit), and a tooltip explains in one plain sentence what each will do. | P0 |
| UX-03 | Every action that changes something shows a preview of what it will do before it runs, and a result after it (BULK-03, BULK-05, PIPE-05, PIPE-08). | P0 |
| UX-04 | Error messages say what went wrong, in which repo and what to do next, for example "Pull stopped: app-front has local changes. Stash them or commit first." Git's original message is one click away. | P0 |
| UX-05 | The command palette (Ctrl+K / ⌘K) runs any action or pipeline by typing its name, every frequent action has a keyboard shortcut, and the whole app can be used without a mouse. | P0 |
| UX-06 | Empty and first-time screens say what to do next, for example "No task yet. Start a task". | P0 |
| UX-07 | Common flows (Start Task, Commit Task, Create Pull Requests, Sync with Base, Run Pipeline) take at most 3 clicks from the dashboard. | P0 |
| UX-08 | Readable contrast in both themes, every control reachable by keyboard and labelled for screen readers, and text that can be zoomed (Ctrl +/− or ⌘ +/−). | P0 |
| UX-09 | The app remembers the window size, layout, open workspace and filters between sessions. | P0 |
| UX-10 | After a cancel or a failure, the app says clearly what did and didn't change, and offers undo where it is safe (BULK-09). | P1 |
| UX-11 | Built-in help: a "?" on each screen with a short explanation and a link to the full guide. | P1 |

### M. Pipelines

| ID | Requirement | Priority |
|---|---|---|
| PIPE-01 | Create, name, edit, duplicate and delete pipelines. A pipeline is an ordered list of steps and is saved with the workspace. | P0 |
| PIPE-02 | Steps available in v0.1: **Fetch**; **Update from branch**, which brings another branch (for example `main`) into the current branch by merge or rebase; **Push** the current branch; **Switch branch**; **Integrate into branch**, which brings the current branch into another branch (for example `dev` or `main`) by merge, rebase or pull request (PIPE-03); and **Wait for confirmation**, which pauses until the user clicks Continue. | P0 |
| PIPE-03 | Integrate into branch has three methods. **Merge:** update the target from its remote, merge the current branch into it, and push the target (optional, on by default). **Rebase:** rebase the current branch onto the target, fast-forward the target to it, and push both. If the current branch was already pushed, its push needs force with lease, which is confirmed in the preview (SAFE-01). **Pull request:** push the current branch and open a pull request into the target, with the options in PR-02. | P0 |
| PIPE-04 | Branch fields take a fixed name or a variable: `{current}` (the branch the repo is on when the run starts), `{base}` (the repo's base branch) or `{task}` (the active task's branch). | P0 |
| PIPE-05 | A pipeline can run on any target set. The preview shows every repo and every step with what will happen, plus warnings. Pushes to protected branches and force-with-lease pushes are listed and confirmed once for the whole run. | P0 |
| PIPE-06 | Inside a repo, steps run in order. Repos run in parallel up to the BULK-04 limit. A setting on each pipeline decides whether every repo goes back to the branch it started on after the last step (on by default). | P0 |
| PIPE-07 | When a step fails or hits conflicts in a repo, that repo pauses at that step and the other repos carry on. After the conflicts are resolved (§7 F), **Resume** continues from the paused step, **Skip step** moves on to the next one, and **Stop** ends the run for that repo and offers undo where it is safe (BULK-09). A paused run is kept if the app closes and can be resumed later. | P0 |
| PIPE-08 | The run screen is a grid of repos × steps. Each cell shows ✓ done, ✗ failed, ⏸ paused, – skipped or ○ waiting, and clicking a cell shows the commands that ran and their output. | P0 |
| PIPE-09 | Ready-made pipelines that can be edited or copied: "Update from main" (Fetch → Update from `main` → Push), "Update from main, merge into dev", and "Update from main, pull request to dev". | P0 |
| PIPE-10 | Run a pipeline from the sidebar, from a task, or by typing its name in the command palette. | P0 |
| PIPE-11 | Options on each step: skip if there is nothing to do (on by default), and stop this repo if the step fails (on by default). | P1 |
| PIPE-12 | Assign a keyboard shortcut to a pipeline. | P1 |
| PIPE-13 | Share pipelines through the team file (CFG-03). | P1 |
| PIPE-14 | Run history: each run's time, target repos and per-repo result, with **Run again**. | P1 |
| PIPE-15 | More step types: run a Git command, delete a branch, create a tag, and merge the pull request when its checks pass (PR-08). | P2 |

## 8. User experience

### Main window

- **Top bar:** workspace picker, target picker, the active task, the main buttons (Start Task, Run Pipeline, Fetch, Pull, Push) and the search / command palette.
- **Left sidebar:** tasks, pipelines, groups, and the screens: Repositories, Changes, Pull Requests, Conflicts and Pipelines, with counts.
- **Centre:** the selected screen. The default is the Repositories dashboard.
- **Right panel:** details for whatever is selected (a repo, a task or a pull request): branch, changes, pull request status and the actions for it.
- **Bottom bar:** running operations, the last fetch time and a link to the activity log.

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

*(Example values. The right panel is left out to keep the sketch narrow.)*

### Changes screen (like VS Code)

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

*(The `app-api` files are the ones in the screenshot. The `app-front` files and the line counts are example values.)*

### Merge editor (like Visual Studio)

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

*(Example values.)*

### Pipeline editor and run screen

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

*(Example values.)*

### Screens

| Screen | What it shows |
|---|---|
| Repositories | The dashboard: every repo's state (DASH-02). |
| Changes | A VS Code-style list of changed files for every repo, their diffs, and the commit box (§7 D). |
| Pull Requests | Created by me, review requested from me, the current task. |
| Conflicts | Repos in a merge or rebase and their conflicted files. Each file opens in the three-pane merge editor (§7 F). |
| Pipelines | Saved pipelines, the pipeline editor, run screens and run history (§7 M). |
| Task | The task's repos, branch and pull requests, with Sync, Merge Into, Create Pull Requests and Finish. |
| Activity log | Every Git command that has run, with its output. |
| Settings | Everything in CFG-01 and CFG-02. |

### Keyboard shortcuts (proposed)

| Action | Windows / Linux | macOS |
|---|---|---|
| Command palette | Ctrl+K | ⌘K |
| Start Task | Ctrl+N | ⌘N |
| Search repos | Ctrl+F | ⌘F |
| Refresh | F5 | ⌘R |
| Commit | Ctrl+Enter | ⌘Enter |
| Next / previous conflict | F8 / Shift+F8 | F8 / ⇧F8 |
| Accept merge | Ctrl+S | ⌘S |
| Settings | Ctrl+, | ⌘, |

### Preview and result (example values)

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

### UX rules

- Every bulk action and pipeline uses the same three steps: **preview → run → result**.
- The user always sees which repos an action will touch before it runs.
- Errors name the repo, the step and what to do next. They are never a generic "something went wrong".
- Nothing important is hidden in menus. The main actions are on screen, and everything else is in the command palette.
- People who know VS Code should feel at home on the Changes screen, and people who know Visual Studio should feel at home in the merge editor.
- The app looks and behaves the same on Windows, macOS and Linux, apart from the shortcut key (Ctrl or ⌘).

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| **Performance** | The targets in §7 K, measured on a reference workspace of 30 real-sized repos on each of the three systems. |
| **Scale** | Designed for 1–30 repos per workspace and tested with 50. |
| **Reliability** | A bulk action or pipeline never leaves a repo in an unknown state. Each repo's final state is reported. If the app is closed or crashes during an operation, it shows on the next start which repos were affected and what state they are in, and paused pipeline runs can be resumed. |
| **Safety** | No work is lost (§7 H). |
| **Security and privacy** | Tokens are stored only in the operating system's keychain (Windows Credential Manager, macOS Keychain, Linux Secret Service), never in plain text. Network calls go only to the Git remotes, the GitHub API and, from v0.2, the update server. The first release has no telemetry. |
| **Compatibility** | The systems in PLAT-01. Git 2.30 or newer must be installed, and if it is missing the app explains how to install it. HTTPS and SSH remotes, using the user's own credential helpers. |
| **Transparency** | Every Git command that runs is visible in the activity log. GitHeddle never does anything the user couldn't repeat in a terminal. |
| **Language** | The UI is in English in the first release (open question 7). |

## 10. Technical approach (proposed)

| Part | Proposal |
|---|---|
| App | One codebase that builds a native desktop app for Windows, macOS and Linux. The technology is still open (question 9); the options are compared below. |
| Git operations | Run the user's `git` CLI in each repo, so behaviour, credentials and hooks match the terminal. A job runner outside the UI thread handles the parallel limit, cancellation and per-repo results. |
| Repo state | Read directly from Git (for example `git status --porcelain=v2 --branch`), watch the file system for changes, and cache the last known state on disk so the dashboard appears instantly on start. |
| Diff and merge | One shared diff engine for the Changes screen, the diff view and the merge editor. The merge editor takes the three versions of a conflicted file from Git itself (index stages 1, 2 and 3: base, current and incoming), so its result always matches what Git would do. |
| Pipelines | Stored as data: an ordered list of steps with their settings. They run on the same job runner as bulk actions. Each repo's run is a small state machine that can pause and resume, and its state is saved to disk so a paused run survives an app restart. |
| GitHub | OAuth device flow for sign-in, and the GitHub REST and GraphQL APIs. GraphQL fetches the status of many pull requests in one request. |
| Storage | Settings, workspaces, groups, tasks and pipelines in the app's data folder, in each system's usual place (`%APPDATA%` on Windows, `~/Library/Application Support` on macOS, `~/.config` on Linux). The optional team file `.githeddle.json` lives in the workspace. Tokens live in the system keychain. |
| Editor and tools | Open repos and files in VS Code with the `code` command by default. The editor, terminal and external merge tool are configurable. |
| Hosting providers | One provider interface (create, list, update and merge pull requests; read checks and reviews), so that GitLab or Azure DevOps can be added later without changing the rest. |
| Updates (v0.2) | Signed update packages. Where they are published is still open (question 6). |

### Technology options

| Option | Strengths | Weaknesses |
|---|---|---|
| **Tauri 2** (Rust core + web UI) | Very small installer (a few MB), fast start and low memory. The web UI is quick to build and style. | Rust is a new language if the author doesn't already use it. Each system's built-in webview behaves slightly differently, so the UI needs testing on all three. |
| **Avalonia** (C# / .NET) | The author already works in C# / .NET (`app-api`). Native rendering looks the same on all three systems, and performance is good. | Fewer ready-made UI components. A self-contained .NET app makes a larger installer (tens of MB). |
| **Electron** (Node.js + web UI) | The largest ecosystem, with the same Chromium on every system. | A large installer (around 100 MB or more) and high memory use, which works against "very fast". |

**Recommendation:** Tauri 2 fits "very fast" and "small" best. Avalonia is the better choice if staying in C# matters more. Decide before development starts (question 9).

## 11. Success metrics

Before building, time the manual flows once to get a baseline.

| Metric | Target |
|---|---|
| Starting a task across 2 repos | Under 30 seconds |
| Creating the pull requests for a 2–3 repo task | Under 1 minute, without opening the browser |
| Running a saved pipeline on a task's repos | 2 clicks (Run, then confirm) |
| Resolving a conflicted file | Done entirely in GitHeddle's merge editor, without opening another tool |
| App start | Under 1 second (from the second launch on), on all three systems |
| First-run setup | Under 2 minutes |
| A new user without help | A teammate who has never used GitHeddle gets from first launch to created pull requests for a 2-repo task without asking for help |
| Same behaviour everywhere | Every v0.1 flow passes on Windows, macOS and Linux |
| Lost uncommitted work, or unintended pushes to a protected branch | Zero |
| Daily use | The author uses GitHeddle instead of manual steps for every covered flow for 2 weeks in a row |

## 12. Release plan

| Release | Scope |
|---|---|
| **v0.1 — MVP** | All P0 requirements: dashboard, groups, the VS Code-style Changes screen with diffs and commits, bulk operations, Start and Switch Task, Sync with Base, Merge Task Into…, the Conflicts screen with the three-pane merge editor, pipelines with the ready-made ones, creating pull requests with related links, task pull request status, safety rules, settings, installers for all three systems, and the speed and ease-of-use requirements. |
| **v0.2** | All P1 requirements: Base view in the merge editor, pipeline step options, shortcuts, sharing and run history, automatic updates, signed installers, `.rpm` package, Pull Requests screen, bulk pull request update and merge, Finish Task, undo, commit history, more operations, Run Git command, team config file, repo pull request templates, several workspaces, built-in help. |
| **v0.3 and later** | P2 requirements and new hosts: line-level staging, more pipeline step types, review flow, notifications, Conventional Commits, Linux ARM64, GitLab and Azure DevOps, fetching ticket titles from an issue tracker, AI-written pull request descriptions. |

**v0.1 is done when** the author takes one real ticket that spans 2 repos from Start Task to created pull requests using only GitHeddle plus an editor, including at least one conflict resolved in the merge editor and one run of a saved pipeline; the same flows pass on macOS and Linux test machines; and the start-up and dashboard targets (PERF-01, PERF-02) are met on all three systems.

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Three systems triple the testing | Automated tests on Windows, macOS and Linux in CI from day one, using one shared reference workspace. |
| Platform differences (paths, line endings, case sensitivity, credential helpers on Linux) cause bugs on one system only | Handle them in one place in the core and test that layer on all three systems. |
| Unsigned installers show frightening warnings and give a bad first impression | Plan signing early (v0.2). Until then, the download page explains the warning. |
| A desktop app is a bigger job: the Changes screen, the diff view and the three-pane merge editor all have to be built | Build one shared diff engine first and use it for all three. Opening an external merge tool stays available as a fallback. |
| "Very fast" erodes slowly as features are added | The performance targets in §7 K are checked automatically in CI on every change. |
| A bulk action or pipeline half-succeeds and leaves repos in different states | Preview first, a per-repo result grid, Resume and Retry, undo (v0.2). The dashboard makes a mixed state visible. |
| A pipeline with a rebase step rewrites history that others may already have pulled | Rebase steps are shown in the preview and need a force-with-lease confirmation. The ready-made pipelines use merge. |
| The word "pipeline" makes people think of CI/CD | The UI and the guide say clearly that pipelines run Git and pull request steps on this computer and don't build or deploy anything. |
| The user changes the same repos in VS Code or a terminal at the same time | State is always read from Git, file watchers refresh it, and each operation re-checks state just before it runs (SAFE-07). |
| GitHub API rate limits with many repos and pull requests | Fetch pull request status in batches with GraphQL, cache it, and refresh on demand instead of polling constantly. |
| Conflicts in generated files such as `.csproj` are tedious | Take all incoming / take all current per file, and the merge editor shows only the real conflicts. No automatic resolution. |
| The branch pattern doesn't fit every ticket | The branch name can be edited in the preview, and the pattern is configurable. |
| Scope creep delays the first usable version | Only P0 goes into v0.1. Everything else waits. |

## 14. Open questions and assumptions

| # | Question | Assumption until answered |
|---|---|---|
| 1 | Are all work repositories on GitHub (github.com or GitHub Enterprise), or are some on GitLab or Azure DevOps? | All on github.com. |
| 2 | Is the branch pattern always `{ticket}-{user}-{Title}`? Is the title PascalCase (`Onboarding`) or kebab-case? | `{ticket}-{user}-{Title}`, title in PascalCase. |
| 3 | How does work reach `dev`: through a pull request, or by merging locally and pushing (as in the screenshot)? This decides whether `Merge Task Into…` with push is a main flow or an edge case. | Both happen; both are supported. |
| 4 | Should Sync with Base merge or rebase by default? | Merge. |
| 5 | Should the first release fetch ticket titles from an issue tracker (for example Jira)? | No; the title is typed in. |
| 6 | Where is the app published (GitHub Releases, a website, internal only), and is it open source? | GitHub Releases. Open source under GPL-3.0, at github.com/dev-taosif-net/GitHeddle. Personal use first, built so the team can use it. |
| 7 | UI language: English only, or Bangla as well? | English only in v0.1. |
| 8 | Which repos form the natural groups? | `backend` = `app-api`, `app-report-api`, `app-scheduler-api`, `app-signalr-api`; `frontend` = `app-front`; `docs` = `knowledge-hub`, `architecture-handbook`. |
| 9 | Which technology: Tauri 2 or Avalonia (C#)? | Tauri 2, because it fits the speed and size targets best. |
| 10 | Will there be a Windows code-signing certificate and an Apple Developer account for signing? | Unsigned in v0.1, signed from v0.2. |
| 11 | In a pipeline, what should "rebase into `dev`" mean? | Rebase the current branch onto `dev`, then fast-forward `dev` to it (a straight-line history), as in PIPE-03. |
| 12 | Should pipelines be able to run on a schedule (for example every morning), or only when started by hand? | Only by hand in v0.1. |

## 15. Glossary

| Term | Meaning |
|---|---|
| Pull request (PR) | GitHub's request to merge one branch into another, with review and CI checks. |
| Draft pull request | A pull request that is visible but not yet ready for review. |
| Base branch | The branch a task branch starts from and is merged back into, usually `dev`. |
| Upstream | The remote branch a local branch tracks, for example `origin/TK-2636-taosif-Onboarding`. |
| Ahead / behind | How many commits a branch has that the other branch doesn't (ahead), and the reverse (behind). |
| Fast-forward only | Update a branch only if no merge commit is needed. Otherwise stop and report. |
| Stash | Put uncommitted changes aside temporarily so you can switch branches, then bring them back later. |
| Force with lease | A force push that refuses to run if someone else has pushed to the branch in the meantime. |
| Conflict marker | The `<<<<<<<`, `=======` and `>>>>>>>` lines Git writes into a file when a merge conflicts. |
| Incoming / Current / Result | The three panes of the merge editor: the branch being merged in, the branch you are on, and the file that will be saved. |
| Base (common ancestor) | The version of a file from the last commit both branches share. |
| Pipeline | A named, saved sequence of Git and pull request steps that runs on many repos with one click. |
| OAuth device flow | A sign-in where the app shows a short code and the user approves it on github.com, so no password or token is typed into the app. |
| Keychain | The operating system's secure password store: Windows Credential Manager, macOS Keychain, or Secret Service on Linux. |

## 16. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2 November 2026 | First draft, describing a VS Code extension. |
| 0.2 | 2 November 2026 | Changed to a standalone desktop app for Windows, macOS and Linux. Added requirements for platforms and installation (§7 J), speed (§7 K), ease of use (§7 L), and changes and commits (§7 D). Added the technology options (§10). |
| 0.3 | 2 November 2026 | "Pull request" is used everywhere instead of "merge request" (requirement IDs `MR-xx` became `PR-xx`). Added pipelines (§7 M, Flow 8). The Changes screen now works like VS Code's Source Control (§7 D). Conflicts are resolved in a built-in three-pane merge editor like Visual Studio's, now in v0.1 (§7 F). |
| 0.4 | 2 November 2026 | The project is open source under GPL-3.0 (§14, question 6). Work-specific repository names and ticket keys in the examples were replaced with generic ones. |
