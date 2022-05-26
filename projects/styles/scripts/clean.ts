import chalk from 'chalk'
import path from 'path'
import { DIST_DIR } from './meta'
import { rm } from 'fs/promises'
import { mkdir } from 'fs-extra'
import { logDirectoryDeleted, logDirectoryCreated } from '../../../scripts/log'

const createDirectory = async (dir: string) => {
  mkdir(dir, { recursive: true })
    .then(() => {
      logDirectoryCreated(dir, DIST_DIR)
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

rm(DIST_DIR, { force: true, recursive: true })
  .then(() => {
    logDirectoryDeleted(DIST_DIR)
    createDirectory(path.join(DIST_DIR, 'css'))
    createDirectory(path.join(DIST_DIR, 'tailwind'))
  }).catch(error => {
    throw Error(chalk.red(error))
  })
