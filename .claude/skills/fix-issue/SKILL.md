---
name: fix-issue
description: Fix a GitHub issue in Copperline end to end
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS in this repository.

1. Run `gh issue view $ARGUMENTS` and read the issue and its comments.
2. Find the code involved. Explain the root cause in two or three sentences before changing anything.
3. Write a failing test that reproduces the issue (`apps/api/test/` for API issues, `apps/web/test/` for UI) and run it to confirm it fails.
4. Make the smallest change that fixes the root cause.
5. Run `npm test`, `npm run lint` and `npm run typecheck`; fix anything that fails.
6. Commit with a Conventional Commit message that ends with `Fixes #$ARGUMENTS`.
7. Push the branch and open a pull request with `gh pr create --fill`.
