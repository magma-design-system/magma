import { APP_INITIALIZER, ModuleWithProviders, NgModule, NgZone } from '@angular/core';
import { defineCustomElements } from '@maggioli-design-system/magma/loader';
import { DIRECTIVES } from '../stencil-generated';
import { TextValueAccessor } from '../stencil-generated/text-value-accessor';
import { SelectValueAccessor } from '../stencil-generated/select-value-accessor';
import { NumericValueAccessor } from '../stencil-generated/number-value-accessor';
import { BooleanValueAccessor } from '../stencil-generated/boolean-value-accessor';

// Direttive ControlValueAccessor standalone generate da valueAccessorConfigs:
// TextValueAccessor -> mds-input, mds-input-date
// SelectValueAccessor -> mds-input-select
// NumericValueAccessor -> mds-input-range
// BooleanValueAccessor -> mds-input-switch
const VALUE_ACCESSORS = [
  TextValueAccessor,
  SelectValueAccessor,
  NumericValueAccessor,
  BooleanValueAccessor,
];

@NgModule({
  // I proxy generati con outputType:'standalone' sono componenti standalone
  // (default in Angular 20): vanno importati, non dichiarati, poi ri-esportati.
  // VALUE_ACCESSORS sono le direttive CVA standalone dei componenti input.
  imports: [...DIRECTIVES, ...VALUE_ACCESSORS],
  exports: [...DIRECTIVES, ...VALUE_ACCESSORS],
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
