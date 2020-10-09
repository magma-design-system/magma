#!/usr/bin/env node

const svgtofont = require('svgtofont')
const fs = require('fs').promises
const path = require('path')
const pkg = require('../package.json')
const { ICON_GROUPS } = require('../lib/icons-groups')
const { ROOT_PATH_DIR, BUILD_PATH_DIR } = require('../lib/utils')

const BUILD_SVG_DIR = `${BUILD_PATH_DIR}/svg`
const BUILD_FONTS_DIR = `${BUILD_PATH_DIR}/fonts`

main(process.argv.slice(2))

/**
 * Main function
 * @param parameters {string[]} Input parameters
 * @return {void}
 */
function main(parameters) {
  console.debug('Input file:', parameters[0])

  const inputFilePath = path.join(process.cwd(), parameters[0])
  const inputData = require(inputFilePath)
  // console.debug('Input data:', inputData)

  const fontName = path.basename(inputFilePath, path.extname(inputFilePath))

  createBuildDirective()
    .then(() => iconsToTempFolder(inputData))
    .then(() => buildFont({ svgPath: BUILD_SVG_DIR, outputPath: BUILD_FONTS_DIR, fontName }))
    // .then(() => console.log('Font creation completed!'))
    .catch(err => console.error('Error:', err) || console.error('Something gone wrong... Aborted.'))
}

/**
 * Crea la cartella di lavoro per la build
 * @return {Promise<void>}
 */
function createBuildDirective() {
  return fs.mkdir(BUILD_SVG_DIR, { recursive: true })
    .then(() => console.debug('Build directive created in', BUILD_SVG_DIR))
    .catch(error => {
      console.error('Build directive creation failed.', error)
      return Promise.reject(error)
    })
}

/**
 * Copia tutte le icone richieste in una cartella di build
 * @param inputData {Object.<string, string>} Mappa con l'icona desiderata come valore e il nome dell'icona come chiave
 * @returns {Promise<void[]>} Una promise da attendere perché termini la copia
 */
function iconsToTempFolder(inputData) {
  const promises = []
  for (const [key, value] of Object.entries(inputData)) {
    const icon = iconSelectorToObject(value)
    const sourcePathPromise = ICON_GROUPS[icon.group].getPath(icon.name)
    const destinationPath = path.join(BUILD_SVG_DIR, `${key}.svg`)

    const promise = sourcePathPromise.then(sourcePath => {
      // console.debug('Copying', sourcePath, '->', destinationPath)
      fs.copyFile(sourcePath, destinationPath)
        .catch(error => {
          console.error('Build directive creation failed.', error)
          return Promise.reject(error)
        })
    })
    promises.push(promise)
  }
  return Promise.all(promises)
    .then(copyResult => {
      console.log('SVG files copied')
      return copyResult
    })
    .catch(error => {
      console.error('One or more icons not found.')
      if (Array.isArray(error)) error.forEach(error => console.error('-', error))
      else console.error('-', error)
      return Promise.reject(error)
    })
}

/**
 * Dato il nome di un'icona desiderata crea un oggetto con le stesse informazioni ben suddivise.
 * @param iconSelector {string} Nome dell'icona desiderata
 * @return {{name: string, group: string}} Oggetto contenente le stesse informazioni presenti in iconSelector
 */
function iconSelectorToObject(iconSelector) {
  let array = iconSelector.split('/')
  if (array.length === 1) {
    array = ['maggioli', ...array]
  }

  return {
    group: array[0],
    name: array[1],
  }
}

/**
 * BuildFontOptions
 * @typedef {Object} BuildFontOptions
 * @property {string} svgPath - Path della cartella contenente gli svg da includere nel font.
 * @property {string} outputPath - Path della cartella in cui creare i font e il sito di presentazione.
 * @property {string} fontName - Indicates whether the Wisdom component is present.
 */

/**
 * Crea il font in tutti i formati supportati da svgtofont.
 * Crea anche un sito statico in cui visionare le icone.
 * @param {BuildFontOptions} options Configurazione del font
 * @return {Promise<void>}
 */
function buildFont({ svgPath, outputPath, fontName } = {}) {
  return svgtofont({
    src: svgPath,
    dist: outputPath, // output path
    fontName, // font name
    classNamePrefix: fontName,
    // css: true, // Create CSS files.
    // startNumber: 20000, // unicode start number
    svgicons2svgfont: {
      fontHeight: 1000,
      normalize: true,
    },
    website: {
      title: pkg.name,
      description: pkg.description,
      version: pkg.version,
      logo: path.resolve(ROOT_PATH_DIR, 'svg', 'isbn.svg'),
      favicon: null,
      meta: {
        description: pkg.description,
        keywords: pkg.keywords.join(','),
      },
      // Add a Github corner to your website
      corners: {
        url: pkg.repository.url,
        width: 62, // default: 60
        height: 62, // default: 60
        bgColor: '#dc3545', // default: '#151513'
      },
      links: [
        {
          title: 'Repository',
          url: pkg.repository.url,
        },
        {
          title: 'Feedback',
          url: pkg.bugs.url,
        },
        {
          title: 'Font Class',
          url: 'index.html',
        },
        {
          title: 'Unicode',
          url: 'unicode.html',
        },
        {
          title: 'SVG Symbol',
          url: 'symbol.html',
        },
      ],
      footerInfo: 'Maggioli©.',
    },
  })
}
