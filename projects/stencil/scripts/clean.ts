import chalk from 'chalk'
import path from 'path'
import { BUILD_DIR, DIST_DIR, DIST_STORYBOOK_ICONS_DIR, DIST_STORYBOOK_DIR, ICONSAUCE_DIR, LOADER_DIR, SRC_DIR, WWW_DIR } from './meta'
import { remove } from 'fs-extra'
import { logDirectoryDeleted } from '../../../scripts/log'

const cleanDir = async (dir: string) => {
  await remove(dir)
    .catch(error => {
      throw Error(chalk.red(error))
    })
  logDirectoryDeleted(dir)
}

console.log('Cleaning build')
cleanDir(BUILD_DIR)
cleanDir(DIST_DIR)
cleanDir(DIST_STORYBOOK_ICONS_DIR)
// cleanDir(DIST_STORYBOOK_CACHE_DIR)
cleanDir(DIST_STORYBOOK_DIR)
cleanDir(ICONSAUCE_DIR)
cleanDir(LOADER_DIR)
cleanDir(WWW_DIR)
cleanDir(path.join(SRC_DIR, 'components.d.ts'))
