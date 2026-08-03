import { MdsTable } from '../mds-table';

class MutationObserverMock {
  observe = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);
}

// mock-doc does not implement MutationObserver
beforeAll(() => {
  Object.defineProperty(globalThis, 'MutationObserver', {
    value: MutationObserverMock,
    writable: true,
  });
});

/**
 * The component is driven directly instead of through `newSpecPage`: the races covered here
 * happen *between* the lifecycle steps, which a spec page always runs in the right order.
 */
const mockComponent = (html: string = ''): { component: MdsTable; host: HTMLElement } => {
  const component = new MdsTable();
  const host = document.createElement('mds-table');
  host.innerHTML = html;
  Object.defineProperty(component, 'host', { value: host, writable: true });
  return { component, host };
};

describe('mds-table', () => {
  // https://github.com/magma-design-system/magma/issues/602
  // With streaming SSR the `interactive`/`selectable` watchers can fire before
  // `componentWillLoad` has assigned the slotted elements.
  describe('watchers fired before componentWillLoad', () => {
    it('onTableInteractive should not throw when slotted elements are not assigned yet', () => {
      const { component } = mockComponent();
      expect(() => component.onTableInteractive()).not.toThrow();
    });

    it('onTableSelectable should not throw when slotted elements are not assigned yet', () => {
      const { component } = mockComponent();
      expect(() => component.onTableSelectable(true)).not.toThrow();
    });

    it('updateSelection and selectAll should not throw when rows are not assigned yet', async () => {
      const { component } = mockComponent();
      Object.defineProperty(component, 'selectable', { value: true });
      await expect(component.updateSelection()).resolves.toBeUndefined();
      await expect(component.selectAll()).resolves.toBeUndefined();
    });
  });

  describe('lifecycle without slotted children', () => {
    it('componentDidLoad should not throw when the children are not parsed yet', () => {
      const { component } = mockComponent();
      component.componentWillLoad();
      expect(() => component.componentDidLoad()).not.toThrow();
    });

    it('disconnectedCallback should not throw before the first render', () => {
      const { component } = mockComponent();
      expect(() => component.disconnectedCallback()).not.toThrow();
    });
  });

  describe('batch actions detection', () => {
    it('should detect a direct child assigned to the batch-action slot', () => {
      const { component } = mockComponent('<mds-button slot="batch-action"></mds-button>');
      component.componentWillLoad();
      expect(component['hasBatchActions']).toBe(true);
    });

    it('should ignore a nested element assigned to the batch-action slot', () => {
      const { component } = mockComponent(
        '<mds-table-body><mds-button slot="batch-action"></mds-button></mds-table-body>',
      );
      component.componentWillLoad();
      expect(component['hasBatchActions']).toBe(false);
    });
  });

  describe('slotted children parsed after the first render', () => {
    it('should apply interactive and selectable once the body arrives', () => {
      const { component, host } = mockComponent();
      Object.defineProperty(component, 'interactive', { value: true });
      Object.defineProperty(component, 'selectable', { value: true });
      component.componentWillLoad();
      component.onTableInteractive();
      component.onTableSelectable(true);

      host.innerHTML =
        '<mds-table-header></mds-table-header><mds-table-body><mds-table-row></mds-table-row></mds-table-body>';
      // what the first `slotchange` triggers
      component['updateSlottedElements']();

      const body = host.querySelector('mds-table-body') as HTMLMdsTableBodyElement;
      const row = host.querySelector('mds-table-row') as HTMLMdsTableRowElement;
      expect(body.interactive).toBe(true);
      expect(row.interactive).toBe(true);
      expect(row.selectable).toBe(true);
      // the late body must be observed, otherwise rows added to it are never tracked
      expect(component['tableBodyObserver']?.observe).toHaveBeenCalledWith(body, {
        childList: true,
      });
    });
  });
});
