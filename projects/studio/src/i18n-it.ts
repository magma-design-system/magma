/*
  The Italian of the studio (#1336), by the English text it translates (i18n.ts). The studio
  speaks to the person with "tu", as the Italian of the Magma components does ("Hai caricato",
  "Seleziona"). The words that come back on every page keep one Italian form, the glossary of the
  README ("Languages").
*/
export const IT: Record<string, string> = {
  // the bar and its menu (shell.tsx)
  'for Magma v{version}': 'per Magma v{version}',
  Colors: 'Colori',
  Theme: 'Tema',
  // Regole, not Comportamento: the pages of the section are rules (of composition, patterns,
  // blocks), and Comportamento with Configurazione does not fit the bar at 768px (vittorio,
  // 2026-11-10)
  Behavior: 'Regole',
  Config: 'Configurazione',
  Studio: 'Studio',
  Preferences: 'Preferenze',

  // the pages of the sections (routes.ts)
  Palette: 'Palette',
  'Contrast scales': 'Scale di contrasto',
  'Semantic surface': 'Superficie semantica',
  Themes: 'Temi',
  Groups: 'Gruppi',
  'Contrast check': 'Verifica del contrasto',
  Diffs: 'Differenze',
  'Design language': 'Linguaggio di design',
  Patterns: 'Pattern',
  Blocks: 'Blocchi',
  // the Theme section (shell.tsx)
  Typography: 'Tipografia',
  Shape: 'Forma',
  Density: 'Densità',
  Depth: 'Profondità',
  'Preferences of the person': 'Preferenze della persona',
  Dimension: 'Dimensione',
  Scenes: 'Scene',
  'The theme on a page of a product': 'Il tema su una pagina di un prodotto',
  'The theme on every component': 'Il tema su ogni componente',
  Desktop: 'Desktop',
  Tablet: 'Tablet',
  Mobile: 'Mobile',
  'Full width': 'Larghezza piena',
  Width: 'Larghezza',
  Preview: 'Anteprima',
  View: 'Vista',
  '{theme} is light only': '{theme} è solo in modalità chiara',
  '{theme} is dark only': '{theme} è solo in modalità scura',
  '{title}, light mode': '{title}, modalità chiara',
  '{title}, dark mode': '{title}, modalità scura',
  Accessibility: 'Accessibilità',
  'Light and dark': 'Chiaro e scuro',

  // the pages of Behavior (shell.tsx)
  'The rules of composition every page of a product follows: rhythm, density, actions, titles, surfaces and widths.':
    'Le regole di composizione che ogni pagina di un prodotto segue: ritmo, densità, azioni, titoli, superfici e larghezze.',
  'How a task across components is solved in every product, with the narrower values a product keeps in its magma/patterns folder.':
    'Come ogni prodotto risolve un compito che attraversa più componenti, con i valori più stretti che un prodotto tiene nella sua cartella magma/patterns.',
  'The sections of a page that come back in two patterns or more: the application shell, the page header, the lists.':
    "Le sezioni di una pagina che tornano in due pattern o più: la struttura dell'applicazione, l'intestazione della pagina, gli elenchi.",
  'Read-only, after the theme': 'In sola lettura, dopo il tema',
  'This page shows what Magma decided and the layer of the product, in the theme of the product. It comes after the Theme section (#693, "The plan").':
    'Questa pagina mostra quello che Magma ha deciso e il livello del prodotto, nel tema del prodotto. Arriva dopo la sezione Tema (#693, "The plan").',
};
