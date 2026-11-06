#!/usr/bin/env node
import { parseArgs } from './lib/parse-args.mjs'
import { getColorsConfig } from './lib/utils.mjs'
import { runGeneration } from './lib/generate.mjs'

export async function main () {
  const opts = parseArgs()

  const colorsConfig = await getColorsConfig(opts.config)
  if (colorsConfig === null) {
    console.log('Color configuration not found')
    return
  }

  await runGeneration(colorsConfig.config, opts)
}

main()
