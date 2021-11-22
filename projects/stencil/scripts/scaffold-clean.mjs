import { ask } from 'stdio'
import { rm } from 'fs/promises'
import chalk from 'chalk'
const PROJECT_PATH = '..'
const COMPONENTS_PATH = `${PROJECT_PATH}/src/components`

async function main () {
  console.log(`This script will ${chalk.red('DELETE')} the stencil and package.json global configuration from a specific component.`)
  const continueTask = await ask('Continue?', { options: ['y', 'n', ''] })

  if (continueTask === 'n') {
    return
  }
  await cleanComponent()
  console.log('Process finished.')
}

async function cleanComponent () {
  const componentName = await ask('Component name')
  const keepPackage = await ask('Keep package.json file? (leave empty to confirm)', {
    options: ['', 'y', 'n'],
  })

  console.log('Cleaning component "%s"', componentName)
  if (keepPackage === 'n') {
    rm(new URL(`${COMPONENTS_PATH}/${componentName}/package.json`, import.meta.url), { force: true }, err => {
      if (err) throw err
      console.log(`${COMPONENTS_PATH}/${componentName}/package.json deleted successfully`)
    })
  }

  rm(new URL(`${COMPONENTS_PATH}/${componentName}/stencil.config.ts`, import.meta.url), { force: true }, err => {
    if (err) throw err
    console.log(`${COMPONENTS_PATH}/${componentName}/stencil.config.ts deleted successfully`)
  })

  rm(new URL(`${COMPONENTS_PATH}/${componentName}/tsconfig.json`, import.meta.url), { force: true }, err => {
    if (err) throw err
    console.log(`${COMPONENTS_PATH}/${componentName}/tsconfig.json deleted successfully`)
  })

  rm(new URL(`${COMPONENTS_PATH}/${componentName}/tailwind.config.js`, import.meta.url), { force: true }, err => {
    if (err) throw err
    console.log(`${COMPONENTS_PATH}/${componentName}/tailwind.config.js deleted successfully`)
  })
}

main().catch(error => console.warn(error))
