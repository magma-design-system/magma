/*
  One adapter per template parser, from its AST to the element of ../core/element.ts:
  - HTML: the `Tag` of @html-eslint/parser;
  - JSX: the `JSXOpeningElement` of espree or typescript-eslint, for `<mds-button>` and the
    React wrappers (`<MdsButton>`);
  - Angular: the `Element` of @angular-eslint/template-parser, static attributes, property
    bindings (`[disabled]`) and attribute bindings (`[attr.disabled]`).
  The nodes are typed by what the adapters read: the parsers are optional peers of the
  consumer, not dependencies of this package.
*/
import { tagOf, type LintAttribute, type LintClass, type LintElement } from '../core/element.js';

/** A tag of a custom element: `<mds-button>` or the React wrapper `<MdsButton>`. */
const isCustom = (name: string): boolean => /^[a-z][a-z0-9]*-/.test(name) || /^Mds[A-Z]/.test(name);

const classesOf = (value: string, node: unknown): LintClass[] =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => ({ name, node }));

// --- HTML ----------------------------------------------------------------------------

interface HtmlNode {
  type: string;
  name?: string;
  /** The text of a `Text`, the value node of an `Attribute`. */
  value?: string | HtmlNode;
  key?: { value: string };
  attributes?: HtmlNode[];
  children?: HtmlNode[];
}

const htmlAttribute = (node: HtmlNode, name: string): HtmlNode | undefined =>
  node.attributes?.find((attribute) => attribute.key?.value.toLowerCase() === name);

/** The value of an attribute node, `''` when it has none. */
const htmlValue = (attribute: HtmlNode | undefined): string =>
  typeof attribute?.value === 'object' ? String(attribute.value.value ?? '') : '';

const htmlContent = (node: HtmlNode): boolean =>
  (node.children ?? []).some((child) => {
    if (child.type === 'Text') return String(child.value ?? '').trim() !== '';
    if (child.type === 'Tag') return !htmlValue(htmlAttribute(child, 'slot'));
    return child.type !== 'Comment';
  });

export const fromHtml = (node: HtmlNode): LintElement | undefined => {
  if (!node.name) return undefined;
  const attributes: LintAttribute[] = [];
  const classes: LintClass[] = [];
  for (const attribute of node.attributes ?? []) {
    const name = attribute.key?.value;
    if (!name) continue;
    const value = htmlValue(attribute);
    attributes.push({ name: name.toLowerCase(), binding: 'static', value, node: attribute });
    if (name.toLowerCase() === 'class') classes.push(...classesOf(value, attribute));
  }
  return {
    tag: node.name.toLowerCase(),
    attributes,
    classes,
    content: htmlContent(node),
    spread: false,
    node,
  };
};

// --- JSX -----------------------------------------------------------------------------

interface JsxNode {
  type: string;
  name?: JsxNode | string;
  namespace?: JsxNode;
  object?: JsxNode;
  property?: JsxNode;
  value?: JsxNode | string | number | boolean | null;
  expression?: JsxNode;
  attributes?: JsxNode[];
  children?: JsxNode[];
  openingElement?: JsxNode;
  quasis?: Array<{ value: { cooked: string | null } }>;
  expressions?: JsxNode[];
  parent?: JsxNode;
}

const jsxName = (node: JsxNode | string | undefined): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'JSXIdentifier') return node.name as string;
  if (node.type === 'JSXNamespacedName') return `${jsxName(node.namespace)}:${jsxName(node.name)}`;
  if (node.type === 'JSXMemberExpression')
    return `${jsxName(node.object)}.${jsxName(node.property)}`;
  return '';
};

/** The literal a JSX attribute value states, or undefined for an expression. */
const jsxValue = (value: JsxNode | undefined | null): LintAttribute['value'] => {
  if (value === null || value === undefined) return true;
  if (value.type === 'Literal') return value.value as LintAttribute['value'];
  if (value.type !== 'JSXExpressionContainer' || !value.expression) return undefined;
  const expression = value.expression;
  if (expression.type === 'Literal') return expression.value as LintAttribute['value'];
  if (expression.type === 'TemplateLiteral' && !expression.expressions?.length)
    return expression.quasis?.[0]?.value.cooked ?? undefined;
  return undefined;
};

/** The static text of a class value: a string, or the fixed parts of a template literal. */
const jsxClassText = (value: JsxNode | undefined | null): string => {
  if (!value) return '';
  if (value.type === 'Literal' && typeof value.value === 'string') return value.value;
  const expression = value.type === 'JSXExpressionContainer' ? value.expression : undefined;
  if (expression?.type === 'Literal' && typeof expression.value === 'string')
    return expression.value;
  if (expression?.type === 'TemplateLiteral')
    return (expression.quasis ?? []).map((quasi) => quasi.value.cooked ?? '').join(' ');
  return '';
};

const jsxContent = (element: JsxNode | undefined): boolean =>
  (element?.children ?? []).some((child) => {
    if (child.type === 'JSXText') return String(child.value ?? '').trim() !== '';
    if (child.type === 'JSXExpressionContainer')
      return child.expression?.type !== 'JSXEmptyExpression';
    if (child.type === 'JSXElement')
      return !child.openingElement?.attributes?.some(
        (attribute) => attribute.type === 'JSXAttribute' && jsxName(attribute.name) === 'slot',
      );
    return true;
  });

export const fromJsx = (node: JsxNode): LintElement | undefined => {
  const name = jsxName(node.name);
  if (!name) return undefined;
  const attributes: LintAttribute[] = [];
  const classes: LintClass[] = [];
  let spread = false;
  for (const attribute of node.attributes ?? []) {
    if (attribute.type === 'JSXSpreadAttribute') {
      spread = true;
      continue;
    }
    const key = jsxName(attribute.name);
    const value = attribute.value as JsxNode | null | undefined;
    attributes.push({ name: key, binding: 'property', value: jsxValue(value), node: attribute });
    if (key === 'className' || key === 'class')
      classes.push(...classesOf(jsxClassText(value), attribute));
  }
  return {
    tag: isCustom(name) ? tagOf(name) : name,
    attributes,
    classes,
    content: jsxContent(node.parent),
    spread,
    node,
  };
};

// --- Angular -------------------------------------------------------------------------

interface AngularNode {
  type: string;
  name?: string;
  value?: string | { ast?: { type: string; value?: unknown } };
  attributes?: AngularNode[];
  inputs?: AngularNode[];
  children?: AngularNode[];
  /** The binding type the template parser keeps: 0 property, 1 attribute, 2 class, 3 style, 5 two-way. */
  __originalType?: number;
}

const angularContent = (node: AngularNode): boolean =>
  (node.children ?? []).some((child) => {
    if (child.type === 'Text') return String(child.value ?? '').trim() !== '';
    if (child.type === 'Comment') return false;
    if (child.type === 'Element')
      return !child.attributes?.some((attribute) => attribute.name === 'slot');
    return true;
  });

/** The literal a bound expression states (`[disabled]="false"`), or undefined. */
const angularValue = (input: AngularNode): LintAttribute['value'] => {
  const ast = typeof input.value === 'object' ? input.value.ast : undefined;
  return ast?.type === 'LiteralPrimitive' ? (ast.value as LintAttribute['value']) : undefined;
};

export const fromAngular = (node: AngularNode): LintElement | undefined => {
  if (!node.name) return undefined;
  const attributes: LintAttribute[] = [];
  const classes: LintClass[] = [];
  for (const attribute of node.attributes ?? []) {
    if (!attribute.name) continue;
    const value = typeof attribute.value === 'string' ? attribute.value : '';
    attributes.push({ name: attribute.name, binding: 'static', value, node: attribute });
    if (attribute.name === 'class') classes.push(...classesOf(value, attribute));
  }
  for (const input of node.inputs ?? []) {
    if (!input.name) continue;
    const kind = input.__originalType;
    // [class.x] and [style.x] bind a class or a style, not the prop of the same name
    if (kind === 2 || kind === 3) continue;
    attributes.push({
      name: input.name,
      binding: kind === 1 ? 'attribute' : 'property',
      value: angularValue(input),
      node: input,
    });
  }
  return {
    tag: node.name,
    attributes,
    classes,
    content: angularContent(node),
    spread: false,
    node,
  };
};
