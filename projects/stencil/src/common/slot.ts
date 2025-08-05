const hasSlottedElements = (el: HTMLElement, name?: string): boolean => {
  const query = name ? `slot[name="${name}"]` : 'slot:not([name])'

  const slot: HTMLSlotElement = el.shadowRoot?.querySelector(query) as HTMLSlotElement
  if (slot) {
    return slot.assignedElements({ flatten: true }).length > 0
  }
  return false
}

const hasSlottedNodes = (el: HTMLElement, name?: string): boolean => {
  const query = name ? `slot[name="${name}"]` : 'slot:not([name])'

  const slot: HTMLSlotElement = el.shadowRoot?.querySelector(query) as HTMLSlotElement
  if (slot) {
    return slot.assignedNodes().length > 0
  }
  return false
}

const hasSlotted = (el: HTMLElement, name?: string): boolean => {
  const query = name ? `slot[name="${name}"]` : 'slot:not([name])'

  const slot: HTMLSlotElement = el.shadowRoot?.querySelector(query) as HTMLSlotElement
  if (slot) {
    return slot.assignedNodes().length > 0 || slot.assignedElements().length > 0
  }
  return false
}

const hasSlottedContent = (el: HTMLElement, name?: string): boolean => {
  const query = name ? `slot[name="${name}"]` : 'slot:not([name])'
  const slot: HTMLSlotElement = el.shadowRoot?.querySelector(query) as HTMLSlotElement
  if (!slot) return false

  const assignedNodes = slot.assignedNodes({ flatten: true })
  return assignedNodes.some(node =>
    node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '',
  )
}

export {
  hasSlottedElements,
  hasSlottedNodes,
  hasSlottedContent,
  hasSlotted,
}
