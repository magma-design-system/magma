import { resolve, join } from 'path'
const PROJECT_DIR = resolve(__dirname, '../')
const TEMPLATES_DIR = join(PROJECT_DIR, 'template')
const COMPONENTS_DIR = join(PROJECT_DIR, 'components')

export {
  COMPONENTS_DIR,
  TEMPLATES_DIR,
}
