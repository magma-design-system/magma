import { SVG_ICONS_DIST_DIR, FIXTURES_DIR } from './meta'
import { copy } from 'fs-extra'
import { join } from 'path'

const copyFixtures = (): void => {
  copy(join(SVG_ICONS_DIST_DIR, 'iconsauce.json'), join(FIXTURES_DIR, 'iconsauce.json'), { overwrite: true, recursive: true })
    .then(() => {
      console.log('si')
    })
}

copyFixtures()
