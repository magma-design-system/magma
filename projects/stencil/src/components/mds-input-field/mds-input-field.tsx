import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';
import { MdsValidationErrors } from '@component/mds-input/meta/validators';
import { ThemeInputVariantType } from '@type/variant';

/**
 * @slot - Add the native input `HTML element` to this slot.
 */
@Component({
  tag: 'mds-input-field',
  styleUrl: 'mds-input-field.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputField {
  private slotInput: HTMLSlotElement;
  private appliedName?: string;

  @Element() host!: HTMLMdsInputFieldElement;

  private handleValidation(mdsInput: HTMLMdsInputElement) {
    // the event also bubbles from inputs nested in the slotted element (the mds-input-date
    // of an mds-input-date-range): only the ones exposing the validation API are read
    if (typeof mdsInput.getErrors !== 'function') return;
    // mdsInput.hasValidator().then(hasValidator => {
    // if (!hasValidator) return
    mdsInput.getErrors().then((errors: MdsValidationErrors) => {
      if (errors != null) {
        this.variant = 'error';
        const messages = Object.entries(errors)
          .map((v) => v[1])
          .filter((v) => v);
        this.message = messages.length !== 0 ? messages.join(';') : undefined;
        return;
      }
      this.variant = 'success';
      this.message = undefined;
    });
    // })
  }

  // the slotted control renders its native input inside its own shadow root, where neither a
  // `<label for>` nor an `aria-labelledby` of this one could reach it, an IDREF not crossing the
  // shadow boundary: the label travels down as the accessible name of the control instead
  private readonly nameSlottedControls = (): void => {
    this.slotInput?.assignedElements().forEach((control) => {
      const current = control.getAttribute('aria-label');
      // a name written on the control itself is the more specific one and stays; the one this
      // field wrote before is its own to update
      if (current !== null && current !== this.appliedName) return;
      if (this.label == null || this.label === '') {
        control.removeAttribute('aria-label');
        return;
      }
      control.setAttribute('aria-label', this.label);
    });
    this.appliedName = this.label;
  };

  componentDidLoad(): void {
    this.nameSlottedControls();
    const [mdsInput] = this.slotInput.assignedElements() as HTMLMdsInputElement[];
    if (mdsInput == null) {
      // slot assignment is empty in the hydrate/SSR runtime (assignedElements
      // returns [] in mock-doc); validation wiring happens on the client
      console.warn('mds-input-field: no mds-input assigned to the input slot');
      return;
    }
    mdsInput.addEventListener('mdsInputValidation', (event: Event) =>
      this.handleValidation(event.target as HTMLMdsInputElement),
    );
  }

  /**
   * Display a text on the top of the input text field
   */
  @Prop({ mutable: true }) label?: string;

  @Watch('label')
  labelChanged(): void {
    this.nameSlottedControls();
  }

  /**
   * Display a message at the bottom of the input text field
   */
  @Prop({ mutable: true }) message?: string;

  /**
   * Display the variant of a message at the bottom of the input text field
   */
  @Prop({ reflect: true, mutable: true }) variant?: ThemeInputVariantType = 'primary';

  render() {
    return (
      <Host>
        <mds-text class="label" typography="label">
          {this.label}
        </mds-text>
        <div class="message-window">
          <div class="content" part="content">
            <slot
              onSlotchange={this.nameSlottedControls}
              ref={(i) => (this.slotInput = i as HTMLSlotElement)}
            ></slot>
          </div>
          <div class="message">
            {this.message?.split(';').map((m, i) => (
              <mds-text typography="caption" key={i}>
                {m}
              </mds-text>
            ))}
          </div>
        </div>
      </Host>
    );
  }
}
