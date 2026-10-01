# Participant workbook

Keep this open (or print it) during the session. Each lab has one page. When you reach the checkpoint, tick the boxes, then post a green check in the workshop chat, or an SOS with the step number if you are stuck. Use the reflection prompts in the last minute of a lab, or after the session. Write in the Notes area as you go.

Lab guides are in `workshop/labs/` in your repository. Fell behind? Run `./scripts/reset-lab.sh <lab number>` from the `my-copperline` folder.

---

## Lab 1: Onboard to a codebase

**Badge:** Requirements & Design · AI-Assisted · **Time:** 12 minutes, starting at 0:15

**Goal.** Ask Claude about an unfamiliar codebase, check its sources, and leave a short CLAUDE.md for the next session.

### Checkpoint

- [ ] `CLAUDE.md` is committed on branch `lab-1`.
- [ ] It has 40 lines or fewer.
- [ ] It contains the run, test and lint commands.
- [ ] `/context` lists it among the memory files.

### Reflect

1. Which question taught you the most about Copperline, and how did you check the answer?
2. What did you cut from the generated CLAUDE.md, and why was each line safe to remove?
3. What would you ask Claude on the first day in your own codebase?

### Notes

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Lab 2: Explore, plan, code, commit

**Badge:** Plan → Build · AI-Integrated · **Time:** 18 minutes, starting at 0:27

**Goal.** Take GitHub issue 1 from idea to pull request by exploring, planning, coding and committing in that order.

### Checkpoint

- [ ] A pull request is open that mentions #1. If you have no GitHub copy, the commit is on your local branch instead.
- [ ] `npm test`, `npm run lint` and `npm run typecheck` pass.
- [ ] In the browser, the Pending filter narrows the requests list, and History on request 1 shows a timeline that grows after Ben approves it.

### Reflect

1. What did you change in the plan before approving it, and what would the code have done without that change?
2. Which permission mode did you approve the plan into, and why?
3. Describe a task in your own work where you would skip plan mode.

### Notes

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Lab 3: Give Claude a way to verify

**Badge:** Test · AI-Integrated → Agent Augmented · **Time:** 18 minutes, starting at 0:45

**Goal.** Hand Claude a check it can run, a failing test or a screenshot, so you are not the only test suite.

### Checkpoint

- [ ] The new race test passes, and the existing API suite still passes. The count is at least 60 passing tests, the 59 you started with plus yours.
- [ ] The 800 pixel screenshot matches the mockup: two cards on each of two rows, and no sideways scroll.
- [ ] `git status` shows changes only in `apps/api/src/routes/requests.ts`, one new test file in `apps/api/test`, and `apps/web/src/pages/Dashboard.module.css`.

### Reflect

1. What evidence did Claude show you, and would you have trusted the change without it?
2. Did the fix address the root cause or only the symptom? How could you tell?
3. Which task you do next week could carry a check like this?

### Notes

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Lab 4: Manage context and sessions

**Badge:** Build · Cross-cutting · **Time:** 12 minutes, starting at 1:03

**Goal.** Watch the context window fill, then use each recovery move once.

### Checkpoint

- [ ] You can say where the N+1 is: `listVisibleRequests` in `apps/api/src/repo.ts`, with one `getItemRow` and one `getUserRow` call per row.
- [ ] `/context` showed a visibly larger share after the unscoped prompt, and a visibly smaller one after the rewind or the compact.
- [ ] You resumed `slowness-investigation` and the compacted findings were still there.
- [ ] `git status` shows no changes. This lab does not edit code.
- [ ] If you stopped at step 3: you saw `/context` grow and can say why.

### Reflect

1. What did the context view show after the unscoped prompt, and what shrank it?
2. Which move would you reach for first next time: clear, rewind, subagent or compact? Why?
3. Which of the five failure patterns do you slip into most often?

### Notes

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Lab 5: Extend Claude Code

**Badge:** Build; Secure and Release · AI-Integrated · **Time:** 15 minutes, starting at 1:15

**Goal.** Set up permissions, a hook, a skill, a subagent and an MCP server once, so they hold for every session.

### Checkpoint

- [ ] `.claude/settings.json` holds your allow rules and the format hook, and `/hooks` lists it.
- [ ] `.claude/skills/fix-issue/SKILL.md` and `.claude/agents/security-reviewer.md` exist.
- [ ] `/mcp` shows `copperline-db` connected, and you got the per-department counts. If you stopped before step 5, skip this one.
- [ ] Issue #4 has a pull request.
- [ ] Your setup files are committed. Ask Claude: `Commit .claude/ and .mcp.json together on this branch with a Conventional Commit message.`

### Reflect

1. Which rule belongs in CLAUDE.md, and which belongs in a hook? Why?
2. Which of the five setup pieces would your team use first?
3. What would you never put in the allow list?

### Notes

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Lab 6: Automate and scale

**Badge:** Test; Secure and Release · Agent Augmented · **Time:** 15 minutes, starting at 1:30

**Goal.** Review a pull request with a fresh context, run Claude headless over many files, and run a writer and a reviewer side by side.

### Checkpoint

- [ ] You found at least 2 of the 3 planted defects, and did not flag `searchItems` as a problem.
- [ ] `docs/api-inventory.json` lists 15 endpoints.
- [ ] Two sessions ran at the same time, a writer in the worktree and a reviewer in `my-copperline`.

### Reflect

1. Which defect did the fresh-context review find that you would have missed?
2. Where in your own work would a headless run replace a repeated manual task?
3. What gate would you keep for yourself when Claude writes and another Claude reviews?

### Notes

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Best practices on one page

_Take-home chapter: `workshop/best-practices.md`._

**The constraint behind everything.** The context window fills fast, and Claude does worse as it fills. Keep asking what is in it.

| Group              | The habit                                                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verify             | Give Claude something to run, such as tests, a build or a screenshot, and ask it to show the evidence. Ask for root causes.                                                                    |
| Plan               | Explore, then plan, then code. Use plan mode when the approach is unclear or the change spans files. Skip it when one sentence describes the diff.                                             |
| Be specific        | Name the file, the symptom, the constraint and a pattern to follow. Use `@` to point at files, and paste in screenshots.                                                                       |
| Configure          | CLAUDE.md for what always applies. Permissions to cut prompts. Hooks for what must happen every time. Skills for what applies sometimes. Subagents for heavy reading. MCP for outside systems. |
| Manage the session | `Esc` to stop early. `Esc Esc` or `/rewind` to go back. `/clear` between unrelated tasks. `/compact` with a focus. Name sessions and resume them.                                              |
| Automate and scale | `claude -p` for scripts. Worktrees for parallel sessions. A fresh-context reviewer for a second opinion.                                                                                       |

**Five failure patterns.**

| Pattern                                                 | The fix                                                                    |
| ------------------------------------------------------- | -------------------------------------------------------------------------- |
| The kitchen sink session: unrelated tasks in one window | `/clear` when the topic changes                                            |
| Correcting over and over                                | Stop after two misses, clear, and write one better prompt                  |
| The over-specified CLAUDE.md                            | Cut what Claude can read from the code, and turn must-run rules into hooks |
| The trust-then-verify gap: no way to check the work     | Hand Claude a test or screenshot to run                                    |
| The infinite exploration: an unscoped "find out why"    | Name the files and the symptom, or use a subagent                          |

**Break the rules on purpose.** Let context build when the history is the value. Skip the plan for a one-line change. Stay vague when you want ideas.

---

## Glossary

| Term            | What it means                                                                                                                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agentic         | Claude works in a loop. It gathers context, takes action, then checks the result, and you can interrupt at any point.                                                                                                                                       |
| Checkpoint      | A saved point you can rewind to, with `Esc Esc` or `/rewind`. Checkpoints track only the edits Claude makes with its file-editing tools. Changes made by Bash commands, such as `rm` or `mv`, are not tracked and cannot be rewound.                        |
| CLAUDE.md       | A short project file that Claude reads at the start of every session. It holds what Claude cannot guess from the code, such as commands and team rules.                                                                                                     |
| Context window  | Everything in the current session: your messages, the files Claude opened and command output. It fills up, and Claude does worse as it fills. `/context` shows how full it is.                                                                              |
| Copperline      | The small equipment-request web app you work on in the labs.                                                                                                                                                                                                |
| Headless        | Running Claude Code for one turn with no interactive session, using `claude -p "<prompt>"`. It prints the result, which suits scripts and CI.                                                                                                               |
| Hook            | A command that Claude Code runs automatically at a set point, such as after it edits a file. CLAUDE.md instructions are advisory, but a hook is deterministic: use one for anything that must happen every time.                                            |
| MCP             | Model Context Protocol, a standard way to connect Claude to outside systems such as a database. A project lists its servers in `.mcp.json`.                                                                                                                 |
| Permission mode | The setting that decides how often Claude asks before acting. `Shift+Tab` cycles through the modes, such as manual, accept edits, plan and auto. On Claude Code 2.1.283 and later a new session starts in auto, unless your organization has turned it off. |
| Plan mode       | A mode where Claude reads files and answers questions but changes nothing. Press `Shift+Tab` until the status bar shows `⏸ plan mode on`, or type `/plan`.                                                                                                  |
| PR              | Pull request. A request on GitHub to merge the changes on one branch into another, so that others can review them first.                                                                                                                                    |
| Skill           | A saved set of instructions in a `SKILL.md` file under `.claude/skills/`. Claude loads it when it is relevant, or you run it by name, like `/fix-issue`.                                                                                                    |
| Subagent        | A helper that runs in its own context window with its own tools and returns a summary. Project subagents are Markdown files in `.claude/agents/`.                                                                                                           |
| Worktree        | A second checkout of the same git repository, in another folder on its own branch. Two sessions can work at once without editing the same files. `claude --worktree <name>` creates one.                                                                    |
