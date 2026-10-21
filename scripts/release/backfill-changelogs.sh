#!/usr/bin/env bash
#
# Writes the CHANGELOG.md of every package from its past GitHub releases, oldest first, so the
# newest ends on top: the history the release workflow then keeps adding to
# (scripts/release/prepare-release.sh). Run once, when the changelogs start; run again only to
# rebuild them, after deleting them.
#
# Usage (from the repository root, gh authenticated):
#   ./scripts/release/backfill-changelogs.sh <packages-json>
#
#   packages-json  the PACKAGES of .github/workflows/release.yml: name, working-directory,
#                  tag-format and optional version-sync-paths per package
#
# Only the releases the git-cliff pipeline wrote go in, the ones whose body starts with their
# '## [<tag>] - <date>' heading: a tag older than the pipeline has no release, and the GitHub
# generated notes of the v1 support line ("What's Changed") are not this history. Prereleases
# are left out, as the release workflow leaves them out.
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: $0 <packages-json>" >&2
  exit 1
fi
PACKAGES="$1"
HERE=$(cd "$(dirname "$0")" && pwd)
NOTES=$(mktemp)
trap 'rm -f "$NOTES"' EXIT

while IFS= read -r pkg; do
  tag_format=$(jq -r '."tag-format"' <<< "$pkg")
  # shellcheck disable=SC2016 # ${version} is the literal placeholder of the tag format
  prefix="${tag_format%'${version}'}"
  dirs=$(jq -r '[."working-directory"] + ((."version-sync-paths" // []) | map(sub("/package.json$"; ""))) | .[]' <<< "$pkg")
  echo "== $(jq -r '.name' <<< "$pkg")"
  # stable tags only: no '-' after the version
  while IFS= read -r tag; do
    if ! gh release view "$tag" --json body --jq .body > "$NOTES" 2> /dev/null; then
      echo "$tag: no GitHub release, left out"
      continue
    fi
    if ! head -n 1 "$NOTES" | grep -qF "## [$tag]"; then
      echo "$tag: the release was not written by git-cliff, left out"
      continue
    fi
    while IFS= read -r dir; do
      "$HERE/changelog.sh" "$dir" "$NOTES" < /dev/null
    done <<< "$dirs"
  done < <(git tag -l "${prefix}*" | grep -E "^${prefix}[0-9]+\.[0-9]+\.[0-9]+$" | sort -V)
done < <(jq -c '.[]' <<< "$PACKAGES")
