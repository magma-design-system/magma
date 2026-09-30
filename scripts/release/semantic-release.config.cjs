// semantic-release configuration of the release workflows and of
// scripts/test-release.sh. It only runs as a dry-run that detects the next
// version: tagging, the release commit and publishing happen in the workflows.
//
// Values come from the environment, so one file serves every package:
//   SR_TAG_FORMAT       tagFormat and git tag, e.g. 'styles@${version}'
//   SR_COMMIT_SCOPE     '|'-separated scope tokens of the package (globs allowed,
//                       e.g. 'magma|stencil|mds-*'); empty = every commit counts
//   SR_STABLE_BRANCHES  space-separated branches allowed to release stable
//                       versions (default 'main')
//   GITHUB_REF_NAME     the branch being released
// The branch being released is used as the stable branch when listed in
// SR_STABLE_BRANCHES, the first entry otherwise, which makes runs on unlisted
// branches a graceful no-op. `beta` is always the prerelease channel.
//
// When there is a release, release-version.txt gets the next version (line 1)
// and the tag of the last release it builds on (line 2, empty on a first
// release): the release notes cover the same commits.
const { join } = require('node:path');

const stableBranches = (process.env.SR_STABLE_BRANCHES || 'main').split(/\s+/).filter(Boolean);
const stable = stableBranches.includes(process.env.GITHUB_REF_NAME)
  ? process.env.GITHUB_REF_NAME
  : stableBranches[0];

module.exports = {
  branches: [stable, { name: 'beta', prerelease: true }],
  tagFormat: process.env.SR_TAG_FORMAT,
  plugins: [
    [
      join(__dirname, 'scoped-commit-analyzer.mjs'),
      { preset: 'conventionalcommits', scope: process.env.SR_COMMIT_SCOPE },
    ],
    [
      '@semantic-release/exec',
      {
        verifyReleaseCmd:
          'printf "%s\\n%s\\n" "${nextRelease.version}" "${lastRelease.gitTag}" > release-version.txt',
      },
    ],
  ],
};
