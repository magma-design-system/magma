import chalk from 'chalk'
import { COMPONENTS_DIR } from './meta'
import { readdir, stat, unlink } from 'fs/promises'
import { compileTemplateFile } from './lib'

const gitlabCiYmlFileName = '.gitlab-ci.yml'

const checkGitlabCiYmlExist = async (componentName: string) => {
  return await stat(`${COMPONENTS_DIR}/${componentName}/${gitlabCiYmlFileName}`)
    .then(statInfo => statInfo.isFile())
    .catch(() => {
      return false
    })
}

const regenerateGitlabCiYml = async (componentName: string) => {
  await unlink(`${COMPONENTS_DIR}/${componentName}/${gitlabCiYmlFileName}`)
  console.info(`File for ${componentName} ${chalk.green('successfully')} deleted`)
  await compileTemplateFile(componentName, gitlabCiYmlFileName)
  console.info(`File for ${componentName} ${chalk.green('successfully')} regenerated`)
}

const main = async () => {
  console.info(`This script will ${chalk.green('generate')} or ${chalk.yellow('re-generate')} the ${chalk.magenta(gitlabCiYmlFileName)} file for each stencil component based on the template located in the template folder`)

  const directories = await readdir(COMPONENTS_DIR)
  console.info('Components count:', directories.length)
  for (const directory of directories) {
    const gitalYmlExists = await checkGitlabCiYmlExist(directory)

    if (gitalYmlExists) await regenerateGitlabCiYml(directory)
  }
}

main()
