let element: HTMLElement

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

export {
  addKeyboardListener,
  removeKeyboardListener,
}
