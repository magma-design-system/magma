const hash = (s: string): string => {
  let i: number, h: number
  for (i = 0, h = 0; i < s.length; i ++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0
  }
  return h.toString()
}

const randomInt = (max: number): number => Math.floor(Math.random() * max)

const unslugName = (name: string): string => {
  return name.split('/')?.slice(-1).pop()?.replace(/-/g, ' ') ?? name
}

const setAttributeIfEmpty = (element: HTMLElement, attribute: string, value: string): string => {
  if (element.hasAttribute(attribute)) {
    return element.getAttribute(attribute) ?? ''
  }
  element.setAttribute(attribute, value)
  return value
}

const removeAttributesIf = (element: HTMLElement, attribute: string, valueCheck: string = 'true', cleanAttributes: string | string[]): boolean => {
  if (ifAttribute(element, attribute, valueCheck)) {
    const attributesList = Array.isArray(cleanAttributes) ? cleanAttributes : [cleanAttributes]
    attributesList.forEach(attributeToRemove => {
      element.removeAttribute(attributeToRemove)
    })
    return true
  }
  return false
}

const ifAttribute = (element: HTMLElement, attribute: string, valueCheck: string = 'true'): boolean => {
  if (element.hasAttribute(attribute) && element.getAttribute(attribute) === valueCheck) {
    return true
  }
  return false
}

const hashValue = (value: string): string => `${value}-${hash(value)}`

const hashRandomValue = (value?: string): string => {
  const randomValue = randomInt(1000000)
  if (value) {
    return `${value}-${hash(randomValue.toString())}`
  }

  return hash(randomValue.toString())
}

export {
  hashRandomValue,
  hashValue,
  removeAttributesIf,
  setAttributeIfEmpty,
  ifAttribute,
  unslugName,
}
