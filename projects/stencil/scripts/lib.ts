import chalk from 'chalk';
import { rm, stat } from 'fs/promises';
import { COMPONENTS_DIR } from './meta';
import { logDirectoryDeleted } from '../../../scripts/log';

const checkComponentExistence = async (componentName: string): Promise<boolean> => {
  return await stat(`${COMPONENTS_DIR}/${componentName}`)
    .then((statInfo) => statInfo.isDirectory())
    .catch(() => false);
};

const cleanDir = async (dir: string): Promise<void> => {
  // fs.rm con retry integrato: su Windows rmdir può dare EPERM/EBUSY transitori
  // (antivirus, indicizzazione, watcher dell'IDE o del daemon nx che tengono
  // ancora un handle aperto su dist). force:true evita errori se manca la dir.
  return await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
    .then(() => {
      logDirectoryDeleted(dir);
    })
    .catch((error) => {
      throw Error(chalk.red(error));
    });
};

export { checkComponentExistence, cleanDir };
