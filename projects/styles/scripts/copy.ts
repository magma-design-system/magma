import chalk from 'chalk'
import path from 'path'
import { DIST_DIR, PROJECT_DIR } from './meta'
import { copy } from 'fs-extra'
import { logDirectoryCopied } from '../../../scripts/log'

const copyDirectory = async (src: string, dest: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    copy(path.join(src), dest)
      .then(() => {
        logDirectoryCopied(src, dest)
        resolve()
      })
      .catch(error => {
        reject()
        throw Error(chalk.red(error))
      })
  })
}

const main = async () => {
  await copyDirectory(path.join(PROJECT_DIR, 'tailwind'), path.join(DIST_DIR, 'tailwind'))
  await copyDirectory(path.join(PROJECT_DIR, 'css'), path.join(DIST_DIR, 'css'))
  await copyDirectory(path.join(PROJECT_DIR, '../design-tokens/dist/css'), path.join(DIST_DIR, 'css'))
}

main()

