# mds-emoji

Illustrations come from [Magma Emoji Figma](https://www.figma.com/design/09SuDQMZYyOKGyomr87G9c/Emoji?node-id=0-1&t=U3txjHfdwaMIRRAC-1) illustrations.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-emoji>` web component renders one of the Magma Design System's animated mascot illustrations (`mia` or `simi`) as an interactive SVG. It is a decorative, expressive element with no native HTML equivalent: its personality is driven entirely through imperative animation methods rather than markup or props.

#### Semantic Behavior

- **Mouse following**: When started, the emoji tracks the pointer with a 3D head rotation and parallax on each facial part; it is off by default and only reacts after `startFollowMouse()` is called.
- **Single-animation lock**: Expressive actions are serialized - `agree`, `smile`, `disagree`, and `startThinking` no-op while another animation is running, so triggers cannot overlap or interrupt each other.
- **Promise-based methods**: Every expressive action returns a `Promise<void>` that resolves when its animation finishes, letting callers await one expression before chaining the next.
- **State restoration**: When an animation completes, any mouse-following that was active beforehand is automatically restored.
- **Idle blinking**: `startBlinking()` runs a random blink loop on the eyes; blinks are suppressed while the emoji is busy with another animation.

#### Properties & Visual Configurations

The only public prop is `name`, which selects the mascot identity. It accepts `'mia'` (the default) or `'simi'`; changing it at runtime swaps the mascot.

#### Other behavioral props

There are no variant, tone, or size props. The expression is configured imperatively through method calls (`agree`, `smile`, `disagree`, `startThinking` / `stopThinking`, `startBlinking` / `stopBlinking`, `startFollowMouse` / `stopFollowMouse`), and the timing and reach of those animations are tuned through CSS custom properties - `--mds-emoji-expression-max-rotation`, the `--mds-emoji-expression-follow-mouse-*-duration` pair, the per-part `--mds-emoji-offset-*` values, and the per-mascot color tokens - rather than through attributes.


### 2. Pattern

Correct and idiomatic ways to use the `<mds-emoji>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md) and the component catalogue in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md).

#### Basic Mascot Display

Drop the component anywhere to render the default mascot, Mia. The element is a square and sizes itself to the value applied via CSS `width` / `height` (it has its own default). No props are required for a static illustration.

```html
<mds-emoji></mds-emoji>
```

#### Choosing a Mascot with `name`

The `name` prop selects between the two available mascots. Use `"mia"` (default) for the AI-branded identity and `"simi"` for the human-like character. Changing `name` at runtime swaps the mascot without a page reload.

```html
<!-- Mia - the AI mascot (default) -->
<mds-emoji name="mia"></mds-emoji>

<!-- Simi - the human-like mascot -->
<mds-emoji name="simi"></mds-emoji>
```

#### Sizing via CSS

Control the rendered size with CSS `width` and `height` on the host - the SVG fills 100% of the host's box. The component keeps a 1:1 aspect ratio automatically.

```html
<mds-emoji name="mia" style="width: 128px; height: 128px;"></mds-emoji>
```

```css
.mascot-hero mds-emoji {
  width: 240px;
  height: 240px;
}
```

#### Mouse-Following Interaction

Call `startFollowMouse()` to activate the 3D head-rotation that tracks the pointer. The feature is off by default. Call `stopFollowMouse()` to deactivate it cleanly.

```html
<mds-emoji id="mascot" name="mia"></mds-emoji>

<script>
  const emoji = document.querySelector('#mascot');
  emoji.startFollowMouse();

  // later, e.g. when leaving a focused section:
  emoji.stopFollowMouse();
</script>
```

#### Idle Blinking

Start the automatic random-interval blink loop with `startBlinking()`. The blink is suppressed while another animation owns the eyes and resumes automatically afterwards.

```html
<mds-emoji id="mascot" name="simi"></mds-emoji>

<script>
  const emoji = document.querySelector('#mascot');
  emoji.startBlinking();
</script>
```

#### Expressing Agreement or Confirmation

Call `agree()` after a successful form submission or confirmed action. The emoji nods and briefly smiles. The returned `Promise` resolves when the animation completes.

```html
<mds-emoji id="mascot" name="mia"></mds-emoji>
<mds-button id="save-btn" label="Salva" variant="primary" tone="strong"></mds-button>

<script>
  const emoji = document.querySelector('#mascot');
  document.querySelector('#save-btn').addEventListener('click', async () => {
    await fetch('/api/save');
    emoji.agree();
  });
</script>
```

#### Expressing a Smile

Call `smile()` for lighter positive feedback - a bounce and closed-eyes smile without the full nod. Useful on hover or focus of a featured element.

```html
<mds-emoji id="mascot" name="mia"></mds-emoji>

<script>
  const emoji = document.querySelector('#mascot');
  document.querySelector('.feature-card').addEventListener('mouseenter', () => {
    emoji.smile();
  });
</script>
```

#### Expressing Disagreement or Errors

Call `disagree()` on validation failure or destructive confirmation. An optional `turnHappyDelay` number (in milliseconds) delays the return to the neutral face - useful when you want the serious expression to linger while an error message is visible.

```html
<mds-emoji id="mascot" name="mia"></mds-emoji>

<script>
  const emoji = document.querySelector('#mascot');

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = await submitForm();
    if (!ok) {
      emoji.disagree(2000); // stay serious for 2 s while the error banner is visible
    }
  });
</script>
```

#### Thinking State During Async Operations

Call `startThinking()` while a request is in flight - the emoji raises a thinking hand and shifts its gaze. Call `stopThinking()` when the operation settles. Both methods accept an optional `duration` (seconds) for the transition animation.

```html
<mds-emoji id="mascot" name="mia"></mds-emoji>

<script>
  const emoji = document.querySelector('#mascot');

  async function caricaDati() {
    await emoji.startThinking();
    const data = await fetch('/api/data').then((r) => r.json());
    await emoji.stopThinking();
    return data;
  }
</script>
```

#### Chaining Expressions

Because every method returns a `Promise<void>`, you can `await` one before triggering the next. The single-animation lock ensures they never overlap even if called without awaiting.

```html
<mds-emoji id="mascot" name="simi"></mds-emoji>

<script>
  const emoji = document.querySelector('#mascot');

  async function onSave() {
    await emoji.startThinking(0.4); // mostri caricamento
    await fetch('/api/salva');
    await emoji.stopThinking(0.4);
    await emoji.agree();           // conferma riuscita
  }
</script>
```

#### CSS Customization - Animation Timing

Tune the mouse-follow responsiveness by overriding the documented `--mds-emoji-expression-*` custom properties on the host or a parent selector. The initial values are reasonable for most placements; reduce them for snappier feedback.

```css
.mascot-container mds-emoji {
  --mds-emoji-expression-follow-mouse-head-duration: 150ms;
  --mds-emoji-expression-follow-mouse-traits-duration: 100ms;
  --mds-emoji-expression-max-rotation: 10deg;
}
```

#### CSS Customization - Mascot Colors

Override per-mascot color tokens to adapt the character to a custom brand palette. Use Magma token wrappers (`rgb(var(--...))`) so dark-mode and high-contrast adaptations keep working.

```css
/* Theming Mia for a custom brand */
mds-emoji[name='mia'] {
  --mds-emoji-mia-head: rgb(var(--variant-primary-08));
  --mds-emoji-mia-eyes: rgb(var(--variant-primary-03));
  --mds-emoji-mia-mouth: rgb(var(--variant-primary-06));
  --mds-emoji-mia-hands: rgb(var(--variant-primary-06));
}

/* Theming Simi */
mds-emoji[name='simi'] {
  --mds-emoji-simi-skin: #f5c8a0;
  --mds-emoji-simi-skin-dark: #c8895e;
  --mds-emoji-simi-skin-light: #fdebd8;
}
```

#### CSS Customization - Parallax Offsets

Increase or decrease the per-layer offset values to control how pronounced the parallax depth effect is when the emoji follows the mouse. Set all offsets to `0` to flatten the effect entirely.

```css
/* Subtle parallax - small offsets for compact placements */
.compact mds-emoji {
  --mds-emoji-offset-eyes: 0.5px;
  --mds-emoji-offset-mouth: 0.5px;
  --mds-emoji-offset-eyebrows: 4px;
  --mds-emoji-offset-head: 0;
}

/* Dramatic parallax - large offsets for hero sections */
.hero mds-emoji {
  --mds-emoji-offset-eyes: 3px;
  --mds-emoji-offset-mouth: 3px;
  --mds-emoji-offset-eyebrows: 20px;
  --mds-emoji-perspective: 250px;
}
```


### 3. Antipattern

Common incorrect uses of `<mds-emoji>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use an Unknown `name` Value

Only `"mia"` and `"simi"` are valid values for the `name` prop. Any other string falls outside the `EmojiNames` type, produces no mascot, and silently renders nothing.

```html
<!-- 🚫 INCORRECT -->
<mds-emoji name="luigi"></mds-emoji>
<mds-emoji name="robot"></mds-emoji>

<!-- ✅ CORRECT -->
<mds-emoji name="mia"></mds-emoji>
<mds-emoji name="simi"></mds-emoji>
```

#### Do Not Put Content in the Component - It Has No Slots

`<mds-emoji>` renders a self-contained SVG through its shadow root and exposes no slots. Any child nodes placed between the tags are ignored entirely.

```html
<!-- 🚫 INCORRECT -->
<mds-emoji name="mia">
  <span>Ciao!</span>
</mds-emoji>

<!-- ✅ CORRECT - place sibling elements outside the component -->
<div class="mascot-wrapper">
  <mds-emoji name="mia"></mds-emoji>
  <p>Ciao!</p>
</div>
```

#### Do Not Trigger Expressions Without Awaiting a Running Animation

The single-animation lock causes `agree()`, `smile()`, `disagree()`, and `startThinking()` to no-op when the emoji is already busy. Firing them without awaiting the previous call means subsequent expressions are silently dropped.

```html
<!-- 🚫 INCORRECT - second call is dropped because the first is still running -->
<script>
  emoji.startThinking(); // starts thinking
  emoji.agree();         // no-op: emoji is busy
</script>

<!-- ✅ CORRECT - await each expression before chaining the next -->
<script>
  await emoji.startThinking(0.5);
  await fetch('/api/salva');
  await emoji.stopThinking(0.5);
  await emoji.agree();
</script>
```

#### Do Not Use `stopThinking()` to Cancel Mid-Expression

`stopThinking()` is the paired counterpart to `startThinking()`. Calling it to interrupt `agree()`, `smile()`, or `disagree()` has no effect because those animations set their own completion callbacks and do not check the thinking state.

```html
<!-- 🚫 INCORRECT - stopThinking() won't cut short an agree() animation -->
<script>
  emoji.agree();
  emoji.stopThinking(); // no-op
</script>

<!-- ✅ CORRECT - let the animation complete (await it), or accept that expressions run to completion -->
<script>
  await emoji.agree();
  // now the emoji is idle and ready for the next call
</script>
```

#### Do Not Pierce Shadow DOM to Animate SVG Parts Directly

The internal SVG elements (eyes, mouth, head, etc.) are part of the shadow DOM and are managed by GSAP inside the component. Querying them from outside and applying CSS transforms or animations creates conflicting tweens and breaks the component's state machine.

```css
/* 🚫 INCORRECT */
mds-emoji >>> #eyes-default {
  transform: scaleY(0.5);
}
```

```html
<!-- ✅ CORRECT - use the documented imperative methods instead -->
<script>
  emoji.startBlinking(); // let the component own eye animations
</script>
```

#### Do Not Set Per-Layer Offsets with Unitless Numbers

The `--mds-emoji-offset-*` custom properties are declared as `<length>` values. Unitless numbers are not valid lengths and will be ignored, leaving the parallax effect at the CSS `@property` initial value.

```css
/* 🚫 INCORRECT - unitless values are invalid <length> */
mds-emoji {
  --mds-emoji-offset-eyes: 3;
  --mds-emoji-offset-mouth: 2;
}

/* ✅ CORRECT - always supply a length unit */
mds-emoji {
  --mds-emoji-offset-eyes: 3px;
  --mds-emoji-offset-mouth: 2px;
}
```

#### Do Not Set `--mds-emoji-expression-max-rotation` Without an Angle Unit

`--mds-emoji-expression-max-rotation` is declared as `<angle>`. A bare number is invalid and the property falls back to the initial value of `16deg`, so the constraint you intended is silently ignored.

```css
/* 🚫 INCORRECT */
mds-emoji {
  --mds-emoji-expression-max-rotation: 8;
}

/* ✅ CORRECT */
mds-emoji {
  --mds-emoji-expression-max-rotation: 8deg;
}
```



## Properties

| Property | Attribute | Description                       | Type              | Default |
| -------- | --------- | --------------------------------- | ----------------- | ------- |
| `name`   | `name`    | Specifies which emoji to display. | `"mia" \| "simi"` | `'mia'` |


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

Stops the "thinking" animation after the given duration.

#### Parameters

| Name       | Type     | Description                        |
| ---------- | -------- | ---------------------------------- |
| `duration` | `number` | the animation duration, in seconds |

#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                                                  | Description                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| `--mds-emoji-expression-follow-mouse-head-duration`   | Sets the duration for the head to follow the mouse                |
| `--mds-emoji-expression-follow-mouse-traits-duration` | Sets the duration for facial traits to follow the mouse           |
| `--mds-emoji-expression-max-rotation`                 | Sets the maximum rotation angle for the emoji expression          |
| `--mds-emoji-mia-eyes`                                | Sets the color of Mia's eyes                                      |
| `--mds-emoji-mia-hands`                               | Sets the color of Mia's hands                                     |
| `--mds-emoji-mia-head`                                | Sets the color of Mia's head                                      |
| `--mds-emoji-mia-mouth`                               | Sets the color of Mia's mouth                                     |
| `--mds-emoji-offset-ears`                             | Sets the positional offset for the ears                           |
| `--mds-emoji-offset-eyebrows`                         | Sets the positional offset for eyebrows                           |
| `--mds-emoji-offset-eyes`                             | Sets the positional offset for eyes                               |
| `--mds-emoji-offset-gadget`                           | Sets the positional offset for gadgets                            |
| `--mds-emoji-offset-hand`                             | Sets the positional offset for the hands                          |
| `--mds-emoji-offset-hands`                            | Sets the positional offset for the hands                          |
| `--mds-emoji-offset-head`                             | Sets the positional offset for the head                           |
| `--mds-emoji-offset-mouth`                            | Sets the positional offset for the mouth                          |
| `--mds-emoji-perspective`                             | Sets the perspective distance for 3D transformations of the emoji |
| `--mds-emoji-simi-eye`                                | Sets the color of Simi's eyes                                     |
| `--mds-emoji-simi-eye-light`                          | Sets the light color of Simi's eyes                               |
| `--mds-emoji-simi-eyebrow`                            | Sets the color of Simi's eyebrows                                 |
| `--mds-emoji-simi-gadget`                             | Sets the color of Simi's gadget                                   |
| `--mds-emoji-simi-mouth`                              | Sets the color of Simi's mouth                                    |
| `--mds-emoji-simi-nose`                               | Sets the color of Simi's nose                                     |
| `--mds-emoji-simi-nose-light`                         | Sets the light color of Simi's nose                               |
| `--mds-emoji-simi-outline`                            | Sets the color of Simi's outline                                  |
| `--mds-emoji-simi-skin`                               | Sets the base color of Simi's skin                                |
| `--mds-emoji-simi-skin-dark`                          | Sets the dark shade of Simi's skin                                |
| `--mds-emoji-simi-skin-light`                         | Sets the light shade of Simi's skin                               |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
