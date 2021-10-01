import { Component, Listen, Host, h, Prop } from '@stencil/core'

@Component({
  tag: 'mds-breadcrumb',
  styleUrl: 'mds-breadcrumb.css',
  shadow: true,
})
export class MdsBreadcrumb {

  /**
   * Choose to display or not the back arrow button
   */
  @Prop() readonly back?: boolean = true

  @Listen('clickBack', { capture: true })
  onClickBack ():void {
    console.log('click')
  }

  render () {
    return (
      <Host>
        { this.back &&
          <div class="back">
            <mds-icon name="arrow-back" />
          </div>
        }
        <slot name="breadcrumb-item"/>
      </Host>
    )
  }

}
