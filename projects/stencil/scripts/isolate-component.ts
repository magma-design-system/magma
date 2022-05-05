import chalk from 'chalk'
import { ask } from 'stdio'
import { createTempProjectInstance, compilePackage } from './lib'
import { stat } from 'fs/promises'
import { COMPONENTS_DIR } from './meta'

let componentNameArgument = ''
let nonInteractive = false

const checkComponentWasBuilt = async (componentName: string) => {
  return await stat(`${COMPONENTS_DIR}/${componentName}/readme.md`)
    .then(statInfo => statInfo.isFile())
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const checkComponentExistance = async (componentName: string) => {
  return await stat(`${COMPONENTS_DIR}/${componentName}`)
    .then(statInfo => statInfo.isDirectory())
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const askComponentName = async () => {
  let componentName = ''

  if (!nonInteractive){
    const inputName = await ask('Component name mds-')
    componentName = `mds-${inputName}`
  } else {
    componentName = componentNameArgument
  }

  const exist = await checkComponentExistance(componentName)

  if (!exist) {
    console.log(`Component ${componentName} ${chalk.red('not found')}`)

    if (!nonInteractive) {
      await askComponentName()
    } else {
      return
    }
  } else {
    const built = await checkComponentWasBuilt(componentName)

    if (!built) {
      console.log(`Component ${componentName} ${chalk.redBright('build error')}`)
      return
    }

    console.log(`Isolating component ${chalk.green('%s')}`, componentName)
    await compilePackage(componentName)
    await createTempProjectInstance(componentName)
  }
}

if (process.argv.length === 3) {
  componentNameArgument = process.argv[2].split('=')[1]
  nonInteractive = true
  console.log(`${chalk.yellow('Non-interactive mode')} using ${componentNameArgument} component name`)
}

const main = async () => {
  console.log(`This script will ${chalk.green('isolate')} a stencil component and will create package.json if missing into a an isolated stencil project, ready to be published`)

  if (!nonInteractive){
    const continueTask = await ask('Continue?', { options: ['Y', 'n', ''] })
    if (continueTask === 'n') {
      return
    }
  }
  await askComponentName()
}

main()
