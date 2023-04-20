import chalk from 'chalk'
import { ask } from 'stdio'
import { createTempProjectInstance, compilePackage, compileTemplateFile, checkComponentExistance, checkComponentWasBuilt } from './lib'
import { logStatus, dontUseWithNX } from '../../../scripts/log'

let componentNameArgument = ''
let nonInteractive = false

if (process.argv.length === 3) {
  componentNameArgument = process.argv[2].split('=')[1]
  nonInteractive = true
  console.log(`${chalk.yellow('Non-interactive mode')} using ${componentNameArgument} component name`)
}

if (!nonInteractive) {
  dontUseWithNX()
}

const isolateComponent = async () => {
  let componentName = ''

  if (!nonInteractive){
    const inputName = await ask('Component name mds-')
    componentName = `mds-${inputName}`
  } else {
    componentName = componentNameArgument
  }

  const exist = await checkComponentExistance(componentName)

  if (!exist) {
    console.log(`Component ${componentName} ${chalk.red('not found')}, create it with ${chalk.blue('nx run stencil:generate')} first or enter another component name.`)

    if (!nonInteractive) {
      await isolateComponent()
    } else {
      return
    }
  } else {
    const built = await checkComponentWasBuilt(componentName)

    if (!built) {
      console.log(`Component ${componentName} ${chalk.redBright('build error')}`)
      return
    }
    logStatus({
      actionDoing: 'Isolating',
      subject: componentName,
    })
    await compilePackage(componentName)
    await compileTemplateFile(componentName, '.gitlab-ci.yml')
    await createTempProjectInstance(componentName)
  }
}

const main = async (): Promise<void> => {
  console.log(`This script will ${chalk.green('isolate')} a stencil component and will create package.json if missing into a an isolated stencil project, ready to be published`)

  if (!nonInteractive) {
    const continueTask = await ask('Continue?', { options: ['Y', 'n', ''] })
    if (continueTask === 'n') {
      return
    }
  }
  await isolateComponent()
}

main()
