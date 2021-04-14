const fs = require('fs')
const path = require('path')
const beautify = require('js-beautify').js

let StyleDictionary = require('./formats/js-module/js-module').extend('./config.json')
StyleDictionary = require('./formats/css-vars/css-vars').extend('./config.json')
StyleDictionary = require('./formats/css-vars-tailwind/css-vars-tailwind').extend('./config.json')
StyleDictionary.buildAllPlatforms()

const beautifyConfig = {
  indent_size: 2,
  space_in_empty_paren: true
}

fs.readFile(path.resolve(__dirname, 'css-tokens/media.json'), (err, data) => {
  if (err) throw err;
  let media = JSON.parse(data);

  const jsData = `
  const media = ${JSON.stringify(media, null, 4)}
  module.exports = {
    media,
  }
  `

  fs.writeFile(path.resolve(__dirname, 'dist/js/media.js'), beautify(jsData, beautifyConfig), function (err) {
    if (err) return console.log(err);
    console.log('CSS: media.js exported successfully.');
  })
});
