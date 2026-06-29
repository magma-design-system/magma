# Tracker: rimozione host-context dai pref-*.css

Obiettivo: togliere `:host-context` (Chromium-only) dai `*-pref-*.css`, sostituendolo
con valori risolti ereditati pubblicati su `<html>` + consumati nello shadow.
Ricetta e contesto: `memory/reference_magma_preference_system.md` + `projects/stencil/SPEC.md`
+ `projects/styles/SPEC.md`.

## Stato per dimensione (verificato 2026-06-29)

| Dimensione  | File | Con host-context | Stato |
|-------------|------|------------------|-------|
| animation   | 50   | 0                | FATTA (meccanismo scalare) |
| theme       | 47   | 47               | da fare |
| contrast    | 51   | 51               | BLOCCATA (manca layer globale, vedi sotto) |
| consumption | 2    | 2                | da fare (pilota ideale) |

## animation: CHIUSA

Tutti i 50 `pref-animation` non hanno piu' host-context e usano la ricetta scalare
(public `--mds-*-duration` + mirror `--private-*` + pref che fa
`calc(* var(--magma-pref-animation-enabled,1))` + `@media (prefers-reduced-motion)`).
Anche i cleanup `@apply duration-*` sono spariti (grep = 0). Niente residui.
NB: il vecchio elenco "DA FARE (28/58)" era stale — quei componenti risultano gia' convertiti.

Bucket 4 (scroll-behavior: breadcrumb/filter/paginator/stepper-bar/horizontal-scroll/tab)
era una nota di scope: NON usa host-context, e' un'estensione separata
(`--magma-pref-animation-scroll-behavior`) — fuori da questo tracker se non emergono regressioni.

## Perche' theme/contrast/consumption NON si convertono come animation

animation si e' ridotto a uno SCALARE (0/1) moltiplicato in calc(). theme/contrast/consumption
scelgono valori ARBITRARI (toni, ombre, bordi, display/blur) in base allo stato: niente da
moltiplicare, serve portare dentro lo shadow il valore gia' risolto. Ogni file ha due blocchi
(esplicito `:host-context(.pref-*)` + sistema `@media` annidato anch'esso in host-context).

Fatto verificato: il layer globale `projects/styles/dist/css/colors-rgb-*.css` ribalta i
`--tone-*` su `:root` per DARK (cross-browser), ma NON fa nulla per il CONTRASTO.
=> dark e' gia' globale; alto contrasto oggi esiste solo nei file per-componente host-context
= solo Chromium.

## Piano (ordine consigliato)

1. **consumption (2 file) = pilota end-to-end.** Solo `display`/`blur`/`backdrop-filter`.
   Pubblicare `--magma-pref-consumption-level` da `mds-pref-consumption` + `manager.js`,
   riroutare le proprieta' reali su mirror `--mds-*` letti dal base CSS. Valida il pattern.
   - [ ] mds-header (`mds-header-pref-consumption.css`: backdrop image/blur/display)
   - [ ] mds-status-bar (`backdrop-filter: none`)

2. **layer contrast globale in `projects/styles`** (sblocca i 51 contrast).
   Specchiare cio' che colors-rgb fa per dark, ma per `:root.pref-contrast-more` +
   `@media (prefers-contrast: more)`. La logica di precedenza vive una volta sola su :root.
   - [ ] costruire/pubblicare il layer
   - [ ] aggiornare SPEC styles + manager.js

3. **theme: triage dei 47.** Con i toni gia' ribaltati globalmente, i color-only sono
   ridondanti (cancellabili); restano da riroutare solo i non-color.
   - non-color noti (box-shadow/display/filter/ecc.): badge, banner, card, chip, file-preview,
     filter-item, file, header-bar, kpi-item, keyboard, label, note, paginator,
     price-table-list, status-bar, tab-bar, zero, usage

4. **contrast per-componente** (dopo il layer globale): rerouting dei non-color.
   - non-color noti: badge, card, avatar, banner, chip, file, filter, file-preview,
     filter-item, header-bar, kpi-item, note, label, paginator, price-table-list,
     tab-bar, tab, zero

## Regole trasversali (valgono per tutti)

- Ogni nuova custom-prop risolta su `<html>` va aggiunta in lockstep ai controller
  `mds-pref-*` E a `projects/stencil/.storybook/manager.js`.
- Override su proprieta' reali (non custom-prop) vanno prima portati su un mirror `--mds-*`
  letto dal base CSS (stesso pattern del `--private-*` di animation).
- Solo ASCII nei file. Riga vuota dopo il commento iniziale. Lint sul singolo componente.
