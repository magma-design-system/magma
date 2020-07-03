import { generateAdaptiveTheme, generateContrastColors } from '@adobe/leonardo-contrast-colors'

const colors = [
  { color: '#0559a3', name: 'brand-maggioli' },
  { color: '#21bf73', name: 'status-success' },
  { color: '#ED6663', name: 'status-error' },
  { color: '#ffc272', name: 'status-warning' },
  { color: '#888888', name: 'tone' },
]

const ratios = [
  1.05,
  1.15,
  1.26,
  1.4,
  1.6,
  1.9,
  2.25,
  2.7,
  3.3,
  4,
  4.8,
  5.75,
  7,
  8.5,
  10.3,
  12.45,
]
const colorspace = 'HSL'
const base = '#ffffff'
const baseScale = 'tone'
const brightness = 97

const addAdaptivePalette = (color, name) => {
  const colorKeys = typeof color === 'string' ? [color] : color
  return {
    name,
    colorKeys,
    colorspace,
    ratios,
  }
}

const addAdaptiveColor = (color, name) => {
  const colorKeys = typeof color === 'string' ? [color] : color
  return generateContrastColors(
    {
      name,
      colorKeys,
      base,
      ratios,
      colorspace,
    },
  )
}

const colorScales = colors.map(item => addAdaptivePalette(item.color, item.name))

if (colorScales.length > 0) {
  const theme = generateAdaptiveTheme({
    colorScales,
    baseScale,
    brightness,
  })
  console.log(theme)
}
