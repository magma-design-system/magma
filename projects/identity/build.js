const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const shell = require('shelljs')
const PDFDocument = require('pdfkit')
const SVGtoPDF = require('svg-to-pdfkit')
const svgDim = require('svg-dimensions')

const directoryPath = path.join(__dirname, 'resources/')

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

function exportImage(item, size) {
  const density = 72 * size / 16 // https://github.com/lovell/sharp/issues/729
  sharp(path.join(__dirname, `resources/${item}.svg`), { density: density, limitInputPixels: false })
    .resize(size)
    .png()
    .toFile(path.join(__dirname, `dist/${item}-${size}w.png`))
    .then(function(info) {
      console.log(`Generating PNG image: "${item}-${size}w.png" ${info.width}x${info.height}px ${size / 1024}kB`)
    })
    .catch(function(err) {
      console.error(`${err}: "${item}-${size}w.png"`)
    })
}

function exportPDF(item) {
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
        stream.on('finish', function() {
          console.log(`Generating PDF document: ${item}.pdf ${width}x${height}px`)
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
    item = item.replace('.svg', '')
    shell.cp('-R', 'resources/*', 'dist')
    exportPDF(item)
    exportImage(item, 256)
    exportImage(item, 512)
    exportImage(item, 1024)
  })
})
