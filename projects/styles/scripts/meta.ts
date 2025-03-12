import path from 'path'
const PROJECT_DIR = path.resolve(__dirname, '../')
const DIST_DIR = path.resolve(PROJECT_DIR, 'dist')
const TEMPLATES_DIR = path.resolve(PROJECT_DIR, 'templates')

export {
  DIST_DIR,
  PROJECT_DIR,
  TEMPLATES_DIR,
}
