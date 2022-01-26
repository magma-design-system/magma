const fs = require('fs').promises

/**
 * File type
 * @typedef {Object} File
 * @property {string} name - File name
 * @property {string} content - File content
 */

/**
 * Generate a typescript type with all the icons values as string
 *
 * @example
 * generateTypescriptType(['icon-a', 'icons-b', 'icon-c'])
 * // Returns: "export type MggIcon = 'icon-a'|'icon-b'|'icon-c';"
 * @param {string[]} icons
 * @param {string} fontName
 * @return {File}
 */
function generateTypescript (icons, fontName) {
  const types = icons.map(icon => `'${icon}'`).join('|')
  const values = icons.map(icon => `'${icon}'`).join(',')
  const typeName = getTypeName(fontName)
  return {
    name: `${fontName}.ts`,
    content: `export type ${typeName} = ${types};
export const ${getVariableName(fontName)}: ${typeName}[] = [${values}];
`,
  }
}

/**
 * Generate a javascript array with all the icons values as string
 *
 * @example
 * generateJavascriptArray(['icon-a', 'icons-b', 'icon-c'])
 * // Returns: "export const mggIcons = ['icon-a','icon-b','icon-c'];"
 * @param {string[]} icons
 * @param {string} fontName
 * @return {File}
 */
// function generateJavascript(icons, fontName) {
//   const values = icons.map(icon => `'${icon}'`).join(',')
//   return {
//     name: `${fontName}.js`,
//     content: `export const ${getVariableName(fontName)} = [${values}];\n`
//   }
// }

/**
 * @example
 * getVariableName('mgg-icons') === 'mggIcons'
 * @param {string} fontName
 * @return {string}
 */
function getVariableName (fontName) {
  return fontName.replace(/-([\w])/gi, (match, firstGroup) => firstGroup.toUpperCase())
}

/**
 * @example
 * getTypeName('mgg-icons') === 'MggIcons'
 * @param fontName
 * @return {string}
 */
function getTypeName (fontName) {
  const varName = getVariableName(fontName)
  return varName.charAt(0).toUpperCase() + varName.slice(1)
}

function writeCodersFiles (inputData, options) {
  const icons = Object.keys(inputData)
  const files = [
    // generateJavascript(icons, options.fontName),
    generateTypescript(icons, options.fontName),
  ]
  return Promise.all(
    files.map(file =>
      fs.writeFile(`${options.outputPath}/${file.name}`, file.content)
        .then(() => console.log(`SUCCESS Created ${options.outputPath}/${file.name}`))
        .catch(error => console.error(`ERROR Creating ${options.outputPath}/${file.name}`, error)),
    ),
  )
}

exports.writeCodersFiles = writeCodersFiles
