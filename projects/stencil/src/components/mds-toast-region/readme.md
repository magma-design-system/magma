# mds-toast-region



<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-toast-region>` web component is the place where an application shows its toasts: placed once in the application shell, at an edge of the viewport, it lines up the `<mds-toast>` elements visible at the same time, each one readable, and announces them to assistive technologies. It has no native HTML equivalent.

#### Semantic Behavior

- **One place for the toasts**: The region is fixed at the edge named by `position`; the toasts inside it are laid out in its flow, in a column with a gap, instead of each one being fixed on its own. The newest toast (the last one in the page) sits at the edge, where the toasts come in.
- **The others close the gap**: A hidden toast in the region takes no room once its exit is over, so the toasts left move up to the edge; the exit itself is a short fade towards the edge, not a slide over the other toasts.
- **Position of the toasts**: The region gives its `position` to every toast inside it, the ones added later too, and again when its own `position` changes.
- **Live region**: The host is a status region (`role="status"`, `aria-live="polite"`, not atomic) that is in the page before any message, so a toast added or shown inside it is read out without moving the focus, and only that toast. The toasts inside it drop their own status role.
- **The most toasts at once**: When a toast shows while `max` toasts are already visible, the region hides the oldest ones with a `duration`, in the order they were shown, and each one emits `mdsToastClose` with `reason: 'hide'`. A toast that stays (`duration="0"`) and the toast just shown are never hidden, so the region may hold more than `max` until one of them goes.
- **Below the dialogs**: The region is a fixed layer of the page, not a top layer element: an `<mds-modal>` opened later covers it and makes it inert, toasts and announcements included. A message about an open dialog belongs inside the dialog.
- **Toasts outside the region**: A toast that is not inside a region keeps placing itself at its own `position`, as before.

#### Properties & Visual Configurations

- **`position`** picks the edge and the alignment of the column: top or bottom, left, center or right. Pick the edge where the application expects transient feedback; one region per application is the rule.
- **`max`** is how many toasts may be visible at once before the oldest one with a timer leaves to make room; keep it small, a column of toasts covers the page.


### 2. Examples

Correct and idiomatic ways to use the `<mds-toast-region>` component, ordered from most common to most specialized. The toasts follow the examples of `<mds-toast>`; the shared component rules live in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### One Region in the Application Shell

The region holds the `<mds-toast>` elements of the application: every toast of the application goes into it, and the region lines them up at its edge and announces them. A toast shown in it leaves after its `duration`.

```html
<mds-toast-region>
  <mds-toast visible variant="success">Documento salvato</mds-toast>
</mds-toast-region>
```

Place one region in the shell of the application, outside the content that changes from page to page, so it is in the page before any message; the toasts are added to it from code (see the next pattern).

```html
<body>
  <main>
    <!-- contenuto dell'applicazione -->
  </main>
  <mds-toast-region></mds-toast-region>
</body>
```

#### Showing a Toast From Code

Create the toast, append it to the region and show it; remove it from the page once it has closed. The region places it, announces it, and makes room for it.

```javascript
const region = document.querySelector('mds-toast-region');

const showToast = (text, variant = 'success') => {
  const toast = document.createElement('mds-toast');
  toast.variant = variant;
  toast.textContent = text;
  toast.addEventListener('mdsToastClose', () => toast.remove());
  region.append(toast);
  toast.visible = true;
};

showToast('Documento salvato');
```

#### A Message That Stays Among Confirmations

An error that the person must act on stays (`duration="0"`) with its action and the hide button, while the confirmations around it come and go: the region never hides a toast that stays to make room.

```html
<mds-toast-region>
  <mds-toast visible variant="error" duration="0" dismissible>
    Invio non riuscito
    <mds-button slot="action" size="sm" variant="error" tone="weak">Riprova</mds-button>
  </mds-toast>
  <mds-toast visible variant="success">Bozza salvata</mds-toast>
</mds-toast-region>
```

#### At the Top Edge

Set `position` on the region, not on the toasts: it lines the toasts up at that edge, the newest one at the top, and gives them the position, so they come in and leave from that edge.

```html
<mds-toast-region position="top-right"></mds-toast-region>
```

#### Fewer Toasts at Once

Lower `max` for an application with frequent confirmations or little room: when one more toast shows, the oldest one with a timer leaves first.

```html
<mds-toast-region max="2"></mds-toast-region>
```

#### Spacing Between the Toasts

Change the space between the toasts with `--mds-toast-region-gap`.

```css
mds-toast-region {
  --mds-toast-region-gap: 12px;
}
```


### 3. Mistakes

Common incorrect uses of `<mds-toast-region>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules live in [`docs/agents/mistakes.md`](../../../../../../docs/agents/mistakes.md) - they apply here too but are not repeated.

#### Do Not Place a Region in Every Page or Component

Two regions at the same edge draw their toasts at the same place, one over the other, which is the problem the region solves. A region created together with its message is also not in the page before it, so the message may not be announced.

```html
<!-- INCORRECT - one region per form, created with the message -->
<form>
  <mds-toast-region>
    <mds-toast visible>Modulo inviato</mds-toast>
  </mds-toast-region>
</form>

<!-- CORRECT - one region in the shell, the toasts appended to it -->
<mds-toast-region></mds-toast-region>
```

#### Do Not Set `position` on the Toasts Inside a Region

The region gives its `position` to every toast inside it, so the one set on a toast is replaced. Set it on the region.

```html
<!-- INCORRECT - replaced by the region -->
<mds-toast-region>
  <mds-toast visible position="top-right">Impostazioni aggiornate</mds-toast>
</mds-toast-region>

<!-- CORRECT -->
<mds-toast-region position="top-right">
  <mds-toast visible>Impostazioni aggiornate</mds-toast>
</mds-toast-region>
```

#### Do Not Send a Message About an Open Dialog to the Region

While an `mds-modal` is open, everything outside it is inert, the region included: its toast cannot be used and is not announced. Show the message inside the dialog.

```html
<!-- INCORRECT - the error of the dialog goes behind it -->
<mds-modal opened>
  <form>...</form>
</mds-modal>
<mds-toast-region>
  <mds-toast visible variant="error" duration="0">Salvataggio non riuscito</mds-toast>
</mds-toast-region>

<!-- CORRECT - the error is in the dialog -->
<mds-modal opened>
  <mds-banner variant="error">Salvataggio non riuscito</mds-banner>
  <form></form>
</mds-modal>
```



## Properties

| Property   | Attribute  | Description                                                                                                                                                         | Type                                                                                              | Default           |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------- |
| `max`      | `max`      | The most toasts visible at once: when one more shows, the oldest one with a `duration` is hidden. A toast that stays (`duration="0"`) is never hidden by the region | `number`                                                                                          | `3`               |
| `position` | `position` | Sets the edge of the viewport where the toasts line up, and the `position` of every toast inside the region                                                         | `"bottom-center" \| "bottom-left" \| "bottom-right" \| "top-center" \| "top-left" \| "top-right"` | `'bottom-center'` |


## Slots

| Slot | Description                                                                                  |
| ---- | -------------------------------------------------------------------------------------------- |
|      | Add `mds-toast` elements, one per message: the region lines up the visible ones at its edge. |


## CSS Custom Properties

| Name                     | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `--mds-toast-region-gap` | Public. Space between the toasts lined up in the region. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
