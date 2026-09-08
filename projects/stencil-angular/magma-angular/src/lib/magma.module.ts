import { ModuleWithProviders, NgModule } from '@angular/core';
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

/**
 * Scorciatoia che espone in un colpo solo tutti i proxy Magma e i loro
 * ControlValueAccessor.
 *
 * Con una build AOT resta tree-shakeable: il compilatore Angular tiene solo le
 * direttive che il template usa davvero (misurato: importare `MagmaModule`
 * invece del singolo `MdsButton` costa ~0.5 kB su un'app di prova). Importare i
 * componenti standalone uno per uno resta comunque preferibile, perché è
 * esplicito e non dipende dall'AOT:
 *
 * ```ts
 * import { MdsButton, MdsIcon } from '@maggioli-design-system/magma-angular';
 *
 * @Component({ imports: [MdsButton, MdsIcon] })
 * ```
 */
@NgModule({
  // I proxy generati con outputType:'standalone' sono componenti standalone
  // (default in Angular 20): vanno importati, non dichiarati, poi ri-esportati.
  // VALUE_ACCESSORS sono le direttive CVA standalone dei componenti input.
  imports: [...DIRECTIVES, ...VALUE_ACCESSORS],
  exports: [...DIRECTIVES, ...VALUE_ACCESSORS],
})
export class MagmaModule {
  /**
   * @deprecated Non serve più: usare direttamente `MagmaModule` (o, meglio, i
   * singoli componenti standalone). Resta come no-op per retrocompatibilità e
   * verrà rimosso in una major successiva.
   *
   * Registrava i custom element via `defineCustomElements()` del loader lazy.
   * È superfluo — ogni proxy standalone registra il proprio custom element da
   * sé, tramite `@ProxyCmp({ defineCustomElementFn })` sull'output
   * `dist-custom-elements` — ed era l'unico vero killer del tree-shaking:
   * misurato su un'app di prova, portava il build da 229 kB in 2 file a 1.9 MB
   * in 142 file, perché il loader carica a runtime i chunk di tutti i 114
   * componenti.
   */
  static forRoot(): ModuleWithProviders<MagmaModule> {
    return {
      ngModule: MagmaModule,
      providers: [],
    };
  }
}
