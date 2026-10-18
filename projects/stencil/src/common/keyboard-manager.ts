export interface ClickBehaviorOptions {
  /** Space clicks too, as on a native button: what an element with `role="button"` promises. */
  space?: boolean;
}

export class KeyboardManager {
  private escapeCallback: () => void;
  private elements = new Map<string, HTMLElement>();
  private spacePressed?: EventTarget | null;

  private handleClickBehaviorDispatchEvent = (event: KeyboardEvent): void => {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      (event.target as HTMLElement).click();
    }
  };

  // Space clicks on release, as on a native button: the press only keeps the page from
  // scrolling. A key pressed in something inside the element (a field in a slot types its
  // space) is not the element's, and a release whose press landed elsewhere clicks nothing.
  private handleSpaceDown = (event: KeyboardEvent): void => {
    if (event.code !== 'Space' || event.target !== event.currentTarget) return;
    event.preventDefault();
    this.spacePressed = event.target;
  };

  private handleSpaceUp = (event: KeyboardEvent): void => {
    if (event.code !== 'Space') return;
    const pressed = this.spacePressed !== undefined && this.spacePressed === event.target;
    this.spacePressed = undefined;
    if (pressed && event.target === event.currentTarget) (event.target as HTMLElement).click();
  };

  private handleEscapeBehaviorDispatchEvent = (event: KeyboardEvent): void => {
    if (event.code === 'Escape' && this.escapeCallback) {
      this.escapeCallback();
    }
  };

  addElement = (el: HTMLElement, name = 'element'): void => {
    if (!el) {
      throw Error(`Passed an ${el} element parameter to KeyboardManager.addElement`);
    }
    this.elements.set(name, el);
  };

  removeElement = (name: string = 'element'): void => {
    this.detachClickBehavior(name);
    this.elements.delete(name);
  };

  attachClickBehavior = (name = 'element', options: ClickBehaviorOptions = {}): void => {
    this.detachClickBehavior(name);
    const element = this.elements.get(name);
    element?.addEventListener('keydown', this.handleClickBehaviorDispatchEvent);
    if (options.space) {
      element?.addEventListener('keydown', this.handleSpaceDown);
      element?.addEventListener('keyup', this.handleSpaceUp);
    }
  };

  detachClickBehavior = (name = 'element'): void => {
    const element = this.elements.get(name);
    element?.removeEventListener('keydown', this.handleClickBehaviorDispatchEvent);
    element?.removeEventListener('keydown', this.handleSpaceDown);
    element?.removeEventListener('keyup', this.handleSpaceUp);
  };

  // the handler goes on and comes off window by the same reference: `bind` writes a new function
  // every time it is evaluated, so a removal that binds again names a listener window was never
  // given, and attaching twice used to leave two of them behind
  attachEscapeBehavior = (callback: () => void): void => {
    this.escapeCallback = callback;
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleEscapeBehaviorDispatchEvent);
    }
  };

  detachEscapeBehavior = (): void => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleEscapeBehaviorDispatchEvent);
    }
  };
}
