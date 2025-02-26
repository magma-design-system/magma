#!/usr/bin/env node
import {
  createColorTokens,
} from './lib/color.mjs'
// const chalk = await import('chalk')
import chalk from 'chalk'
import { parseArgs } from './lib/parse-args.mjs'
import { writeJsonTokens, getColorsConfig, exportColors } from './lib/utils.mjs'
// import { createColorTokens } from './lib/color.mjs'
export async function main () {
  // const { createColorTokens } = await import('./lib/color.js')
  const opts = parseArgs()

  const colorsConfig = await getColorsConfig(opts.config)
  if (colorsConfig === null) {
    console.log('Color configuration not found')
    return
  }

  const { tokens, exportGroups } = createColorTokens(colorsConfig.config.colors)

  if (opts.exportTokens) {
    if (opts.dryRun) {
      const jsonPalette = JSON.stringify(tokens, null, 2)
      console.log(jsonPalette)
    } else {
      console.log('Exporting whole color palette')
      writeJsonTokens(tokens, 'base', opts.outTokensDir)
    }
  }

  console.log('export colors')
  exportColors(tokens, 'custom', opts.outDir)

  Object.keys(exportGroups).forEach(group => {
    if (opts.exportTokens) {
      console.info(`Exporting ${chalk.yellow('color palette')} ${group}`)
      writeJsonTokens(exportGroups[group], group, opts.outTokensDir)
    }
    exportColors(exportGroups[group], group, opts.outDir)
  })
}

main()

