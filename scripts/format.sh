#!/bin/bash
# Format script with parameterized mode support
# Usage: ./scripts/format.sh [check]
#
# Modes:
#   default: --write (format files)
#   check:   --check (check formatting)

set -e

MODE="--write"
if [[ "$1" == "check" ]]; then
    MODE="--check"
fi

echo "Running prettier with mode: $MODE"
npx prettier $MODE "src/**/*.{ts,tsx,js,jsx}"