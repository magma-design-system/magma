/* eslint-disable no-console */
import { existsSync, readdir } from 'fs-extra'
import { COMPONENTS_DIR } from './meta'
import { exec } from 'child_process'
import { resolve } from 'path'

function update (version: string, component: string) {
  if (!existsSync(resolve(COMPONENTS_DIR, component, 'package.json'))) {
    console.log('package.json non presente per ', component)
    return
  }
  exec(`cd ${resolve(COMPONENTS_DIR, component)} && npm version ${version}`, (err, stdout) => {
    if (err) {
      console.error(err)
    }
    console.log(`updated ${component} component to version ${stdout}`)
  })
}

function main () {
  const [,, v, component = 'all'] = process.argv

  if (!v) {
    console.log('verificare la versione inserita')
    return 1
  }
  if (component === 'all') {
    readdir(COMPONENTS_DIR, { withFileTypes: true }).then(dirs => {
      dirs
        .filter(dir => dir.isDirectory())
        .forEach(dir => {
          update(v, dir.name)
        })
    })
  } else {
    update(v, component)
  }
}
main()
