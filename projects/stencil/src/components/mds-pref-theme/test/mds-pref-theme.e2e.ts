import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';

const CORNER_STORAGE_KEY = 'mdsPrefCornerShape';
const THEME_NAME_STORAGE_KEY = 'mdsPrefTheme';
const THEME_SCHEME_STORAGE_KEY = 'mdsPrefThemeScheme';

/** The stored choice outranks the prop, and both the theme name and the corner
 * shape are written on the document, so a leftover decides the next case. */
const reset = (): void => {
  localStorage.removeItem(CORNER_STORAGE_KEY);
  document.documentElement.removeAttribute('data-corner-shape');
  localStorage.removeItem(THEME_NAME_STORAGE_KEY);
  localStorage.removeItem(THEME_SCHEME_STORAGE_KEY);
  document.documentElement.removeAttribute('data-theme-name');
  document.documentElement.style.removeProperty('--magma-pref-theme');
  // the list is live, so the names come out of a copy before they are removed
  [...document.documentElement.classList]
    .filter((name) => name.startsWith('pref-theme-'))
    .forEach((name) => document.documentElement.classList.remove(name));
};

describe('mds-pref-theme', () => {
  // the theme name and the corner shape are written on the document, so they
  // outlive this file and reach the cases that run after it: clear them on the way
  // out as well as on the way in
  afterEach(() => {
    reset();
  });

  beforeEach(() => {
    reset();
    mockIconFetch();
  });

  it('renders', async () => {
    const { root } = await render('<mds-pref-theme></mds-pref-theme>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('leaves the corner axis alone when no shape is asked for', async () => {
    await render('<mds-pref-theme></mds-pref-theme>');

    expect(document.documentElement).not.toHaveAttribute('data-corner-shape');
    expect(localStorage.getItem(CORNER_STORAGE_KEY)).toBeNull();
  });

  it('writes the deviation on the document and stores it', async () => {
    await render('<mds-pref-theme corner-shape="round"></mds-pref-theme>');

    expect(document.documentElement.getAttribute('data-corner-shape')).toBe('round');
    expect(localStorage.getItem(CORNER_STORAGE_KEY)).toBe('round');
  });

  it('removes the attribute for "default" instead of writing a shape', async () => {
    document.documentElement.setAttribute('data-corner-shape', 'round');

    await render('<mds-pref-theme corner-shape="default"></mds-pref-theme>');

    // freezing today's default into the page would keep a later change of default
    // from reaching a project that never chose
    expect(document.documentElement).not.toHaveAttribute('data-corner-shape');
    expect(localStorage.getItem(CORNER_STORAGE_KEY)).toBe('default');
  });

  it('renders no caption of its own for a theme that is not the default', async () => {
    const { root } = await render('<mds-pref-theme name="ocean"></mds-pref-theme>');

    // the dropped caption read a key none of the four locale files has, so every
    // theme but the default used to get an empty mds-text under the dropdown
    const texts = [...root.shadowRoot!.querySelectorAll('mds-text')];

    expect(root).toHaveAttribute('name', 'ocean');
    expect(texts).toHaveLength(1);
    expect(texts[0].textContent!.trim()).not.toBe('');
  });

  it('lets the stored choice outrank the prop, like the theme name does', async () => {
    localStorage.setItem(CORNER_STORAGE_KEY, 'bevel');

    await render('<mds-pref-theme corner-shape="round"></mds-pref-theme>');

    expect(document.documentElement.getAttribute('data-corner-shape')).toBe('bevel');
  });

  it('keeps a theme name set from a script after load', async () => {
    const { root, waitForChanges } = await render<HTMLMdsPrefThemeElement>(
      '<mds-pref-theme></mds-pref-theme>',
    );

    root.name = 'ocean';
    await waitForChanges();

    expect(root.name).toBe('ocean');
    expect(document.documentElement.getAttribute('data-theme-name')).toBe('ocean');
    expect(localStorage.getItem(THEME_NAME_STORAGE_KEY)).toBe('ocean');
  });

  it('changes a stored corner shape through the prop after load', async () => {
    localStorage.setItem(CORNER_STORAGE_KEY, 'bevel');
    const { root, waitForChanges } = await render<HTMLMdsPrefThemeElement>(
      '<mds-pref-theme></mds-pref-theme>',
    );

    root.cornerShape = 'round';
    await waitForChanges();

    expect(root.cornerShape).toBe('round');
    expect(document.documentElement.getAttribute('data-corner-shape')).toBe('round');
  });

  it('writes the theme under the theme names, never the mode ones', async () => {
    await render('<mds-pref-theme name="ocean"></mds-pref-theme>');

    const html = document.documentElement;
    expect(html).toHaveClass('pref-theme-ocean');
    expect(html.style.getPropertyValue('--magma-pref-theme')).toBe('ocean');
    expect(localStorage.getItem(THEME_NAME_STORAGE_KEY)).toBe('ocean');
    expect(html.style.getPropertyValue('--magma-pref-mode')).toBe('');
    expect(localStorage.getItem('mdsPrefMode')).toBeNull();
  });

  it.each(['dark', 'system', 'scheme-dark'])('refuses the reserved name "%s"', async (name) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleError = vi.spyOn(console, 'error');
    // a mode value would be read back as a v1 mode by the storage migration, a
    // scheme name would write a class of the scheme axis
    await render(`<mds-pref-theme name="${name}"></mds-pref-theme>`);

    // #825: refused with a warning, no longer with an error that stopped the component
    expect(consoleError).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(`"${name}"`));
    expect(document.documentElement).not.toHaveClass(`pref-theme-${name}`);
    expect(localStorage.getItem(THEME_NAME_STORAGE_KEY)).toBeNull();
  });

  // #825: an unknown scheme was written as a class named `undefined` on the page, and stored
  describe('an invalid scheme', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('is ignored, neither written nor stored', async () => {
      const consoleError = vi.spyOn(console, 'error');

      await render('<mds-pref-theme scheme="sepia"></mds-pref-theme>');

      expect(consoleError).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"sepia"'));
      expect(document.documentElement).not.toHaveClass('undefined');
      expect(localStorage.getItem(THEME_SCHEME_STORAGE_KEY)).toBeNull();
    });

    it('left in the storage by an earlier version is dropped for the prop', async () => {
      localStorage.setItem(THEME_SCHEME_STORAGE_KEY, 'sepia');

      await render('<mds-pref-theme scheme="dark"></mds-pref-theme>');

      expect(document.documentElement).toHaveClass('pref-theme-scheme-dark');
      expect(document.documentElement).not.toHaveClass('undefined');
      expect(localStorage.getItem(THEME_SCHEME_STORAGE_KEY)).toBe('dark');
    });
  });

  it('ignores an invalid corner shape with a warning', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleError = vi.spyOn(console, 'error');

    await render('<mds-pref-theme corner-shape="wavy"></mds-pref-theme>');

    expect(consoleError).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"wavy"'));
    expect(document.documentElement).not.toHaveAttribute('data-corner-shape');
    expect(localStorage.getItem(CORNER_STORAGE_KEY)).toBeNull();
  });

  describe('the trigger', () => {
    // it showed the name of the active theme: "Default" before any pick, "Warm" after picking
    // "Caldo", while the open list showed the labels of the items
    const PICKER = `
<mds-pref-theme>
  <mds-pref-theme-item name="business" label="Neutro"></mds-pref-theme-item>
  <mds-pref-theme-item name="ocean" label="Freddo"></mds-pref-theme-item>
  <mds-pref-theme-item name="sunset" label="Caldo"></mds-pref-theme-item>
</mds-pref-theme>`;

    const triggerOf = (root: HTMLElement): HTMLMdsTabItemElement =>
      root.shadowRoot!.querySelector<HTMLMdsTabItemElement>('#mds-pref-theme-nav')!;

    it('shows the label of the item of the active theme', async () => {
      const { root } = await render(PICKER);

      expect(triggerOf(root).label).toBe('Neutro');
    });

    it('follows the item picked in the list', async () => {
      const { root, waitForChanges } = await render(PICKER);

      root.querySelector<HTMLElement>('mds-pref-theme-item[name="sunset"]')!.click();
      await waitForChanges();

      expect(root).toEqualAttribute('name', 'sunset');
      expect(triggerOf(root).label).toBe('Caldo');
    });

    it('derives the label from the name when no item matches the active theme', async () => {
      const { root } = await render(
        '<mds-pref-theme name="dark-blue"><mds-pref-theme-item name="business"></mds-pref-theme-item></mds-pref-theme>',
      );

      expect(triggerOf(root).label).toBe('Dark blue');
    });

    it('follows a label changed after load', async () => {
      const { root, waitForChanges } = await render(PICKER);

      root.querySelector('mds-pref-theme-item[name="business"]')!.setAttribute('label', 'Neutral');
      await new Promise((resolve) => setTimeout(resolve));
      await waitForChanges();

      expect(triggerOf(root).label).toBe('Neutral');
    });

    // a picker of the two product themes, with the name left on its default, showed "Default"
    // and marked no item (#692); magma 3 makes business the default of name (#1334)
    it('marks the business item when the name is left out', async () => {
      const { root } = await render(`
<mds-pref-theme>
  <mds-pref-theme-item name="business" label="Gestionale"></mds-pref-theme-item>
  <mds-pref-theme-item name="editorial" label="Editoriale"></mds-pref-theme-item>
</mds-pref-theme>`);

      expect(triggerOf(root).label).toBe('Gestionale');
      expect(root.querySelector<HTMLMdsPrefThemeItemElement>('[name="business"]')!.selected).toBe(
        true,
      );
      expect(root.querySelector<HTMLMdsPrefThemeItemElement>('[name="editorial"]')!.selected).toBe(
        false,
      );
    });

    // `default` was the old name of business, which magma 3 removed (#1334)
    it('marks no item named default when the active theme is business', async () => {
      const { root } = await render(`
<mds-pref-theme name="business">
  <mds-pref-theme-item name="default" label="Neutro"></mds-pref-theme-item>
  <mds-pref-theme-item name="editorial" label="Editoriale"></mds-pref-theme-item>
</mds-pref-theme>`);

      expect(triggerOf(root).label).toBe('Business');
      expect(root.querySelector<HTMLMdsPrefThemeItemElement>('[name="default"]')!.selected).toBe(
        false,
      );
    });
  });

  // #1274: a theme file lists its colour modes, its block in themes.css says the one it locks
  describe('a theme that declares one mode', () => {
    let sheet: HTMLStyleElement;

    beforeEach(() => {
      // what themes.css prints for a theme whose file says `"modes": ["dark"]`
      sheet = document.createElement('style');
      sheet.textContent = ":root[data-theme-name='night'] { --magma-color-modes: dark; }";
      document.head.append(sheet);
    });

    afterEach(() => {
      sheet.remove();
      document.documentElement.style.removeProperty('--magma-pref-theme-scheme');
    });

    const markup = (scheme = 'all') => `
      <mds-pref-theme name="business">
        <mds-pref-theme-item name="business"></mds-pref-theme-item>
        <mds-pref-theme-item name="night" scheme="${scheme}"></mds-pref-theme-item>
      </mds-pref-theme>`;

    it('is applied in that mode, and the pick of the item is what is stored', async () => {
      const { root, waitForChanges } = await render(markup());
      const changes = vi.fn();
      root.addEventListener('mdsPrefThemeChange', changes);

      root.querySelector<HTMLElement>('mds-pref-theme-item[name="night"]')!.click();
      await waitForChanges();

      const html = document.documentElement;
      expect(html).toHaveAttribute('data-theme-name', 'night');
      expect(html).toHaveClass('pref-theme-scheme-dark');
      expect(html).not.toHaveClass('pref-theme-scheme-all');
      expect(html.style.getPropertyValue('--magma-pref-theme-scheme')).toBe('dark');
      expect(changes).toHaveBeenCalledWith(
        expect.objectContaining({ detail: { name: 'night', scheme: 'dark' } }),
      );
      // the storage keeps the pick: a theme that stops declaring the mode is not held to it
      expect(localStorage.getItem(THEME_SCHEME_STORAGE_KEY)).toBe('all');
    });

    it('wins over the scheme of the item', async () => {
      const { root, waitForChanges } = await render(markup('light'));

      root.querySelector<HTMLElement>('mds-pref-theme-item[name="night"]')!.click();
      await waitForChanges();

      expect(document.documentElement).toHaveClass('pref-theme-scheme-dark');
      expect(document.documentElement).not.toHaveClass('pref-theme-scheme-light');
    });

    it('is applied in that mode on load, and leaves it for a theme of both modes', async () => {
      localStorage.setItem(THEME_NAME_STORAGE_KEY, 'night');
      const { root, waitForChanges } = await render(markup());
      const html = document.documentElement;
      expect(html).toHaveClass('pref-theme-scheme-dark');

      root.querySelector<HTMLElement>('mds-pref-theme-item[name="business"]')!.click();
      await waitForChanges();

      expect(html).toHaveAttribute('data-theme-name', 'business');
      expect(html).toHaveClass('pref-theme-scheme-all');
      expect(html).not.toHaveClass('pref-theme-scheme-dark');
    });
  });

  // #826: the items got their listener once, on load: an item added later did nothing when picked
  it('applies the theme of an item added after load when it is picked', async () => {
    const { root, waitForChanges } = await render(
      '<mds-pref-theme><mds-pref-theme-item name="business"></mds-pref-theme-item></mds-pref-theme>',
    );

    const sunset = document.createElement('mds-pref-theme-item');
    sunset.setAttribute('name', 'sunset');
    root.appendChild(sunset);
    await waitForChanges();
    sunset.click();
    await waitForChanges();

    expect(root).toEqualAttribute('name', 'sunset');
    expect(document.documentElement).toHaveClass('pref-theme-sunset');
    expect(sunset.selected).toBe(true);
  });
});

// mdsPrefChange was emitted on every render, page load included (#823)
describe('mds-pref-theme mdsPrefChange', () => {
  it('announces a picked theme once, and nothing at load or on a later render', async () => {
    const preferences: string[] = [];
    const record = (event: Event): void => {
      preferences.push((event as CustomEvent<{ preference: string }>).detail.preference);
    };
    document.addEventListener('mdsPrefChange', record);
    try {
      const { root, waitForChanges } = await render(`
        <mds-pref-theme>
          <mds-pref-theme-item name="business" label="Neutro"></mds-pref-theme-item>
          <mds-pref-theme-item name="sunset" label="Caldo"></mds-pref-theme-item>
        </mds-pref-theme>`);
      await waitForChanges();
      expect(preferences).toEqual([]);

      root.querySelector<HTMLElement>('mds-pref-theme-item[name="sunset"]')!.click();
      await waitForChanges();
      // a render of its own: a label changed after load
      root.querySelector('mds-pref-theme-item[name="sunset"]')!.setAttribute('label', 'Calda');
      await waitForChanges();

      expect(preferences).toEqual(['theme']);
      expect(document.documentElement).toHaveClass('pref-theme-sunset');
    } finally {
      document.removeEventListener('mdsPrefChange', record);
    }
  });
});
