import { newE2EPage, E2EPage } from '@stencil/core/testing'

declare global {
  interface Window {
    idbConnections: IDBDatabase[]
  }
}

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2Z" /></svg>'
const svgPath = '/icons-set-service/'

/**
 * Answers the icon requests with an SVG, as `mockIconResponse` does with an empty body.
 * https://github.com/ionic-team/stencil/issues/2434#issuecomment-714776773
 */
const mockSvgResponse = (page: E2EPage): void => {
  page.on('response', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (page as any).removeAllListeners('request')
    page.on('request', request => {
      if (request.url().endsWith('.svg')) {
        request.respond({ status: 200, contentType: 'image/svg+xml', body: svg })
      } else {
        request.continue()
      }
    })
  })
}

/**
 * Sets the icons path and records the IndexedDB connections opened by idb-keyval,
 * before the components are even defined.
 */
const recordConnections = async (page: E2EPage): Promise<void> => {
  await page.evaluateOnNewDocument((path: string) => {
    sessionStorage.setItem('mdsIconSvgPath', path)
    window.idbConnections = []
    const openDatabase = indexedDB.open.bind(indexedDB)
    indexedDB.open = (...args: Parameters<IDBFactory['open']>): IDBOpenDBRequest => {
      const request = openDatabase(...args)
      request.addEventListener('success', () => window.idbConnections.push(request.result))
      return request
    }
  }, svgPath)
}

/**
 * Closes the connections the way the browser does after a `Clear-Site-Data: "storage"`
 * response: the connection stops accepting transactions and receives a `close` event.
 * Returns how many connections were closed.
 */
const closeConnectionsLikeTheBrowser = (page: E2EPage): Promise<number> =>
  page.evaluate(() => {
    const connections = window.idbConnections.splice(0)
    for (const connection of connections) {
      connection.close()
      connection.dispatchEvent(new Event('close'))
    }
    return connections.length
  })

/** Waits until the icon is cached in the IndexedDB store of idb-keyval */
const waitForCachedIcon = (page: E2EPage, name: string): Promise<unknown> =>
  page.waitForFunction((key: string) => new Promise<boolean>(resolve => {
    const request = indexedDB.open('keyval-store')
    // creating the database is up to idb-keyval, along with its object store
    request.onupgradeneeded = () => request.transaction?.abort()
    request.onerror = () => resolve(false)
    request.onsuccess = () => {
      const db = request.result
      // only the connections of idb-keyval are closed by the test
      window.idbConnections = window.idbConnections.filter(connection => connection !== db)
      const read = db.transaction('keyval', 'readonly').objectStore('keyval').get(key)
      read.onerror = () => resolve(false)
      read.onsuccess = () => {
        db.close()
        resolve(read.result !== undefined)
      }
    }
  }), {}, `loader_${svgPath}${name}.svg`)

describe('IconsSetService cache', () => {
  it('reopens IndexedDB after the browser closes the connection', async () => {
    const page = await newE2EPage()
    mockSvgResponse(page)
    await recordConnections(page)
    const cacheErrors: string[] = []
    page.on('console', message => {
      if (/isCacheAvailable error|setCache error/.test(message.text())) cacheErrors.push(message.text())
    })

    await page.setContent('<mds-icon name="connection/before"></mds-icon>')
    await waitForCachedIcon(page, 'connection/before')

    expect(await closeConnectionsLikeTheBrowser(page)).toBeGreaterThan(0)
    await page.evaluate(() => {
      const icon = document.createElement('mds-icon')
      icon.setAttribute('name', 'connection/after')
      document.body.appendChild(icon)
    })
    await waitForCachedIcon(page, 'connection/after')

    expect(cacheErrors).toEqual([])
  })
})
