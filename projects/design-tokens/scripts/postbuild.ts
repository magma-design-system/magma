import chalk from 'chalk'
import path from 'path'
import { DIST_DIR, CSS_TOKENS_DIR, PROPS_DIR } from './meta'
import { copy } from 'fs-extra'

const copyDir = async (src: string, dest: string) => {
  await copy(src, path.join(dest, path.basename(src)))
    .then(() => {
      console.log(`Directory ${chalk.green(path.basename(src))} copied ${chalk.green('successfully')}`)
    }).catch(error => {
      throw Error(chalk.red(error))
    })
}

copyDir(PROPS_DIR, DIST_DIR)
copyDir(CSS_TOKENS_DIR, DIST_DIR)
