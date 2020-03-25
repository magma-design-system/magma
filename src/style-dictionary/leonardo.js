import { generateAdaptiveTheme } from '@adobe/leonardo-contrast-colors'

const ratios = [
  1.05,
  1.10,
  1.21,
  1.36,
  1.58,
  1.87,
  2.24,
  2.71,
  3.28,
  3.97,
  4.79,
  5.74,
  6.85,
  8.11,
  9.54,
  12.45,
]
const colorspace = 'HSL'
const baseScale = '#ffffff'
const brightness = 97
const colorScales = []

const addAdaptivePalette = (name, color) => {
  const colorKeys = typeof color === 'string' ? [color] : color
  colorScales.push(
    {
      name,
      colorKeys,
      colorspace,
      ratios,
    },
  )
}

addAdaptivePalette('brand-maggioli', '#0559a3')
addAdaptivePalette('status-success', '#21bf73')
addAdaptivePalette('status-error', '#ED6663')
addAdaptivePalette('status-warning', '#ffc272')
addAdaptivePalette('tone', '#888888')

let theme = generateAdaptiveTheme({
  colorScales,
  baseScale,
  brightness,
})

console.log(theme)
