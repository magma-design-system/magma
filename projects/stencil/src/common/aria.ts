const hash = (s: string): string => {
  let i: number, h: number
  for (i = 0, h = 0; i < s.length; i ++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0
  }
  return h.toString()
}

const unslugName = (name: string): string => {
  return name.split('/').slice(-1).pop().replace(/-/g, ' ')
}

const setAttributeIfEmpty = (element: HTMLElement, attribute: string, value: string): string => {
  if (element.hasAttribute(attribute)) {
    return element.getAttribute(attribute)
  }
  element.setAttribute(attribute, value)
  return value
}

const hashValue = (value: string): string => `${value}-${hash(value)}`

export {
  unslugName,
  setAttributeIfEmpty,
  hashValue,
}
