import { APP_INITIALIZER, ModuleWithProviders, NgModule, NgZone } from '@angular/core';
import { defineCustomElements } from '@maggioli-design-system/magma/loader';
import { DIRECTIVES } from '../stencil-generated';

@NgModule({
  declarations: [...DIRECTIVES],
  exports: [...DIRECTIVES],
})
export class MagmaModule {
  static forRoot(): ModuleWithProviders<MagmaModule> {
    return {
      ngModule: MagmaModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: () => defineCustomElements,
          multi: true,
        },
      ],
    };
  }

}
