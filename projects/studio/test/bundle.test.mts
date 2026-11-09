import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

// Magma as an external vendor (docs/ARCHITECTURE.md): the build of the studio holds none of the
// Magma components nor their stylesheets; its pages load them from beside them. Read on the
// build `nx run studio:test` makes first.

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const built = existsSync(dist)

test.skipIf(!built)('the bundle holds no component of Magma, no runtime of Stencil', () => {
  const assets = readdirSync(`${dist}assets`)
  const scripts = assets.filter((file) => file.endsWith('.js'))
  expect(scripts.length).toBeGreaterThan(0)
  for (const file of scripts) {
    const code = readFileSync(`${dist}assets/${file}`, 'utf8')
    for (const marker of ['registerInstance', 'proxyCustomElement', 'bootstrapLazy', 'attachShadow'])
      expect(code, `${file} holds ${marker}`).not.toContain(marker)
  }
  expect(existsSync(`${dist}components`)).toBe(false)
  expect(existsSync(`${dist}node_modules`)).toBe(false)
})

test.skipIf(!built)('each page loads Magma from beside it, untouched by the build', () => {
  for (const page of ['index.html', 'scene.html', 'groups.html', 'states.html', 'hero.html']) {
    const html = readFileSync(`${dist}${page}`, 'utf8')
    expect(html).toContain('<script type="module" src="components/magma-components.esm.js"></script>')
    expect(html).toContain("@import url('node_modules/")
  }
})
