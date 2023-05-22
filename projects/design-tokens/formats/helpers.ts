import Handlebars, { HelperOptions, SafeString } from 'handlebars'
import hexRgb from 'hex-rgb'

const humanCase = (separator = '-', options: HelperOptions) => {
  if (typeof options.fn(this) !== 'string') {
    return options.fn(this)
  }
  const value = options.fn(this)
  const arr = value.split(separator)

  for (let i = 0; i < arr.length; i ++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
  }

  return arr.join(' ')
}

const firstArrayElement = (value: string) => {
  if (Array.isArray(value)) return value[0]
  return new Handlebars.SafeString((value.replace(/"|'/g, '').split(',')[0]))
}

const pascalCase = (options: HelperOptions) => {
  if (typeof options.fn(this) !== 'string') {
    return options.fn(this)
  }
  const value = options.fn(this)
  const arr = value.split('-')

  for (let i = 0; i < arr.length; i ++) {
    if (i === 0) {
      arr[i] = arr[i].charAt(0).toLowerCase() + arr[i].slice(1)
    } else {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
    }
  }

  return arr.join('')
}

const rgbChannel = (value: string) => {
  const color = hexRgb(value)
  return `${color.red}, ${color.green}, ${color.blue}`
}

const leadZero = (value: string) => {
  return Number(value) < 10 ? `0${value}` : value
}

const ifEquals = (valueA: string, valueB: string, options: HelperOptions) => {
  return (valueA === valueB) ? options.fn(this) : options.inverse(this)
}

const safeString = (value: string): SafeString => {
  return new Handlebars.SafeString(value)
}

const stripText = (value: string, stripReplacer: string): string => {
  return value.replace(stripReplacer, '')
}

const pixelToRem = (value: string, defaultPixelSize = 16): string => {
  const pixels = Number(value.replace('px', ''))
  return Number((pixels / defaultPixelSize).toFixed(4)).toString() + 'rem'
}

const pixelToEm = (value: string, defaultPixelSize = 16): string => {
  const pixels = Number(value.replace('px', ''))
  return Number((pixels / defaultPixelSize).toFixed(4)).toString() + 'em'
}

const pixelToScale = (valueA: string, valueB: string): string => {
  const valueNumberA = Number(valueA.replace('px', ''))
  const valueNumberB = Number(valueB.replace('px', ''))
  return Number((valueNumberA / valueNumberB).toFixed(4)).toString()
}

const ifTailwindFontSizeProp = (property: string, options: HelperOptions) => {
  const attributes = [
    'fontSize',
    'letterSpacing',
    'lineHeight',
  ]
  return attributes.includes(property) ? options.fn(this) : options.inverse(this)
}

const tailwindFontSize = (property: string, value: string): string => {
  switch (property) {
  case 'fontSize': {
    return pixelToRem(value)
  }
  case 'lineHeight': {
    return pixelToRem(value)
  }
  case 'letterSpacing': {
    return pixelToEm(value)
  }
  default: {
    return value
  }
  }
}

const ifDartTextStyleProp = (property: string, options: HelperOptions) => {
  const attributes = [
    'fontFamily',
    'fontFamilyFallback',
    'fontSize',
    'letterSpacing',
    'lineHeight',
    'fontWeight',
  ]
  return attributes.includes(property) ? options.fn(this) : options.inverse(this)
}

export {
  firstArrayElement,
  humanCase,
  ifDartTextStyleProp,
  ifEquals,
  ifTailwindFontSizeProp,
  leadZero,
  pascalCase,
  pixelToScale,
  rgbChannel,
  safeString,
  stripText,
  tailwindFontSize,
}
