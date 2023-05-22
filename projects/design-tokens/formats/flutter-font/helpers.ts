import { HelperOptions } from 'handlebars'

const ifFlutterTextThemeVariant = (property: string, options: HelperOptions) => {
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

const flutterTextThemeVariant = (options: HelperOptions) => {
  const propertyMap = {
    h1: 'displayLarge',
    h2: 'displayMedium',
    h3: 'displaySmall',
    h4: 'headlineLarge',
    h5: 'headlineMedium',
    h6: 'headlineSmall',
    action: 'labelLarge',
    infoDetail: 'bodyMedium',
    infoDetailBold: 'titleMedium',
    infoCaption: 'bodySmall',
    infoCaptionBold: 'titleSmall',
    infoLabel: 'labelMedium',
    infoOption: 'labelSmall',
    readParagraph: 'bodyLarge',
    readParagraphBold: 'titleLarge',
  }

  console.log(options.data.key)

  return 'franco'
}

export {
  ifFlutterTextThemeVariant,
  flutterTextThemeVariant,
}
