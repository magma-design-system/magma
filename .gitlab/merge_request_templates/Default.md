<!--
  🔴 Required
  Provide a general summary of your changes.

  Example:
  I've added CSS custom properties to `mds-text` to let `::selection` pseudo-element can be styled from the outside.
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

## Related issue
<!-- This project only accepts pull requests related to open issues -->
<!-- If suggesting a new feature or change, please discuss it in an issue first -->
<!-- If fixing a bug, there should be an issue describing it with steps to reproduce -->
<!-- Please link to the issue here: -->

## Motivation and context
<!-- Why is this change required? What problem does it solve? -->
<!-- If it fixes an open issue, please link to the issue here. -->

## How has this been tested?

<!--
  🔴 Required
  Please describe in detail how you tested your changes.
  Include details of your testing environment, and the tests you ran to see how your change affects other areas of the code, etc.

  Example:
  Now from the outside you can override text selection colors:

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
  🔴 Required if it's a style change or addition
  🟢 Optional if it hasn't a relevant visual change.
-->
