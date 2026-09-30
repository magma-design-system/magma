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
  '--port': Number,
  // alias
  '-c': '--config',
  '-d': '--outDir',
  '-g': '--generate',
  '-t': '--export-tokens',
  '-p': '--port',
})

interface CliOptions {
  command?: string,
  config?: string,
  outDir?: string,
  outTokensDir?: string,
  dryRun?: boolean,
  exportTokens?: boolean,
  generate?: string[],
  port?: number,
}

export function parseArgs (): CliOptions {

  if (args['--generate'] === null){
    console.log('invalid output type inserted, valid types are: ', OUTPUT_PLATFORM)
    process.exit()
  }

  if (args['--export-tokens'] && !args['--outTokensDir']) {
    console.log('Args --outTokensDir is required if flag --export-tokens is provided')
    process.exit()
  }

  return {
    // the first positional selects a subcommand (e.g. `ui`); its absence keeps
    // the default token-generation behaviour
    command: args._[0],
    config: args['--config'],
    outDir: args['--outDir'],
    dryRun: args['--dry-run'],
    exportTokens: args['--export-tokens'],
    outTokensDir: args['--outTokensDir'],
    generate: args['--generate'],
    port: args['--port'],
  }
}
