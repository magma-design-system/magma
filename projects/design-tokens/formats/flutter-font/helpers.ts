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
    'title-h1': 'displayLarge',
    'title-h2': 'displayMedium',
    'title-h3': 'displaySmall',
    'title-h4': 'headlineLarge',
    'title-h5': 'headlineMedium',
    'title-h6': 'headlineSmall',
    'title-action': 'labelLarge',
    'info-detail': 'bodyMedium',
    // 'info-detail-bold': 'titleMedium',
    'info-caption': 'bodySmall',
    // 'info-caption-bold': 'titleSmall',
    'info-label': 'labelMedium',
    'info-option': 'labelSmall',
    'read-paragraph': 'bodyLarge',
    // 'read-paragraph-bold': 'titleLarge',
  }

  console.log(options.fn(this))
  // propertyMap[options.data.key]
  return ''
}

export {
  ifFlutterTextThemeVariant,
  flutterTextThemeVariant,
}
