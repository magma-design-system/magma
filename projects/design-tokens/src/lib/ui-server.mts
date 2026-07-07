import http from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import chalk from 'chalk'
import { lilconfig } from 'lilconfig'
import type { MagmaConfig } from './color.mjs'
import { runGeneration, type GenerateOptions } from './generate.mjs'

export interface UiServerOptions extends GenerateOptions {
  port?: number,
  config?: string,
}

const DEFAULT_PORT = 5178

// the built playground ships beside the compiled CLI: dist/src/lib/ui-server.mjs
// resolves to dist/playground/
const PLAYGROUND_DIR = fileURLToPath(new URL('../../playground/', import.meta.url))

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
}

interface LoadedConfig {
  config: MagmaConfig,
  filepath: string,
}

async function loadConfig (configPath?: string): Promise<LoadedConfig | null> {
  const explorer = lilconfig('magma-design-tokens')
  const result = configPath ? await explorer.load(configPath) : await explorer.search()
  return (result as LoadedConfig | null) ?? null
}

// where a save lands: the discovered file if any, otherwise an explicit
// --config path, otherwise the conventional rc file in the current directory
function resolveWritePath (found: LoadedConfig | null, configPath?: string): string {
  if (found?.filepath) return found.filepath
  if (configPath) return path.resolve(configPath)
  return path.resolve(process.cwd(), '.magma-design-tokensrc.json')
}

// deterministic, ASCII-only, trailing-newline serialization for clean git diffs
export function serializeConfig (config: unknown): string {
  const json = JSON.stringify(config, null, 2) + '\n'
  return json.replace(/[\u0080-\uffff]/g, (ch) =>
    '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'),
  )
}

function sendJson (res: http.ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  })
  res.end(payload)
}

function readBody (req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk as Buffer))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

async function serveStatic (res: http.ServerResponse, pathname: string): Promise<void> {
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  const filePath = path.join(PLAYGROUND_DIR, relative)

  // path traversal guard: never serve outside the playground directory
  if (!filePath.startsWith(PLAYGROUND_DIR)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  // single-page app: unknown routes fall back to index.html
  const target = existsSync(filePath) ? filePath : path.join(PLAYGROUND_DIR, 'index.html')
  if (!existsSync(target)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Playground bundle not found. Run the package build first.')
    return
  }

  const body = await readFile(target)
  res.writeHead(200, { 'content-type': MIME_TYPES[path.extname(target)] ?? 'application/octet-stream' })
  res.end(body)
}

async function handleApi (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  opts: UiServerOptions,
): Promise<void> {
  if (pathname === '/api/config' && req.method === 'GET') {
    const found = await loadConfig(opts.config)
    sendJson(res, 200, {
      // the resolved save target; null config means no file was found yet and
      // the playground should start from its bundled default
      path: resolveWritePath(found, opts.config),
      config: found?.config ?? null,
    })
    return
  }

  if (pathname === '/api/config' && req.method === 'PUT') {
    let config: unknown
    try {
      config = JSON.parse(await readBody(req))
    } catch {
      sendJson(res, 400, { error: 'Request body is not valid JSON' })
      return
    }
    if (config === null || typeof config !== 'object' || !Array.isArray((config as MagmaConfig).colors)) {
      sendJson(res, 400, { error: 'Config must be an object with a "colors" array' })
      return
    }
    const found = await loadConfig(opts.config)
    const target = resolveWritePath(found, opts.config)
    await writeFile(target, serializeConfig(config), 'utf8')
    console.info(`${chalk.green('saved')} config to ${target}`)
    sendJson(res, 200, { path: target })
    return
  }

  if (pathname === '/api/build' && req.method === 'POST') {
    const found = await loadConfig(opts.config)
    if (found === null) {
      sendJson(res, 400, { error: 'No configuration found to build. Save one first.' })
      return
    }
    try {
      await runGeneration(found.config, opts)
      sendJson(res, 200, { ok: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(chalk.red(`build failed: ${message}`))
      sendJson(res, 500, { error: message })
    }
    return
  }

  sendJson(res, 404, { error: 'Not found' })
}

export function startUiServer (opts: UiServerOptions = {}): Promise<http.Server> {
  const port = opts.port ?? DEFAULT_PORT

  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
    const work = pathname.startsWith('/api/')
      ? handleApi(req, res, pathname, opts)
      : serveStatic(res, pathname)
    work.catch((error) => {
      const message = error instanceof Error ? error.message : String(error)
      if (!res.headersSent) sendJson(res, 500, { error: message })
      else res.end()
    })
  })

  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, () => {
      server.off('error', reject)
      const address = server.address()
      const shownPort = typeof address === 'object' && address ? address.port : port
      console.info(
        `magma design tokens playground running at ${chalk.cyan(`http://localhost:${shownPort}`)}`,
      )
      resolve(server)
    })
  })
}
