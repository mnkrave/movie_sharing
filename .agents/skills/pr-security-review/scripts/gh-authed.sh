#!/usr/bin/env bash
set -euo pipefail

export GH_TOKEN
GH_TOKEN="$(printf "protocol=https\nhost=github.com\n\n" | git credential fill | awk -F= '/^password=/{print $2}')"

exec gh "$@"
