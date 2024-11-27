import miBaselineClose from '@icon/mi/baseline/close.svg'
import { Component, Element, Event, EventEmitter, Host, h, Prop, State, Method } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'
import { LabelVariantType } from '@type/variant'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot title - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-note',
  styleUrl: 'mds-note.css',
  shadow: true,
})
export class MdsNote {

  @Element() private host: HTMLMdsNoteElement
  private km = new KeyboardManager()
  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
  }

  /**
   * Enables the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean = false

  /**
   * Specifies the color variant for the element
   */
  @Prop({ reflect: true }) readonly variant?: LabelVariantType = 'yellow'

  private onClickClose = () => {
    this.deleteEvent.emit()
  }

  /**
   * Emits when the note has to be cancelled
   */
  @Event({ eventName: 'mdsNoteDelete' }) deleteEvent: EventEmitter<void>

  componentWillLoad ():void {
    this.t.lang(this.host)
  }

  componentDidLoad ():void {
    this.km.addElement(this.host)
    this.km.attachClickBehavior()
  }

  componentDidUpdate ():void {
    if (this.deletable) {
      this.km.addElement(this.host)
      this.km.attachClickBehavior()
      return
    }

    this.km.detachClickBehavior()
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  render () {
    return (
      <Host role="note">
        { this.deletable && <mds-button title={this.t.get('deleteLabel')} icon={miBaselineClose} class="button-close" onClick={ this.onClickClose.bind(this) }></mds-button> }
        <slot name="title"/>
        <slot/>
        <div aria-hidden="true" class="fold"/>
      </Host>
    )
  }
}
