const fs = require('fs')
const dirTree = require('directory-tree')

function createDirectoryTree() {
  const tree = dirTree('dist/', {
    extensions: /\.(svg|png|pdf)$/
  });

  const jsonData = JSON.stringify(tree, null, 2)

  fs.writeFile('dist/directory-tree.json', jsonData, 'utf8', err => {
    if (err) {
      console.log('An error occured while writing JSON Object to File.')
      return console.log(err)
    }
    console.log('Files inventory directory-tree.json successfully created.')
  })
}

createDirectoryTree()
