import chalk from 'chalk'
import { createColorTokens, type MagmaConfig } from './color.mjs'
import { writeJsonTokens, exportColors } from './utils.mjs'

export interface GenerateOptions {
  outDir?: string,
  outTokensDir?: string,
  dryRun?: boolean,
  exportTokens?: boolean,
  generate?: string[],
}

/**
 * Run the full token generation from a color configuration. Shared by the CLI
 * entry point and the `ui` command's build endpoint so both produce identical
 * output on disk.
 */
export async function runGeneration (config: MagmaConfig, opts: GenerateOptions): Promise<void> {
  const { tokens, exportGroups } = createColorTokens(config)

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
