import chalk from 'chalk'
import path from 'path'
import { DIST_DIR } from './meta'
import { rm } from 'fs/promises'

rm(DIST_DIR, { force: true, recursive: true })
  .then(() => {
    console.log(`Directory ${chalk.green(path.basename(DIST_DIR))} was deleted ${chalk.green('successfully')} ${chalk.gray('(or skipped if missing)')}`)
  }).catch(error => {
    throw Error(chalk.red(error))
  })
