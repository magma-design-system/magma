# mds-input-range-value



<!-- Auto Generated Below -->


## Overview

One value of an `mds-input-range` that holds several, as an `<option>` is one choice of a
`<select>`: the range draws a thumb for it, and its text names that thumb. It draws nothing
itself. Adding or removing a value is adding or removing one of these elements: the range
watches its children.

## Usage

### 1. Description

The `<mds-input-range-value>` web component is one value of a [`<mds-input-range>`](../../mds-input-range) that holds several values on one track, as an `<option>` is one choice of a `<select>`. The range draws a thumb for each of its `<mds-input-range-value>` children; the child itself draws nothing.

#### Semantic Behavior

- **Compound child only**: it works only as a direct child of `<mds-input-range>`. Outside a range it is hidden and does nothing.
- **One child, one thumb**: adding a value is adding a child, removing one is removing its child. The range watches its children, their values and their text.
- **The text names the thumb**: the text of the child is the accessible name of its thumb ("Minimo", "Massimo"), as each thumb of the multi-thumb slider of the WAI-ARIA APG. A child without text gets a name made of the label of the range and its position ("Prezzo, 1 di 2", in the language of the page).
- **The range keeps the value valid**: it brings a value outside `min` and `max`, or off the `step`, inside the range and onto the step, as a native range input does, and writes it back here. A child without a value starts in the middle of the range.
- **The order is the order of the values**: the thumbs follow their values from the lowest, whatever the order of the children in the markup; each keeps the name of its own child.
- **The value follows the thumb**: as the thumb moves, the range writes its value on `value`, which is reflected. Setting `value` moves the thumb.

#### Properties & Visual Configurations

The only prop is `value`, the number of the thumb. The thumb is styled by its range: the child has no `variant` / `tone` ([`docs/agents/variants.md`](../../../../../../docs/agents/variants.md)), no part and no public CSS custom property.


### 2. Examples

Correct and idiomatic ways to use the `<mds-input-range-value>` component, ordered from most common to most specialized. The examples assume a working knowledge of the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### An Interval: Two Values

The canonical form: a minimum and a maximum on one track. The text of the range is its label, the text of each value names its thumb.

```html
<mds-input-range min="0" max="500" step="10" name="prezzo">
  Prezzo
  <mds-input-range-value value="100">Minimo</mds-input-range-value>
  <mds-input-range-value value="400">Massimo</mds-input-range-value>
</mds-input-range>
```

#### A Scale of Stops

More than two values: each stops at its neighbours, which it can reach but not pass. The header lists them, separated by a middle dot.

```html
<mds-input-range min="1" max="21" step="0.5" name="contrasto">
  Scala di contrasto
  <mds-input-range-value value="3">Passo 1</mds-input-range-value>
  <mds-input-range-value value="4.5">Passo 2</mds-input-range-value>
  <mds-input-range-value value="7">Passo 3</mds-input-range-value>
  <mds-input-range-value value="12">Passo 4</mds-input-range-value>
</mds-input-range>
```

#### Adding and Removing a Value

A value is an element: append a child to add a thumb, remove it to take the thumb away. The range emits `mdsInputRangeValuesChange` with the new list.

```html
<mds-input-range id="scala" min="0" max="100" name="passi">
  Passi
  <mds-input-range-value value="20"></mds-input-range-value>
  <mds-input-range-value value="80"></mds-input-range-value>
</mds-input-range>

<script>
  const scala = document.querySelector('#scala');
  const passo = document.createElement('mds-input-range-value');
  passo.value = 50;
  scala.append(passo); // a third thumb at 50
  passo.remove(); // back to two
</script>
```

#### Reading and Setting a Value

`value` follows its thumb, so the children are where the page reads the values; setting `value` moves the thumb, within its neighbours.

```js
const [minimo, massimo] = document.querySelectorAll('#prezzo mds-input-range-value');
console.log(minimo.value, massimo.value);
massimo.value = 300;
```


### 3. Mistakes

Common incorrect uses of `<mds-input-range-value>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/mistakes.md`](../../../../../../docs/agents/mistakes.md) - they apply here too but are not repeated.

#### Do Not Use It Outside `<mds-input-range>`

A value draws nothing: only its range draws its thumb.

```html
<!-- INCORRECT -->
<mds-input-range-value value="20">Minimo</mds-input-range-value>

<!-- CORRECT -->
<mds-input-range min="0" max="100">
  Prezzo
  <mds-input-range-value value="20">Minimo</mds-input-range-value>
</mds-input-range>
```

#### Do Not Put the Label of the Range in a Value

The text of the range is its label, the text of a value names its own thumb. A value that carries the label leaves the range unnamed and names one thumb after the whole group.

```html
<!-- INCORRECT -->
<mds-input-range>
  <mds-input-range-value value="20">Prezzo</mds-input-range-value>
  <mds-input-range-value value="80"></mds-input-range-value>
</mds-input-range>

<!-- CORRECT -->
<mds-input-range>
  Prezzo
  <mds-input-range-value value="20">Minimo</mds-input-range-value>
  <mds-input-range-value value="80">Massimo</mds-input-range-value>
</mds-input-range>
```

#### Do Not Read the Values from `value` of the Range

With values, `value` and `mdsInputRangeChange` of the range are left out: they hold the one value of a range without children. Read the children, `mdsInputRangeValuesChange` or the form.

```js
// INCORRECT
range.addEventListener('mdsInputRangeChange', (e) => console.log(e.detail));

// CORRECT
range.addEventListener('mdsInputRangeValuesChange', (e) => console.log(e.detail.values));
```



## Properties

| Property | Attribute | Description                                                                                                                                                                                                                                                                   | Type                  | Default     |
| -------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------- |
| `value`  | `value`   | The value of the thumb. The range keeps it inside its `min` and `max`, on its `step` and between the values next to it, and writes it here as the thumb moves; set it to move the thumb. Without a value the thumb starts in the middle of the range, as a native range input | `number \| undefined` | `undefined` |


## Slots

| Slot | Description                                                                                                                                                                              |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|      | The name of the value, as text ("Minimo", "Massimo"): the accessible name of its thumb. Without text the thumb is named after the label of the range and its position ("Prezzo, 1 di 2") |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
