export class KeyboardManager {
  private escapeCallback: () => void;
  private elements = new Map<string, HTMLElement>();

  private handleClickBehaviorDispatchEvent = (event: KeyboardEvent): void => {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      (event.target as HTMLElement).click();
    }
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

  attachClickBehavior = (name = 'element'): void => {
    this.elements.get(name)?.removeEventListener('keydown', this.handleClickBehaviorDispatchEvent);
    this.elements.get(name)?.addEventListener('keydown', this.handleClickBehaviorDispatchEvent);
  };

  detachClickBehavior = (name = 'element'): void => {
    this.elements.get(name)?.removeEventListener('keydown', this.handleClickBehaviorDispatchEvent);
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
