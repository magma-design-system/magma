#!/usr/bin/env bash
#
# Locally test the per-package semantic-release setup WITHOUT committing,
# tagging, or pushing anything in your repository.
#
# Everything runs inside a throwaway clone of your repo (deleted on exit), so
# your working tree, branches, tags and remote are never touched. The only
# network/disk cost is `npm install` of the semantic-release toolchain into the
# temp clone.
#
# Usage:
#   ./scripts/test-release.sh [options] [pkg...]
#
#   pkg...            one or more of: design-tokens icons identity styles
#                     svg-icons magma   (default: all)
#   --baseline <ref>  create a synthetic baseline tag for each package at <ref>
#                     (version read from that ref). Use this BEFORE the real
#                     baseline tags exist to simulate "released at <ref>".
#                     Omit it to use whatever tags already exist in the repo.
#   --head <ref>      commit to release FROM (default: origin/main). Commits
#                     between the baseline and here drive the version bump.
#   --branch <name>   branch/channel to dry-run on (default: main). e.g. --branch beta exercises
#                     the prerelease channel. NOTE: prerelease CONTINUATION (beta.2, beta.3 …)
#                     relies on the refs/notes/semantic-release notes the real workflow writes;
#                     locally only the FIRST prerelease number is meaningful.
#   --keep            keep the temp clone (prints its path) instead of deleting.
#
# Examples:
#   # what would release on main right now, against the seeded baseline tags
#   ./scripts/test-release.sh
#   # simulate releasing main as if the last release was at <oldref>
#   ./scripts/test-release.sh --baseline <oldref> design-tokens magma
#
# NOTE on magma: it is currently a 2.0.0-alpha prerelease. semantic-release does
# NOT treat a prerelease tag as a baseline on the stable `main` branch, so until
# magma graduates to a stable version its dry-run reports 1.0.0. See the team
# decision in docs / the migration notes.
set -euo pipefail

SR_VERSION=25.0.3
CA_VERSION=13.0.1
EXEC_VERSION=7.1.0
PRESET_VERSION=9.1.0

# pkg -> "dir<TAB>scope<TAB>tag-format"  (mirrors the *.release.yml callers)
pkg_meta() {
  case "$1" in
    design-tokens) printf 'projects/design-tokens\tdesign-tokens\tdesign-tokens@${version}' ;;
    icons)         printf 'projects/icons\ticons\ticons@${version}' ;;
    identity)      printf 'projects/identity\tidentity\tidentity@${version}' ;;
    styles)        printf 'projects/styles\tstyles\tstyles@${version}' ;;
    svg-icons)     printf 'projects/svg-icons\tsvg-icons\tsvg-icons@${version}' ;;
    magma)         printf 'projects/stencil\tmagma|stencil|react|lit|storybook|mds-*\tmagma@${version}' ;;
    *) return 1 ;;
  esac
}

BASELINE=""
HEAD_REF="origin/main"
BRANCH="main"
KEEP=false
PKGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --baseline) BASELINE="$2"; shift 2 ;;
    --head) HEAD_REF="$2"; shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --keep) KEEP=true; shift ;;
    -h|--help) sed -n '2,40p' "$0"; exit 0 ;;
    -*) echo "unknown option: $1" >&2; exit 1 ;;
    *) PKGS+=("$1"); shift ;;
  esac
done
[ ${#PKGS[@]} -eq 0 ] && PKGS=(design-tokens icons identity styles svg-icons magma)

# semantic-release branches config: main (stable) + the requested prerelease channel
if [ "$BRANCH" = main ]; then
  SR_BRANCHES='["main",{"name":"beta","prerelease":true}]'
else
  SR_BRANCHES="[\"main\",{\"name\":\"${BRANCH}\",\"prerelease\":true}]"
fi

SRC=$(git rev-parse --show-toplevel)
HEAD_SHA=$(git -C "$SRC" rev-parse --verify "${HEAD_REF}^{commit}")
[ -n "$BASELINE" ] && BASE_SHA=$(git -C "$SRC" rev-parse --verify "${BASELINE}^{commit}")

TMP=$(mktemp -d "${TMPDIR:-/tmp}/sr-test.XXXXXX")
cleanup() { if $KEEP; then echo "kept clone at: $TMP"; else rm -rf "$TMP"; fi; }
trap cleanup EXIT

echo "Cloning $SRC -> throwaway repo ..."
git clone --quiet "$SRC" "$TMP/repo"
cd "$TMP/repo"
# 'main' must exist as the stable release branch; then check out the requested branch at HEAD
git branch -f main "$HEAD_SHA" >/dev/null
if [ "$BRANCH" = main ]; then git checkout -q main; else git checkout -q -B "$BRANCH" "$HEAD_SHA"; fi
git remote remove origin 2>/dev/null || true

if [ -n "$BASELINE" ]; then
  echo "Creating synthetic baseline tags at $(git rev-parse --short "$BASE_SHA") ..."
  for p in "${PKGS[@]}"; do
    meta=$(pkg_meta "$p") || { echo "unknown package: $p" >&2; exit 1; }
    IFS=$'\t' read -r dir _ tagfmt <<<"$meta"
    if json=$(git show "${BASE_SHA}:${dir}/package.json" 2>/dev/null); then
      ver=$(printf '%s' "$json" | jq -r .version)
      # resolve the baseline tag from the same tag-format the package uses
      tag=$(printf '%s' "$tagfmt" | sed "s|\${version}|$ver|")
      git tag -a "$tag" "$BASE_SHA" -m baseline
      echo "  baseline $tag"
    fi
  done
fi

echo "Installing semantic-release toolchain (this can take ~1 min) ..."
npm install --no-save --no-audit --no-fund \
  "semantic-release@${SR_VERSION}" \
  "@semantic-release/commit-analyzer@${CA_VERSION}" \
  "@semantic-release/exec@${EXEC_VERSION}" \
  "conventional-changelog-conventionalcommits@${PRESET_VERSION}" >/dev/null 2>&1

cat > .sr-test.config.cjs <<'EOF'
const scope = process.env.SR_COMMIT_SCOPE;
const releaseRules = scope ? [{ scope: `!(${scope})`, release: false }] : [];
module.exports = {
  repositoryUrl: process.env.SR_REPO_URL,
  branches: JSON.parse(process.env.SR_BRANCHES),
  tagFormat: process.env.SR_TAG_FORMAT,
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits', releaseRules }],
    ['@semantic-release/exec', { verifyReleaseCmd: 'echo "${nextRelease.version}" > release-version.txt' }],
  ],
};
EOF

echo
printf '%-16s %-12s %s\n' "PACKAGE" "RESULT" "DETAIL"
printf '%-16s %-12s %s\n' "----------------" "------------" "------------------------------------------"
for p in "${PKGS[@]}"; do
  meta=$(pkg_meta "$p") || { echo "unknown package: $p" >&2; exit 1; }
  IFS=$'\t' read -r dir scope tagfmt <<<"$meta"
  rm -f release-version.txt
  detail=$(SR_COMMIT_SCOPE="$scope" SR_TAG_FORMAT="$tagfmt" SR_BRANCHES="$SR_BRANCHES" SR_REPO_URL="file://$PWD" \
    npx --no-install semantic-release -e ./.sr-test.config.cjs --dry-run 2>&1 \
    | grep -Eio 'Found git tag [^ ]+|no previous release|no git tag version found' | head -1 || true)
  if [ -f release-version.txt ]; then
    printf '%-16s %-12s %s\n' "$p" "$(cat release-version.txt)" "$detail"
  else
    printf '%-16s %-12s %s\n' "$p" "no release" "$detail"
  fi
done
