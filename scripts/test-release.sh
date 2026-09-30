#!/usr/bin/env bash
#
# Locally test the semantic-release setup WITHOUT committing, tagging, or
# pushing anything in your repository.
#
# Everything runs inside a throwaway clone of your repo (deleted on exit), so
# your working tree, branches, tags and remote are never touched. It runs the
# release preparation of the workflows (scripts/release/prepare-release.sh,
# taken from your working tree) on the requested branch: the next version of
# each package, then, outside beta, the version bumps, internal dependency pins
# and lock of the single chore(release) commit, and whether `npm ci` accepts
# the result. The only network/disk cost is `npm install` of the
# semantic-release toolchain into the temp clone.
#
# Usage:
#   ./scripts/test-release.sh [options] [pkg...]
#
#   pkg...            one or more of: design-tokens identity styles svg-icons
#                     icons magma (default: every package the branch releases)
#   --baseline <ref>  create a synthetic baseline tag for each package at <ref>
#                     (version read from that ref). Use this to simulate
#                     "released at <ref>". Omit it to use the tags in the repo.
#   --head <ref>      commit to release FROM (default: origin/<branch>). Commits
#                     between the baseline and here drive the version bump.
#   --merge <ref>     first merge <ref> into --head with a merge commit, e.g.
#                     `--merge origin/dev` simulates promoting dev into main.
#   --branch <name>   branch to dry-run on (default: main):
#                       main  every package, as release.yml
#                       dev   icons and svg-icons, as {icons,svg-icons}.release.yml
#                       beta  magma prereleases, as stencil.release.yml (no bump)
#                     Prerelease CONTINUATION (beta.2, beta.3 …) relies on the
#                     refs/notes/semantic-release notes: fetch them into your
#                     repo first (git fetch origin
#                     refs/notes/semantic-release:refs/notes/semantic-release).
#   --keep            keep the temp clone (prints its path) instead of deleting.
#
# The package list comes from release.yml. Release notes are generated too
# when git-cliff is on PATH (kept under .release/notes with --keep).
#
# Examples:
#   # what a promotion of dev into main would release right now
#   ./scripts/test-release.sh --merge origin/dev
#   # simulate releasing main as if the last release was at <oldref>
#   ./scripts/test-release.sh --baseline <oldref> design-tokens magma
set -euo pipefail

SR_VERSION=25.0.3
CA_VERSION=13.0.1
EXEC_VERSION=7.1.0
PRESET_VERSION=9.1.0

BASELINE=""
HEAD_REF=""
MERGE_REF=""
BRANCH="main"
KEEP=false
PKGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --baseline) BASELINE="$2"; shift 2 ;;
    --head) HEAD_REF="$2"; shift 2 ;;
    --merge) MERGE_REF="$2"; shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --keep) KEEP=true; shift ;;
    -h|--help) sed -n '2,48p' "$0"; exit 0 ;;
    -*) echo "unknown option: $1" >&2; exit 1 ;;
    *) PKGS+=("$1"); shift ;;
  esac
done

# branch -> stable branches and default packages (mirrors the release workflows)
case "$BRANCH" in
  main) STABLE=main; DEFAULT_PKGS=(design-tokens identity styles svg-icons icons magma); APPLY=--apply ;;
  dev)  STABLE=dev;  DEFAULT_PKGS=(icons svg-icons); APPLY=--apply ;;
  beta) STABLE=main; DEFAULT_PKGS=(magma); APPLY= ;;
  *) echo "unknown branch: $BRANCH (main, dev or beta)" >&2; exit 1 ;;
esac
[ ${#PKGS[@]} -eq 0 ] && PKGS=("${DEFAULT_PKGS[@]}")
[ -z "$HEAD_REF" ] && HEAD_REF="origin/$BRANCH"

SRC=$(git rev-parse --show-toplevel)
HEAD_SHA=$(git -C "$SRC" rev-parse --verify "${HEAD_REF}^{commit}")
# the stable branch the dev/beta runs sit next to
MAIN_SHA=$(git -C "$SRC" rev-parse --verify "origin/main^{commit}")
[ -n "$MERGE_REF" ] && MERGE_SHA=$(git -C "$SRC" rev-parse --verify "${MERGE_REF}^{commit}")
[ -n "$BASELINE" ] && BASE_SHA=$(git -C "$SRC" rev-parse --verify "${BASELINE}^{commit}")

# the package list of release.yml (its `packages` JSON block), narrowed to PKGS
PACKAGES=$(awk '/^      packages: >-$/ { f = 1; next } f && /^        / { print; next } f { exit }' \
  "$SRC/.github/workflows/release.yml" \
  | jq -c --args '[.[] | select(.name | IN($ARGS.positional[]))]' "${PKGS[@]}")
[ "$(jq length <<< "$PACKAGES")" -eq ${#PKGS[@]} ] || { echo "unknown package in: ${PKGS[*]}" >&2; exit 1; }

TMP=$(mktemp -d "${TMPDIR:-/tmp}/sr-test.XXXXXX")
# shellcheck disable=SC2329 # called by the EXIT trap
cleanup() { if $KEEP; then echo "kept clone at: $TMP/repo"; else rm -rf "$TMP"; fi; }
trap cleanup EXIT

echo "Cloning $SRC -> throwaway repo ..."
git clone --quiet "$SRC" "$TMP/repo"
cd "$TMP/repo"
# your remote-tracking branches too, so origin/<branch> refs resolve to known commits
git fetch --quiet "$SRC" '+refs/remotes/origin/*:refs/remotes/src/*'
git fetch --quiet "$SRC" 'refs/notes/semantic-release:refs/notes/semantic-release' 2>/dev/null || true
git config user.name "test-release"
git config user.email "test-release@localhost"
# 'main' must exist as the stable release branch; then check out the requested branch at HEAD
if [ "$BRANCH" = main ]; then
  git branch -f main "$HEAD_SHA" >/dev/null
  git checkout -q main
else
  git branch -f main "$MAIN_SHA" >/dev/null
  git checkout -q -B "$BRANCH" "$HEAD_SHA"
fi
if [ -n "$MERGE_REF" ]; then
  git merge -q --no-ff --no-edit -m "Merge ${MERGE_REF} into ${BRANCH} (simulated)" "$MERGE_SHA"
  echo "Merged ${MERGE_REF} into ${BRANCH}: $(git rev-parse --short HEAD)"
fi
# the clone is its own remote, so nothing can ever reach the real one
git remote set-url origin "file://$PWD"

if [ -n "$BASELINE" ]; then
  echo "Creating synthetic baseline tags at $(git rev-parse --short "$BASE_SHA") ..."
  while IFS=$'\t' read -r dir tagfmt; do
    if json=$(git show "${BASE_SHA}:${dir}/package.json" 2>/dev/null); then
      ver=$(printf '%s' "$json" | jq -r .version)
      # resolve the baseline tag from the same tag-format the package uses
      tag=$(printf '%s' "$tagfmt" | sed "s|\${version}|$ver|")
      git tag -a "$tag" "$BASE_SHA" -m baseline
      echo "  baseline $tag"
    fi
  done < <(jq -r '.[] | [."working-directory", ."tag-format"] | @tsv' <<< "$PACKAGES")
fi

echo "Installing semantic-release toolchain (this can take ~1 min) ..."
npm install --no-save --no-audit --no-fund \
  "semantic-release@${SR_VERSION}" \
  "@semantic-release/commit-analyzer@${CA_VERSION}" \
  "@semantic-release/exec@${EXEC_VERSION}" \
  "conventional-changelog-conventionalcommits@${PRESET_VERSION}" >/dev/null 2>&1

# the release scripts of YOUR working tree, untracked in the clone (so they
# never count as release changes) and next to its node_modules
mkdir -p .release-tools
cp -r "$SRC/scripts/release" .release-tools/release
cp "$SRC/scripts/set-release-version.sh" .release-tools/

NOTES=
command -v git-cliff >/dev/null && NOTES=--notes
echo "Preparing the release on ${BRANCH} ..."
# shellcheck disable=SC2086 # empty flags on purpose
if ! GITHUB_REF_NAME="$BRANCH" SR_STABLE_BRANCHES="$STABLE" SR_REPOSITORY_URL="file://$PWD" \
  ./.release-tools/release/prepare-release.sh $APPLY $NOTES "$PACKAGES" > release.log 2>&1; then
  tail -30 release.log >&2
  echo "release preparation failed (full log: $PWD/release.log)" >&2
  KEEP=true
  exit 1
fi

echo
printf '%-16s %-14s %s\n' "PACKAGE" "RESULT" "SINCE"
printf '%-16s %-14s %s\n' "----------------" "--------------" "------------------------------"
for p in "${PKGS[@]}"; do
  since=$(awk -v p="$p" '$0 == "== semantic-release dry-run: " p { f = 1; next } /^== / { f = 0 }
    f && /Found git tag/ { sub(/.*Found git tag /, ""); sub(/ associated.*/, ""); print; exit }
    f && /No git tag version found/ { print "no previous release"; exit }' release.log)
  version=$(jq -r --arg p "$p" '.[] | select(.name == $p) | .version' .release/plan.json)
  printf '%-16s %-14s %s\n' "$p" "${version:-no release}" "${since:-?}"
done

if [ -s .release/files.txt ]; then
  echo
  echo "Release commit: chore(release): $(jq -r 'map(.tag) | join(" ")' .release/plan.json)"
  while IFS= read -r f; do
    case "$f" in
      */package.json)
        printf '  %-52s %s\n' "$f" "$(jq -c '{version} + ([.dependencies, .peerDependencies, .optionalDependencies]
          | map((. // {}) | with_entries(select(.key | startswith("@maggioli-design-system/")))) | add)' "$f")" ;;
      *) printf '  %s\n' "$f" ;;
    esac
  done < .release/files.txt
  echo
  if npm ci --dry-run --ignore-scripts --no-audit --no-fund > npm-ci.log 2>&1; then
    echo "npm ci: the lock is in sync with the manifests"
  else
    echo "npm ci: FAILS on the release commit:"
    grep -E 'Missing:|Invalid:|in sync' npm-ci.log | sed 's/^/  /' || tail -10 npm-ci.log
  fi
fi
[ -n "$NOTES" ] && echo && echo "release notes: .release/notes/ (use --keep to read them)"
exit 0
