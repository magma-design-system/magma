import Handlebars from 'handlebars'
import chalk from 'chalk'
import { copyFile, cp, mkdir, readFile, rename, stat, writeFile } from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const PROJECT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../')
const TEMPLATES_PATH = `${PROJECT_PATH}/template`
const COMPONENTS_PATH = `${PROJECT_PATH}/src/components`
const TEMP_PROJECT_PATH = `${PROJECT_PATH}/.build`

const compilePackage = async componentName => {
  const exists = !!(await stat(
    new URL(`${COMPONENTS_PATH}/${componentName}/package.json`, import.meta.url),
  ).catch(() => null))
  if (exists) {
    console.log(
      `File package.json ${chalk.yellow('previously created')}, skipping it.`,
    )
    return
  }
  await createPackage(componentName)
}

const createPackage = async componentName => {
  const packageData = JSON.parse(
    await readFile(new URL(`${PROJECT_PATH}/package.json`, import.meta.url)),
  )

  const packageTemplate = await readFile(
    new URL(`${TEMPLATES_PATH}/package.json`, import.meta.url),
  )

  const template = Handlebars.compile(packageTemplate.toString())
  const data = {
    componentName,
    dependencies: JSON.stringify(packageData.dependencies, null, 4),
    author: JSON.stringify(packageData.author, null, 4),
    contributors: JSON.stringify(packageData.contributors, null, 4),
  }
  const packageModule = template(data)

  await writeFile(
    new URL(
      `${COMPONENTS_PATH}/${componentName}/package.json`,
      import.meta.url,
    ),
    packageModule,
    'utf8',
    err => {
      if (err) {
        console.log('An error occured while writing package.json file.')
        return console.log(err)
      }
    },
  )
  console.log('File package.json has been saved successfully.')
}

const scaffoldStencil = async componentName => {
  const fileName = 'stencil.config.ts'
  const stencilTemplate = await readFile(
    new URL(`${TEMPLATES_PATH}/stencil.config.ts`, import.meta.url),
  )
  const template = Handlebars.compile(stencilTemplate.toString())
  const data = {
    componentName,
  }
  const stencilConfig = template(data)

  await writeFile(
    `${TEMP_PROJECT_PATH}/${componentName}/${fileName}`,
    stencilConfig,
    'utf8',
    err => {
      if (err) {
        console.log(`An error occured while writing ${fileName} file.`)
        return console.log(err)
      }
    },
  )
  console.log(`Config ${fileName} for component ${chalk.green(componentName)} has been saved successfully.`)
}


const createTempProjectInstance = async componentName => {
  const ISOLATED_PATH = `${TEMP_PROJECT_PATH}/${componentName}`
  // TODO catch error
  await mkdir(`${ISOLATED_PATH}`, { recursive: true })
  await copyFile(
    `${PROJECT_PATH}/tailwind.config.js`,
    `${ISOLATED_PATH}/tailwind.config.js`,
  )
  await copyFile(
    `${PROJECT_PATH}/tsconfig.json`,
    `${ISOLATED_PATH}/tsconfig.json`,
  )
  await scaffoldStencil(componentName)
  await mkdir(`${ISOLATED_PATH}/src`, { recursive: true })
  await cp(
    `${PROJECT_PATH}/src/dictionary`,
    `${ISOLATED_PATH}/src/dictionary`,
    { recursive: true },
  )
  await cp(`${PROJECT_PATH}/src/fixtures`, `${ISOLATED_PATH}/src/fixtures`, {
    recursive: true,
  })
  await cp(`${PROJECT_PATH}/src/interface`, `${ISOLATED_PATH}/src/interface`, {
    recursive: true,
  })
  await cp(`${PROJECT_PATH}/src/types`, `${ISOLATED_PATH}/src/types`, {
    recursive: true,
  })
  await cp(
    `${PROJECT_PATH}/src/components/${componentName}`,
    `${ISOLATED_PATH}/src/components/${componentName}`,
    { recursive: true },
  )
  await rename(
    `${ISOLATED_PATH}/src/components/${componentName}/package.json`,
    `${ISOLATED_PATH}/package.json`,
  )
  await rename(
    `${ISOLATED_PATH}/src/components/${componentName}/readme.md`,
    `${ISOLATED_PATH}/readme.md`,
  )
}

export {
  createTempProjectInstance,
  compilePackage,
}
