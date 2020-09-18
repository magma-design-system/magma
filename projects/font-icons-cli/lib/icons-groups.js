const fs = require('fs').promises
const path = require('path')

class Maggioli {
  static FILE_NAME_REGEX = /^([\w-]+)\.svg$/

  /**
   * List of paths of subdirectories (possibly) with icons
   * @return {Promise<string[]>}
   */
  static async subDirectories () {
    return [
      path.join(__dirname, '../svg')
    ]
  }

  /**
   * Search the requested icon in Maggioli icons
   * @param iconName {string} name of the icon
   * @return {Promise<string>}
   */
  static async getPath (iconName) {
    const subdirectories = await Maggioli.subDirectories()
    const filename = `${iconName}.svg`

    return iconGroupGetHelper('maggioli', subdirectories, iconName, filename)
  }

  /**
   * Search all the Maggioli icons
   * @return {Promise<string[]>} Paths of all the Maggioli icons
   */
  static async listPath () {
    const subdirectories = await Maggioli.subDirectories()
    return iconGroupListHelper('maggioli', subdirectories)
  }

  /**
   * Given the path of an icon or just the file name, it returns the icon name
   * @param path the path of an icon or just the file name
   * @return {string} The icon name
   */
  static getIconName (path) {
    return path.split('/').slice(-1)[0].match(Maggioli.FILE_NAME_REGEX)[1]
  }
}

class Material {
  static ICONS_DIR = path.dirname(require.resolve('material-design-icons/package.json'))
  static FILE_NAME_REGEX = /^ic_([\w-_]+)_48px\.svg$/

  /**
   * List of paths of subdirectories (possibly) with icons
   * @return {Promise<string[]>}
   */
  static async subDirectories () {
    return (await subDirectories(this.ICONS_DIR))
      .map(subdir => `${subdir}/svg/production`)
  }

  /**
   * Search the requested icon in Material icons
   * @param iconName {string}
   * @return {Promise<string>}
   */
  static async getPath (iconName) {
    const subdirectories = await Material.subDirectories()
    const filename = `ic_${iconName}_48px.svg`

    return iconGroupGetHelper('material', subdirectories, iconName, filename)
  }

  /**
   * Search all the Material icons
   * @return {Promise<string[]>} Paths of all the Material icons
   */
  static async listPath () {
    const subdirectories = await Material.subDirectories()
    return iconGroupListHelper('material', subdirectories, Material.FILE_NAME_REGEX)
  }

  /**
   * Given the path of an icon or just the file name, it returns the icon name
   * @param path the path of an icon or just the file name
   * @return {string} The icon name
   */
  static getIconName (path) {
    return path.split('/').slice(-1)[0].match(Material.FILE_NAME_REGEX)[1]
  }
}

class FontAwesome {
  static ICONS_DIR = `${path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json'))}/svgs`
  static FILE_NAME_REGEX = /^([\w-]+)\.svg$/

  /**
   * List of paths of subdirectories (possibly) with icons
   * @return {Promise<string[]>}
   */
  static async subDirectories() {
    return subDirectories(this.ICONS_DIR)
  }

  /**
   * Search the requested icon in FontAwesome icons
   * @param iconName {string}
   * @return {Promise<string>}
   */
  static async getPath (iconName) {
    const subdirectories = await FontAwesome.subDirectories()
    const filename = `${iconName}.svg`

    return iconGroupGetHelper('fontawesome', subdirectories, iconName, filename)
  }

  /**
   * Search all the FontAwesome icons
   * @return {Promise<string[]>} Paths of all the FontAwesome icons
   */
  static async listPath () {
    const subdirectories = await FontAwesome.subDirectories()
    return iconGroupListHelper('fontawesome', subdirectories, FontAwesome.FILE_NAME_REGEX)
  }

  /**
   * Given the path of an icon or just the file name, it returns the icon name
   * @param path the path of an icon or just the file name
   * @return {string} The icon name
   */
  static getIconName (path) {
    return path.split('/').slice(-1)[0].match(FontAwesome.FILE_NAME_REGEX)[1]
  }
}

/**
 * Ritorna un array con i path delle sottocartelle rispetto alla cartella passata in input
 * @param source {string} Path di una cartella
 * @return {Promise<string[]>} Array di path delle sottocartelle
 */
async function subDirectories (source) {
  return (await fs.readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => `${source}/${dirent.name}`)
}

/**
 * Get icon helper to simplify groups functions
 * @param iconGroup {string} name of the group
 * @param directories {string[]} paths of the directories where the function should search
 * @param iconName {string} name of the icon
 * @param filename {string} file to search
 * @return {Promise<string>} path of the icon
 * @throws Throws error if the icon is not found
 */
async function iconGroupGetHelper (iconGroup, directories, iconName, filename) {
  for (const directory of directories) {
    const path = await searchFileInDirectory(directory, filename)
    if (path) {
      console.debug(`Found ${iconGroup}/${iconName} -> ${path}`)
      return path
    }
  }
  throw new Error(`Icon not found: ${iconGroup}/${iconName}, searched as ${filename}`)
}

/**
 * List icons helper to simplify groups functions
 * @param {string} iconGroup name of the group
 * @param {string[]} directories paths of the directories where the function should search
 * @param {RegExp} [fileTemplate] template to filter the files. Optional.
 * @return {Promise<string[]>} paths of the icons
 */
async function iconGroupListHelper (iconGroup, directories, fileTemplate) {
  return Promise.all(directories.map(async dir => (await listFilesInDirectory(dir, fileTemplate)).map(filename => path.join(dir, filename))))
    .then(matrix => matrix.flat())
}

/**
 * List all files in a directory
 * @param directory {string}
 * @param {RegExp} [fileTemplate] template to filter the files. Optional.
 * @return {Promise<string[]>}
 */
async function listFilesInDirectory (directory, fileTemplate) {
  return fs.readdir(directory)
    .catch(() => [])
    .then(files => fileTemplate ? files.filter(file => file.match(fileTemplate)) : files)
}

/**
 * Search a file in a directory and return its path, if found
 * @param directory {string} Path of the directory where the function should search
 * @param filename {string} Name of the file to search
 * @return {Promise<string|void>} Return the path of the file if found
 */
async function searchFileInDirectory (directory, filename) {
  const files = await listFilesInDirectory(directory)

  if (files.includes(filename)) return path.join(directory, filename)
}

const ICON_GROUPS = {
  maggioli: { getPath: Maggioli.getPath, listPath: Maggioli.listPath, getIconName: Maggioli.getIconName },
  material: { getPath: Material.getPath, listPath: Material.listPath, getIconName: Material.getIconName },
  fontawesome: { getPath: FontAwesome.getPath, listPath: FontAwesome.listPath, getIconName: FontAwesome.getIconName }
}

/**
 * Given the path of an icon, it returns the icon group name
 * @param path path of an icon
 * @return {Promise<*>}
 */
async function pathToIconsGroup(path) {
  for (const [key, value] of ICON_GROUPS) {
    const subdirectories = await value.subDirectories()
    if (subdirectories.find(dir => path.startsWith(dir))) {
      return key
    }
  }
  throw new Error(`Could not find an icons group for path ${path}`)
}

exports.ICON_GROUPS = ICON_GROUPS
exports.pathToIconsGroup = pathToIconsGroup
