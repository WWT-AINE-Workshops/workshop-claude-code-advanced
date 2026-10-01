# Best practices for Claude Code

This take-home guide is a checklist of the habits behind the six labs. Each section points to the lab step where you tried it. Examples use Copperline, the labs' equipment request portal.

## 1. The constraint behind everything: context

Almost every practice below comes from one fact. Claude's context window fills up fast, and Claude does worse as it fills. The window holds your messages, each file Claude opens and all command output. One bug hunt can use tens of thousands of tokens. Run `/context` to see what is in there, and keep asking whether Claude needs it.

_Adapted from Claude Code docs: Best practices for Claude Code (introduction)._

_In the workshop:_ Lab 1, step 7 (check what CLAUDE.md costs) and Lab 4, step 3 (watch an unscoped prompt fill the window).

## 2. Give Claude a way to verify its work

Left alone, Claude finishes when its own work seems complete. With nothing to run, that impression is its only evidence, so you end up playing test suite and catching each slip by eye.

Pick whatever gives a clear pass or fail. A test run, a build, a linter or a screenshot compared with a mockup all work. Then ask Claude to show you the output, not to tell you it worked.

|        | Prompt                                                                                                                                                   |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Before | `Fix the double-approval bug.`                                                                                                                           |
| After  | `Write a Vitest test where two approvals race for the last unit of item 9. Show me it fails, fix the root cause, then show me the full API test output.` |

Match the strength of the check to the size of the job. For one task, name the check in the prompt. To keep Claude working over several turns until it holds, set it as a `/goal` condition. If your version has no `/goal`, a Stop hook that runs your script and refuses to let the turn end until it passes does the same job. Also ask for root causes: "don't just clamp the stock at zero" rules out a symptom-only fix.

_Adapted from Claude Code docs: Best practices for Claude Code › Give Claude a way to verify its work._

_In the workshop:_ Lab 3, steps 1 to 3 (test first, root-cause fix, evidence), Lab 3, steps 4 and 5 (screenshot against a mockup), Lab 3, step 6 (`/goal`) and Lab 5 stretch (Stop hook).

## 3. Explore, then plan, then code

If Claude starts coding straight away, it may solve the wrong problem. Split the work into four phases: explore, plan, implement, commit. Plan mode covers the first two. Cycle modes with `Shift+Tab` until the status bar reads `⏸ plan mode on`, or type `/plan`. In that mode Claude reads and answers but edits nothing. Press `Ctrl+G` on a plan to edit it in your own editor before you approve.

Planning has a cost. Use it when the approach is unclear, the change spans several files or the code is unfamiliar. Skip it when you could describe the whole diff in one sentence.

|        | Prompt                                                                                                                                                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Before | `Add the request history feature.`                                                                                                                                                                                                            |
| After  | `Read issue 1 with gh. Look at how GET /api/requests lists requests and where request_events rows are written. Don't change anything yet.` Then: `Plan the change across shared types, the API and the web app. List the tests you will add.` |

_Adapted from Claude Code docs: Best practices for Claude Code › Explore first, then plan, then code._

_In the workshop:_ Lab 2, steps 2 to 5 (enter plan mode, explore, plan, edit the plan) and Lab 2, step 9 (when to skip it).

## 4. Provide specific context

The more precise your prompt, the fewer corrections you need. Name the file, the scenario, the constraint, and an existing pattern to follow. Describe a bug as a symptom, a likely location and what "fixed" looks like. For a "why" question, point at the git history.

|        | Prompt                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------- |
| Before | `Why does pricing sometimes return old numbers?`                                                  |
| After  | `Check the git history of apps/api/src/vendor.ts and name the commit that added the price cache.` |

Rich content helps too. Use `@` to point at a file, so Claude reads it first. Paste or drag in screenshots and mockups. Give URLs for documentation, pipe in a log through `claude -p`, or tell Claude to fetch what it needs.

_Adapted from Claude Code docs: Best practices for Claude Code › Provide specific context in your prompts._

_In the workshop:_ Lab 1, steps 3 and 4 (`@` and a history question), Lab 3, step 5 (mockup plus screenshot) and Lab 4, step 6 (a scoped investigation).

## 5. Configure your environment

A few one-time setup steps pay off in every later session. To pick the right one, ask whether the rule should always apply, apply only sometimes, or run with no exceptions.

**CLAUDE.md** is for facts that always apply. Claude reads it at the start of every session. Run `/init` for a first draft, then cut hard. Keep what Claude cannot guess, such as commands, unusual style rules, test instructions and gotchas. Remove what it can learn from the code. Commit it, and confirm it loaded with `/context`.

**Permissions** cut the approval prompts. Allow the commands you trust with `/permissions`, for example `npm run test *`. `/sandbox` limits what shell commands can reach. On Claude Code 2.1.283 and later a new session starts in auto mode, where a separate classifier model reviews actions and blocks the risky ones. Your organization may turn auto off, in which case you start in manual mode.

**CLI tools** are the lightest way to reach outside systems. With `gh` installed, Claude can read issues and open pull requests. It can also learn a new CLI from its help output.

**MCP servers** connect Claude to systems it cannot reach any other way, such as a database. `claude mcp add --scope project` records the server in `.mcp.json`, which your team can commit. Use `/mcp` to check status.

**Hooks** are for actions that must happen every time. CLAUDE.md is advice that Claude may weigh against other things. A hook is deterministic. Claude can write one for you, and `/hooks` shows what is set up.

**Skills** hold knowledge or workflows that apply only sometimes. A skill is a `SKILL.md` file in `.claude/skills/`. Claude loads it when relevant, or you run it yourself, like `/fix-issue 4`. Set `disable-model-invocation: true` on a workflow with side effects so that only you can start it.

**Subagents** are specialists in `.claude/agents/`. Each runs in its own context with its own tools, which suits heavy reading or a read-only reviewer.

**Plugins** bundle skills, subagents, hooks and MCP servers into one installable unit. Browse with `/plugin`.

|        | Setup                                                                                     |
| ------ | ----------------------------------------------------------------------------------------- |
| Before | CLAUDE.md says "always run Prettier after editing", and Claude forgets it half the time.  |
| After  | A `PostToolUse` hook formats every file Claude edits. CLAUDE.md no longer needs the line. |

_Adapted from Claude Code docs: Best practices for Claude Code › Configure your environment._

_In the workshop:_ Lab 1, steps 5 to 7 (CLAUDE.md), Lab 5, step 1 (permissions), Lab 5, step 2 (hook), Lab 5, step 3 (skill), Lab 5, step 4 (subagent) and Lab 5, step 5 (MCP).

## 6. Communicate: ask questions, and let Claude interview you

Ask Claude what you would ask a senior colleague in your first week. How does a request get from the web app to the database? Where would a new endpoint go? Direct questions are enough.

For a larger feature, flip the roles. Give a short description and ask Claude to interview you with the `AskUserQuestion` tool. It asks about edge cases, trade-offs and design choices you may not have thought of, then writes the answers to a `SPEC.md`. Then build from that file in a fresh session, which starts with a clean window. Write the spec so it stands alone: name the files, say what is out of scope, and end with a check that proves the feature works.

```text
I want to filter Copperline requests by item category. Interview me with the AskUserQuestion tool about the API, the UI, edge cases and trade-offs. Skip the obvious questions. When we are done, write the spec to SPEC.md.
```

_Adapted from Claude Code docs: Best practices for Claude Code › Communicate effectively._

_In the workshop:_ Lab 1, steps 2 to 4 (questions about the codebase) and Lab 2 stretch (the interview prompt).

## 7. Manage your session

A conversation is persistent and reversible. Use both properties.

**Course-correct early.** Press `Esc` the moment Claude heads the wrong way. It stops and keeps your context. Press `Esc Esc` or run `/rewind` to go back to an earlier point, restoring the code, the conversation or both. If you have corrected the same mistake twice, stop. The window now holds failed attempts. Run `/clear` and write a better first prompt using what you learned.

**Manage context on purpose.** Use `/clear` between unrelated tasks. Claude Code compacts automatically near the limit. You can steer it with `/compact Focus on the N+1 finding`, or by adding a compaction instruction to CLAUDE.md. For a quick question that should not stay in the conversation, use `/btw`. If your version has no `/btw`, ask normally and accept the context cost.

**Use checkpoints as a safety net.** Every prompt creates one, which makes it cheap to try something risky. They cover Claude's own file edits, not shell commands like `rm`, and they do not replace git.

**Resume work.** Name a session with `/rename`, and treat it like a branch. Run `claude --continue` for the latest one, or `claude --resume` to pick from a list.

|        | Prompt                                                                                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Before | `The app is slow. Investigate why.`                                                                                                                                                                |
| After  | `Use a subagent to investigate why GET /api/requests gets slower. Start from logs/api-2026-09.log and apps/api/src/repo.ts. Report the cause with file and function names. Don't change any code.` |

_Adapted from Claude Code docs: Best practices for Claude Code › Manage your session._

_In the workshop:_ Lab 4, steps 1 to 8, in order: `/clear`, an unscoped prompt, `Esc` with `/context`, `/btw`, `/rewind`, a subagent, `/compact`, then `/rename` and `claude --resume`.

## 8. Automate and scale

Once one session works well, you can run more. More automation calls for a stronger check.

**Non-interactive mode.** `claude -p "<prompt>"` runs a single turn and prints the result, which suits scripts and CI. Add `--output-format json` for parseable output.

**Fan out.** To repeat a task over many files, loop over them in a script and call `claude -p` once per file, with `--allowedTools` to pre-approve what it needs and `--permission-mode dontAsk` to deny anything else. Test on two or three files first. For a large change inside one repo, `/batch` splits the work across background subagents, each in its own worktree. If your version has no `/batch`, use the `claude -p` loop.

**Parallel sessions.** `claude --worktree <name>` starts Claude in its own checkout, so two sessions never edit the same files. If your version has no `--worktree`, run `git worktree add` and start `claude` in that folder. Agent view (`claude agents`) lists background sessions on one screen. It is a research preview. If your version has no agent view, use several terminal tabs.

**A second opinion.** A fresh-context reviewer judges the diff against your criteria, with no memory of how the change was made. Run `/code-review`, or use two sessions as writer and reviewer. A reviewer told to find gaps will usually find some, so tell it to flag only correctness or requirement gaps.

|        | Prompt                                                                                                                                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Before | In the same session that wrote the fix: `Is your fix good?`                                                                                                                                                            |
| After  | The writer works in a separate worktree. In the main checkout, a second session: `Review the latest commit on the fix-injection branch. Is the injection fixed? Did anything else change? Flag only correctness gaps.` |

_Adapted from Claude Code docs: Best practices for Claude Code › Automate and scale; Add an adversarial review step._

_In the workshop:_ Lab 6, steps 1 and 2 (`/code-review` and a custom review), Lab 6, step 4 (headless over every route file) and Lab 6, steps 5 and 6 (writer and reviewer in separate worktrees).

## 9. Five failure patterns

Five ways a session goes wrong, with Copperline versions.

| Pattern                      | What it looks like                                                                                                  | Fix                                                                                     | Where you saw it                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------- |
| The kitchen sink session     | You fix the approvals bug, ask about the Catalog page colours, then return to approvals. The window now holds both. | `/clear` when the topic changes.                                                        | Lab 4, steps 1 and 8                        |
| Correcting over and over     | Claude's filter still returns the wrong status, and your fourth tweak makes it worse.                               | Stop after two misses. `/clear`, then write one prompt that includes what you learned.  | Lab 4, step 5 (rewind instead of piling on) |
| The over-specified CLAUDE.md | Copperline's file grows to 200 lines and Claude stops running lint before commits.                                  | Cut lines Claude can read from the code. Turn must-run rules into hooks.                | Lab 1, step 6 and Lab 5, step 2             |
| The trust-then-verify gap    | A cancel-request change looks right, but nobody ran it with a missing item.                                         | Hand Claude a test or screenshot to run. No way to check means it is not ready to ship. | Lab 3, steps 1 to 3                         |
| The infinite exploration     | "Find out why it's slow" sends Claude through a 30,000-line log.                                                    | Name the files and the symptom, or hand it to a subagent.                               | Lab 4, steps 2, 3 and 6                     |

_Adapted from Claude Code docs: Best practices for Claude Code › Avoid common failure patterns._

## 10. Develop your intuition

Treat all of this as defaults, not law. Start by noticing. When a session goes unusually well or badly, jot down the prompt, what was in the context and which mode you used. Over a few weeks you will see your own patterns. Then you will know when to break a rule:

- **Skip the plan.** A one-line typo in the README needs no plan mode. Just ask.
- **Let context build.** If you are chasing the approve race across `repo.ts`, the routes and the tests, the history is the value. Clearing would throw away the trail.
- **Stay vague.** `What would you improve in Catalog.tsx?` is a fine prompt when you want ideas you did not know to ask for.
- **Trust the habit that works for you.** If a different order of steps gets you better results on your team's code, keep it and note why.

_Adapted from Claude Code docs: Best practices for Claude Code › Develop your intuition._

_In the workshop:_ every lab's Recap table, and the discussion at the end of Part 3.
