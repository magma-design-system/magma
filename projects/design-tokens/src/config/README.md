Di seguito è rappresentato l'uso dei tokens e delle relative configurazioni di styledictionary per la creazione delle variabili nei corrispettivi formati.


> Nota: le configurazioni in ts usano in maniera dinamica i colori generati dalla build della palette nella cartella tokens/color/generated


### Configurazioni → File usati

```mermaid
flowchart LR
  %% css.json
  css["css.json"] --> bradius["tokens/cosmetic/border-radius.json"]
  css --> border["tokens/cosmetic/border.json"]
  css --> bshadow["tokens/cosmetic/box-shadow.json"]
  css --> csswild["tokens/css/**/*.json"]
  css --> aspect["tokens/sizing/aspect-ratio.json"]
  css --> gap["tokens/sizing/gap.json"]
  css --> lead["tokens/typography/leading.json"]
  css --> size["tokens/typography/size.json"]
  css --> sizing["tokens/typography/sizing.json"]
  css --> primitive["tokens/sizing/primitive.json"]

  %% screens.json
  screens["screens.json"] --> screenDefault["tokens/screen/default.json"]

  %% tailwind4.json
  tw["tailwind4.json"] --> spacing["tokens/sizing/spacing.json"]
  tw --> aspect
  tw --> defaultType["tokens/typography/default.json"]
  tw --> lead
  tw --> size
  tw --> csswild
  tw --> border
  tw --> bshadow
  tw --> screenDefault
  tw --> primitive
  tw --> sizing

  %% typography.json
  typo["typography.json"] --> defaultType
  typo --> lead
  typo --> size

  %% sd-color-all-platforms.config.ts
  colorAll["sd-color-all-platforms.config.ts"] --> defColor["tokens/color/generated/default.json"]

  %% sd-brand-color.config.ts
  brandColor["sd-brand-color.config.ts"] --> brandToken["tokens/color/generated/{brand}.json"]
```

### File → Configurazioni che lo usano

```mermaid
flowchart LR
  %% File → css.json
  bradius["tokens/cosmetic/border-radius.json"] --> css["css.json"]
  border["tokens/cosmetic/border.json"] --> css
  bshadow["tokens/cosmetic/box-shadow.json"] --> css
  csswild["tokens/css/**/*.json"] --> css
  aspect["tokens/sizing/aspect-ratio.json"] --> css
  gap["tokens/sizing/gap.json"] --> css
  lead["tokens/typography/leading.json"] --> css
  size["tokens/typography/size.json"] --> css
  sizing["tokens/typography/sizing.json"] --> css
  primitive["tokens/sizing/primitive.json"] --> css

  %% File → screens.json
  screenDefault["tokens/screen/default.json"] --> screens["screens.json"]

  %% File → tailwind4.json
  spacing["tokens/sizing/spacing.json"] --> tw["tailwind4.json"]
  aspect --> tw
  defaultType["tokens/typography/default.json"] --> tw
  lead --> tw
  size --> tw
  csswild --> tw
  border --> tw
  bshadow --> tw
  screenDefault --> tw
  primitive --> tw
  sizing --> tw

  %% File → typography.json
  defaultType --> typo["typography.json"]
  lead --> typo
  size --> typo

  %% File → sd-color-all-platforms.config.ts
  defColor["tokens/color/generated/default.json"] --> colorAll["sd-color-all-platforms.config.ts"]

  %% File → sd-brand-color.config.ts
  brandToken["tokens/color/generated/{brand}.json"] --> brandColor["sd-brand-color.config.ts"]
```
