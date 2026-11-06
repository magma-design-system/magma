import { describeElement, type ElementContext, surfaceHint } from './context-hint.js';

const el = (over: Partial<ElementContext>): ElementContext => ({
  tag: 'div',
  ancestors: [],
  classes: [],
  ...over,
});

describe('surfaceHint', () => {
  it.each<[string, Partial<ElementContext>, string, string]>([
    ['the page', { tag: 'body' }, 'default', 'on `<body>`'],
    ['a code block', { tag: 'code' }, 'sunken', 'on `<code>`'],
    ['a dialog role', { role: 'dialog' }, 'overlay', '`role="dialog"`'],
    ['a modal component', { tag: 'MdsModal' }, 'overlay', 'on `<MdsModal>`'],
    ['a kebab-case popover', { tag: 'mds-popover' }, 'overlay', 'on `<mds-popover>`'],
    ['a card component', { tag: 'Card' }, 'raised', 'on `<Card>`'],
    [
      'a floating shadow',
      { classes: ['absolute', 'shadow-lg'] },
      'overlay',
      '`absolute` with `shadow-lg`',
    ],
    ['a sticky header', { classes: ['sticky', 'top-0'] }, 'raised', '`sticky`'],
    [
      'inside a modal',
      { ancestors: [{ tag: 'div' }, { tag: 'MdsModal' }] },
      'overlay',
      'inside `<MdsModal>`',
    ],
    [
      'inside a menu role',
      { ancestors: [{ tag: 'ul', role: 'menu' }] },
      'overlay',
      'inside `role="menu"`',
    ],
    ['a shadow', { classes: ['rounded', 'hover:shadow-xs'] }, 'raised', 'with `hover:shadow-xs`'],
    ['a section', { tag: 'Section' }, 'default', 'on `<Section>`'],
    ['inside a card', { ancestors: [{ tag: 'MdsCard' }] }, 'raised', 'inside `<MdsCard>`'],
  ])('%s', (_, over, role, why) => {
    expect(surfaceHint(el(over))).toEqual({ role, why });
  });

  it('prefers the modal around a shadowed element over its shadow', () => {
    expect(
      surfaceHint(el({ classes: ['shadow-xs'], ancestors: [{ tag: 'MdsModal' }] }))?.role,
    ).toBe('overlay');
  });

  it('ignores rings and shadow-none, and says nothing of a bare div', () => {
    expect(surfaceHint(el({ classes: ['shadow-ring-2', 'shadow-none'] }))).toBeUndefined();
    expect(surfaceHint(el({}))).toBeUndefined();
  });
});

describe('describeElement', () => {
  it('names the element and the nearest component or role around it', () => {
    expect(describeElement(el({ ancestors: [{ tag: 'div' }, { tag: 'MdsModal' }] }))).toBe(
      'on `<div>` inside `<MdsModal>`',
    );
    expect(describeElement(el({ tag: 'ul', ancestors: [{ tag: 'nav', role: 'menu' }] }))).toBe(
      'on `<ul>` inside `<nav role="menu">`',
    );
    expect(describeElement(el({ tag: 'mds-text', role: 'status' }))).toBe(
      'on `<mds-text role="status">`',
    );
    expect(describeElement(el({ ancestors: [{ tag: 'div' }, { tag: 'span' }] }))).toBe(
      'on `<div>`',
    );
  });
});
