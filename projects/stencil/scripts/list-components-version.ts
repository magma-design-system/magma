import { COMPONENTS_DIR, SRC_DIR } from './meta'
import { readdir, readFile, stat, writeFile } from 'fs/promises'
import path from 'path'

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
  console.log('Scanning components')
  await listComponentsVersion(COMPONENTS_DIR)
  console.log('Process finished', componentsVersion)
  console.log('Writing to file')
  await writeFile(componentsVersionFilePath, JSON.stringify(componentsVersion, null, 2))
    .then(() => console.log('File write success'))
    .catch(err => console.error('File write error', err))
}

main()
