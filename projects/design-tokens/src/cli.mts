#!/usr/bin/env node
import { parseArgs } from './lib/parse-args.mjs'
import { getColorsConfig } from './lib/utils.mjs'
import { runGeneration } from './lib/generate.mjs'
import { startUiServer } from './lib/ui-server.mjs'

export async function main () {
  const opts = parseArgs()

  if (opts.command === 'ui') {
    await startUiServer({
      port: opts.port,
      config: opts.config,
      outDir: opts.outDir,
      outTokensDir: opts.outTokensDir,
      exportTokens: opts.exportTokens,
      generate: opts.generate,
    })
    return
  }

  const colorsConfig = await getColorsConfig(opts.config)
  if (colorsConfig === null) {
    console.log('Color configuration not found')
    return
  }

  await runGeneration(colorsConfig.config, opts)
}

main()
