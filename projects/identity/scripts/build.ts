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

interface LogData {
  filepath: string,
  filetype: string,
  filename?: string,
  resolution: string,
  size?: number,
}

let itemsTotal = 0
let itemsCurrent = 0
const filesList:LogData[] = []

const RESOURCES_PATH = path.join(__dirname, '../resources/')

const logFile = ({
  filepath,
  filetype,
  resolution,
  size,
}: LogData) => {
  itemsCurrent = itemsCurrent + 1
  console.log(`
Progress: ${(itemsCurrent / itemsTotal * 100).toFixed(1)}% ${chalk.grey(`${itemsCurrent}/${itemsTotal} (approximated)`)}
Filepath: ${chalk.red(filepath)}
Filesize: ${chalk.yellow(size ? formatBytes(size) : 'N/A')}
Resolution: ${chalk.green(resolution)}
Format: ${chalk.blue(filetype.toUpperCase())}`)

  const data = {
    filename: path.basename(filepath),
    filepath,
    filetype: filetype.toUpperCase(),
    resolution,
    size: size ? formatBytes(size) : 'N/A',
  }

  filesList.push(data as unknown as LogData)
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

// eslint-disable-next-line @typescript-eslint/ban-types
const walk = async (dir: PathLike, callback: Function ) => {
  let results: string[] = []

  readdir(dir)
    .then(files => {
      let pending = files.length
      if (!pending) return callback(null, results)

      files.forEach((file: string) => {
        const filePath = path.resolve(dir.toString(), file)
        stat(filePath).then(stat => {
          if (stat && stat.isDirectory()) {
            walk(filePath, (error: string, result: string[]) => {

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
  const density = 72 * size / 16 // https://github.com/lovell/sharp/issues/729
  const filetype = 'png'
  const filePath = path.join(DIST_DIR, formatFilename(item, size, filetype))

  sharp(resource(item), { density, limitInputPixels: false })
    .resize(size)
    .png()
    .toFile(filePath)
    .then(info => {
      logFile({
        filetype,
        filepath: formatFilename(item, size, filetype),
        resolution: formatResolution(info.width, info.height),
        size: info.size,
      })
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const exportWEBP = async (item: string, size: number) => {
  const density = 72 * size / 16
  const filetype = 'webp'
  const filePath = path.join(DIST_DIR, formatFilename(item, size, filetype))

  sharp(resource(item), { density, limitInputPixels: false })
    .resize(size)
    .png()
    .toFile(filePath)
    .then(info => {
      logFile({
        filetype,
        filepath: formatFilename(item, size, filetype),
        resolution: formatResolution(info.width, info.height),
        size: info.size,
      })
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const exportPDF = async (item: string) => {
  const sourceFile = resource(item)
  const filetype = 'pdf'
  const filePath = path.join(DIST_DIR, `${item}.${filetype}`)

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
        const stream = createWriteStream(filePath)
        stream.on('finish', () => {
          logFile({
            filetype,
            filepath: `${item}.${filetype}`,
            resolution: formatResolution(width, height),
          })
        })
        SVGtoPDF(doc, data, 0, 0, { assumePt: true })
        doc.pipe(stream)
        doc.end()
      })
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
}

const countItems = (sizes: number[]) => {
  sizes.forEach(() => {
    itemsTotal = itemsTotal + 2
  })

  itemsTotal = itemsTotal + 1
}

walk(RESOURCES_PATH, (error: string, results: string[]) => {
  if (error) {
    throw Error(chalk.red(error))
  }

  const cleanResults: string[] = []

  results.forEach((item: string) => {
    if (item.indexOf('.svg') !== -1) {
      cleanResults.push(item.replace(RESOURCES_PATH, ''))
    }
  })

  const paths: string[] = []
  cleanResults.forEach((item: string) => {
    paths.push(path.parse(item).dir)
  })

  const cleanPaths = removeDuplicates(paths)
  cleanPaths.forEach(filePath => {
    mkdir(path.join(DIST_DIR, filePath), { recursive: true })
      .catch(error => {
        throw Error(chalk.red(error))
      })
  })

  cleanResults.forEach((item: string) => {
    const sizes = [
      256,
      512,
      1024,
    ]

    const itemFilename = item.replace('.svg', '')

    copy(path.join(RESOURCES_PATH, item), path.join(DIST_DIR, item))
      .then(() => {
        countItems(sizes)
        sizes.forEach(sizeItem => {
          exportPNG(itemFilename, sizeItem)
          exportWEBP(itemFilename, sizeItem)
        })
        exportPDF(itemFilename)
      })
      .catch(error => {
        throw Error(chalk.red(error))
      })
  })
})
