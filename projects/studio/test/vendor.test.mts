import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

import { LAYERS, STYLESHEETS } from '../../lint/src/mcp/render.ts'
import { magmaVendor } from '../vendor.ts'

// The pages of the studio load Magma as a render of the MCP server does, from the Magma
// installed where the studio runs (docs/ARCHITECTURE.md, "Magma as an external vendor").

const root = fileURLToPath(new URL('..', import.meta.url))
const plugin = magmaVendor(root)

type Tag = { tag: string; attrs?: Record<string, string>; children?: string }
const tags = () =>
  (plugin.transformIndexHtml as { handler: () => Tag[] }).handler()

test('the page imports the stylesheets of agents/assets.md in their layers, after the layer order', () => {
  const style = tags().find((one) => one.tag === 'style')!.children!.split('\n')
  expect(style[0]).toBe(LAYERS)
  // every stylesheet of the list: one missing means a package (or its build) is not installed
  const imported = style.slice(1)
  expect(imported).toHaveLength(STYLESHEETS.length)
  // in the order of the list, each in its layer, relative to the page
  const order = imported.map((line) =>
    STYLESHEETS.findIndex(
      ({ module, layer }) =>
        line.includes(`'node_modules/${module}`) && line.endsWith(`layer(${layer});`),
    ),
  )
  expect(order.every((index) => index >= 0)).toBe(true)
  expect(order.every((index, at) => at === 0 || index > order[at - 1]!)).toBe(true)
  for (const line of imported) expect(line).toMatch(/^@import url\('node_modules\//)
})

test('the page loads the lazy loader of the installed magma, beside it', () => {
  const loader = tags().find((one) => one.tag === 'script' && one.attrs?.type === 'module')
  expect(loader?.attrs?.src).toBe('components/magma-components.esm.js')
})

test('the dev server serves the stylesheets and the icons from the installed packages', async () => {
  const handlers: Array<(req: unknown, res: unknown, next: () => void) => void> = []
  const server = { middlewares: { use: (handler: (typeof handlers)[number]) => handlers.push(handler) } }
  ;(plugin.configureServer as (server: unknown) => void)(server)
  const served = (url: string) =>
    new Promise<string | undefined>((resolve) => {
      const res = {
        setHeader: (name: string, value: string) => name === 'content-type' && resolve(value),
        on: () => res, once: () => res, emit: () => true, write: () => true, end: () => undefined,
      }
      handlers[0]({ url }, res, () => resolve(undefined))
    })
  const require = createRequire(path.join(root, 'package.json'))
  expect(require.resolve('normalize.css')).toBeTruthy()
  expect(await served('/node_modules/normalize.css/normalize.css')).toMatch(/text\/css/)
  expect(await served('/studio/svg/mi/baseline/palette.svg')).toMatch(/svg/)
  // what Vite serves itself goes on to Vite
  expect(await served('/node_modules/.vite/deps/preact.js')).toBeUndefined()
  expect(await served('/src/main.tsx')).toBeUndefined()
})
