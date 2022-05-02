import chalk from 'chalk'
import dirTree from 'directory-tree'
import { writeFile } from 'fs/promises'

const createDirectoryTree = () => {
  const tree = dirTree('dist/', {
    extensions: /\.(svg|png|pdf)$/,
  })

  const jsonData = JSON.stringify(tree, null, 2)
  writeFile('dist/directory-tree.json', jsonData, { encoding: 'utf8' })
    .then(() => {
      console.log(`Files inventory directory-tree.json ${chalk.green('successfully')} created.`)
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

createDirectoryTree()
