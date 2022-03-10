import { Component, Element, Host, Listen, h, State, Prop, Watch } from '@stencil/core'

@Component({
  tag: 'mds-stepper',
  styleUrl: 'mds-stepper.css',
  shadow: true,
})
export class MdsStepper {

  private items: NodeListOf<HTMLMdsStepperItemElement>
  @State() currentItem = 0
  @State() progress = 0
  @Element() private element: HTMLMdsStepperElement

  /**
   * Sets if the component should handle checked elements from the first to the last child or not
   */
  @Prop() readonly linear = true

  /**
   * Sets the current item to the given index: 0 is none selected, 1 is the first item selected, last number + 1 is all items checked
   */
  @Prop() readonly select: number = 1

  private queryItems = ():NodeListOf<HTMLMdsStepperItemElement> =>
    this.element.querySelectorAll<HTMLMdsStepperItemElement>('mds-stepper-item')

  private setCurrent = (index: number): void => {
    this.currentItem = index - 1
    this.items = this.queryItems()
    this.items.forEach((item, key) => {
      if (this.linear) {
        item.checked = false
        if (key < this.currentItem) {
          item.checked = true
        }
      }
      item.current = false
      if (key === this.currentItem) {
        item.current = true
        this.currentItem = key
      }
    })
  }

  componentWillLoad ():void {
    this.items = this.queryItems()
    this.items.forEach((item, key) => item.id = `item-${key}`)
    this.setCurrent(this.select)
  }

  private minmax = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max)

  componentWillRender ():void {
    this.progress = this.minmax(this.currentItem / (this.items.length - 1), 0, 1)
  }

  @Watch('select')
  validateOpened (newValue: number): void {
    this.setCurrent(newValue)
  }

  @Listen('currentEvent')
  changeEventHandler (event: CustomEvent<string>): void {
    this.items = this.queryItems()
    this.items.forEach((item, key) => {
      item.current = false
      if (`item-${key}` === event.detail) {
        item.current = true
        this.currentItem = key
      }
    })
  }

  render () {
    return (
      <Host>
        <div class="progress">
          <mds-progress class="bar" progress={this.progress}/>
        </div>
        <div class="items">
          <slot/>
        </div>
      </Host>
    )
  }
}
