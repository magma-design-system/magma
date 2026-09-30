import { KeyboardManager } from '@common/keyboard-manager';

describe('KeyboardManager', () => {
  const pressEscape = (): void => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));
  };

  it('takes off window the very listener it put on it', () => {
    const km = new KeyboardManager();
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');

    km.attachEscapeBehavior(() => undefined);
    km.detachEscapeBehavior();

    // the removal used to bind again, naming a listener window had never been given: the one
    // it had stayed on for the whole life of the page, one per component ever loaded
    expect(remove).toHaveBeenCalledWith('keydown', add.mock.calls[0][1]);
  });

  it('answers Escape once however many times it was attached', () => {
    const km = new KeyboardManager();
    const callback = vi.fn();

    // a dropdown attaches again at every change of its target
    km.attachEscapeBehavior(callback);
    km.attachEscapeBehavior(callback);
    pressEscape();
    km.detachEscapeBehavior();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('stops answering Escape once it is detached', () => {
    const km = new KeyboardManager();
    const callback = vi.fn();

    km.attachEscapeBehavior(callback);
    km.detachEscapeBehavior();
    pressEscape();

    expect(callback).not.toHaveBeenCalled();
  });
});
