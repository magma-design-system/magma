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
Provide a general summary of the issue.

Example:
I would like to fix CSS custom properties to the web component `mds-text`
to let other components be able to style text selection, which is not possible right now.
-->

## Proposal impact

This feature should be a:

- [~] Breaking change
- [~] Minor
- [x] Patch

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

## Expected behaviour

<!-- 🔴 Required
Tell us what should happen and how is expected to behave.

Example:
The component should let access to `--selection-background` and `--selection-color`
CSS custom properties, but it seem it's not working.
-->

## Current behaviour

<!-- 🔴 Required
Tell us what happens instead of the expected behaviour.

Example:
If I set `--selection-background` or `--selection-color`,
it's just not setting the color or background color when the text is selected.
-->

## Possible solution

<!-- 🟢 Optional
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

<!-- 🔴 Required
Provide a link to a live example, or an unambiguous set of steps to reproduce this bug.
Include code to reproduce, if relevant.

Example:
1. Pull the repo, and remember to be on branch `dev`;
2. Run the command `nx run stencil:storybook.start` to start the environment;
3. Go to the [component storybook test][storybook] to reach it;
4. Try to select the text.
-->

## Context (environment)

<!-- 🟡 Recommended
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

<!-- 🟡 Recommended
Provide a description of the change or the addition you are proposing.

Example:
I just would like to add the CSS which is missing as mentioned above.
-->

## Possible implementation

<!-- 🟢 Optional
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
