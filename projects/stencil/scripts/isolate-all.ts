import chalk from 'chalk'
import { createTempProjectInstance } from './lib'
import { TEMP_PROJECT_DIR } from './meta'
import { logStatus } from '../../../scripts/log'
import { getComponents } from './update'

const isolateAll = async (): Promise<void[]> => {
  return getComponents().then(componentName => {
    return Promise.all(componentName.map(async c => {
      logStatus({
        actionDoing: 'Isolating',
        subject: `${TEMP_PROJECT_DIR}/${c}`,
      })
      createTempProjectInstance(c)
    }))
  })
}

const main = async () => {
  console.info(
    `This script will ${chalk.green(
      'isolate ALL',
    )} stencil components with package.json already created into a set of isolated separate projects, ready to be individually published.`,
  )
  // const continueTask = await ask('Continue?', { options: ['Y', 'n', ''] })

  // if (continueTask === 'n') {
  //   return
  // }
  await isolateAll()
}

main()
