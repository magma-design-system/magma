/* eslint-disable no-console */
import * as meta from '../meta'
import { jest } from '@jest/globals'
import { join } from 'path'

import {
  main,
  componentsMap,
  npmComponentMap,
  componentsUpdatedMap,
  componentsToBeUpdated,
  getComponents,
  componentPackagePath,
  buildMap,
} from '../update'
import { readJSON } from 'fs-extra'

global.fetch = jest.fn(async (url: string) => {
  const [component] = url.split('/').filter(p => p.startsWith('mds'))
  const newUrl = join(__dirname, './mocks/', component, 'npm.package.json')
  return Promise.resolve({ status: 200, json: () => readJSON(newUrl) })
}) as jest.Mock

jest.mocked(meta).COMPONENTS_DIR = join(__dirname, './mocks/')
jest.mocked(meta).PROJECT_DIR = join(__dirname, './mocks/')

describe('update.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    componentsMap.clear()
    npmComponentMap.clear()
    componentsUpdatedMap.clear()
    componentsToBeUpdated.length = 0
  })

  describe('buildMap', () => {
    it('should catch mocked package.json', () => {
      expect(componentPackagePath('mds-table-test')).toBe(
        join(__dirname, '/mocks/mds-table-test/package.json'),
      )
    })
    it('should get components correctly', async () => {
      const components = await getComponents()
      expect(components).toHaveLength(7)
    })
    it('should build map correctly', async () => {
      expect(componentsMap).toEqual(new Map())
      expect(npmComponentMap).toEqual(new Map())
      expect(componentsUpdatedMap).toEqual(new Map())

      await buildMap()

      expect(Array.from(componentsMap.keys())).toHaveLength(7)
      expect(Array.from(npmComponentMap.keys())).toHaveLength(7)
      expect(Array.from(componentsUpdatedMap.keys())).toHaveLength(7)

      expect(componentsMap.get('mds-table-test')).toEqual([])
      expect(componentsMap.get('mds-table-footer-test')).toEqual([
        'mds-table-test',
      ])

      const checknpmDependencies = await readJSON(
        join(__dirname, '/mocks/mds-table-test/npm.package.json'),
      )
      expect(npmComponentMap.get('mds-table-test')).toEqual({
        version: checknpmDependencies.version,
        dependencies: checknpmDependencies.dependencies,
      })

      const checkcurrentDependencies = await readJSON(
        join(__dirname, '/mocks/mds-table-test/package.json'),
      )
      expect(componentsUpdatedMap.get('mds-table-test')).toEqual({
        version: checkcurrentDependencies.version,
        dependencies: checkcurrentDependencies.dependencies,
      })
    })
  })

  describe('main', () => {
    const { log } = console // save original console.log function
    beforeEach(() => {
      console.log = jest.fn() // create a new mock function for each test
    })
    afterAll(() => {
      console.log = log // restore original console.log after all tests
    })

    it('should execute main in dry run correctly', async () => {
      const mdsTablePackage = await readJSON(
        join(__dirname, '/mocks/mds-table-test/package.json'),
      )
      await main([
        'node',
        'update.ts',
        'mds-table-test',
        '--version=minor',
        '--dry-run',
      ])
      const mdsTablePackageAfterMain = await readJSON(
        join(__dirname, '/mocks/mds-table-test/package.json'),
      )
      await expect(mdsTablePackage).toEqual(mdsTablePackageAfterMain)
    })

    it('should update mds-table-test minor', async () => {
      const resultUpdate = {
        component: 'mds-table-test',
        package: {
          name: '@maggioli-design-system/mds-table-test',
          version: '4.8.0',
          dependencies: {
            '@maggioli-design-system/mds-table-body-test': '4.7.1',
            '@maggioli-design-system/mds-table-footer-test': '4.6.3',
            '@maggioli-design-system/mds-table-header-test': '4.7.1',
            '@maggioli-design-system/styles': '15.3.2',
            '@stencil/core': '4.21.0',
          },
        },
      }
      await main([
        'node',
        'update.ts',
        'mds-table-test',
        '--version=minor',
        '--dry-run',
      ])

      expect(console.log).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith(resultUpdate)
    })

    it('should update mds-table-body-test to patch and mds-table-header-test to minor, so mds-table should update to minor ', async () => {
      // simulate that the component is update manually to patch (see file mds-table-body-test/package.json)
      const resultUpdateHeader = {
        component: 'mds-table-header-test',
        package: {
          name: '@maggioli-design-system/mds-table-header-test',
          version: '4.8.0', // update minor
          dependencies: {
            '@maggioli-design-system/mds-table-header-cell-test': '1.0.1',
            '@maggioli-design-system/styles': '15.3.2',
            '@stencil/core': '4.21.0',
          },
        },

      }
      const resultUpdateTable = {
        component: 'mds-table-test',
        package: {
          name: '@maggioli-design-system/mds-table-test',
          version: '4.8.0',
          dependencies: {
            '@maggioli-design-system/mds-table-body-test': '4.7.1', // update from 4.7.0
            '@maggioli-design-system/mds-table-footer-test': '4.6.3',
            '@maggioli-design-system/mds-table-header-test': '4.8.0',
            '@maggioli-design-system/styles': '15.3.2',
            '@stencil/core': '4.21.0',
          },
        },
      }

      // update only component mds-table-header-test to minor
      await main([
        'node',
        'update.ts',
        'mds-table-header-test',
        '--version=minor',
        '--dry-run',
      ])

      // two console log for two components update (mds-table-header-test and mds-table-test)
      expect(console.log).toHaveBeenCalledTimes(2)
      expect(console.log).toHaveBeenCalledWith(resultUpdateTable)
      expect(console.log).toHaveBeenCalledWith(resultUpdateHeader)
    })
    it('should update mds-content and mds-container to patch', async () => {
      const resultUpdateContent = {
        component: 'mds-content',
        package: {
          name: '@maggioli-design-system/mds-content',
          version: '1.1.1',
          dependencies: {
            '@maggioli-design-system/styles': '15.3.2',
            '@stencil/core': '4.21.0',
          },
        },
      }
      const resultUpdateContainer = {
        component: 'mds-container',
        package: {
          name: '@maggioli-design-system/mds-container',
          version: '1.1.1',
          dependencies: {
            '@maggioli-design-system/mds-content': '1.1.1', // update from 1.1.0 to 1.1.1
            '@maggioli-design-system/styles': '15.3.2',
            '@stencil/core': '4.21.0',
          },
        },
      }
      await main([
        'node',
        'update.ts',
        'mds-content',
        '--version=patch',
        '--dry-run',
      ])

      // two console log for two components update (mds-content and mds-container)
      expect(console.log).toHaveBeenCalledTimes(2)
      expect(console.log).toHaveBeenCalledWith(resultUpdateContainer)
      expect(console.log).toHaveBeenCalledWith(resultUpdateContent)
    })
  })

})
