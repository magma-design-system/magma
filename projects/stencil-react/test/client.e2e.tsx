import { MdsButton, MdsInput, MdsNote } from '@maggioli-design-system/magma-react';
import { MdsButton as MdsButtonServer } from '@maggioli-design-system/magma-react/mds-button.server.js';
import { cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

// the first element matching `tag`, once Stencil has rendered it: the custom elements build has no
// componentOnReady(), the host gets the `hydrated` attribute (hydratedFlag) after its first render
const hydrated = async <T extends HTMLElement>(container: HTMLElement, tag: string): Promise<T> => {
  const element = container.querySelector<T>(tag);
  if (!element) throw new Error(`${tag} not rendered`);
  await vi.waitFor(() => expect(element.hasAttribute('hydrated')).toBe(true));
  return element;
};

// vitest runs without globals, so Testing Library cannot register its own cleanup
afterEach(cleanup);

describe('client wrappers', () => {
  describe('props', () => {
    it('sets the React props on the properties of the hydrated element', async () => {
      const { container } = render(<MdsButton label="Salva" iconPosition="right" disabled />);
      const button = await hydrated<HTMLMdsButtonElement>(container, 'mds-button');

      expect(button.shadowRoot).not.toBeNull();
      expect(button.label).toBe('Salva');
      expect(button.iconPosition).toBe('right');
      expect(button.disabled).toBe(true);
    });

    it('updates the properties on re-render and resets the removed ones', async () => {
      const { container, rerender } = render(
        <MdsButton label="Salva" iconPosition="right" disabled />,
      );
      const button = await hydrated<HTMLMdsButtonElement>(container, 'mds-button');

      rerender(<MdsButton label="Invia" iconPosition="left" />);

      expect(button.label).toBe('Invia');
      expect(button.iconPosition).toBe('left');
      expect(button.disabled).toBeUndefined();
    });
  });

  describe('events', () => {
    it('passes the custom event emitted by the element to the React handler', async () => {
      const onChange = vi.fn();
      const { container } = render(<MdsInput onMdsInputChange={onChange} />);
      const input = await hydrated<HTMLMdsInputElement>(container, 'mds-input');

      await userEvent.type(await input.getInputElement(), 'ciao');

      expect(onChange).toHaveBeenCalled();
      const event = onChange.mock.lastCall![0] as CustomEvent<{ value: string }>;
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.type).toBe('mdsInputChange');
      expect(event.target).toBe(input);
      expect(event.detail).toEqual({ value: 'ciao' });
    });

    it('calls only the latest handler after a re-render swaps it', async () => {
      const first = vi.fn();
      const second = vi.fn();
      const { container, rerender } = render(<MdsInput onMdsInputChange={first} />);
      const input = await hydrated<HTMLMdsInputElement>(container, 'mds-input');

      rerender(<MdsInput onMdsInputChange={second} />);
      input.dispatchEvent(new CustomEvent('mdsInputChange', { detail: { value: 'x' } }));

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledOnce();
    });

    it('detaches the listener when the handler prop is removed', async () => {
      const onChange = vi.fn();
      const { container, rerender } = render(<MdsInput onMdsInputChange={onChange} />);
      const input = await hydrated<HTMLMdsInputElement>(container, 'mds-input');

      rerender(<MdsInput />);
      input.dispatchEvent(new CustomEvent('mdsInputChange', { detail: { value: 'x' } }));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('ref', () => {
    it('resolves to the custom element and exposes its public methods', async () => {
      const ref = createRef<HTMLMdsInputElement>();
      const { container } = render(<MdsInput ref={ref} value="ciao" />);
      const input = await hydrated<HTMLMdsInputElement>(container, 'mds-input');

      expect(ref.current).toBe(input);

      const native = await ref.current!.getInputElement();
      expect(input.shadowRoot!.contains(native)).toBe(true);
      expect(native.value).toBe('ciao');

      await ref.current!.setFocus();
      expect(input.shadowRoot!.activeElement).toBe(native);
    });
  });

  describe('children', () => {
    it('renders the children in the light DOM and projects them into their slots', async () => {
      const { container } = render(
        <MdsNote>
          <strong slot="title">Titolo</strong>
          <span>Contenuto</span>
        </MdsNote>,
      );
      const note = await hydrated<HTMLMdsNoteElement>(container, 'mds-note');
      const title = note.querySelector('strong')!;
      const content = note.querySelector('span')!;

      expect(title.parentElement).toBe(note);
      expect(content.parentElement).toBe(note);
      expect(title.assignedSlot?.name).toBe('title');
      expect(content.assignedSlot).not.toBeNull();
      expect(content.assignedSlot!.name).toBe('');
    });
  });

  describe('server wrappers', () => {
    it('delegate to the client wrapper in the browser', async () => {
      expect(MdsButtonServer).toBe(MdsButton);

      const { container } = render(<MdsButtonServer label="Salva" iconPosition="right" />);
      const button = await hydrated<HTMLMdsButtonElement>(container, 'mds-button');

      expect(button.label).toBe('Salva');
      expect(button.iconPosition).toBe('right');
    });
  });
});
