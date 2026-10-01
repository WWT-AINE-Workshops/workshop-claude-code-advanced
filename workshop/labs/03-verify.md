# Lab 3: Give Claude a way to verify

**SDLC phase:** Test · **Stage:** AI-Integrated → Agent Augmented · **Time:** 18 minutes

## Why this matters

Claude stops when its work looks done. If it has nothing to run, "looks done" is the only evidence it has, and you become the test suite. That is the trust-then-verify gap: the change reads well, you approve it, and the bug is still there.

The fix is to hand Claude a check it can run, and to ask it to show you the result. In this lab you do that twice with two real issues:

- **Part A (10 minutes), a bug in the API.** Issue 2 says two approvals at the same moment can push stock below zero. You make Claude write a failing test first, fix the root cause, and prove it with the full test run.
- **Part B (8 minutes), a layout bug in the web app.** Issue 3 says the dashboard cards run off the edge of a narrow window. There is no test for how a page looks, so the check is a screenshot that Claude compares with a mockup.

The same habit covers both parts: put the check in the prompt, and ask for the evidence.

_Adapted from Claude Code docs: Best practices for Claude Code › Give Claude a way to verify its work._

## Before you start

You need the workshop repo cloned as `my-copperline` and `./scripts/check-setup.sh` passing. A rough budget:

| Steps              | Minutes |
| ------------------ | ------- |
| Facilitator demo   | 3       |
| 1                  | 3       |
| 2                  | 3       |
| 3 (skip if behind) | 1       |
| 4                  | 2       |
| 5                  | 4       |
| 6                  | 2       |

Go to the repo root, then run the reset script, even if you are already at the right place. It puts you on a clean branch called `lab-3`.

```bash
cd my-copperline
```

```bash
./scripts/reset-lab.sh 3
```

What it changes: it switches you to branch `lab-3` at the start of the lab, and it resets the local database to the seed data (8 users, 12 items, 40 requests). If you had committed work on `lab-3` before, it saves that on a branch named `lab-3-backup-<sha>` first. If you have uncommitted changes it stops and lists them. Your Lab 2 work is not lost, but this branch starts from the reference solution to Lab 2, so everyone has the same code. It ends with this line:

```text
You're at the start of Lab 3 on branch lab-3.
```

Start Claude Code in a first terminal at the repo root. You open a second terminal in step 4.

```bash
claude
```

Claude's wording will differ from run to run, so look for the signals each step lists, not exact sentences.

## Steps

### Step 1: Write a failing test first

**Do this.** Paste this prompt. It asks for a test and for proof that the test fails, and it says not to fix anything yet.

```text
Read issue 2 with `gh issue view 2`. Write a Vitest test in apps/api/test that reproduces it: approve requests 1 and 2 at the same time as user 2, using a vendor stub that takes 25 ms to answer, and expect one 200, one 409 and stock 0 for item 9. Run it and show me that it fails. Don't fix anything yet.
```

Claude may ask permission to run `gh`, and then to run the tests. Both are read-only or local, so approve them. Fallback: if you have no GitHub copy of the repo, replace the first sentence with `Read the issue in scripts/seed/issues/02-negative-inventory.md.`

**What you should see.** Claude reads the issue (titled "Inventory can go negative when two approvals overlap"), then looks at the approve route and the existing tests in `apps/api/test`. It adds one new test file there. It runs the API tests and the new test fails. The failure shows that both approvals returned 200, or that stock for item 9 ended at -1, or both. The rest of the suite is untouched: the starting point has 59 API tests in 9 files, and all 59 pass. No source file under `apps/api/src` has changed yet.

**Why.** A test that fails first is proof that the test can catch the bug. If you fix first and write the test after, you only know the test agrees with the fix.

_Adapted from Claude Code docs: Best practices for Claude Code › Give Claude a way to verify its work._

### Step 2: Fix the root cause

**Do this.** Paste this prompt. It rules out the two shortcuts and asks for the full test output.

```text
Now fix the root cause so the test passes. Don't change the test and don't just clamp the stock at zero. Run the whole API test suite and show me the output.
```

**What you should see.** Claude changes the approve route in `apps/api/src/routes/requests.ts`. The usual shape of the fix is a conditional update inside the database transaction: decrease stock only where there is enough of it, and move the request out of pending only where it is still pending. If either update changes no rows, the route returns a 409 conflict. Your test now passes, and the full API run shows all tests green. Expect at least 60 passing tests, which is the 59 you started with plus your new one. Claude may add a second test, so the count can be a little higher. The test file itself should not have changed.

**Why.** The test is the evidence. You do not need to take Claude's word that it is fixed, because you can see the run.

### Step 3: Check the evidence (skip if behind)

**Do this.** Read the diff yourself, or have Claude explain it. In a spare terminal, `git diff` shows it. In Claude Code you can use this prompt instead.

```text
Explain your fix in plain words. What happens if two copies of the API server run against the same database?
```

Look for a fix that removes the cause, and reject the ones that only hide the symptom.

- **Clamping.** Wrapping the stock update in a minimum of zero keeps the number from showing -1, but both approvals still succeed and the second person gets an item that is not there.
- **Swallowing the error.** Catching the failure and returning success hides a problem you were asked to fix.
- **Removing the vendor call.** The call is what makes the two approvals overlap in time, but it is a real requirement. A bug that only shows when the code is slow is still a bug.
- **A lock in memory.** A flag or mutex inside one Node process works on your laptop. It fails as soon as there are two API servers, which is why the question above is worth asking.

**What you should see.** The bug: the handler checks stock, then waits for the vendor price, then writes. Another approval can run during that wait, so the check is stale by the time of the write. A complete fix makes the check and the write one step in the database. Stock goes down only where there is enough of it, and the request moves out of pending only where it is still pending. Claude's explanation should say that the database refuses the second update, so it works across several servers. If Claude chose one of the shortcuts, answer: `That only hides the symptom. Fix the root cause in the database update, and keep the test unchanged.`

**Why.** Passing is necessary but not enough. A test can pass for the wrong reason, so you still read what changed.

_Adapted from Claude Code docs: Best practices for Claude Code › Give Claude a way to verify its work._

### Step 4: Capture the current page

**Do this.** Part B starts here. If `npm run dev` is still running from Lab 2, leave it running and skip this command. Otherwise open a second terminal and start the app. Leave it running.

```bash
cd my-copperline
```

```bash
npm run dev
```

Open a third terminal at the repo root (leave Claude Code running in the first one) and take a screenshot at 800 pixels wide. If you only have two terminals, use the other route: ask Claude to run the command for you, and approve it.

```bash
npm run screenshot -- /dashboard --width 800
```

Open the picture it prints, `.screenshots/dashboard-800.png`.

**What you should see.** The command prints `.screenshots/dashboard-800.png`. In the picture, the four cards (1 Pending requests, 0 Approved this month, 3 Low-stock items, 1 My open requests) sit in one row, and the last card runs past the right edge. The white header bar stops at 800 pixels, but the picture is wider than that, about 1112 pixels. That extra width is the horizontal scroll from issue 3. You can see the picture's size with `file .screenshots/dashboard-800.png`. After the fix in step 5 it is exactly 800 wide.

**Why.** This is the "before". A screenshot gives Claude the same view you have, so it can tell when the page is wrong.

_Adapted from Claude Code docs: Best practices for Claude Code › Give Claude a way to verify its work._

### Step 5: Iterate against the mockup

**Do this.** Go back to Claude Code. Give it the mockup, the current screenshot and a loop: change, screenshot, look, repeat. The `@` before a path makes Claude read that file. For a picture, it looks at the image.

```text
Here is the mockup for issue 3: @workshop/assets/issue-3-mockup.png. Here is the dashboard now at 800px: @.screenshots/dashboard-800.png. Change only the dashboard's styles so it matches the mockup. After each change run `npm run screenshot -- /dashboard --width 800`, look at the new screenshot, and keep going until they match.
```

Claude will ask permission to run the screenshot command, and to edit the file. Approve them.

**What you should see.** Claude compares the two pictures and says the cards need to wrap into two rows of two. It edits one file only, `apps/web/src/pages/Dashboard.module.css`, and runs the screenshot command at least once, then opens the new picture. The new `.screenshots/dashboard-800.png` is 800 pixels wide, with the cards in a 2 by 2 grid: Pending requests and Approved this month on the first row, Low-stock items and My open requests on the second. At a wide window the four cards still sit in one row of four. Run `git status` to confirm that only that one file changed.

Two things are expected and not part of the fix. The header's "Signed in as" menu sits on its own row at 800 pixels, and the mockup shows it that way. The mockup is also 600 pixels tall and your screenshot is taller. Match the layout, not the height.

**Why.** Claude cannot judge a layout from code. With a screenshot it can see the result, compare it with the target and correct itself, which is the loop you would run by hand.

_Adapted from Claude Code docs: Best practices for Claude Code › Give Claude a way to verify its work._

### Step 6: Stretch with `/goal`

**Do this.** Optional. If you have a few minutes, set a condition and let Claude keep working until it holds. This prompt shows the idea. The condition asks Claude to show its output, because the judge only sees what Claude shows in the conversation. Claude should take a fresh screenshot first.

```text
/goal npm test passes and the screenshot file is 800 pixels wide (run `file` on it and show the output)
```

After every turn, a separate model checks whether the condition has been met, and Claude keeps going until it is. `/goal` with no text shows the current goal, and `/goal clear` removes it. Fallback: if `/goal` is not available (your version is older, or hooks are turned off in your organization), put the same two checks in a normal prompt, or use the Stop hook you meet in Lab 5.

**What you should see.** A `◎ /goal active` indicator shows while the goal is set. Claude runs the tests and the screenshot, shows both results, and the goal clears itself when the checks hold. If you already did step 5, this takes a single turn.

**Why.** A goal turns your check into something Claude works toward on its own. You write the finish line once, and you do not repeat it each turn.

_Adapted from Claude Code docs: Keep Claude working toward a goal › Use `/goal`._

## You're done when

- The new race test passes, and the existing API suite still passes. The count is at least 60 passing tests, the 59 you started with plus yours.
- The 800 pixel screenshot matches the mockup: two cards on each of two rows, and no sideways scroll.
- `git status` shows changes only in `apps/api/src/routes/requests.ts`, one new test file in `apps/api/test`, and `apps/web/src/pages/Dashboard.module.css`.
- Your work is committed, so Lab 4 starts clean. Paste this prompt.

  ```text
  Commit these changes with a Conventional Commit message.
  ```

Post a ✅ in the workshop chat, or tell a helper. If you are stuck, post a 🆘 with the step number.

**Badge:** Test · AI-Integrated → Agent Augmented.

## If it goes wrong

- **Claude goes off-scope.** If it rewrites the test, edits the header or the other pages, or starts a big refactor, press `Esc`. Claude stops and keeps the conversation so far. Then narrow the prompt, for example: `Change only apps/web/src/pages/Dashboard.module.css. Leave the rest alone.`
- **The new test passes before any fix.** The test does not make the approvals overlap. Tell Claude that the bug is real, that the vendor stub must take 25 ms, and that both approvals must be started together.
- **The new test fails for another reason.** Ask Claude to show the error. It may be a typo in an import or a missing header for user 2. Fix that first, then check that the failure is about two 200s or stock below zero.
- **`gh issue view 2` fails.** You may not be signed in, or your copy of the repo has no issues yet. Run `gh auth status`, then `./scripts/seed-github.sh`. Or tell Claude to read `scripts/seed/issues/02-negative-inventory.md` instead.
- **`npm run screenshot` says it could not capture the page.** The app is not running. Start `npm run dev` in a second terminal. If it says Chromium is missing, run `npx playwright install chromium`.
- **`npm run dev` says a port is in use.** Another copy of the app is still running. Stop it with Ctrl+C in its terminal, then start again.
- **Claude says the layout matches, but it does not.** Open `.screenshots/dashboard-800.png` yourself and compare it with the mockup. Ask: `Open the latest screenshot and describe the card layout, then compare it with the mockup.`
- **I fell behind.** Run `./scripts/reset-lab.sh 3`. It moves you to a clean `lab-3` branch, saves any committed work on a `lab-3-backup-<sha>` branch, and resets the database to the seed data. If you have uncommitted files it stops and lists them. `./scripts/reset-lab.sh 3 --force` discards them. Then do steps 1 and 2 together, and skip step 3. To see the finished work without building it, run `git diff lab-3-start lab-4-start`.
- **Claude's code differs from this guide.** That is normal. Judge it by the signals in each step.

## Stretch goals

- Ask for a database rule as an extra layer. A `CHECK (stock >= 0)` constraint is a good backstop, but it is not a replacement for the fix in step 2. SQLite cannot add a CHECK to an existing table, so expect Claude to rebuild the `items` table.

  ```text
  Add a new numbered migration in apps/api/migrations/ that enforces stock >= 0. Keep the conditional update from the fix. Then run npm run setup and npm test to confirm nothing broke.
  ```

- Run a review of your change. Type `/code-review` and read what it reports. It runs in the background with its own context, so your conversation stays short.
- Compare your work with the reference solution: `git diff lab-3-start lab-4-start`. What did you do differently?

_Adapted from Claude Code docs: Best practices for Claude Code › Give Claude a way to verify its work._

## Recap

| Practice                              | Before                                                       | After                                                                              |
| ------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Give Claude a way to verify its work  | "Fix the double-approval bug." You read the diff and hope    | A failing test first, the fix, then the full test output shown to you              |
| Ask for root causes, not symptoms     | Stock is clamped at zero and both approvals still succeed    | "Don't just clamp" in the prompt, and a conditional update in the database         |
| Check UI changes against a screenshot | "Make the cards wrap." You open the browser after every edit | A mockup and a screenshot command in the prompt, and Claude loops until they match |
