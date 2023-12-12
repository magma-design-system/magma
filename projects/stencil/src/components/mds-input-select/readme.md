# mds-input-select



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                             | Type                                    | Default     |
| ------------- | ------------- | ----------------------------------------------------------------------- | --------------------------------------- | ----------- |
| `options`     | `options`     | Specifies a short hint that describes the expected value of the element | `string`                                | `'{}'`      |
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

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
