import { render } from 'mustache'

type LocaleConfig = {
  el?: Record<string, string | string[]>
  en: Record<string, string | string[]>
  es?: Record<string, string | string[]>
  it?: Record<string, string | string[]>
}

export class Locale {
  rollbackLanguage: string = 'en'
  language: string
  config: LocaleConfig
  closestElement:HTMLElement
  element: HTMLElement

  constructor (configData?: LocaleConfig) {
    if (configData) {
      this.set(configData)
    }
  }

  set = (configData: LocaleConfig): void => {
    this.config = configData
  }

  lang = (el: HTMLElement): string => {
    this.element = el
    this.closestElement = this.element.closest('[lang]') as HTMLElement

    if (this.closestElement) {
      if (this.closestElement.lang) {
        this.language = this.closestElement.lang
        return this.language
      }
    }

    this.language = this.rollbackLanguage
    return this.language
  }

  update = (doc?: Document | ShadowRoot): void => {
    const context = doc ?? this.element.shadowRoot
    context && context.querySelectorAll('*').forEach(el => {
      if (el.tagName.toLowerCase().startsWith('mds-')) {
        // eslint-disable-next-line no-restricted-syntax
        if (el && 'updateLang' in el) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (el as any).updateLang()
        }
      }
    })
  }

  private pluralize = (tag: string | string[], context: Record<string, string | number>): string => {

    const languagePhrase: string | string[] = this.config[this.language] ? this.config[this.language][tag] : this.config[this.rollbackLanguage][tag]
    const phrases: string[] = []

    if (Array.isArray(languagePhrase)) {
      phrases.push(languagePhrase[0])
      phrases.push(languagePhrase[1])
    } else {
      phrases.push(languagePhrase)
      phrases.push(languagePhrase)
    }

    const [ defaultPhrase ] = phrases
    let translatePhrase: string = defaultPhrase

    const keys = Object.keys(context)
    if (keys.length > 0) {
      const [firstKey] = keys
      if (typeof context[firstKey] === 'number') {
        if (context[firstKey] !== 1) {
          translatePhrase = phrases[1]
        }
      }
    }

    return render(translatePhrase, context)
  }

  get = (tag: string | string[], context?: Record<string, string | number>): string => {
    if (context) {
      return this.pluralize(tag, context)
    }
    return this.config[this.language] ? this.config[this.language][tag] : this.config[this.rollbackLanguage][tag]
  }
}
