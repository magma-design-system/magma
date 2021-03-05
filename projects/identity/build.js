const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const shell = require('shelljs')

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
  sharp(path.join(__dirname, `resources/${item}.svg`))
    .resize(size)
    .png()
    .toFile(path.join(__dirname, `dist/${item}-${size}w.png`))
    .then(function(info) {
      console.log(info)
    })
    .catch(function(err) {
      console.error(err)
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
    shell.mkdir('-p', `dist/${path}`);
  })

  cleanResults.forEach((item, index) => {
    item = item.replace('.svg', '')
    shell.cp('-R', 'resources/*', 'dist')
    exportImage(item, 512)
    exportImage(item, 1024)
  })

  // https://github.com/lovell/sharp/issues/729
})
