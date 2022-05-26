import chalk from 'chalk'
import path from 'path'
import { BUILD_DIR, DIST_DIR, DIST_STORYBOOK_DIR, ICONSAUCE_DIR, LOADER_DIR, SRC_DIR, WWW_DIR } from './meta'
import { rm } from 'fs/promises'
import { logDirectoryDeleted } from '../../../scripts/log'

const cleanDir = async (dir: string) => {
  rm(dir, { force: true, recursive: true })
    .then(() => {
      logDirectoryDeleted(dir)
    }).catch(error => {
      throw Error(chalk.red(error))
    })
}

console.log('Cleaning build')
cleanDir(BUILD_DIR)
cleanDir(ICONSAUCE_DIR)
cleanDir(path.join(SRC_DIR, 'components.d.ts'))
cleanDir(DIST_DIR)
cleanDir(DIST_STORYBOOK_DIR)
cleanDir(LOADER_DIR)
cleanDir(WWW_DIR)
