import chalk from 'chalk'
import dirTree from 'directory-tree'
import { ask } from 'stdio'
import { dirname } from 'path'
import { createTempProjectInstance } from './lib'
import { COMPONENTS_DIR } from './meta'
import { logStatus } from '../../../scripts/log'

const isolateAll = async () => {
  dirTree(COMPONENTS_DIR, {
    extensions: /\.json$/,
  },
  async (_item: dirTree.DirectoryTree, itemPath: string) => {
    const componentName = dirname(itemPath)
    logStatus({
      actionDoing: 'Isolating',
      subject: componentName,
    })
    await createTempProjectInstance(componentName)
  })
}

const main = async () => {
  console.log(
    `This script will ${chalk.green(
      'isolate ALL',
    )} stencil components with package.json already created into a set of isolated separate projects, ready to be individually published.`,
  )
  const continueTask = await ask('Continue?', { options: ['Y', 'n', ''] })

  if (continueTask === 'n') {
    return
  }
  await isolateAll()
}

main()
