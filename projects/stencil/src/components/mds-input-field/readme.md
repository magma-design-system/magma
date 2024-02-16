# mds-input-field



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description                                                                                                     | Type                                                                                                                                              | Default          |
| ---------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `autocomplete`   | `autocomplete`    | Specifies whether the element should have autocomplete enabled                                                  | `AutocompleteType \| undefined`                                                                                                                   | `'off'`          |
| `autofocus`      | `autofocus`       | Specifies that the element should automatically get focus when the page loads                                   | `boolean`                                                                                                                                         | `false`          |
| `await`          | `await`           | Specifies if the spinner icon is shown, replacing the icon if present                                           | `boolean`                                                                                                                                         | `false`          |
| `controlsIcon`   | `controls-icon`   | Specifies the icon type of the counter button when the input type is set to `number`                            | `"arithmetic" \| "arrow" \| undefined`                                                                                                            | `'arrow'`        |
| `controlsLayout` | `controls-layout` | Specifies the layout of the counter button when the input type is set to `number`                               | `"horizontal" \| "vertical" \| undefined`                                                                                                         | `'vertical'`     |
| `disabled`       | `disabled`        | If true, the element is displayed as disabled                                                                   | `boolean \| undefined`                                                                                                                            | `false`          |
| `disabledLabel`  | `disabled-label`  | Specifies the label for the displayed state disabled                                                            | `string \| undefined`                                                                                                                             | `'disattivato'`  |
| `icon`           | `icon`            | An icon displayed at the right of the input                                                                     | `string \| undefined`                                                                                                                             | `undefined`      |
| `label`          | `label`           | Display a text on the top of the input text field                                                               | `string \| undefined`                                                                                                                             | `undefined`      |
| `max`            | `max`             | Specifies the maximum value use it with input type="number" or type="date" Example: max="180", max="2046-12-04" | `string \| undefined`                                                                                                                             | `undefined`      |
| `maxlength`      | `maxlength`       | Specifies the maximum number of characters allowed in an element use it with input type="number"                | `number \| undefined`                                                                                                                             | `undefined`      |
| `message`        | `message`         | Display a message at the bottom of the input text field                                                         | `string \| undefined`                                                                                                                             | `undefined`      |
| `min`            | `min`             | Specifies the minimum value use it with input type="number" or type="date" Example: min="-3", min="1988-04-15"  | `string \| undefined`                                                                                                                             | `undefined`      |
| `minlength`      | `minlength`       | Specifies the minimum number of characters allowed in an element use it with input type="number"                | `number \| undefined`                                                                                                                             | `undefined`      |
| `name`           | `name`            | Is needed to reference the form data after the form is submitted                                                | `string \| undefined`                                                                                                                             | `undefined`      |
| `pattern`        | `pattern`         | Specifies a regular expression that element\'s value is checked against                                         | `string \| undefined`                                                                                                                             | `undefined`      |
| `placeholder`    | `placeholder`     | Specifies a short hint that describes the expected value of the element                                         | `string`                                                                                                                                          | `''`             |
| `readonly`       | `readonly`        | Specifies that the element is read-only                                                                         | `boolean \| undefined`                                                                                                                            | `false`          |
| `readonlyLabel`  | `readonly-label`  | Specifies the label for the displayed state read-only                                                           | `string \| undefined`                                                                                                                             | `'sola lettura'` |
| `required`       | `required`        | Specifies that the element must be filled out before submitting the form                                        | `boolean \| undefined`                                                                                                                            | `false`          |
| `requiredLabel`  | `required-label`  | Specifies the label for the displayed state required                                                            | `string \| undefined`                                                                                                                             | `'obbligatorio'` |
| `step`           | `step`            | Specifies the interval between legal numbers in an input field                                                  | `string \| undefined`                                                                                                                             | `undefined`      |
| `tip`            | `tip`             | Display the variant of a message at the bottom of the input text field                                          | `string \| undefined`                                                                                                                             | `undefined`      |
| `type`           | `type`            | Specifies the type of input element                                                                             | `"cc" \| "cf" \| "date" \| "email" \| "isbn" \| "number" \| "password" \| "piva" \| "search" \| "tel" \| "text" \| "textarea" \| "time" \| "url"` | `'text'`         |
| `typography`     | `typography`      | Specifies the typography of input element                                                                       | `"detail" \| "snippet"`                                                                                                                           | `'detail'`       |
| `value`          | `value`           | Specifies the value of the input element                                                                        | `string`                                                                                                                                          | `''`             |
| `variant`        | `variant`         | Display the variant of a message at the bottom of the input text field                                          | `"error" \| "info" \| "success" \| "warning" \| undefined`                                                                                        | `undefined`      |


## Events

| Event                  | Description                                                                      | Type                               |
| ---------------------- | -------------------------------------------------------------------------------- | ---------------------------------- |
| `mdsInputFieldBlur`    | Emits a void event when input element is blurred                                 | `CustomEvent<void>`                |
| `mdsInputFieldChange`  | Emits an InputValue when the value of the input element changes                  | `CustomEvent<MdsInputEventDetail>` |
| `mdsInputFieldFocus`   | Emits a void event when input element is focused                                 | `CustomEvent<void>`                |
| `mdsInputFieldKeydown` | Emits a KeyboardEvent when a keboard key is pressed on the focused input element | `CustomEvent<KeyboardEvent>`       |


## Methods

### `addValidator(validator: MdsValidatorFn) => Promise<void>`



#### Parameters

| Name        | Type                                             | Description |
| ----------- | ------------------------------------------------ | ----------- |
| `validator` | `(input: string) => MdsValidationErrors \| null` |             |

#### Returns

Type: `Promise<void>`



### `getErrors() => Promise<MdsValidationErrors | null>`



#### Returns

Type: `Promise<MdsValidationErrors | null>`



### `getInputElement() => Promise<HTMLInputElement | HTMLTextAreaElement | null | undefined>`

Returns the native `<input>` element used under the hood.

#### Returns

Type: `Promise<HTMLInputElement | HTMLTextAreaElement | null | undefined>`



### `removeValidator(validator: MdsValidatorFn) => Promise<void>`



#### Parameters

| Name        | Type                                             | Description |
| ----------- | ------------------------------------------------ | ----------- |
| `validator` | `(input: string) => MdsValidationErrors \| null` |             |

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`

Sets focus on the specified `my-input`.
Use this method instead
of the global `input.focus()`.

#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                                   | Description                                                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `--mds-input-field-message-background` | Sets the message background color of the component, will be visible only if there is a text defined by `tip` component attribute |
| `--mds-input-field-message-color`      | Sets the message text color of the component                                                                                     |


## Dependencies

### Depends on

- [mds-text](../mds-text)
- [mds-input](../mds-input)

### Graph
```mermaid
graph TD;
  mds-input-field --> mds-text
  mds-input-field --> mds-input
  mds-input --> mds-button
  mds-input --> mds-text
  mds-input --> mds-icon
  mds-input --> mds-spinner
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-input-field fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
