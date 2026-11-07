/*
  The API of the installed magma the studio reads at build time: the colour axes of each component,
  its `variant` and its `tone`, from the documentation.json of that magma ("documentation.json
  (magma)" in docs/CONTRACTS.md), read as the lint and the MCP server read it (`readData`). The
  previews of a colour use them to find what the colour paints (src/paints.ts) and the tones and
  states to show it in (src/states.ts).

  They reach the pages as a virtual module, `virtual:magma-api`, with these two props alone: the
  documentation is some megabytes, the props of every component a few. A magma with no
  documentation.json gives no component, and the previews say that nothing is known of it.
*/
import type { Plugin } from 'vite';
import { readData } from '@maggioli-design-system/magma/lint';

/** A prop of a component, as the previews need it: the values it takes and its default. */
export interface AxisProp {
  values: string[];
  fallback?: string;
}

/** The colour axes of a component: the props that are missing it does not have. */
export interface ComponentAxes {
  tag: string;
  variant?: AxisProp;
  tone?: AxisProp;
}

interface DocsProp {
  name: string;
  values?: Array<{ value?: string; type: string }>;
  default?: string;
}

/** The props the previews read. */
const AXES = ['variant', 'tone'] as const;

/** A default as the documentation writes it, a literal of TypeScript (`'primary'`), as a value. */
const valueOf = (literal: string | undefined): string | undefined =>
  literal?.match(/^'([^']*)'$/)?.[1];

/** The variant and the tone of each component that has one of them, by tag. */
export function componentAxes(documentation: {
  components: Array<{ tag: string; props: DocsProp[] }>;
}): ComponentAxes[] {
  return documentation.components.flatMap(({ tag, props }) => {
    const axes: ComponentAxes = { tag };
    for (const name of AXES) {
      const prop = props.find((one) => one.name === name);
      if (!prop) continue;
      axes[name] = {
        values: (prop.values ?? [])
          .filter((one) => one.type === 'string' && one.value)
          .map((one) => one.value!),
        fallback: valueOf(prop.default),
      };
    }
    return axes.variant || axes.tone ? [axes] : [];
  });
}

export const MAGMA_API = 'virtual:magma-api';
const RESOLVED = `\0${MAGMA_API}`;

export function magmaApi(): Plugin {
  return {
    name: 'magma-api',
    resolveId: (id) => (id === MAGMA_API ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null;
      let components: ComponentAxes[] = [];
      try {
        components = componentAxes(readData('documentation'));
      } catch {
        this.warn('no documentation.json in the installed magma: the previews know no component');
      }
      return `export default ${JSON.stringify(components)};`;
    },
  };
}
