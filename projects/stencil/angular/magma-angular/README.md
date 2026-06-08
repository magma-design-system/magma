# MagmaAngular

Magma Angular specific building blocks on top of [@maggioli-design-system/magma](https://www.npmjs.com/package/@maggioli-design-system/magma) components.

## Compatibility

`magma-angular` follows the same major version as `magma`. Use the versions of `@maggioli-design-system/design-tokens` and `@maggioli-design-system/styles` matching your magma major version:

| magma | design-tokens | styles |
| :--- | :--- | :--- |
| `1.x` (before Magma 2) | `13.x` (latest `13.7.2`) | `15.x` (latest `15.11.1`) |
| `2.x` and later | `>= 14` | `>= 16` |

## Installation

Install package
```
npm i @maggioli-design-system/magma-angular
```

### NgModule

```
import { MagmaModule } from '@maggioli-design-system/magma-angular'

@NgModule({
  imports: [
   ...,
   MagmaModule.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Standalone

import module in `AppComponent`
```
import { MagmaModule } from '@maggioli-design-system/magma-angular'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [..., MagmaModule],
})
export class AppComponent implements OnInit {}
```

set config for module in `app.config.ts`
```
import { MagmaModule } from '@maggioli-design-system/magma-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    ...,
    importProvidersFrom(MagmaModule.forRoot())
  ],
};
```
