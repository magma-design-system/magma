import { Component, Host, h, Prop } from '@stencil/core'

import { CharacterSetType } from '../../types/character-set'
import { EnctypeType } from '../../types/enctype'
import { FormAutocompleteType } from '../../types/form-autocomplete'
import { FormMethodType } from '../../types/form-method'

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
   * Specifies one or more classnames for an element (refers to a class in a style sheet)
   */
  @Prop() readonly class?: string

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
   * Specifies a name or a keyword that indicates where to display the response that is received after submitting the form.
   * Possible values are _blank, _self, _parent, _top or a custom frame name
   */
  @Prop() readonly target?: string

  render () {
    return (
      <Host>
        <form
          acceptcharset={this.acceptcharset}
          action={this.action}
          autocomplete={this.autocomplete}
          class={this.class}
          enctype={this.enctype}
          method={this.method}
          name={this.name}
          novalidate={this.novalidate}
          target={this.target}
        >
          <slot></slot>
        </form>
      </Host>
    )
  }
}
