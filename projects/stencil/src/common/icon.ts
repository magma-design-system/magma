const BASE64_SVG_ICON = 'data:image/svg+xml;base64,'
const MARKUP_SVG_ICON = '<svg '

const isIconFormatIsBase64 = (icon?: string): boolean => {
  if (!icon) {
    return false
  }
  return icon.startsWith(BASE64_SVG_ICON)
}

const isIconFormatIsSVG = (icon?: string): boolean => {
  if (!icon) {
    return false
  }
  return icon.startsWith(MARKUP_SVG_ICON)
}



export {
  isIconFormatIsBase64,
  isIconFormatIsSVG,
  BASE64_SVG_ICON,
  MARKUP_SVG_ICON,
}
