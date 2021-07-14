import { Component, Host, h, Prop } from '@stencil/core'

import { CharacterSetType } from '../../types/character-set'
import { AutocompleteTypes } from '../../types/autocomplete'
import { EnctypeType } from '../../types/enctype'
import { FormMethodTypes } from '../../types/form-method'

@Component({
  tag: 'mds-form',
  styleUrl: 'mds-form.css',
  shadow: true,
})
export class MdsForm {

  /**
   * Specifies the character encodings that are to be used for the form submission
   */
  @Prop() readonly acceptcharset?: CharacterSetType

  /**
   * Specifies where to send the form-data when a form is submitted
   */
  @Prop() readonly action?: string

  /**
   * Specifies whether a form should have autocomplete on or off
   */
  @Prop() readonly autocomplete?: AutocompleteTypes

  /**
   * Specifies how the form-data should be encoded when submitting it to the server (only for method="post")
   */
  @Prop() readonly enctype?: EnctypeType

  /**
   * Specifies the HTTP method to use when sending form-data
   */
  @Prop() readonly method?: FormMethodTypes

  /**
   * Specifies the name of the form
   */
  @Prop() readonly name?: string

  /**
   * Specifies that the form should not be validated when submitted
   */
  @Prop() readonly novalidate?: boolean

  render() {
    return (
      <Host>
        <form>
          <slot></slot>
        </form>
      </Host>
    )
  }
}
