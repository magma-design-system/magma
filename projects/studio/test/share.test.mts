import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { expect, test } from 'vitest'

import { FAVICONS } from '../favicons.ts'

// The studio in a tab and on other sites: the favicons drawn from the mark of its bar
// (favicons.ts), and the preview of a link to it (index.html, public/covers/). The build is the
// one `nx run studio:test` makes first.

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const built = existsSync(dist)
const body = async (name: string) => FAVICONS[name]!.body()

test('the favicons are the mark of the bar, at the sizes each host asks for', async () => {
  // the SVG for the tabs, white on a dark scheme
  const svg = String(await body('favicon.svg'))
  expect(svg).toMatch(/^<svg[^>]*><style>@media \(prefers-color-scheme: dark\)/)

  // the ICO: one PNG per size, its size in the directory (16, 32, 48)
  const ico = (await body('favicon.ico')) as Buffer
  expect([ico.readUInt16LE(2), ico.readUInt16LE(4)]).toEqual([1, 3])
  expect([0, 1, 2].map((i) => ico.readUInt8(6 + 16 * i))).toEqual([16, 32, 48])

  const sizes = Object.fromEntries(
    await Promise.all(
      Object.keys(FAVICONS)
        .filter((name) => name.endsWith('.png'))
        .map(async (name) => {
          const { width, height } = await sharp((await body(name)) as Buffer).metadata()
          return [name, [width, height]]
        }),
    ),
  )
  expect(sizes).toEqual({
    'apple-touch-icon.png': [180, 180],
    'icon-192.png': [192, 192],
    'icon-512.png': [512, 512],
    'icon-maskable-512.png': [512, 512],
  })

  // the manifest names its icons beside it, at the sizes they are drawn
  const manifest = JSON.parse(String(await body('manifest.webmanifest')))
  expect(manifest.name).toBe('Magma Studio')
  for (const icon of manifest.icons) {
    expect(Object.keys(FAVICONS)).toContain(icon.src)
    expect(icon.sizes).toBe(sizes[icon.src].join('x'))
  }
})

test.skipIf(!built)('the studio links its favicons beside it, the pages of the frames none', () => {
  const html = readFileSync(`${dist}index.html`, 'utf8')
  const links = [...html.matchAll(/<link rel="(icon|apple-touch-icon|manifest)"[^>]*href="([^"]+)"/g)]
  expect(links.map((match) => match[2])).toEqual([
    'favicons/favicon.ico',
    'favicons/favicon.svg',
    'favicons/apple-touch-icon.png',
    'favicons/manifest.webmanifest',
  ])
  for (const name of Object.keys(FAVICONS)) expect(existsSync(`${dist}favicons/${name}`), name).toBe(true)
  for (const page of ['scene.html', 'groups.html', 'hero.html'])
    expect(readFileSync(`${dist}${page}`, 'utf8')).not.toContain('favicons/')
})

test.skipIf(!built)('a link to the studio shows its cover, at the size the tags say', async () => {
  const html = readFileSync(`${dist}index.html`, 'utf8')
  const meta = (property: string) =>
    new RegExp(`<meta\\s+(?:property|name)="${property}"\\s+content="([^"]+)"`).exec(html)?.[1]
  // the address of the studio on GitHub Pages; the cover beside it, with its stable name
  const url = meta('og:url')!
  expect(url).toBe('https://magma-design-system.github.io/magma/studio/')
  const image = meta('og:image')!
  expect(image.startsWith(url)).toBe(true)
  const cover = `${dist}${image.slice(url.length)}`
  expect(existsSync(cover)).toBe(true)
  const { width, height } = await sharp(cover).metadata()
  expect([width, height]).toEqual([Number(meta('og:image:width')), Number(meta('og:image:height'))])
  expect(meta('og:title')).toBe('Magma Studio')
  expect(meta('og:description')).toBe(meta('description'))
  expect(meta('twitter:card')).toBe('summary_large_image')
})
