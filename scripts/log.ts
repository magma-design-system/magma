import chalk from 'chalk'
import path from 'path'
import { PathLike } from 'fs'

const capitalize = (s: string) => s.replace(/./, c => c.toUpperCase())

const dontUseWithNX = (exit?: number): void => {
  if (process.env.NX_CLI_SET) {
    console.log(' ')
    console.log(`${chalk.bold(chalk.bgRed(' DO NOT USE this with NX '))}`)
    console.log('Prompt messages are not shown for some reason')
    console.log(`Use it with ${chalk.bold('npm')} or ${chalk.bold('yarn')} instead`)
    console.log(' ')
    process.exit(exit ?? 1)
  }
}

const logDirectoryCopied = (directory: PathLike, destination: PathLike) => {
  console.log(`Directory ${chalk.yellow(path.basename(directory.toString()))} successfully ${chalk.blue('copied')} in ${chalk.yellow(path.basename(destination.toString()))}`)
}

const logDirectoryCreated = (directory: PathLike, destination?: PathLike) => {
  console.log(`Directory ${chalk.yellow(path.basename(directory.toString()))} successfully ${chalk.green('created')} ${destination ? 'in ' + chalk.yellow(path.basename(destination.toString())) : ''}`)
}

const logDirectoryDeleted = (directory: PathLike) => {
  console.log(`Directory ${chalk.yellow(path.basename(directory.toString()))} successfully ${chalk.red('deleted')} ${chalk.gray('(or skipped if missing)')}`)
}

const logFileSavedTo = async (file: PathLike, destination?: PathLike) => {
  const cleanFile = path.basename(file.toString().trim())
  if (destination) {
    const cleanDestination = path.basename(path.dirname(destination.toString().trim()))
    console.log(`File ${chalk.yellow(cleanFile)} successfully ${chalk.green('saved')} in ${chalk.yellow(cleanDestination)}`)
  } else {
    console.log(`File ${chalk.yellow(cleanFile)} successfully ${chalk.green('saved')}`)
  }
}

interface FileActionDoneOptions {
  entity: string // inventory
  source?: PathLike
  actionDone: string // created, copied, deleted, saved
  destination?: PathLike
}

const logFileActionDone = (args: FileActionDoneOptions) => {
  console.log(`${capitalize(args.entity.trim())}${args.source ? ' ' + chalk.yellow(path.basename(args.source.toString().trim())) : ''} successfully ${chalk.blue(args.actionDone.trim())} ${args.destination ? `as ${chalk.yellow(path.basename(args.destination.toString().trim()))}` : ''}`)
}

interface StatusOptions {
  actionDoing: string // checking
  subject?: string // A
  status?: string // matches
  match?: string // B
}

const logStatus = (args: StatusOptions) => {
  console.log(`${capitalize(args.actionDoing)} in ${args.subject ? chalk.yellow(args.subject) : ''} ${args.status ? args.status : ''} ${args.match ? chalk.yellow(args.match) : ''}`)
}

export {
  logDirectoryCopied,
  logDirectoryCreated,
  logDirectoryDeleted,
  logFileActionDone,
  logStatus,
  logFileSavedTo,
  dontUseWithNX,
}
