import arg from 'arg'

// TODO TOKENS EXPORT TYPE

// export enum OutputColor {
//   ALL = 'all',
//   CSSRGB = 'css-rgb',
//   CSSHEX = 'css-hex',
//   DART = 'dart',
// }

// function outputTypeHandler (
//   value: string,
//   argName,
//   previousValue: string[] | undefined | null,
// ) {
//   if (previousValue === null) return null
//   const newValue = value.replace(/\s/g, '').split(',')

//   const isValid = newValue.filter(v => {
//     if (!Object.values(OutputColor).includes(v as OutputColor)) {
//       console.log(v, 'is not a valid output')
//       return false
//     }
//     return true
//   }).length === newValue.length
//   if (!isValid) return null
//   if (previousValue) {
//     return [...newValue, ...previousValue]
//   }
//   return newValue
// }

const args = arg({
  '--config': String,
  '--outDir': String,
  '--outTokensDir': String,
  '--dry-run': Boolean,
  '--export-tokens': Boolean,
  // '--output': outputTypeHandler,
  // alias
  '-c': '--config',
  '-od': '--outDir',
  // '-o': '--output',
  '-t': '--export-tokens',
  '-td': '--outTokensDir',
})

interface CliOptions {
  config?: string,
  outDir?: string,
  outTokensDir?: string,
  dryRun?: boolean,
  exportTokens?: boolean,
  output?: string[],
}

export function parseArgs (): CliOptions {

  // if (args['--output'] === null){
  //   console.log('invalid output type inserted, valid types are: ', Object.values(OutputColor))
  //   process.exit()
  // }

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
    output: args['--output'],
  }
}
