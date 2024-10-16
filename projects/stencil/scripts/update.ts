#!/usr/bin/env ts-node
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { existsSync, readFile, readJSON, readdir, writeFileSync } from 'fs-extra'
import { COMPONENTS_DIR, PROJECT_DIR } from './meta'
import { resolve } from 'path'
import { isEqual } from 'lodash'

export const componentPackagePath = (name: string): string =>
  resolve(COMPONENTS_DIR, name, 'package.json')

// const stencilDep = getDependencies(
//   JSON.parse(readFileSync(resolve(PROJECT_DIR, 'package.json'), 'utf-8')))


/**
 * Execute update throw npm command
 * @param component component's name
 * @param version version of update
 * @returns new version
 */
async function update (component: string, version: string): Promise<string> {

  const v = await getNpmComponentVersion(component)
  let [major, minor, patch] = v.split('.')
  switch (version) {
  case 'patch': patch = `${Number(patch) + 1}`; break
  case 'minor': patch = '0'; minor = `${Number(minor) + 1}`; break
  case 'major': patch = '0'; minor = '0'; major = `${Number(major) + 1}`; break
  }
  return `${major}.${minor}.${patch}`
}

/**
 * @param includeNotPublish true if want to include not published components too
 * @returns array of mds-components name
 */
async function getComponents (
  includeNotPublish: boolean = false,
): Promise<string[]> {
  let res: string[] = []
  await readdir(COMPONENTS_DIR, { withFileTypes: true }).then(files => {
    res = files
      .filter(dir => {
        if (!dir.isDirectory()) {
          return false
        }
        return includeNotPublish || existsSync(componentPackagePath(dir.name))
      })
      .map(dir => dir.name)
  })
  return res
}

async function getMdsDependencies (component: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return readJSON(componentPackagePath(component)).then((p: any) => {
    return (
      Object.entries(p.dependencies)
        .filter(v => /@maggioli-design-system\/mds-.+/.test(v[0]))
        // ['@maggioli-design-system/mds-progress', '1.2.3'] to '@maggioli-design-system/mds-progress'
        .map(v => v[0])
        // '@maggioli-design-system/mds-progress' to 'mds-progress'
        .map(v => v.split('/')[1])
    )
  })
}

/**
 * Populate componentsMap, npmComponentMap, componentsUpdatedMap
 * @returns
 */
async function buildMap (): Promise<void[]> {
  (await getComponents()).forEach(name => {
    componentsMap.set(name, [])
  })
  const promises = Array.from(componentsMap.keys()).map(name => {
    return getMdsDependencies(name).then(deps =>
      deps.forEach(d => {
        componentsMap.set(d, [...(componentsMap.get(d) ?? []), name])
      }),
    )
  })
  promises.push(...Array.from(componentsMap.keys()).map(name => {
    return getNpmPackageShortInfo(name)
      .then(value => {
        npmComponentMap.set(name, value)
      }).catch(err => console.error(`Error on fetch package ${name}:`, err))
  }))
  promises.push(...Array.from(componentsMap.keys()).map(name => {
    return Promise.all([getCurrentComponentVersion(name), getCurrentComponentDependencies(name)])
      .then(value => {
        componentsUpdatedMap.set(name, { version: value[0], dependencies: value[1] })
      }).catch(err => console.error(err))
  }))

  return Promise.all(promises)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCurrentComponentDependencies (c: string): Promise<Dep> {
  const d = componentsUpdatedMap.get(c)?.dependencies
  return d ? Promise.resolve(d) : readJSON(componentPackagePath(c)).then(json => json.dependencies)
}

function getCurrentComponentVersion (c: string): Promise<string> {
  const v = componentsUpdatedMap.get(c)?.version
  return v ? Promise.resolve(v) : readJSON(componentPackagePath(c)).then(p => p.version).catch(() => {throw new Error('not mds component')})
}

function getNpmPackageShortInfo (c: string): Promise<ShortPackageInfo> {
  const endpoint = `https://registry.npmjs.org/@maggioli-design-system/${c}/latest`
  return fetch(endpoint)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      if (res.status === 404) {
        return Promise.resolve({
          version: getCurrentComponentVersion(c),
          dependencies: getCurrentComponentDependencies(c),
        })
      }
      return Promise.reject(new Error(`cant fetch npm version package ${c}\n${res.status}: ${res.statusText}`))
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((json: any) => {return { version: json.version, dependencies: json.dependencies }})
}
function getNpmComponentVersion (c: string): Promise<string> {
  const endpoint = `https://registry.npmjs.org/@maggioli-design-system/${c}/latest`
  return fetch(endpoint)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      return Promise.reject(new Error(`cant fetch npm version package ${c}\n${res.status}: ${res.statusText}`))
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((json: any) => json.version as string)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNpmComponentDependencies (c:string): Promise<Dep> {
  const endpoint = `https://registry.npmjs.org/@maggioli-design-system/${c}/latest`
  return fetch(endpoint)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      return Promise.reject(new Error(`cant fetch npm version package ${c}\n${res.status}: ${res.statusText}`))
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((json: any) => json.dependencies)
}

/**
 * Check if component need to be updated based on version passed
 * update only if express as argument of script or dependencies changed
 *
 * example:
 * @example
 * npm version: 1.2.3
 * current version: 1.2.4
 * version: patch
 * return false
 *
 * @example
 * npm version: 1.2.3
 * current version: 1.2.4
 * version: minor
 * return true
 * @param npmversion npm version
 * @param currentVersion current local version
 * @param version "major" | "minor" | "patch"
 */
async function needUpdateComponent (
  component: string,
  version: string,
): Promise<boolean> {
  const npmVersion = npmComponentMap.get(component)?.version
  const npmDependencies = npmComponentMap.get(component)?.dependencies
  const currentDependencies = await getCurrentComponentDependencies(component)
  const currentVersion = await getCurrentComponentVersion(component)

  // error retrive info from npm
  if (!npmDependencies || !npmVersion) return false
  // component is not updatable and same dependencies
  if (!componentsToBeUpdated.includes(component) && isEqual(npmDependencies, currentDependencies) ) {
    return false
  }

  // should be updated if it hasn't already been
  if (npmVersion === currentVersion) return true
  if (
    version === 'minor' &&
    npmVersion.split('.')[1] === currentVersion.split('.')[1]
  ) return true
  if (
    version === 'major' &&
    npmVersion.split('.')[0] === currentVersion.split('.')[0]
  ) return true
  return false
}

/**
 *
 * @param componentVersion version of component (npm)
 * @param currentVersion current version component
 * @returns version type difference between versions, null if there are the same
 *
 * @example
 * componentVersion: 1.2.3
 * currentVersion: 1.2.4
 * return 'patch'
 *
 * @example
 * componentVersion: 1.2.3
 * currentVersion: 1.3.4
 * return 'minor'
 *
 * @example
 * componentVersion: 1.2.3
 * currentVersion: 1.2.3
 * return null
 */
function getVersionTypeDiff (componentVersion: string | undefined, currentVersion: string): string | null {
  if (!componentVersion || componentVersion === currentVersion) {
    return null
  }
  const dv = componentVersion.split('.')
  const cv = currentVersion.split('.')
  if (dv[0] !== cv[0]) return 'major'
  if (dv[1] !== cv[1]) return 'minor'
  return 'patch' // dv[2] !== cv[2]
}

/**
 * Check dependencies of component and fix versions consistently to all components which it depends
 * @param name of component
 */
async function updateComponentDependencies (name: string): Promise<void> {
  const v = await getCurrentComponentVersion(name)

  const relatedComponent = componentsMap.get(name)

  // check correlate component dependencies first
  if (relatedComponent) {
    await Promise.all(relatedComponent.map(async rc => {
      const pInfo = componentsUpdatedMap.get(rc)
      const versionUpgradeType = getVersionTypeDiff(pInfo?.dependencies[`@maggioli-design-system/${name}`], v)
      if (versionUpgradeType) {
        pInfo!.dependencies[`@maggioli-design-system/${name}`] = v
        componentsUpdatedMap.set(rc, pInfo!)
        if (!componentsToBeUpdated.includes(name)){
          componentsToBeUpdated.push(rc)
        }
      }
      await updateComponent(rc, versionUpgradeType ?? 'patch')
      await updateComponentDependencies(rc)
    }))
  }

  // check version of dependencies and change to latest if needed
  const pInfo = componentsUpdatedMap.get(name)
  if (pInfo) {
    Object.entries(pInfo.dependencies).map(async ([dep, vers]) => {
      const currentDepVersion = await getCurrentComponentVersion(dep.split('/')[1] ?? '').catch(() => {return null})
      if (currentDepVersion && currentDepVersion !== vers) {
        pInfo.dependencies[dep] = currentDepVersion
      }
    })
    componentsUpdatedMap.set(name, pInfo)
  }

}

/**
 * Updates the component and all components on which it is dependent
 * @param c name component
 * @param version of component updated
 */
async function updateComponent (c: string, version: string) : Promise<void> {
  const needUpdate = await needUpdateComponent(c, version)
  if (needUpdate) {
    const newVersion = await update(c, version)
    const pInfo = componentsUpdatedMap.get(c)
    if (pInfo) {
      pInfo.version = newVersion
      componentsUpdatedMap.set(c, pInfo)
    }

    componentsMap.get(c)?.forEach(relatedC => {
      if (!componentsToBeUpdated.includes(relatedC)){
        componentsToBeUpdated.push(relatedC)
      }
    })
  }

  const relatedComponent = componentsMap.get(c)
  if (relatedComponent) {
    await Promise.all(relatedComponent.map(rc => updateComponent(rc, version)))
  }
}

/**
 * Synchronize all dependencies between components
 */
async function syncDep (): Promise<void[]> {
  return Promise.all(Array.from(componentsMap.keys())
    .map(name => updateComponentDependencies(name)))
}

async function updateCommonDependencies (): Promise<void[]> {
  const commonDeps = await readJSON(resolve(PROJECT_DIR, 'package.json')).then(p => p.dependencies) as Dep

  return Promise.all(Array.from(componentsMap.keys())
    .map(componentName => {
      getCurrentComponentDependencies(componentName).then(deps => {
        // filter dependencies that need to be updated
        const sharedDependencies = Array.from(Object.keys(commonDeps)).filter(cd => deps[cd] && commonDeps[cd] !== deps[cd])

        if (sharedDependencies.length) {
          sharedDependencies.forEach(cd => {
            deps[cd] = commonDeps[cd]
          })
          componentsUpdatedMap.set(componentName, { version : componentsUpdatedMap.get(componentName)!.version, dependencies: deps })
          componentsToBeUpdated.push(componentName)
        }
      })
    },
    ))
}

async function writePackages (components: string[], dryRun = false): Promise<void[]> {
  return Promise.all(components.map(name => {
    const path = componentPackagePath(name)
    return readFile(path, 'utf-8')
      .then(JSON.parse).then(json => {
        json.version = componentsUpdatedMap.get(name)?.version
        json.dependencies = componentsUpdatedMap.get(name)?.dependencies
        return json
      })
      .then(json => {
        if (!dryRun) {
          writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`)
        } else {
          console.log({ component: name, package: json })
        }
      })
  }))
}

/**
 * ['@maggioli-design-system/mds-text']: "1.2.3"
 */
interface Dep {
  [key:string] : string,
}

interface ShortPackageInfo {
  version: string,
  dependencies: Dep
}

// key is component, value is an array of strings of the components on which it is dependent
const componentsMap = new Map<string, string[]>()
// key is component, value is a ShortPackageInfo of published component
const npmComponentMap = new Map<string, ShortPackageInfo>()
// key is component, value is a ShortPackageInfo of component updated during the whole process of sync/update
const componentsUpdatedMap = new Map<string, ShortPackageInfo>()

// array of components name to be updated
const componentsToBeUpdated: string[] = []

async function main (argv: string[]): Promise<void> {
  componentsToBeUpdated.push(...argv.slice(2).filter(arg => !arg.startsWith('--')))
  const version = argv.filter(arg => arg.startsWith('--version'))[0]?.split('=')[1] ?? 'patch'
  const dryRun = argv.includes('--dry-run')
  const timeStart = Date.now()
  await buildMap()
  const timeBuild = Date.now()

  if (argv.filter(arg => arg.startsWith('--common'))) {
    await updateCommonDependencies()
  }

  await Promise.all(
    componentsToBeUpdated.map(c => updateComponent(c, version)),
  )
  await Promise.all(
    componentsToBeUpdated.map(updateComponentDependencies),
  )
  if (componentsToBeUpdated.length === 0) {
    await syncDep()
  }
  await writePackages(componentsToBeUpdated, dryRun)
  const timeEnd = Date.now()
  if (!dryRun) {
    console.log('buildMapTime: ', timeBuild - timeStart, 'ms')
    console.log('updateTime', timeEnd - timeBuild, 'ms')
    console.log('totaleTime: ', timeEnd - timeStart, 'ms')
  }
}

if (require.main === module) {
  main(process.argv)
}

// export functions for testing purposes
export {
  main,
  buildMap,
  updateComponent,
  updateComponentDependencies,
  syncDep,
  updateCommonDependencies,
  writePackages,
  getComponents,
  getNpmComponentDependencies,
  componentsMap,
  npmComponentMap,
  componentsUpdatedMap,
  componentsToBeUpdated,
  Dep,
  ShortPackageInfo,
}
