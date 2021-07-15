import { Component, Host, h, Prop } from '@stencil/core'

import { CharacterSetType } from '../../types/character-set'
import { FormAutocompleteType } from '../../types/form-autocomplete'
import { EnctypeType } from '../../types/enctype'
import { FormMethodType } from '../../types/form-method'
import { FormRelType } from '../../types/form-rel'

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
  @Prop() readonly autocomplete?: FormAutocompleteType

  /**
   * Specifies how the form-data should be encoded when submitting it to the server (only for method="post")
   */
  @Prop() readonly enctype?: EnctypeType

  /**
   * Specifies the HTTP method to use when sending form-data
   */
  @Prop() readonly method?: FormMethodType

  /**
   * Specifies the name of the form
   */
  @Prop() readonly name?: string

  /**
   * Specifies that the form should not be validated when submitted
   */
  @Prop() readonly novalidate?: boolean

  /**
   * Specifies the relationship between the current document and the linked document
   */
  @Prop() readonly rel?: FormRelType

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
