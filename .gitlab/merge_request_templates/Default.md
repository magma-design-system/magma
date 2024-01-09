<!--
  ℹ️ Some infos
  🔴 Required:    If you skip this step, the issue could be ignored or closed prematurely.
  🟡 Recommended: Very important infos to let core team gain time on understanding the issue/merge request.
  🟢 Optional:    Some additional information to be more complete.

  🚧 Warning 🚧
  This project ONLY accepts merge requests related to open issues.
  If you are suggesting a new feature or change, please discuss it in an issue first.
  If fixing a bug, there should be an issue describing it with steps to reproduce.
  https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/issues/new
-->

<!--
  🔴 Required
  Provide a general summary of your changes.

  Example:
I've have made this/these changes:
| Impact    | Type      |   Scope   | Description                             |
|-----------|---------|---------|-----------------------------------------|
| 🔴 **change** | `change` | `mds-dropdown` | Remove position attribute in favor of strategy attribute |
| 🟡 minor | `chore` | `magma` | Update minor versions of dependencies |
| 🟡 minor | `feat` | `styles` | Add global custom properties for modals and headers |
| 🟡 minor | `style` | `mds-text` | Add customization for text selection via custom properties |
| 🟢 patch | `build` | `stencil` | Add cssmin to build script |
| 🟢 patch | `ci` | `stencil` | Changes to the pipelines |
| 🟢 patch | `doc` | `mds-accordion` | Add doc on how handle events |
| 🟢 patch | `fix` | `magma` | Active attribute now expect boolean instead a string |
| 🟢 patch | `hotfix` | `mds-header` | Fix wrong z-index that prevents header to be under modals |
| 🟢 patch | `merge` | `magma` | Merge commits |
| 🟢 patch | `perf` | `mds-tab` | Boost component speed when tab-item changes |
| 🟢 patch | `refact` | `design-tokens` | Separate color tokens from typography ones |
| 🟢 patch | `revert` | `stencil` | Undo changes from previous commits |
| 🟢 patch | `test` | `mds-text` | Add test for alt view |
-->




## Description

<!--
  🟡 Recommended
  Describe your changes in detail.

  I've added this code to ensure the component can be styled with a simple CSS override, I've also added heredoc documentation for stencil.

  ```css
  /*
  * @prop --selection-background: Sets the background-color of the text when the text is selected
  * @prop --selection-color: Sets the color of the text when the text is selected
  */

  :host {
    --selection-background: theme('colors.brand-maggioli-08');
    --selection-color: theme('colors.brand-maggioli-03');
  }

  :host::selection {
    background-color: var(--selection-background);
    color: var(--selection-color);
  }
  ```
-->

## Motivation and context

<!--
  🟡 Recommended
  Why is this change required?
  What problem does it solve?

  Example:
  This change is required due to the possibility to custom text selection colors from outside `mds-text`.

  Currently `mds-text` not supports custom text selection colors, i/we've added come CSS custom properties that solve this limitation.
-->

## How has this been tested?

<!--
  🔴 Required
  Please describe in detail how you tested your changes.
  Include details of your testing environment, and the tests you ran to see how your change affects other areas of the code, etc.

  Example:
  Now you can override text selection colors from the outside:

  ```html
  <style>
  mds-text {
    --selection-background: red;
    --selection-color: blue;
  }
  </style>
  <mds-text>Select this text</mds-text>
  ```
-->

## Screenshots

<!--
  🟡 Recommended
  If it's a style change or addition.

  🟢 Optional
  If it hasn't a relevant visual change. Feel free to add some screeshot if you'd like to be more clear.
-->

## Related issues

<!--
  🔴 Required
  Please link to it's main issue here.

  Example:
  Closes: #44

  🟢 Optional
  If you know that the change fixes other open issues besides the main one, report them here.

  Example:
  Other related issues:

  1. #44
  2. #45
  3. #46
-->
