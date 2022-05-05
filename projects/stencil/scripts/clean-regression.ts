import chalk from 'chalk'
import { basename, join } from 'path'
import { TEST_REGRESSION_DIR } from './meta'
import { rm } from 'fs/promises'

const cleanDir = async (dir: string) => {
  rm(dir, { force: true, recursive: true })
    .then(() => {
      console.log(`Directory ${chalk.green(basename(dir))} deleted ${chalk.green('successfully')} ${chalk.gray('(or skipped if missing)')}`)
    }).catch(error => {
      throw Error(chalk.red(error))
    })
}

console.log('Cleaning regression tests')
cleanDir(join(TEST_REGRESSION_DIR, 'current'))
cleanDir(join(TEST_REGRESSION_DIR, 'difference'))
cleanDir(join(TEST_REGRESSION_DIR, 'reference'))
