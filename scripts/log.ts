import chalk from 'chalk'
import path from 'path'
import { PathLike } from 'fs'

const capitalize = (s: string) => s.replace(/./, c => c.toUpperCase())

const logDirectoryCopied = (directory: PathLike, destination: PathLike) => {
  console.log(`Directory ${chalk.yellow(path.basename(directory.toString()))} successfully ${chalk.blue('copied')} in ${chalk.yellow(path.basename(destination.toString()))}`)
}

const logDirectoryDeleted = (directory: PathLike) => {
  console.log(`Directory ${chalk.yellow(path.basename(directory.toString()))} successfully ${chalk.red('deleted')} ${chalk.gray('(or skipped if missing)')}`)
}

interface FileActionDoneOptions {
  entity: string
  source: PathLike
  action: string
  destination?: PathLike
}

const logFileActionDone = (args: FileActionDoneOptions) => {
  console.log(`${capitalize(args.entity)} ${chalk.yellow(path.basename(args.source.toString()))} successfully ${chalk.blue(args.action)} ${args.destination ? `as ${chalk.yellow(path.basename(args.destination.toString()))}` : ''}`)
}

export {
  logDirectoryDeleted,
  logDirectoryCopied,
  logFileActionDone,
}
