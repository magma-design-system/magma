/* eslint-disable no-console */
import { existsSync, readdir } from 'fs-extra'
import { COMPONENTS_DIR } from './meta'
import { exec } from 'child_process'
import { resolve } from 'path'

export function update (version: string, component: string): void {
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
  const [,, v, ...component] = process.argv

  if (!v) {
    console.log('verificare la versione inserita')
    return 1
  }
  console.log(component)
  if (component[0] === 'all') {
    readdir(COMPONENTS_DIR, { withFileTypes: true }).then(dirs => {
      dirs
        .filter(dir => dir.isDirectory())
        .forEach(dir => {
          update(v, dir.name)
        })
    })
  } else {
    component.forEach(c => update(v, c))
  }
}
if (require.main === module) {
  main()
}
