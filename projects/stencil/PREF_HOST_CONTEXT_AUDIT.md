# Tracker: rimozione host-context dai pref-*.css

Obiettivo: togliere `:host-context` (Chromium-only) dai `*-pref-*.css`, sostituendolo
con valori risolti ereditati pubblicati su `<html>` + consumati nello shadow.
Ricetta e contesto: `memory/reference_magma_preference_system.md` + `projects/stencil/SPEC.md`
+ `projects/styles/SPEC.md`.

## Stato per dimensione (verificato 2026-06-29)

COMPLETATO: zero `:host-context` in QUALSIASI `pref-*.css`. Tutte le dimensioni convertite
all'attributo `pref-<dim>` + store condiviso. tsc/eslint/stylelint/`stencil build` puliti.

| Dimensione  | File | Con host-context | Stato |
|-------------|------|------------------|-------|
| animation   | 50   | 0                | FATTA (unificata sull'attributo) |
| theme       | 47   | 0                | FATTA (2 assi: pref-theme + pref-theme-scheme) |
| contrast    | 51   | 0                | FATTA (+5 contrast-dark a 2 assi + mds-pref-theme) |
| consumption | 2    | 0                | FATTA (store + attributo) |

theme = due preferenze single-asse: `theme` (light/dark/system, da mds-pref-theme) +
`theme-scheme` (light/dark/all, da mds-pref-theme-variant); il componente sottoscrive entrambe
e lega `pref-theme` + `pref-theme-scheme`. contrast-dark (badge/dropdown/kpi-item/table/tooltip)
combinano gli assi: `:host([pref-contrast='..'][pref-theme='..'][tone='..'])`. mds-pref-theme
wirato a mano (usa contrast+theme+theme-scheme). Store `PREFERENCE_VALUES` ha tutte e 5 le chiavi.

BUG PREESISTENTE trovato: mds-keyboard ha un metodo storpiato `discottectedCallback()` (refuso,
mai eseguito come lifecycle). Lasciato com'era; aggiunto il `disconnectedCallback` corretto.

## contrast: FATTA (50/51 standard)

50 file `*-pref-contrast.css` convertiti (script swap di selettori, contenuto invariato):
`:host-context(:root.pref-contrast-more)`->`:host([pref-contrast='more'])`,
`...pref-contrast-system`->`[pref-contrast='system']`,
`:host-context(:root:not([data-magma-pref]))`->`:host(:not([pref-contrast]))`.
50 componenti wired (`@State() prefContrast` + `subscribePreference('contrast')` + `pref-contrast`
su Host). Store esteso con `contrast: ['more','no-preference','system']`. tsc+eslint+build puliti.
RISULTATO: l'alto contrasto ora e' cross-browser (prima solo-Chromium via host-context).
Anche `mds-pref-theme/css/mds-pref-theme-pref-contrast.css` (mescola selettori theme) e i 5
`*-pref-contrast-dark.css` (combinano contrast+theme) sono stati convertiti con gli attributi
di theme: nessun residuo.

NB sfumatura (vale contrast e theme): `:host-context(:root:not([data-magma-pref]))` (= "nessun
mds-pref") diventa `:host(:not([pref-<dim>]))` (= "nessun controller di QUESTA dimensione"). Caso
raro "mds-pref presente ma senza il controller di quella dimensione": prima l'OS era ignorato, ora
seguito (piu' corretto). Cambiamento segnalato all'utente, accettato.

## animation: CHIUSA e unificata sull'attributo

Decisione col team: animation NON resta sul meccanismo scalare `calc(* enabled)` ma viene
unificata allo stesso pattern di consumption (store + `:host([pref-animation='...'])`), cosi'
TUTTO il sistema usa un solo selettore e la futura migrazione a `@container style(--magma-pref-*)`
e' uno swap meccanico del wrapper, contenuto invariato.

Stato: tutti i 50 `pref-animation` riscritti (script deterministico) da
`--private-*: calc(* enabled)` a:
```
:host([pref-animation='reduce']) { --private-*: 0s; }
@media (prefers-reduced-motion: reduce) {
  :host([pref-animation='system']), :host(:not([pref-animation])) { --private-*: 0s; }
}
```
(`reduce` ferma; `system`/no-controller seguono l'OS; `no-preference` resta pieno; la
personalizzazione compone perche' il base setta `--private: var(--public)`). I 50 componenti
hanno il wiring `@State() prefAnimation` + `subscribePreference('animation')` + `pref-animation`
su `<Host>`. Il flag `--magma-pref-animation-enabled` e' stato RIMOSSO da controller +
manager.js (nessun consumatore residuo). Verificato: tsc + eslint + stylelint + `stencil build`
puliti. Il controller continua a pubblicare la classe `pref-animation-*` + `--magma-pref-animation`.

Bucket scroll-behavior (tab/filter/paginator/stepper-bar/horizontal-scroll, + video-wall per
display): NON usano l'attributo, gestiscono il reduced-motion via `@media` diretto (seguono solo
l'OS). I commenti che citavano il flag rimosso sono stati corretti. OPPORTUNITA' futura: ora che
esiste `:host([pref-animation='reduce'])` si potrebbe aggiungere anche l'override esplicito su
scroll-behavior/display (oggi seguono solo l'OS) — fuori scope per ora.

## Perche' theme/contrast NON si fanno (ancora) come animation

theme/contrast scelgono valori ARBITRARI (toni, ombre, bordi) in base allo stato e hanno una
sorgente OS (`prefers-color-scheme`/`prefers-contrast`): il pattern attributo + `@media` regge
(`:host([pref-contrast='more'])` esplicito + `@media { :host([pref-contrast='system']),
:host(:not([pref-contrast])) }`), ma richiede che il controller rifletta ANCHE il mode `system`,
e theme e' multi-asse (mode + scheme) -> resolver dedicato nello store.

Fatto verificato: il layer globale `projects/styles/dist/css/colors-rgb-*.css` ribalta i
`--tone-*` su `:root` per DARK (cross-browser), ma NON fa nulla per il CONTRASTO.
=> dark e' gia' globale; alto contrasto oggi esiste solo nei file per-componente host-context
= solo Chromium.

## Meccanismo scelto (store condiviso + attributo dedicato)

Deciso col team: NIENTE layer globale (perdita di incapsulamento) e NIENTE auto-gestione
per componente (ognuno che sniffa `<html>` per conto suo). Si centralizza con uno store.

Read-model reattivo unico `src/common/preference.ts` -> `subscribePreference(pref, cb)`:
- i `mds-pref-*` restano gli UNICI scrittori/autorita': pubblicano `pref-<dim>-<valore>`
  come classe su `<html>` (idem il panel Storybook). Lo store non decide nulla, specchia.
- un SOLO MutationObserver centrale sulla classe di `<html>` (non piu' uno per componente);
  i consumer si sottoscrivono a quel canale. Nessuna race emit/setProperty del controller
  (l'observer scatta dopo la mutazione). Funziona anche in Storybook senza toccare manager.js.
- assenza di classe (nessun controller) => valore `undefined` => attributo non emesso =>
  default invariato (fedele).
- valori per dimensione centralizzati nello store (`PREFERENCE_VALUES`). NB: single-axis;
  theme e' multi-axis (mode + scheme) e vorra' un resolver dedicato.

Lato componente: `@State() consumption` aggiornata dalla subscribe, legata su
`<Host pref-consumption={this.consumption}>`. Lo shadow CSS usa `:host([pref-<dim>='...'])`
(Livello 2, attributo dedicato dell'host) -> cross-browser, niente reroute di base CSS
(i selettori colpiscono gli stessi elementi delle vecchie host-context), niente
modifiche a controller/manager.js.

Naming attributo: `pref-<dim>` (nudo, non `data-*`) per coerenza col prefisso delle classi
`pref-<dim>-<valore>` e col custom prop `--magma-pref-*`, e con la convenzione del repo
(attributi nudi: `sorted`, `selection`, `preview`). Il prefisso `pref-` namespacizza ed
evita collisioni con attributi funzionali del componente.

## Piano: COMPLETATO

Tutte le fasi del piano originale sono state eseguite (lo store ha reso superflua l'ipotesi
del "layer globale contrast", scartata: i contrast sono andati per-componente con l'attributo).

1. **consumption** = pilota. FATTO (store + attributo). 3 file.
2. **contrast** FATTO per-componente (52 file, +5 contrast-dark, + mds-pref-theme): l'attributo
   `pref-contrast` + `@media (prefers-contrast)` copre il caso `system`/no-controller, senza
   bisogno di un layer globale ne' di pubblicare un custom prop dedicato.
3. **theme** FATTO (48 file, 2 assi `pref-theme` + `pref-theme-scheme`).
4. **animation** FATTO e unificato sull'attributo (51 file).

Verificato 2026-06-30: `grep -r ":host-context("` sui `*-pref-*.css` => 0 occorrenze reali.

FUORI SCOPE (cantiere separato, NON preferenze): restano 19 `.css` che usano `:host-context(`
per leggere gli attributi del componente PADRE attraverso lo shadow boundary (contextual styling
parent->child, non stato globale `<html>`): mds-tree-item (`mds-tree[toggle/appearance]`),
mds-table-row (`mds-table[selection][interactive]`), mds-tab-item (`mds-tab[direction]`),
mds-input-tip (`mds-input-field[variant]`), mds-avatar-stack-item (`mds-avatar-stack[size]`),
mds-button (`mds-button-group`), + `:host-context(:not(.safari))`. Lo store non e' la soluzione
diretta (il segnale viene dal padre, non da `<html>`); servirebbe un meccanismo dedicato.

## Regole trasversali (valgono per tutti)

- Ogni nuova custom-prop risolta su `<html>` va aggiunta in lockstep ai controller
  `mds-pref-*` E a `projects/stencil/.storybook/manager.js`.
- Override su proprieta' reali (non custom-prop) vanno prima portati su un mirror `--mds-*`
  letto dal base CSS (stesso pattern del `--private-*` di animation).
- Solo ASCII nei file. Riga vuota dopo il commento iniziale. Lint sul singolo componente.
