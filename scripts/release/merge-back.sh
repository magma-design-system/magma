#!/usr/bin/env bash
#
# Merges the released commit of main into dev and pushes it, so that dev gets
# the released versions, the internal pins and the CHANGELOG.md sections of
# the chore(release) commit right after the publish (docs/WORKFLOW.md rule 1).
# publish.yml runs it on main once the packages are on npm, from a checkout
# made with a token allowed to push to dev (an organisation admin: for anybody
# else the ruleset of dev requires a pull request). A pull request from main
# into dev cannot do this job: as soon as dev moves it no longer meets the
# up-to-date requirement of the ruleset, and updating it would push dev into
# main outside a release.
#
# Usage (from the repository root, with a clean working tree and the `origin`
# remote of the repository):
#   ./scripts/release/merge-back.sh <sha> [--dry-run]
#
#   sha        the commit of main to bring into dev: the published
#              chore(release) commit, not the tip of main, so that a commit
#              pushed to main in the meantime is not dragged along
#   --dry-run  merge locally and show the result, push nothing
#
# A fast-forward when dev has not moved since the promotion (dev becomes the
# tagged commit itself), a merge commit otherwise. A conflict aborts the merge
# and exits 1 with the instruction for a maintainer, leaving dev untouched. A
# rejected push (dev moved in the meantime, e.g. a Renovate merge) is redone
# from the new tip, up to 5 times.
set -euo pipefail

usage() {
  echo "usage: $0 <sha> [--dry-run]"
}

SHA=""
DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "unknown option: $arg" >&2; usage >&2; exit 2 ;;
    *)
      if [ -n "$SHA" ]; then echo "only one sha is accepted" >&2; usage >&2; exit 2; fi
      SHA="$arg"
      ;;
  esac
done
if [ -z "$SHA" ]; then usage >&2; exit 2; fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "::error::the working tree is not clean"; exit 1
fi

git fetch --quiet origin dev main
SHA=$(git rev-parse --verify --quiet "${SHA}^{commit}") || {
  echo "::error::unknown commit: $1"; exit 1
}
# only what main carries goes back into dev
if ! git merge-base --is-ancestor "$SHA" origin/main; then
  echo "::error::${SHA} is not a commit of main"; exit 1
fi
if git merge-base --is-ancestor "$SHA" origin/dev; then
  echo "::notice::${SHA} is already in dev, nothing to do"; exit 0
fi

if [ -z "$(git config user.email || true)" ]; then
  git config user.name "github-actions[bot]"
  git config user.email "github-actions[bot]@users.noreply.github.com"
fi

# a detached HEAD on the tip of dev: the local dev branch, if any, is not moved
merge_onto_dev() {
  git checkout --quiet --detach origin/dev
  if ! git merge --quiet --no-edit -m "Merge branch 'main' into dev" "$SHA"; then
    git merge --abort 2>/dev/null || true
    echo "::error::merging ${SHA} (main) into dev conflicts: merge main into dev locally, resolve the conflicts and push dev as an organisation admin (docs/WORKFLOW.md rule 1)"
    return 1
  fi
}
merge_onto_dev

echo "dev after the merge:"
git log --oneline --no-decorate origin/dev..HEAD
git diff --stat origin/dev..HEAD | tail -n 1

if $DRY_RUN; then
  echo "dry run: nothing pushed"
  git checkout --quiet -
  exit 0
fi

for i in 1 2 3 4 5; do
  if git push --quiet origin HEAD:dev; then
    echo "pushed dev on attempt $i"; exit 0
  fi
  echo "::warning::push to dev rejected, redoing the merge on its new tip (attempt $i)"
  git fetch --quiet origin dev
  if git merge-base --is-ancestor "$SHA" origin/dev; then
    echo "::notice::${SHA} reached dev in the meantime, nothing to do"; exit 0
  fi
  merge_onto_dev
done
echo "::error::could not push dev after 5 attempts"; exit 1
