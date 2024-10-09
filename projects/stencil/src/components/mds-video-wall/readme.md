# mds-video-wall



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


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


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
