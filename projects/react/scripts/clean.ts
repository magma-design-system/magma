import chalk from 'chalk'
import { DIST_DIR } from './meta'
import { rm } from 'fs/promises'
import { logDirectoryDeleted } from '../../../scripts/log'

rm(DIST_DIR, { force: true, recursive: true })
  .then(() => {
    logDirectoryDeleted(DIST_DIR)
  }).catch(error => {
    throw Error(chalk.red(error))
  })
