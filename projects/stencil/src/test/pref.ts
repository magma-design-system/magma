import { render } from '@stencil/vitest';

/**
 * mdsPrefChange came before the change was applied, twice per pick (the `mode` watcher applied
 * the value again) and at every load (#823): one pick is one event, announced once the page
 * carries the new preference, and the load or the same pick again announce nothing.
 */
export const itAnnouncesEachPickOnce = (
  tag: string,
  item: string,
  htmlClass: string,
  attributes = '',
): void => {
  it('announces a pick once, after applying it, and nothing at load or for the same pick', async () => {
    const applied: boolean[] = [];
    const record = (): void => {
      applied.push(document.documentElement.classList.contains(htmlClass));
    };
    document.addEventListener('mdsPrefChange', record);
    try {
      const { root, waitForChanges } = await render(`<${tag} ${attributes}></${tag}>`);
      await waitForChanges();
      expect(applied).toEqual([]);

      const pick = root.shadowRoot!.querySelector<HTMLElement>(item)!;
      pick.click();
      await waitForChanges();
      pick.click();
      await waitForChanges();

      expect(applied).toEqual([true]);
    } finally {
      document.removeEventListener('mdsPrefChange', record);
    }
  });
};
