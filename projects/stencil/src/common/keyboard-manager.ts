export class KeyboardManager {
  private escapeCallback: () => void
  private elements = []

  private handleClickBehaviorDispatchEvent = (event: KeyboardEvent): void => {
    if (event.code === 'Space' || event.code === 'Enter' || event.code === 'NumpadEnter') {
      (event.target as HTMLElement).click()
    }
  }

  private handleEscapeBehaviorDispatchEvent = (event: KeyboardEvent): void => {
    if (event.code === 'Escape' && this.escapeCallback) {
      this.escapeCallback()
    }
  }

  addElement = (el: HTMLElement, name = 'element'): void => {
    this.elements[name] = el
  }

  attachClickBehavior = (name = 'element'): void => {
    this.elements[name].addEventListener('keydown', this.handleClickBehaviorDispatchEvent)
  }

  detachClickBehavior = (name = 'element'): void => {
    this.elements[name].removeEventListener('keydown', this.handleClickBehaviorDispatchEvent)
  }

  attachEscapeBehavior = (callBack: () => void): void => {
    this.escapeCallback = callBack
    if (typeof window !== undefined) {
      window.addEventListener('keydown', this.handleEscapeBehaviorDispatchEvent.bind(this))
    }
  }

  detachEscapeBehavior = (): void => {
    this.escapeCallback = null
    if (typeof window !== undefined) {
      window.removeEventListener('keydown', this.handleEscapeBehaviorDispatchEvent.bind(this))
    }
  }
}
