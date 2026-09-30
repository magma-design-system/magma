# MagmaAngular

Magma Angular specific building blocks on top of [@maggioli-design-system/magma](https://www.npmjs.com/package/@maggioli-design-system/magma) components.

## Install with an AI agent

This package ships an agent-readable install guide, versioned with the package. Point
your coding agent (Claude Code, etc.) at it and let it wire up styles, fonts, icons and
component registration, asking you only for what it cannot detect from your project:

> Read `node_modules/@maggioli-design-system/magma-angular/AGENTS.md` and follow it to
> install Magma into this project.

The detailed steps live under `agents/` in this package.

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
