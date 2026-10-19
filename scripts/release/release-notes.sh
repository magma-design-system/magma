#!/usr/bin/env bash
#
# Writes the release notes of one package with git-cliff: the conventional
# commits since the package's previous release, grouped by type.
#
# Usage (from the repository root, git-cliff on PATH):
#   ./scripts/release/release-notes.sh <tag-format> <commit-scope> <tag> <output-file> [<previous-tag>]
#
#   tag-format    e.g. 'styles@${version}': bounds the notes to the package's own tags
#   commit-scope  '|'-separated scope tokens (globs allowed, e.g. 'magma|mds-*');
#                 empty = every conventional commit
#   tag           the tag being released, e.g. 'styles@17.0.0'
#   previous-tag  the tag semantic-release built the version on: the notes cover
#                 <previous-tag>..HEAD, the commits that drove the bump. Without
#                 it git-cliff picks the newest tag matching the tag format, even
#                 one outside the branch history (e.g. a magma@*-beta.N on beta
#                 when releasing main), and misses the commits. Empty = the
#                 whole history (first release).
#
# A commit is kept when one of its scopes is a scope token, with the scopes split
# the way commitlint splits them (`/`, `\` or `,`): the same rule that drives
# the version bump (scripts/release/scoped-commit-analyzer.mjs).
set -euo pipefail

if [ $# -lt 4 ] || [ $# -gt 5 ]; then
  echo "usage: $0 <tag-format> <commit-scope> <tag> <output-file> [<previous-tag>]" >&2
  exit 1
fi

TAG_FORMAT="$1"
COMMIT_SCOPE="$2"
TAG="$3"
OUT="$4"
PREVIOUS_TAG="${5:-}"
RANGE=HEAD
[ -n "$PREVIOUS_TAG" ] && RANGE="${PREVIOUS_TAG}..HEAD"

# shellcheck disable=SC2016 # ${version} is the literal placeholder of the tag format
PREFIX="${TAG_FORMAT%'${version}'}"
TAG_PATTERN="${PREFIX}[0-9].*"

# git-cliff reads the format from the extension
CONFIG_DIR=$(mktemp -d)
trap 'rm -rf "$CONFIG_DIR"' EXIT
CONFIG="$CONFIG_DIR/cliff.toml"

# TOML literal strings ('…') keep the regex backslashes as they are
{
  echo '[changelog]'
  echo 'trim = true'
  # git-cliff's default body, plus the BREAKING CHANGE footer of a breaking commit as a
  # nested item under its entry: the footer is where the commit says what a consumer has
  # to change. `trim` strips every line, so the note goes out with a marker that the
  # postprocessor turns into the indentation of the nested item.
  cat <<'BODY'
body = """
{% if version %}\
    ## [{{ version | trim_start_matches(pat="v") }}] - {{ timestamp | date(format="%Y-%m-%d") }}
{% else %}\
    ## [unreleased]
{% endif %}\
{% for group, commits in commits | group_by(attribute="group") %}
    ### {{ group | striptags | trim | upper_first }}
    {% for commit in commits %}
        - {% if commit.scope %}*({{ commit.scope }})* {% endif %}\
            {% if commit.breaking %}[**breaking**] {% endif %}\
            {{ commit.message | upper_first }}\
            {% if commit.breaking and commit.breaking_description and commit.breaking_description != commit.message %}
            BREAKING_NOTE {{ commit.breaking_description | replace(from="\n", to=" ") | upper_first }}\
            {% endif %}\
    {% endfor %}
{% endfor %}
"""
postprocessors = [{ pattern = '(?m)^BREAKING_NOTE ', replace = '  - ' }]
BODY
  echo '[git]'
  echo 'conventional_commits = true'
  echo 'filter_unconventional = true'
  printf "tag_pattern = '%s'\n" "$TAG_PATTERN"
  if [ -n "$COMMIT_SCOPE" ]; then
    # Rust regex has no lookahead, so keep the in-scope commits per type and
    # skip the rest. Glob '*' -> regex '[^)]*' for the scope alternation, which
    # may sit anywhere in the delimited scope list.
    SCOPES=$(printf '%s' "$COMMIT_SCOPE" | sed 's/\*/[^)]*/g')
    SCOPE_RE='\((?:[^)]*(?:/|\\|, ?))?(?:'"$SCOPES"')(?:(?:/|\\|, ?)[^)]*)?\)'
    echo 'filter_commits = true'
    echo 'commit_parsers = ['
    while IFS=: read -r type group; do
      printf "  { message = '^%s%s', group = \"%s\" },\n" "$type" "$SCOPE_RE" "$group"
    done <<'TYPES'
feat:Features
fix:Bug Fixes
hotfix:Bug Fixes
perf:Performance
refactor:Refactor
change:Changes
docs:Documentation
build:Build
style:Styling
TYPES
    echo "  { message = '.*', skip = true },"
    echo ']'
  fi
} > "$CONFIG"

echo "----- cliff.toml for ${TAG} (${RANGE}) -----"
cat "$CONFIG"

if ! git-cliff --offline --config "$CONFIG" --tag "$TAG" --strip header "$RANGE" > "$OUT"; then
  echo "::warning::git-cliff failed for ${TAG}, the release notes stay empty"
  : > "$OUT"
fi
echo "release notes for ${TAG} written to ${OUT}"
