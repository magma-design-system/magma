import { afterEach, expect, test } from 'vitest'
import type { Server } from 'node:http'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { saveRefusal, serializeConfig, startUiServer, type UiServerOptions } from '../src/lib/ui-server.mjs'
import realConfig from '../.magma-design-tokensrc.json'

let server: Server | undefined
let dir: string | undefined

afterEach(async () => {
  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()))
  server = undefined
  if (dir) await rm(dir, { recursive: true, force: true })
  dir = undefined
})

async function startServer (opts: UiServerOptions): Promise<string> {
  server = await startUiServer({ port: 0, ...opts })
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0
  return `http://localhost:${port}`
}

async function fixtureDir (): Promise<{ dirPath: string, configPath: string }> {
  dir = await mkdtemp(path.join(tmpdir(), 'mdt-ui-'))
  const configPath = path.join(dir, '.magma-design-tokensrc.json')
  await writeFile(configPath, serializeConfig(realConfig))
  return { dirPath: dir, configPath }
}

test('serializeConfig is deterministic, ascii-only and newline terminated', () => {
  // a non-ascii char (u+00e8) must survive as an escape, keeping the
  // written file pure ascii for clean cross-platform diffs
  const out = serializeConfig({ name: 'caff\u00e8', colors: [] })
  expect(out.endsWith('\n')).toBe(true)
  expect([...out].every((ch) => ch.charCodeAt(0) < 128)).toBe(true)
  expect(out).toContain('caff\\u00e8')
  expect(serializeConfig({ a: 1 })).toBe(JSON.stringify({ a: 1 }, null, 2) + '\n')
})

test('GET /api/config returns the on-disk config and its save path', async () => {
  const { configPath } = await fixtureDir()
  const base = await startServer({ config: configPath })

  const res = await fetch(`${base}/api/config`)
  expect(res.status).toBe(200)
  const data = (await res.json()) as { path: string, config: unknown, readOnly: string | null }
  expect(data.path).toBe(configPath)
  expect(data.config).toEqual(realConfig)
  expect(data.readOnly).toBeNull()
})

test('saveRefusal lets only JSON rc files through', () => {
  expect(saveRefusal('/p/.magma-design-tokensrc.json')).toBeNull()
  expect(saveRefusal('/p/.config/magma-design-tokensrc')).toBeNull()
  expect(saveRefusal('/p/tokens/color.json')).toBeNull()
  expect(saveRefusal('/p/.magma-design-tokensrc.cjs')).toContain('JavaScript module')
  expect(saveRefusal('/p/magma-design-tokens.config.js')).toContain('JavaScript module')
  expect(saveRefusal('/p/package.json')).toContain('magma-design-tokens key')
})

// the other config sources lilconfig finds: a save would turn them into bare
// JSON (a module loses its logic, package.json everything but the config)
const nonJsonSources = [
  {
    file: '.magma-design-tokensrc.js',
    content: `module.exports = ${JSON.stringify(realConfig)}\n`,
    reason: 'JavaScript module',
  },
  {
    file: '.magma-design-tokensrc.mjs',
    content: `export default ${JSON.stringify(realConfig)}\n`,
    reason: 'JavaScript module',
  },
  {
    file: 'package.json',
    content: JSON.stringify({ name: 'consumer', 'magma-design-tokens': realConfig }, null, 2) + '\n',
    reason: 'magma-design-tokens key',
  },
]

for (const source of nonJsonSources) {
  test(`a ${source.file} config is read-only: GET says why, PUT is refused and the file kept`, async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'mdt-ui-'))
    const configPath = path.join(dir, source.file)
    await writeFile(configPath, source.content)
    const base = await startServer({ config: configPath })

    const get = await fetch(`${base}/api/config`)
    expect(get.status).toBe(200)
    const data = (await get.json()) as { path: string, config: unknown, readOnly: string | null }
    expect(data.path).toBe(configPath)
    expect(data.config).toEqual(realConfig)
    expect(data.readOnly).toContain(source.reason)

    const put = await fetch(`${base}/api/config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(realConfig),
    })
    expect(put.status).toBe(409)
    expect(((await put.json()) as { error: string }).error).toContain(source.reason)

    expect(await readFile(configPath, 'utf8')).toBe(source.content)
    // nothing written beside it either: a sibling JSON rc would silently win
    expect(await readdir(dir)).toEqual([source.file])
  })
}

test('PUT /api/config writes the config back deterministically', async () => {
  const { configPath } = await fixtureDir()
  const base = await startServer({ config: configPath })

  const next = { colors: [{ name: 'label.neutral', color: '#123456' }] }
  const res = await fetch(`${base}/api/config`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(next),
  })
  expect(res.status).toBe(200)

  const written = await readFile(configPath, 'utf8')
  expect(written).toBe(serializeConfig(next))
})

test('PUT /api/config rejects a config without a colors array', async () => {
  const { configPath } = await fixtureDir()
  const base = await startServer({ config: configPath })

  const res = await fetch(`${base}/api/config`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ nope: true }),
  })
  expect(res.status).toBe(400)

  // the original file must be left untouched on a rejected write
  const written = await readFile(configPath, 'utf8')
  expect(written).toBe(serializeConfig(realConfig))
})

test('POST /api/build generates token files on disk', async () => {
  const { dirPath, configPath } = await fixtureDir()
  const outDir = path.join(dirPath, 'out')
  const base = await startServer({ config: configPath, outDir })

  const res = await fetch(`${base}/api/build`, { method: 'POST' })
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ ok: true })

  const files = await readdir(outDir)
  expect(files.length).toBeGreaterThan(0)
})

test('unknown api routes respond with 404', async () => {
  const { configPath } = await fixtureDir()
  const base = await startServer({ config: configPath })

  const res = await fetch(`${base}/api/unknown`)
  expect(res.status).toBe(404)
})
