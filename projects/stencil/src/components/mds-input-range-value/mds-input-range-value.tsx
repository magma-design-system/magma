import { Component, Host, h, Prop } from '@stencil/core';

/**
 * One value of an `mds-input-range` that holds several, as an `<option>` is one choice of a
 * `<select>`: the range draws a thumb for it, and its text names that thumb. It draws nothing
 * itself. Adding or removing a value is adding or removing one of these elements: the range
 * watches its children.
 * @slot - The name of the value, as text ("Minimo", "Massimo"): the accessible name of its thumb.
 * Without text the thumb is named after the label of the range and its position ("Prezzo, 1 di 2")
 * @parent mds-input-range
 */
@Component({
  tag: 'mds-input-range-value',
  styleUrl: 'mds-input-range-value.css',
  shadow: true,
})
export class MdsInputRangeValue {
  /**
   * The value of the thumb. The range keeps it inside its `min` and `max`, on its `step` and
   * between the values next to it, and writes it here as the thumb moves; set it to move the
   * thumb. Without a value the thumb starts in the middle of the range, as a native range input
   */
  @Prop({ mutable: true, reflect: true }) value?: number;

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
