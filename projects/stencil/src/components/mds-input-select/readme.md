# mds-input-select



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                             | Type                                    | Default     |
| ------------- | ------------- | ----------------------------------------------------------------------- | --------------------------------------- | ----------- |
| `options`     | `options`     | Specifies a short hint that describes the expected value of the element | `string`                                | `''`        |
| `placeholder` | `placeholder` | Specifies a short hint that describes the expected value of the element | `string \| undefined`                   | `undefined` |
| `value`       | `value`       | Specifies the value of the element                                      | `null \| number \| string \| undefined` | `''`        |


## Events

| Event                   | Description                                                                      | Type                         |
| ----------------------- | -------------------------------------------------------------------------------- | ---------------------------- |
| `mdsInputSelectBlur`    | Emits a void event when input element is blurred                                 | `CustomEvent<void>`          |
| `mdsInputSelectChange`  | Emits an InputChangeEventDetail when the value of the input element changes      | `CustomEvent<InputValue>`    |
| `mdsInputSelectFocus`   | Emits a void event when input element is focused                                 | `CustomEvent<void>`          |
| `mdsInputSelectKeydown` | Emits a KeyboardEvent when a keboard key is pressed on the focused input element | `CustomEvent<KeyboardEvent>` |


----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
