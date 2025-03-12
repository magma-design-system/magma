import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import { DIST_DIR, CSS_TOKENS_DIR, TOKENS_DIR } from './meta'
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

/**
 * recursively copies files from a folder to another folder while maintaining the structure
 * @param src src path
 * @param dest destination path
 * @param extensions if present, copy files that match the extension, otherwise copy all files
 */
function copyFiles (src: string, dest: string, extensions?: string[]) {
  const files = fs.readdirSync(src)

  files.forEach(file => {
    const srcPath = path.join(src, file)
    const destPath = path.join(dest, file)

    if (fs.statSync(srcPath).isDirectory()) {
      copyFiles(srcPath, destPath, extensions)
    } else if (!extensions || extensions?.includes(srcPath.split('.')[1])) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true })
      }
      fs.copyFileSync(srcPath, destPath)
    }
  })
}

const srcDir = './src'
const destDir = './dist/src'

copyDir(TOKENS_DIR, path.join(DIST_DIR, 'style-dictionary'))
copyDir(CSS_TOKENS_DIR, path.join(DIST_DIR, 'json'))
// copy handlebars files needed by cli
copyFiles(srcDir, destDir, ['hbs'])
