import Handlebars from 'handlebars'
import chalk from 'chalk'
import { copyFile, readFile, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { logFileSavedTo } from '../../../scripts/log'
import { COMPONENTS_DIR, TEMPLATES_DIR } from './meta'

const checkComponentExistance = async (componentName: string): Promise<boolean> => {
  return await stat(`${COMPONENTS_DIR}/${componentName}`)
    .then(statInfo => statInfo.isDirectory())
    .catch(() => false)
}

const compileTemplateFile = async (componentName: string, source: string, file: string): Promise<void> => {
  const packageTemplate = await readFile(join(TEMPLATES_DIR, source)).catch(error => { throw Error(chalk.red(error)) })

  const template = Handlebars.compile(packageTemplate.toString())
  const data = {
    componentName,
  }
  const packageModule = template(data)

  await writeFile(join(COMPONENTS_DIR, componentName, file), packageModule, { encoding: 'utf8' })
    .then(() => {
      logFileSavedTo(file, COMPONENTS_DIR)
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const copyTemplateFile = async (componentName: string, file: string): Promise<void> => {
  await copyFile(join(TEMPLATES_DIR, file), join(COMPONENTS_DIR, componentName, file))
    .then(() => {
      logFileSavedTo(file, COMPONENTS_DIR)
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}


export {
  checkComponentExistance,
  compileTemplateFile,
  copyTemplateFile,
}
