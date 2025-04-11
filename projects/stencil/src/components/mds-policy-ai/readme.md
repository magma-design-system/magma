# mds-policy-ai



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                        | Type                                                  | Default                                                                                      |
| ------------- | ------------- | -------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `description` | `description` | Sets the description to custom component long text | `string \| undefined`                                 | `undefined`                                                                                  |
| `headline`    | `headline`    | Sets the headline to custom component text         | `string \| undefined`                                 | `undefined`                                                                                  |
| `href`        | `href`        | Sets the pointing URL of the component             | `string \| undefined`                                 | `'https://www.maggiolieditore.it/il-regolamento-europeo-sull-intelligenza-artificiale.html'` |
| `variant`     | `variant`     | Sets the variant type of the component             | `"banner" \| "card" \| "chip" \| "icon" \| undefined` | `'chip'`                                                                                     |


## Methods

### `updateLang() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part       | Description                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| `"banner"` | Selects the `banner` component wrapped in shadowDOM, will be found only if attirbute `variant` is set to `banner`. |
| `"card"`   | Selects the `card` component wrapped in shadowDOM, will be found only if attirbute `variant` is set to `card`.     |
| `"chip"`   | Selects the `chip` component wrapped in shadowDOM, will be found only if attirbute `variant` is set to `chip`.     |
| `"icon"`   | Selects the `icon` component wrapped in shadowDOM, will be found only if attirbute `variant` is set to `icon`.     |


## Dependencies

### Depends on

- [mds-help](../mds-help)
- [mds-text](../mds-text)
- [mds-chip](../mds-chip)
- [mds-dropdown](../mds-dropdown)
- [mds-button](../mds-button)
- [mds-icon](../mds-icon)
- [mds-banner](../mds-banner)

### Graph
```mermaid
graph TD;
  mds-policy-ai --> mds-help
  mds-policy-ai --> mds-text
  mds-policy-ai --> mds-chip
  mds-policy-ai --> mds-dropdown
  mds-policy-ai --> mds-button
  mds-policy-ai --> mds-icon
  mds-policy-ai --> mds-banner
  mds-help --> mds-icon
  mds-help --> mds-tooltip
  mds-tooltip --> mds-text
  mds-chip --> mds-icon
  mds-chip --> mds-text
  mds-chip --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-banner --> mds-icon
  mds-banner --> mds-text
  mds-banner --> mds-button
  style mds-policy-ai fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
