import { h } from '@stencil/core'
import { keyboardKeyNameDictionary } from '@dictionary/keyboard'
import { KeyboardKeyName } from '@type/keyboard'

export default {
  title: 'UI / Keyboard',
  argTypes: {
    try: {
      type: { name: 'boolean' },
      description: 'Sets if the keyboard key combination test is enabled',
    },
  },
}

const TemplateSingleKey = args =>
  <mds-keyboard {...args}>
    <mds-keyboard-key name="f1"></mds-keyboard-key>
  </mds-keyboard>

const TemplateMultipleKeys = args =>
  <mds-keyboard {...args}>
    <mds-keyboard-key name="control"></mds-keyboard-key>
    <mds-keyboard-key name="x"></mds-keyboard-key>
  </mds-keyboard>

const TemplateKeysDictionary = () =>
  <mds-table>
    <mds-table-header>
      <mds-table-header-cell label='key'></mds-table-header-cell>
      <mds-table-header-cell label='name'></mds-table-header-cell>
      <mds-table-header-cell label='index'></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      { keyboardKeyNameDictionary.map((code, index) => (
        <mds-table-row key={index}>
          <mds-table-cell class="align-middle">
            <mds-keyboard try>
              <mds-keyboard-key name={code as KeyboardKeyName}></mds-keyboard-key>
            </mds-keyboard>
          </mds-table-cell>
          <mds-table-cell class="align-middle whitespace-nowrap"><mds-text typography='snippet'>{ code }</mds-text></mds-table-cell>
          <mds-table-cell class="align-middle w-full">{ index + 1 }</mds-table-cell>
        </mds-table-row>
      ))}

    </mds-table-body>

  </mds-table>

export const Default = TemplateSingleKey.bind({})

export const MultipleKeys = TemplateMultipleKeys.bind({})

export const TestMultipleKeys = TemplateMultipleKeys.bind({})
TestMultipleKeys.args = {
  try: true,
}

export const KeysDictionary = TemplateKeysDictionary.bind({})
