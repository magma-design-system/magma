import { writeFile } from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import fixtures from '../.iconsauce/icons.json'

const fixturesPath = './src/fixtures/icons.json'
const iconsDictionary = []
const maxIconsSubset = 30
const iconsMax = fixtures.length
const randomInt = max => {
  return Math.floor(Math.random() * max) + 1
}

for (let i = 0; i < maxIconsSubset + 1; i ++) {
  iconsDictionary.push(fixtures[randomInt(iconsMax)])
}

const jsonDictionary = JSON.stringify(iconsDictionary.sort(), null, 4)

await writeFile(path.resolve(fixturesPath), jsonDictionary, { encoding: 'utf8' })
  .then(() => {
    console.log('')
    console.log(`Icons fixtures file ${chalk.green(fixturesPath)} successfully created`)
  })
  .catch(error => {
    throw Error(chalk.red(error))
  })
