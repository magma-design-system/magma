import Handlebars from 'handlebars'

type LocaleConfig = {
  it?: Record<string, string | string[]>
  en?: Record<string, string | string[]>
  el?: Record<string, string | string[]>
}

export class Locale {
  rollbackLanguage: string = 'en'
  language: string
  config: LocaleConfig
  closestElement:HTMLElement

  constructor (configData: LocaleConfig) {
    this.config = configData
  }

  lang = (element: HTMLElement): void => {
    this.closestElement = element.closest('[lang]') as HTMLElement

    
    if (this.closestElement) {
      if (this.closestElement.lang) {
        this.language = this.closestElement.lang
        return
      }
    }

    this.language = this.rollbackLanguage
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

    const template = Handlebars.compile(translatePhrase)
    return template(context)
  }

  get = (tag: string | string[], context?: Record<string, string | number>): string => {
    if (context) {
      return this.pluralize(tag, context)
    }
    return this.config[this.language] ? this.config[this.language][tag] : this.config[this.rollbackLanguage][tag]
  }
}
