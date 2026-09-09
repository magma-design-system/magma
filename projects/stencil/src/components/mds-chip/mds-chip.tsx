import { Component, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';
import miBaselineCancel from '@icon/mi/baseline/cancel.svg';
import { setAttributeIfEmpty } from '@common/aria';
import { MdsChipEvent } from './meta/interface';
import { KeyboardManager } from '@common/keyboard-manager';
import { ChipVariantType } from '@type/variant';
import { ToneMinimalVariantType } from '@type/tone';

import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

@Component({
  tag: 'mds-chip',
  styleUrl: 'mds-chip.css',
  shadow: true,
})
export class MdsChip {
  @Element() host: HTMLMdsChipElement;
  private km = new KeyboardManager();
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * Adds ARIA support to the element if has interaction
   */
  @Prop({ reflect: true, mutable: true }) clickable?: boolean;

  /**
   * Shows the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean;

  /**
   * Sets the component disabled status
   */
  @Prop() readonly disabled?: boolean = false;

  /**
   * The icon displayed to the left of the component's label
   */
  @Prop() readonly icon?: string;

  /**
   * The label displayed to the right of the component's icon
   */
  @Prop({ reflect: true }) readonly label!: string;

  /**
   * Sets the component selected
   */
  @Prop({ reflect: true, mutable: true }) selected?: boolean;

  /**
   * Sets if the component change is status to selected when is clicked
   */
  @Prop({ reflect: true }) readonly selectable?: boolean = false;

  /**
   * Sets the color variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ChipVariantType = 'primary';

  /**
   * Sets the color variant tone of the component
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType = 'strong';

  /**
   * Emits when the component's label is clicked
   */
  @Event({ eventName: 'mdsChipClickLabel' }) clickLabelEvent: EventEmitter<MdsChipEvent>;

  /**
   * Emits when the component's delete button is clicked
   */
  @Event({ eventName: 'mdsChipDelete' }) deleteEvent: EventEmitter<MdsChipEvent>;

  /**
   * Emits when the component's label is clicked and when `selectable` attribute is set to `true`
   */
  @Event({ eventName: 'mdsChipSelect' }) selectEvent: EventEmitter<MdsChipEvent>;

  @Watch('selectable')
  handleSelectableProp(newValue: boolean): void {
    if (newValue) {
      this.clickable = true;
    }
  }

  @Watch('clickable')
  handleClickableProp(newValue: boolean): void {
    this.handleClickableElement(newValue);
    this.handleClickableKeyboard(newValue);
  }

  @Watch('selected')
  handleSelectedProp(newValue: boolean): void {
    if (newValue === false) {
      this.selected = undefined;
    }
  }

  private onClickLabelHandler(event: Event): void {
    if (this.selectable) {
      this.selected = !this.selected;
      if (this.selected === false) {
        this.selected = undefined;
      }
      this.selectEvent.emit({ event, element: this.host, selected: this.selected });
      return;
    }
    this.clickLabelEvent.emit({ event, element: this.host });
  }

  private onDeleteHandler = (event: Event): void => {
    this.deleteEvent.emit({ event, element: this.host });
  };

  private handleClickableKeyboard = (isClickable: boolean): void => {
    if (isClickable) {
      const label = this.host.shadowRoot?.querySelector('.label') as HTMLElement;
      this.km.addElement(label, 'label');
      this.km.attachClickBehavior('label');
      return;
    }
    this.km.detachClickBehavior('label');
  };

  private handleClickableElement = (isClickable: boolean): void => {
    const label = this.host.shadowRoot?.querySelector('.label') as HTMLElement;
    if (label == null) {
      return;
    }
    if (isClickable) {
      setAttributeIfEmpty(label, 'role', 'button');
      label.addEventListener('click', this.onClickLabelHandler.bind(this));
      return;
    }
    label.removeAttribute('role');
    label.removeEventListener('click', this.onClickLabelHandler.bind(this));
  };

  componentDidLoad(): void {
    // A @Watch does not fire for the value a prop is born with, so `handleSelectableProp`
    // only ever ran for a `selectable` set from JS after load: a chip that arrives from
    // markup as <mds-chip selectable> stayed non-clickable, with no role, no tabindex and
    // a click that toggled nothing - while the readme promises that "selectable implies
    // clickable". Turning it on here lets the clickable watcher do the wiring exactly once,
    // which is why this returns instead of falling through to the block below.
    if (this.selectable && !this.clickable) {
      this.clickable = true;
      return;
    }
    if (this.clickable) {
      this.handleClickableElement(true);
      this.handleClickableKeyboard(true);
    }
  }

  disconnectedCallback(): void {
    this.km.detachClickBehavior('label');
  }

  render() {
    return (
      <Host
        aria-disabled={this.disabled ? 'true' : 'false'}
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-theme={preferenceStore.state.theme}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {this.icon && (
          <div aria-hidden="true" class="icon-area">
            <mds-icon class="icon" name={this.icon} />
          </div>
        )}
        <div class="label-wrapper">
          {this.clickable ? (
            /* The label carries role="button" (see handleClickableElement), and a toggle
             * button states its state through aria-pressed: without it `selected` reaches
             * the eye through the border and reaches a screen reader not at all (WCAG
             * 4.1.2). Only when selectable, because aria-pressed on something that is not
             * a button is invalid, and a merely clickable chip toggles nothing. */
            <mds-text
              aria-pressed={this.selectable ? (this.selected ? 'true' : 'false') : undefined}
              class="label label--interactive"
              tabindex="0"
              typography="caption"
              truncate="word"
            >
              {this.label}
            </mds-text>
          ) : (
            <mds-text class="label" typography="caption" truncate="word">
              {this.label}
            </mds-text>
          )}
        </div>
        {this.deletable && (
          <mds-button
            class="button-delete"
            icon={miBaselineCancel}
            onClick={this.onDeleteHandler}
            title={`${this.t.get('deleteLabel')} ${this.label}`}
            variant="dark"
            tone="text"
            size="sm"
          ></mds-button>
        )}
      </Host>
    );
  }
}
