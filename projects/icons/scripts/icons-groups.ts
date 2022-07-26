/* eslint-disable @typescript-eslint/no-non-null-assertion */

import chalk from 'chalk'
import fs from 'fs/promises'
import path from 'path'
import { logStatus } from '../../../scripts/log'

class Maggioli {
  static ICONS_DIR = `${path.dirname(require.resolve('@maggioli-design-system/svg-icons/package.json'))}/svg`
  static FILE_NAME_REGEX = /^([\w-]+)\.svg$/

  /**
   * List of paths of subdirectories (possibly) with icons
   */
  static async subDirectories (): Promise<string[]> {
    return [this.ICONS_DIR]
  }

  /**
   * Search the requested icon in Maggioli icons
   */
  static async getPath (iconName: string): Promise<string> {
    const subdirectories = await Maggioli.subDirectories()
    const filename = `${iconName}.svg`

    return iconGroupGetHelper('maggioli', subdirectories, iconName, filename)
  }

  /**
   * Search all the Maggioli icons
   */
  static async listPath (): Promise<string[]> {
    const subdirectories = await Maggioli.subDirectories()
    return iconGroupListHelper(subdirectories, Maggioli.FILE_NAME_REGEX)
  }

  /**
   * Given the path of an icon or just the file name, it returns the icon name
   */
  static getIconName (path: string): string {
    return path.split('/').slice(-1)[0].match(Maggioli.FILE_NAME_REGEX)![1]
  }
}

class Material {
  static ICONS_DIR = `${path.dirname(require.resolve('material-design-icons-updated/package.json'))}/icons/filled`
  static FILE_NAME_REGEX = /^ic_([\w-_]+)_24px\.svg$/

  /**
   * List of paths of subdirectories (possibly) with icons
   */
  static async subDirectories (): Promise<string[]> {
    return subDirectories(this.ICONS_DIR)
  }

  /**
   * Search the requested icon in Material icons
   */
  static async getPath (iconName: string): Promise<string> {
    const subdirectories = await Material.subDirectories()
    const filename = `ic_${iconName}_24px.svg`

    return iconGroupGetHelper('material', subdirectories, iconName, filename)
  }

  /**
   * Search all the Material icons
   */
  static async listPath (): Promise<string[]> {
    const subdirectories = await Material.subDirectories()
    return iconGroupListHelper(subdirectories, Material.FILE_NAME_REGEX)
  }

  /**
   * Given the path of an icon or just the file name, it returns the icon name
   */
  static getIconName (path: string): string {
    return path.split('/').slice(-1)[0].match(Material.FILE_NAME_REGEX)![1]
  }
}

class MaterialIconsSvg {
  static ICONS_DIR = `${path.dirname(require.resolve('@material-icons/svg/package.json'))}/svg`
  static FILE_NAME_REGEX = /^([\w\-_]+)\/baseline\.svg$/

  /**
   * List of paths of subdirectories (possibly) with icons
   */
  static async subDirectories (): Promise<string[]> {
    return subDirectories(this.ICONS_DIR)
  }

  /**
   * Search the requested icon in Material icons
   */
  static async getPath (iconName: string): Promise<string> {
    const subdirectories = (await MaterialIconsSvg.subDirectories()).filter(path => path.match(iconName) !== null)
    const filename = 'baseline.svg'
    return iconGroupGetHelper('material-icons-svg', subdirectories, iconName, filename)
  }

  /**
   * Search all the Material icons
   */
  static async listPath (): Promise<string[]> {
    const subdirectories = await MaterialIconsSvg.subDirectories()
    return iconGroupListHelper(subdirectories, MaterialIconsSvg.FILE_NAME_REGEX)
  }

  /**
   * Given the path of an icon or just the file name, it returns the icon name
   */
  static getIconName (path: string): string {
    return path.split('/').slice(-1)[0].match(MaterialIconsSvg.FILE_NAME_REGEX)![1]
  }
}

class MaterialCommunity {
  static ICONS_DIR = `${path.dirname(require.resolve('@mdi/svg/package.json'))}/svg`
  static FILE_NAME_REGEX = /^([\w-]+)\.svg$/

  /**
   * List of paths of subdirectories (possibly) with icons
   */
  static async subDirectories (): Promise<string[]> {
    return [this.ICONS_DIR]
  }

  /**
   * Search the requested icon in Material Design Icons Community
   * @param iconName {string} name of the icon
   */
  static async getPath (iconName: string): Promise<string> {
    const subdirectories = await MaterialCommunity.subDirectories()
    const filename = `${iconName}.svg`

    return iconGroupGetHelper('mdi', subdirectories, iconName, filename)
  }

  /**
   * Search all the Maggioli icons
   */
  static async listPath (): Promise<string[]> {
    const subdirectories = await MaterialCommunity.subDirectories()
    return iconGroupListHelper(subdirectories, MaterialCommunity.FILE_NAME_REGEX)
  }

  /**
   * Given the path of an icon or just the file name, it returns the icon name
   */
  static getIconName (path: string): string {
    return path.split('/').slice(-1)[0].match(MaterialCommunity.FILE_NAME_REGEX)![1]
  }
}

class LocalDirectory {
  static FILE_NAME_REGEX = /^([\w-]+)\.svg$/

  /**
   * List of paths of subdirectories (possibly) with icons
   */
  static async subDirectories (): Promise<string[]> {
    return LocalDirectory._subDirectories
  }
  static _subDirectories: string[] = []

  /**
   * Search the requested icon in the local directory
   */
  static async getPath (iconName: string): Promise<string> {
    const subdirectories = await LocalDirectory.subDirectories()
    const filename = `${iconName}.svg`

    return iconGroupGetHelper('', subdirectories, iconName, filename)
  }

  /**
   * Search all the local icons
   * @return {Promise<string[]>} Paths of all the local icons
   */
  static async listPath (): Promise<string[]> {
    const subdirectories = await LocalDirectory.subDirectories()
    return iconGroupListHelper(subdirectories)
  }

  /**
   * Given the path of an icon or just the file name, it returns the icon name
   */
  static getIconName (path: string): string | boolean {
    if (!path.includes('/')) return false
    return path.match(LocalDirectory.FILE_NAME_REGEX)![1]
  }
}

/**
 * Ritorna un array con i path delle sottocartelle rispetto alla cartella passata in input
 */
const subDirectories = async (source: string): Promise<string[]> => {
  return (await fs.readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => `${source}/${dirent.name}`)
}

/**
 * Get icon helper to simplify groups functions
 */
const iconGroupGetHelper = async (iconGroup: string, directories: string[], iconName: string, filename: string): Promise<string> => {
  for (const directory of directories) {
    const fullPath = await searchFileInDirectory(directory, filename)
    logStatus({
      actionDoing: 'checking',
      subject: iconName,
      status: 'match',
      match: path.basename(filename),
    })
    if (fullPath) {
      return fullPath
    }
  }
  throw new Error(`${chalk.red('Icon not found:')} ${iconGroup ? iconGroup + '/' : ''}${iconName}, searched as ${filename}`)
}

/**
 * List icons helper to simplify groups functions
 */
const iconGroupListHelper = async (directories: string[], fileTemplate?: RegExp): Promise<string[]> => {
  return Promise.all(directories.map(async dir => (await listFilesInDirectory(dir, fileTemplate)).map(filename => path.join(dir, filename))))
    .then(matrix => matrix.flat())
}

/**
 * List all files in a directory
 */
const listFilesInDirectory = async (directory: string, fileTemplate?: RegExp): Promise<string[]> => {
  return fs.readdir(directory)
    .then(files => (fileTemplate ? files.filter(file => file.match(fileTemplate)) : files))
    .catch(err => {
      throw Error(chalk.red(err))
    })
}

/**
 * Search a file in a directory and return its path, if found
 */
const searchFileInDirectory = async (directory: string, filename: string): Promise<string | void> => {
  const files = await listFilesInDirectory(directory)
  if (files.includes(filename)) return path.join(directory, filename)
}

const ICON_GROUPS = {
  localDirectory: { getPath: LocalDirectory.getPath, listPath: LocalDirectory.listPath, getIconName: LocalDirectory.getIconName, subDirectories: LocalDirectory._subDirectories },
  maggioli: { getPath: Maggioli.getPath, listPath: Maggioli.listPath, getIconName: Maggioli.getIconName },
  material: { getPath: Material.getPath, listPath: Material.listPath, getIconName: Material.getIconName },
  'material-icons-svg': { getPath: MaterialIconsSvg.getPath, listPath: MaterialIconsSvg.listPath, getIconName: MaterialIconsSvg.getIconName },
  mdi: { getPath: MaterialCommunity.getPath, listPath: MaterialCommunity.listPath, getIconName: MaterialCommunity.getIconName },
}

export {
  ICON_GROUPS,
}
