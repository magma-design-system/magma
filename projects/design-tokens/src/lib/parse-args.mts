import arg from 'arg'

export const OUTPUT_PLATFORM = ['css', 'dart', 'tailwind']

function outputTypeHandler (
  value: string,
  argName: string,
  previousValue: string[] | undefined | null,
) {
  if (previousValue === null) return null
  const newValue = value.replace(/\s/g, '').split(',')

  const isValid = newValue.filter(v => {
    if (!OUTPUT_PLATFORM.includes(v)) {
      console.log(v, 'is not a valid generate output')
      return false
    }
    return true
  }).length === newValue.length
  if (!isValid) return null
  if (previousValue) {
    return [...newValue, ...previousValue]
  }
  return newValue
}

const args = arg({
  '--config': String,
  '--outDir': String,
  '--outTokensDir': String,
  '--dry-run': Boolean,
  '--export-tokens': Boolean,
  '--generate': outputTypeHandler,
  // alias
  '-c': '--config',
  '-d': '--outDir',
  '-g': '--generate',
  '-t': '--export-tokens',
})

interface CliOptions {
  config?: string,
  outDir?: string,
  outTokensDir?: string,
  dryRun?: boolean,
  exportTokens?: boolean,
  generate?: string[],
}

export function parseArgs (): CliOptions {

  // the CLI has no subcommands: `ui`, which served the tokens playground, left with
  // design-tokens 16 when the playground moved into the Magma studio (projects/studio)
  if (args._.length > 0) {
    const [command] = args._
    console.error(command === 'ui'
      ? 'the ui command was removed in design-tokens 16: the playground is now the Magma studio'
      : `unknown command ${command}: magma-design-tokens takes options only`)
    process.exit(1)
  }

  if (args['--generate'] === null){
    console.log('invalid output type inserted, valid types are: ', OUTPUT_PLATFORM)
    process.exit()
  }

  if (args['--export-tokens'] && !args['--outTokensDir']) {
    console.log('Args --outTokensDir is required if flag --export-tokens is provided')
    process.exit()
  }

  return {
    config: args['--config'],
    outDir: args['--outDir'],
    dryRun: args['--dry-run'],
    exportTokens: args['--export-tokens'],
    outTokensDir: args['--outTokensDir'],
    generate: args['--generate'],
  }
}
