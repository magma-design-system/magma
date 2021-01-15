import fs from "fs";

// This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
// It will not be included in the npm package.
// source: https://stackoverflow.com/a/52177090/3687018

const ROOT_DIR = __dirname + "/..";
const DIST_DIR = ROOT_DIR + "/dist";

function main() {
    const source = fs.readFileSync(ROOT_DIR + "/package.json").toString('utf-8');
    const sourceObj = JSON.parse(source);

    // Package.json editing
    sourceObj.scripts = {};
    sourceObj.devDependencies = {};
    if (sourceObj.main.startsWith("dist/")) {
        sourceObj.main = sourceObj.main.slice(5);
    }
    sourceObj.files.map(file => file.startsWith("/dist") ? file.slice(5) : file);

    fs.writeFileSync(DIST_DIR + "/package.json", Buffer.from(JSON.stringify(sourceObj, null, 2), "utf-8") );
    // fs.writeFileSync(DIST_DIR + "/version.txt", Buffer.from(sourceObj.version, "utf-8") );

    // fs.copyFileSync(ROOT_DIR + "/.npmignore", DIST_DIR + "/.npmignore");

    fs.copyFileSync(ROOT_DIR + "/mgg-icons.json", DIST_DIR + "/mgg-icons.json");
}

main();
