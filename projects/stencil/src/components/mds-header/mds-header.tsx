import { Component, Element, Host, h, State } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-header',
  styleUrl: 'mds-header.css',
  shadow: true,
})
export class MdsHeader {

  private hasNav: boolean
  private hasNavMobile: boolean
  @Element() hostElement: HTMLMdsHeaderElement

  @State() modalOpened:boolean

  componentWillLoad (): void {
    this.hasNav = this.hostElement.querySelector('[slot="nav"]') !== null
    this.hasNavMobile = this.hostElement.querySelector('[slot="nav-mobile"]') !== null
  }

  render () {
    return (
      <Host>
        <header class={clsx('header', this.modalOpened && 'header--opened')}>
          <div class="contents">
            <div class="logo">
              <slot/>
            </div>
            { this.hasNav &&
              <nav class="nav">
                <slot name="nav"/>
              </nav>
            }
            { this.hasNavMobile &&
              <mds-icon class="icon" name="menu" onClick={() => { this.modalOpened = true }}/>
            }
          </div>
        </header>
        { this.hasNavMobile &&
          <div class="nav-mobile">
            <mds-modal opened={ this.modalOpened } onClose={ () => { this.modalOpened = false } }>
              <slot name="nav-mobile"/>
            </mds-modal>
          </div>
        }
      </Host>
    )
  }
}
