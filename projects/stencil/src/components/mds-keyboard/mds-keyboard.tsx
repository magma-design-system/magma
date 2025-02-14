import { Component, Host, h, Element } from '@stencil/core'

@Component({
  tag: 'mds-keyboard',
  styleUrl: 'mds-keyboard.css',
  shadow: true,
})
export class MdsKeyboard {

  @Element() private host: HTMLMdsKeyboardElement
  private nodes: Node[]
  // private slot: HTMLSlotElement | null

  componentDidLoad (): void {
    // this.slot = this.host.shadowRoot?.querySelector('slot') as HTMLSlotElement
    // if (this.slot) {
    //   this.slot.addEventListener('slotchange', this.updateElements)
    // }
    this.updateElements()
  }

  private updateElements = (): void => {
    // if (!this.slot) {
    //   return
    // }
    // this.slot.removeEventListener('slotchange', this.updateElements)
    this.nodes = this.host.shadowRoot?.querySelectorAll('slot')[0]?.assignedNodes() as Node[]
    const filteredNodes = this.nodes.filter((node): node is Element => node.nodeType === 1)
    filteredNodes.forEach((node: Element, index: number) => {
      if (index < filteredNodes.length - 1) {
        const separator: HTMLMdsTextElement = document.createElement('mds-text')
        separator.typography = 'detail'
        separator.innerHTML = '<b>+</b>'
        node.after(separator)
      }
    })
    // this.slot.addEventListener('slotchange', this.updateElements)
  }

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
