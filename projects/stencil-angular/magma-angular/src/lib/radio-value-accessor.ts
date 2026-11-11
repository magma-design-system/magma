import { Directive, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ValueAccessor } from '../stencil-generated/value-accessor';

/**
 * The ControlValueAccessor of a radio, `mds-input-switch type="radio"`: the radios of a group share
 * one control, which holds the `value` of the checked radio, as Angular binds a native radio group.
 *
 * Written by hand because the `radio` type of `valueAccessorConfigs` cannot hold a group: like the
 * `text` one, it writes the control value into `value` (every radio of the group would take the
 * same value) and reads `value` back on each change.
 *
 * - `writeValue` checks the radio whose `value` equals the control value and unchecks the others.
 *   The `value` prop of `mds-input-switch` is a string, so the comparison is strict: a control
 *   value of `1` checks no radio of `value="1"`.
 * - `mdsInputSwitchChange` ("Emits when the value changes") fires on the radio the user checks,
 *   never on the radios of its group that it unchecks: the checked one reports its `value`.
 * - The selector needs `type="radio"` as a static attribute: with a bound `[type]` the radio gets
 *   the boolean accessor of `mds-input-switch`.
 */
@Directive({
  selector: 'mds-input-switch[type=radio]',
  host: {
    '(mdsInputSwitchChange)': 'handleChangeEvent($event.target?.checked)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioValueAccessor),
      multi: true,
    },
  ],
})
export class RadioValueAccessor extends ValueAccessor {
  // the base keeps its own onChange private
  private onRadioChange: (value: string | undefined) => void = () => {
    /**/
  };

  constructor(el: ElementRef<HTMLMdsInputSwitchElement>) {
    super(el);
  }

  override writeValue(value: unknown): void {
    const element = this.el.nativeElement as HTMLMdsInputSwitchElement;
    this.lastValue = value;
    element.checked = value != null && value === element.value;
  }

  override registerOnChange(fn: (value: string | undefined) => void): void {
    this.onRadioChange = fn;
  }

  /**
   * Reports the value of this radio once checked. Every change counts, with no comparison to the
   * last value: the control may have moved to another radio of the group since this one wrote it.
   */
  override handleChangeEvent(checked: unknown): void {
    if (checked !== true) return;
    const { value } = this.el.nativeElement as HTMLMdsInputSwitchElement;
    this.lastValue = value;
    this.onRadioChange(value);
  }
}
