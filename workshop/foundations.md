# Foundations

This chapter covers the ideas behind the workshop, and you can read it before or after the session. The first half is how WWT thinks about building software with AI. The second half is Claude Code, the tool you will use all day.

## AI-Native Engineering at WWT

### The definition

AI-Native Engineering (AINE) is WWT's discipline for building AI into every phase of the software development lifecycle (SDLC). It changes how software is planned, designed, built, tested, secured and operated. It reaches across platform, workflow, operating model and services.

It is not a plugin. Adding an AI tool to your editor changes nothing else. AINE changes how the work gets done.

### The six phases

WWT describes the SDLC in six phases:

1. **Plan.** Define purpose, scope and goals, and check feasibility.
2. **Requirements & Design.** Write down what to build, and work out how to build it.
3. **Build.** Write the code, following the approved design.
4. **Test.** Check that the software works and is free of defects.
5. **Secure & Release.** Confirm security and compliance, then ship to production.
6. **Operate.** Keep the software running, supported and improving.

Secure & Release is one phase on purpose. WWT treats security as part of shipping, not as a step bolted on at the end.

### The four pillars

AINE maps onto those phases as four pillars. Each one is a way of working "differently":

| Pillar                    | Covers phases               |
| ------------------------- | --------------------------- |
| Plan & Design differently | Plan; Requirements & Design |
| Build & Test differently  | Build; Test                 |
| Secure differently        | Secure & Release            |
| Operate differently       | Operate                     |

### The pathway to AI-Native

Teams do not become AI-native in one step. The pathway is a maturity curve, not a checklist, with five stages. A team can sit at any stage while running any SDLC methodology.

| Stage | Name            | What it looks like                                                       | Human role                                                                               |
| ----- | --------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 0     | AI-Aware        | Aware of AI, but with little direction, or only untracked trial efforts. | No consistent adoption yet. A path forward needs to be defined.                          |
| 1     | AI-Assisted     | Engineers use AI coding tools inside their existing workflow.            | The human does the work. AI is a suggestion engine.                                      |
| 2     | AI-Integrated   | AI tooling is formally adopted and wired into standard workflows.        | AI is a standard part of the toolchain. Humans still direct each task.                   |
| 3     | Agent Augmented | Autonomous agents take on multi-step tasks from start to finish.         | Agents do the multi-step work. Humans supervise and hold the quality and security gates. |
| 4     | AI-Native       | AI is the primary producer across the full SDLC.                         | Humans set intent and verify outcomes. AI, often several agents, produces.               |

### The grid: phases by stages

In the full grid, AI-Aware (Stage 0) is a single row that spans all the phases, because it is a starting point and not a way of working in each phase. It is not repeated below. A Stage 0 team is aware of AI but has no consistent practice. Stages 1 to 4 look different in each SDLC phase. Here is what each cell looks like.

| Stage             | Plan                                                          | Requirements & Design                                            | Build                                                         | Test                                                           | Secure & Release                                               | Operate                                                        |
| ----------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| 1 AI-Assisted     | AI helps draft a requirements doc that a human still owns.    | AI summarizes requirements and sketches diagram options.         | Engineers use AI code completion in their existing editor.    | Engineers ask AI to generate test cases for their code.        | AI flags common vulnerabilities before a human submits code.   | Engineers use AI to help diagnose incidents from logs.         |
| 2 AI-Integrated   | AI tools are standard for scoping and feasibility at kickoff. | Design tools generate architecture options at every review.      | AI code generation is wired into the IDE and expected.        | Automated test generation runs in CI on every pull request.    | Automated security scanning is a required gate before release. | AI-assisted monitoring and alerting is standard in production. |
| 3 Agent Augmented | An agent drafts and scores candidate plans for a human.       | An agent drafts full designs. Architects review and approve.     | Agents write and submit features. Engineers review and merge. | An agent writes, runs and triages test failures end to end.    | An agent runs security review. Humans hold the release gate.   | An agent triages incidents. Engineers approve the fixes.       |
| 4 AI-Native       | An agent prioritizes the backlog. A human approves intent.    | Agents turn intent into design and flag trade-offs for sign-off. | Multiple agents build features in parallel. Humans verify.    | Agents test and self-correct continuously. Humans verify risk. | Agents own compliance and deployment. Humans verify intent.    | Agents monitor and tune continuously. Humans set intent.       |

Read down a column to see one phase mature. Read across a row to see one stage over the whole lifecycle. AINE is a curve that runs through every phase.

### Where today's labs sit

Each lab in this workshop carries a badge with an SDLC phase and a stage. Today you work mostly at Stages 2 and 3.

| Lab | Topic                       | SDLC phase              | Stage                            |
| --- | --------------------------- | ----------------------- | -------------------------------- |
| 1   | Onboard to a codebase       | Requirements & Design   | AI-Assisted                      |
| 2   | Explore, plan, code, commit | Plan to Build           | AI-Integrated                    |
| 3   | Give Claude a way to verify | Test                    | AI-Integrated to Agent Augmented |
| 4   | Manage context and sessions | Build                   | Cross-cutting discipline         |
| 5   | Extend Claude Code          | Build; Secure & Release | AI-Integrated                    |
| 6   | Automate and scale          | Test; Secure & Release  | Agent Augmented                  |

### Proof points

These are AINE outcomes across WWT engagements. They show the size of the change.

| Engagement                                | Before          | After                                                |
| ----------------------------------------- | --------------- | ---------------------------------------------------- |
| SAM+ Hub Migration (WWT internal)         | About 2 months  | 1 week (8x), by three developers new to the platform |
| 28-repository bulk upgrade (WWT internal) | 4-week estimate | 4 hours                                              |
| Special Olympics voice AI search          | 6-week estimate | 2 days                                               |

The labs echo each one. Lab 1 is about getting productive in unfamiliar code. Lab 2 takes a feature from question to shipped change. Lab 6 fans work out across many files.

## What Claude Code is

Claude Code is an AI coding agent that works in your project. It reads your code, edits files and runs commands, and you stay in charge of what it may do.

### The agentic loop

Claude works in a loop of three phases: it gathers context, takes action, and verifies the result. The phases blend together. For a bug fix, it might read files, change one, run the tests, see a failure and read more. You can step in at any point.

_Adapted from Claude Code docs: How Claude Code works › The agentic loop._

It uses your real tools: the shell, git, `gh` and your test runner. The work happens in your project, not in a chat window.

### Where it runs

You can use Claude Code in the terminal, in VS Code and JetBrains, in a desktop app and on the web. Every surface runs the same engine. Your `CLAUDE.md` files, settings and MCP servers work in all of them. Today's labs use the terminal, and what you learn carries over.

_Adapted from Claude Code docs: Platforms and integrations › Where to run Claude Code._

### Staying in control

You decide how much freedom Claude has. The permission mode sets that. Press `Shift+Tab` to cycle between modes, and read the status bar to see which one you are in.

| Mode         | What it means                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------- |
| Manual       | Claude asks before most actions that change things. Reads do not prompt.                        |
| Accept edits | File edits and common file commands go ahead without asking. Other actions still prompt.        |
| Plan mode    | Claude reads and answers questions, and changes nothing. The status bar shows "⏸ plan mode on". |
| Auto mode    | Claude runs actions without asking, while background safety checks watch each one.              |

On Claude Code 2.1.283 or later, a new session starts in auto mode. If your organization turned auto mode off, you start in Manual instead. From auto, plan mode is three presses of `Shift+Tab` away, so watch the status bar rather than counting. You can also start in plan mode with `claude --permission-mode plan`.

Two more controls matter just as much:

- **Interrupt.** Press `Esc` to stop Claude mid-task. Your context and the work done so far stay put, and Claude waits for your next instruction.
- **Rewind.** Every prompt creates a checkpoint, and file edits Claude makes can be restored. Press `Esc Esc` on an empty prompt, or type `/rewind`, to go back to an earlier point in the code, the conversation, or both. Checkpoints track only edits Claude makes with its own file tools. Changes made by shell commands such as `rm` or `mv` are not tracked, so check those before you run them.

_Adapted from Claude Code docs: Choose a permission mode › Switch permission modes._

_Adapted from Claude Code docs: How Claude Code works › It's a conversation._

_Adapted from Claude Code docs: How Claude Code works › Undo changes with checkpoints._

### The extension map

Claude Code works out of the box, and you can extend it. Six extension points cover most needs:

| Extension | Use it for                                                             |
| --------- | ---------------------------------------------------------------------- |
| CLAUDE.md | Always-on facts about your project, read at the start of every session |
| Skills    | On-demand knowledge and repeatable workflows                           |
| Hooks     | Rules that must run every time, with no judgment call                  |
| Subagents | Work done in an isolated context that returns a summary                |
| MCP       | Connecting external systems, such as a database or a ticket tracker    |
| Plugins   | Bundling and sharing skills, subagents, hooks and MCP servers          |

You will use several of these in the later labs. One question sorts them. Should this always be true, or only when needed? Always-on facts go in CLAUDE.md. Rules that must always run go in a hook.

_Adapted from Claude Code docs: Extend Claude Code › Match features to your goal._

### The constraint: the context window

Most good Claude Code habits come from one fact. The context window fills up fast, and Claude performs worse as it fills. Everything Claude reads, every command output and every message uses space in it.

That shapes how you work. Ask focused questions, point Claude at the right files, keep instructions short, and check your usage with `/context`. Lab 1 starts here.

_Adapted from Claude Code docs: Best practices for Claude Code › Manage context aggressively._

## Where to go next

Anthropic Academy offers follow-on courses at https://anthropic.skilljar.com:

- _Claude Code 101_
- _Claude Code in Action_
- _Introduction to agent skills_
- _Introduction to subagents_
