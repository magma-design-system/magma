// the development JSX runtime of the stories (main.mjs): React's, through withoutFalse
import { Fragment, jsxDEV as reactJsxDEV } from 'react/jsx-dev-runtime';

import { withoutFalse } from './props.mjs';

export const jsxDEV = (type, props, key, isStaticChildren, source, self) =>
  reactJsxDEV(type, withoutFalse(type, props), key, isStaticChildren, source, self);
export { Fragment };
