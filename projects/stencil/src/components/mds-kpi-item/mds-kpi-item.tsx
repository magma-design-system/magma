import { Component, Element, Host, Prop, h, State } from '@stencil/core'

/**
 * @slot icon - Insert an icon image, it can be `HTML elements` or `components`, it is **recommended** to add `mds-icon` element.
 */

@Component({
  tag: 'mds-kpi-item',
  styleUrl: 'mds-kpi-item.css',
  shadow: true,
})
export class MdsKpiItem {

  @Element() hostElement: HTMLMdsKpiItemElement
  private hasIcon: boolean
  @State() isIntersecting: boolean
  private observer: IntersectionObserver

  /**
   * Specifies the number to be displayed in the KPI element
   */
  @Prop() readonly label?: string

  /**
   * Specifies the description under the value in the KPI element
   */
  @Prop() readonly description?: string

  /**
   * Specifies the description under the value in the KPI element
   */
  @Prop() readonly threshold?: number = 0

  /**
   * Specifies the icon on the top of the KPI element
   */
  @Prop() readonly icon?: string

  private setObserver = (): void => {
    this.observer = new window.IntersectionObserver(([entry]) => {
      this.isIntersecting = entry.isIntersecting
    }, {
      root: null,
      threshold: this.threshold, // set offset 0.1 means trigger if atleast 10% of element in viewport
    })
    this.observer.observe(this.hostElement)
  }

  componentWillLoad (): void {
    this.hasIcon = this.hostElement.querySelector('[slot="icon"]') !== null
    if (this.threshold !== 0) {
      this.setObserver()
    }
  }

  render () {
    return (
      <Host>
        { this.hasIcon &&
          <div class="icon">
            <slot name="icon"/>
          </div>
        }
        <div class="info">
          { this.label && this.threshold !== 0 && <mds-text class="value" typography="h2" text={ this.isIntersecting ? this.label : '' } animation="yugop"></mds-text> }
          { this.label && this.threshold === 0 && <mds-text class="value" typography="h2">{ this.label }</mds-text> }
          { this.description && this.threshold !== 0 && <mds-text class="description" typography="label" text={ this.isIntersecting ? this.description : '' } animation="yugop"></mds-text> }
          { this.description && this.threshold === 0 && <mds-text class="description" typography="label">{ this.description }</mds-text> }
        </div>
      </Host>
    )
  }

}
