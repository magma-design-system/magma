const svgtofont = require('svgtofont')
const fs = require('fs')
const path = require('path')
const pkg = require('../../package.json')

const BUILD_SVG_DIR = './build/svg'
const GROUPS_PATH = {
  maggioli: './svg',
  material: './material'
}

// input parameters
const parameters = process.argv.slice(2)
const inputFile = parameters[0]
console.log('Input file:', inputFile)

const inputData = require(inputFile)
console.log('Input data:', inputData)

fs.mkdir(BUILD_SVG_DIR, { recursive: true }, err => {
  if (err) {
    console.error('Build directive creation failed.', err)
    throw err
  }
  console.debug('Build directive created in', BUILD_SVG_DIR)
})

for (const [key, value] of Object.entries(inputData)) {
  const icon = iconSelectorToObject(value)
  const sourcePath = `${GROUPS_PATH[icon.group]}/${icon.name}.svg`
  const destinationPath = `${BUILD_SVG_DIR}/${key}.svg`

  fs.copyFile(sourcePath, destinationPath, (err) => {
    if (err) {
      console.error('Build directive creation failed.', err)
      throw err
    }
    console.debug('Copied', sourcePath, 'in', destinationPath)
  })
}

function iconSelectorToObject(iconSelector) {
  let array = iconSelector.split('/')
  if (array.length === 1) {
    array = ['maggioli', ...array]
  }

  return {
    group: array[0],
    name: array[1]
  }
}

svgtofont({
  src: BUILD_SVG_DIR, // svg path
  dist: path.resolve(process.cwd(), 'build', 'fonts'), // output path
  fontName: 'mgg-fonticons', // font name
  // css: true, // Create CSS files.
  // startNumber: 20000, // unicode start number
  svgicons2svgfont: {
    fontHeight: 1000,
    normalize: true
  },
  website: {
    title: pkg.name,
    // Must be a .svg format image.
    logo: path.resolve(process.cwd(), 'svg', 'smartphone.svg'),
    favicon: null,
    version: pkg.version,
    meta: {
      description: pkg.description,
      keywords: 'TTF,EOT,WOFF,WOFF2,SVG'
    },
    description: '',
    // Add a Github corner to your website
    // Like: https://github.com/uiwjs/react-github-corners
    corners: {
      url: pkg.repository.url,
      width: 62, // default: 60
      height: 62, // default: 60
      bgColor: '#dc3545' // default: '#151513'
    },
    links: [
      {
        title: 'Repository',
        url: pkg.repository.url
      },
      {
        title: 'Feedback',
        url: 'https://git.maggioli.it/ricerca-sviluppo-new-media/design-system/-/issues'
      },
      {
        title: 'Font Class',
        url: 'index.html'
      },
      {
        title: 'Unicode',
        url: 'unicode.html'
      },
      {
        title: 'SVG Symbol',
        url: 'symbol.html'
      }
    ],
    footerInfo: 'Licensed under MIT. (Yes it\'s free and <a href="https://github.com/jaywcjlove/svgtofont">open-sourced</a>'
  }
}).then(() => {
  console.log('done!')
})
