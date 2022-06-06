import path from 'path'
const PROJECT_DIR = path.resolve(__dirname, '../')
const BUILD_DIR = path.resolve(PROJECT_DIR, '.build')
const DIST_DIR = path.resolve(PROJECT_DIR, 'dist')
const DIST_STORYBOOK_DIR = path.resolve(PROJECT_DIR, 'dist-storybook')
const FIXTURES_DIR = path.resolve(PROJECT_DIR, 'src/fixtures')
const ICONSAUCE_DIR = path.resolve(PROJECT_DIR, '.iconsauce')
const LOADER_DIR = path.resolve(PROJECT_DIR, 'loader')
const SRC_DIR = path.resolve(PROJECT_DIR, 'src')
const COMPONENTS_DIR = path.resolve(SRC_DIR, 'components')
const TEST_REGRESSION_DIR = path.resolve(PROJECT_DIR, '.loki')
const WWW_DIR = path.resolve(PROJECT_DIR, 'www')

export {
  BUILD_DIR,
  COMPONENTS_DIR,
  DIST_DIR,
  DIST_STORYBOOK_DIR,
  FIXTURES_DIR,
  ICONSAUCE_DIR,
  LOADER_DIR,
  PROJECT_DIR,
  SRC_DIR,
  TEST_REGRESSION_DIR,
  WWW_DIR,
}
