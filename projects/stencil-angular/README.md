# Angular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.11.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `npm test` to execute the unit tests once in a headless Chrome via [Karma](https://karma-runner.github.io); this is what `nx run stencil-angular:test` runs. Run `npm run test.watch` to keep Karma open in a Chrome window and re-run the specs on every change.

The specs live in `magma-angular/src/lib/*.spec.ts` and exercise the wrapper library (module, generated proxies, `ControlValueAccessor` directives) against the Stencil build in `projects/stencil/dist`, so build `stencil` first.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
