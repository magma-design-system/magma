type LocaleConfig = {
  it?: Record<string, string>
  en?: Record<string, string>
  gr?: Record<string, string>
}

export class Locale {
  defaultLanguage: string = 'en'
  language: string
  config: LocaleConfig

  constructor (configData: LocaleConfig) {
    this.config = configData
  }

  lang = (element: HTMLElement): void => {
    const closestElement:HTMLElement = element.closest('[lang]') as HTMLElement
    if (closestElement) {
      if (closestElement.lang) {
        this.language = closestElement.lang
        return
      }
    }

    this.language = this.defaultLanguage
  }

  get = (tag: string): string => {
    return this.config[this.language][tag]
  }
}
