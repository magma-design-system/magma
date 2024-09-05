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
  @State() actualValue = '0'
  private hasIcon: boolean
  private isIntersecting: boolean
  private observer: IntersectionObserver

  private setValue = () => {
    if (this.isIntersecting) {
      this.actualValue = this.value.toString()
    }
  }

  componentWillLoad (): void {
    if (document) {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(`
        @property --mds-kpi-item-value {
          inherits: false;
          initial-value: 0;
          syntax: '<integer>';
        }
      `)
      document.adoptedStyleSheets.push(sheet)
    }

    this.hasIcon = this.hostElement.querySelector('[slot="icon"]') !== null
    this.observer = new window.IntersectionObserver(([entry]) => {
      this.isIntersecting = entry.isIntersecting
      if (this.actualValue !== this.value.toString()) {
        this.setValue()
      }
    }, {
      root: null,
      threshold: 0.5, // set offset 0.1 means trigger if atleast 10% of element in viewport
    })
    this.observer.observe(this.hostElement)
  }

  componentDidUpdate (): void {
    this.setValue()
  }

  /**
   * Specifies the number to be displayed in the KPI element
   */
  @Prop() readonly value!: number

  /**
   * Specifies the description under the value in the KPI element
   */
  @Prop() readonly description!: string

  /**
   * Specifies the icon on the top of the KPI element
   */
  @Prop() readonly icon?: string

  render () {
    return (
      <Host>
        { this.hasIcon &&
          <div class="icon">
            <slot name="icon"/>
          </div>
        }
        <div class="info">
          <mds-text class="value" typography="h2" style={{ '--value': this.actualValue }}/>
          <mds-text class="description" typography="label">{ this.description }</mds-text>
        </div>
      </Host>
    )
  }

}
