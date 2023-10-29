import path from 'path'
import { BUILD_DIR, DIST_DIR, DIST_STORYBOOK_ICONS_DIR, DIST_STORYBOOK_DIR, ICONSAUCE_DIR, LOADER_DIR, SRC_DIR, WWW_DIR, DIST_STORYBOOK_CACHE_DIR } from './meta'
import { cleanDir } from './lib'

console.info('Cleaning build')
cleanDir(BUILD_DIR)
cleanDir(DIST_DIR)
cleanDir(DIST_STORYBOOK_ICONS_DIR)
cleanDir(DIST_STORYBOOK_CACHE_DIR)
cleanDir(DIST_STORYBOOK_DIR)
cleanDir(ICONSAUCE_DIR)
cleanDir(LOADER_DIR)
cleanDir(WWW_DIR)
cleanDir(path.join(SRC_DIR, 'components.d.ts'))
