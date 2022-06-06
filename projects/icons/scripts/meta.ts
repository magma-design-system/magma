import path from 'path'
const ROOT_DIR = path.join(__dirname, '../')
const DIST_DIR = path.resolve(__dirname, '../dist')
const ORIGINAL_DIR = path.join(DIST_DIR, 'original')

export {
  ROOT_DIR,
  ORIGINAL_DIR,
  DIST_DIR,
}
