/*
  The colour literals of a CSS value: what magma/no-raw-color reports, kept apart from the
  Stylelint plugin so the core does not need Stylelint.
*/
import valueParser, { type Node } from 'postcss-value-parser';

/** The functions that write a colour from numbers. */
const COLOR_FUNCTIONS = new Set([
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'hwb',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'color',
]);
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** The colour literals of a value: hex words and colour functions that name no token. */
export const colorLiterals = (value: string): string[] => {
  const found: string[] = [];
  const hasVar = (nodes: Node[]): boolean =>
    nodes.some(
      (node) =>
        node.type === 'function' && (node.value.toLowerCase() === 'var' || hasVar(node.nodes)),
    );
  valueParser(value).walk((node) => {
    if (node.type === 'function') {
      const name = node.value.toLowerCase();
      if (name === 'url' || name === 'var') return false;
      if (COLOR_FUNCTIONS.has(name)) {
        if (!hasVar(node.nodes)) found.push(valueParser.stringify(node));
        return false;
      }
    }
    if (node.type === 'word' && HEX.test(node.value)) found.push(node.value);
    return undefined;
  });
  return found;
};
