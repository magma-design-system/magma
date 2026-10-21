// the automatic JSX runtime falls back to createElement, imported from the root of its source,
// for an element with a `key` after a spread: React's, through withoutFalse
import { createElement as reactCreateElement } from 'react';

import { withoutFalse } from './props.mjs';

export const createElement = (type, props, ...children) =>
  reactCreateElement(type, withoutFalse(type, props), ...children);
