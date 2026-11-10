import { NgModule } from '@angular/core';
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
export class MagmaModule {}
