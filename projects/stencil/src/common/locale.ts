import mustache from 'mustache';
import { preferenceStore } from './preference';

type LocaleConfig = {
  el?: Record<string, string | string[]>;
  en: Record<string, string | string[]>;
  es?: Record<string, string | string[]>;
  it?: Record<string, string | string[]>;
};

export class Locale {
  rollbackLanguage: string = 'en';
  config: LocaleConfig;

  constructor(configData?: LocaleConfig) {
    if (configData) {
      this.set(configData);
    }
  }

  set = (configData: LocaleConfig): void => {
    this.config = configData;
  };

  private pluralize = (
    tag: string | string[],
    context: Record<string, string | number | boolean>,
    language: string,
  ): string => {
    const languagePhrase: string | string[] = this.config[language]
      ? this.config[language][tag]
      : this.config[this.rollbackLanguage][tag];
    const phrases: string[] = [];

    if (Array.isArray(languagePhrase)) {
      phrases.push(languagePhrase[0]);
      phrases.push(languagePhrase[1]);
    } else {
      phrases.push(languagePhrase);
      phrases.push(languagePhrase);
    }

    const [defaultPhrase] = phrases;
    let translatePhrase: string = defaultPhrase;

    const keys = Object.keys(context);
    if (keys.length > 0) {
      const [firstKey] = keys;
      if (typeof context[firstKey] === 'number') {
        if (context[firstKey] !== 1) {
          translatePhrase = phrases[1];
        }
      }
    }

    return mustache.render(translatePhrase, context);
  };

  get = (tag: string | string[], context?: Record<string, string | number | boolean>): string => {
    // Reading the store during render auto-subscribes the component to language changes
    const { language } = preferenceStore.state;
    if (context) {
      return this.pluralize(tag, context, language);
    }
    return this.config[language]
      ? this.config[language][tag]
      : this.config[this.rollbackLanguage][tag];
  };
}
