# mds-emoji

Illustrations come from [Magma Emoji Figma](https://www.figma.com/design/09SuDQMZYyOKGyomr87G9c/Emoji?node-id=0-1&t=U3txjHfdwaMIRRAC-1) illustrations.

<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type              | Default |
| -------- | --------- | ----------- | ----------------- | ------- |
| `name`   | `name`    |             | `"mia" \| "simi"` | `'mia'` |


## Methods

### `agree() => Promise<void>`



#### Returns

Type: `Promise<void>`

Promise<void>
Emoji agrees, useful for confirm actions.

### `disagree(turnHappyDelay?: number) => Promise<void>`



#### Parameters

| Name             | Type     | Description |
| ---------------- | -------- | ----------- |
| `turnHappyDelay` | `number` |             |

#### Returns

Type: `Promise<void>`

Promise<void>
Emoji disagrees, useful for errors or unwanted results.

### `smile() => Promise<void>`



#### Returns

Type: `Promise<void>`

Promise<void>
Emoji smiles, useful for confirm actions.

### `startBlinking() => Promise<void>`



#### Returns

Type: `Promise<void>`

Promise<void>
Eyes start blinking.

### `startFollowMouse() => Promise<void>`



#### Returns

Type: `Promise<void>`

Promise<void>
Starts following mouse with CSS 3D transform.

### `startThinking(duration?: number) => Promise<void>`



#### Parameters

| Name       | Type     | Description |
| ---------- | -------- | ----------- |
| `duration` | `number` |             |

#### Returns

Type: `Promise<void>`

Promise<void>
Emoji start thinking, useful for pending requests.

### `stopBlinking() => Promise<void>`



#### Returns

Type: `Promise<void>`

Promise<void>
Eyes stop blinking.

### `stopFollowMouse() => Promise<void>`



#### Returns

Type: `Promise<void>`

Promise<void>
Stops following mouse with CSS 3D transform.

### `stopThinking(duration?: number) => Promise<void>`



#### Parameters

| Name       | Type     | Description |
| ---------- | -------- | ----------- |
| `duration` | `number` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
