#!/usr/bin/env bash
set -euo pipefail

repo_root() { git rev-parse --show-toplevel 2>/dev/null || pwd; }
UPSTREAM="${COPPERLINE_UPSTREAM:-https://github.com/WWT-AINE-Workshops/workshop-claude-code-advanced.git}"
FAILED=0

ok() { printf '✅ %s\n' "$1"; }
warn() { printf '⚠️  %s — %s\n' "$1" "$2"; }
fail_check() { printf '❌ %s — %s\n' "$1" "$2"; FAILED=1; }
die() { printf '%s\n' "$1" >&2; exit 1; }

version_ge() {
  [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}
