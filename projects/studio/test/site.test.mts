import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type Browser, type Page } from 'playwright'
import { afterAll, beforeAll, expect, test } from 'vitest'

import { writeSite } from '../site.ts'
import { COLORS_PAGES } from '../src/routes.ts'

// The studio as a static site (site.ts), served as GitHub Pages serves it: files only, no Vite,
// under the path of the project site. Each page opens with the icons and the fonts of Magma and
// asks for nothing the site does not hold, the API of the command included. Written from the
// build `nx run studio:test` makes first, in the Playwright Chromium.

const root = fileURLToPath(new URL('..', import.meta.url))
const built = existsSync(path.join(root, 'dist'))

/** The path of https://magma-design-system.github.io/magma/studio/ */
const BASE = '/magma/studio/'

/** The content types a static host gives by extension: a module script needs its own. */
const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
}

let out: string
let server: Server
let browser: Browser
let origin: string

beforeAll(async () => {
  if (!built) return
  out = mkdtempSync(path.join(tmpdir(), 'studio-site-'))
  writeSite(root, out)
  server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://site').pathname)
    const file = pathname.startsWith(BASE)
      ? path.join(out, pathname.slice(BASE.length) || 'index.html')
      : undefined
    if (!file?.startsWith(out + path.sep) || !existsSync(file) || statSync(file).isDirectory()) {
      res.statusCode = 404
      res.end()
      return
    }
    res.setHeader('content-type', TYPES[path.extname(file)] ?? 'application/octet-stream')
    res.end(readFileSync(file))
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  browser = await chromium.launch()
}, 60_000)

afterAll(async () => {
  await browser?.close()
  server?.close()
  if (out) rmSync(out, { recursive: true, force: true })
})

// the studio on its first page, the Start page, whose hero paints a page of a product in an
// iframe, and on the Theme section, which shows the scene in an iframe, and the pages those
// frames show; each with the documents it loads (the folder of the site is the studio, as the
// links of the docs site give it)
test.skipIf(!built).each([
  ['', ['', 'hero.html']],
  ['#/theme', ['', 'scene.html']],
  ['scene.html', ['scene.html']],
  ['groups.html', ['groups.html']],
])(
  'the page %s opens with the icons and the fonts of Magma, nothing missing',
  async (page, pages) => {
    const context = await browser.newContext()
    const tab = await context.newPage()
    const problems: string[] = []
    const served: string[] = []
    tab.on('response', (response) => {
      if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`)
      else served.push(new URL(response.url()).pathname)
    })
    tab.on('requestfailed', (request) =>
      problems.push(`${request.failure()?.errorText} ${request.url()}`),
    )
    tab.on('console', (message) => {
      if (message.type() === 'error') problems.push(`console: ${message.text()}`)
    })
    tab.on('pageerror', (error) => problems.push(`page: ${error.message}`))
    await tab.goto(`${origin}${BASE}${page}`, { waitUntil: 'networkidle' })
    // mds-icon asks for an icon only once its component has rendered and IndexedDB has said it
    // holds no copy: on a runner with a slow disk that answer comes after the network has been
    // idle for 500 ms, and counted at networkidle the icons were none (#1312: IndexedDB delayed
    // by a second reproduces it). The test waits for the first one instead
    await expect
      .poll(() => served.some((one) => one.startsWith(`${BASE}svg/`)), { timeout: 30_000 })
      .toBe(true)
    const fonts = await tab.evaluate(async () => {
      await document.fonts.ready
      return [...document.fonts].filter((font) => font.status === 'loaded').map((font) => font.family)
    })
    await context.close()

    expect(problems).toEqual([])
    for (const one of pages) expect(served).toContain(`${BASE}${one}`)
    expect(served.filter((one) => one.startsWith(`${BASE}svg/`)).length).toBeGreaterThan(0)
    expect(
      served.filter((one) => one.startsWith(`${BASE}node_modules/@fontsource/`)).length,
    ).toBeGreaterThan(0)
    expect(fonts.length).toBeGreaterThan(0)
  },
  60_000,
)

// The Colors section is the layout that holds its <main>: the bar of the list of the families,
// the list and the page. The list is the <aside> the button of the bar controls by its id.
const LIST_TOGGLE = 'mds-button[aria-controls="palette-list"]'
const LIST = '#palette-list'
const PAGE = '#palette-list ~ main'

/** A page of Colors in the tab, once its title is the one of the page and its components are up. */
async function openColors (tab: Page, slug: string): Promise<void> {
  const label = COLORS_PAGES.find((page) => page.slug === slug)!.label
  await tab.evaluate((hash) => { location.hash = hash }, `#/colors/${slug}`)
  await tab.waitForFunction((title) => {
    const heading = document.querySelector('main mds-text[tag="h1"]')
    const section = heading?.closest('main')?.parentElement
    return (
      heading?.textContent?.trim() === title &&
      !heading.closest('[hidden]') &&
      [...(section?.querySelectorAll('*') ?? [])].every(
        (el) => !el.localName.includes('-') || el.hasAttribute('hydrated'),
      )
    )
  }, label)
  await tab.evaluate(() => document.fonts.ready)
}

/** Whether the element the selector names is drawn: it and its ancestors take a box. */
const drawn = (tab: Page, selector: string) => tab.locator(selector).isVisible()

/** How the actions of the head of the page, the row of Reset, are laid out: in a row, or stacked. */
const actions = (tab: Page) =>
  tab.evaluate(() => {
    const row = document.getElementById('studio-reset')!.parentElement!
    return getComputedStyle(row).flexDirection
  })

// The pages of Colors on a phone (#1311): none scrolls sideways, a block of code scrolling inside
// its own frame; the list of the families stands folded above the page (palette.css), its bar
// opens the list in place of the page and choosing a family folds it again; the actions of the
// head stack (style.css). On a desktop the list stands beside the page and the bar is not drawn.
test.skipIf(!built)(
  'on a phone no page of Colors scrolls sideways, and the list of the families folds above the page',
  async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } })
    const tab = await context.newPage()
    await tab.goto(`${origin}${BASE}`, { waitUntil: 'networkidle' })
    const sideways: Record<string, string[]> = {}
    for (const { slug } of COLORS_PAGES) {
      await openColors(tab, slug)
      sideways[slug] = await tab.evaluate(() =>
        [...document.querySelector('main')!.parentElement!.querySelectorAll('*')]
          .filter(
            (el) =>
              el.localName !== 'pre' &&
              ['auto', 'scroll'].includes(getComputedStyle(el).overflowX) &&
              el.scrollWidth > el.clientWidth + 1,
          )
          // named by its tags, attributes and all, without its content
          .map((el) => {
            const tags = (el.cloneNode(false) as Element).outerHTML
            return `${tags} ${el.scrollWidth}/${el.clientWidth}`
          }),
      )
    }
    expect(sideways).toEqual(Object.fromEntries(COLORS_PAGES.map(({ slug }) => [slug, []])))

    await openColors(tab, 'palette')
    expect(await actions(tab)).toBe('column')
    expect(await drawn(tab, LIST_TOGGLE)).toBe(true)
    expect(await drawn(tab, LIST)).toBe(false)
    await tab.click(LIST_TOGGLE)
    await tab.locator(LIST).waitFor({ state: 'visible' })
    expect(await drawn(tab, PAGE)).toBe(false)
    await tab.click(`${LIST} mds-button[label="info"]`)
    await tab.waitForFunction(
      () => document.querySelector('#palette-color-title')?.textContent?.trim() === 'status.info',
    )
    expect(await drawn(tab, LIST)).toBe(false)
    expect(await drawn(tab, PAGE)).toBe(true)
    await context.close()
  },
  120_000,
)

test.skipIf(!built)('on a desktop the list of the families stands beside the page', async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const tab = await context.newPage()
  await tab.goto(`${origin}${BASE}`, { waitUntil: 'networkidle' })
  await openColors(tab, 'palette')
  const boxes = await tab.evaluate((selectors) =>
    selectors.map((one) => {
      const box = document.querySelector(one)!.getBoundingClientRect()
      return { left: box.left, right: box.right, top: box.top }
    }),
  [LIST, PAGE])
  expect(await drawn(tab, LIST_TOGGLE)).toBe(false)
  expect(boxes[0].left).toBe(0)
  expect(boxes[1].left).toBe(boxes[0].right)
  expect(boxes[1].top).toBe(boxes[0].top)
  expect(await actions(tab)).toBe('row')
  await context.close()
}, 60_000)
