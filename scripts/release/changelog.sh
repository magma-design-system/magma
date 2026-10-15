#!/usr/bin/env bash
#
# Prepends the notes of one release to the CHANGELOG.md of a package, as its newest section.
# The notes are the git-cliff output of scripts/release/release-notes.sh, the same file the
# release workflow passes as the body of the GitHub release, so each section of a CHANGELOG
# equals the GitHub release with the same tag.
#
# Usage (from the repository root):
#   ./scripts/release/changelog.sh <package-dir> <notes-file>
#
#   package-dir  the directory of the package.json; the CHANGELOG.md goes next to it
#   notes-file   notes starting with their '## [<tag>] - <date>' heading
#
# Creates the file, with its header, on the first release. Leaves it alone when the notes are
# empty (git-cliff failed: the release workflow already warns about it) or when the file
# already has a section for the tag, so running it twice for one release changes nothing.
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "usage: $0 <package-dir> <notes-file>" >&2
  exit 1
fi

DIR="$1"
NOTES="$2"
FILE="$DIR/CHANGELOG.md"

if ! grep -q '[^[:space:]]' "$NOTES" 2> /dev/null; then
  echo "$NOTES is empty: $FILE left as it is"
  exit 0
fi

HEADING=$(sed -n '1p' "$NOTES")
if ! printf '%s' "$HEADING" | grep -qE '^## \[[^]]+\]'; then
  echo "::error::$NOTES does not start with a '## [<tag>] - <date>' heading" >&2
  exit 1
fi
TAG=$(printf '%s' "$HEADING" | sed -E 's/^## \[([^]]+)\].*/\1/')

if [ -f "$FILE" ] && grep -qF "## [$TAG]" "$FILE"; then
  echo "$FILE already has $TAG"
  exit 0
fi

if [ ! -f "$FILE" ]; then
  PACKAGE=$(jq -r '.name' "$DIR/package.json")
  RELEASED_WITH="${TAG%@*}"
  {
    echo '# Changelog'
    echo
    echo "Every release of \`$PACKAGE\`, newest first. Each section is the body of the GitHub"
    echo 'release with the same tag, written by git-cliff from the conventional commits of the'
    echo 'package.'
    if [ "${PACKAGE##*/}" != "$RELEASED_WITH" ]; then
      echo
      echo "It is released together with \`$RELEASED_WITH\`, at the same version: the sections are the"
      echo "releases of \`$RELEASED_WITH\`."
    fi
  } > "$FILE"
fi

# the header is everything before the first release section; the new section goes after it
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT
awk -v notes="$NOTES" '
  function print_notes(   line) {
    while ((getline line < notes) > 0) print line
    close(notes)
    print ""
  }
  !done && /^## \[/ { print_notes(); done = 1 }
  { print }
  END {
    if (!done) {
      print ""
      print_notes()
    }
  }
' "$FILE" | cat -s > "$TMP"
# no blank line at the end of the file
awk '{ line[NR] = $0 } END { n = NR; while (n > 0 && line[n] ~ /^[[:space:]]*$/) n--; for (i = 1; i <= n; i++) print line[i] }' \
  "$TMP" > "$FILE"
echo "$FILE: added $TAG"
