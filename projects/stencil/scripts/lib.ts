import Handlebars from 'handlebars'
import chalk from 'chalk'
import { copyFile, cp, mkdir, readFile, rename, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { PROJECT_DIR, COMPONENTS_DIR, TEMPLATES_DIR, TEMP_PROJECT_DIR } from './meta'
import { logFileSavedTo } from '../../../scripts/log'

const compilePackage = async (componentName: string): Promise<void> => {
  const exists = !!( await stat(join(COMPONENTS_DIR, componentName, 'package.json'))
    .catch(() => {
      return false
    })
  )

  if (exists) {
    console.warn(`File package.json ${chalk.yellow('previously created')}, skipping it.`)
    return
  }

  await createPackage(componentName)
}

const createPackage = async (componentName: string): Promise<void> => {
  const packageFile = await readFile(join(PROJECT_DIR, 'package.json')).catch(error => { throw Error(chalk.red(error)) })
  const packageData = JSON.parse(packageFile.toString())
  const packageTemplate = await readFile(join(TEMPLATES_DIR, 'package.json')).catch(error => { throw Error(chalk.red(error)) })

  const template = Handlebars.compile(packageTemplate.toString())
  const data = {
    componentName,
    dependencies: JSON.stringify(packageData.dependencies, null, 4),
    author: JSON.stringify(packageData.author, null, 4),
    contributors: JSON.stringify(packageData.contributors, null, 4),
  }
  const packageModule = template(data)

  await writeFile(join(COMPONENTS_DIR, componentName, 'package.json'), packageModule, { encoding: 'utf8' })
    .then(() => {
      logFileSavedTo('package.json', COMPONENTS_DIR)
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const compileTemplateFile = async (componentName: string, fileName: string): Promise<void> => {
  const exists = !!( await stat(join(COMPONENTS_DIR, componentName, fileName))
    .catch(() => {
      return false
    })
  )

  if (exists) {
    console.warn(`File ${fileName} ${chalk.yellow('previously created')}, skipping it.`)
    return
  }

  await createTemplateFile(componentName, fileName)
}

const createTemplateFile = async (componentName: string, fileName: string): Promise<void> => {
  const packageTemplate = await readFile(join(TEMPLATES_DIR, fileName)).catch(error => { throw Error(chalk.red(error)) })

  const template = Handlebars.compile(packageTemplate.toString())
  const templateCompiled = template({ componentName: componentName.replace('mds-', '') })

  await writeFile(join(COMPONENTS_DIR, componentName, fileName), templateCompiled, { encoding: 'utf8' })
    .then(() => {
      logFileSavedTo(fileName, COMPONENTS_DIR)
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const scaffoldStencil = async (componentName: string): Promise<void> => {
  const fileName = 'stencil.config.ts'
  const stencilTemplate = await readFile(join(TEMPLATES_DIR, fileName)).catch(error => { throw Error(chalk.red(error)) })
  const template = Handlebars.compile(stencilTemplate.toString())
  const data = {
    componentName,
  }
  const stencilConfig = template(data)

  await writeFile(join(TEMP_PROJECT_DIR, componentName, fileName), stencilConfig, { encoding: 'utf8' })
    .then(() => {
      logFileSavedTo(fileName, componentName)
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const createTempProjectInstance = async (componentName: string): Promise<void> => {
  const ISOLATED_PATH = join(TEMP_PROJECT_DIR, componentName)

  await mkdir(ISOLATED_PATH, { recursive: true }).catch(error => { throw Error(chalk.red(error)) })

  await copyFile(join(PROJECT_DIR, 'tailwind.config.js'), join(ISOLATED_PATH, 'tailwind.config.js')).catch(error => { throw Error(chalk.red(error)) })
  await copyFile(join(PROJECT_DIR, 'tsconfig.json'), join(ISOLATED_PATH, 'tsconfig.json')).catch(error => { throw Error(chalk.red(error)) })

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
}

const checkComponentWasBuilt = async (componentName: string): Promise<boolean> => {
  return await stat(`${COMPONENTS_DIR}/${componentName}/readme.md`)
    .then(statInfo => statInfo.isFile())
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const checkComponentExistance = async (componentName: string): Promise<boolean> => {
  return await stat(`${COMPONENTS_DIR}/${componentName}`)
    .then(statInfo => statInfo.isDirectory())
    .catch(() => false)
}

export {
  checkComponentExistance,
  checkComponentWasBuilt,
  createTempProjectInstance,
  compilePackage,
  compileTemplateFile,
}
