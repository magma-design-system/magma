import chalk from 'chalk'
import path from 'path'
import { PathLike } from 'fs'

const capitalize = (s: string) => s.replace(/./, c => c.toUpperCase())

const dontUseWithNX = (exit = false): void => {
  if (process.env.NX_CLI_SET) {
    console.info(' ')
    console.info(`${chalk.bold(chalk.bgRed(' DO NOT USE this with NX '))}`)
    console.info('Prompt messages are not shown for NX limitation')
    console.info('For infos: https://github.com/nrwl/nx/issues/15924')
    console.info(`Use it with ${chalk.bold('npm')} or ${chalk.bold('yarn')} instead`)
    console.info(' ')
    if (exit) {
      process.exit(0)
    }
  }
}

const logDirectoryCopied = (directory: PathLike, destination: PathLike) => {
  console.info(`Directory ${chalk.yellow(path.basename(directory.toString()))} successfully ${chalk.blue('copied')} in ${chalk.yellow(path.basename(destination.toString()))}`)
}

const logDirectoryCreated = (directory: PathLike, destination?: PathLike) => {
  console.info(`Directory ${chalk.yellow(path.basename(directory.toString()))} successfully ${chalk.green('created')} ${destination ? 'in ' + chalk.yellow(path.basename(destination.toString())) : ''}`)
}

const logDirectoryDeleted = (directory: PathLike) => {
  console.info(`Directory ${chalk.yellow(path.basename(directory.toString()))} successfully ${chalk.red('deleted')} ${chalk.gray('(or skipped if missing)')}`)
}

const logFileSavedTo = async (file: PathLike, destination?: PathLike) => {
  const cleanFile = path.basename(file.toString().trim())
  if (destination) {
    const cleanDestination = path.basename(path.dirname(destination.toString().trim()))
    console.info(`File ${chalk.yellow(cleanFile)} successfully ${chalk.green('saved')} in ${chalk.yellow(cleanDestination)}`)
  } else {
    console.info(`File ${chalk.yellow(cleanFile)} successfully ${chalk.green('saved')}`)
  }
}

interface FileActionDoneOptions {
  entity: string // inventory
  source?: PathLike
  actionDone: string // created, copied, deleted, saved
  destination?: PathLike
}

const logFileActionDone = (args: FileActionDoneOptions) => {
  console.info(`${capitalize(args.entity.trim())}${args.source ? ' ' + chalk.yellow(path.basename(args.source.toString().trim())) : ''} successfully ${chalk.blue(args.actionDone.trim())} ${args.destination ? `as ${chalk.yellow(path.basename(args.destination.toString().trim()))}` : ''}`)
}

interface StatusOptions {
  actionDoing: string // checking
  subject?: string // A
  status?: string // matches
  match?: string // B
}

const logStatus = (args: StatusOptions) => {
  console.info(`${capitalize(args.actionDoing)} in ${args.subject ? chalk.yellow(args.subject) : ''} ${args.status ? args.status : ''} ${args.match ? chalk.yellow(args.match) : ''}`)
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
