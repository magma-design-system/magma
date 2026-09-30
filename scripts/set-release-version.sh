#!/usr/bin/env bash
#
# Writes a release version into package manifests and keeps the internal
# @maggioli-design-system/* dependencies pinned to the versions in the workspace.
#
# Shared by the release and publish workflows:
#   - scripts/release/prepare-release.sh (semantic-release.yml) calls it once per
#     released package before the single chore(release) commit on main/dev;
#   - publish.yml applies the version of the release tag on beta, where no
#     version bump is committed, right before `npm publish`.
#
# Usage (from the repository root):
#   ./scripts/set-release-version.sh <version> <package.json>...
#
# Every given manifest gets <version>. The internal package map is built AFTER
# the bumps, then:
#   - the given manifests pin every internal dependency to its workspace version
#     (magma-react/magma-angular -> magma, magma -> design-tokens/styles,
#     styles -> design-tokens);
#   - every other internal manifest tracked by git that depends on a package
#     bumped here gets the new pin too, without a version change of its own
#     (e.g. a design-tokens release updates the pin in styles and magma), so the
#     workspace stays consistent and `npm ci` keeps working. That dependent is
#     not re-released: it ships the new pin with its own next release;
#   - the `projects/<x>` entries of package-lock.json of the changed manifests
#     get the same version and pins.
# Calling it once per released package, in any order, ends in the same state.
# Only dependencies, peerDependencies and optionalDependencies are pinned
# (devDependencies keep their spec, e.g. svg-icons `*`). A manifest outside the
# map scan (e.g. a build output under dist/) can be passed too: it is bumped and
# pinned like the others.
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

ALL_NAMES=$(jq -c 'keys' <<< "$MAP")
BUMPED_NAMES=$(jq -s -c 'map(.name)' "$@")

# pins the dependencies named in $names to their version in $map
# shellcheck disable=SC2016 # a jq program, expanded by jq
PIN='
  def pin(section):
    if .[section]
    then .[section] |= with_entries(
      .key as $k
      | if ($k | IN($names[])) and $map[$k] != null then .value = $map[$k] else . end)
    else . end;
  pin("dependencies") | pin("peerDependencies") | pin("optionalDependencies")
'

# <manifest> <names>: rewrites the manifest only when a pin changes (exit 1 otherwise)
pin_manifest() {
  jq --argjson map "$MAP" --argjson names "$2" "$PIN" "$1" > "$1.tmp"
  if cmp -s "$1" "$1.tmp"; then
    rm "$1.tmp"
    return 1
  fi
  mv "$1.tmp" "$1"
}

CHANGED=("$@")
for m in "$@"; do
  pin_manifest "$m" "$ALL_NAMES" || true
  echo "Pinned internal deps in $m"
done

while IFS= read -r m; do
  for given in "$@"; do
    [ "${given#./}" = "$m" ] && continue 2
  done
  if pin_manifest "$m" "$BUMPED_NAMES"; then
    CHANGED+=("$m")
    echo "Pinned the new version of $(jq -r 'join(", ")' <<< "$BUMPED_NAMES") in $m"
  fi
done < <(git ls-files -- projects | grep -E '(^|/)package\.json$' | grep -vE '/(node_modules|dist|deprecated)/')

LOCK=package-lock.json
[ -f "$LOCK" ] || exit 0
for m in "${CHANGED[@]}"; do
  key=$(dirname "${m#./}")
  jq -e --arg k "$key" '.packages[$k]' "$LOCK" > /dev/null || continue
  jq --arg k "$key" --slurpfile m "$m" --argjson names "$ALL_NAMES" '
    .packages[$k] |= (
      (if has("version") then .version = $m[0].version else . end)
      | reduce ("dependencies", "peerDependencies", "optionalDependencies") as $s (.;
          if .[$s] then .[$s] |= with_entries(
            .key as $d
            | if ($d | IN($names[])) and $m[0][$s][$d] != null then .value = $m[0][$s][$d] else . end)
          else . end))
  ' "$LOCK" > "$LOCK.tmp" && mv "$LOCK.tmp" "$LOCK"
  echo "Synced $LOCK entry $key"
done
