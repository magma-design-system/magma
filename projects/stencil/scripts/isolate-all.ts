import chalk from 'chalk'
import dirTree from 'directory-tree'
import { ask } from 'stdio'
import { dirname } from 'path'
import { createTempProjectInstance } from './lib'
import { COMPONENTS_DIR } from './meta'

const isolateAll = async () => {
  dirTree(COMPONENTS_DIR, {
    extensions: /\.json$/,
  },
  async (_item: dirTree.DirectoryTree, itemPath: string) => {
    const componentName = dirname(itemPath)
    console.log(`Isolating component ${chalk.green('%s')}`, componentName)
    await createTempProjectInstance(componentName)
  })
}

const main = async () => {
  console.log(
    `This script will ${chalk.green(
      'isolate ALL',
    )} stencil components with package.json already created into a set of isolated stencil projects, ready to be published.`,
  )
  const continueTask = await ask('Continue?', { options: ['Y', 'n', ''] })

  if (continueTask === 'n') {
    return
  }
  await isolateAll()
}

main()
