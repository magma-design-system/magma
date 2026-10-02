import { newE2EPage, E2EPage } from '@stencil/core/testing'

declare global {
  interface Window {
    idbConnections: IDBDatabase[]
    cspViolations: string[]
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

/**
 * Applies the policy of a site that allows requests to its own origin only (`fetch` is
 * governed by `connect-src`) and records the requests it blocks.
 */
const applySameOriginPolicy = (page: E2EPage): Promise<void> =>
  page.evaluate(() => {
    window.cspViolations = []
    document.addEventListener('securitypolicyviolation', event => window.cspViolations.push(event.blockedURI))
    const policy = document.createElement('meta')
    policy.httpEquiv = 'Content-Security-Policy'
    policy.content = 'connect-src \'self\''
    document.head.appendChild(policy)
  })

/** Sets the icons path through a nameless `mds-icon`, then gives it the icon to render */
const renderIcon = (page: E2EPage, path: string, name: string): Promise<void> =>
  page.evaluate(async (iconsPath: string, iconName: string) => {
    const icon = document.createElement('mds-icon')
    document.body.appendChild(icon)
    await icon.componentOnReady()
    await icon.setSvgPath(iconsPath)
    icon.setAttribute('name', iconName)
  }, path, name)

const waitForRenderedIcon = (page: E2EPage, name: string): Promise<unknown> =>
  page.waitForFunction((iconName: string) =>
    Boolean(document.querySelector(`mds-icon[name="${iconName}"]`)?.shadowRoot?.querySelector('svg')), {}, name)

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

describe('IconsSetService under a same-origin Content Security Policy', () => {
  // the icons of a previous run would come from IndexedDB, without any request
  const run = Date.now()

  it('requests the icons of the page origin, whatever the form of the path', async () => {
    const page = await newE2EPage()
    mockSvgResponse(page)
    await page.setContent('')
    await applySameOriginPolicy(page)
    const origin = await page.evaluate(() => location.origin)

    for (const [index, path] of ['/icons-csp/', 'icons-csp/', `${origin}/icons-csp/`].entries()) {
      await renderIcon(page, path, `csp/same-origin-${run}-${index}`)
      await waitForRenderedIcon(page, `csp/same-origin-${run}-${index}`)
    }

    expect(await page.evaluate(() => window.cspViolations)).toEqual([])
  })

  it('blocks the icons of another origin, which the policy must allow explicitly', async () => {
    const page = await newE2EPage()
    mockSvgResponse(page)
    await page.setContent('')
    await applySameOriginPolicy(page)

    await renderIcon(page, 'https://cdn.example.com/svg/', `csp/cdn-${run}`)
    await page.waitForFunction(() => window.cspViolations.length > 0)

    expect(await page.evaluate(() => window.cspViolations)).toEqual([expect.stringMatching(/^https:\/\/cdn\.example\.com\//)])
  })
})
