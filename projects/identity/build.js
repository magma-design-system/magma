const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const sharp = require('sharp')
const shell = require('shelljs')
const PDFDocument = require('pdfkit')
const SVGtoPDF = require('svg-to-pdfkit')
const svgDim = require('svg-dimensions')
const log = console.log

let itemsTotal = 0
let itemsCurrent = 0

const directoryPath = path.join(__dirname, 'resources/')

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

var walk = function(dir, done) {
  var results = []
  fs.readdir(dir, function(err, list) {
    if (err) return done(err)
    var pending = list.length
    if (!pending) return done(null, results)
    list.forEach(function(file) {
      file = path.resolve(dir, file)
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res)
            if (!--pending) done(null, results)
          })
        } else {
          results.push(file)
          if (!--pending) done(null, results)
        }
      })
    })
  })
}

function removeDuplicates(arr) {
  let s = new Set(arr)
  let it = s.values()
  return Array.from(it)
}

function exportPNG(item, size) {
  itemsTotal = itemsTotal + 1
  const density = 72 * size / 16 // https://github.com/lovell/sharp/issues/729
  sharp(path.join(__dirname, `resources/${item}.svg`), { density: density, limitInputPixels: false })
    .resize(size)
    .png()
    .toFile(path.join(__dirname, `dist/${item}-${size}w.png`))
    .then(function(info) {
      itemsCurrent = itemsCurrent + 1
      const filename = `${item}-${size}w.png`
      const res = `${info.width}x${info.height}px`
      log(`
Progress: ${(itemsCurrent / itemsTotal * 100).toFixed(1)}%
Filename: ${chalk.red(filename)}
Filesize: ${chalk.yellow(formatBytes(info.size))}
Resolution: ${chalk.green(res)}
Format: ${chalk.blue('PNG')}`);
    })
    .catch(function(err) {
      console.error(`${err}: "${item}-${size}w.png"`)
    })
}

function exportWEBP(item, size) {
  itemsTotal = itemsTotal + 1
  const density = 72 * size / 16
  sharp(path.join(__dirname, `resources/${item}.svg`), { density: density, limitInputPixels: false })
    .resize(size)
    .webp()
    .toFile(path.join(__dirname, `dist/${item}-${size}w.webp`))
    .then(function(info) {
      itemsCurrent = itemsCurrent + 1
      const filename = `${item}-${size}w.webp`
      const res = `${info.width}x${info.height}px`
      log(`
Progress: ${(itemsCurrent / itemsTotal * 100).toFixed(1)}%
Filename: ${chalk.red(filename)}
Filesize: ${chalk.yellow(formatBytes(info.size))}
Resolution: ${chalk.green(res)}
Format: ${chalk.blue('WEBP')}`);
    })
    .catch(function(err) {
      console.error(`${err}: "${item}-${size}w.webp"`)
    })
}

function exportPDF(item) {
  itemsTotal = itemsTotal + 1
  const current = `${itemsTotal}`
  const sourceFile = path.join(__dirname, `resources/${item}.svg`)
  fs.readFile(sourceFile, 'utf8', function(err, data) {
    if (err) throw err

    svgDim.get(sourceFile, function(err, dimensions) {
        if (err) console.log(err)

        const width = dimensions.width
        const height = dimensions.height
        const scale = 0.25
        const widthScaled = width - (width * scale)
        const heightScaled = height - (height * scale)
        const doc = new PDFDocument({
          size: [ widthScaled , heightScaled ]
        })

        SVGtoPDF(doc, data, 0, 0, { width: width, height: height })

        const stream = fs.createWriteStream(`dist/${item}.pdf`)
        stream.on('finish', function(data) {
          itemsCurrent = itemsCurrent + 1
          const filename = `${item}.pdf`
          const res = `${width}x${height}px`
          log(`
Progress: ${(itemsCurrent / itemsTotal * 100).toFixed(1)}%
Filename: ${chalk.red(filename)}
Resolution: ${chalk.green(res)}
Format: ${chalk.blue('PDF')}`);
        })
        doc.pipe(stream)
        doc.end()
    })

  })
}

walk(directoryPath, function (err, results) {
  if (err) {
    console.error(err)
  }

  const cleanResults = []

  results.forEach((item, index) => {
    if (item.indexOf('.svg') != -1) {
      cleanResults.push(item.split('resources/')[1])
    }
  })

  let paths = []
  cleanResults.forEach((item, index) => {
    paths.push(item.split('/')[0])
  })

  paths = removeDuplicates(paths)
  paths.forEach((path, index) => {
    shell.mkdir('-p', `dist/${path}`)
  })

  cleanResults.forEach((item, index) => {
    const sizes = [
      256,
      512,
      1024,
    ]
    item = item.replace('.svg', '')
    const currentItem = item.split('/')
    shell.cp('-R', 'resources/*', 'dist')

    exportPDF(item)

    sizes.forEach((sizeItem, sizeIndex) => {
      exportPNG(item, sizeItem)
      exportWEBP(item, sizeItem)
    })
  })
})
