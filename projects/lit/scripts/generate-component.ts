import chalk from 'chalk'
import { ask } from 'stdio'
import Handlebars from 'handlebars'
import { join } from 'path'
import { copyFile, cp, mkdir, readFile, rename, stat, writeFile } from 'fs/promises'
import { createComponentInstance, checkComponentExistance } from './lib'
import { logStatus, logFileSavedTo, dontUseWithNX } from '../../../scripts/log'

let componentNameArgument = ''
let nonInteractive = true


if (process.argv.length === 3) {
  componentNameArgument = process.argv[2].split('=')[1]
  nonInteractive = true
  console.info(`${chalk.yellow('Non-interactive mode')} using ${componentNameArgument} component name`)
}

if (!nonInteractive) {
  dontUseWithNX()
}

const generateComponent = async (): Promise<void> => {
  let componentName = ''

  if (!nonInteractive){
    const inputName = await ask('Component name mds-')
    componentName = `mds-${inputName}`
  } else {
    componentName = componentNameArgument
  }

  if (componentName === '') {
    throw Error(chalk.red('Missing component name defined by --component=mds-component-name in the command'))
  }

  const exist = await checkComponentExistance(componentName)

  if (!exist) {
    await createComponentInstance(componentName)
  }
}

const main = async (): Promise<void> => {
  console.info(`This script will ${chalk.green('generate')} a lit component and it's assets.`)

  if (!nonInteractive) {
    const continueTask = await ask('Continue?', { options: ['Y', 'n', ''] })
    if (continueTask === 'n') {
      return
    }
  }
  await generateComponent()
}

main()
