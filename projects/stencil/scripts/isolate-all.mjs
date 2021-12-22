import { ask } from 'stdio'
import chalk from 'chalk'
import dirTree from 'directory-tree'
import {
  copyFile,
  cp,
  mkdir,
  readFile,
  rename,
  stat,
  writeFile,
} from 'fs/promises'
import {
  dirname,
  resolve,
} from 'path'
import { fileURLToPath } from 'url'

const PROJECT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../')

const COMPONENTS_PATH = `${PROJECT_PATH}/src/components`
const TEMPLATES_PATH = `${PROJECT_PATH}/template`
const TEMP_PROJECT_PATH = `${PROJECT_PATH}/.build`

async function main () {
  console.log(
    `This script will ${chalk.green(
      'scaffold ALL',
    )} stencil components and package.json global configuration into a set of specific components as isolated projects, ready to be published.`,
  )

  const continueTask = await ask('Continue?', { options: ['Y', 'n', ''] })

  if (continueTask === 'n') {
    return
  }

  await scaffoldAll()

  console.log('Process finished.')
}

const scaffoldAll = async () => {
  console.log('ciao')
}

main()
