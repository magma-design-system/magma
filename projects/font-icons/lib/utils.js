const path = require('path')

const ROOT_PATH_DIR = path.join(__dirname, '..')
const BUILD_PATH_DIR = path.join(process.cwd(), 'build')

exports.ROOT_PATH_DIR = ROOT_PATH_DIR
exports.BUILD_PATH_DIR = BUILD_PATH_DIR
