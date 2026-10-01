#!/usr/bin/env bash
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib/common.sh"
cd "$HERE/.."

command -v claude >/dev/null 2>&1 || die "Claude Code is not installed. Run ./scripts/check-setup.sh"
TMP="$(mktemp -d)"
mkdir -p docs
for file in apps/api/src/routes/*.ts; do
  echo "Inventorying ${file}…"
  claude -p "Read $file. List every HTTP endpoint it registers as a JSON array of objects with keys method, path, file and summary (one sentence). Reply with only the JSON array." \
    --output-format json --allowedTools "Read" --permission-mode dontAsk > "$TMP/$(basename "$file").json" ||
    die "Claude Code could not read $file. Check you're signed in by running: claude"
done
node scripts/lib/merge-inventory.mjs "$TMP" > docs/api-inventory.json.tmp
mv docs/api-inventory.json.tmp docs/api-inventory.json
COUNT="$(node -e 'console.log(JSON.parse(require("fs").readFileSync("docs/api-inventory.json","utf8")).length)')"
FILES="$(ls apps/api/src/routes/*.ts | wc -l | tr -d ' ')"
echo "Wrote docs/api-inventory.json ($COUNT endpoints from $FILES route files)"
