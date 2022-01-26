const path = require('path')

const ROOT_PATH_DIR = path.join(__dirname, '..')
const BUILD_PATH_DIR = path.join(process.cwd(), 'dist')
const BUILD_ORIGINAL_PATH_DIR = path.join(BUILD_PATH_DIR, 'original')

exports.ROOT_PATH_DIR = ROOT_PATH_DIR
exports.BUILD_PATH_DIR = BUILD_PATH_DIR
exports.BUILD_ORIGINAL_PATH_DIR = BUILD_ORIGINAL_PATH_DIR
