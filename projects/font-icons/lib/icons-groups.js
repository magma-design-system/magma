const fs = require('fs').promises
const path = require('path')

class Maggioli {
  /**
   *
   * @return {Promise<string[]>}
   */
  static async subDirectories () {
    return [
      path.join(__dirname, '../svg')
    ]
  }

  /**
   * Cerca l'icona richiesta tra le icone di Maggioli
   * @param iconName {string}
   * @return {Promise<string>}
   */
  static async path (iconName) {
    const subdirectories = await Maggioli.subDirectories()
    const filename = `${iconName}.svg`

    return iconGroupSearchHelper('maggioli', subdirectories, iconName, filename)
  }
}

class Material {
  static ICONS_DIR = path.dirname(require.resolve('material-design-icons/package.json'))

  /**
   *
   * @return {Promise<string[]>}
   */
  static async subDirectories () {
    return (await subDirectories(this.ICONS_DIR))
      .map(subdir => `${subdir}/svg/production`)
  }

  /**
   * Cerca l'icona richiesta tra le icone di Material
   * @param iconName {string}
   * @return {Promise<string>}
   */
  static async path (iconName) {
    const subdirectories = await Material.subDirectories()
    const filename = `ic_${iconName}_48px.svg`

    return iconGroupSearchHelper('material', subdirectories, iconName, filename)
  }
}

class FontAwesome {
  static ICONS_DIR = `${path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json'))}/svgs`

  /**
   *
   * @return {Promise<string[]>}
   */
  static async subDirectories() {
    return subDirectories(this.ICONS_DIR)
  }

  /**
   * Cerca l'icona richiesta tra le icone di FontAwesome
   * @param iconName {string}
   * @return {Promise<string>}
   */
  static async path (iconName) {
    const subdirectories = await FontAwesome.subDirectories()
    const filename = `${iconName}.svg`

    return iconGroupSearchHelper('fontawesome', subdirectories, iconName, filename)
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
 * Search helper to simplify groups path functions
 * @param iconGroup {string} name of the group
 * @param directories {string[]} paths of the directories where the function should search
 * @param iconName {string} name of the icon
 * @param filename {string} file to search
 * @return {Promise<string>} path of the icon
 * @throws Throws error if the icon is not found
 */
async function iconGroupSearchHelper (iconGroup, directories, iconName, filename) {
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
 * Search a file in a directory and return its path, if found
 * @param directory {string} Path of the directory where the function should search
 * @param filename {string} Name of the file to search
 * @return {Promise<string|void>} Return the path of the file if found
 */
async function searchFileInDirectory (directory, filename) {
  const files = await fs.readdir(directory).catch(() => [])

  if (files.includes(filename)) return `${directory}/${filename}`
}

exports.ICON_GROUPS = {
  maggioli: { path: Maggioli.path },
  material: { path: Material.path },
  fontawesome: { path: FontAwesome.path }
}
