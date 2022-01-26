#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const { ICON_GROUPS } = require('../lib/icons-groups')
const { BUILD_PATH_DIR } = require('../lib/utils')

main(process.argv.slice(2))

/**
 * Main function
 * @param parameters {string[]} Input parameters
 * @return {void}
 */
function main (parameters) {
  console.log(parameters)
  const promises = Object.entries(ICON_GROUPS).map(iconGroupList)
  Promise.all(promises)
    .then(generateIcons)
    .then(generateInputFileFromIcons)
    .then(() => console.log('Done! File created in', BUILD_PATH_DIR))
}

/**
 *
 * @param iconGroupLists
 * @return {{ group: , list: }[]}
 */
function generateIcons (iconGroupLists) {
  return iconGroupLists
    .map(({ group, list }) => {
      const { getIconName } = ICON_GROUPS[group]
      return list.map(path => `${group ? group + '/' : ''}${getIconName(path)}`)
    })
    .flat()
}

/**
 *
 * @param groupName
 * @param group
 * @return {Promise<{list: string, group: }>}
 */
function iconGroupList ([groupName, group]) {
  switch (groupName) {
  case 'maggioli':
  case 'material':
    return group.listPath().then(list => ({ group: groupName, list }))
    // case 'localDirectory':
    // return group.listPath().then(list => ({ group: groupName, list }))
  default:
    throw new Error(`Group ${groupName} not found in icons-group.js`)
  }
}

function generateInputFileFromIcons (icons) {
  const inputObject = icons.reduce((acc, icon) => {
    acc[icon.replace('/', '-')] = icon
    return acc
  }, {})
  return fs.writeFile(path.join(BUILD_PATH_DIR, 'input.json'), JSON.stringify(inputObject))
}
