import { DIST_STORYBOOK_CACHE_DIR, DIST_STORYBOOK_MANAGER_CACHE_DIR } from './meta'
import { cleanDir } from './lib'

console.info('Cleaning Storybook cache')
cleanDir(DIST_STORYBOOK_CACHE_DIR)
cleanDir(DIST_STORYBOOK_MANAGER_CACHE_DIR)

