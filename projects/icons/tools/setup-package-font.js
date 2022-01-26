const fs = require('fs')
const { join } = require('path')
const { BUILD_PATH_DIR } = require('../lib/utils.js')
const DIST_DIR = BUILD_PATH_DIR

function main () {

  // Output folder
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR)
  }

  // Moving out of 'fonts' folder files witch aren't fonts
  const fontsDir = join(DIST_DIR, 'fonts')
  const isFontFile = /\.(ttf|woff|woff2|eot|svg)$/i
  const files = fs.readdirSync(fontsDir).filter(filename => !isFontFile.test(filename))
  for (const file of files) {
    console.log(file)
    fs.renameSync(join(fontsDir, file), join(DIST_DIR, file))
  }
}

main()
