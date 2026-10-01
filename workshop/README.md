# Workshop materials

Welcome to _Claude Code, Hands On_, a 2-hour workshop from World Wide Technology. You will work through six short labs on a real codebase, from your first question to automated review. Everything in this folder is course material. It is not part of the Copperline application.

## Agenda

| Time | Segment                                         | Minutes |
| ---- | ----------------------------------------------- | ------- |
| 0:00 | AI-Native Engineering at WWT                    | 6       |
| 0:06 | What Claude Code is                             | 9       |
| 0:15 | Lab 1: Onboard to a codebase                    | 12      |
| 0:27 | Lab 2: Explore, plan, code, commit              | 18      |
| 0:45 | Lab 3: Give Claude a way to verify              | 18      |
| 1:03 | Lab 4: Manage context and sessions              | 12      |
| 1:15 | Lab 5: Extend Claude Code                       | 15      |
| 1:30 | Lab 6: Automate and scale                       | 15      |
| 1:45 | Best practices and wrap-up, questions and close | 15      |

## Your materials

- [Pre-work](pre-work.md) ([Word version](pre-work.docx)): set up your computer before the session.
- [Foundations](foundations.md): the ideas behind the labs. Read it before or after the session.
- [Lab 1: Onboard to a codebase](labs/01-onboard.md) (12 minutes)
- [Lab 2: Explore, plan, code, commit](labs/02-explore-plan-code.md) (18 minutes)
- [Lab 3: Give Claude a way to verify](labs/03-verify.md) (18 minutes)
- [Lab 4: Manage context and sessions](labs/04-context.md) (12 minutes)
- [Lab 5: Extend Claude Code](labs/05-extend.md) (15 minutes)
- [Lab 6: Automate and scale](labs/06-automate.md) (15 minutes)
- [Best practices](best-practices.md): a take-home reference for working with Claude Code.
- [Workbook](workbook.md) ([Word version](workbook.docx)): notes and exercises to fill in as you go.
- [Slides](slides.pptx): the deck from the session.

## Scripts

| Script                       | What it does                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `scripts/check-setup.sh`     | Checks your computer has everything the labs need and tells you how to fix anything missing     |
| `scripts/seed-github.sh`     | Creates the workshop issues and the Search v2 draft pull request in your copy of the repository |
| `scripts/reset-lab.sh <n>`   | Moves you to the start of lab `n` on a fresh branch                                             |
| `scripts/route-inventory.sh` | Lab 6: runs Claude Code headless over every API route file                                      |

Fell behind? `./scripts/reset-lab.sh <lab number>` puts you at the start of any lab.

## Next steps

Anthropic Academy has follow-on courses at https://anthropic.skilljar.com:

- Claude Code 101
- Claude Code in Action
- Introduction to agent skills
- Introduction to subagents
