import { h } from '@stencil/core'
import { keyboardKeyNameDictionary } from '@dictionary/keyboard'
import { KeyboardKeyName } from '@type/keyboard'
import keyboardKeys from '@meta/keyboard/keys.json'

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
  <mds-table>
    <mds-table-header>
      <mds-table-header-cell label='combination'></mds-table-header-cell>
      <mds-table-header-cell label='description'></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="command"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          There are no specific key position for this combination, you can use both command keys.
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="commandleft"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          You must use the <b>left</b> command key or the test will fail.
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="commandright"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          You must use the <b>right</b> command key or the test will fail.
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="windows"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          There are no specific key position for this combination, you can use both command keys.
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="windowsleft"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          You must use the <b>left</b> command key or the test will fail.
        </mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="align-middle">
          <mds-keyboard {...args}>
            <mds-keyboard-key name="windowsright"></mds-keyboard-key>
            <mds-keyboard-key name="x"></mds-keyboard-key>
          </mds-keyboard>
        </mds-table-cell>
        <mds-table-cell class="align-middle">
          You must use the <b>right</b> command key or the test will fail.
        </mds-table-cell>
      </mds-table-row>
    </mds-table-body>
  </mds-table>


const TemplateKeysDictionary = () =>
  <div class="grid gap-600">
    <div class="grid gap-0">
      <mds-text typography='h4'>List of the available keys</mds-text>
      <mds-text>We've decided to keep only the more commond keys to avoid internationalization issues.</mds-text>
    </div>
    <mds-table interactive>
      <mds-table-header>
        <mds-table-header-cell label='key'></mds-table-header-cell>
        <mds-table-header-cell label='name' sortable></mds-table-header-cell>
        <mds-table-header-cell label='group' sortable></mds-table-header-cell>
      </mds-table-header>
      <mds-table-body>
        { keyboardKeyNameDictionary.map((code, index) => (
          <mds-table-row key={index}>
            <mds-table-cell class="align-middle" value={code}>
              <mds-keyboard try>
                <mds-keyboard-key name={code as KeyboardKeyName}></mds-keyboard-key>
              </mds-keyboard>
            </mds-table-cell>
            <mds-table-cell class="align-middle whitespace-nowrap"><mds-text typography='snippet'>{ code }</mds-text></mds-table-cell>
            <mds-table-cell class="align-middle w-full" value={ keyboardKeys[code].group }>{ keyboardKeys[code].group }</mds-table-cell>
          </mds-table-row>
        ))}
      </mds-table-body>
    </mds-table>
  </div>

export const Default = TemplateSingleKey.bind({})

export const MultipleKeys = TemplateMultipleKeys.bind({})

export const TestMultipleKeys = TemplateMultipleKeys.bind({})
TestMultipleKeys.args = {
  try: true,
}

export const KeysDictionary = TemplateKeysDictionary.bind({})
