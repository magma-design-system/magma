#!/usr/bin/env ts-node
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { existsSync, readFile, readFileSync, readJSON, readdir, writeFileSync, writeJSON } from 'fs-extra'
import { COMPONENTS_DIR, PROJECT_DIR } from './meta'
import { resolve } from 'path'
import { isEqual } from 'lodash'

const componentPackagePath = (name: string) =>
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

  const v = await getCurrentComponentVersion(component)
  let [major, minor, patch] = v.split('.')
  switch (version) {
  case 'patch': patch = `${Number(patch) + 1}`; break
  case 'minor': patch = '0'; minor = `${Number(minor) + 1}`; break
  case 'major': patch = '0'; minor = '0'; major = `${Number(major) + 1}`; break
  }
  return `${major}.${minor}.${patch}`
  // if (!existsSync(resolve(COMPONENTS_DIR, component, 'package.json'))) {
  //   console.log('package.json non presente per ', component)
  //   return Promise.reject(new Error(`package.json non presente per ${component}`))
  // }


  // return new Promise<string>((res, rej) => exec(
  //   `cd ${resolve(COMPONENTS_DIR, component)} && npm version ${version}`,
  //   (err, stdout) => {
  //     if (err) {
  //       console.error(err)
  //       rej(err)
  //     }
  //     res(stdout.trim().slice(1))
  //   },
  // ))
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
      }).catch(err => console.error(err))
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
  return v ? Promise.resolve(v) : readJSON(componentPackagePath(c)).then(p => p.version)
}

function getNpmPackageShortInfo (c: string): Promise<ShortPackageInfo> {
  const endpoint = `https://registry.npmjs.org/@maggioli-design-system/${c}/latest`
  return fetch(endpoint)
    .then(res => {
      if (res.status === 200) {
        return res.json()
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
  if (component === 'mds-avatar') {
    console.log('mds-avatar')
    console.log('npmversion', npmVersion)
    console.log('currentVersion', currentVersion)
    console.log('npmDependencies', npmDependencies)
    console.log('currentDependencies', currentDependencies)
    console.log('!componentsToBeUpdated.includes(component)', !componentsToBeUpdated.includes(component) )
    console.log('npmDependencies === currentDependencies', isEqual(npmDependencies, currentDependencies))

    console.log('componentsttobeupdated', componentsToBeUpdated)
  }
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

async function updateComponentDependencies2 (name: string): Promise<void> {
  const v = await getCurrentComponentVersion(name)

  const relatedComponent = componentsMap.get(name)

  if (relatedComponent) {
    await Promise.all(relatedComponent.map(async rc => {
      const pInfo = componentsUpdatedMap.get(rc)
      if (pInfo && pInfo.dependencies[`@maggioli-design-system/${name}`] !== v) {
        pInfo.dependencies[`@maggioli-design-system/${name}`] = v
        componentsUpdatedMap.set(rc, pInfo)
        if (!componentsToBeUpdated.includes(name)){
          componentsToBeUpdated.push(name)
        }
      }
      await updateComponent(rc, 'patch')
      await updateComponentDependencies2(rc)
    }))
  }
}

async function updateComponent (c: string, version: string) : Promise<void> {
  const needUpdate = await needUpdateComponent(c, version)
  // const currentVersion = await getCurrentComponentVersion(c)
  // console.log('NEED UPDATE', c, needUpdate)
  if (needUpdate) {
    const newVersion = await update(c, version)
    const pInfo = componentsUpdatedMap.get(c)
    if (pInfo) {
      pInfo.version = newVersion
      // console.log('update version', c, pInfo)
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

async function syncDep (): Promise<void[]> {
  // await Promise.all(Array.from(componentsMap.keys())
  //   .map(name => updateComponentDependencie(name)),
  // ).then(() => Array.from(componentsMap.keys()).map(name => updateComponent(name, 'patch')))

  return Promise.all(Array.from(componentsMap.keys())
    .map(name => updateComponentDependencies2(name)))
}

async function writePackages (components: string[]): Promise<void> {
  components.forEach(name => {
    const path = componentPackagePath(name)
    readFile(path, 'utf-8').then(JSON.parse).then(json => {
      json.version = componentsUpdatedMap.get(name)?.version
      json.dependencies = componentsUpdatedMap.get(name)?.dependencies
      return json
    })
      .then(json => writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`))
  })
}
interface Dep {
  [key:string] : string,
  // dependencie: string
  // version: string
}

interface ShortPackageInfo {
  version: string,
  dependencies: Dep
}

const componentsMap = new Map<string, string[]>()
const npmComponentMap = new Map<string, ShortPackageInfo>()
const componentsUpdatedMap = new Map<string, ShortPackageInfo>()

const componentsToBeUpdated: string[] = []

async function main (argv: string[]) {
  componentsToBeUpdated.push(...argv.slice(2).filter(arg => !arg.startsWith('--')))
  const version = argv.filter(arg => arg.startsWith('--version'))[0]?.split('=')[1] ?? 'patch'

  const timeStart = Date.now()
  await buildMap()
  // console.log('npmpackage', npmComponentMap)
  // console.log('localPackage', componentsUpdatedMap)
  // return
  const timeBuild = Date.now()
  await Promise.all(
    componentsToBeUpdated.map(c => updateComponent(c, version)),
  )
  await Promise.all(
    componentsToBeUpdated.map(updateComponentDependencies2),
  )
  if (componentsToBeUpdated.length === 0) {
    await syncDep()
  }
  await writePackages(componentsToBeUpdated)
  const timeEnd = Date.now()
  console.log('buildMapTime: ', timeBuild - timeStart, 'ms')
  console.log('updateTime', timeEnd - timeBuild, 'ms')
  console.log('totaleTime: ', timeEnd - timeStart, 'ms')

  // writeFileSync('temp.json', JSON.stringify(componentsUpdatedMap, replacer))
}
// function replacer (key: any, value: any) {
//   if (value instanceof Map) {
//     return {
//       dataType: 'Map',
//       value: Array.from(value.entries()), // or with spread: value: [...value]
//     }
//   }
//   return value

// }

if (require.main === module) {
  main(process.argv)
}
