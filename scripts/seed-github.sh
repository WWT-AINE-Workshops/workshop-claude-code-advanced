#!/usr/bin/env bash
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib/common.sh"
cd "$HERE/.."

DRY=0
[ "${1:-}" = "--dry-run" ] && DRY=1
run() { if [ "$DRY" = 1 ]; then printf '+ %s\n' "$*"; else "$@" >/dev/null; fi; }

command -v gh >/dev/null 2>&1 || die "The GitHub CLI (gh) is not installed. See https://cli.github.com, then run: gh auth login"
gh auth status >/dev/null 2>&1 || die "The GitHub CLI is not signed in. Run: gh auth login"

ORIGIN_URL="$(git config --get remote.origin.url 2>/dev/null || true)"
[ -n "$ORIGIN_URL" ] || die "No origin remote. Follow the README steps to create your own copy first."
REPO="$(printf '%s\n' "$ORIGIN_URL" | sed -E 's#^(https?://([^/@]*@)?[^/]+/|ssh://([^/@]*@)?[^/]+/|[^/@]*@[^:/]+:)##; s#/+$##; s#\.git$##')"
case "$REPO" in
  */*) ;;
  *) die "Could not work out your GitHub repository from the origin remote ($ORIGIN_URL). Follow the README steps to create your own copy first." ;;
esac
if [ "$REPO" = "WWT-AINE-Workshops/workshop-claude-code-advanced" ]; then
  die "This is the workshop repository itself. Create your own copy first (see README.md), then run this inside it."
fi
unreachable() { die "Could not reach GitHub for $REPO. Check: gh auth status"; }
run gh repo set-default "$REPO" || unreachable
echo "Seeding ${REPO}…"

PR_NUMBER="$(gh pr list -R "$REPO" --state all --head search-v2 --json number --jq '.[].number')" || unreachable
if [ -z "$PR_NUMBER" ]; then
  if ! git rev-parse -q --verify refs/tags/search-v2 >/dev/null; then
    git fetch --quiet "$UPSTREAM" "refs/tags/search-v2:refs/tags/search-v2" ||
      die "Could not fetch the Search v2 branch from $UPSTREAM. Check your network and GitHub access, then run this again."
  fi
  git fetch --quiet origin main 2>/dev/null || true
  if ! git merge-base --is-ancestor "$(git rev-parse 'refs/tags/search-v2^{commit}')~1" origin/main 2>/dev/null; then
    die "Your copy doesn't share history with the workshop repository, so the Search v2 pull request can't be opened. Recreate your copy with the steps in README.md (clone, then gh repo create --source .), then run this again."
  fi
fi

while IFS=$'\t' read -r name color description; do
  [ -z "$name" ] && continue
  run gh label create -R "$REPO" "$name" --color "$color" --description "$description" --force
done < scripts/seed/labels.tsv

EXISTING="$(gh issue list -R "$REPO" --state all --limit 200 --json title --jq '.[].title')" || unreachable
for file in scripts/seed/issues/*.md; do
  title="$(sed -n '1s/^title: //p' "$file")"
  labels="$(sed -n '2s/^labels: //p' "$file")"
  body="$(sed '1,3d' "$file" | sed "s#{{REPO}}#$REPO#g")"
  if grep -Fxq -- "$title" <<<"$EXISTING"; then
    echo "  issue already exists: $title"
    continue
  fi
  run gh issue create -R "$REPO" --title "$title" --label "$labels" --body "$body"
  if [ "$DRY" = 1 ]; then echo "  would create issue: $title"; else echo "  created issue: $title"; fi
done

if [ -n "$PR_NUMBER" ]; then
  echo "  Search v2 pull request already exists (#$PR_NUMBER)"
else
  run git push origin --quiet "refs/tags/search-v2^{commit}:refs/heads/search-v2"
  run gh pr create -R "$REPO" --draft --base main --head search-v2 \
    --title "Search v2: search requests by item and justification" \
    --body-file scripts/seed/pr-search-v2.md
  if [ "$DRY" = 1 ]; then echo "  would create draft pull request: Search v2"; else echo "  created draft pull request: Search v2"; fi
fi

if [ "$DRY" = 1 ]; then
  echo "Dry run: nothing was changed."
else
  gh issue list -R "$REPO" --state open
  echo "Seeded. Issues #1–#4 and the Search v2 draft PR are ready."
fi
