import { createColorTokens, formatColortoTokens } from '../src/lib/color'
import baseColorResult from './fixtures/base-color-result.json'
import baseColor from './fixtures/base-color.json'
import baseColorExport from './fixtures/base-color-export.json'
import baseColorExportResult from './fixtures/base-color-export-result.json'
import { ContrastColor } from '@adobe/leonardo-contrast-colors'

describe('Colors generated', () => {
  it('should create tokens', () => {
    const result = createColorTokens(baseColor.colors)
    expect(result.tokens).toEqual(baseColorResult)
    expect(result.exportGroups).toEqual({ default: baseColorResult })
  })
  it('should create tokens with different export', () => {
    const result = createColorTokens(baseColorExport.colors)
    expect(result.tokens).toEqual(baseColorResult)
    expect(result.exportGroups).toEqual(baseColorExportResult)
  })
  it('should create tokens with no export', () => {
    const color = {
      colors: [
        { color: '#00379E', name: 'variant.primary' },
        { color: '#0f4ad5', name: 'variant.secondary' },
      ],
    }
    const result = createColorTokens(color.colors)
    expect(result.tokens).toEqual(baseColorResult)
    expect(result.exportGroups).toEqual({})
  })
  it('should format color', () => {
    const { contrastColorsLight, contrastColorsDark, formatColortoTokensResultLight, formatColortoTokensResultDark } = getDataForFormatColor()
    const name = 'variant.primary'
    const color = '#00379E'
    const tokensLight = formatColortoTokens(contrastColorsLight, name, color)
    const tokensDark = formatColortoTokens(contrastColorsDark, name, color)
    expect(tokensLight).toEqual(formatColortoTokensResultLight)
    expect(tokensDark).toEqual(formatColortoTokensResultDark)
  })
  it('should format color with seed', () => {
    const { contrastColorsLight, contrastColorsDark, formatColortoTokensResultLight, formatColortoTokensResultDark } = getDataForFormatColor()
    const name = 'variant.primary'
    const color = '#00379E'
    const seed = { light: '#FFFFFF', dark: '#000000' }
    const tokensLight = formatColortoTokens(contrastColorsLight, name, color, seed, 'light')
    const tokensDark = formatColortoTokens(contrastColorsDark, name, color, seed, 'dark')

    // color value should be the seed color
    expect(tokensLight).toEqual({ ...formatColortoTokensResultLight, color: { value: seed.light } })
    expect(tokensDark).toEqual({ ...formatColortoTokensResultDark, color: { value: seed.dark } })
  })

})

function getDataForFormatColor () {
  const contrastColorsLight: ContrastColor[] = [
    {
      name: 'variant.primary',
      values: [
        { name: 'variant.primary100', contrast: 1.09, value: '#eef4ff' },
        { name: 'variant.primary200', contrast: 1.22, value: '#dde9ff' },
        { name: 'variant.primary300', contrast: 1.42, value: '#c5d9ff' },
        { name: 'variant.primary400', contrast: 1.82, value: '#a0c1ff' },
        { name: 'variant.primary500', contrast: 3.29, value: '#4c8aff' },
        { name: 'variant.primary600', contrast: 5.13, value: '#0a5fff' },
        { name: 'variant.primary700', contrast: 6.71, value: '#004ddf' },
        { name: 'variant.primary800', contrast: 8.45, value: '#0041bc' },
        { name: 'variant.primary900', contrast: 10.29, value: '#00379e' },
        { name: 'variant.primary1000', contrast: 17.22, value: '#001846' },
      ],
    },
    {
      name: 'variant.secondary',
      values: [
        { name: 'variant.secondary100', contrast: 1.09, value: '#f1f5fe' },
        { name: 'variant.secondary200', contrast: 1.22, value: '#e0e9fd' },
        { name: 'variant.secondary300', contrast: 1.42, value: '#cad9fb' },
        { name: 'variant.secondary400', contrast: 1.82, value: '#a7bff9' },
        { name: 'variant.secondary500', contrast: 3.29, value: '#5c89f4' },
        { name: 'variant.secondary600', contrast: 5.13, value: '#2662f0' },
        { name: 'variant.secondary700', contrast: 6.71, value: '#104ddd' },
        { name: 'variant.secondary800', contrast: 8.45, value: '#0d41ba' },
        { name: 'variant.secondary900', contrast: 10.29, value: '#0b369d' },
        { name: 'variant.secondary1000', contrast: 17.22, value: '#051744' },
      ],
    },
  ]
  const formatColortoTokensResultLight = {
    1: {
      value: '#001846',
    },
    2: {
      value: '#00379e',
    },
    3: {
      value: '#0041bc',
    },
    4: {
      value: '#004ddf',
    },
    5: {
      value: '#0a5fff',
    },
    6: {
      value: '#4c8aff',
    },
    7: {
      value: '#a0c1ff',
    },
    8: {
      value: '#c5d9ff',
    },
    9: {
      value: '#dde9ff',
    },
    10: {
      value: '#eef4ff',
    },
    color: {
      value: '#00379E',
    },
  }
  const contrastColorsDark: ContrastColor[] = [
    {
      name: 'variant.primary',
      values: [
        { name: 'variant.primary100', contrast: 1.09, value: '#000e28' },
        { name: 'variant.primary200', contrast: 1.22, value: '#001846' },
        { name: 'variant.primary300', contrast: 1.42, value: '#002364' },
        { name: 'variant.primary400', contrast: 1.82, value: '#00318d' },
        { name: 'variant.primary500', contrast: 3.29, value: '#0050e6' },
        { name: 'variant.primary600', contrast: 5.13, value: '#2c76ff' },
        { name: 'variant.primary700', contrast: 6.71, value: '#528eff' },
        { name: 'variant.primary800', contrast: 8.45, value: '#73a3ff' },
        { name: 'variant.primary900', contrast: 10.29, value: '#8fb6ff' },
        { name: 'variant.primary1000', contrast: 17.22, value: '#dee9ff' },
      ],
    },
    {
      name: 'variant.secondary',
      values: [
        { name: 'variant.secondary100', contrast: 1.09, value: '#030d26' },
        { name: 'variant.secondary200', contrast: 1.22, value: '#051845' },
        { name: 'variant.secondary300', contrast: 1.42, value: '#072263' },
        { name: 'variant.secondary400', contrast: 1.82, value: '#0a318c' },
        { name: 'variant.secondary500', contrast: 3.29, value: '#1050e5' },
        { name: 'variant.secondary600', contrast: 5.13, value: '#4276f2' },
        { name: 'variant.secondary700', contrast: 6.71, value: '#638ef4' },
        { name: 'variant.secondary800', contrast: 8.45, value: '#7fa2f6' },
        { name: 'variant.secondary900', contrast: 10.29, value: '#98b5f8' },
        { name: 'variant.secondary1000', contrast: 17.22, value: '#e0e9fd' },
      ],
    },
  ]
  const formatColortoTokensResultDark = {
    1: {
      value: '#dee9ff',
    },
    2: {
      value: '#8fb6ff',
    },
    3: {
      value: '#73a3ff',
    },
    4: {
      value: '#528eff',
    },
    5: {
      value: '#2c76ff',
    },
    6: {
      value: '#0050e6',
    },
    7: {
      value: '#00318d',
    },
    8: {
      value: '#002364',
    },
    9: {
      value: '#001846',
    },
    10: {
      value: '#000e28',
    },
    color: {
      value: '#00379E',
    },
  }

  return { contrastColorsLight, contrastColorsDark, formatColortoTokensResultLight, formatColortoTokensResultDark }
}
