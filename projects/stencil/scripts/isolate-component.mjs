import { ask } from 'stdio'
import chalk from 'chalk'
import { stat } from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const PROJECT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../')
const COMPONENTS_PATH = `${PROJECT_PATH}/src/components`

import { createTempProjectInstance, compilePackage } from './lib.mjs'

async function main () {
  console.log(
    `This script will ${chalk.green(
      'isolate',
    )} stencil and package.json global configuration into a specific component as isolated project, ready to be published.`,
  )

  const continueTask = await ask('Continue?', { options: ['Y', 'n', ''] })

  if (continueTask === 'n') {
    return
  }

  await askComponentName()

  console.log('Process finished.')
}

async function askComponentName () {
  const inputName = await ask('Component name mds-')
  const componentName = `mds-${inputName}`

  const exist = await checkComponentExistance(componentName)

  if (!exist) {
    console.log(
      chalk.red(`Component ${componentName} does not exist, please try again.`),
    )
    await askComponentName()
  } else {
    const built = await checkComponentWasBuilt(componentName)

    if (!built) {
      console.log(
        chalk.redBright(
          `Component ${componentName} was not built, build it then try again.`,
        ),
      )
      return
    }

    console.log(`Isolating component ${chalk.green('%s')}`, componentName)
    await compilePackage(componentName)
    await createTempProjectInstance(componentName)
  }
}

async function checkComponentWasBuilt (componentName) {
  return stat(`${COMPONENTS_PATH}/${componentName}/readme.md`)
    .then(fsStat => fsStat.isFile())
    .catch(() => false)
}

async function checkComponentExistance (componentName) {
  return stat(`${COMPONENTS_PATH}/${componentName}`)
    .then(fsStat => fsStat.isDirectory())
    .catch(() => false)
}


main()
