import path from 'path'
const PROJECT_DIR = path.resolve(__dirname, '../')
const DIST_DIR = path.resolve(PROJECT_DIR, 'dist')
const BUILD_DIR = path.resolve(DIST_DIR, 'svg')
const ICONS_DIR = path.resolve(PROJECT_DIR, 'svg')

export {
  BUILD_DIR,
  DIST_DIR,
  ICONS_DIR,
  PROJECT_DIR,
}
