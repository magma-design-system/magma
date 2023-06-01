import { HelperOptions } from 'handlebars'

const magmaToFlutterMap = new Map<string, string>([
  ['title-h1', 'displayLarge'],
  ['title-h2', 'displayMedium'],
  ['title-h3', 'displaySmall'],
  ['title-h4', 'headlineLarge'],
  ['title-h5', 'headlineMedium'],
  ['title-h6', 'headlineSmall'],
  ['title-action', 'labelLarge'],
  ['info-detail', 'bodyMedium'],
  ['info-detail-bold', 'titleMedium'],
  ['info-caption', 'bodySmall'],
  ['info-caption-bold', 'titleSmall'],
  ['info-label', 'labelMedium'],
  ['info-option', 'labelSmall'],
  ['read-paragraph', 'bodyLarge'],
  ['read-paragraph-bold', 'titleLarge'],
])

const ifFlutterCompatible = (...args: unknown[]) => {
  // l'ultimo argomento passato alla funzione e' sempre options
  const options = args.pop() as HelperOptions
  const magmaFont = args.toString().replace( /,/g, '-' )
  return magmaToFlutterMap.has(magmaFont) ? options.fn(this) : options.inverse(this)
}

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

const flutterTextThemeVariant = (...args: unknown[]) => {
  // l'ultimo argomento passato alla funzione e' sempre options
  // e non viene utilizzato in questa funzione cosi lo si toglie da args
  args.pop()
  const magmaFont = args.toString().replace( /,/g, '-' )
  return magmaToFlutterMap.get(magmaFont)
}

export {
  ifFlutterCompatible,
  ifFlutterTextThemeVariant,
  flutterTextThemeVariant,
}
