import chalk from 'chalk'
import path from 'path'
import { DIST_DIR, CSS_TOKENS_DIR, PROPS_DIR } from './meta'
import { copy } from 'fs-extra'
import { logDirectoryCopied } from '../../../scripts/log'

const copyDir = async (src: string, dest: string) => {
  await copy(src, path.join(dest, path.basename(src)))
    .then(() => {
      logDirectoryCopied(src, dest)
    }).catch(error => {
      throw Error(chalk.red(error))
    })
}

copyDir(PROPS_DIR, DIST_DIR)
copyDir(CSS_TOKENS_DIR, DIST_DIR)
