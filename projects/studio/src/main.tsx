import { render } from 'preact';
import { startLanguage } from './shared/i18n/i18n.js';
import { Studio } from './app/shell.js';

// the language before the first render, and before mds-pref-language of the menu reads it
startLanguage();
render(<Studio />, document.getElementById('app')!);
