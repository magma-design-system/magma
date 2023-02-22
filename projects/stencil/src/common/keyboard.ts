let element: HTMLElement
let escapeCallback: any

const handleButtonClickDispatchEvent = (event: KeyboardEvent): void => {
  if (event.code === 'Space' || event.code === 'Enter' || event.code === 'NumpadEnter') {
    element.click()
  }
}

const addKeyboardListener = (el: HTMLElement): void => {
  element = el
  element.addEventListener('keydown', handleButtonClickDispatchEvent.bind(this))
}

const removeKeyboardListener = (el: HTMLElement): void => {
  element = el
  element.removeEventListener('keydown', handleButtonClickDispatchEvent.bind(this))
}

const handleEscapeDispatchEvent = (event: KeyboardEvent): void => {
  if (event.code === 'Escape' && escapeCallback) {
    escapeCallback()
  }
}

const addKeyboardEscapeListener = (callBack: any): void => {
  escapeCallback = callBack
  window.addEventListener('keydown', handleEscapeDispatchEvent.bind(this))
}

const removeKeyboardEscapeListener = (): void => {
  escapeCallback = null
  window.removeEventListener('keydown', handleEscapeDispatchEvent.bind(this))
}

export {
  addKeyboardListener,
  removeKeyboardListener,
  addKeyboardEscapeListener,
  removeKeyboardEscapeListener,
}
