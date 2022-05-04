import chalk from 'chalk'
import path from 'path'
import { DIST_DIR } from './meta'
import { copy } from 'fs-extra'

const copyDirectory = async (src: string, dest: string) => {
  copy(path.join(src), dest)
    .then(() => {
      console.log(`Directory ${chalk.green(src)} was ${chalk.greenBright('copied')} ${chalk.green('successfully')} ${chalk.gray('(or skipped if already exists)')}`)
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

copyDirectory('tailwind', path.join(DIST_DIR, 'tailwind'))
copyDirectory('../design-tokens/dist/css', path.join(DIST_DIR, 'css'))
