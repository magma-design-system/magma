import chalk from 'chalk'
import fg from 'fast-glob'
import { DIST_DIR, ICONS_DIR } from './meta'
import { PathLike } from 'fs'
import { basename, join } from 'path'
import { logFileSavedTo } from '../../../scripts/log'
import { mkdir } from 'fs-extra'
import { writeFile } from 'fs/promises'

const DICTIONARY_FILENAME = 'iconsauce.json'

const selector = (file: PathLike): string =>
  `mgg/${basename(file.toString()).replace('.svg', '')}`

const dictionary = (icons: PathLike[]): string[] => {
  const iconsDictionary: Array<string> = []
  for (const icon of icons) {
    iconsDictionary.push(selector(icon).toLowerCase())
  }
  return iconsDictionary
}


const dumpIconsauceIcons = async (): Promise<string[]> => {
  const entries = await fg(`${ICONS_DIR.toString()}/*.svg`, { dot: true })
  return dictionary(entries)
}

const buildDictionary = async (): Promise<void> => {
  const icons = await dumpIconsauceIcons()
  const jsonDictionary = JSON.stringify(icons, null, 4)

  await mkdir(DIST_DIR, { recursive: true })
    .catch(error => {
      throw Error(chalk.red(error))
    })

  await writeFile(join(DIST_DIR, DICTIONARY_FILENAME), jsonDictionary, { encoding: 'utf8' })
    .then(() => {
      logFileSavedTo(DICTIONARY_FILENAME, join(DIST_DIR, DICTIONARY_FILENAME))
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

buildDictionary()
