import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'
import chalk from 'chalk'
import path from 'path'
import sharp from 'sharp'
import svgDim from 'svg-dimensions'
import { mkdir, readFile, readdir, stat } from 'fs/promises'
import { createWriteStream, PathLike } from 'fs'
import { copy } from 'fs-extra'
import { DIST_DIR } from './meta'

let itemsTotal = 0
let itemsCurrent = 0

const RESOURCES_PATH = path.join(__dirname, '../resources/')

interface LogData {
  current: number,
  filename: string,
  filetype: string,
  resolution: string,
  size?: number,
  total: number,
}

const logFile = ({
  current,
  filename,
  filetype,
  resolution,
  size,
  total,
}: LogData) => {
  console.log(`
Progress: ${(current / total * 100).toFixed(1)}%
Filename: ${chalk.red(filename)}
Filesize: ${chalk.yellow(size ? formatBytes(size) : 'N/A')}
Resolution: ${chalk.green(resolution)}
Format: ${chalk.blue(filetype.toUpperCase())}`)
}

const resource = (item: string): string =>
  path.join(RESOURCES_PATH, `${item}.svg`)


const formatFilename = (name: string, size: number, extension: string) =>
  `${name}-${size}w.${extension}`

const formatResolution = (width: number, height: number) =>
  `${width}x${height}px`

const removeDuplicates = (list: string[]) => {
  const s = new Set(list)
  const it = s.values()
  return Array.from(it)
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

const walk = (dir: PathLike, callback: Function) => {
  let results: string[] = []

  readdir(dir)
    .then(files => {
      let pending = files.length
      if (!pending) return callback(null, results)

      files.forEach((file: string) => {
        const filePath = path.resolve(dir.toString(), file)
        stat(filePath).then(stat => {
          if (stat && stat.isDirectory()) {
            walk(filePath, (error: string, result: []) => {

              if (error) {
                throw Error(chalk.red(error))
              }

              results = results.concat(result)
              pending -= 1

              if (!pending) {
                callback(null, results)
              }
            })
          } else {
            results.push(filePath)
            pending -= 1

            if (!pending) {
              callback(null, results)
            }
          }
        })
      })
    }).catch(error => {
      callback(error)
    })
}

const exportPNG = async (item: string, size: number) => {
  console.log('exportPNG')
  itemsTotal = itemsTotal + 1
  const density = 72 * size / 16 // https://github.com/lovell/sharp/issues/729
  const filetype = 'png'

  sharp(resource(item), { density, limitInputPixels: false })
    .resize(size)
    .png()
    .toFile(path.join(DIST_DIR, `${item}-${size}w.${filetype}`))
    .then(info => {
      itemsCurrent = itemsCurrent + 1
      logFile({
        current: itemsCurrent,
        filetype,
        filename: formatFilename(item, size, filetype),
        resolution: formatResolution(info.width, info.height),
        size: info.size,
        total: itemsTotal,
      })
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const exportWEBP = async (item: string, size: number) => {
  console.log('exportWEBP')
  itemsTotal = itemsTotal + 1
  const density = 72 * size / 16
  const filetype = 'webp'

  sharp(resource(item), { density, limitInputPixels: false })
    .resize(size)
    .png()
    .toFile(path.join(DIST_DIR, `${item}-${size}w.${filetype}`))
    .then(info => {
      itemsCurrent = itemsCurrent + 1
      logFile({
        current: itemsCurrent,
        filetype,
        filename: formatFilename(item, size, filetype),
        resolution: formatResolution(info.width, info.height),
        size: info.size,
        total: itemsTotal,
      })
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const exportPDF = async (item: string) => {
  console.log('exportPDF')
  itemsTotal = itemsTotal + 1
  const sourceFile = resource(item)
  const filetype = 'pdf'

  readFile(sourceFile, { encoding: 'utf8' })
    .then(data => {
      svgDim.get(sourceFile, (error: string, dimensions: { height: number, width: number }) => {
        if (error) {
          throw Error(chalk.red(error))
        }
        const { height, width } = dimensions
        const doc = new PDFDocument({
          size: [ width, height ],
        })
        SVGtoPDF(doc, data, 0, 0, { assumePt: true })
        const stream = createWriteStream(path.join(DIST_DIR, `${item}.${filetype}`))
        stream.on('finish', () => {
          itemsCurrent = itemsCurrent + 1
          logFile({
            current: itemsCurrent,
            filetype,
            filename: `${item}.${filetype}`,
            resolution: formatResolution(width, height),
            total: itemsTotal,
          })
          doc.pipe(stream)
          doc.end()
        })
      })
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

walk(RESOURCES_PATH, (error: string, results: string[]) => {
  if (error) {
    throw Error(chalk.red(error))
  }

  const cleanResults: string[] = []

  results.forEach((item: string) => {
    if (item.indexOf('.svg') !== -1) {
      cleanResults.push(item.split('resources/')[1])
    }
  })

  const paths: string[] = []
  cleanResults.forEach(item => {
    paths.push(item.split('/')[0])
  })

  const cleanPaths = removeDuplicates(paths)
  cleanPaths.forEach(filePath => {
    mkdir(path.join(DIST_DIR, filePath), { recursive: true })
      .catch(error => {
        throw Error(chalk.red(error))
      })
  })

  cleanResults.forEach(item => {
    const sizes = [
      256,
      512,
      1024,
    ]
    const itemFilename = item.replace('.svg', '')

    copy(RESOURCES_PATH + item, DIST_DIR + path.sep + item)
      .then(() => {
        exportPDF(itemFilename)
        sizes.forEach(sizeItem => {
          exportPNG(itemFilename, sizeItem)
          exportWEBP(itemFilename, sizeItem)
        })
      })
      .catch(error => {
        throw Error(chalk.red(error))
      })
  })
})
