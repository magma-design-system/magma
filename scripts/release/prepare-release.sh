#!/usr/bin/env bash
#
# Detects the next version of a group of packages with semantic-release and
# prepares their release: version bumps, internal dependency pins and lock
# (scripts/set-release-version.sh) and release notes, so that the release
# workflow commits them all in one chore(release) commit.
#
# Usage (from the repository root, with the semantic-release toolchain installed):
#   ./scripts/release/prepare-release.sh [--apply] [--notes] [--out <dir>] <packages>
#
#   packages  JSON array, one object per package:
#               name                short name, used for the output files
#               working-directory   directory holding the package.json
#               tag-format          e.g. 'styles@${version}'
#               commit-scope        '|'-separated scope tokens (globs allowed)
#               version-sync-paths  optional array of companion package.json
#                                   files released at the same version
#   --apply   write the versions and pins into the manifests and the lock
#             (the release on beta commits nothing and skips it)
#   --notes   write the release notes of each package (needs git-cliff)
#   --out     output directory (default .release)
#
# Environment: SR_STABLE_BRANCHES and GITHUB_REF_NAME, read by
# scripts/release/semantic-release.config.cjs; optional SR_REPOSITORY_URL, the
# repository semantic-release checks the branch against (default: the
# `repository` of package.json; scripts/test-release.sh points it to its clone).
#
# Outputs in the output directory:
#   plan.json        the packages to release: [{name, version, tag, previous-tag,
#                    tag-format, commit-scope, manifests}]
#   notes/<name>.md  release notes (--notes)
#   files.txt        tracked files changed by --apply
# Each package is detected on its own, from its own tags and commits. A package
# whose next tag already exists on the remote is left out: that version was
# already released.
set -euo pipefail

APPLY=false
NOTES=false
OUT=.release
while [ $# -gt 0 ]; do
  case "$1" in
    --apply) APPLY=true; shift ;;
    --notes) NOTES=true; shift ;;
    --out) OUT="$2"; shift 2 ;;
    -*) echo "unknown option: $1" >&2; exit 1 ;;
    *) break ;;
  esac
done
if [ $# -ne 1 ]; then
  echo "usage: $0 [--apply] [--notes] [--out <dir>] <packages-json>" >&2
  exit 1
fi
PACKAGES="$1"

HERE=$(cd "$(dirname "$0")" && pwd)
rm -rf "$OUT"
mkdir -p "$OUT"

group() { [ -n "${GITHUB_ACTIONS:-}" ] && echo "::group::$*" || echo "== $*"; }
endgroup() { [ -n "${GITHUB_ACTIONS:-}" ] && echo "::endgroup::" || true; }

tag_exists() {
  if git remote get-url origin > /dev/null 2>&1; then
    git ls-remote --tags origin "refs/tags/$1" | grep -q .
  else
    git rev-parse -q --verify "refs/tags/$1" > /dev/null
  fi
}

# the commands inside the loops read /dev/null, never the list being iterated
PLAN='[]'
while IFS= read -r pkg; do
  name=$(jq -r '.name' <<< "$pkg")
  tag_format=$(jq -r '."tag-format"' <<< "$pkg")
  scope=$(jq -r '."commit-scope" // ""' <<< "$pkg")

  rm -f release-version.txt
  group "semantic-release dry-run: $name"
  SR_TAG_FORMAT="$tag_format" SR_COMMIT_SCOPE="$scope" \
    npx --no-install semantic-release -e "$HERE/semantic-release.config.cjs" --dry-run \
    ${SR_REPOSITORY_URL:+--repository-url "$SR_REPOSITORY_URL"} < /dev/null
  endgroup
  if [ ! -f release-version.txt ]; then
    echo "$name: no release"
    continue
  fi
  version=$(sed -n 1p release-version.txt)
  previous_tag=$(sed -n 2p release-version.txt)
  rm -f release-version.txt
  tag=$(printf '%s' "$tag_format" | sed "s|\${version}|$version|")
  if tag_exists "$tag"; then
    echo "$name: tag $tag already exists, nothing to release"
    continue
  fi
  echo "$name: $version -> tag $tag"
  PLAN=$(jq -c --argjson pkg "$pkg" --arg v "$version" --arg t "$tag" --arg p "$previous_tag" '. + [{
    name: $pkg.name,
    version: $v,
    tag: $t,
    "previous-tag": $p,
    "tag-format": $pkg."tag-format",
    "commit-scope": ($pkg."commit-scope" // ""),
    manifests: ([$pkg."working-directory" + "/package.json"] + ($pkg."version-sync-paths" // []))
  }]' <<< "$PLAN")
done < <(jq -c '.[]' <<< "$PACKAGES")

jq . <<< "$PLAN" > "$OUT/plan.json"
echo "release plan:"
cat "$OUT/plan.json"

if $APPLY; then
  # the release commit must hold the release changes only
  if ! git diff --quiet; then
    echo "::error::tracked files changed before applying the release:" >&2
    git diff --name-only >&2
    exit 1
  fi
  while IFS= read -r entry; do
    mapfile -t manifests < <(jq -r '.manifests[]' <<< "$entry")
    "$HERE/../set-release-version.sh" "$(jq -r '.version' <<< "$entry")" "${manifests[@]}" < /dev/null
  done < <(jq -c '.[]' <<< "$PLAN")
  git diff --name-only > "$OUT/files.txt"
  echo "changed files:"
  cat "$OUT/files.txt"
fi

if $NOTES; then
  mkdir -p "$OUT/notes"
  while IFS= read -r entry; do
    "$HERE/release-notes.sh" \
      "$(jq -r '."tag-format"' <<< "$entry")" \
      "$(jq -r '."commit-scope"' <<< "$entry")" \
      "$(jq -r '.tag' <<< "$entry")" \
      "$OUT/notes/$(jq -r '.name' <<< "$entry").md" \
      "$(jq -r '."previous-tag"' <<< "$entry")" < /dev/null
  done < <(jq -c '.[]' <<< "$PLAN")
fi
