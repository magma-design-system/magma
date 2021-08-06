import { Component, Host, h, Prop, State } from '@stencil/core'
import clsx from 'clsx'
import { TypographyPrimaryType } from '../../types/typography'

@Component({
  tag: 'mds-accordion-item',
  styleUrl: 'mds-accordion-item.css',
  shadow: true,
})
export class MdsAccordionItem {

  @State() isOpened:boolean

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographyPrimaryType = 'h5'

  /**
   * Specifies if the accordion item is opened or not
   */
  @Prop() readonly opened?: boolean

  /**
   * Specifies the title shown when the accordion is closed or opened
   */
  @Prop() readonly description!: string

  componentWillLoad (): void {
    this.isOpened = this.opened
    console.log('componentWillLoad', this.isOpened)
  }

  private toggle = () => {
    this.isOpened = !this.isOpened
    console.log('toggle', this.isOpened)
  }

  render () {
    let fontSizeInherit: string
    switch (this.typography) {
    case 'h1': {
      fontSizeInherit = 'font-inherit'
      break
    }
    case 'h2': {
      fontSizeInherit = 'font-inherit'
      break
    }
    case 'h3': {
      fontSizeInherit = 'font-inherit'
      break
    }
    }
    return (
      <Host class={ clsx(this.isOpened && 'opened') }>
        <mds-grid class="header" onClick={ this.toggle }>
          <mds-text typography={ this.typography }>{ this.description }</mds-text>
          <mds-text class="icon-button" typography={ this.typography }>
            <mds-icon class={ clsx('icon', fontSizeInherit)} name={clsx(
              this.isOpened ? 'navigation-hide' : 'navigation-show',
            ) }/>
          </mds-text>
        </mds-grid>
        <div class={ clsx('contents', this.isOpened && 'contents--opened') }>
          <slot/>
        </div>
      </Host>
    )
  }

}
