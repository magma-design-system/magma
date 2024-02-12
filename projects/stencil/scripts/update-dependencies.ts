/* eslint-disable no-console */
import { COMPONENTS_DIR, PROJECT_DIR } from './meta'
import {
  existsSync,
  readFile,
  readFileSync,
  readdir,
  writeFileSync,
} from 'fs-extra'
import { resolve } from 'path'
import { ask } from 'stdio'
import { update } from './update-version'

interface Dep {
  dependencie: string
  version: string
}

function updateComponentDependencies (
  nameComponent: string,
  stencilDependencies: Dep[],
  version: string,
  deps?:string[],
) {
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
      ).then(updatedDependencies => {
        if (stencilDependencies) {
          updatedDependencies.push(...stencilDependencies)
        }
        // updatedDependencies = [...{package, version}]
        updatedDependencies.forEach(d => {
          if (json.dependencies[d.dependencie] !== `${d.version}` && (deps ? deps.includes(d.dependencie) : true)) {
            updated = true
          }
          // check if dependencies exists, it does not add new dependencies if --sync-dep is active
          if (json.dependencies[d.dependencie]) {
            json.dependencies[d.dependencie] = `${d.version}`
          }
        })
        // new json with updated dependencies
        return { json, updated }
      })
    })
    .then(({ json, updated }) => {
      // rewrite file only if dependencies have been updated
      if (updated) {
        // writeFileSync avoid to read a file before write is completed
        writeFileSync(componentPackage, `${JSON.stringify(json, null, 2)}\n`)
        console.log(`${nameComponent}: updated dependencies`)
        // update version component
        update(version, nameComponent)
      }
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMDSDependenciesPackageWithVersion (json: any): Map<string, string> {
  const packageWithVersion = new Map<string, string>()
  Object.entries(json.dependencies).forEach(v => {
    if (/@maggioli-design-system\/mds-.+/.test(v[0])) {
      packageWithVersion.set(v[0], v[1] as string)
    }
  })
  return packageWithVersion
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDependencies (json: any): Dep[] {
  const packageWithVersion: Dep[] = []
  Object.entries(json.dependencies).forEach(v => {
    packageWithVersion.push({ dependencie: v[0], version: v[1] as string })
  })
  return packageWithVersion
}

async function getVersion (args: string[]): Promise<string> {
  let [version] = args
    .filter(arg => arg.startsWith('--version'))
    .map(argVersion => argVersion.split('=')[1])
  const versionOptions = ['major', 'minor', 'patch']
  if (!versionOptions.includes(version)) {
    console.info('Release version is required')
    const continueTask = await ask('Select version', {
      options: [...versionOptions, ''],
    })
    if (!versionOptions.includes(continueTask)) {
      return Promise.reject(new Error('Selected version is invalid'))
    }
    version = continueTask
  }
  return Promise.resolve(version)
}

async function main () {
  const components = process.argv.filter(arg => !arg.startsWith('--')).slice(2)

  const sync = process.argv.indexOf('--sync-dep') !== -1

  const version = await getVersion(process.argv).catch(err => {
    console.error(err.message)
    return null
  })
  if (!version) return
  let stencilDependencies: Dep[] = []
  if (sync) {
    stencilDependencies = getDependencies(
      JSON.parse(readFileSync(resolve(PROJECT_DIR, 'package.json'), 'utf-8')),
    )
  }

  if (components[0] === 'all') {
    const continueTask = await ask('Continue to update ALL components?', {
      options: ['Y', 'n', ''],
    })

    if (continueTask === 'n') {
      return
    }

    readdir(COMPONENTS_DIR, { withFileTypes: true }).then(dirs => {
      dirs
        .filter(dir => dir.isDirectory())
        .forEach(dir => {
          updateComponentDependencies(dir.name, stencilDependencies, version)
        })
    })
  } else {
    components.forEach(component =>
      updateComponentDependencies(component, stencilDependencies, version),
    )
  }
}

if (require.main === module) {
  main()
}
