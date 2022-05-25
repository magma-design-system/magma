import svgtofont, { SvgToFontOptions } from 'svgtofont'
import fs from 'fs/promises'
import { PathLike, readFileSync } from 'fs'
import path from 'path'
import chalk from 'chalk'
import { ICON_GROUPS } from './icons-groups'
import { ORIGINAL_DIR, DIST_DIR } from './meta'

interface BuildFontOptions {
  svgPath: string,
  relativeOutputPath: string,
  outputPath: string,
  cssPath: string,
  fontName: string,
  website: boolean,
}

interface BuildFontOptions {
  svgPath: string,
  relativeOutputPath: string,
  outputPath: string,
  cssPath: string,
  fontName: string,
  website: boolean,
}

const BUILD_SVG_DIR = path.join(DIST_DIR, 'svg')
const BUILD_FONTS_DIR = path.join(DIST_DIR, 'fonts')
const BUILD_ORIGINAL_SVG_DIR = path.join(ORIGINAL_DIR, 'svg')
const BUILD_ORIGINAL_FONTS_DIR = path.join(ORIGINAL_DIR, 'fonts')

const main = (parameters: string[]): void => {
  const [inputFileParameter, ...restParams] = parameters
  const IS_PARAM = (param: string) => param.startsWith('--') || param.startsWith('-')
  const customParams = restParams.filter(IS_PARAM)
  const localDirectories = restParams.filter((param: string) => !IS_PARAM(param))
  const shouldCreateWebsite = customParams.includes('--website') || false
  console.debug('Input file:', inputFileParameter)
  if (shouldCreateWebsite) console.debug('A website with all the icons will be created.')

  const inputFilePath = path.join(process.cwd(), inputFileParameter)
  const inputData = JSON.parse(readFileSync(inputFilePath, 'utf-8'))

  ICON_GROUPS.localDirectory.subDirectories.push(...localDirectories)

  const regexp = new RegExp(`(font-icons-cli|icons)\\${path.sep}`)

  const fontName = 'mgg-icons'
  const options = {
    cssPath: `fonts${path.sep}`,
    fontName,
    outputPath: DIST_DIR,
    relativeOutputPath: DIST_DIR.split(regexp)[2],
    svgPath: BUILD_SVG_DIR,
    website: shouldCreateWebsite,
  }
  const optionsNatural = {
    ...options,
    outputPath: ORIGINAL_DIR,
    relativeOutputPath: ORIGINAL_DIR.split(regexp)[2],
    svgPath: BUILD_ORIGINAL_SVG_DIR,
  }

  console.log('Options', options)
  console.log('Options natural', optionsNatural)

  createBuildDirective(BUILD_SVG_DIR)
    .then(() => iconsToTempFolder(BUILD_SVG_DIR, inputData))
    .then(() => iconsToDictionary(DIST_DIR, inputData))
    .then(() => buildFont(options))
    .then(() => buildCSSEncoded(BUILD_FONTS_DIR, DIST_DIR, fontName))
    .then(() => organizeFiles(BUILD_FONTS_DIR, DIST_DIR))
    .then(() => createBuildDirective(BUILD_ORIGINAL_SVG_DIR))
    .then(() => createNaturalNames(inputData))
    .then(naturalInputData => iconsToDictionary(ORIGINAL_DIR, naturalInputData))
    .then(naturalInputData => iconsToTempFolder(BUILD_ORIGINAL_SVG_DIR, naturalInputData))
    .then(() => buildFont(optionsNatural))
    .then(() => buildCSSEncoded(BUILD_ORIGINAL_FONTS_DIR, ORIGINAL_DIR, fontName))
    .then(() => organizeFiles(BUILD_ORIGINAL_FONTS_DIR, ORIGINAL_DIR))
    .catch(err => {
      err ? console.error('Error:', err) : console.error('Something gone wrong... Aborted.')
    })
}

const createNaturalNames = (inputData: Map<string, string>) => {
  const naturalInputData = new Map<string, string>()
  for (const icon of [ ...new Set(Object.values(inputData)) ]) {
    naturalInputData.set(icon.toString().split('/')[1].replace(/_/gm, '-'), icon)
  }
  return Promise.resolve(naturalInputData)
}

const splitCSSEncoded = (cssBuffer: Buffer, fontFacePath: PathLike | fs.FileHandle, classesPath: PathLike | fs.FileHandle) => {
  const cssAscii = cssBuffer.toString('ascii')
  const regex = /@font-face \{.|[^\}]*\}$/m
  const [ fontFaceAscii ] = cssAscii.match(regex) || []
  const cssSelectorsAscii = cssAscii.replace(regex, '')
  return Promise.all([
    fs.writeFile(fontFacePath, fontFaceAscii),
    fs.writeFile(classesPath, cssSelectorsAscii),
  ])
}

const buildCSSEncoded = (buildFontsDir: string, buildPathDir: string, fontName: string) => {
  const BASE64_PATH_DIR = path.resolve(buildPathDir, 'base64')
  const fontPath = path.resolve(buildFontsDir, `${fontName}.ttf`)
  const cssPath = path.resolve(buildPathDir, `${fontName}.css`)
  const newCssPath = path.resolve(BASE64_PATH_DIR, `${fontName}.css`)
  const newCssFontFacePath = path.resolve(BASE64_PATH_DIR, `${fontName}-font-face.css`)
  const newCssClassesPath = path.resolve(BASE64_PATH_DIR, `${fontName}-classes.css`)

  const fontBase64$ = fs.readFile(fontPath)
    .then(fontBuffer => Promise.resolve(fontBuffer.toString('base64')))

  const cssAscii$ = fs.readFile(cssPath)
    .then(cssBuffer => Promise.resolve(cssBuffer.toString('ascii')))

  return fs.mkdir(BASE64_PATH_DIR, { recursive: true })
    .then(() => Promise.all([fontBase64$, cssAscii$]))
    .then(([ fontBase64, cssAscii]) => {
      const regex = /src:(.|[\r\n][^\}])*/m
      const [ stringToReplace ] = cssAscii.match(regex) || []
      return Promise.resolve(cssAscii.replace(stringToReplace, `src: url(data:font/truetype;charset=utf-8;base64,${fontBase64});`))
    })
    .then(cssString => fs.writeFile(newCssPath, cssString))
    .then(() => fs.readFile(newCssPath))
    .then(cssBuffer => splitCSSEncoded(cssBuffer, newCssFontFacePath, newCssClassesPath))
    .then(() => console.debug('Build CSS Encoded created ' + chalk.green('successfully') + ' in ', chalk.green(newCssPath.split('projects')[1])))
    .catch(error => {
      console.error('Build CSS Encoded failed.', error)
      return Promise.reject(error)
    })
}

/**
 * Crea la cartella di lavoro per la build
 * @return {Promise<void>}
 */
const createBuildDirective = async (buildSvgDir: string): Promise<void> => {
  return fs.mkdir(buildSvgDir, { recursive: true })
    .then(() => {
      console.debug('Build directive created ' + chalk.green('successfully') + ' in ', chalk.green(buildSvgDir.split('projects')[1]))
    })
    .catch(error => {
      console.error('Build directive creation failed.', error)
      return Promise.reject(error)
    })
}

/**
 * Crea un dizionario con le icone presenti nella libreria di font
 * @param buildPathDir {String} Il path di destinazione del dictionary delle icone creato
 * @param inputData {Object.<string, string>} Mappa con l'icona desiderata come valore e il nome dell'icona come chiave
 * @returns {Promise<void[]>} Una promise da attendere perché termini la copia
 */
const iconsToDictionary = async (buildPathDir: string, inputData: Map<string, string>) => {
  return fs.writeFile(path.resolve(buildPathDir, 'dictionary.json'), JSON.stringify(inputData, null, 2))
    .then(() => {
      console.info('Dictionary creation success')
      return Promise.resolve(inputData)
    })
    .catch(error => {
      console.error('Dictionary creation failed.', error)
      return Promise.reject(error)
    })
}

/**
 * Copia tutte le icone richieste in una cartella di build
 * @param inputData {Object.<string, string>} Mappa con l'icona desiderata come valore e il nome dell'icona come chiave
 * @returns {Promise<void[]>} Una promise da attendere perché termini la copia
 */
const iconsToTempFolder = async (buildSvgDir: string, inputData: Map<string, string>) => {
  const promises = []
  for (const [key, value] of Object.entries(inputData)) {
    const icon = iconSelectorToObject(value.toString())
    const sourcePathPromise = ICON_GROUPS[icon.group as keyof typeof ICON_GROUPS].getPath(icon.name)
    const destinationPath = path.join(buildSvgDir, `${key}.svg`)

    const promise = sourcePathPromise.then(sourcePath => {
      // console.debug('Copying', sourcePath, '->', destinationPath)
      fs.copyFile(sourcePath, destinationPath)
        .catch(error => {
          console.error('Icons copy to temp folder error.', error)
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
      console.error(`${chalk.red('One or more icons not found')}`)
      Promise.reject(error)
    })
}

/**
 * Dato il nome di un'icona desiderata crea un oggetto con le stesse informazioni ben suddivise.
 */
const iconSelectorToObject = (iconSelector: string): {name: string, group: string} => {
  let array = iconSelector.split('/')
  if (array.length === 1) {
    array = ['localDirectory', ...array]
  }

  return {
    group: array[0],
    name: array[1],
  }
}

const buildFont = async (options: BuildFontOptions): Promise<void> => {
  const _options = getSvgToFontOptions(options)
  const scssFileName = path.join(options.outputPath, `${options.fontName}.scss`)
  return svgtofont(_options)
    .then(() => addPrefixToAssetsUrlInScss(scssFileName, options.cssPath)) // defaultValue == cssPath
}

function addPrefixToAssetsUrlInScss (scssFileName: PathLike, cssPath = '') {
  return fs.readFile(scssFileName)
    .then(scssText => {
      const variableName = '$font-icons-base-url'
      return `${variableName}: '${path.basename(cssPath)}/' !default;\n\n${scssText}`
        .replace(new RegExp(`url\\(('|")${path.basename(cssPath)}`, 'g'), `url(${variableName} + $1`)
    })
    .then(scssText => fs.writeFile(scssFileName, scssText))
}

const getSvgToFontOptions = ({ svgPath, relativeOutputPath, cssPath, fontName, website }: BuildFontOptions): SvgToFontOptions => {
  return {
    src: svgPath,
    dist: path.join(relativeOutputPath, path.basename(cssPath)),
    fontName, // font name
    classNamePrefix: fontName,
    css: {
      fontSize: '24px',
      cssPath,
      output: relativeOutputPath, // css/scss/less/styl files
    },
    // startNumber: 20000, // unicode start number
    svgicons2svgfont: {
      fontHeight: 1000,
      normalize: true,
      // log: () => {},
    },
    typescript: true,
    website: !website ? undefined : {
      links: [],
      title: '@maggioli-design-system/icons',
      description: 'Maggioli Design System Icons is an icon font package based on Google Material Design Icons and Material Design Icons community icons.',
      logo: '',
      favicon: undefined,
      footerInfo: 'Gruppo Maggioli, tutti i diritti riservati.',
    },
  }
}

const organizeFiles = (buildFontsDir: string, buildPathDir: string) => {
  // Moving out of "fonts" folder files witch aren't fonts
  const isFontFile = /\.(ttf|woff|woff2|eot|svg)$/i
  return fs.readdir(buildFontsDir)
    .then(files => files.filter(filename => !isFontFile.test(filename)))
    .then(files => Promise.all(files.map(
      file => fs.rename(path.join(buildFontsDir, file), path.join(buildPathDir, file)),
    )))
}

main(process.argv.slice(2))
