import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

const strip = `<mds-tab>
  <mds-tab-item label="First" selected></mds-tab-item>
  <mds-tab-item label="Second"></mds-tab-item>
</mds-tab>`;

const links = `<mds-tab>
  <mds-tab-item href="#a" label="A" selected></mds-tab-item>
  <mds-tab-item href="#b" label="B"></mds-tab-item>
</mds-tab>`;

const panel = (text: string): HTMLElement => {
  const element = document.createElement('div');
  element.slot = 'content';
  element.textContent = text;
  return element;
};

const linkItem = (href: string): HTMLMdsTabItemElement => {
  const item = document.createElement('mds-tab-item');
  item.href = href;
  item.label = href;
  return item;
};

describe('mds-tab', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tab></mds-tab>');

    expect(root).toHaveAttribute('hydrated');
  });

  // the strip alone, the page showing the content: by navigation (href on the items) or from
  // the mdsTabChange event
  describe('without content panels', () => {
    it('hides the area of the contents', async () => {
      const { root } = await render(strip);

      expect(getComputedStyle(root.shadowRoot!.querySelector('.contents')!).display).toBe('none');
    });

    it('shows it as soon as a panel arrives', async () => {
      const { root } = await render(strip);
      const contents = root.shadowRoot!.querySelector('.contents')!;
      const first = panel('First');

      root.appendChild(first);

      await vi.waitFor(() => expect(getComputedStyle(contents).display).not.toBe('none'));
      expect(first).toEqualAttribute('role', 'tabpanel');
    });

    it('still selects the tab that is clicked, and says so once', async () => {
      const { root, spyOnEvent } = await render(strip);
      const change = spyOnEvent('mdsTabChange');
      const [first, second] = Array.from(root.querySelectorAll('mds-tab-item'));

      await userEvent.click(second.shadowRoot!.querySelector('mds-button')!);

      await vi.waitFor(() => expect(second).toHaveAttribute('selected'));
      expect(first).not.toHaveAttribute('selected');
      // the page shows the content from this event: it used to come twice, the item announcing
      // its selection again when the parent handed `selected` back to it
      expect(change).toHaveReceivedEventTimes(1);
      expect(change.lastEvent?.detail).toMatchObject({ id: 1 });
    });

    it('spans the whole width in the vertical direction, leaving no column to the contents', async () => {
      const { root } = await render(strip.replace('<mds-tab>', '<mds-tab direction="vertical">'));
      const wrapper = root.shadowRoot!.querySelector('.tabs-wrapper')!;

      // the host is a grid with a column for the contents: empty, it still took its share of
      // the width. The strip spans it too; the comparison allows the rounding of the layout
      const gap = root.getBoundingClientRect().right - wrapper.getBoundingClientRect().right;
      expect(Math.abs(gap) <= 1).toBe(true);
    });
  });

  // the background of the selected tab in the slide animation: it slides from tab to tab on a
  // selection, and is already in place when the strip is shown, on load or again after being
  // hidden. It used to grow from the corner every time the strip appeared (#924)
  // #913: the items are buttons and their radius is capped like mds-button's, the strip at
  // that radius plus its padding, so the two stay concentric
  describe('the radius', () => {
    const corners = (tab: HTMLElement) => ({
      strip: getComputedStyle(tab.shadowRoot!.querySelector('.tabs')!).borderTopLeftRadius,
      item: getComputedStyle(
        tab.querySelector('mds-tab-item')!.shadowRoot!.querySelector('mds-button')!,
      ).borderTopLeftRadius,
    });

    it('stops at half the height of the strip and of the items, what the browser clamps to', async () => {
      const { root } = await render(strip);

      expect(corners(root)).toEqual({ strip: '26px', item: '18px' });
    });

    it('takes the part of the item height that --magma-corner-cap gives, per size', async () => {
      const { root } = await render(
        `<div style="--magma-corner-cap: 0.25">${strip}${strip.replace('<mds-tab>', '<mds-tab size="sm">')}</div>`,
      );
      const [md, sm] = Array.from(root.querySelectorAll('mds-tab'));

      expect(corners(md)).toEqual({ strip: '17px', item: '9px' });
      expect(corners(sm)).toEqual({ strip: '15px', item: '7px' });
    });

    it('leaves the strip of a vertical tab, which is tall, on the token', async () => {
      const { root } = await render(strip.replace('<mds-tab>', '<mds-tab direction="vertical">'));

      expect(corners(root)).toEqual({ strip: '40px', item: '18px' });
    });
  });

  describe('the slider', () => {
    const second = `<mds-tab>
  <mds-tab-item label="First"></mds-tab-item>
  <mds-tab-item label="Second" selected></mds-tab-item>
</mds-tab>`;

    const frame = (): Promise<number> => new Promise((resolve) => requestAnimationFrame(resolve));

    const sliderOf = (tab: HTMLElement): HTMLElement => tab.shadowRoot!.querySelector('.slider')!;

    /** Fails as soon as the slider runs a transition, in any of the next frames. */
    const staysStill = async (tab: HTMLElement, frames = 30): Promise<void> => {
      for (let count = 0; count < frames; count += 1) {
        expect(sliderOf(tab).getAnimations()).toHaveLength(0);
        await frame();
      }
    };

    /** The slider covers the item, within a pixel of rounding. */
    const coversItem = (tab: HTMLElement, item: Element): void => {
      const slider = sliderOf(tab).getBoundingClientRect();
      const box = item.getBoundingClientRect();
      expect(Math.abs(slider.left - box.left)).toBeLessThanOrEqual(1);
      expect(Math.abs(slider.width - box.width)).toBeLessThanOrEqual(1);
    };

    const settled = async (tab: HTMLElement, item: Element): Promise<void> => {
      await vi.waitFor(() => {
        expect(sliderOf(tab).getAnimations()).toHaveLength(0);
        coversItem(tab, item);
      });
    };

    it('is under the selected tab on load, without sliding there', async () => {
      const { root } = await render(second);

      await staysStill(root);
      coversItem(root, root.querySelectorAll('mds-tab-item')[1]);
    });

    it('is under the selected tab when a strip hidden on load is shown', async () => {
      const { root } = await render(`<div style="display: none">${second}</div>`);
      const tab = root.querySelector('mds-tab')!;
      await staysStill(tab, 5);

      root.style.display = '';

      await staysStill(tab);
      coversItem(tab, tab.querySelectorAll('mds-tab-item')[1]);
    });

    it('is still in place when the strip is shown again after being hidden', async () => {
      const { root } = await render(`<div>${second}</div>`);
      const tab = root.querySelector('mds-tab')!;
      const item = tab.querySelectorAll('mds-tab-item')[1];
      await settled(tab, item);

      root.style.display = 'none';
      await staysStill(tab, 5);
      root.style.display = '';

      await staysStill(tab);
      coversItem(tab, item);
    });

    it('follows a change of the layout without sliding', async () => {
      const { root } = await render(second);
      const [first, item] = Array.from(root.querySelectorAll('mds-tab-item'));
      await settled(root, item);

      first.label = 'A much longer first label';

      await staysStill(root);
      coversItem(root, item);
    });

    // the observer of the strip moves the slider: it stopped for good when the strip was moved,
    // and when overflow was turned off
    it('follows a change of the layout after the strip is moved in the page', async () => {
      const { root } = await render(`<div><div>${second}</div><div class="other"></div></div>`);
      const tab = root.querySelector('mds-tab')!;
      const [first, item] = Array.from(tab.querySelectorAll('mds-tab-item'));
      await settled(tab, item);

      root.querySelector('.other')!.appendChild(tab);
      first.label = 'A much longer first label';

      await staysStill(tab);
      coversItem(tab, item);
    });

    it('follows a change of the layout after overflow is turned off', async () => {
      const { root } = await render<HTMLMdsTabElement>(
        second.replace('<mds-tab>', '<mds-tab overflow>'),
      );
      const [first, item] = Array.from(root.querySelectorAll('mds-tab-item'));
      await settled(root, item);

      root.overflow = false;
      first.label = 'A much longer first label';

      await staysStill(root);
      coversItem(root, item);
    });

    it('slides to the tab that is selected', async () => {
      const { root } = await render(second);
      const [first, item] = Array.from(root.querySelectorAll('mds-tab-item'));
      await settled(root, item);

      await userEvent.click(first.shadowRoot!.querySelector('mds-button')!);

      await vi.waitFor(() => expect(sliderOf(root).getAnimations().length).toBeGreaterThan(0));
      await settled(root, first);
    });
  });

  describe('as a navigation, when every item is a link', () => {
    const tabs = (root: HTMLElement): Element => root.shadowRoot!.querySelector('.tabs')!;

    it('is no tablist: its items are links, not tabs', async () => {
      const { root } = await render(links);

      expect(tabs(root)).not.toHaveAttribute('role');
      expect(
        Array.from(root.querySelectorAll('mds-tab-item')).map((item) =>
          item.shadowRoot!.querySelector('mds-button')!.getAttribute('role'),
        ),
      ).toEqual(['link', 'link']);
    });

    it('stays a tablist while one item is a tab', async () => {
      const { root } = await render(
        links.replace('<mds-tab-item href="#b" label="B">', '<mds-tab-item label="B">'),
      );

      expect(tabs(root)).toEqualAttribute('role', 'tablist');
    });

    it('follows the items that arrive later', async () => {
      const { root } = await render('<mds-tab></mds-tab>');
      expect(tabs(root)).toEqualAttribute('role', 'tablist');

      root.appendChild(linkItem('#a'));
      root.appendChild(linkItem('#b'));

      await vi.waitFor(() => expect(tabs(root)).not.toHaveAttribute('role'));
    });
  });

  // #1245: the strip watches its scroll and its size while it is drawn and in the page. Removed
  // before its first load, its teardown read the parts it watches, not there yet, and threw
  describe('in and out of the page', () => {
    const items = `<mds-tab-item label="First" selected></mds-tab-item>
  <mds-tab-item label="Second"></mds-tab-item>`;

    const wrapperOf = (tab: HTMLElement): Element =>
      tab.shadowRoot!.querySelector('.tabs-wrapper')!;

    /**
     * How many ResizeObserver watch an element now, followed through observe, unobserve and
     * disconnect: the observer of the strip watches its `.tabs-wrapper`.
     */
    const resizeWatchers = (): ((target: Element) => number) => {
      const watched = new Map<ResizeObserver, Set<Element>>();
      const { observe, unobserve, disconnect } = ResizeObserver.prototype;
      vi.spyOn(ResizeObserver.prototype, 'observe').mockImplementation(function (
        this: ResizeObserver,
        target: Element,
        options?: ResizeObserverOptions,
      ) {
        watched.set(this, (watched.get(this) ?? new Set()).add(target));
        observe.call(this, target, options);
      });
      vi.spyOn(ResizeObserver.prototype, 'unobserve').mockImplementation(function (
        this: ResizeObserver,
        target: Element,
      ) {
        watched.get(this)?.delete(target);
        unobserve.call(this, target);
      });
      vi.spyOn(ResizeObserver.prototype, 'disconnect').mockImplementation(function (
        this: ResizeObserver,
      ) {
        watched.delete(this);
        disconnect.call(this);
      });
      return (target) => [...watched.values()].filter((targets) => targets.has(target)).length;
    };

    /** A strip created by script, as a framework does, not connected yet. */
    const created = (): HTMLMdsTabElement => {
      const tab = document.createElement('mds-tab');
      tab.innerHTML = items;
      return tab;
    };

    it('throws nothing when removed before its first load, and loads when it comes back', async () => {
      const consoleError = vi.spyOn(console, 'error');
      // a strip already in the page: the component is defined, and the next one is built at
      // once, as in a framework that creates and destroys it in quick succession
      const { root } = await render(`<div>${strip}</div>`);
      const watchers = resizeWatchers();
      const tab = created();

      root.appendChild(tab);
      tab.remove();

      // what its connection scheduled still runs: the strip loads out of the page, where it has
      // nothing to watch. An observer started there was never stopped
      await vi.waitFor(() => expect(tab).toHaveAttribute('hydrated'));
      expect(consoleError).not.toHaveBeenCalled();
      expect(watchers(wrapperOf(tab))).toBe(0);

      root.appendChild(tab);

      await vi.waitFor(() => expect(watchers(wrapperOf(tab))).toBe(1));
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('stops watching the strip when removed after its load', async () => {
      const watchers = resizeWatchers();
      const { root } = await render(`<div>${strip}</div>`);
      const tab = root.querySelector('mds-tab')!;
      const wrapper = wrapperOf(tab);
      await vi.waitFor(() => expect(watchers(wrapper)).toBe(1));
      const removeListener = vi.spyOn(
        tab.shadowRoot!.querySelector('.tabs')!,
        'removeEventListener',
      );

      tab.remove();

      expect(watchers(wrapper)).toBe(0);
      expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('watches the strip again, once, when moved in the page', async () => {
      const watchers = resizeWatchers();
      const { root } = await render(`<div><div>${strip}</div><div class="other"></div></div>`);
      const tab = root.querySelector('mds-tab')!;
      const wrapper = wrapperOf(tab);
      await vi.waitFor(() => expect(watchers(wrapper)).toBe(1));

      root.querySelector('.other')!.appendChild(tab);

      expect(watchers(wrapper)).toBe(1);
    });

    it('watches the strip once however often overflow is turned on and off', async () => {
      const watchers = resizeWatchers();
      const { root, waitForChanges } = await render<HTMLMdsTabElement>(strip);
      const wrapper = wrapperOf(root);
      await vi.waitFor(() => expect(watchers(wrapper)).toBe(1));

      // the strip is watched from its load on: turned on, overflow started a second observer
      root.overflow = true;
      await waitForChanges();
      expect(watchers(wrapper)).toBe(1);

      root.overflow = false;
      await waitForChanges();
      root.overflow = true;
      await waitForChanges();
      expect(watchers(wrapper)).toBe(1);
    });

    it('takes overflow set before its first load', async () => {
      const consoleError = vi.spyOn(console, 'error');
      const { root } = await render(`<div>${strip}</div>`);
      const tab = created();

      root.appendChild(tab);
      tab.overflow = true;

      await vi.waitFor(() =>
        expect(tab.shadowRoot?.querySelector('.tabs-wrapper-overflow-left')).toBeTruthy(),
      );
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  // #825: a panel past the last item read the id of an item that is not there and threw, and no
  // panel was hidden
  describe('with more content panels than items', () => {
    it('shows the panel of the selected item and hides the others, the extra one too', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleError = vi.spyOn(console, 'error');
      const { root } = await render(`<mds-tab>
  <mds-tab-item label="First" selected></mds-tab-item>
  <mds-tab-item label="Second"></mds-tab-item>
  <div slot="content">One</div>
  <div slot="content">Two</div>
  <div slot="content">Three</div>
</mds-tab>`);
      const [one, two, three] = Array.from(root.querySelectorAll<HTMLElement>('[slot="content"]'));

      expect(consoleError).not.toHaveBeenCalled();
      expect(one).not.toHaveAttribute('mds-tab-content-hidden');
      expect(two).toHaveAttribute('mds-tab-content-hidden');
      expect(three).toHaveAttribute('mds-tab-content-hidden');
      expect(three).toEqualAttribute('role', 'tabpanel');
      expect(three).not.toHaveAttribute('aria-labelledby');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('3 content panels for 2'));
    });
  });
});

// the focus went to the selected item after every selection, one made from code too: a strip
// whose item a parent selects pulled the focus away from where the user was (#341)
describe('mds-tab focus', () => {
  const setup = async () => {
    const { root } = await render(`<div><input id="elsewhere" />${strip}</div>`);
    const [first, second] = Array.from(root.querySelectorAll('mds-tab-item'));
    const button = (item: Element): HTMLElement =>
      item.shadowRoot!.querySelector<HTMLElement>('mds-button')!;
    return {
      elsewhere: root.querySelector<HTMLInputElement>('#elsewhere')!,
      first,
      second,
      button,
    };
  };

  // a frame for the deferred focus of the strip, had it moved it
  const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 50));

  it('stays where it is when an item is selected from code', async () => {
    const { elsewhere, second } = await setup();
    elsewhere.focus();

    second.selected = true;
    await vi.waitFor(() => expect(second).toHaveAttribute('selected'));
    await settle();

    expect(document.activeElement).toBe(elsewhere);
  });

  it('stays on the item selected from the keyboard', async () => {
    const { second, button } = await setup();
    button(second).focus();

    await userEvent.keyboard('{Enter}');
    await vi.waitFor(() => expect(second).toHaveAttribute('selected'));
    await settle();

    expect(document.activeElement).toBe(second);
  });
});
