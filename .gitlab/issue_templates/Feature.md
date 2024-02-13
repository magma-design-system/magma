<!--
  ℹ️ Some infos
  🔴 Required:    If you skip this step, the issue could be ignored or closed prematurely.
  🟡 Recommended: Very important infos to let core team gain time on understanding the issue/merge request.
  🟢 Optional:    Some additional information to be more complete.

  🏋🏻‍♂️ Weight
  Measure the issue weight by the days you think you need to complete it:
  Available values: 1, 2, 3, 5, 8 (if 9+ you should consider to split in multiple issues)
-->

<!-- 🔴 Required
Ensure to fill the prerequisites

Example:
- [x] I have read the Contributing Guidelines

-->

## Prerequisites

- [ ] I have read the [Contributing Guidelines](https://magma.maggiolicloud.it/en/contribute/contribution-model).
- [ ] I agree to follow the [Code of Conduct](https://magma.maggiolicloud.it/en/contribute/code-of-conduct).
- [ ] I have searched for [existing issues](https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/magma/design-system/-/issues) that already report this problem, without success.

---

<!-- 🔴 Required
Provide a general summary of the proposal.

Example:
I would like to add CSS custom properties to the web component `mds-text`
to let other components be able to style text selection, which is not possible right now.
-->

## Proposal impact

This feature should be a:

- [X] A new component
- [~] Breaking change
- [~] Minor
- [~] Patch

<!-- 🔴 Required
Leave only the items affected and delete the others.
OR
Mark as green 🟢 affected items.
Mark as yellow 🟡 possibly affected items.
Mark as red 🔴 unaffected items.
If for some reason you don't find the project/environment/tool you are talking about, please open an issue (feature) to suggest its addition.
-->

Impacts the following Magma Design System project:

| Impacted | Project           | Repository                     | Design                       | Website                          |
|:--------:|-------------------|--------------------------------|------------------------------|----------------------------------|
|    🟢    | **Design Tokens** | [Gitlab][design-tokens-gitlab] | [Figma][design-tokens-figma] | [Website][design-tokens-website] |
|    🟢    | **Icons**         | [Gitlab][icons-gitlab]         | [Figma][icons-figma]         | [Website][icons-website]         |
|    🟡    | **Identity**      | [Gitlab][identity-gitlab]      | [Figma][identity-figma]      | [Website][identity-website]      |
|    🟡    | **Stencil**       | [Gitlab][stencil-gitlab]       | [Figma][stencil-figma]       | [Website][stencil-website]       |
|    🔴    | **Styles**        | [Gitlab][styles-gitlab]        | [Figma][styles-figma]        | [Website][styles-website]        |
|    🔴    | **SVG Icons**     | [Gitlab][svg-icons-gitlab]     | [Figma][svg-icons-figma]     | [Website][svg-icons-website]     |

Impacts the following **deprecated** projects:

| Impacted | Project   | Status       | Repository             |
|:--------:|-----------|--------------|------------------------|
|    🔴    | **React** | `deprecated` | [Gitlab][react-gitlab] |
|    🔴    | **Lit**   | `deprecated` | [Gitlab][lit-gitlab]   |

Impacts the following tool/environment:

| Impacted | Project    | Resource             |
|:--------:|------------|----------------------|
|    🔴    | **CI**     | [Pipelines][ci]      |
|    🔴    | **Figma**  | [App][figma]         |
|    🔴    | **Gitlab** | [Repository][gitlab] |

Impacts the following Maggioli products:

| Impacted | Product                                | Department           |
|:--------:|----------------------------------------|----------------------|
|    🟢    | **All products**                       | All                  |
|    🔴    | **[Biblioteca Digitale][prd-bib-dig]** | Maggioli Editore     |
|    🔴    | **[Magma Docs][magma-docs]**           | R&D                  |
|    🔴    | **Mindy**                              | R&D                  |
|    🔴    | **[Periodici Maggioli][prd-per-mag]**  | Maggioli Editore     |
|    🔴    | **[Quiz App][prd-quiz]**               | Maggioli Editore     |
|    🔴    | **[R&D Days][prd-rnd-days]**           | R&D                  |
|    🔴    | **SicraSearch**                        | Maggioli Informatica |
|    🔴    | **[Synbee][prd-synbee]**               | Maggioli Editore     |


## Related problem

<!-- 🔴 Required
Provide a clear and concise description of what the problem is.

Example:
It's not the first time I try to style the text selection of mds-text to improve the UX and let the user is more combfortable the he/she reads text inside particular situations.
-->

## The solution i'd like to make

<!-- 🔴 Required
Provide a clear and concise description of what you want to happen.

Example:
I'd just like to style text selection from the outside of `mds-text`, does exist some way to do that?
-->

## Alternatives i've considered

<!-- 🟡 Recommended
Let us know about other solutions you've tried or researched.

Example 1:
I'm not nice with web-components and I would like to ask help from the core team.

Example 2:
I think CSS custom properties are the right solution.
-->

## Additional context

<!-- 🟡 Recommended
Is there anything else you can add about the proposal?
You might want to link to related issues here, if you haven't already.

Example:
I'm not the only one which is encountering the problem:

1. #38 - Text selection not working inside `mds-calendar` component
2. #45 - Cannot apply text selection from outside
-->

## Detailed description

<!-- 🟢 Optional
Provide a detailed description of the change or addition you are proposing.

Example:
As written above, web-components work nice with CSS custom properties, expecially if we are talking of styling them.

I would add CSS custom property to accessing `::selection` pseudo-element from the outside.
-->

## Possible implementation

<!-- 🟢 Optional
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

[ci]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/magma/design-system/-/pipelines
[design-tokens-figma]: https://www.figma.com/file/YIAVsdxdckKZI8rX3Plaef/Magma-%2F-Design-Tokens?type=design&node-id=0%3A1&mode=design&t=kpMihyaFTC1rtM5D-1
[design-tokens-gitlab]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/design-tokens
[design-tokens-website]: https://magma.maggiolicloud.it
[figma]: https://www.figma.com/files/team/945687796790515562
[gitlab]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/
[icons-figma]: https://www.figma.com/file/yy2nOrefAySiO3R7uCMuMD/Magma-%2F-Icons?type=design&node-id=0%3A1&mode=design&t=wxcmDj6yNqQ5iU9b-1
[icons-gitlab]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/icons
[icons-website]: https://magma.maggiolicloud.it/foundations/design/icone
[identity-figma]: https://www.figma.com/file/VshVtuzsNNef42f3ExJL26/Magma-%2F-Identity?type=design&node-id=0%3A1&mode=design&t=jR5bPW8rsuuCYNk7-1
[identity-gitlab]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/identity
[identity-website]: https://magma.maggiolicloud.it/
[lit-gitlab]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/deprecated/lit
[magma-docs]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/magma/docs
[prd-bib-dig]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/bibliotecadigitale.maggioli.it
[prd-per-mag]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/periodici-maggioli
[prd-quiz]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/quiz-app-client
[prd-rnd-days]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/rnd-days
[prd-synbee]: https://gitlab.com/maggiolispa/ricerca-sviluppo-bari/synerbee
[react-gitlab]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/deprecated/react
[stencil-figma]: https://www.figma.com/file/evxGyMuj9309w6BZXXz4Ls/Magma-%2F-Web-Component
[stencil-gitlab]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/stencil
[stencil-website]: https://magma.maggiolicloud.it/checklist/componenti#accordion
[storybook]: https://magma.maggiolicloud.it/storybook/
[styles-figma]: https://www.figma.com/file/YIAVsdxdckKZI8rX3Plaef/Magma-%2F-Design-Tokens?type=design&node-id=0%3A1&mode=design&t=kpMihyaFTC1rtM5D-1
[styles-gitlab]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/styles
[styles-website]: https://magma.maggiolicloud.it/
[svg-icons-figma]: https://www.figma.com/file/yy2nOrefAySiO3R7uCMuMD/Magma-%2F-Icons?type=design&node-id=0%3A1&mode=design&t=wxcmDj6yNqQ5iU9b-1
[svg-icons-gitlab]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/svg-icons
[svg-icons-website]: https://magma.maggiolicloud.it/
