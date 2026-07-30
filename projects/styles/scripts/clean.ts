import chalk from 'chalk';
import path from 'path';
import { BUILD_DIR, DIST_DIR } from './meta';
import { rm } from 'fs/promises';
import { mkdir } from 'fs-extra';
import { logDirectoryDeleted, logDirectoryCreated } from '../../../scripts/log';

const createDirectory = async (dir: string) => {
  mkdir(dir, { recursive: true })
    .then(() => {
      logDirectoryCreated(dir, DIST_DIR);
    })
    .catch((error) => {
      throw Error(chalk.red(error));
    });
};

// Wipe both the published dir and the generated-artifact staging dir; semantic.ts
// recreates build/ on its next run.
Promise.all([
  rm(DIST_DIR, { force: true, recursive: true }),
  rm(BUILD_DIR, { force: true, recursive: true }),
])
  .then(() => {
    logDirectoryDeleted(DIST_DIR);
    logDirectoryDeleted(BUILD_DIR);
    createDirectory(path.join(DIST_DIR, 'css'));
    createDirectory(path.join(DIST_DIR, 'tailwind'));
  })
  .catch((error) => {
    throw Error(chalk.red(error));
  });
