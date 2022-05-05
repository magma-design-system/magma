import chalk from 'chalk'
import path from 'path'
import { DIST_DIR } from './meta'
import { copy } from 'fs-extra'

const PROPS_DIR = path.resolve(__dirname, '../properties')
const TOKENS_DIR = path.resolve(__dirname, '../css-tokens')

const copyDir = async (src: string, dest: string) => {
  await copy(src, path.join(dest, path.basename(src)))
    .then(() => {
      console.log(`Directory ${chalk.green(path.basename(src))} copied ${chalk.green('successfully')}`)
    }).catch(error => {
      throw Error(chalk.red(error))
    })
}

copyDir(PROPS_DIR, path.join(DIST_DIR, path.basename(PROPS_DIR)))
copyDir(TOKENS_DIR, path.join(DIST_DIR, path.basename(TOKENS_DIR)))
