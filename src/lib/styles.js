const toDashCase = value =>
  value[0].toLowerCase() + value.slice(1, value.length).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

export const appendSelectors = items =>
  items.filter(value => !!value).join(' ')

export const globalSelectors = items => {
  const selectors = []
  for (const [key, value] of Object.entries(items)) {
    selectors.push(`${toDashCase(key)}-${value}`)
  }
  return appendSelectors(selectors)
}
