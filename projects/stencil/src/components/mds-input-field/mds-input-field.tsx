import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';
import { MdsValidationErrors } from '@component/mds-input/meta/validators';
import { ThemeInputVariantType } from '@type/variant';

/**
 * @slot - Add one `mds-input` or `mds-input-date`: the field names it with `label` and shows its
 * validation errors in `message`. Another control, a native `<input>` among them, gets the name
 * but no validation messages.
 * @part content - The wrapper of the default slot, above the message
 * @category forms
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

  // the label is not a `<label for>` (see above), so the click a native label turns into the focus
  // of its control is written here: the first slotted control takes it, through the method that
  // reaches its native input when it has one (in its shadow root, out of reach of `focus()` on a
  // host that does not delegate it: `setFocus()` of `mds-input`, `focusInput()` of
  // `mds-input-date`), unless it is disabled, which a native label leaves alone as well. `:disabled`
  // matches the `disabled` of a native control and of a form-associated one (both reflect it), and
  // the `<fieldset disabled>` around either. The label holds only text: no interactive element of
  // its own to leave the click to
  private readonly focusSlottedControl = (): void => {
    const control = this.slotInput?.assignedElements()[0] as
      | (HTMLElement & { focusInput?: () => Promise<void>; setFocus?: () => Promise<void> })
      | undefined;
    if (control == null || control.matches(':disabled')) return;
    if (typeof control.setFocus === 'function') {
      void control.setFocus();
      return;
    }
    if (typeof control.focusInput === 'function') {
      void control.focusInput();
      return;
    }
    control.focus();
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
   * An icon before the label, in the colour of the variant: the state the message tells, seen at a
   * glance (a verdict on the value, a check passed). Decorative: the message says the state in
   * words, and the label stays the name of the control
   */
  @Prop() readonly icon?: string;

  /**
   * States that the answer of the field is short, such as a house number, a postcode, a tax code
   * or a date: in a `field-group` the field takes half the column, and two short fields in a row
   * share it (#1189, widths/field). The group lays it out; on its own the field keeps its width
   */
  @Prop({ reflect: true }) readonly short?: boolean = false;

  /**
   * Display the variant of a message at the bottom of the input text field
   */
  @Prop({ reflect: true, mutable: true }) variant?: ThemeInputVariantType = 'primary';

  render() {
    const { icon } = this;
    return (
      <Host>
        {icon !== undefined && icon !== '' ? (
          <div class="label-row">
            <mds-icon aria-hidden="true" class="label-icon" name={icon} />
            <mds-text class="label" typography="label" onClick={this.focusSlottedControl}>
              {this.label}
            </mds-text>
          </div>
        ) : (
          <mds-text class="label" typography="label" onClick={this.focusSlottedControl}>
            {this.label}
          </mds-text>
        )}
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
