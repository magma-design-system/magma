import chalk from 'chalk'
import dirTree from 'directory-tree'
import path from 'path'
import { writeFile } from 'fs/promises'
import { logFileSavedTo } from '../../../scripts/log'
import { DIST_DIR } from './meta'

const fileDirTree = 'directory-tree.json'

const createDirectoryTree = () => {
  const tree = dirTree('dist/', {
    extensions: /\.(svg|png|pdf)$/,
  })

  const jsonData = JSON.stringify(tree, null, 2)
  writeFile(path.join(DIST_DIR, fileDirTree), jsonData, { encoding: 'utf8' })
    .then(() => {
      logFileSavedTo(fileDirTree, DIST_DIR)
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

createDirectoryTree()
