
import chalk from 'chalk'
import { TEMPLATES_DIR, DIST_DIR } from './meta'
import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import Handlebars from 'handlebars'

const COMPONENTS_DIR = '../stencil/src/components'
const main = async () => {
  const componentsFolderContents = await readdir(COMPONENTS_DIR, { withFileTypes: true })
  const components = componentsFolderContents
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    // only include Stencil component tags/folders like "mds-foo-bar"
    .filter(name => /^mds-[a-z0-9-]+$/.test(name))
  const hydratedTemplate = await readFile(join(TEMPLATES_DIR, 'hydrated.css.hbs')).catch(error => { throw new Error(chalk.red(error)) })
  const template = Handlebars.compile(hydratedTemplate.toString())
  const compiledHydratedComponents = template({ components })
  const hydratedFilePath = join(DIST_DIR, 'css', 'hydrated.css')
  await writeFile(hydratedFilePath, compiledHydratedComponents, { encoding: 'utf8' }).then(() => console.info('File overwrite')).catch(error => { throw new Error(chalk.red(error)) })
  return Promise.resolve()
}

main()
