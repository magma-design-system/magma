import chalk from 'chalk'
import path from 'path'
import { DIST_DIR } from './meta'
import { rm } from 'fs/promises'
import { mkdir } from 'fs-extra'

const createDirectory = async (dir: string) => {
  mkdir(dir, { recursive: true })
    .then(() => {
      console.log(`Directory ${chalk.green(path.basename(dir))} was ${chalk.greenBright('created')} ${chalk.green('successfully')} ${chalk.gray('(or skipped if already exists)')}`)
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

rm(DIST_DIR, { force: true, recursive: true })
  .then(() => {
    console.log(`Directory ${chalk.green(path.basename(DIST_DIR))} was ${chalk.redBright('deleted')} ${chalk.green('successfully')} ${chalk.gray('(or skipped if missing)')}`)
    createDirectory(path.join(DIST_DIR, 'css'))
    createDirectory(path.join(DIST_DIR, 'tailwind'))
  }).catch(error => {
    throw Error(chalk.red(error))
  })
