#!/usr/bin/env bash
#
# One-time migration for the per-package semantic-release workflows.
#
# semantic-release derives the next version from the last git tag matching a
# package's `tagFormat` (NOT from package.json). The release workflows tag as
# `<pkg>@<version>` (short package name), and no such tags exist yet (only legacy `v1.x`), so
# the very first run of every package would otherwise propose 1.0.0 and regress
# the version. This script seeds a baseline tag for each release-driving package
# at a fixed commit (origin/main at migration time), reading each version from
# that commit, so the workflows continue from the current versions.
#
# Run ONCE, after the release workflows are merged (no specific branch/working
# tree needed - versions are read from TARGET_COMMIT):
#
#   ./scripts/seed-release-tags.sh          # dry run: prints what it would do
#   ./scripts/seed-release-tags.sh --push   # create the tags and push them
#
# The target commit can be overridden:  TARGET_COMMIT=<sha> ./scripts/seed-release-tags.sh
#
# Idempotent: tags that already exist (locally or on the remote) are skipped.
# The Stencil companion packages (magma-react, magma-angular) are kept in
# lockstep by the stencil release workflow and intentionally get no own tag.
#
# magma (projects/stencil) is special-cased: it is mid-prerelease (2.0.0-alpha.x), so instead
# of that version it seeds the last STABLE baseline @maggioli-design-system/magma@1.11.8 at the
# v1.11.8 commit, giving the `beta` prerelease channel a base to build on. Reaching 2.0.0-beta.N
# additionally requires a breaking `feat(magma)!:` / `BREAKING CHANGE:` commit on the beta branch.
set -euo pipefail

PUSH=false
[ "${1:-}" = "--push" ] && PUSH=true

# Commit the baseline tags point at (origin/main, merge of PR #515, the
# migration baseline). Override with the TARGET_COMMIT env var if needed.
TARGET_COMMIT="${TARGET_COMMIT:-54b7540d047b44b91446de6b35ca6acd3d3e339f}"

# Release-driving packages (the ones with a *.release.yml workflow).
PACKAGES=(
  projects/design-tokens
  projects/icons
  projects/identity
  projects/styles
  projects/svg-icons
  projects/stencil
)

REMOTE=origin

if ! git rev-parse -q --verify "${TARGET_COMMIT}^{commit}" >/dev/null; then
  echo "::error:: target commit ${TARGET_COMMIT} not found (fetch it first?)" >&2
  exit 1
fi
SHORT=$(git rev-parse --short "$TARGET_COMMIT")
echo "Seeding baseline tags at ${SHORT} (${TARGET_COMMIT})"
echo

for dir in "${PACKAGES[@]}"; do
  manifest="$dir/package.json"
  if ! json=$(git show "${TARGET_COMMIT}:${manifest}" 2>/dev/null); then
    echo "::warning:: ${manifest} not found at ${SHORT}, skipping"
    continue
  fi
  name=$(printf '%s' "$json" | jq -r '.name')
  version=$(printf '%s' "$json" | jq -r '.version')
  tag_commit="$TARGET_COMMIT"
  if [ "$dir" = "projects/stencil" ]; then
    # seed the last STABLE magma baseline (see header note), not its 2.0.0-alpha version
    version="1.11.8"
    if ! tag_commit=$(git rev-parse -q --verify "v${version}^{commit}"); then
      echo "::warning:: v${version} not found, cannot seed magma stable baseline, skipping"
      continue
    fi
  fi
  pkg="${name##*/}"   # short name: @maggioli-design-system/design-tokens -> design-tokens
  tag="${pkg}@${version}"
  short_tc=$(git rev-parse --short "$tag_commit")

  if git rev-parse -q --verify "refs/tags/${tag}" >/dev/null; then
    echo "skip  ${tag} (already exists locally)"
    continue
  fi
  if git ls-remote --tags "$REMOTE" "refs/tags/${tag}" | grep -q .; then
    echo "skip  ${tag} (already exists on ${REMOTE})"
    continue
  fi

  if $PUSH; then
    git tag -a "$tag" "$tag_commit" -m "Baseline release ${tag}"
    git push "$REMOTE" "$tag"
    echo "tag   ${tag} (created at ${short_tc} & pushed)"
  else
    echo "would tag ${tag} at ${short_tc}"
  fi
done

if ! $PUSH; then
  echo
  echo "Dry run only. Re-run with --push to create and push the tags."
fi
