#!/usr/bin/env node
import {
  createColorTokens,
} from './lib/color'
import chalk from 'chalk'
import { parseArgs } from './lib/parse-args'
import { writeJsonTokens, getColorsConfig, exportColors } from './lib/utils'

export async function main () {
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

if (require.main === module) {
  main()
}
