<!--
  🔴 Required
  Provide a general summary of the proposal.

  Example:
  I would like to add CSS custom properties to the web component `mds-text`
  to let other components be able to style text selection, which is not possible right now.
-->

## Proposal impact

Impacts the following Design System projects:

<!--
  🔴 Required
  Leave only the items affected and delete the others.
  If for some reason you don't find the project/tools/environment you are talking about, please feel free to add it.
-->

- Design Tokens
- Docs
- Icons
- Identity
- ~~React~~ (deprecated)
- Stencil (web components)
- Styles
- SVG Icons

Impacts the following Design System tools/environments:

- CI (Continuous Integration)
- Figma
- Gitlab


## Related problem

<!--
  🔴 Required
  Provide a clear and concise description of what the problem is.

  Example:
  It's not the first time I try to style the text selection of mds-text to improve the UX and let the user is more combfortable the he/she reads text inside particular situations.
-->

## The solution i'd like to make

<!--
  🔴 Required
  Provide a clear and concise description of what you want to happen.

  Example:
  I'd just like to style text selection from the outside of `mds-text`, does exist some way to do that?
-->

## Alternatives i've considered

<!--
  🟡 Recommended
  Let us know about other solutions you've tried or researched.

  Example 1:
  I'm not nice with web-components and I would like to ask help from the core team.

  Example 2:
  I think CSS custom properties are the right solution.
-->

## Additional context

<!--
  🟡 Recommended
  Is there anything else you can add about the proposal?
  You might want to link to related issues here, if you haven't already.

  Example:
  I'm not the only one which is encountering the problem:

  1. [Issue 38][i38] - Text selection not working inside `mds-calendar` component
  2. [Issue 45][i45] - Cannot apply text selection from outside

  [i38]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/issues/38
  [i45]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/issues/45
-->

## Detailed description

<!--
  🟢 Optional
  Provide a detailed description of the change or addition you are proposing.

  Example:
  As written above, web-components work nice with CSS custom properties, expecially if we are talking of styling them.

  I would add CSS custom property to accessing `::selection` pseudo-element from the outside.
-->

## Possible implementation

<!--
  🟢 Optional
  Suggest an idea for implementing addition or change.

  Example:
  Something like this would do the trick:

  ```css
  :host {
    --selection-background: theme('colors.brand-maggioli-09');
    --selection-color: theme('colors.brand-maggioli-03');
  }

  :host::selection {
    background-color: var(--selection-background);
    color: var(--selection-color);
  }
  ```
-->
