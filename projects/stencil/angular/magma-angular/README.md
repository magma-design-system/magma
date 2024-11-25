# MagmaAngular

Magma Angular specific building blocks on top of [@maggioli-design-system/magma](https://www.npmjs.com/package/@maggioli-design-system/magma) components.

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
