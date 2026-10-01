# Lab 2: Explore, plan, code, commit

**SDLC phase:** Plan → Build · **Stage:** AI-Integrated · **Time:** 18 minutes

## Why this matters

If you ask Claude to build a feature straight away, it may solve a slightly different problem from the one you have. The fix is to split the work into four phases. Explore the code, plan the change, implement it, then commit. The first two phases happen in plan mode, where Claude can read and answer but cannot change your files. You read and edit the plan before any code is written, which is the cheapest moment to catch a wrong turn.

In this lab you build a real feature from a real GitHub issue. Issue 1 asks for a status filter on the requests list and an approval history for each request. The history data is already in the database. Nothing shows it yet. You will go from the issue to a pull request in about 18 minutes.

Planning is not free. Step 9 is about when to skip it.

_Adapted from Claude Code docs: Best practices for Claude Code › Explore first, then plan, then code._

## Before you start

You need the workshop repo cloned as `my-copperline` and `./scripts/check-setup.sh` passing. A rough budget:

| Steps            | Minutes |
| ---------------- | ------- |
| Facilitator demo | 3       |
| 1 to 3           | 3       |
| 4 and 5          | 3       |
| 6                | 4       |
| 7                | 2       |
| 8 and 9          | 3       |

Go to the repo root, then run the reset script, even if you are already at the right place. It puts you on a clean branch called `lab-2`.

```bash
cd my-copperline
```

```bash
./scripts/reset-lab.sh 2
```

What it changes: it switches you to branch `lab-2` at the start of the lab, and it resets the local database to the seed data (8 users, 12 items, 40 requests). If you had committed work on `lab-2` before, it saves that on a branch named `lab-2-backup-<sha>` first. If you have uncommitted changes it stops and lists them. Your Lab 1 work is not lost, but the branch starts from the reference `CLAUDE.md` (32 lines), so everyone has the same project guide. It ends with this line:

```text
You're at the start of Lab 2 on branch lab-2.
```

Claude's wording will differ from run to run, so look for the signals each step lists, not exact sentences.

## Steps

### Step 1: Start Claude Code and check the branch

**Do this.** Check that you are at the repo root, then start Claude Code.

```bash
pwd
```

The path it prints should end in `my-copperline`. If it does not, run `cd my-copperline` first.

```bash
claude
```

**What you should see.** The Claude Code prompt appears. If you did not just run the reset script, quit (press `Ctrl+D` twice on an empty prompt) and run `git branch --show-current` first. It should print `lab-2`. The file `CLAUDE.md` is in the repo root, 32 lines long, and Claude Code reads it at the start of the session.

**Why.** Starting from a known state means your results will look like the ones in this guide.

### Step 2: Enter plan mode

**Do this.** Look at the status bar under the prompt. It shows which permission mode you are in. Press `Shift+Tab` to cycle to plan mode, until the bar shows this text:

```text
⏸ plan mode on
```

Where you start decides how many presses you need. Pick one route.

- **Auto start.** On Claude Code 2.1.283 or later, a new session starts in auto mode, and the bar shows `⏵⏵ auto mode on`. Press `Shift+Tab` three times. You pass `⏸ manual mode on`, then `⏵⏵ accept edits on`, then `⏸ plan mode on`.
- **Manual start.** Some organizations turn auto mode off, so you start in Manual (`⏸ manual mode on`). Press `Shift+Tab` twice. You pass `⏵⏵ accept edits on` and land on `⏸ plan mode on`.
- **One step.** Type this and press Enter. It switches to plan mode from wherever you are.

  ```text
  /plan
  ```

  You can also put a description after it, such as `/plan add a status filter`, and Claude starts on that task straight away.

- **Editor or desktop app.** In VS Code, use the mode indicator in the prompt area. In the desktop app, use the mode selector next to the send button. In JetBrains, the IDE terminal works like the CLI.
- **Fallback.** If the cycling goes wrong, quit (press `Ctrl+D` twice on an empty prompt) and restart with `claude --permission-mode plan`.

**What you should see.** The status bar reads `⏸ plan mode on`. In this mode Claude can read files and answer questions, but it does not change your files.

**Why.** Plan mode makes the "look, but don't touch" rule something the tool enforces, not something you hope Claude remembers.

_Adapted from Claude Code docs: Choose a permission mode › Analyze before you edit with plan mode._

### Step 3: Explore, read-only

**Do this.** Ask Claude to read the issue and the code it touches. Paste this prompt.

```text
Read GitHub issue 1 with `gh issue view 1`. Then look at how GET /api/requests lists requests and where request_events rows are written. Don't change anything yet.
```

Claude may ask your permission to run the `gh` command. It only reads the issue, so approve it. In plan mode with auto mode available, the classifier reviews commands like this for you, so you may not be asked at all. Fallback: if your organization turned auto mode off, you will be asked, so approve it.

**What you should see.** Claude runs `gh issue view 1` and shows the issue, titled "Filter requests by status and show approval history". Then it reads these places:

- `apps/api/src/routes/requests.ts`, where the list route lives and where `insertEvent` is called for each status change.
- `listVisibleRequests` and `insertEvent` in `apps/api/src/repo.ts`.
- The `RequestEvent` type in `packages/shared/src/index.ts`.

It should summarise that the events already exist in the `request_events` table, and that nothing exposes them. No file is changed.

**Why.** Claude uses the `gh` command-line tool the same way you would. Reading the issue itself is better than describing it from memory, and exploring first means the plan is built on what the code actually does.

_Adapted from Claude Code docs: Best practices for Claude Code › Use CLI tools._

### Step 4: Ask for a plan

**Do this.** Paste this prompt. It names the constraints you care about.

```text
Make a plan to implement issue 1 across the shared types, the API and the web app. Keep the existing visibility rules, list the tests you will add, and don't create new tables.
```

**What you should see.** After a short wait, Claude presents a plan and asks how to proceed. A good plan mentions:

- the existing `request_events` table and the `RequestEvent` type, so nothing new in the database,
- an optional `status` query on `GET /api/requests` that is checked against the known statuses and returns 400 for anything else,
- a new `GET /api/requests/:id/events` endpoint that reuses `requireVisible`, so people can only see history for requests they can already see,
- a status filter on the requests page that goes back to page 1 when you change it, and a way to show a request's history,
- the tests it will add, for the filter and for the events endpoint.

Check the plan for traps. If it adds a new table, skips the visibility check on the events endpoint, or never mentions resetting the page number, tell it. At the plan prompt, choose "No, keep planning" and say what to fix.

**Why.** Reading a plan takes a minute. Reading a wrong 300-line diff takes much longer.

### Step 5: Edit the plan

**Do this.** While the plan is on screen, press `Ctrl+G`. It opens the proposed plan in your default text editor. Add one line, then save and close the file.

```text
When the status filter changes, go back to page 1.
```

**What you should see.** Your editor opens with the plan as text. When you save and close, you are back at Claude's question, and your line is part of the plan. If the plan already says this, add the line anyway. Editing the plan yourself is the point of the step.

**Why.** The plan is a document you control. A line you add now is a rule Claude follows later, without a long back-and-forth.

_Adapted from Claude Code docs: Choose a permission mode › Review and approve a plan._

### Step 6: Approve and implement

**Do this.** Approve the plan, and pick the option that lets Claude edit files without asking for each one. It reads "Yes, and use auto mode". If your organization has auto mode turned off, it reads "Yes, auto-accept edits". That second wording is the fallback. Approving a plan leaves plan mode, so the bar changes. Then paste this prompt.

```text
Implement the plan. Write the tests first, run them, then run npm test, npm run lint and npm run typecheck and fix anything that fails.
```

**What you should see.** This is the longest step. Claude writes the tests first and runs them, and they fail because the feature does not exist yet. Then it changes the code, mostly `apps/api/src/repo.ts`, `apps/api/src/routes/requests.ts`, `apps/web/src/api.ts` and `apps/web/src/pages/MyRequests.tsx`, and adds a timeline component under `apps/web/src/components`. It then runs the three checks. By the end:

- there are new tests for `?status=` and for the events endpoint, probably in a new file such as `apps/api/test/events.test.ts`,
- `npm test` passes. The starting point has 53 API tests and 5 web tests. The reference solution adds 6 API tests and 1 web test, so expect a few more than before, not exactly those numbers,
- `npm run lint` and `npm run typecheck` print no errors.

The web tests are thin. The tests cannot see the whole UI, so the next step checks it by eye.

Watch the clock. If it is about 0:41 on the room clock and Claude is still implementing, skip step 7. Look at the finished feature with `git diff lab-2-start lab-3-start` instead. Running `./scripts/reset-lab.sh 3` (add `--force` if it lists your uncommitted files) carries you on to Lab 3 with the reference code.

**Why.** The tests and the three checks are how Claude knows it is done. Without them, "done" just means Claude stopped.

_Adapted from Claude Code docs: Best practices for Claude Code › Give Claude a way to verify its work._

### Step 7: Check it in the browser

**Do this.** Open a second terminal at the repo root and start the app. Leave it running.

```bash
npm run dev
```

Open <http://localhost:5173/requests>. The "Signed in as" menu shows Ava Patel, who is user 1. Choose Pending in the status filter. Then press History on request 1.

**What you should see.** After you choose Pending, the table narrows to Ava's pending requests. Request 1, the HD Webcam, is the one you want. The page count follows the filter. Pressing History on request 1 opens a row under it with one line: Submitted by Ava Patel, with a date.

Now switch the "Signed in as" menu to Ben Okafor (user 2), an Engineering manager. Open Approvals, where request 1 is at the top, and approve it. Switch back to Ava, open History on request 1 again, and the timeline now has a second line: Approved by Ben Okafor, dated today.

**Why.** Passing tests do not prove the screen works. Looking at it for a minute catches problems that tests miss.

### Step 8: Ship it

**Do this.** In Claude Code, paste this prompt. Leave the app running in your second terminal.

```text
Create a branch, commit with a Conventional Commit message that says it closes issue 1, push it, and open a pull request with gh.
```

If Claude asks to run `git`, `git push` or `gh` commands, approve them.

**What you should see.** Claude creates a branch, such as `feat/status-filter-and-history`, and commits with a message like `feat: filter requests by status and show approval history`, with `Closes #1` in the message. Then it pushes the branch to your own copy of the repo and runs `gh pr create`. The last thing you see is a pull request address like `https://github.com/<you>/my-copperline/pull/6`. The number is usually 6, because your copy already has issues 1 to 4 and the draft Search v2 pull request as 5. Open it. The body should mention `#1`. The diff also shows `CLAUDE.md`, the reference file from the reset, because your `main` does not have it. That is expected.

`Closes #1` closes the issue only when the PR is merged. Do not merge it. Leave it open for now.

**No GitHub copy of the repo?** If you are working on your own and do not have a GitHub copy (no `origin`, or `gh` is not signed in), commit locally and stop there. Use this prompt instead, then skip the push and the pull request.

```text
Create a branch and commit with a Conventional Commit message that says it closes issue 1. Don't push and don't open a pull request.
```

You should then see a new commit on the new branch. `git log --oneline -1` shows your commit message, with `#1` in it.

**Why.** A pull request that links the issue is what a reviewer needs. It shows what changed, why, and which ticket it belongs to.

### Step 9: Decide when to skip the plan

**Do this.** No command. Think about the lab for a minute, then talk about it with the person next to you. Which parts really needed a plan? Which would you have just typed?

**What you should see.** Nothing on screen. Here is a simple rule. Plan when you are unsure of the approach, when the change touches several files, or when the code is unfamiliar. This lab did all three. If you could describe the diff in one sentence, skip the plan and just ask for it. Renaming a variable, fixing a typo, or adding one log line does not need four phases.

**Why.** Planning is a tool for uncertainty. When you already know what the diff is, it only adds a minute.

_Adapted from Claude Code docs: Best practices for Claude Code › Explore first, then plan, then code._

## You're done when

- A pull request is open that mentions #1. If you have no GitHub copy, the commit is on your local branch instead.
- `npm test`, `npm run lint` and `npm run typecheck` pass.
- In the browser, the Pending filter narrows the requests list, and History on request 1 shows a timeline that grows after Ben approves it.

Post a ✅ in the workshop chat, or tell a helper. If you are stuck, post a 🆘 with the step number.

**Badge:** Plan → Build · AI-Integrated.

## If it goes wrong

- **Claude goes off-scope.** If it starts editing files during the plan, adds a new table, or rewrites code you did not ask about, press `Esc`. Claude stops and keeps what you have talked about so far. Then narrow the prompt, for example: `Only change what the plan lists. Do not add tables.`
- **I cannot find plan mode.** You may have passed it. Keep pressing `Shift+Tab` until the bar reads `⏸ plan mode on`, or type `/plan`. The bar is the truth: if it does not say plan mode, Claude can edit files.
- **`Ctrl+G` does nothing, or the editor will not open.** Choose "No, keep planning", type the extra line as a message, and let Claude update the plan. You still approve it the same way.
- **`gh issue view 1` fails.** You may not be signed in, or your copy of the repo has no issues yet. Run `gh auth status`, then `./scripts/seed-github.sh`. If you have no GitHub copy, replace the first sentence of the prompt with: `Read the issue in scripts/seed/issues/01-filter-and-history.md.`
- **`reset-lab.sh` stops and lists files.** You have uncommitted changes. Commit or move them, or run `./scripts/reset-lab.sh 2 --force` to discard them.
- **`npm run dev` says a port is in use.** Another copy of the app is still running. Stop it with Ctrl+C in its terminal, then start again.
- **I fell behind.** Run `./scripts/reset-lab.sh 2`. It moves you to a clean `lab-2` branch, saves any committed work on a `lab-2-backup-<sha>` branch, and resets the database to the seed data. Then repeat steps 2, 3, 4 and 6 and skip step 5. To see the finished feature without building it, run `git diff lab-2-start lab-3-start`.
- **Tests fail at the end of step 6.** Reply: `Run npm test and fix the failing test. Don't weaken or delete a test to make it pass.`
- **Claude's plan or code differs from this guide.** That is normal. Judge them by the signals in each step.

## Stretch goals

- Plan a follow-up feature with an interview. Paste this prompt and answer Claude's questions. When it has enough, it writes a spec to `SPEC.md`.

  ```text
  I want to filter Copperline requests by item category. Interview me with the AskUserQuestion tool about the API, the UI, edge cases and trade-offs. Skip the obvious questions. When we are done, write the spec to SPEC.md.
  ```

- Build from the spec in a fresh session. Type `/clear` to empty the context, then ask Claude to implement `SPEC.md`. Planning leaves no clutter behind, and you have a written spec to point at.
- Before Lab 3, commit `SPEC.md` and anything you built from it, or delete them. `reset-lab.sh` stops when files are uncommitted.
- Compare your work with the reference solution: `git diff lab-2-start lab-3-start`. What did you do differently?

_Adapted from Claude Code docs: Best practices for Claude Code › Let Claude interview you._

## Recap

| Practice                            | Before                                                                       | After                                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Explore first, then plan, then code | "Add the history feature." Claude starts editing and you review a large diff | Plan mode to read, a plan you edit with `Ctrl+G`, and code only after you approve it                             |
| Provide specific context            | Describe the issue from memory                                               | `gh issue view 1` and the named code paths, plus constraints in the prompt: keep visibility rules, no new tables |
| Let Claude use CLI tools            | Copy the diff and write the PR by hand                                       | Claude commits and opens the pull request with `gh`, and it links the issue                                      |
