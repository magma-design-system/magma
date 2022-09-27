import { COMPONENTS_DIR, SRC_DIR } from './meta'
import { readdir, readFile, stat, writeFile } from 'fs/promises'
import path from 'path'
import { logFileSavedTo } from '../../../scripts/log'

const componentsVersionFilePath = path.resolve(SRC_DIR, 'storybook/components-version.json')
const componentsVersion: { [key: string]: string } = {}

const listComponentsVersion = async (dir: string) => {
  const directories = await readdir(dir)
  for (const directory of directories) {
    const fileExists = await stat(`${dir}/${directory}/package.json`)
      .then(statInfo => statInfo.isFile())
      .catch(() => false)

    if (fileExists) {
      const rawData = await readFile(`${dir}/${directory}/package.json`)
      componentsVersion[directory] = JSON.parse(rawData.toString()).version
    }
  }

  return Promise.resolve()
}

const main = async () => {
  await listComponentsVersion(COMPONENTS_DIR)
  await writeFile(componentsVersionFilePath, JSON.stringify(componentsVersion, null, 2))
    .then(() => {
      logFileSavedTo(componentsVersionFilePath, componentsVersionFilePath)
    })
    .catch(err => console.error('File write error', err))
}

main()
