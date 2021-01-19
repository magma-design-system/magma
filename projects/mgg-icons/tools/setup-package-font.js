import fs from "fs";

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// __dirname with "type: module" or .mjs file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
// It will not be included in the npm package.
// source: https://stackoverflow.com/a/52177090/3687018

const ROOT_DIR = __dirname + "/..";
const DIST_DIR = ROOT_DIR + "/dist";

function main() {
    const source = fs.readFileSync(join(ROOT_DIR, "/package.json")).toString('utf-8');
    const sourceObj = JSON.parse(source);

    // Package.json editing
    sourceObj.scripts = {};
    sourceObj.devDependencies = {};
    if (sourceObj.main.startsWith('dist/')) {
        sourceObj.main = sourceObj.main.slice(5);
    }
    sourceObj.files = sourceObj.files.map(file => file.startsWith('/dist') ? file.slice(5) : file);

    // Output
    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR);
    }

    fs.writeFileSync(join(DIST_DIR, '/package.json'), Buffer.from(JSON.stringify(sourceObj, null, 2)) );
    // fs.writeFileSync(join(DIST_DIR, '/version.txt'), Buffer.from(sourceObj.version));
    fs.copyFileSync(join(ROOT_DIR, '.npmrc'), join(DIST_DIR, '.npmrc') );

    // fs.copyFileSync(join(ROOT_DIR, '/.npmignore'), join(DIST_DIR, '/.npmignore'));

    const resourcesDir = join(DIST_DIR, 'resources')
    if (!fs.existsSync(resourcesDir)) {
      fs.mkdirSync(resourcesDir);
    }
    fs.copyFileSync(join(ROOT_DIR, 'resources', 'mgg-icons.json'), join(resourcesDir, 'mgg-icons.json'));
}

main();
