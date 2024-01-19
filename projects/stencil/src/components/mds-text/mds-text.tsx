import { Component, Element, Host, Prop, h } from '@stencil/core'
import { TypographyTagType, TextAnimationType } from './meta/types'
import { TypographyTruncateType } from '@type/text'
import { TypographyType, TypographyVariants } from '@type/typography'
import { typographyDefaultsVariant } from './meta/variants'
import RandomText from '@common/yugop'

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component( {
  tag: 'mds-text',
  styleUrl: 'mds-text.css',
  shadow: true,
} )
export class MdsText {

  private randomTextOptions = {
    speed: 2,
    placeholderChar: '',
    frameOffset: 10,
    charOffset: 20,
    charStep: 15,
  }

  // private observer: MutationObserver

  @Element() host: HTMLMdsTextElement

  /**
   * Specifies if the text is animated when it is rendered
   * https://github.com/zenoplex/random-text
   * https://github.com/vitto/vit.to/blob/master/frontend/js/textShuffle.js
   */
  @Prop() readonly animation?: TextAnimationType = 'none'

  /**
   * Specifies the HTML tag of the element
   */
  @Prop({ mutable: true, reflect: true }) tag?: TypographyTagType

  /**
   * Specifies if the text shoud be truncated or should behave as a normal text
   */
  @Prop({ reflect: true }) readonly truncate?: TypographyTruncateType

  /**
   * Specifies the font typography of the element
   */
  @Prop({ reflect: true }) readonly typography: TypographyType = 'detail'

  /**
   * Specifies the variant for `typography`
   */
  @Prop({ reflect: true }) readonly variant?: TypographyVariants

  // private onSlotChangeHandler = (): void => {
  //   console.info('onSlotChangeHandler')
  //   const elements = this.host.shadowRoot?.querySelector('slot')?.assignedNodes()[0]
  //   if (!elements) {
  //     console.info('No slotted elements found.')
  //     return
  //   }
  //   console.info(elements)
  // }

  private onCharacterDataModified = (): void => {
    this.host.firstChild?.removeEventListener('DOMCharacterDataModified', this.onCharacterDataModified.bind(this), false)
    const newText = this.host.innerText

    const randomText = new RandomText({
      str: newText,
      onProgress: (str: string) => { this.host.innerHTML = str },
      onComplete: () => { this.observeTextChange() },
      ...this.randomTextOptions,
    })
    randomText.start()
  }

  // private observeCallback = (): void => {
  //   console.info('something is changed')
  // }

  private observeTextChange = (): void => {
    console.info('observeTextChange')
    // const config = { attributes: false, childList: true, subtree: true }
    // this.observer = new MutationObserver(this.observeCallback)
    // this.observer.observe(this.host.firstChild as ChildNode, config)

    this.host.firstChild?.addEventListener('DOMCharacterDataModified', this.onCharacterDataModified.bind(this), false)
  }

  componentWillRender = (): void => {
    const { tag } = typographyDefaultsVariant[this.typography]
    this.tag = this.tag ?? tag as TypographyTagType
  }

  componentDidLoad = (): void => {
    this.observeTextChange()
  }

  // disconnectedCallback = (): void => {
  //   this.observer.disconnect()
  // }

  render () {
    return (
      <Host>
        <tag class="text">
          <slot></slot>
        </tag>
      </Host>
    )
  }
}
