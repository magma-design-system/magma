import { createRequire } from 'node:module';

import mi from '@iconsauce/material-icons';
import mdi from '@iconsauce/mdi-svg';
import mgg from '@iconsauce/mgg-icons';

const require = createRequire(import.meta.url);

export default {
  content: [
    './src/components/**/*.{js,json,ts,tsx}',
    './src/type/**/*.ts',
    require.resolve('@maggioli-design-system/svg-icons/dist/iconsauce.json'),
  ],
  plugin: [mi, mdi, mgg],
};
