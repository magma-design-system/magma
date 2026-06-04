import chalk from 'chalk';
import { stat } from 'fs/promises';
import { COMPONENTS_DIR } from './meta';
import { logDirectoryDeleted } from '../../../scripts/log';
import { remove } from 'fs-extra';

const checkComponentExistence = async (componentName: string): Promise<boolean> => {
  return await stat(`${COMPONENTS_DIR}/${componentName}`)
    .then((statInfo) => statInfo.isDirectory())
    .catch(() => false);
};

const cleanDir = async (dir: string): Promise<void> => {
  return await remove(dir)
    .catch((error) => {
      throw Error(chalk.red(error));
    })
    .then(() => {
      logDirectoryDeleted(dir);
    });
};

export { checkComponentExistence, cleanDir };
