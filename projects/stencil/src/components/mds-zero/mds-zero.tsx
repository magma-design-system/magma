import { Component, Host, h } from '@stencil/core'

/**
 * @slot default - Add `HTML elements` or `components` to this slot, it is **recommended** to use `mds-img` or `img` element.
 * @slot content - Put text elements here,
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @part contents - Selects the wrapper of the elements with attribute `slot="content"`.
 * @part actions - Selects the wrapper of the elements with attribute `slot="action"`.
 */

@Component({
  tag: 'mds-zero',
  styleUrl: 'mds-zero.css',
  shadow: true,
})
export class MdsZero {

  render () {
    return (
      <Host>
        <slot/>
        <div class="contents" part="contents">
          <slot name="content"/>
        </div>
        <footer class="actions" part="actions">
          <slot name="action"/>
        </footer>
      </Host>
    )
  }

}
