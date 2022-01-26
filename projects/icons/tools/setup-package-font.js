const fs = require('fs')
const { join } = require('path')

const ROOT_DIR = __dirname + '/..'
const DIST_DIR = ROOT_DIR + '/dist'

function main () {

  // Output folder
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR)
  }

  const resourcesDir = join(DIST_DIR, 'resources')
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir)
  }
  fs.copyFileSync(join(ROOT_DIR, 'resources', 'mgg-icons.json'), join(resourcesDir, 'mgg-icons.json'))

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
