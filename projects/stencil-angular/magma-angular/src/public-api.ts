/*
 * Public API Surface of component-library
 */
export * from './lib/magma.module';
export { DIRECTIVES } from './stencil-generated';
export * from './stencil-generated/components';
// The standalone ControlValueAccessor directives of the form components, imported by the
// consumer next to the proxy to bind it with [formControl], formControlName or [(ngModel)].
// Generated from valueAccessorConfigs of projects/stencil/stencil.config.ts, the radio one
// written by hand:
// TextValueAccessor -> mds-input, mds-input-date
// SelectValueAccessor -> mds-input-select
// NumericValueAccessor -> mds-input-range
// BooleanValueAccessor -> mds-input-switch (switch, checkbox)
// RadioValueAccessor -> mds-input-switch type="radio"
export { TextValueAccessor } from './stencil-generated/text-value-accessor';
export { SelectValueAccessor } from './stencil-generated/select-value-accessor';
export { NumericValueAccessor } from './stencil-generated/number-value-accessor';
export { BooleanValueAccessor } from './stencil-generated/boolean-value-accessor';
export { RadioValueAccessor } from './lib/radio-value-accessor';
