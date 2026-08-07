import chalk from 'chalk';
import path from 'path';
import { BUILD_DIR, DIST_DIR, PROJECT_DIR } from './meta';
import { appendFile, readFile, writeFile } from 'fs/promises';
import { copy } from 'fs-extra';
import { logDirectoryCopied, logFileActionDone } from '../../../scripts/log';

const copyDirectory = async (src: string, dest: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    copy(path.join(src), dest)
      .then(() => {
        logDirectoryCopied(src, dest);
        resolve();
      })
      .catch((error) => {
        reject();
        throw Error(chalk.red(error));
      });
  });
};

// Ship a generated artifact staged under build/ to its published location,
// keeping the same basename so dist/ layout is unchanged.
const copyStaged = async (relFromBuild: string, dest: string): Promise<void> => {
  const src = path.join(BUILD_DIR, relFromBuild);
  await copy(src, dest);
  logDirectoryCopied(src, dest);
};

const main = async () => {
  await copyDirectory(path.join(PROJECT_DIR, 'tailwind'), path.join(DIST_DIR, 'tailwind'));
  await copyDirectory(path.join(PROJECT_DIR, 'tailwind3'), path.join(DIST_DIR, 'tailwind3'));
  await copyDirectory(path.join(PROJECT_DIR, 'css'), path.join(DIST_DIR, 'css'));
  await copyDirectory(
    path.join(PROJECT_DIR, '../design-tokens/dist/css'),
    path.join(DIST_DIR, 'css'),
  );

  // The generated semantic artifacts live under build/ (out of the source dirs);
  // ship them alongside the tracked CSS so dist/ keeps its published layout.
  await copyStaged(path.join('css', 'semantic.css'), path.join(DIST_DIR, 'css', 'semantic.css'));
  await copyStaged(path.join('css', 'themes.css'), path.join(DIST_DIR, 'css', 'themes.css'));
  await copyStaged(
    path.join('tailwind', 'semantic.css'),
    path.join(DIST_DIR, 'tailwind', 'semantic.css'),
  );

  // The component custom-property registrations are appended to globals.css rather
  // than shipped as a separate file: consumers already import globals.css, and a
  // registration only takes effect when the document loads it. Appending is safe
  // because globals.css holds no @import (those must precede every other rule).
  const propertiesCss = await readFile(path.join(BUILD_DIR, 'css', 'properties.css'), 'utf8');
  const distGlobals = path.join(DIST_DIR, 'css', 'globals.css');
  await appendFile(distGlobals, `\n${propertiesCss}`, 'utf8');
  logFileActionDone({
    entity: 'file',
    source: 'properties.css',
    actionDone: 'appended',
    destination: distGlobals,
  });

  // tailwind/theme.css imports the bridge from the staging dir in source; in the
  // published package the bridge sits next to it, so realign the import to the
  // sibling in the emitted copy. Keeps dist/tailwind/theme.css self-contained.
  const distTheme = path.join(DIST_DIR, 'tailwind', 'theme.css');
  const themeCss = await readFile(distTheme, 'utf8');
  await writeFile(distTheme, themeCss.replace('../build/tailwind/semantic.css', './semantic.css'));
};

main();
