#!/usr/bin/env bash
#
# Writes a release version into package manifests and pins their internal
# @maggioli-design-system/* dependencies to the versions in the workspace.
#
# Shared by the release and publish workflows:
#   - semantic-release.yml bumps the released package and its companions
#     (version-sync-paths) before the chore(release) commit on main/dev;
#   - publish.yml applies the version of the release tag on beta, where no
#     version bump is committed, right before `npm publish`.
#
# Usage (from the repository root):
#   ./scripts/set-release-version.sh <version> <package.json>...
#
# Every given manifest gets <version>. The internal package map is built AFTER
# the bumps, so the packages released together resolve to <version> and every
# other internal package resolves to its current source version. Covers:
# magma-react/magma-angular -> magma, magma -> design-tokens/styles,
# styles -> design-tokens, icons -> svg-icons. No cascade: a dependency release
# does not re-release its dependents; they pick up the new version on their own
# next release. A manifest outside the map scan (e.g. a build output under
# dist/) can be passed too: it is bumped and pinned like the others.
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "usage: $0 <version> <package.json>..." >&2
  exit 1
fi

V="$1"
shift

for m in "$@"; do
  jq --arg v "$V" '.version = $v' "$m" > "$m.tmp" && mv "$m.tmp" "$m"
  echo "Updated $m -> $V"
done

MAP=$(find projects -name package.json \
        -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path '*/deprecated/*' \
        -exec jq -c '{(.name): .version}' {} \; | jq -s 'add // {}')
echo "internal package map: $MAP"

for m in "$@"; do
  jq --argjson map "$MAP" '
    def pin(section):
      if .[section]
      then .[section] |= with_entries(if $map[.key] then .value = $map[.key] else . end)
      else . end;
    pin("dependencies") | pin("peerDependencies") | pin("optionalDependencies")
  ' "$m" > "$m.tmp" && mv "$m.tmp" "$m"
  echo "Pinned internal deps in $m"
done
