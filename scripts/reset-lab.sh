#!/usr/bin/env bash
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib/common.sh"
cd "$HERE/.."

USAGE="Usage: ./scripts/reset-lab.sh <lab number 1-6> [--force]"
N="${1:-}"
[[ "$N" =~ ^[1-6]$ ]] || die "$USAGE"
FORCE=0
[ "${2:-}" = "--force" ] && FORCE=1

TAG="lab-$N-start"
if ! git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "Fetching lab starting points…"
  git fetch --quiet "$UPSTREAM" 'refs/tags/lab-*:refs/tags/lab-*' ||
    die "Could not fetch the lab starting points from $UPSTREAM. Check your network and GitHub access."
fi

if [ -n "$(git status --porcelain)" ]; then
  if [ "$FORCE" = 1 ]; then
    git reset --quiet --hard
    git clean -fdq
  else
    {
      echo "You have uncommitted or untracked changes:"
      git status --short
      echo "Commit or stash them, or run again with --force to throw them away."
    } >&2
    exit 1
  fi
fi

OLD_LOCK="$(git rev-parse -q --verify HEAD:package-lock.json 2>/dev/null || true)"
if OLD_BRANCH="$(git rev-parse -q --verify "refs/heads/lab-$N")" &&
  [ "$OLD_BRANCH" != "$(git rev-parse "$TAG^{commit}")" ] &&
  ! git merge-base --is-ancestor "$OLD_BRANCH" "$TAG"; then
  BACKUP="lab-$N-backup-$(git rev-parse --short "$OLD_BRANCH")"
  git branch -f "$BACKUP" "$OLD_BRANCH"
  echo "Saved your previous lab-$N work on branch $BACKUP."
fi
git switch --quiet -C "lab-$N" "$TAG"
NEW_LOCK="$(git rev-parse -q --verify HEAD:package-lock.json 2>/dev/null || true)"

if [ "${COPPERLINE_SKIP_NPM:-0}" != 1 ]; then
  if [ ! -d node_modules ] || [ "$OLD_LOCK" != "$NEW_LOCK" ]; then npm install --no-audit --no-fund; fi
  npm run setup
fi

echo "You're at the start of Lab $N on branch lab-$N."
