const hasSlottedElements = (el: HTMLElement, name?: string): boolean => {
  let query = 'slot'
  if (name) {
    query = `slot[name=${name}]`
  }
  const slot: HTMLSlotElement = el.shadowRoot?.querySelector(query) as HTMLSlotElement
  if (slot) {
    return slot.assignedNodes().length > 0
  }
  throw Error(`Slot ${query} does not exists on component ${el.tagName}`)
}

export {
  hasSlottedElements,
}
