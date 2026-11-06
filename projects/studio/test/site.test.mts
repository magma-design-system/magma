import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type Browser } from 'playwright'
import { afterAll, beforeAll, expect, test } from 'vitest'

import { writeSite } from '../site.ts'

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

// the studio on its first page and on the Theme section, which shows the scene in an iframe,
// and the two pages that section shows; each with the documents it loads (the folder of the
// site is the studio, as the links of the docs site give it)
test.skipIf(!built).each([
  ['', ['']],
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
