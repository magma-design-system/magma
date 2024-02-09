# mds-input-select



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property       | Attribute      | Description                                                             | Type                                    | Default     |
| -------------- | -------------- | ----------------------------------------------------------------------- | --------------------------------------- | ----------- |
| `autoFocus`    | `auto-focus`   | Specifies a short hint that describes the expected value of the element | `boolean \| undefined`                  | `undefined` |
| `autocomplete` | `autocomplete` | Specifies a short hint that describes the expected value of the element | `"on" \| undefined`                     | `undefined` |
| `placeholder`  | `placeholder`  | Specifies a short hint that describes the expected value of the element | `string \| undefined`                   | `undefined` |
| `value`        | `value`        | Specifies the value of the element                                      | `null \| number \| string \| undefined` | `''`        |


## Events

| Event                  | Description                                                                 | Type                      |
| ---------------------- | --------------------------------------------------------------------------- | ------------------------- |
| `mdsInputSelectChange` | Emits an InputChangeEventDetail when the value of the input element changes | `CustomEvent<InputValue>` |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
