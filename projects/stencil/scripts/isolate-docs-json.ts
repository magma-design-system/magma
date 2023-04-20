import chalk from 'chalk'
import { logFileSavedTo } from '../../../scripts/log'
import { JsonDocsComponent, JsonDocs } from '@stencil/core/internal/stencil-public-docs'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { DIST_DIR, COMPONENTS_DIR } from './meta'
import { PathLike, writeJSON } from 'fs-extra'

const DOCUMENTATION_FILENAME = 'documentation.json'
const JSON_DOCS_DIR = join(DIST_DIR, 'documentation.json')

const writeJsonFile = async (path: PathLike, jsonData: JsonDocs) => {
  try {
    await writeJSON(path.toString(), jsonData, { spaces: 2 })
    logFileSavedTo(DOCUMENTATION_FILENAME, path)
  } catch (err) {
    throw Error(chalk.red(err))
  }
}

const main = async () => {
  const { timestamp, compiler, components } = JSON.parse(await readFile(JSON_DOCS_DIR, { encoding: 'utf8' }))
  components.forEach(async (element: JsonDocsComponent) => {
    const componentDir = join(COMPONENTS_DIR, element.tag, DOCUMENTATION_FILENAME)
    const componentDoc: JsonDocs = {
      timestamp,
      compiler,
      components: [element],
    }
    await writeJsonFile(componentDir, componentDoc)
  })
}

main()
