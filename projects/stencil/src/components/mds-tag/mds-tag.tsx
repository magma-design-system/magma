import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import { TypographyType } from '../../types/typography'
import { ThemeFullVariantType, ToneSimpleVariantType } from '../../types/variant'
import clsx from 'clsx'

@Component({
  tag: 'mds-tag',
  styleUrl: 'mds-tag.css',
  shadow: true,
})
export class MdsTag {

  @Element() private element: HTMLMdsTagElement

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) variant?: ThemeFullVariantType = 'sky'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) tone?: ToneSimpleVariantType = 'quiet'

  /**
   * Truncates text inside the label or displays it in multiline if needed
   */
  @Prop() readonly truncate?: boolean = true

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographyType = 'detail'

  /**
   * Enables the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean = false

  private onClickClose = (ev: Event) => {
    ev.stopPropagation()
    ev.preventDefault()
    this.clickClose.emit(this.element)
  }

  /**
   * Emits when the label has to be cancelled
   */
  @Event() clickClose: EventEmitter<HTMLMdsTagElement>

  render () {
    return (
      <Host>
        <mds-text typography={this.typography} class={clsx('text', this.truncate && 'truncate')}>
          <slot></slot>
        </mds-text>
        { this.deletable && <mds-icon name="close" class="close" onClick={ this.onClickClose.bind(this) }/> }
      </Host>
    )
  }
}
