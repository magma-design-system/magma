# mds-input-select



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                             | Type               | Default     |
| ------------- | ------------- | ----------------------------------------------------------------------- | ------------------ | ----------- |
| `options`     | `options`     | Specifies a short hint that describes the expected value of the element | `string`           | `undefined` |
| `placeholder` | `placeholder` | Specifies a short hint that describes the expected value of the element | `string`           | `undefined` |
| `value`       | `value`       | Specifies the value of the element                                      | `number \| string` | `''`        |


## Events

| Event          | Description                                                                      | Type                         |
| -------------- | -------------------------------------------------------------------------------- | ---------------------------- |
| `blurEvent`    | Emits a void event when input element is blurred                                 | `CustomEvent<void>`          |
| `changeEvent`  | Emits an InputChangeEventDetail when the value of the input element changes      | `CustomEvent<InputValue>`    |
| `focusEvent`   | Emits a void event when input element is focused                                 | `CustomEvent<void>`          |
| `keyDownEvent` | Emits a KeyboardEvent when a keboard key is pressed on the focused input element | `CustomEvent<KeyboardEvent>` |


----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
