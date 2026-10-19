// the automatic JSX runtime of the stories (main.mjs): React's, through withoutFalse
import { Fragment, jsx as reactJsx, jsxs as reactJsxs } from 'react/jsx-runtime';

import { withoutFalse } from './props.mjs';

export const jsx = (type, props, key) => reactJsx(type, withoutFalse(type, props), key);
export const jsxs = (type, props, key) => reactJsxs(type, withoutFalse(type, props), key);
export { Fragment };
