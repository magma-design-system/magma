<!--
  ℹ️ Some infos
  🔴 Required:    If you skip this step, the issue could be ignored or closed prematurely.
  🟡 Recommended: Very important infos to let core team gain time on understanding the issue/merge request.
  🟢 Optional:    Some additional information to be more complete.
-->

<!--
  🔴 Required
  Provide a general summary of the issue.

  Example:
  I would like to fix CSS custom properties to the web component `mds-text`
  to let other components be able to style text selection, which is not possible right now.
-->

## Issue impact

<!--
  🔴 Required
  Leave only the items affected and delete the others.
  If for some reason you don't find the project/environment/tool you are talking about, please open an issue (feature) to suggest its addition.
-->

Impacts the following Design System project:

- Design Tokens
- Docs
- Icons
- Identity
- ~~React~~ (deprecated)
- Stencil (web components)
- Styles
- SVG Icons

Impacts the following Design System tool/environment:

- CI (Continuous Integration)
- Figma
- Gitlab

<!--
  🟡 Recommended
  If present, provide a project related to the issue.

  Example:
  Impacts the following Maggioli products:

  - [Synbee][https://gitlab.com/maggiolispa/ricerca-sviluppo-bari/synerbee]
  - [Periodici Maggioli][https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/periodici-maggioli]
  - Other project
-->

## Expected behavior

<!--
  🔴 Required
  Tell us what should happen and how is expected to behave.

  Example:
  The component should let access to `--selection-background` and `--selection-color`
  CSS custom properties, but it seem it's not working.
-->

## Current behavior

<!--
  🔴 Required
  Tell us what happens instead of the expected behavior.

  Example:
  If I set `--selection-background` or `--selection-color`,
  it's just not setting the color or background color when the text is selected.
-->

## Possible solution

<!--
  🟢 Optional
  Suggest a fix/reason for the bug.

  Example:
  It seems to missing `::selection` pseudo-element applied to `:host`.

  Missing code:

  ```css
  :host::selection {
    background-color: var(--selection-background);
    color: var(--selection-color);
  }
  ```
-->

## Steps to reproduce

<!--
  🔴 Required
  Provide a link to a live example, or an unambiguous set of steps to reproduce this bug.
  Include code to reproduce, if relevant.

  Example:
  1. Pull the repo, and remember to be on branch `dev`;
  2. Run the command `nx run stencil:storybook.start` to start the environment;
  3. Go to the [component storybook test][storybook] to reach it;
  4. Try to select the text.

  Example IT:
  1. Pulla il repository, ricorda di essere sul branch `dev`;
  2. Lancia `nx run stencil:storybook.start` per avviare l'ambiente;
  3. Vai al [test del componente][storybook];
  4. Prova a selezionare il testo.

  [storybook]: http://localhost:6006/?path=/story/ui-text--default
-->

## Context (environment)

<!--
  🟡 Recommended
  How has this issue affected you?
  What are you trying to accomplish?
  Providing context helps us come up with a solution that is most useful in the real world.

  Example:
  I've tried to custom text selection color in my project but it seem to not working correctly:

  ```css
  .my-note mds-text {
    --selection-background: var(--label-yellow-09);
    --selection-color: var(--label-yellow-02);
    color: var(--label-yellow-03);
  }
  ```
-->

## Detailed addition

<!--
  🟡 Recommended
  Provide a description of the change or the addition you are proposing.

  Example:
  I just would like to add the CSS which is missing as mentioned above.
-->

## Possible implementation

<!--
  🟢 Optional
  Suggest an idea for implementing addition or change.

  Example:
  I think something like this shoud be enough:

  ```css
  :host::selection {
    background-color: var(--selection-background);
    color: var(--selection-color);
  }
  ```
-->
