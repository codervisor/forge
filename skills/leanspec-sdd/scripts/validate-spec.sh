#!/usr/bin/env bash
# Validate specs using lean-spec CLI
# Usage: bash scripts/validate-spec.sh [--warnings-only]

set -euo pipefail

ARGS="${1:-}"

if command -v lean-spec &> /dev/null; then
  lean-spec validate $ARGS
elif [ -f bin/lean-spec.js ]; then
  node bin/lean-spec.js validate $ARGS
elif [ -f node_modules/.bin/lean-spec ]; then
  npx lean-spec validate $ARGS
else
  echo "⚠️  lean-spec CLI not found. Install with: npm install -g lean-spec"
  exit 1
fi
