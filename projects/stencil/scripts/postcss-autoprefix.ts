import autoprefixer from 'autoprefixer';
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import { PROJECT_DIR } from './meta';

const BROWSERSLISTRC = path.resolve(PROJECT_DIR, '../../.browserslistrc');

/** The shape of a Stencil style plugin: see postcss-token-fallbacks.ts. */
interface StencilStylePlugin {
  name: string;
  pluginType: 'css';
  transform: (sourceText: string, id: string) => Promise<{ code: string } | null>;
}

/**
 * The browsers Magma supports: the queries of the root `.browserslistrc`, one per line, with
 * the comments left out.
 */
export const readSupportedBrowsers = (file: string = BROWSERSLISTRC): string[] =>
  fs
    .readFileSync(file, 'utf-8')
    .split('\n')
    .map((line) => line.replace(/#.*/, '').trim())
    .filter((line) => line !== '');

/**
 * Prefixes the component CSS for the browsers Magma supports.
 *
 * Stencil's own pass (`autoprefixCss`, on by default with `buildEs5`) prefixes for a list of its
 * own, iOS 9 and IE 11 among them, and takes only a boolean: an options object is dropped for
 * the default. Its prefixes are read by no supported browser, and a page pre-rendered with
 * declarative shadow DOM repeats them in the stylesheet of every component (#831). With
 * `autoprefixCss: false`, this plugin runs after Tailwind instead. The prefixes written in the
 * sources stay (`remove: false`), as in Stencil's pass: line-clamp needs them.
 */
export default function autoprefixPlugin(
  browsers: string[] = readSupportedBrowsers(),
): StencilStylePlugin {
  const processor = postcss([autoprefixer({ overrideBrowserslist: browsers, remove: false })]);

  return {
    name: 'autoprefixer',
    pluginType: 'css',
    async transform(sourceText: string, id: string) {
      if (!sourceText) {
        return null;
      }
      const result = await processor.process(sourceText, { from: id });
      return { code: result.css };
    },
  };
}
