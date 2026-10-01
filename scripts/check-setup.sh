#!/usr/bin/env bash
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib/common.sh"
set +e
source "$HERE/lib/versions.env"
cd "$HERE/.."

LIVE=0
[ "${1:-}" = "--live" ] && LIVE=1
OS="$(uname -s)"
hint() { if [ "$OS" = "Darwin" ]; then echo "$1"; else echo "$2"; fi; }

NODE_HINT="install Node 24 LTS (24.15 or later) from https://nodejs.org/en/download, then open a new terminal"
[ "$OS" = "Darwin" ] && NODE_HINT="$NODE_HINT (or: brew install node@24 && brew link --overwrite --force node@24)"

echo "Checking your computer for the Claude Code workshop…"
echo

if command -v node >/dev/null 2>&1; then
  NODE_V="$(node -p process.versions.node 2>/dev/null)"
  MAJOR="${NODE_V%%.*}"
  if [ -z "$NODE_V" ]; then
    fail_check "Could not read the Node.js version" "$NODE_HINT"
  elif { [ "$MAJOR" = 22 ] && version_ge "$NODE_V" 22.22.2; } || { [ "$MAJOR" = 24 ] && version_ge "$NODE_V" 24.15.0; } || [ "$MAJOR" -ge 26 ] 2>/dev/null; then
    ok "Node.js $NODE_V"
  else
    fail_check "Node.js $NODE_V is not supported" "$NODE_HINT"
  fi
else
  fail_check "Node.js not found" "$NODE_HINT"
fi

if command -v npm >/dev/null 2>&1; then ok "npm $(npm --version)"; else fail_check "npm not found" "it comes with Node.js; reinstall Node 24 LTS"; fi

if command -v git >/dev/null 2>&1; then
  GIT_V="$(git --version | awk '{print $3}')"
  if version_ge "$GIT_V" "$GIT_MIN_VERSION"; then ok "git $GIT_V"; else fail_check "git $GIT_V is too old (need $GIT_MIN_VERSION+)" "$(hint 'brew install git' 'sudo apt-get install git')"; fi
else
  fail_check "git not found" "$(hint 'xcode-select --install' 'sudo apt-get install git')"
fi

if command -v claude >/dev/null 2>&1; then
  CLAUDE_V="$(claude --version 2>/dev/null | awk '{print $1}')"
  if [ -z "$CLAUDE_V" ]; then
    fail_check "Could not read the Claude Code version" "install it: curl -fsSL https://claude.ai/install.sh | bash"
  elif version_ge "$CLAUDE_V" "$CLAUDE_MIN_VERSION"; then
    ok "Claude Code $CLAUDE_V"
  else
    fail_check "Claude Code $CLAUDE_V is older than $CLAUDE_MIN_VERSION" "run: claude update"
  fi
  if [ "$LIVE" = 1 ]; then
    out="$(claude -p "Reply with exactly: OK" --max-turns 1 2>&1)"
    if printf '%s\n' "$out" | grep -qw OK; then ok "Claude Code is signed in"
    else fail_check "Claude Code is installed but not signed in" "run claude and sign in, then run this again"; fi
  fi
else
  fail_check "Claude Code not found" "install it: curl -fsSL https://claude.ai/install.sh | bash"
fi

if [ -d node_modules ]; then
  if node scripts/lib/playwright-path.cjs >/dev/null 2>&1; then ok "Playwright Chromium"
  else fail_check "Playwright Chromium not installed" "run: $(hint 'npx playwright install chromium' 'npx playwright install --with-deps chromium')"; fi
else
  warn "Playwright Chromium not checked" "run npm install first, then run this again"
fi

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then ok "GitHub CLI signed in"
  else fail_check "GitHub CLI (gh) not signed in" "run: gh auth login (needed to create your copy and for Labs 2, 5 and 6)"; fi
else
  fail_check "GitHub CLI (gh) not found" "$(hint 'brew install gh' 'see https://cli.github.com'), then gh auth login (needed to create your copy and for Labs 2, 5 and 6)"
fi

if command -v git >/dev/null 2>&1; then
  if [ -z "$(git config user.name 2>/dev/null)" ] || [ -z "$(git config user.email 2>/dev/null)" ]; then
    warn "git doesn't know who you are" 'run: git config --global user.name "Your Name" && git config --global user.email you@example.com'
  fi
fi

for port in 3001 4010 5173; do
  if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    warn "Port $port is in use" "stop whatever is using it before npm run dev"
  fi
done

echo
if [ "$FAILED" = 0 ]; then echo "Ready for the workshop."; exit 0; fi
echo "Fix the ❌ items above, then run this again."
exit 1
