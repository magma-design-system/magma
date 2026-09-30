import path from 'path';
const PROJECT_DIR = path.resolve(__dirname, '../');
const DIST_DIR = path.resolve(PROJECT_DIR, 'dist');
// Staging dir for generated CSS artifacts, kept out of the hand-authored source
// dirs (css/, tailwind/). Gitignored; the copy step ships its contents to dist.
const BUILD_DIR = path.resolve(PROJECT_DIR, 'build');
const TEMPLATES_DIR = path.resolve(PROJECT_DIR, 'templates');

export { DIST_DIR, BUILD_DIR, PROJECT_DIR, TEMPLATES_DIR };
