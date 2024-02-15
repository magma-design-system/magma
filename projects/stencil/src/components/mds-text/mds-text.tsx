import { Component, Element, Host, Prop, h, Watch } from '@stencil/core'
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
    placeholderChar: ' ',
    frameOffset: 10,
    charOffset: 20,
    charStep: 15,
  }

  private randomText:RandomText

  @Element() host: HTMLMdsTextElement

  /**
   * Specifies if the text is animated when it is rendered
   */
  @Prop() readonly animation?: TextAnimationType = 'none'

  /**
   * Specifies the HTML tag of the element
   */
  @Prop({ mutable: true, reflect: true }) tag: TypographyTagType

  /**
   * Specifies the text string to the component instead of passing an HTML node
   */
  @Prop({ reflect: true }) readonly text?: string

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

  private animateText = (text: string): void => {
    const textElement = this.host.shadowRoot?.querySelector('.text') as HTMLElement
    this.randomText = new RandomText({
      str: text,
      onProgress: (str: string) => { textElement.innerHTML = str },
      ...this.randomTextOptions,
    })
    this.randomText.start()
  }

  componentWillRender (): void {
    const { tag } = typographyDefaultsVariant[this.typography]
    this.tag = this.tag ?? tag as TypographyTagType
  }

  @Watch('text')
  textHandler (newValue?: string): void {
    if (this.animation === 'none') {
      return
    }
    if (this.randomText) {
      this.randomText.stop()
    }
    if (newValue) {
      this.animateText(newValue)
    }
  }

  render () {
    return (
      <Host>
        <this.tag class="text">
          { !this.text
            ? <slot></slot>
            : this.text
          }
        </this.tag>
      </Host>
    )
  }
}
