import chalk from 'chalk'
import path from 'path'
import { DIST_DIR } from './meta'
import { cp } from 'fs/promises'

const PROPS_DIR = path.resolve(__dirname, '../properties')
const TOKENS_DIR = path.resolve(__dirname, '../css-tokens')

const copy = async (src: string, dest: string) => {
  await cp(src, path.join(dest, path.basename(src)), { force: true, recursive: true })
    .then(() => {
      console.log(`Directory ${chalk.green(path.basename(src))} was ${chalk.green('successfully')} copied`)
    }).catch(error => {
      throw Error(chalk.red(error))
    })
}

copy(PROPS_DIR, path.join(DIST_DIR, path.basename(PROPS_DIR)))
copy(TOKENS_DIR, path.join(DIST_DIR, path.basename(TOKENS_DIR)))
