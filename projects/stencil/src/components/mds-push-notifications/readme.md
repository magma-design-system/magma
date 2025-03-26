# mds-push-notifications



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description                                                                                                                                                                                                  | Type                              | Default     |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ----------- |
| `visibility` | `visibility` | Specifies if the component is visible or not. visibility = auto \| manual should hide when click outside should hide when all notifications are removed should show when one or more notifications are added | `"auto" \| "manual" \| undefined` | `'auto'`    |
| `visible`    | `visible`    | Specifies if the component is visible or not.                                                                                                                                                                | `boolean \| undefined`            | `undefined` |


## Events

| Event                        | Description                                 | Type                                           |
| ---------------------------- | ------------------------------------------- | ---------------------------------------------- |
| `mdsPushNotificationsChange` | Emits when the component visibility changes | `CustomEvent<MdsPushNotificationsEventDetail>` |
| `mdsPushNotificationsHide`   | Emits when the component is hidden          | `CustomEvent<void>`                            |
| `mdsPushNotificationsShow`   | Emits when the component is shown           | `CustomEvent<void>`                            |


## Slots

| Slot        | Description                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `"bottom"`  | Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.            |
| `"default"` | Add `HTML elements` or `components`, it is **recommended** to use `mds-push-notification` element. |
| `"top"`     | Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.            |


## Shadow Parts

| Part              | Description                                 |
| ----------------- | ------------------------------------------- |
| `"notifications"` | The container wrapper of the notifications. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
