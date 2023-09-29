import chalk from 'chalk'
import { join } from 'path'
import { TEST_REGRESSION_DIR } from './meta'
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

console.info('Cleaning regression tests')
cleanDir(join(TEST_REGRESSION_DIR, 'current'))
cleanDir(join(TEST_REGRESSION_DIR, 'difference'))
cleanDir(join(TEST_REGRESSION_DIR, 'reference'))
