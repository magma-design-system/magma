import { Component, Element, Host, Prop, h, State } from '@stencil/core'

/**
 * @part content - Selects the label and description wrapper element
 * @part icon - Selects the icon element
 * @part icon-container - Selects the icon wrapper element
 */

@Component({
  tag: 'mds-kpi-item',
  styleUrl: 'mds-kpi-item.css',
  shadow: true,
})
export class MdsKpiItem {

  @Element() hostElement: HTMLMdsKpiItemElement
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
   * Specifies the page threshold which starts the text animation
   */
  @Prop() readonly threshold?: number = 0

  /**
   * Specifies the icon on the top of the KPI element
   */
  @Prop() readonly icon?: string

  private setObserver = (): void => {
    if (typeof window === 'undefined') return
    this.observer = new window.IntersectionObserver(([entry]) => {
      this.isIntersecting = entry.isIntersecting
    }, {
      root: null,
      threshold: this.threshold, // set offset 0.1 means trigger if atleast 10% of element in viewport
    })
    this.observer.observe(this.hostElement)
  }

  componentWillLoad (): void {
    if (this.threshold !== 0) {
      this.setObserver()
    }
  }

  render () {
    return (
      <Host aria-label={ `${this.label}: ${this.description}` } role="listitem">
        { this.icon &&
          <div class="icon-container" part="icon-container">
            <mds-icon class="icon" name={ this.icon } part="icon"></mds-icon>
          </div>
        }
        <div class="info" part="content" aria-hidden="true">
          { this.label && this.threshold !== 0 && <mds-text class="value" typography="h2" text={ this.isIntersecting ? this.label : '' } animation="yugop"></mds-text> }
          { this.label && this.threshold === 0 && <mds-text class="value" typography="h2">{ this.label }</mds-text> }
          { this.description && this.threshold !== 0 && <mds-text class="description" typography="label" text={ this.isIntersecting ? this.description : '' } animation="yugop"></mds-text> }
          { this.description && this.threshold === 0 && <mds-text class="description" typography="label">{ this.description }</mds-text> }
        </div>
      </Host>
    )
  }

}
