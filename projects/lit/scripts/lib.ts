import Handlebars from 'handlebars'
import chalk from 'chalk'
import { copyFile, cp, mkdir, readFile, rename, stat, writeFile } from 'fs/promises'
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
  await copyFile(join(TEMPLATES_DIR, file), join(COMPONENTS_DIR, componentName, file)).catch(error => { throw Error(chalk.red(error)) })
}

const createComponentInstance = async (componentName: string): Promise<void> => {

  await mkdir(join(COMPONENTS_DIR, componentName), { recursive: true }).catch(error => { throw Error(chalk.red(error)) })
  await compileTemplateFile(componentName, 'package.json.handlebars', 'package.json')
  await compileTemplateFile(componentName, 'index.html.handlebars', 'index.html')
  await copyTemplateFile(componentName, 'postcss.config.js')
  await copyTemplateFile(componentName, 'tailwind.config.cjs')
  await copyTemplateFile(componentName, 'tsconfig.json')
  await copyTemplateFile(componentName, 'tsconfig.node.json')
  await copyTemplateFile(componentName, 'vite.config.ts')

  /*
  await scaffoldStencil(componentName)

  await mkdir(join(ISOLATED_PATH, 'src'), { recursive: true }).catch(error => { throw Error(chalk.red(error)) })

  await cp(join(PROJECT_DIR, 'src/dictionary'), join(ISOLATED_PATH, 'src/dictionary'), { recursive: true }).catch(error => { throw Error(chalk.red(error)) })
  await cp(join(PROJECT_DIR, 'src/fixtures'), join(ISOLATED_PATH, 'src/fixtures'), { recursive: true }).catch(error => { throw Error(chalk.red(error)) })
  await cp(join(PROJECT_DIR, 'src/tailwind'), join(ISOLATED_PATH, 'src/tailwind'), { recursive: true }).catch(error => { throw Error(chalk.red(error)) })
  await cp(join(PROJECT_DIR, 'src/interface'), join(ISOLATED_PATH, 'src/interface'), { recursive: true }).catch(error => { throw Error(chalk.red(error)) })
  await cp(join(PROJECT_DIR, 'src/type'), join(ISOLATED_PATH, 'src/type'), { recursive: true }).catch(error => { throw Error(chalk.red(error)) })
  await cp(join(PROJECT_DIR, 'src/common'), join(ISOLATED_PATH, 'src/common'), { recursive: true }).catch(error => { throw Error(chalk.red(error)) })
  await cp(join(PROJECT_DIR, 'src/components', componentName), join(ISOLATED_PATH, 'src/components', componentName), { recursive: true }).catch(error => { throw Error(chalk.red(error)) })

  await rename(join(ISOLATED_PATH, 'src/components', componentName, 'documentation.json'), join(ISOLATED_PATH, 'documentation.json')).catch(error => { throw Error(chalk.red(error)) })
  await rename(join(ISOLATED_PATH, 'src/components', componentName, 'package.json'), join(ISOLATED_PATH, 'package.json')).catch(error => { throw Error(chalk.red(error)) })
  await rename(join(ISOLATED_PATH, 'src/components', componentName, 'readme.md'), join(ISOLATED_PATH, 'readme.md')).catch(error => { throw Error(chalk.red(error)) })
  */
}


export {
  createComponentInstance,
  checkComponentExistance,
}
