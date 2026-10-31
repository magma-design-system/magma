import { commands } from 'vitest/browser';

declare module 'vitest/browser' {
  interface BrowserCommands {
    // defined in vitest.config.mts, run in Node
    compileTailwind: (css: string) => Promise<string>;
  }
}

const RHYTHM: Array<[string, number]> = [
  ['inline', 12],
  ['title-content', 12],
  ['label-control', 12],
  ['between-containers', 16],
  ['between-fields', 24],
  ['inset', 24],
  ['between-groups', 40],
  ['between-sections', 64],
];
const TITLES: Array<[string, string]> = [
  ['page', 'h3'],
  ['section', 'h5'],
  ['dialog', 'h5'],
  ['part', 'h6'],
  ['group', 'h6'],
];

/**
 * The roles of the design language (#1189) through the Tailwind layer of the styles package,
 * laid out by the browser: an agent writes the relation, the width or the role of a title, and
 * gets the value the decisions of #1189 give it. The tokens come from typography.css, as on a
 * page set up as the guide says.
 */
describe('the role utilities of the design language', () => {
  const classes = [
    'flex',
    ...RHYTHM.flatMap(([id]) => [`gap-${id}`, `p-${id}`]),
    'max-w-form',
    'page-frame',
    'field-group',
    ...TITLES.flatMap(([role, level]) => [`text-title-${role}`, `text-title-${level}`]),
  ];
  let css: string;
  let sheet: HTMLStyleElement;
  let stage: HTMLElement;

  /** The stage at `width` pixels, holding `html`; its first element. */
  const render = (html: string, width = 1280): HTMLElement => {
    stage.style.width = `${width}px`;
    stage.innerHTML = html;
    return stage.firstElementChild as HTMLElement;
  };
  const box = (element: Element) => element.getBoundingClientRect();

  beforeAll(async () => {
    css = await commands.compileTailwind(
      [
        "@import 'tailwindcss/theme.css' layer(theme);",
        "@import '@maggioli-design-system/styles/dist/css/typography.css' layer(theme);",
        "@import '@maggioli-design-system/styles/dist/tailwind/theme.css';",
        "@import '@maggioli-design-system/styles/dist/tailwind/typography.css';",
        "@import '@maggioli-design-system/styles/dist/tailwind/utilities.css';",
        `@source inline('${classes.join(' ')}');`,
        '@tailwind utilities source(none);',
      ].join('\n'),
    );
  });

  beforeEach(() => {
    sheet = document.createElement('style');
    sheet.textContent = css;
    document.head.append(sheet);
    stage = document.createElement('div');
    document.body.append(stage);
  });

  afterEach(() => {
    sheet.remove();
    stage.remove();
  });

  it.each(RHYTHM)('rhythm/%s is a spacing key: gap and padding of %ipx', (id, px) => {
    const element = render(`<div class="flex gap-${id} p-${id}"><i></i><i></i></div>`);
    expect(getComputedStyle(element).columnGap).toBe(`${px}px`);
    expect(getComputedStyle(element).paddingTop).toBe(`${px}px`);
  });

  it('max-w-form is the reading measure, 56ch of its own text', () => {
    const form = render('<form class="max-w-form"></form><p style="max-width: 56ch"></p>');
    expect(getComputedStyle(form).maxWidth).toBe(
      getComputedStyle(stage.lastElementChild!).maxWidth,
    );
  });

  it('page-frame stops the content at 1280px, centred, with the gutter outside it', () => {
    const frame = render('<main class="page-frame"><div></div></main>', 1440);
    const content = box(frame.firstElementChild!);
    expect(content.width).toBe(1280);
    expect(content.left - box(stage).left).toBe(80);
  });

  it('page-frame keeps its gutter on a narrow window', () => {
    const frame = render('<main class="page-frame"><div></div></main>', 375);
    const content = box(frame.firstElementChild!);
    expect(content.left - box(stage).left).toBe(24);
    expect(content.width).toBe(375 - 48);
  });

  describe('field-group', () => {
    const fields = (...short: boolean[]) =>
      short.map((one) => `<div${one ? ' short' : ''}>field</div>`).join('');

    it('is a fieldset with no border, no inset and no margin of its own', () => {
      const group = render(`<fieldset class="field-group">${fields(false)}</fieldset>`, 600);
      const style = getComputedStyle(group);
      expect([style.borderTopWidth, style.paddingTop, style.marginTop]).toEqual([
        '0px',
        '0px',
        '0px',
      ]);
      expect(box(group.firstElementChild!).width).toBe(600);
    });

    it('pairs two short fields from 28rem (448px), half a column each, the gap between them', () => {
      const group = render(`<fieldset class="field-group">${fields(true, true)}</fieldset>`, 448);
      const [a, b] = Array.from(group.children).map(box);
      expect(a.top).toBe(b.top);
      expect([a.width, b.width]).toEqual([212, 212]);
      expect(b.left - a.right).toBe(24);
    });

    it('stacks them below 28rem, each on the whole column', () => {
      const group = render(`<fieldset class="field-group">${fields(true, true)}</fieldset>`, 447);
      const [a, b] = Array.from(group.children).map(box);
      expect(b.top - a.bottom).toBe(24);
      expect([a.width, b.width]).toEqual([447, 447]);
    });

    it('gives a lone short field half the column, and every other field the whole of it', () => {
      const group = render(
        `<fieldset class="field-group">${fields(false, true, false)}</fieldset>`,
        532,
      );
      const [whole, half, next] = Array.from(group.children).map(box);
      expect(whole.width).toBe(532);
      expect(half.width).toBe((532 - 24) / 2);
      expect(next.top - half.bottom).toBe(24);
      expect(next.width).toBe(532);
    });

    it('draws its legend as the title of a group', () => {
      const group = render(
        `<fieldset class="field-group"><legend>Residenza</legend>${fields(false)}</fieldset><p class="text-title-group">Residenza</p>`,
        532,
      );
      const legend = getComputedStyle(group.querySelector('legend')!);
      const title = getComputedStyle(stage.lastElementChild!);
      for (const property of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight'] as const)
        expect(legend[property], property).toBe(title[property]);
    });

    it('keeps rhythm/title-content between the legend and the first field', () => {
      const group = render(
        `<fieldset class="field-group"><legend>Residenza</legend>${fields(false)}</fieldset>`,
        532,
      );
      const legend = box(group.querySelector('legend')!);
      expect(box(group.querySelector('div')!).top - legend.bottom).toBe(12);
    });
  });

  it.each(TITLES)('text-title-%s takes the style of %s', (role, level) => {
    const [byRole, byLevel] = Array.from(
      render(
        `<div><p class="text-title-${role}">Titolo</p><p class="text-title-${level}">Titolo</p></div>`,
      ).children,
    ).map((element) => getComputedStyle(element));
    for (const property of [
      'fontFamily',
      'fontSize',
      'fontWeight',
      'lineHeight',
      'letterSpacing',
    ] as const)
      expect(byRole[property], property).toBe(byLevel[property]);
  });
});

/**
 * The reading measure (#1204) on the plain tags, through the built sheets a page imports as the
 * styles README says: the reset caps p, li and figcaption at max-w-text, and base.css, a later
 * layer, no longer caps p at a title's 30ch.
 */
describe('the reading measure on the plain tags', () => {
  let sheet: HTMLStyleElement;
  let stage: HTMLElement;

  beforeAll(async () => {
    sheet = document.createElement('style');
    sheet.textContent = await commands.compileTailwind(
      [
        "@import '@maggioli-design-system/styles/dist/css/layer.css';",
        "@import '@maggioli-design-system/styles/dist/css/reset.css' layer(reset);",
        "@import '@maggioli-design-system/styles/dist/css/typography.css' layer(theme);",
        "@import '@maggioli-design-system/styles/dist/css/base.css' layer(base);",
      ].join('\n'),
    );
  });

  beforeEach(() => {
    document.head.append(sheet);
    stage = document.createElement('div');
    stage.style.width = '1280px';
    document.body.append(stage);
  });

  afterEach(() => {
    sheet.remove();
    stage.remove();
  });

  // each tag next to one of its own set at 56ch, so the ch is that of the same text
  it.each([
    ['p', '<p>Testo</p><p style="max-width: 56ch">Testo</p>'],
    ['li', '<ul><li>Voce</li><li style="max-width: 56ch">Voce</li></ul>'],
    [
      'figcaption',
      '<figure><figcaption>Testo</figcaption><figcaption style="max-width: 56ch">Testo</figcaption></figure>',
    ],
  ])('caps %s at 56ch of its own text', (tag, html) => {
    stage.innerHTML = html;
    const [capped, measure] = Array.from(stage.querySelectorAll(tag)).map(
      (element) => getComputedStyle(element).maxWidth,
    );
    expect(capped).toMatch(/px$/);
    expect(capped).toBe(measure);
  });

  it('leaves the titles at their own measure', () => {
    stage.innerHTML = '<h1>Titolo</h1><h1 style="max-width: 30ch">Titolo</h1>';
    const [capped, measure] = Array.from(stage.querySelectorAll('h1')).map(
      (element) => getComputedStyle(element).maxWidth,
    );
    expect(capped).toBe(measure);
  });
});
