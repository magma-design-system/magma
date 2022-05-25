import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import { ICON_GROUPS } from './icons-groups'
import { DIST_DIR } from './meta'

const main = (parameters: string[]): void => {
  console.log(parameters)
  const promises = Object.entries(ICON_GROUPS).map(iconGroupList)
  Promise.all(promises)
    .then(generateIcons)
    .then(generateInputFileFromIcons)
    .then(() => {
      console.log(`File created ${chalk.green('successfully')} in ${chalk.green(path.basename(DIST_DIR))}`)
    })
}

main(process.argv.slice(2))

/**
 *
 * @param iconGroupLists
 * @return {{ group:, list: }[]}
 */
const generateIcons = iconGroupLists => {
  return iconGroupLists
    .map(({ group, list }) => {
      const { getIconName } = ICON_GROUPS[group]
      return list.map((path: string) => `${group ? group + '/' : ''}${getIconName(path)}`)
    })
    .flat()
}

/**
 *
 * @param groupName
 * @param group
 * @return {Promise<{list: string, group: }>}
 */
const iconGroupList = ([groupName, group]): Promise<{list: string, group: any }> => {
  switch (groupName) {
  case 'maggioli':
  case 'material':
    return group.listPath().then(list => ({ group: groupName, list }))
  default:
    throw new Error(`Group ${chalk.red(groupName)} not found in icons-groups.ts`)
  }
}

function generateInputFileFromIcons (icons) {
  const inputObject = icons.reduce((acc, icon) => {
    acc[icon.replace('/', '-')] = icon
    return acc
  }, {})
  return fs.writeFile(path.join(DIST_DIR, 'input.json'), JSON.stringify(inputObject))
}
