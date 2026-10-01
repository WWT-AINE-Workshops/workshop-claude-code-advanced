# Lab 4: Manage context and sessions

**SDLC phase:** Build · **Stage:** Cross-cutting · **Time:** 12 minutes

## Why this matters

Everything Claude reads and writes sits in one context window, and the window fills up fast. The fuller it gets, the worse Claude does. So the skill is not a command. It is a habit: notice what is filling the window, and decide what to do about it.

In this lab you cause the problem on purpose, then use each recovery move once:

- **A vague prompt** sends Claude through a large log, and you watch the cost.
- **`/context`** shows what the window holds.
- **`/btw`** answers a side question without keeping it.
- **`/rewind`** takes the whole wandering detour out of the conversation.
- **A subagent** does the reading in its own window and hands back a short report.
- **`/compact`**, **`/rename`** and **`claude --resume`** keep what matters across a long session or a restart.

You will meet two of the docs' failure patterns first-hand: the kitchen sink session (step 1 and step 8) and the infinite exploration (steps 2, 3 and 6). A third, correcting over and over, is what step 5 replaces.

_Adapted from Claude Code docs: Best practices for Claude Code › Avoid common failure patterns._

## Before you start

You need the workshop repo cloned as `my-copperline` and `./scripts/check-setup.sh` passing. A rough budget:

| Steps                                        | Minutes |
| -------------------------------------------- | ------- |
| Facilitator demo                             | 3       |
| 1                                            | 1       |
| 2                                            | 1       |
| 3 (the lab stops here if the room is behind) | 1       |
| 4                                            | 0.5     |
| 5                                            | 1       |
| 6                                            | 2       |
| 7                                            | 1       |
| 8                                            | 1.5     |

Go to the repo root, then run the reset script, even if you are already at the right place. It puts you on a clean branch called `lab-4`. If you finished Lab 3, commit first (or use `--force` to discard).

```bash
cd my-copperline
```

```bash
./scripts/reset-lab.sh 4
```

What it changes: it switches you to branch `lab-4` at the start of the lab, and it resets the local database to the seed data (8 users, 12 items, 40 requests). If you had committed work on `lab-4` before, it saves that on a branch named `lab-4-backup-<sha>` first. If you have uncommitted changes it stops and lists them. This branch starts from the reference solution to Lab 3, so everyone has the same code. It ends with this line:

```text
You're at the start of Lab 4 on branch lab-4.
```

This lab has no code changes to make. The work is in the conversation. Start Claude Code at the repo root. If you kept a session open from Lab 3, you can use it, because step 1 clears it.

```bash
claude
```

Claude's wording will differ from run to run, so look for the signals each step lists, not exact sentences.

## Steps

### Step 1: Start clean

**Do this.** You are about to start a new task, and nothing from the last one belongs in it. Clear the conversation.

```text
/clear
```

**What you should see.** An empty conversation. If you used the same session for Lab 3, everything from it is gone from the window. If you just started `claude`, there was little to clear, but the habit is the point.

**Why.** This is the cure for the kitchen sink session. Debugging approvals, then Catalog colours, then approvals again leaves all three in the window, and each one makes Claude's answers about the others worse. A new task gets a new conversation.

_Adapted from Claude Code docs: Best practices for Claude Code › Manage your session._

### Step 2: Send an unscoped prompt, on purpose

**Do this.** Paste this prompt and let it run. It is vague on purpose. Do not help Claude.

```text
The app is slow. Investigate why.
```

Claude may ask permission to read files or run commands such as `grep`. Approve them. Watch the terminal for about 20 seconds.

**What you should see.** Claude has no file to start from and no symptom to chase, so it casts around. It looks at the code, then finds `logs/api-2026-09.log`, which has 30,000 lines and is 6 MB. It reads or searches the log in several passes, and it may read source files in the API and the web app as well. Tool output scrolls past in large blocks. Each of those blocks is now in the window.

**Why.** This is the infinite exploration. "Find out why it's slow" has no edges, so Claude keeps reading, and every file it reads is paid for in context.

### Step 3: Interrupt and look at the cost

**Do this.** After about 20 seconds, press `Esc` to stop Claude. Then check the window.

```text
/context
```

**What you should see.** `Esc` stops the turn, and Claude keeps the work so far and waits. `/context` draws the window as a colored grid. A visible part of it is now conversation and tool output, much more than the near-empty window you had after step 1. The exact share depends on how far Claude got. If the grid shows suggestions about context-heavy tools, read them.

**Why.** You cannot manage what you cannot see. `/context` turns a vague worry about the window into a number.

_If you are 5 minutes behind, the lab ends here._ Your facilitator will say so. You have seen the failure and how to measure it, and the recovery moves are in the recap and in your copy of this guide.

_Adapted from Claude Code docs: Best practices for Claude Code › Manage your session._

### Step 4: Ask a side question

**Do this.** While you are here, there is a question you want answered, but you do not want it in this conversation.

```text
/btw what's the difference between /clear and /compact?
```

An overlay shows one answer. Dismiss it when you have read it. Fallback: if `/btw` is not available on your version, ask the same question as a normal prompt and accept that it stays in the conversation.

**What you should see.** The answer appears in an overlay, not in the conversation. Run `/context` again if you want to check: the side answer did not add to it. In short, `/clear` throws the conversation away and starts fresh, and `/compact` keeps a summary of it.

**Why.** Small questions should not cost you context. `/btw` sees the conversation so far, so it can answer in context, and then it forgets.

_Adapted from Claude Code docs: Best practices for Claude Code › Manage your session._

### Step 5: Rewind

**Do this.** Now remove the detour. With an empty prompt, press `Esc Esc`, or run `/rewind`. Pick your message `The app is slow. Investigate why.` in the list, then choose "Restore conversation". The menu shows no code option, because nothing was edited. Skip the Summarize entries for now.

```text
/rewind
```

Then check the window again.

```text
/context
```

**What you should see.** The menu lists your earlier messages. After you restore, the conversation goes back to how it was before that prompt, and the log reading is gone. `/context` is back to roughly where it was after step 1. Your old prompt comes back in the input box. Clear it (Ctrl+C, or delete the text) before step 6. If the prompt had text in it when you pressed `Esc Esc`, it clears the text instead of opening the menu, so empty the prompt first.

**Why.** The alternative is correcting over and over: "no, not the web app", "focus on the API", "stop reading everything". Each correction adds more text on top of the failed attempt. Rewind drops the attempt, so your next prompt starts from a clean point.

_Adapted from Claude Code docs: Best practices for Claude Code › Manage your session._

### Step 6: Re-ask with scope and a subagent

**Do this.** Ask the same question again, this time with a starting point, a deliverable and a boundary. The investigation goes to a subagent, which reads in its own window.

```text
Use a subagent to investigate why GET /api/requests gets slower. Start from logs/api-2026-09.log and apps/api/src/repo.ts. Report the cause with the file and function names. Don't change any code.
```

**What you should see.** Claude starts a subagent, and you see it working under the main conversation. It reads the log with searches, not top to bottom, and it reads `repo.ts`. When it finishes, the main conversation gets a short report. A good report says that `GET /api/requests` slows down as `pageSize` grows, and names the cause: an N+1 in `listVisibleRequests` in `apps/api/src/repo.ts`. That function runs one query for the page, then calls `getItemRow` and `getUserRow` once per row. The same pattern is in `listPendingForApprover`, and Claude may mention it. No file changes.

If you want to check the evidence yourself, the log tells the same story. About 4,600 of its 30,000 lines are `GET /api/requests` calls, and the average response time climbs with page size: roughly 190 ms at `pageSize` 10, 350 ms at 20, 960 ms at 50 and 1,900 ms at 100. Every other route stays under 40 ms. Two things are noise: more than half of the lines are `/api/health` checks, and about 800 are `vendor responded 429` warnings that have nothing to do with this. The log is made up for the workshop, and its slowness also grows through the month, which an N+1 alone would not do. If you spot that, you are reading the evidence well.

If Claude does not use a subagent, send `Do that investigation in a subagent.`

**Why.** The subagent has its own context window. It can read thousands of lines, and only its report reaches yours. Run `/context` afterwards: the window grew by a short report, not by a log.

_Adapted from Claude Code docs: Best practices for Claude Code › Manage your session._

### Step 7: Compact with a focus

**Do this.** Keep the finding and drop the rest. Tell `/compact` what matters.

```text
/compact Focus on the N+1 finding and the files involved
```

**What you should see.** Claude summarizes the conversation and replaces it with that summary. Run `/context` and the window is smaller than before. The summary should keep the N+1 in `listVisibleRequests`, the files `apps/api/src/repo.ts` and the log, and the `pageSize` trend. Details that were not part of your focus may be dropped.

**Why.** Claude Code compacts automatically as you approach the limit, but then it chooses what to keep. A focus puts you in charge of that choice.

_Adapted from Claude Code docs: Best practices for Claude Code › Manage your session._

### Step 8: Name, clear and resume

**Do this.** Give the session a name, then clear it, then come back to it from a fresh start.

```text
/rename slowness-investigation
```

```text
/clear
```

Quit Claude Code: press Ctrl+D twice on an empty prompt. Then, from the shell in the same folder, open the session picker.

```bash
claude --resume
```

Pick `slowness-investigation`. You can also skip the picker with `claude --resume slowness-investigation`.

**What you should see.** After `/clear`, the window is empty again and the new conversation is a blank one. The picker lists your sessions, and the one you named is there with its name. When you open it, the compacted summary is back: the N+1 finding, the files and the `pageSize` trend. Ask `What did we find?` if you want proof. The conversation continues exactly where the compact left it.

**Why.** Clearing is cheap when nothing is lost. A name makes a session easy to find, so you can start the next task clean and still return to this one. This is the kitchen sink cure in full: one task, one session, and a name to find it again.

_Adapted from Claude Code docs: Best practices for Claude Code › Manage your session._

## You're done when

- You can say where the N+1 is: `listVisibleRequests` in `apps/api/src/repo.ts`, with one `getItemRow` and one `getUserRow` call per row.
- `/context` showed a visibly larger share after the unscoped prompt, and a visibly smaller one after the rewind or the compact.
- You resumed `slowness-investigation` and the compacted findings were still there.
- `git status` shows no changes. This lab does not edit code.
- If you stopped at step 3: you saw `/context` grow and can say why.

Post a ✅ in the workshop chat, or tell a helper. If you are stuck, post a 🆘 with the step number. If your group stopped at step 3, post ✅ once you have seen `/context` grow.

**Badge:** Build · Cross-cutting.

## If it goes wrong

- **Claude goes off-scope.** If in step 6 it starts editing code or fixing the N+1, press `Esc`. Then narrow the prompt: `Don't change any code. Report only.` If it already edited, `git restore .` puts the files back.
- **`Esc Esc` clears my text instead of opening a menu.** The prompt had text in it. Empty it, or run `/rewind`, which always opens the menu.
- **`/rewind` does not list the message I want.** You may have run `/clear` since. Look at the top of the rewind menu for an entry labeled `/resume <session-id> (previous session)` and select it to go back to the earlier conversation. It stays available until you exit Claude Code. Or run the unscoped prompt again from step 2, or skip to step 6.
- **`claude --resume` shows no session called `slowness-investigation`.** You may have run `claude` in another folder. Resume lists the sessions for the current folder, so `cd my-copperline` first. Or you skipped the `/rename`, so look for the session by its first prompt.
- **I fell behind.** Run `./scripts/reset-lab.sh 4`. It moves you to a clean `lab-4` branch, saves any committed work on a `lab-4-backup-<sha>` branch, and resets the database to the seed data. If you have uncommitted files it stops and lists them. `./scripts/reset-lab.sh 4 --force` discards them. Then start at step 6, because it does not depend on the earlier ones.
- **Claude's answer differs from this guide.** That is normal. Judge it by the signals in each step.

## Stretch goals

- Tell Claude how to compact in CLAUDE.md. Add a "When compacting" section with a line such as "Always keep the full list of files you modified and the exact test commands you ran." Compare it with the reference: `git show lab-5-start:CLAUDE.md`.
- Fix the N+1 with a join of `items` and `users` in the page query, then ask Claude to measure the difference. This is optional, and it goes beyond what the lab needs.

## Recap

| Practice                     | Before                                                                       | After                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Keep the window clean        | One long session mixes tasks and Claude gets worse at all of them            | `/clear` between tasks, and `/compact` with a focus to keep what matters        |
| Scope investigations         | "The app is slow. Investigate why." Claude reads 30,000 lines in your window | A named log, a file, a deliverable, and a subagent that reads in its own window |
| Rewind instead of correcting | Corrections pile on top of a failed attempt                                  | `/rewind` to before the prompt, then one better prompt                          |
| Name and resume              | Yesterday's work is lost or scrolled away                                    | `/rename`, then `claude --resume` to return to it                               |
