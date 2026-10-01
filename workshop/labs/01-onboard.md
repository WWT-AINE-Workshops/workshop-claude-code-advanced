# Lab 1: Onboard to a codebase

**SDLC phase:** Requirements & Design · **Stage:** AI-Assisted · **Time:** 12 minutes

## Why this matters

On day one in a new codebase you ask a colleague where things are and why they are the way they are. Claude Code can answer both kinds of question, and you do not need to read every file first. It reads the code for you and cites what it read, so you can check it.

Some answers are not in the code at all. They live in the git history, in the commit messages people wrote at the time. Claude can read those too.

At the end you give Claude a short project guide called `CLAUDE.md`, so the next session starts with the knowledge you just gathered. The aim is a short file. A long one is the first of the failure patterns in the best-practices chapter, and you will see it happen in step 6.

_Adapted from Claude Code docs: Best practices for Claude Code › Ask codebase questions; Write an effective CLAUDE.md._

## Before you start

You need the workshop repo cloned as `my-copperline` and `./scripts/check-setup.sh` passing. This lab is about 12 minutes. A rough budget:

| Steps            | Minutes |
| ---------------- | ------- |
| Facilitator demo | 3       |
| 1 to 3           | 3       |
| 4                | 1       |
| 5 and 6          | 3       |
| 7 to 9           | 2       |

Go to the repo root, then run the reset script, even if you are already at the right place. It puts you on a clean branch called `lab-1`.

```bash
cd my-copperline
```

```bash
./scripts/reset-lab.sh 1
```

What it changes: it switches you to branch `lab-1` at the start of the lab, and it resets the local database to the seed data (8 users, 12 items, 40 requests). If you had committed work on `lab-1` before, it saves that on a branch named `lab-1-backup-<sha>` first. If you have uncommitted changes it stops and lists them. It ends with this line:

```text
You're at the start of Lab 1 on branch lab-1.
```

If you have never used Claude Code, you do not need to know anything else. Each step says what it teaches. Claude's wording will differ from run to run, so look for the signals each step lists, not exact sentences.

## Steps

### Step 1: Start Claude Code at the repo root

**Do this.** Check that you are at the repo root, then start Claude Code.

```bash
pwd
```

The path it prints should end in `my-copperline`. If it does not, run `cd my-copperline` first.

```bash
claude
```

The first time you start Claude Code in a folder, it asks whether you trust the files in it. This is your own copy of the repo, so choose yes.

**What you should see.** The Claude Code prompt appears, ready for you to type. If you did not just run the reset script, run `git branch --show-current` first. It should print `lab-1`.

**Why.** Claude Code treats the folder you start it in as the project, so the repo root is the right place to begin.

_Adapted from Claude Code docs: Security › Additional safeguards._

### Step 2: Ask for a tour

**Do this.** Ask the question you would ask a colleague in your first hour. Paste this prompt.

```text
Give me a tour of this repository: what are the main parts, how does a request from the web app reach the database, and where would I add a new API endpoint?
```

**What you should see.** Claude reads a handful of files, then answers. Look for these names: `apps/web`, the API routes and `repo.ts` under `apps/api`, `packages/shared`, `apps/vendor-stub` and `tools/db-mcp`. It should trace a request from the web app, through an API route, to the database queries in `repo.ts`. Open one of the files it named and check one claim.

**Why.** Direct questions are enough. You do not need to read the code first, and you get a map you can verify.

### Step 3: Point at a file with `@`

**Do this.** Type `@` followed by a path to make Claude read that file before it answers. Paste this prompt, or type the `@` part by hand and pick the file from the list that appears.

```text
Explain what @apps/api/src/vendor.ts does when the vendor is slow, rate-limited or down.
```

**What you should see.** A description of three behaviours: the price cache, the stale cache that is served when the vendor fails, and the fallback to the catalog cost when there is no cached price at all. Claude names the file and, usually, the functions it read.

**Why.** Pointing at the file removes the guessing, so Claude spends its effort on your question instead of on finding the code.

_Adapted from Claude Code docs: Best practices for Claude Code › Provide specific context in your prompts._

### Step 4: Ask a "why" question that only history can answer

**Do this.** The code says what happens, but not why. Ask Claude to read the git history. Paste this prompt.

```text
Why does the API cache vendor prices? Look at the git history, not just the code, and tell me which commit explains it.
```

**What you should see.** Claude runs git commands such as `git log` on the file. The answer names the vendor's rate limit of 5 requests per 10 seconds after the March catalog import, the ticket OPS-412, and the commit "feat(api): cache vendor prices for an hour". None of that is written in the code, so if you see it, Claude really read the history.

If you have time, try one of these follow-ups. Each is answered by a different commit.

```text
Why does the API trust an X-User-Id header for authentication?
```

```text
Why does request_events exist when nothing in the app shows it?
```

The first leads to IAM-2291, the second to IA-2026-07.

**Why.** Commit messages hold the reasons behind the code. Tell Claude to look there when you ask "why".

### Step 5: Generate a CLAUDE.md

**Do this.** Run this command inside Claude Code. It reads the repo and drafts a project guide.

```text
/init
```

**What you should see.** A file named `CLAUDE.md` appears in the repo root. Depending on your permission mode, Claude may ask you to approve the write, or it may just write the file. Skim it, but do not edit it by hand yet.

**Why.** `CLAUDE.md` is read at the start of every session, so Claude starts each one already knowing your project. `/init` gives you a first draft.

_Adapted from Claude Code docs: Best practices for Claude Code › Write an effective CLAUDE.md._

### Step 6: Prune it

**Do this.** Here is the trap. A generated file tends to describe everything it can see: every folder, every file, how to write TypeScript. Most of that Claude can read from the code or from `package.json`. If the file grows long, important rules get lost in the noise and Claude starts to ignore parts of it. That is the over-specified CLAUDE.md pattern from the best-practices chapter.

The cure is to keep only what Claude cannot work out for itself: commands, conventions and gotchas. Paste this prompt.

```text
Edit CLAUDE.md so it only contains what you could not work out by reading the code: commands, conventions, gotchas. Remove anything you can infer from package.json or the code. Keep it under 40 lines, and say that workshop/, logs/ and scripts/ are workshop material, not app code.
```

Then count the lines in your file.

```bash
wc -l CLAUDE.md
```

Last, compare with the reference version kept in the repo for this purpose.

```bash
git show lab-2-start:CLAUDE.md
```

**What you should see.** `wc -l` prints a number of 40 or less, then the filename. The reference is 32 lines. For each line in your file, ask: would Claude make a mistake without it? The reference keeps the run, test and lint commands, the fake auth header, the test helpers, the error convention and the "not app code" note. It leaves out file-by-file descriptions and generic style advice. Your file will differ, and that is fine. The reference is one good answer, not the only one. Check that yours has the commands and the "not app code" note, and that it has no long lists of files.

**Why.** Short files get followed. Cutting lines Claude can read from the code is what keeps the important ones noticed.

_Adapted from Claude Code docs: Best practices for Claude Code › Avoid common failure patterns._

### Step 7: Confirm it loaded

**Do this.** Run this command inside Claude Code.

```text
/context
```

**What you should see.** A coloured grid showing what fills the context window right now, with a list of memory files. `CLAUDE.md` is on that list. Look at how large a slice it takes compared with the rest. A short file is a small slice, and a long one would be a bigger one on every turn.

**Why.** The context window is the resource you are managing, and `/context` shows what is using it.

_Adapted from Claude Code docs: How Claude remembers your project › View and edit with /memory._

### Step 8: Add a personal preference

**Do this.** Run this command, pick the user memory file from the list, and add one line in the editor that opens. For example: `Keep answers short and include file paths.` Save and close the file.

```text
/memory
```

**What you should see.** A list of memory files at the user and project levels. The user file is `~/.claude/CLAUDE.md`. If it does not exist yet, picking it creates it. You do not commit this file, because it lives in your home folder and not in the repo, so `git status` will not show it.

**Why.** The project `CLAUDE.md` is shared with the whole team. The user file is only for you and applies to every project, so personal habits go there.

_Adapted from Claude Code docs: How Claude remembers your project › Choose where to put CLAUDE.md files._

### Step 9: Commit

**Do this.** Ask Claude to commit the file. Paste this prompt.

```text
Commit CLAUDE.md with a Conventional Commit message.
```

If you would rather do it yourself, these two commands do the same thing.

```bash
git add CLAUDE.md
```

```bash
git commit -m "docs: add CLAUDE.md"
```

**What you should see.** A new commit on `lab-1` that adds only `CLAUDE.md`. In the command-line version, git reports one file changed and the number of lines you counted in step 6. A Conventional Commit message looks like `docs: add CLAUDE.md`, with a type, a colon and a short summary. Check with `git log --oneline -1`.

**Why.** Committing it means everyone who clones the repo gets the same project guide.

## You're done when

- `CLAUDE.md` is committed on branch `lab-1`.
- It has 40 lines or fewer.
- It contains the run, test and lint commands.
- `/context` lists it among the memory files.

Post a ✅ in the workshop chat, or tell a helper. If you are stuck, post a 🆘 with the step number.

## If it goes wrong

- **Claude goes off-scope.** If it starts reading dozens of files, or writing code you did not ask for, press `Esc`. Claude stops and keeps what you have talked about so far. Then narrow the prompt, for example by naming the folder or file you care about.
- **`claude: command not found`.** The install folder is probably not on your PATH. Open a new terminal window and try again. Run `./scripts/check-setup.sh` to see what it reports.
- **`reset-lab.sh` stops and lists files.** You have uncommitted changes. Commit or move them, or run `./scripts/reset-lab.sh 1 --force` to discard them.
- **I fell behind.** Run `./scripts/reset-lab.sh 1`. It moves you to a clean `lab-1` branch, saves any committed work on a `lab-1-backup-<sha>` branch, and resets the database to the seed data. Then jump to step 5.
- **Claude's history answer names no commit.** It answered from the code alone. Reply: `Run git log on apps/api/src/vendor.ts and quote the commit message that introduced the cache.`
- **My CLAUDE.md is still over 40 lines.** Reply: `Cut it to under 40 lines. Remove every line that describes a file or folder you could find by listing the repo.`
- **My answers look different from the guide.** That is normal. Judge them by the signals listed in each step, not by the exact wording.

## Stretch goals

- Add an import to `CLAUDE.md` with `@path`, for example a line that points at `package.json`. Imported files load at launch too, so this organises a file but does not save context.
- Create `apps/web/CLAUDE.md` with two rules that apply only to the web app. Create it from your shell, not through Claude. It loads when Claude reads or edits a file under `apps/web`, so it does not appear in `/context` straight away. Ask Claude to read a web file and watch for a line saying it loaded.
- Ask the two "why" questions from step 4 that you skipped, and check each answer against the commit it names.

## Recap

| Practice                     | Before                                                         | After                                                                                         |
| ---------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Ask codebase questions       | Read files one by one to find out how it fits together         | Ask the questions you would ask a colleague, and open the files Claude names to check         |
| Point to sources             | "How does vendor pricing work?" and hope Claude finds the code | Point at `@apps/api/src/vendor.ts`, and say "look at the git history" for a "why"             |
| Write an effective CLAUDE.md | A long generated file that Claude partly ignores               | A file of 40 lines or fewer with commands, conventions and gotchas, confirmed with `/context` |
