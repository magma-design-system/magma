# mds-video-wall



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-video-wall>` web component is the Magma Design System's full-bleed background video surface, used to render an autoplaying, looping ambient video behind foreground content. It wraps the native `<video>` element, adding an optional grain/noise overlay and a dedicated content layer for captions or call-to-action overlays.

#### Semantic Behavior

- **Ambient by default**: `autoplay`, `loop` and `muted` are all `true` out of the box, producing a self-contained background loop with no controls and no audio - the configuration browsers require for autoplay to be honored.
- **Decorative video**: The footage is treated as presentation only; meaningful information must live in the `content` slot, not in the video itself.
- **Noise overlay**: When `noise` is anything other than `'none'`, a decorative grain layer is rendered above the video; with `noise="none"` the layer is omitted entirely.
- **Conditional content layer**: The `content` overlay wrapper is only rendered when a `slot="content"` child is present, so an empty overlay never affects layout.
- **Default slot is fallback text**: The default (unnamed) slot is projected inside the `<video>` element and is intended for the browser-support fallback message shown when video playback is unavailable.
- **Preload is conditional**: `preload` only takes effect when autoplay is disabled; the browser ignores it while `autoplay` is active.

#### Properties & Visual Configurations

This component does not use the shared `variant` / `tone` ladders; its props map closely to the underlying native `<video>` attributes plus the Magma-specific overlay.

#### Other behavioral props

- **`noise`** selects the texture/strength of the grain overlay (`'classic'`, `'sharp'`, `'soft'`, `'tv'`); choose the style that matches the intended mood, or `'none'` to disable the effect.
- **`poster`** is the still image shown before the footage is ready - pick a frame that reads well on its own, since it is the first thing users see.
- **`preload`** hints how aggressively the file is fetched on page load; relevant only when autoplay is off.
- **`src`** is the URL of the video file driving the wall.



## Properties

| Property   | Attribute  | Description                                                                                                                                          | Type                                                            | Default     |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------- |
| `autoplay` | `autoplay` | Specifies that the video will start playing as soon as it is ready                                                                                   | `boolean`                                                       | `true`      |
| `loop`     | `loop`     | Specifies that the video will start over again, every time it is finished                                                                            | `boolean`                                                       | `true`      |
| `muted`    | `muted`    | Specifies that the audio output of the video should be muted                                                                                         | `boolean`                                                       | `true`      |
| `noise`    | `noise`    | Specifies if the video has a noise overlay effect                                                                                                    | `"classic" \| "none" \| "sharp" \| "soft" \| "tv" \| undefined` | `'none'`    |
| `poster`   | `poster`   | Specifies an image to be shown while the video is downloading                                                                                        | `string \| undefined`                                           | `undefined` |
| `preload`  | `preload`  | Specifies if and how the author thinks the video should be loaded when the page loads. Note: The preload attribute is ignored if autoplay is present | `"auto" \| "metadata" \| "none" \| undefined`                   | `'auto'`    |
| `src`      | `src`      | Specifies the URL of the video file                                                                                                                  | `string \| undefined`                                           | `undefined` |


## Slots

| Slot        | Description                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------ |
| `"content"` | Add video content overlay here, add `text string`, `HTML elements` or `components` to this slot. |
| `"default"` | Write browser support missing message here.                                                      |


## CSS Custom Properties

| Name                                      | Description                                                                             |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `--mds-video-wall-noise-background-color` | The background color applied to the noise layer of the video wall.                      |
| `--mds-video-wall-noise-background-size`  | The background-size used for the noise texture.                                         |
| `--mds-video-wall-noise-fitler`           | The CSS filter applied to the noise layer (e.g., blur, brightness).                     |
| `--mds-video-wall-video-fit`              | Defines how the video content should scale to fit its container (e.g., cover, contain). |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
