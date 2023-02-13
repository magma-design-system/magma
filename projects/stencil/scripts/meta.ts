import { resolve, join } from 'path'
const PROJECT_DIR = resolve(__dirname, '../')
const PROJECT_SVG_ICONS_DIR = resolve(__dirname, '../../svg-icons')
const SVG_ICONS_DIST_DIR = resolve(PROJECT_SVG_ICONS_DIR, 'dist')
const BUILD_DIR = resolve(PROJECT_DIR, '.build')
const DIST_DIR = resolve(PROJECT_DIR, 'dist')
const DIST_STORYBOOK_DIR = resolve(PROJECT_DIR, 'dist-storybook')
const FIXTURES_DIR = resolve(PROJECT_DIR, 'src/fixtures')
const ICONSAUCE_DIR = resolve(PROJECT_DIR, '.iconsauce')
const LOADER_DIR = resolve(PROJECT_DIR, 'loader')
const SRC_DIR = resolve(PROJECT_DIR, 'src')
const COMPONENTS_DIR = resolve(SRC_DIR, 'components')
const TEST_REGRESSION_DIR = resolve(PROJECT_DIR, '.loki')
const WWW_DIR = resolve(PROJECT_DIR, 'www')

const TEMPLATES_DIR = join(PROJECT_DIR, 'template')
const TEMP_PROJECT_DIR = join(PROJECT_DIR, '.build')

export {
  BUILD_DIR,
  COMPONENTS_DIR,
  DIST_DIR,
  SVG_ICONS_DIST_DIR,
  DIST_STORYBOOK_DIR,
  FIXTURES_DIR,
  ICONSAUCE_DIR,
  LOADER_DIR,
  PROJECT_DIR,
  SRC_DIR,
  TEMP_PROJECT_DIR,
  TEMPLATES_DIR,
  TEST_REGRESSION_DIR,
  WWW_DIR,
}
