import { SVG_ICONS_DIST_DIR, FIXTURES_DIR } from './meta'
import { copy } from 'fs-extra'
import { join } from 'path'
import { logFileSavedTo } from '../../../scripts/log'

const copyFixtures = (): void => {
  copy(join(SVG_ICONS_DIST_DIR, 'iconsauce.json'), join(FIXTURES_DIR, 'iconsauce.json'), { overwrite: true, recursive: true })
    .then(() => {
      logFileSavedTo('iconsauce.json', SVG_ICONS_DIST_DIR)
    })
}

copyFixtures()
