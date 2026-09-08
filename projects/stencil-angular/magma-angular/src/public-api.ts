/*
 * Public API Surface of component-library
 */
export * from './lib/magma.module';
export { DIRECTIVES } from './stencil-generated';
export * from './stencil-generated/components';
// ControlValueAccessor standalone generati da valueAccessorConfigs: vanno
// importati dal consumer insieme al relativo proxy per usare i componenti
// input con formControlName/[formControl] nei Reactive Form.
// TextValueAccessor -> mds-input, mds-input-date
// SelectValueAccessor -> mds-input-select
// NumericValueAccessor -> mds-input-range
// BooleanValueAccessor -> mds-input-switch
export { TextValueAccessor } from './stencil-generated/text-value-accessor';
export { SelectValueAccessor } from './stencil-generated/select-value-accessor';
export { NumericValueAccessor } from './stencil-generated/number-value-accessor';
export { BooleanValueAccessor } from './stencil-generated/boolean-value-accessor';
