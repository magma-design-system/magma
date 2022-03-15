import { Component, Listen, Host, h, Prop } from '@stencil/core'
import miBaselineArrowBack from '@icon/mi/baseline/arrow-back.svg'

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
            <i class="svg icon" innerHTML={miBaselineArrowBack}/>
          </div>
        }
        <slot name="breadcrumb-item"/>
      </Host>
    )
  }

}
