<!--
  ℹ️ Some infos
  🔴 Required:    If you skip this step, the issue could be ignored or closed prematurely.
  🟡 Recommended: Very important infos to let core team gain time on understanding the issue/merge request.
  🟢 Optional:    Some additional information to be more complete.

  🏋🏻‍♂️ Weight
  Measure the issue weight by the days you think you need to complete it:
  Available values: 1, 2, 3, 5, 8 (if 9+ you should consider to split in multiple issues)
-->

<!--
  🔴 Required
  Provide a general summary of the proposal.

  Example:
  I would like to add CSS custom properties to the web component `mds-text`
  to let other components be able to style text selection, which is not possible right now.
-->

## Proposal impact

<!--
  🔴 Required
  Leave only the items affected and delete the others.
  If for some reason you don't find the project/environment/tool you are talking about, please open an issue (feature) to suggest its addition.
-->

Impacts the following Magma Design System project:

- [Design Tokens][design-tokens]
- [Icons][icons]
- [Identity][identity]
- [~~React~~ (deprecated)][react]
- [Stencil (web components)][stencil]
- [Styles][styles]
- [SVG Icons][svg-icons]

Impacts the following Design System tool/environment:

- [CI (Continuous Integration)][ci]
- [Figma][figma]
- [Gitlab][gitlab]

<!--
  🟡 Recommended
  If present, provide a project related to the issue.

  Example:
Impacts the following Maggioli products:

- [Biblioteca Digitale][prd-bib-dig]
- [Magma Docs][magma-docs]
- [Periodici Maggioli][prd-per-mag]
- [Quiz App][prd-quiz]
- [R&D Days][prd-rnd-days]
- [SistemaPA][prd-sis-pa]
- [Synbee][prd-synbee]

-->

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

  1. #38 - Text selection not working inside `mds-calendar` component
  2. #45 - Cannot apply text selection from outside

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

<!-- 🚧 DO NOT REMOVE 🚧 -->

[ci]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/pipelines
[design-tokens]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/design-tokens
[figma-web-components]: https://www.figma.com/file/evxGyMuj9309w6BZXXz4Ls/Magma-%2F-Web-Component
[figma]: https://www.figma.com/files/team/945687796790515562
[gitlab]: https://gitlab.com/
[icons]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/icons
[identity]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/identity
[magma-docs]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/magma/docs
[prd-bib-dig]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/bibliotecadigitale.maggioli.it
[prd-per-mag]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/periodici-maggioli
[prd-quiz]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/quiz-app-client
[prd-rnd-days]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/rnd-days
[prd-sis-pa]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/wordpress/sistemapa
[prd-synbee]: https://gitlab.com/maggiolispa/ricerca-sviluppo-bari/synerbee
[react]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/react
[stencil]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/stencil
[styles]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/styles
[svg-icons]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/svg-icons
