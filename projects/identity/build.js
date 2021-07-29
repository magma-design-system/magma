const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const sharp = require('sharp')
const shell = require('shelljs')
const PDFDocument = require('pdfkit')
const SVGtoPDF = require('svg-to-pdfkit')
const svgDim = require('svg-dimensions')
const { log } = console

let itemsTotal = 0
let itemsCurrent = 0

const directoryPath = path.join(__dirname, 'resources/')

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

const walk = (dir, done) => {
  let results = []
  fs.readdir(dir, (err, list) => {
    if (err) return done(err)
    let pending = list.length
    if (!pending) return done(null, results)
    list.forEach(file => {
      const filePath = path.resolve(dir, file)
      fs.stat(filePath, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(filePath, (err, res) => {
            results = results.concat(res)
            pending -= 1
            if (!pending) done(null, results)
          })
        } else {
          results.push(filePath)
          pending -= 1
          if (!pending) done(null, results)
        }
      })
    })
  })
}

function removeDuplicates (arr) {
  const s = new Set(arr)
  const it = s.values()
  return Array.from(it)
}

function exportPNG (item, size) {
  itemsTotal = itemsTotal + 1
  const density = 72 * size / 16 // https://github.com/lovell/sharp/issues/729
  sharp(path.join(__dirname, `resources/${item}.svg`), { density, limitInputPixels: false })
    .resize(size)
    .png()
    .toFile(path.join(__dirname, `dist/${item}-${size}w.png`))
    .then(info => {
      itemsCurrent = itemsCurrent + 1
      const filename = `${item}-${size}w.png`
      const res = `${info.width}x${info.height}px`
      log(`
Progress: ${(itemsCurrent / itemsTotal * 100).toFixed(1)}%
Filename: ${chalk.red(filename)}
Filesize: ${chalk.yellow(formatBytes(info.size))}
Resolution: ${chalk.green(res)}
Format: ${chalk.blue('PNG')}`)
    })
    .catch(err => {
      console.error(`${err}: "${item}-${size}w.png"`)
    })
}

function exportWEBP (item, size) {
  itemsTotal = itemsTotal + 1
  const density = 72 * size / 16
  sharp(path.join(__dirname, `resources/${item}.svg`), { density, limitInputPixels: false })
    .resize(size)
    .webp()
    .toFile(path.join(__dirname, `dist/${item}-${size}w.webp`))
    .then(info => {
      itemsCurrent = itemsCurrent + 1
      const filename = `${item}-${size}w.webp`
      const res = `${info.width}x${info.height}px`
      log(`
Progress: ${(itemsCurrent / itemsTotal * 100).toFixed(1)}%
Filename: ${chalk.red(filename)}
Filesize: ${chalk.yellow(formatBytes(info.size))}
Resolution: ${chalk.green(res)}
Format: ${chalk.blue('WEBP')}`)
    })
    .catch(err => {
      console.error(`${err}: "${item}-${size}w.webp"`)
    })
}

function exportPDF (item) {
  itemsTotal = itemsTotal + 1
  const sourceFile = path.join(__dirname, `resources/${item}.svg`)
  fs.readFile(sourceFile, 'utf8', (err, data) => {
    if (err) throw err

    svgDim.get(sourceFile, (err, dimensions) => {
      if (err) console.log(err)
      const { height, width } = dimensions
      const scale = 0.25
      const widthScaled = width - (width * scale)
      const heightScaled = height - (height * scale)
      const doc = new PDFDocument({
        size: [ widthScaled, heightScaled ],
      })
      SVGtoPDF(doc, data, 0, 0, { width, height })
      const stream = fs.createWriteStream(`dist/${item}.pdf`)
      stream.on('finish', () => {
        itemsCurrent = itemsCurrent + 1
        const filename = `${item}.pdf`
        const res = `${width}x${height}px`
        log(`
Progress: ${(itemsCurrent / itemsTotal * 100).toFixed(1)}%
Filename: ${chalk.red(filename)}
Resolution: ${chalk.green(res)}
Format: ${chalk.blue('PDF')}`)
      })
      doc.pipe(stream)
      doc.end()
    })
  })
}

walk(directoryPath, (err, results) => {
  if (err) {
    console.error(err)
  }

  const cleanResults = []

  results.forEach(item => {
    if (item.indexOf('.svg') !== -1) {
      cleanResults.push(item.split('resources/')[1])
    }
  })

  let paths = []
  cleanResults.forEach(item => {
    paths.push(item.split('/')[0])
  })

  paths = removeDuplicates(paths)
  paths.forEach(path => {
    shell.mkdir('-p', `dist/${path}`)
  })

  cleanResults.forEach(item => {
    const sizes = [
      256,
      512,
      1024,
    ]
    const itemFilename = item.replace('.svg', '')
    shell.cp('-R', 'resources/*', 'dist')

    exportPDF(itemFilename)

    sizes.forEach(sizeItem => {
      exportPNG(itemFilename, sizeItem)
      exportWEBP(itemFilename, sizeItem)
    })
  })
})
