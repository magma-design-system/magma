import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';
import { hydrate, renderToString, reveal } from '@test/ssr';

const tableWithActions =
  '<mds-table><mds-table-body><mds-table-row><mds-table-cell>Cell</mds-table-cell>' +
  '<mds-button slot="action" label="Edit"></mds-button></mds-table-row></mds-table-body></mds-table>';

const queryActionParts = (row: HTMLElement): { actions: HTMLElement; sizer: HTMLElement } => ({
  actions: row.shadowRoot!.querySelector('.actions') as HTMLElement,
  sizer: row.shadowRoot!.querySelector('.actions-sizer') as HTMLElement,
});

/**
 * The actions are measured: the sizer reserves their width in the row, and their margin makes up
 * for the translateX(100%) that otherwise pushes them out of the row's right edge.
 */
const expectActionsMeasured = async (row: HTMLElement): Promise<void> => {
  const { actions, sizer } = queryActionParts(row);
  const actionsWidth = actions.getBoundingClientRect().width;

  expect(actionsWidth).toBeGreaterThan(0);
  await expect.poll(() => sizer.getBoundingClientRect().width).toBeCloseTo(actionsWidth, 1);
  expect(actions.getBoundingClientRect().right).toBeLessThanOrEqual(
    row.getBoundingClientRect().right,
  );
};

describe('mds-table-row', () => {
  it('renders', async () => {
    const { root } = await render(
      '<mds-table-row><mds-table-cell>Cell</mds-table-cell></mds-table-row>',
    );

    expect(root).toHaveAttribute('hydrated');
    expect(root).toHaveAttribute('role', 'row');
  });

  describeConditionalSlot({
    html: '<mds-table-row><mds-table-cell>Cell</mds-table-cell></mds-table-row>',
    slot: 'action',
    region: '.actions-cell',
  });

  describe('actions width', () => {
    it('measures the actions of a row rendered on the client', async () => {
      const { root } = await render(tableWithActions);

      await expectActionsMeasured(root.querySelector('mds-table-row')!);
    });

    it('measures the actions again when the row is moved out of a hidden container', async () => {
      const { root } = await render(tableWithActions, {
        clearStage: true,
        stageAttrs: { hidden: '' },
      });

      reveal(root.parentElement!);

      await expectActionsMeasured(root.querySelector('mds-table-row')!);
    });
  });

  describe('server-side rendering', () => {
    it('leaves the width-dependent styles out of the server markup', async () => {
      const markup = await renderToString(tableWithActions);
      const stage = document.createElement('div');
      stage.setHTMLUnsafe(markup);
      const { actions, sizer } = queryActionParts(stage.querySelector('mds-table-row')!);

      // the server cannot measure: `calc(undefined + ...)` is invalid and drops the margin
      expect(actions.getAttribute('style') ?? '').not.toContain('undefined');
      expect(sizer.style.minWidth).toBe('');
      expect(sizer.style.maxWidth).toBe('');
    });

    it('measures the actions once the server markup is hydrated', async () => {
      const stage = await hydrate(await renderToString(tableWithActions));

      await expectActionsMeasured(stage.querySelector('mds-table-row')!);
    });

    // React streaming SSR (Next.js): a Suspense boundary is parsed into a hidden container,
    // hydrated there by the components already defined, then moved into place
    it('measures the actions of a row hydrated in a streamed boundary once it is revealed', async () => {
      const hidden = await hydrate(await renderToString(tableWithActions), { hidden: true });

      const stage = reveal(hidden);

      await expectActionsMeasured(stage.querySelector('mds-table-row')!);
    });
  });
});
