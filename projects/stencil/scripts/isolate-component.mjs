import { ask } from 'stdio'
import chalk from 'chalk'
import { stat } from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const PROJECT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../')
const COMPONENTS_PATH = `${PROJECT_PATH}/src/components`

import { createTempProjectInstance, compilePackage } from './lib.mjs'

var componentNameArgument = ""
var nonInteractive = false

console.log(process.argv)
if (process.argv.length === 3){
  componentNameArgument = process.argv[2].split("=")[1]
  nonInteractive = true
  console.log(
    chalk.red(`Non-interactive Mode: using ${componentNameArgument} component name.`),
  )
}


async function main () {
  console.log(
    `This script will ${chalk.green(
      'isolate',
    )} a stencil component and will create package.json if missing into a an isolated stencil project, ready to be published.`,
  )

  if (!nonInteractive){
    const continueTask = await ask('Continue?', { options: ['Y', 'n', ''] })

    if (continueTask === 'n') {
      return
    }
  }

  await askComponentName()

  console.log('Process finished.')
}

async function askComponentName () {
  var componentName = ""

  if (!nonInteractive){
    const inputName = await ask('Component name mds-')
    componentName = `mds-${inputName}`
  } else
    componentName = componentNameArgument

  const exist = await checkComponentExistance(componentName)

  if (!exist) {
    console.log(
      chalk.red(`Component ${componentName} does not exist, please try again.`),
    )
    if (!nonInteractive)
      await askComponentName(componentName)
    else
      return
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
