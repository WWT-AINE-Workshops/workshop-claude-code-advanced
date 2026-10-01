# Lab 6: Automate and scale

**SDLC phase:** Test; Secure and Release · **Stage:** Agent Augmented · **Time:** 15 minutes

## Why this matters

Up to now you sat in front of Claude and watched. This lab moves some of that work to places where you are not watching: a review that runs in the background, a script that calls Claude with no screen, and two sessions working side by side.

That only works if you keep the gate. Claude writes, a different Claude reviews, and you decide. The session that wrote a change is biased toward it, so a review from a fresh context finds more.

You do three things:

- **Review a pull request.** Search v2 is a draft PR with three planted defects and one safe decoy. You hunt for them two ways.
- **Run Claude headless.** A script loops over every route file and builds an API inventory.
- **Run a writer and a reviewer.** One session fixes a defect in its own worktree, and a fresh session reviews the fix.

_Adapted from Claude Code docs: Best practices for Claude Code › Add an adversarial review step._

## Before you start

You need the workshop repo cloned as `my-copperline`, with `gh` signed in and `./scripts/check-setup.sh` passing. Your copy of the repo needs the Search v2 pull request, which `./scripts/seed-github.sh` creates. A rough budget:

| Steps                                                | Minutes |
| ---------------------------------------------------- | ------- |
| Facilitator demo                                     | 3       |
| 1                                                    | 1       |
| 2                                                    | 2       |
| 3                                                    | 1       |
| 4                                                    | 3       |
| 5 (Part C; skipped if the room is 10 minutes behind) | 3       |
| 6 (Part C)                                           | 2       |

Go to the repo root, then run the reset script, even if you are already at the right place. It puts you on a clean branch called `lab-6`.

```bash
cd my-copperline
```

```bash
./scripts/reset-lab.sh 6
```

What it changes: it switches you to branch `lab-6` at the start of the lab, and it resets the local database to the seed data (8 users, 12 items, 40 requests). If you had committed work on `lab-6` before, it saves that on a branch named `lab-6-backup-<sha>` first. If you have uncommitted changes it stops and lists them. This branch starts from the reference solution to Lab 5, so everyone has the same code and the same `.claude/` setup. It ends with this line:

```text
You're at the start of Lab 6 on branch lab-6.
```

Claude's wording will differ from run to run, so look for the signals each step lists, not exact sentences.

## Steps

### Step 1: Check out the PR and run a review

**Do this.** Part A reviews the Search v2 pull request. Check it out with `gh`.

```bash
gh pr checkout search-v2
```

Start Claude Code and run the bundled review on the PR's changes.

```bash
claude
```

```text
/code-review main...HEAD
```

The target tells the review what to read: here, everything on your current branch that is not on `main`. On its own, `/code-review` looks at commits ahead of the branch's upstream plus uncommitted changes. A branch you just checked out from a PR has neither, so it would have nothing to report.

The review runs as a background subagent, so your conversation stays free. Go straight on to step 2 while it works.

**What you should see.** `gh` switches you to a branch named `search-v2`. This branch is based on the Lab 1 starting point, so it has none of your Lab 1 to 5 setup, and that is fine for a review. `/code-review` starts a background subagent. When it finishes, the findings appear in your session. They usually include the SQL built from the search text and the page offset.

**Why.** A background review costs you none of your own context window, and it starts with fresh eyes.

_Adapted from Claude Code docs: Code Review › Review a diff locally._

### Step 2: Ask what the change allows

**Do this.** While the review runs, paste a prompt of your own. It makes Claude read the PR description first, so it knows what the author says the change does, then asks what it allows beyond that.

```text
Read the pull request description with `gh pr view search-v2`, then review this branch against main. What does this change allow that it shouldn't? Check SQL safety, authorization and pagination, and report each finding with file and line.
```

Your Lab 5 `security-reviewer` subagent is not on this branch, because it lives on `lab-6`. Step 6 uses it.

Now score yourself. The PR plants three defects, and one place that looks suspicious is safe.

- Defect 1: SQL built from the search text with string interpolation.
- Defect 2: no check of who is asking, so search shows other people's requests.
- Defect 3: the page offset is wrong for 1-based pages.
- Decoy: `searchItems` is built correctly. Flagging it is a false positive.

**What you should see.** Claude reads the PR description, then `apps/api/src/search.ts` and the route that calls it. A good answer names `searchRequests` for all three defects, with a line number each. The PR says "`npm test` passes", and it does, because the new tests only check that results exist and that each result matches. Compare your findings with the review from step 1. The built-in review often finds defects 1 and 3 quickly. Defect 2 needs the reviewer to know who may see which request, so it usually comes from your prompt. Finding 2 of 3 is the goal.

**Why.** A review prompt that names what to check, and compares the code with what the author claims, finds more than a general "review this".

_Adapted from Claude Code docs: Best practices for Claude Code › Add an adversarial review step._

### Step 3: Switch back to your lab branch

**Do this.** Quit Claude Code (press Ctrl+D twice on an empty prompt), then go back to your lab branch. If you used your own branch for Labs 1 to 5, switch to that instead.

```bash
git switch lab-6
```

You need this because `search-v2` is based on the Lab 1 starting point. It has none of your later setup: no `.claude/` settings, hook, skill or subagent, and it is missing the Lab 2 to 5 code.

**What you should see.** `Switched to branch 'lab-6'`. `ls .claude` lists `agents`, `hooks`, `settings.json` and `skills` again.

**Why.** Part B and Part C use the setup you built in earlier labs. Work done on the wrong branch is easy to lose.

### Step 4: Run Claude headless over every route file

**Do this.** `claude -p` runs one turn with no interactive session and prints the result. The inventory script calls it once for each file in `apps/api/src/routes/`.

```bash
./scripts/route-inventory.sh
```

Open the script if you want to read it. This is the command it runs for each route file:

```text
claude -p "Read $file. List every HTTP endpoint it registers ..." --output-format json --allowedTools "Read" --permission-mode dontAsk
```

Each flag does one job:

- `-p` runs one non-interactive turn and prints the result.
- `--output-format json` returns one JSON object, with the answer in its `result` field, so the script can merge the files.
- `--allowedTools "Read"` approves the Read tool in advance.
- `--permission-mode dontAsk` refuses anything else that would have prompted, so a script that nobody watches cannot get stuck on a question or do something you did not allow.

When it finishes, count the endpoints in the file.

```bash
node -e "console.log(require('./docs/api-inventory.json').length)"
```

**What you should see.** The script prints one line per file and ends with exactly this:

```text
Wrote docs/api-inventory.json (15 endpoints from 3 route files)
```

The count command prints `15`: 4 from `system.ts`, 3 from `items.ts` and 8 from `requests.ts`. `docs/api-inventory.json` is a new, untracked file with a `method`, `path`, `file` and `summary` for each endpoint. Wording in the summaries varies. The count should not. It makes one Claude call for each file, so wait for the last line.

**Why.** The same pattern runs in CI, a scheduled job or a pre-commit script. It is locked down by default, so it is safe to leave running.

_Adapted from Claude Code docs: Run Claude Code programmatically › Basic usage._

### Step 5: Start a writer in its own worktree

**Do this.** Part C runs two sessions at once. A worktree is a second working folder for the same repo, on its own branch, so the two sessions never touch each other's files. The writer fixes defect 1, the SQL injection.

The fix lives in `apps/api/src/search.ts`, which only exists on `search-v2`. Create the worktree from that branch, on a new branch called `fix-injection`.

```bash
git worktree add -b fix-injection ../copperline-fix-injection refs/heads/search-v2
```

Fallback: `claude --worktree fix-injection` is the shorter route, but by default a new worktree branches from the repository's default branch (`main`), which has no `search.ts`. That is why this step uses git. (The docs also describe `claude --worktree "#<PR number>"`, which starts from a pull request's head commit.) The full path `refs/heads/search-v2` avoids a clash with the tag of the same name.

List your worktrees to see the folder path.

```bash
git worktree list
```

Open a second terminal and go to the `copperline-fix-injection` folder, which sits next to `my-copperline`. A worktree is a fresh checkout, so install the dependencies and reset the database there.

```bash
npm ci
```

```bash
npm run setup
```

Start Claude Code in the worktree. Accept the folder trust prompt if it shows. Then paste the prompt.

```bash
claude
```

```text
Fix the SQL injection in apps/api/src/search.ts by using bound parameters, add a test that proves it, and commit.
```

Start step 6 once the commit lands.

**What you should see.** `git worktree add` prints `Preparing worktree (new branch 'fix-injection')` and `HEAD is now at` the Search v2 commit. The worktree has `apps/api/src/search.ts`, and your original folder is untouched, still on `lab-6`. In the worktree, Claude changes `searchRequests` to use `?` placeholders with `%${q}%` bound as a value, as `searchItems` already does. It adds a test in `apps/api/test/search.test.ts` that sends a search with a quote in it and checks it returns what you expect, and it commits to `fix-injection`.

**Why.** A worktree isolates the files, so the writer cannot break the folder you are reviewing from. Two sessions on one folder would overwrite each other's changes.

_Adapted from Claude Code docs: Run parallel sessions with worktrees › Manage worktrees manually._

### Step 6: Review the fix with a fresh session

**Do this.** In your original terminal, in `my-copperline` on `lab-6`, start a new Claude Code session. It has not seen the writer's work, which is the point.

```bash
claude
```

```text
Review the latest commit on the fix-injection branch, with fresh eyes: run git show fix-injection. The worktree is at ../copperline-fix-injection. Is the injection fixed, and did anything else change?
```

Add this sentence to the prompt: `Use the security-reviewer subagent.`

**What you should see.** Claude runs `git show fix-injection` and reports on the diff. A good review confirms that the query uses bound parameters, and that the new test would fail on the old code. It also lists anything else that changed. Look for whether `searchItems` stayed as it was, and whether defects 2 and 3 are still there, because the writer was only asked to fix defect 1. Two sessions are now open at once.

**Why.** The writer is biased toward its own work. A reviewer that starts from the diff alone judges the result, not the reasoning that produced it.

_Adapted from Claude Code docs: Best practices for Claude Code › Add an adversarial review step._

## You're done when

- You found at least 2 of the 3 planted defects, and did not flag `searchItems` as a problem.
- `docs/api-inventory.json` lists 15 endpoints.
- Two sessions ran at the same time, a writer in the worktree and a reviewer in `my-copperline`.
- Optional cleanup: remove the worktree, then the branch. Run these in `my-copperline` after you close both sessions.

  ```bash
  git worktree remove ../copperline-fix-injection
  ```

  ```bash
  git branch -D fix-injection
  ```

Post a ✅ in the workshop chat, or tell a helper. If you are stuck, post a 🆘 with the step number. If your group skipped Part C, post ✅ after step 4.

**Badge:** Test; Secure and Release · Agent Augmented.

## If it goes wrong

- **Claude goes off-scope.** If a session starts changing files beyond `search.ts` and its test, press `Esc`. Then narrow the prompt: `Only change searchRequests in apps/api/src/search.ts and its test.` In a review, say `Report only. Do not edit anything.`
- **`gh pr checkout search-v2` fails.** Run `gh auth status` to check you are signed in. If it says there is no pull request, run `./scripts/seed-github.sh`, which creates the branch and the draft PR on your copy of the repo, then try again.
- **`/code-review` reports nothing.** You ran it with no target on a checked-out PR branch. Run `/code-review main...HEAD`.
- **`./scripts/route-inventory.sh` stops.** It names the file it could not read. If it says Claude Code is not installed, run `./scripts/check-setup.sh`. If it asks you to check you are signed in, run `claude` once to sign in. If it says it could not read the endpoints Claude returned, run it again.
- **`git worktree add` fails.** If the folder or branch `fix-injection` already exists, remove them first with `git worktree remove --force ../copperline-fix-injection`, then `git branch -D fix-injection`.
- **The worktree session cannot run tests.** The folder is a fresh checkout, so run `npm ci` and `npm run setup` in it.
- **I fell behind.** Run `./scripts/reset-lab.sh 6`. It moves you to a clean `lab-6` branch, saves any committed work on a `lab-6-backup-<sha>` branch, and resets the database to the seed data. The inventory file is untracked, so the script stops and lists it. Run `./scripts/reset-lab.sh 6 --force` to discard it, or delete `docs/api-inventory.json` first. Remove a leftover worktree as in the item above.

## Stretch goals

- Run `/batch` for a small cross-file change, for example "rename a helper used in several files". It researches the code, shows a plan, and after you approve starts one background subagent for each unit of work, each in its own worktree. Fallback: if `/batch` is not found, ask Claude to do the change in one session and review the diff.
- Stream the headless events as they happen. Try `claude -p "List the endpoints in apps/api/src/routes/system.ts" --output-format stream-json --verbose`. Each line is one JSON event. This output format needs `--verbose`.
- Open agent view with `claude agents`. It lists your background sessions, grouped by state. Subagents are not listed as separate rows. It is a research preview, so the screen may differ from what is described here. Fallback: if the command is missing, run `git worktree list` to see your worktrees.

## Recap

| Practice      | Before                                                       | After                                                                                 |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Review        | You read the diff yourself, or ask the session that wrote it | A fresh-context review, plus a prompt that checks the code against the PR description |
| Automation    | One interactive session per question                         | `claude -p` in a script, locked down with `dontAsk`, one JSON file out                |
| Parallel work | One session, one working folder                              | A writer in its own worktree and a reviewer in another session                        |
