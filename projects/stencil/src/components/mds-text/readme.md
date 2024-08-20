# mds-text



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description                                                                | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Default     |
| ------------ | ------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `animation`  | `animation`  | Specifies if the text is animated when it is rendered                      | `"none" \| "yugop" \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                             | `'none'`    |
| `tag`        | `tag`        | Specifies the HTML tag of the element                                      | `"address" \| "abbr" \| "article" \| "b" \| "bdo" \| "blockquote" \| "cite" \| "code" \| "dd" \| "del" \| "details" \| "dfn" \| "div" \| "dl" \| "dt" \| "em" \| "figcaption" \| "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "i" \| "ins" \| "kbd" \| "label" \| "legend" \| "li" \| "mark" \| "ol" \| "p" \| "pre" \| "q" \| "rt" \| "ruby" \| "s" \| "samp" \| "small" \| "span" \| "strong" \| "sub" \| "summary" \| "sup" \| "time" \| "u" \| "ul" \| "var" \| "rb"` | `undefined` |
| `text`       | `text`       | Specifies the text string to the component instead of passing an HTML node | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `undefined` |
| `truncate`   | `truncate`   | Specifies if the text shoud be truncated or should behave as a normal text | `"all" \| "none" \| "word" \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                     | `undefined` |
| `typography` | `typography` | Specifies the font typography of the element                               | `"action" \| "caption" \| "detail" \| "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "hack" \| "label" \| "option" \| "paragraph" \| "snippet" \| "tip"`                                                                                                                                                                                                                                                                                                                    | `'detail'`  |
| `variant`    | `variant`    | Specifies the variant for `typography`                                     | `"code" \| "info" \| "read" \| "title" \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                         | `undefined` |


## Slots

| Slot        | Description                                                                            |
| ----------- | -------------------------------------------------------------------------------------- |
| `"default"` | Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here. |


## CSS Custom Properties

| Name                              | Description                                                                                                                                                                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--mds-text-line-clamp`           | Sets the max number of visible lines before the text overflows with ellipsis. It works only if attribute `truncate='all' is set`. **WARNING:** this is supported only by Chrome, Safare and Firefox with native browser prefixes. |
| `--mds-text-selection-background` | Sets the background-color of the text when the text is selected                                                                                                                                                                   |
| `--mds-text-selection-color`      | Sets the color of the text when the text is selected                                                                                                                                                                              |


## Dependencies

### Used by

 - [mds-accordion-item](../mds-accordion-item)
 - [mds-accordion-timer-item](../mds-accordion-timer-item)
 - [mds-badge](../mds-badge)
 - [mds-banner](../mds-banner)
 - [mds-benchmark-bar](../mds-benchmark-bar)
 - [mds-bibliography](../mds-bibliography)
 - [mds-breadcrumb-item](../mds-breadcrumb-item)
 - [mds-button](../mds-button)
 - [mds-chip](../mds-chip)
 - [mds-file](../mds-file)
 - [mds-file-preview](../mds-file-preview)
 - [mds-filter](../mds-filter)
 - [mds-filter-item](../mds-filter-item)
 - [mds-input-field](../mds-input-field)
 - [mds-input-range](../mds-input-range)
 - [mds-input-switch](../mds-input-switch)
 - [mds-input-tip-item](../mds-input-tip-item)
 - [mds-input-upload](../mds-input-upload)
 - [mds-kpi-item](../mds-kpi-item)
 - [mds-label](../mds-label)
 - [mds-list-item](../mds-list-item)
 - [mds-notification](../mds-notification)
 - [mds-paginator-item](../mds-paginator-item)
 - [mds-pref-animation](../mds-pref-animation)
 - [mds-pref-consumption](../mds-pref-consumption)
 - [mds-pref-contrast](../mds-pref-contrast)
 - [mds-pref-theme](../mds-pref-theme)
 - [mds-price-table-features](../mds-price-table-features)
 - [mds-price-table-features-cell](../mds-price-table-features-cell)
 - [mds-price-table-list-item](../mds-price-table-list-item)
 - [mds-push-notification](../mds-push-notification)
 - [mds-quote](../mds-quote)
 - [mds-stepper-bar-item](../mds-stepper-bar-item)
 - [mds-tab-bar-item](../mds-tab-bar-item)
 - [mds-toast](../mds-toast)
 - [mds-tooltip](../mds-tooltip)
 - [mds-url-view](../mds-url-view)
 - [mds-usage](../mds-usage)

### Graph
```mermaid
graph TD;
  mds-accordion-item --> mds-text
  mds-accordion-timer-item --> mds-text
  mds-badge --> mds-text
  mds-banner --> mds-text
  mds-benchmark-bar --> mds-text
  mds-bibliography --> mds-text
  mds-breadcrumb-item --> mds-text
  mds-button --> mds-text
  mds-chip --> mds-text
  mds-file --> mds-text
  mds-file-preview --> mds-text
  mds-filter --> mds-text
  mds-filter-item --> mds-text
  mds-input-field --> mds-text
  mds-input-range --> mds-text
  mds-input-switch --> mds-text
  mds-input-tip-item --> mds-text
  mds-input-upload --> mds-text
  mds-kpi-item --> mds-text
  mds-label --> mds-text
  mds-list-item --> mds-text
  mds-notification --> mds-text
  mds-paginator-item --> mds-text
  mds-pref-animation --> mds-text
  mds-pref-consumption --> mds-text
  mds-pref-contrast --> mds-text
  mds-pref-theme --> mds-text
  mds-price-table-features --> mds-text
  mds-price-table-features-cell --> mds-text
  mds-price-table-list-item --> mds-text
  mds-push-notification --> mds-text
  mds-quote --> mds-text
  mds-stepper-bar-item --> mds-text
  mds-tab-bar-item --> mds-text
  mds-toast --> mds-text
  mds-tooltip --> mds-text
  mds-url-view --> mds-text
  mds-usage --> mds-text
  style mds-text fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
