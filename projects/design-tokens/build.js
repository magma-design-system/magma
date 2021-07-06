const fs = require('fs')
const path = require('path')
const beautify = require('js-beautify').js

let StyleDictionary = require('./formats/js-module/js-module').extend('./config.json')
StyleDictionary = require('./formats/js-module-tailwind-config/js-module-tailwind-config').extend('./config.json')
StyleDictionary = require('./formats/css-vars/css-vars').extend('./config.json')
StyleDictionary = require('./formats/css-vars-rgb-channels/css-vars-rgb-channels').extend('./config.json')
StyleDictionary.buildAllPlatforms()

const beautifyConfig = {
  indent_size: 2,
  space_in_empty_paren: true,
}

const saveAsJs = ({ filePath, varName, destination }) => {
  fs.readFile(path.resolve(__dirname, filePath), (err, data) => {
    if (err) throw err;
    const media = JSON.parse(data)

    const jsData = `
    const ${varName} = ${JSON.stringify(media, null, 4)}
    module.exports = {
      ${varName},
    }
    `

    fs.writeFile(path.resolve(__dirname, destination), beautify(jsData, beautifyConfig), err => {
      if (err) {
        console.log(err)
      }
      console.log(`Token: ${destination} exported successfully.`);
    })
  })
}

console.log('')

saveAsJs({
  destination: 'dist/js/ease.js',
  filePath: 'css-tokens/ease.json',
  varName: 'ease',
})

saveAsJs({
  destination: 'dist/js/media.js',
  filePath: 'css-tokens/media.json',
  varName: 'media',
})

saveAsJs({
  destination: 'dist/js/font-family.js',
  filePath: 'css-tokens/font-family.json',
  varName: 'fontFamily',
})


