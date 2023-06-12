import Handlebars from 'handlebars'
import chalk from 'chalk'
import { COMPONENTS_DIR, TEMPLATES_DIR } from './meta'
import { ask } from 'stdio'
import { checkComponentExistance, checkComponentWasBuilt } from './lib'
import { join } from 'path'
import { dontUseWithNX, logStatus } from '../../../scripts/log'
import { readFile, writeFile } from 'fs/promises'

dontUseWithNX()

const stencilComment = '\n<!-- Auto Generated Below -->'
const magmaComment = '<!-- Start script-generated Magma Docs -->'
const componentNamePrefix = 'mds-'

const capitalizeWord = (componentName: string) => componentName.replace('-', ' ').split(' ').map((word: string) => `${word[0].toUpperCase()}${word.slice(1, word.length)}`).join('')

const overwriteDoc = async (componentName: string) => {
  const componentDocPath = join(COMPONENTS_DIR, componentName, 'readme.md')
  const readme = await readFile(componentDocPath).catch(error => { throw new Error(chalk.red(error)) })
  const readmeTemplate = await readFile(join(TEMPLATES_DIR, 'readme.md')).catch(error => { throw new Error(chalk.red(error)) })

  const oldDoc = readme.toString()

  if (oldDoc.indexOf(magmaComment) !== -1) {
    console.log(chalk.red('Documentation already generated for this component'))
    return
  }

  const data = {
    componentName,
    capitalizedComponentName: capitalizeWord(componentName),
    componentNameWithNoPrefix: componentName.split(componentNamePrefix)[1],
  }

  const template = Handlebars.compile(readmeTemplate.toString())
  const datas = template(data)
  const newDoc = oldDoc.split(stencilComment).join(`${datas}${stencilComment}`)

  await writeFile(componentDocPath, newDoc, { encoding: 'utf8' }).then(() => console.log('File overwrite')).catch(error => { throw new Error(chalk.red(error)) })
}

const main = async () => {
  const inputName = await ask('Component name mds-')
  const componentName = `${componentNamePrefix}${inputName}`

  const exist = await checkComponentExistance(componentName)

  if (!exist) {
    console.log(`Component ${componentName} ${chalk.red('not found')}, create it with ${chalk.blue('nx run stencil:generate')} first or enter another component name.`)
    return
  }

  const built = await checkComponentWasBuilt(componentName)

  if (!built) {
    console.log(`Component ${componentName} ${chalk.redBright('build error')}`)
    return
  }

  logStatus({
    actionDoing: 'Doc from template generating',
    subject: componentName,
  })

  await overwriteDoc(componentName)
}

main()

// TODO ask component name and check for its existance
