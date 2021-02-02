import config from '+Tokens/css-tokens/config.json'

const toDashCase = value =>
  value[0].toLowerCase() + value.slice(1, value.length).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

export const componentSelectors = items =>
  items.filter(value => !!value).join(' ')

const selectorName = key => {
  let selector = ''
  config.scaffold.properties.forEach(element => {
    if (element.indexOf(toDashCase(key)) > -1) {
      if (element.split(':')[1] === toDashCase(key)) {
        selector = element.split(':')[0]
      }
    }
  })
  return selector
}

export const scaffoldedSelectors = items => {
  const selectors = []
  for (const [key, value] of Object.entries(items)) {
    if (value) {
      selectors.push(`${selectorName(key)}-${value}`)
    }
  }
  return componentSelectors(selectors)
}

export const modifierSelectors = (block, modifiers) => {
  const selectors = []
  for (const [modifier, variant] of Object.entries(modifiers)) {
    if (variant) {
      if (typeof variant === 'boolean') {
        selectors.push(`${block}--${toDashCase(modifier)}`)
      } else {
        selectors.push(`${block}--${toDashCase(modifier)}-${variant}`)
      }
    }
  }
  return componentSelectors(selectors)
}

export const styles = (block, selectors) => {
  return componentSelectors([
    block,
    selectors.selectors ? componentSelectors(selectors.selectors) : null,
    selectors.modifiers ? modifierSelectors(block, selectors.modifiers) : null,
    selectors.scaffolded ? scaffoldedSelectors(selectors.scaffolded) : null,
  ])
}
