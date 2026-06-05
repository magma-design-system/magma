# mds-accordion-timer



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-accordion-timer>` web component is the orchestrating parent of an auto-advancing accordion in the Magma Design System. It groups one or more `<mds-accordion-timer-item>` children, runs a timed progress cycle over them, and automatically opens the next item when the current one elapses — a behaviour with no native HTML primitive.

#### Semantic Behavior

- **Compound parent**: On load it discovers its slotted `<mds-accordion-timer-item>` children, assigns each a `uuid`, and drives selection across them; it is meaningless without item children.
- **Initial selection**: The first child carrying `selected` becomes the active item and starts the timer on load; if none is selected, the timer stays idle until an item is activated.
- **Auto-advance cycle**: When the active item's progress reaches completion, the timer resets that item and selects the next one, wrapping back to the first after the last — producing a continuous loop.
- **Per-item duration override**: Each tick uses the active item's own `duration` when set, otherwise falling back to the parent `duration`.
- **Pause on hover**: Hovering the active item pauses the countdown (preserving remaining time) and resuming on mouse-leave continues it; this hover behaviour is suppressed while `paused` is set.
- **Manual selection**: Clicking an item stops the running cycle and selects it (left paused), while programmatic selection clears `paused` and restarts the timer from the beginning of that item.
- **Lifecycle cleanup**: The internal interval is cleared on disconnect, so a removed accordion leaves no running timers.
- **Emitted event**: Emits `mdsAccordionTimerChange` with the new item `index` whenever the active item changes.

#### Properties & Visual Configurations

This component exposes only timing controls; it has no `variant` / `tone` / `size` ladder of its own and renders a bare slot wrapper.

#### Other behavioral props

- **`duration`** is the fallback cycle length in milliseconds applied to every item that does not declare its own `duration`; it is the global pacing knob for the whole accordion.
- **`paused`** freezes the countdown at its current remaining time when set and resumes it when cleared. While paused, hover-driven pause/resume is disabled, making it the authoritative external stop control.



## Properties

| Property   | Attribute  | Description                                    | Type                   | Default     |
| ---------- | ---------- | ---------------------------------------------- | ---------------------- | ----------- |
| `duration` | `duration` | Sets the duration of the single accordion item | `number`               | `10000`     |
| `paused`   | `paused`   | When paused is defined, the timer stops run    | `boolean \| undefined` | `undefined` |


## Events

| Event                     | Description                                | Type                                        |
| ------------------------- | ------------------------------------------ | ------------------------------------------- |
| `mdsAccordionTimerChange` | Emits when the accordion changes it's item | `CustomEvent<MdsAccordionTimerEventDetail>` |


## Slots

| Slot        | Description                               |
| ----------- | ----------------------------------------- |
| `"default"` | Add `mds-accordion-timer-item` element/s. |


## CSS Custom Properties

| Name                                            | Description                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `--mds-accordion-timer-color`                   | Sets the text color of the component mds-accordion-timer-item                               |
| `--mds-accordion-timer-duration`                | Sets the transition duration of open/close animation of the mds-accordion-timer-item        |
| `--mds-accordion-timer-progress-bar-background` | Sets the background-color of the progress bar when the mds-accordion-timer-item is selected |
| `--mds-accordion-timer-progress-bar-color`      | Sets the color of the progress bar when the mds-accordion-timer-item is selected            |
| `--mds-accordion-timer-progress-bar-thickness`  | Sets thickness of the progress bar of the mds-accordion-timer-item                          |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
