import { ask } from 'stdio'
import Handlebars from 'handlebars'
import { readFile, copyFile } from 'fs/promises'
import fs from 'fs'
import chalk from 'chalk'
const PROJECT_PATH = '..'
const COMPONENTS_PATH = `${PROJECT_PATH}/src/components`
const TEMPLATES_PATH = `${PROJECT_PATH}/template`

const packageTemplate = await readFile(
  new URL(`${TEMPLATES_PATH}/package.json`, import.meta.url),
)

const stencilTemplate = await readFile(
  new URL(`${TEMPLATES_PATH}/stencil.config.ts`, import.meta.url),
)

const copy = (fileName, componentName) => {
  copyFile(
    new URL(`${TEMPLATES_PATH}/${fileName}`, import.meta.url),
    new URL(`${COMPONENTS_PATH}/${componentName}/${fileName}`, import.meta.url),
    fs.constants.COPYFILE_FICLONE,
    err => {
      if (err) throw err
      console.log(`${fileName} was copied to ${componentName} component path.`)
    },
  )
}

async function main () {
  console.log(`This script will ${chalk.green('scaffold')} stencil and package.json global configuration into a specific component.`)
  const continueTask = await ask('Continue?', { options: ['y', 'n', ''] })

  if (continueTask === 'n') {
    return
  }
  await askComponentName()
  console.log('Process finished.')
}

async function askComponentName () {
  const componentName = await ask('Component name')
  console.log('Creating component "%s"', componentName)
  compilePackage(componentName)
  compileStencil(componentName)
  copy('tsconfig.json', componentName)
  copy('tailwind.config.js', componentName)
}

const compilePackage = async componentName => {
  const exists = !!(await fs.promises.stat(new URL(`${COMPONENTS_PATH}/${componentName}/package.json`, import.meta.url)).catch(() => null))
  if (exists) {
    console.log('File package.json previously created, skipping it.')
    return
  }
  await createPackage(componentName)

}

const createPackage = async componentName => {
  const packageData = JSON.parse(
    await readFile(
      new URL(`${PROJECT_PATH}/package.json`, import.meta.url),
    ),
  )

  const template = Handlebars.compile(packageTemplate.toString())
  const data = {
    componentName,
    dependencies: JSON.stringify(packageData.dependencies, null, 4),
    author: JSON.stringify(packageData.author, null, 4),
    contributors: JSON.stringify(packageData.contributors, null, 4),
  }
  const packageModule = template(data)

  fs.writeFile(
    new URL(`${COMPONENTS_PATH}/${componentName}/package.json`, import.meta.url),
    packageModule,
    'utf8',
    err => {
      if (err) {
        console.log('An error occured while writing package.json file.')
        return console.log(err)
      }
      console.log('File package.json has been saved successfully.')
    },
  )
}

const compileStencil = componentName => {

  const fileName = 'stencil.config.ts'
  const template = Handlebars.compile(stencilTemplate.toString())
  const data = {
    componentName,
  }
  const stencilConfig = template(data)

  fs.writeFile(
    new URL(`${COMPONENTS_PATH}/${componentName}/${fileName}`, import.meta.url),
    stencilConfig,
    'utf8',
    err => {
      if (err) {
        console.log(`An error occured while writing ${fileName} file.`)
        return console.log(err)
      }
      console.log(`File ${fileName} has been saved successfully.`)
    },
  )
}

main().catch(error => console.warn(error))
