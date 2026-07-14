import type { LayoutName } from '../model/types.js';
import builtinLayouts, { type LayoutRenderer } from './layouts.js';

const registry = new Map<string, LayoutRenderer>(Object.entries(builtinLayouts));

/** Return the renderer for a layout, falling back to `content`. */
export function getLayout(name: LayoutName | string): LayoutRenderer {
  return registry.get(name) ?? registry.get('content')!;
}

/** Whether a layout name is registered. */
export function hasLayout(name: string): boolean {
  return registry.has(name);
}
