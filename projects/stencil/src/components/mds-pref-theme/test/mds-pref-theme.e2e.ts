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
  <mds-pref-theme-item name="default" label="Neutro"></mds-pref-theme-item>
  <mds-pref-theme-item name="cool" label="Freddo"></mds-pref-theme-item>
  <mds-pref-theme-item name="warm" label="Caldo"></mds-pref-theme-item>
</mds-pref-theme>`;

    const triggerOf = (root: HTMLElement): HTMLMdsTabItemElement =>
      root.shadowRoot!.querySelector<HTMLMdsTabItemElement>('#mds-pref-theme-nav')!;

    it('shows the label of the item of the active theme', async () => {
      const { root } = await render(PICKER);

      expect(triggerOf(root).label).toBe('Neutro');
    });

    it('follows the item picked in the list', async () => {
      const { root, waitForChanges } = await render(PICKER);

      root.querySelector<HTMLElement>('mds-pref-theme-item[name="warm"]')!.click();
      await waitForChanges();

      expect(root).toEqualAttribute('name', 'warm');
      expect(triggerOf(root).label).toBe('Caldo');
    });

    it('derives the label from the name when no item matches the active theme', async () => {
      const { root } = await render(
        '<mds-pref-theme name="dark-blue"><mds-pref-theme-item name="default"></mds-pref-theme-item></mds-pref-theme>',
      );

      expect(triggerOf(root).label).toBe('Dark blue');
    });

    it('follows a label changed after load', async () => {
      const { root, waitForChanges } = await render(PICKER);

      root.querySelector('mds-pref-theme-item[name="default"]')!.setAttribute('label', 'Neutral');
      await new Promise((resolve) => setTimeout(resolve));
      await waitForChanges();

      expect(triggerOf(root).label).toBe('Neutral');
    });
  });

  // #826: the items got their listener once, on load: an item added later did nothing when picked
  it('applies the theme of an item added after load when it is picked', async () => {
    const { root, waitForChanges } = await render(
      '<mds-pref-theme><mds-pref-theme-item name="default"></mds-pref-theme-item></mds-pref-theme>',
    );

    const warm = document.createElement('mds-pref-theme-item');
    warm.setAttribute('name', 'warm');
    root.appendChild(warm);
    await waitForChanges();
    warm.click();
    await waitForChanges();

    expect(root).toEqualAttribute('name', 'warm');
    expect(document.documentElement).toHaveClass('pref-theme-warm');
    expect(warm.selected).toBe(true);
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
          <mds-pref-theme-item name="default" label="Neutro"></mds-pref-theme-item>
          <mds-pref-theme-item name="warm" label="Caldo"></mds-pref-theme-item>
        </mds-pref-theme>`);
      await waitForChanges();
      expect(preferences).toEqual([]);

      root.querySelector<HTMLElement>('mds-pref-theme-item[name="warm"]')!.click();
      await waitForChanges();
      // a render of its own: a label changed after load
      root.querySelector('mds-pref-theme-item[name="warm"]')!.setAttribute('label', 'Calda');
      await waitForChanges();

      expect(preferences).toEqual(['theme']);
      expect(document.documentElement).toHaveClass('pref-theme-warm');
    } finally {
      document.removeEventListener('mdsPrefChange', record);
    }
  });
});
