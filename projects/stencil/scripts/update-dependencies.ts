/* eslint-disable no-console */
import { COMPONENTS_DIR } from './meta'
import {
  existsSync,
  readFile,
  readdir,
  writeFile,
} from 'fs-extra'
import { resolve } from 'path'
import { ask } from 'stdio'

function updateComponentDependencies (nameComponent: string) {
  const componentPackage = resolve(
    COMPONENTS_DIR,
    nameComponent,
    'package.json',
  )

  if (!existsSync(componentPackage)) {
    console.log('package.json non presente per ', componentPackage)
    return
  }

  readFile(componentPackage, 'utf-8')
    .then(JSON.parse)
    .then(json => {
      console.log(`check ${nameComponent} package.json`)
      const dependencies = getMDSDependenciesPackageWithVersion(json)
      let updated = false
      // read all version of dependencies package in current webcomponet
      return Promise.all(
        Array.from(dependencies.keys()).map(p =>
          readFile(
            resolve(COMPONENTS_DIR, p.split('/')[1], 'package.json'),
            'utf-8',
          )
            .then(JSON.parse)
            .then(data => {
              return { dependencie: p, version: data.version }
            }),
        ),
      ).then(versions => {
        // versions = [...{package, version}]
        versions.forEach(v => {
          if (json.dependencies[v.dependencie] !== `^${v.version}`) {
            updated = true
          }
          json.dependencies[v.dependencie] = `^${v.version}`
        })
        // new json with updated dependencies
        return { json, updated }
      })
    })
    .then(({ json, updated }) => {
      // rewrite file only if dependencies have been updated
      if (updated){
        writeFile(componentPackage, `${JSON.stringify(json, null, 2)}\n`)
      }
    })
}

function getMDSDependenciesPackageWithVersion (json: any): Map<string, string> {
  const packageWithVersion = new Map<string, string>()
  Object.entries(json.dependencies).forEach(v => {
    if (/@maggioli-design-system\/mds-.+/.test(v[0])) {
      packageWithVersion.set(v[0], v[1] as string)
    }
  })
  return packageWithVersion
}

async function main () {
  const component = process.argv[2] ?? 'all'
  if (component === 'all') {
    const continueTask = await ask('Continue to update ALL components?', { options: ['Y', 'n', ''] })

    if (continueTask === 'n') {
      return
    }

    readdir(COMPONENTS_DIR, { withFileTypes: true }).then(dirs => {
      dirs
        .filter(dir => dir.isDirectory())
        .forEach(dir => {
          updateComponentDependencies(dir.name)
        })
    })
  } else {
    updateComponentDependencies(component)
  }
}
main()
