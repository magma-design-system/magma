import chalk from 'chalk'
import { ask } from 'stdio'
import { checkComponentExistance, compileTemplateFile, copyTemplateFile } from './lib'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import { COMPONENTS_DIR } from './meta'
import { dontUseWithNX } from '../../../scripts/log'

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

const createComponentInstance = async (componentName: string): Promise<void> => {

  await mkdir(join(COMPONENTS_DIR, componentName), { recursive: true }).catch(error => { throw Error(chalk.red(error)) })
  await compileTemplateFile(componentName, 'package.json.handlebars', 'package.json')
  await copyTemplateFile(componentName, 'postcss.config.cjs')
  await copyTemplateFile(componentName, 'tailwind.config.cjs')
  await copyTemplateFile(componentName, 'tsconfig.json')
  await copyTemplateFile(componentName, 'tsconfig.node.json')
  await copyTemplateFile(componentName, 'vite.config.ts')
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
