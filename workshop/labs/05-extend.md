# Lab 5: Extend Claude Code

**SDLC phase:** Build; Secure and Release · **Stage:** AI-Integrated · **Time:** 15 minutes

## Why this matters

So far you have told Claude what to do in each prompt. Claude Code also lets you set things up once, so they hold for every session and every teammate who clones the repo. Each piece lives in a file you can commit:

- **Permissions** decide which commands run without asking.
- **Hooks** are commands that run at set points, so something happens every time.
- **Skills** are saved prompts you start with a slash command.
- **Subagents** are specialists with their own context window and their own tool list.
- **MCP servers** give Claude new tools, such as read access to a database.

In this lab you add one of each to Copperline, then use them to fix issue #4, an invalid request id that returns a 500 instead of a 400. CLAUDE.md can only ask Claude to do something. A hook makes it happen, which is why step 2 is a hook and not another line in CLAUDE.md.

_Adapted from Claude Code docs: Best practices for Claude Code › Configure your environment._

## Before you start

You need the workshop repo cloned as `my-copperline` and `./scripts/check-setup.sh` passing. A rough budget:

| Steps                                                 | Minutes |
| ----------------------------------------------------- | ------- |
| Facilitator demo                                      | 3       |
| 1                                                     | 1       |
| 2                                                     | 2       |
| 3                                                     | 4       |
| 4 (includes the one restart)                          | 3       |
| 5 (the lab drops it if the room is 15 minutes behind) | 2       |

Go to the repo root, then run the reset script, even if you are already at the right place. It puts you on a clean branch called `lab-5`.

```bash
cd my-copperline
```

```bash
./scripts/reset-lab.sh 5
```

What it changes: it switches you to branch `lab-5` at the start of the lab, and it resets the local database to the seed data (8 users, 12 items, 40 requests). If you had committed work on `lab-5` before, it saves that on a branch named `lab-5-backup-<sha>` first. If you have uncommitted changes it stops and lists them. This branch starts from the reference solution to Lab 4, so everyone has the same code. It ends with this line:

```text
You're at the start of Lab 5 on branch lab-5.
```

Start Claude Code at the repo root.

```bash
claude
```

Claude's wording will differ from run to run, so look for the signals each step lists, not exact sentences. Claude may ask you to approve writes under `.claude/`, because that folder holds settings. Approve them.

## Steps

### Step 1: Allow the safe commands

**Do this.** Permission rules go in `.claude/settings.json`, the project settings file you commit. Ask Claude to create it with three allow rules.

```text
Create .claude/settings.json with permissions.allow rules for Bash(npm run test *), Bash(npm run lint) and Bash(git status). Change nothing else.
```

Then open the permissions dialog.

```text
/permissions
```

You can also add and remove rules in this dialog yourself. Here Claude writes the file, so the rules land in the project and not in your personal settings. One more tool belongs in this picture: `/sandbox` turns on a Bash sandbox that limits what shell commands can reach, and it is off until you enable it. You do not need it for this lab.

**What you should see.** A new file `.claude/settings.json` with an `allow` list of those three rules. The dialog lists them, and next to each rule it names the settings file it comes from, which should be the project file.

Rules match the command text. `Bash(npm run test *)` covers `npm run test` followed by arguments, for example `npm run test -w apps/api`. It does not cover `npm test`, which is a different command and still asks in manual mode. Fallback: in auto mode these prompts are already rare. If your organization has turned auto mode off, you start in manual mode, where an allowlist saves you many prompts a day.

**Why.** An allow rule is a decision made once, in a file, and shared. Teammates who clone the repo get the same safe commands without clicking through each prompt.

_Adapted from Claude Code docs: Best practices for Claude Code › Configure permissions._

### Step 2: Add a format hook

**Do this.** Paste this prompt. The hook formats every file Claude edits, with no reminder in a prompt needed.

```text
Add a PostToolUse hook to .claude/settings.json that runs Prettier on any file you edit or write. Put the logic in .claude/hooks/format.mjs; it reads the hook input JSON from stdin, formats tool_input.file_path if it is a .ts, .tsx, .js, .mjs, .json, .css or .md file, and never blocks or fails. Use the exec form of the hook command.
```

When Claude is done, list the hooks.

```text
/hooks
```

Now test it. The prompt asks for a blank line that Prettier removes.

```text
Add a blank line as the first line inside the toId function in apps/api/src/errors.ts. Change nothing else.
```

Then, in a second terminal in the repo folder, check the file.

```bash
git diff apps/api/src/errors.ts
```

**What you should see.** Claude creates `.claude/hooks/format.mjs` and adds a `PostToolUse` entry for `Edit|Write` to `.claude/settings.json`. In the exec form the entry has a `command` of `node` and an `args` list that points at `${CLAUDE_PROJECT_DIR}/.claude/hooks/format.mjs`. `/hooks` is a read-only browser, and it lists the hook and says it comes from the project. After the test edit, `git diff` prints nothing: the hook ran Prettier and removed the blank line, so the file is back as it was.

Fallback: a hook you add to a settings file is normally picked up while you work. If `/hooks` does not list it, quit (press Ctrl+D twice on an empty prompt) and run `claude --continue`.

**Why.** The exec form starts `node` directly with no shell, which is the safe choice when the command has a path placeholder in it. A hook is also deterministic. A CLAUDE.md line asks Claude to format; this hook always does.

_Adapted from Claude Code docs: Best practices for Claude Code › Set up hooks._

### Step 3: Write a skill and use it on issue 4

**Do this.** A skill is a saved prompt. Ask Claude to write one that fixes an issue from start to finish.

```text
Create a skill at .claude/skills/fix-issue/SKILL.md that fixes a GitHub issue end to end: read it with gh, explain the root cause, write a failing test, make the smallest fix, run tests, lint and typecheck, commit with "Fixes #N", push and open a pull request. It should only run when I invoke it, never automatically.
```

Ask Claude to show you the top of the file, and check that the frontmatter has `disable-model-invocation: true`. Because `.claude/skills` is new, tell Claude Code to scan for it.

```text
/reload-skills
```

Now run the skill on issue 4. It may take longer than its slot. If it is still running when time is up, let it finish while you read step 4. If it overruns, accept the local commit without the push or PR. Do not restart in step 4 until it is done.

```text
/fix-issue 4
```

**What you should see.** A folder `.claude/skills/fix-issue/` with a `SKILL.md`. The frontmatter has a `name`, a `description` and `disable-model-invocation: true`, which stops Claude from starting the skill on its own. In the skill, `$ARGUMENTS` stands for the issue number, so `/fix-issue 4` passes `4`.

Then Claude works through the steps. It reads issue 4 with `gh`, finds that `toId` in `apps/api/src/errors.ts` throws a plain `Error`, which becomes a 500, and writes a test that fails for `/api/requests/abc`. The fix makes `toId` parse the id with Zod, so a bad id gives a 400 with `validation_error`. Tests, lint and typecheck pass, the commit ends with `Fixes #4`, and Claude opens a pull request. Your format hook runs after each edit. The pull request diff also shows the reference work from Labs 1 to 4, because your `main` does not have it. That is expected. This step takes a couple of minutes.

**Why.** The skill turns a good prompt into a repeatable command. Setting `disable-model-invocation` keeps a skill that pushes code and opens PRs under your control.

_Adapted from Claude Code docs: Best practices for Claude Code › Create skills._

### Step 4: Add a read-only reviewer

**Do this.** A subagent gets its own context window and only the tools you give it. Paste this prompt.

```text
Create a read-only subagent at .claude/agents/security-reviewer.md with only the Read, Grep and Glob tools that reviews Copperline changes for SQL built from strings, missing visibility checks, unvalidated input and leaked internals, and reports findings with file and line without editing anything.
```

`/agents` does not open a creator any more. It only prints a reminder to ask Claude or to edit the `.claude/agents/` folder, which is what you just did. Because that folder did not exist when your session started, you need one restart for Claude Code to see the new agent. Use it for step 5 as well. Quit (press Ctrl+D twice on an empty prompt), then add the MCP server from the shell at the repo root. Step 5 explains it. If your group drops step 5, this command is harmless.

```bash
claude mcp add --scope project copperline-db -- node tools/db-mcp/dist/index.js
```

Now restart, and continue the same conversation.

```bash
claude --continue
```

Claude Code asks you to approve the new project server at startup. Approve it, or do it in step 5. Then ask for a review.

```text
Use the security-reviewer subagent to review the diff for issue 4.
```

**What you should see.** A file `.claude/agents/security-reviewer.md` with `name`, `description` and `tools: Read, Grep, Glob` in the frontmatter, and a prompt body that lists what to check. After the restart, Claude starts the subagent and you see it working. It reports back with a short review, probably "No issues found" or a few notes, each with a file and line. It does not edit anything, because it has no edit tool.

**Why.** The reviewer reads in its own window, so the review does not fill yours. A read-only tool list is a guarantee, not a request.

_Adapted from Claude Code docs: Best practices for Claude Code › Create custom subagents._

### Step 5: Connect the database over MCP

**Do this.** MCP lets Claude use tools from other programs. Copperline ships a small read-only database server, and the command you ran in step 4 registered it. If you skipped it, the server file must exist first (run `npm run setup` if it does not), then run the command now and restart as in step 4.

```bash
ls tools/db-mcp/dist/index.js
```

If Claude Code asked you at startup to approve the `copperline-db` server, you did that already. Approve it if it did not. Then open the MCP panel.

```text
/mcp
```

Ask a question that only the database can answer.

```text
Using the copperline-db tools, how many pending requests are there per department?
```

**What you should see.** A new file `.mcp.json` at the repo root with a `copperline-db` server that runs `node tools/db-mcp/dist/index.js`. The `--` in the command separates Claude's options from the server's command. `/mcp` lists `copperline-db` as connected, with its tools. Claude asks for approval because the server comes from a project file. Claude then runs a query and answers Engineering 3, Finance 4 and Sales 7, with 14 pending in total. Those counts are for fresh seed data. If you approved or cancelled requests in earlier labs, yours differ. `npm run db:reset -w @copperline/api` puts the seed data back and leaves your branch alone.

**Why.** An MCP server is a doorway, so be deliberate about what you let through. This one is read-only. Commit `.mcp.json` and teammates get the same tool, after they approve it.

_Adapted from Claude Code docs: Best practices for Claude Code › Connect MCP servers._

## You're done when

- `.claude/settings.json` holds your allow rules and the format hook, and `/hooks` lists it.
- `.claude/skills/fix-issue/SKILL.md` and `.claude/agents/security-reviewer.md` exist.
- `/mcp` shows `copperline-db` connected, and you got the per-department counts. If you stopped before step 5, skip this one.
- Issue #4 has a pull request.
- Your setup files are committed. Ask Claude: `Commit .claude/ and .mcp.json together on this branch with a Conventional Commit message.`

Post a ✅ in the workshop chat, or tell a helper. If you are stuck, post a 🆘 with the step number. If your group dropped step 5, post ✅ once the first four are done.

**Badge:** Build; Secure and Release · AI-Integrated.

## If it goes wrong

- **Claude goes off-scope.** If Claude starts changing other files, for example more than `errors.ts` and the new test in step 3, press `Esc`. Then narrow the prompt: `Only change what the skill's steps say.` If it already edited, `git restore .` puts tracked files back.
- **`/hooks` does not list my hook.** Check that `.claude/settings.json` is valid JSON and has a `PostToolUse` entry. Then quit (press Ctrl+D twice on an empty prompt) and run `claude --continue`.
- **`/fix-issue` is not found.** Run `/reload-skills`. Check the file is at `.claude/skills/fix-issue/SKILL.md`, with `fix-issue` as the folder name.
- **The security-reviewer is not available.** The agents folder was new, so restart: press Ctrl+D twice on an empty prompt, then `claude --continue`. Ask Claude to list its subagents to check.
- **`/mcp` shows `copperline-db` as failed.** The server may not be built. Run `npm run setup`, then reconnect it in the `/mcp` panel. Run `claude mcp list` to see its status.
- **`gh issue view 4` fails.** You may not be signed in, or your copy of the repo has no issues yet. Run `gh auth status`, then `./scripts/seed-github.sh`. If you have no GitHub copy, ask Claude to describe the bug itself: `GET /api/requests/abc` should return 400, not 500.
- **I fell behind.** Run `./scripts/reset-lab.sh 5`. It moves you to a clean `lab-5` branch, saves any committed work on a `lab-5-backup-<sha>` branch, and resets the database to the seed data. If you have uncommitted files it stops and lists them. `./scripts/reset-lab.sh 5 --force` discards them. Then compare with the reference solution: `git diff lab-5-start lab-6-start`.

## Stretch goals

- Write a `Stop` hook that blocks the end of a turn until `npm test` passes. If its script returns a block decision with a reason, Claude keeps going and the reason tells it why. After eight blocks in a row, Claude Code ends the turn anyway. The built-in `/goal` is a shortcut for the same idea.
- Bundle the pieces into a local plugin. Open the plugin menu with `/plugin`. A plugin packs skills, subagents, hooks and MCP servers into one unit, and `/reload-plugins` applies changes to a running session.
- Let Claude add `Bash(npm test)` to the allow list, then try to make a deny rule block something dangerous, such as `git push --force`. Deny rules win in every mode.

## Recap

| Practice             | Before                                                                | After                                                                 |
| -------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Permissions          | A prompt for every `npm run test` and `git status`                    | Allow rules in `.claude/settings.json`, shared with the team          |
| Hooks                | "Please format your files" in CLAUDE.md, sometimes followed           | A `PostToolUse` hook formats every edit, every time                   |
| Skills and subagents | A long prompt pasted from a note, and a review that fills your window | `/fix-issue 4`, and a read-only `security-reviewer` that reports back |
| MCP                  | You copy query results into the chat by hand                          | `copperline-db` in `.mcp.json`, so Claude queries the data itself     |
