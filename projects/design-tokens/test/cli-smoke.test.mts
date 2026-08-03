import { execSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Builds the CLI and runs the produced dist/src/cli.mjs end to end.
// Guards against unresolvable imports shipping in the published package
// (e.g. tsconfig path aliases that tsc does not rewrite, see issue #544).
test('the built cli generates a palette end to end', () => {
  execSync('npm run build-cli && npm run postbuild', {
    cwd: projectRoot,
    stdio: 'pipe',
  })

  const outDir = mkdtempSync(join(tmpdir(), 'magma-cli-smoke-'))
  const configPath = join(outDir, 'config.json')
  writeFileSync(
    configPath,
    JSON.stringify({
      colors: [{ color: '#23B2E1', name: 'status.info', export: ['smoke'] }],
    }),
  )

  execSync(
    `node dist/src/cli.mjs --config ${configPath} --outDir ${outDir} --generate css`,
    { cwd: projectRoot, stdio: 'pipe' },
  )

  const css = readFileSync(join(outDir, 'css', 'colors-hex-smoke.css'), 'utf8')
  expect(css).toContain('--hex-status-info-01')
}, 120_000)
