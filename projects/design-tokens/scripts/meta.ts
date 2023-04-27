import path from 'path'
const DIST_DIR = path.resolve(__dirname, '../dist')
const PROPS_DIR = path.resolve(__dirname, '../properties')
const TOKENS_DIR = path.resolve(__dirname, '../tokens')
const CSS_TOKENS_DIR = path.resolve(TOKENS_DIR, './css')

export {
  CSS_TOKENS_DIR,
  DIST_DIR,
  PROPS_DIR,
  TOKENS_DIR,
}
