import chalk from 'chalk'
import { DIST_DIR } from './meta'
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

cleanDir(DIST_DIR)
