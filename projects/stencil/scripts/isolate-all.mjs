import { ask } from 'stdio'
import chalk from 'chalk'
import dirTree from 'directory-tree'
import {
  dirname,
  resolve,
} from 'path'
import { fileURLToPath } from 'url'

const PROJECT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../')
const COMPONENTS_PATH = `${PROJECT_PATH}/src/components`

import { createTempProjectInstance } from './lib.mjs'

async function main () {
  console.log(
    `This script will ${chalk.green(
      'isolate ALL',
    )} stencil components and package.json global configuration into a set of specific components as isolated projects, ready to be published.`,
  )

  const continueTask = await ask('Continue?', { options: ['Y', 'n', ''] })

  if (continueTask === 'n') {
    return
  }

  await isolateAll()

}

const isolateAll = async () => {
  dirTree(COMPONENTS_PATH, {
    extensions: /\.json$/,
  },
  async (item, PATH) => {
    const componentName = PATH.replace(COMPONENTS_PATH, '').replace('package.json', '').replaceAll('/', '')
    console.log(`Isolating component ${chalk.green('%s')}`, componentName)
    await createTempProjectInstance(componentName)
  })
}

main()
