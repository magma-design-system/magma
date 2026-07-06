#!/usr/bin/env node
import { createColorTokens } from './lib/color.mjs'
import chalk from 'chalk'
import { parseArgs } from './lib/parse-args.mjs'
import { writeJsonTokens, getColorsConfig, exportColors } from './lib/utils.mjs'
export async function main () {
  const opts = parseArgs()

  const colorsConfig = await getColorsConfig(opts.config)
  if (colorsConfig === null) {
    console.log('Color configuration not found')
    return
  }

  const { tokens, exportGroups } = createColorTokens(colorsConfig.config)

  if (opts.exportTokens) {
    if (opts.dryRun) {
      const jsonPalette = JSON.stringify(tokens, null, 2)
      console.log(jsonPalette)
    } else {
      console.log('Exporting whole color palette')
      await writeJsonTokens(tokens, 'base', opts.outTokensDir!)
    }
  }

  // export all colors in one file
  console.log('export colors')
  exportColors(tokens, 'custom', opts.outDir, opts.generate)

  // export colors separated by export config. Iterate with await (not a
  // fire-and-forget forEach) so writes complete before the process exits,
  // errors surface, and the export sequence is deterministic run to run
  for (const group of Object.keys(exportGroups)) {
    if (opts.exportTokens) {
      console.info(`Exporting ${chalk.yellow('color palette')} ${group}`)
      await writeJsonTokens(exportGroups[group], group, opts.outTokensDir)
    }
    exportColors(exportGroups[group], group, opts.outDir, opts.generate)
  }
}

main()

