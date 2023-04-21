import Handlebars, { HelperOptions, SafeString } from 'handlebars'

const ifEquals = (arg1: string, arg2: string, options: HelperOptions) => {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
}

const safeString = (value: string): SafeString => {
  return new Handlebars.SafeString(value)
}

const pixelToRem = (value: string, defaultPixelSize = 16): string => {
  const pixels = Number(value.replace('px', ''))
  return Number((pixels / defaultPixelSize).toFixed(4)).toString() + 'rem'
}

const pixelToEm = (value: string, defaultPixelSize = 16): string => {
  const pixels = Number(value.replace('px', ''))
  return Number((pixels / defaultPixelSize).toFixed(4)).toString() + 'em'
}

const ifTailwindFontSizeProp = (property: string, options: HelperOptions) => {
  switch (property) {
  case 'fontSize': {
    return options.fn(this)
  }
  case 'lineHeight': {
    return options.fn(this)
  }
  case 'letterSpacing': {
    return options.fn(this)
  }
  default: {
    return options.inverse(this)
  }
  }
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

export {
  ifEquals,
  ifTailwindFontSizeProp,
  safeString,
  tailwindFontSize,
}
