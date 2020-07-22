# Assets

Gli asset attualmente disponibili

Dipendenze vendor installate

```
node_modules/normalize.css/normalize.css
node_modules/material-design-icons/iconfont/material-icons.css
node_modules/typeface-karla/index.css
node_modules/typeface-roboto/index.css
```

### Override di configurazione

Al fine di ottimizzare la build del CSS è necessario creare una configurazione che fa l'override di quella default. Questa permette di configurare i setting dei design token al fine di minimizzare le variabili e le proprietà che non sevono alla build.

##### Esempio di configurazione

Questa è una configurazione default, dove vengono esportati tutti i colori attualmente disponibili nel design system.

```scss
$config: (
  'palette': (
    'format': ('rgb-channels', 'hex'),
    'scale': ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'),
    'scaffold': ('background-color', 'color'),
    'colors': ('brand.maggioli', 'brand.argo', 'brand.eolo', 'status.info', 'status.success', 'status.error', 'status.warning', 'adjust.tone')
  )
);
```

Ad oggi, `palette` è l'unico elemento configurabile.

Mettiamo caso che si stia integrando il design system per Eolo, e non servano tutte le funzionalità basterà cambiare la scala dei colori, il formato e i colori da generare con lo scaffolding:

```scss
$config: (
  'palette': (
    'format': ('hex'),
    'scale': ('1', '2', '3', '4', '5', '10', '11', '12', '13', '14', '15', '16'),
    'scaffold': ('background-color'),
    'colors': ('brand.eolo', 'status.success', 'status.error', 'status.warning', 'adjust.tone')
  )
);
```

##### Configurazione palette

| Parametro | Valore | Descrizione | SCSS | CSS |
|-|-|-|-|-|
| `format` | `hex` | Verranno sempre ritornati colori in formato **esadecimale**, anche se si tenterà di dare trasparenza al colore | `color: color('brand.eolo', '10', 0.5);` | `color: #98add3;` |
| `format` | `rgb-channels` | La funzione `color` ritornerà i colori in formato RGB o RGBA, laddove verrà utilizzata la trasparenza | `color: color('brand.eolo', '10', 0.5);` | `rgba(152, 173, 211, 0.5)` |
| `scale` | `1-17` | La scala dei colori esportati prevede 17 taglie, le prime 16 rispettano la scala di contrasto del design system, il 17° parametro è il colore dalla quale viene generata la scala | - | - |
| `scaffold` | `css-property` | Lo scaffolding genera selettoridi classi CSS basati su una singola proprietà CSS per i colori in base alla lista esposta | `background-color` | `background-color-brand-eolo-01,...16` |
| `colors` | `brand.maggioli` | La lista di colori da esportare per la generazione del CSS | - | - |

### Dipendenze design system

```
node_modules/@maggioli/design-system/src/scss/import-global.scss
```

Dipendenza componente singolo

```
node_modules/@maggioli/design-system/src/scss/import-framework.scss
```

Per fare un override della configurazione default, è necessario inserirla subito sopra gli import del design system, in entrambi i casi:

##### Nel tuo componente React / Angular/ SCSS

```scss
@import 'your-custom-config';
@import 'import-framework';
```

##### Nella tua pagina React / Angular / JS

```js
import 'your-custom-config.scss';
import 'import-global.scss';
```

Gli asset dei **design token** sono generati in fase di pubblicazione del modulo, per tanto sono pre-generati *as is* in fase di utilizzo del modulo come dipendenza.
