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


### 2. Pattern

Correct and idiomatic ways to use the `<mds-video-wall>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md) and the catalogue in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md).

#### Minimal Ambient Background

The simplest and most common use: a full-bleed autoplaying video loop with no extra configuration needed, because `autoplay`, `loop`, and `muted` are all `true` by default.

```html
<mds-video-wall src="/assets/video/ambient.mp4"></mds-video-wall>
```

#### Poster Image for Initial Frame

Supply a `poster` image so users see a meaningful still frame before the video loads, or on devices where autoplay is suppressed by the browser.

```html
<mds-video-wall
  src="/assets/video/ambient.mp4"
  poster="/assets/video/ambient-preview.webp"
></mds-video-wall>
```

#### Noise Overlay for Texture

Add a grain overlay with `noise` to give the video a cinematic or retro feel. Choose the texture that fits the intended mood: `classic`, `sharp`, `soft`, or `tv`.

```html
<!-- Subtle classic grain -->
<mds-video-wall src="/assets/video/ambient.mp4" noise="classic"></mds-video-wall>

<!-- High-contrast TV static -->
<mds-video-wall src="/assets/video/ambient.mp4" noise="tv"></mds-video-wall>
```

#### Foreground Content Overlay via the `content` Slot

Place any text, HTML elements, or Magma components in the `content` slot to render them centered above the video. The overlay wrapper is injected only when this slot is populated, so an empty overlay never affects layout.

```html
<mds-video-wall src="/assets/video/ambient.mp4" noise="soft">
  <div slot="content" class="text-tone-neutral text-center">
    <mds-text typography="h1">Benvenuto in Magma</mds-text>
    <mds-button label="Scopri di piu" variant="primary" tone="strong"></mds-button>
  </div>
</mds-video-wall>
```

#### Browser Fallback via the Default Slot

The default (unnamed) slot is projected inside the native `<video>` element. Use it for the message displayed when the browser does not support video playback.

```html
<mds-video-wall src="/assets/video/ambient.mp4">
  Il tuo browser non supporta la riproduzione video. Aggiorna il browser per continuare.
</mds-video-wall>
```

#### Disabling Autoplay with Controlled Preload

When the video should not play automatically - for example on a media showcase page - set `autoplay` and `loop` to `false` via a framework binding or a JS property assignment, and use `preload` to control how eagerly the file is fetched. Note: `preload` is ignored by the browser while `autoplay` is active.

```html
<!--
  Framework binding example (Angular / Lit / React attribute binding).
  Do NOT write autoplay="false" in plain HTML - see 3. Antipattern.md.
-->
<mds-video-wall
  src="/assets/video/showcase.mp4"
  poster="/assets/video/showcase-preview.webp"
  preload="metadata"
></mds-video-wall>
```

```javascript
// Disable autoplay and loop via JS property when not using a framework
const wall = document.querySelector('mds-video-wall');
wall.autoplay = false;
wall.loop = false;
```

#### CSS Customization via Documented Properties

Style the noise overlay and video fit only through the documented `--mds-video-wall-*` CSS custom properties. Set them on the host element or a parent selector, using Magma color tokens for palette-aware values.

```css
/* Warm amber noise tint, contained fit for a non-16:9 source */
.hero-section mds-video-wall {
  --mds-video-wall-noise-background-color: rgb(var(--status-warning-03) / 0.6);
  --mds-video-wall-noise-background-size: 4px;
  --mds-video-wall-video-fit: contain;
}
```


### 3. Antipattern

Common incorrect uses of `<mds-video-wall>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Use `autoplay="false"` or `loop="false"` to Disable Boolean Props

Setting a boolean attribute to the string `"false"` does not disable it - any non-empty string is truthy in HTML. Remove the attribute, set the JS property to `false`, or use a framework binding to turn these off.

```html
<!-- 🚫 INCORRECT -->
<mds-video-wall src="/assets/video/ambient.mp4" autoplay="false" loop="false"></mds-video-wall>

<!-- ✅ CORRECT (via JS property) -->
<mds-video-wall src="/assets/video/ambient.mp4"></mds-video-wall>
<script>
  const wall = document.querySelector('mds-video-wall');
  wall.autoplay = false;
  wall.loop = false;
</script>
```

#### Do Not Put Meaningful Content in the Default Slot

The default slot is projected inside the native `<video>` element and is shown only by browsers that cannot play video. Captions, headlines, CTAs, and any real UI must go in the `content` slot instead.

```html
<!-- 🚫 INCORRECT -->
<mds-video-wall src="/assets/video/ambient.mp4">
  <mds-text typography="h1">Benvenuto</mds-text>
</mds-video-wall>

<!-- ✅ CORRECT -->
<mds-video-wall src="/assets/video/ambient.mp4">
  Il tuo browser non supporta la riproduzione video.
  <div slot="content">
    <mds-text typography="h1">Benvenuto</mds-text>
  </div>
</mds-video-wall>
```

#### Do Not Wrap `<mds-video-wall>` in a Raw `<video>` Element

`<mds-video-wall>` already wraps a `<video>` internally. Nesting it inside another `<video>` is invalid HTML, produces no visible output, and makes the fallback slot unreachable.

```html
<!-- 🚫 INCORRECT -->
<video src="/assets/video/ambient.mp4" autoplay muted loop>
  <mds-video-wall src="/assets/video/ambient.mp4"></mds-video-wall>
</video>

<!-- ✅ CORRECT -->
<mds-video-wall src="/assets/video/ambient.mp4"></mds-video-wall>
```

#### Do Not Override Shadow DOM Internals Directly

The noise overlay is inside the Shadow DOM. Reach it only through the documented `--mds-video-wall-noise-background-color` custom property; do not pierce the shadow with `>>>` or undocumented selectors.

```css
/* 🚫 INCORRECT */
mds-video-wall >>> .noise {
  background-color: rgba(255, 0, 0, 0.5);
}

/* ✅ CORRECT */
mds-video-wall {
  --mds-video-wall-noise-background-color: rgb(var(--status-error-03) / 0.5);
}
```

#### Do Not Rely on `preload` While `autoplay` Is Active

The browser ignores the `preload` hint entirely when `autoplay` is set (which is the default). Only set `preload` after disabling `autoplay` via a JS property or framework binding.

```html
<!-- 🚫 INCORRECT (preload is silently ignored because autoplay is true by default) -->
<mds-video-wall
  src="/assets/video/ambient.mp4"
  preload="metadata"
></mds-video-wall>

<!-- ✅ CORRECT: disable autoplay first, then preload is honoured by the browser -->
<mds-video-wall
  src="/assets/video/showcase.mp4"
  poster="/assets/video/showcase-preview.webp"
  preload="metadata"
>
  <!-- set wall.autoplay = false via JS or framework binding -->
</mds-video-wall>
```



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
