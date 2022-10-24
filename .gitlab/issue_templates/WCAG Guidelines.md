<!--
  ℹ️ Some infos
  🔴 Required:    If you skip this step, the issue could be ignored or closed prematurely.
  🟡 Recommended: Very important infos to let core team gain time on understanding the issue/merge request.
  🟢 Optional:    Some additional information to be more complete.

  🏋🏻‍♂️ Weight
  Measure the issue weight by the days you think you need to complete it:
  Available values: 1, 2, 3, 5, 8 (if 9+ you should consider to split in multiple issues)

  📐 Rules
  Please, try to respect the naming convention:
  Issue name: WCAG mds-[component-name] (Es: WCAG mds-avatar)
  Branch name: [issue-id]-wcag-mds-[component-name] (Es: 130-wcag-mds-avatar)
-->

## Component infos

<!-- 🔴 Required
Provide the name and the url of the component which needs to support WCAG.
-->

| Component name | Infos |
|-|-|
| `mds-avatar` | [Component URL](https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/stencil/src/components/mds-accordion) |

## WCAG Checklist

Guidance for writing, designing, and developing for accessibility, [these tips](https://www.w3.org/WAI/tips/) introduce some basic considerations for making your website more accessible to people with disabilities.

Links provide links to additional guidance.

#### 1. Writing

<!-- 🔴 Required
Provide a list of the WCAG guidelines that the component should support.

If a checklist item is not applicable, make a line through it:
- [ ] Provide informative, unique page titles
becomes
- [~] Provide informative, unique page titles
-->

- [~] [Provide informative, unique page titles](https://www.w3.org/WAI/tips/writing/#provide-informative-unique-page-titles)
- [~] [Use headings to convey meaning and structure](https://www.w3.org/WAI/tips/writing/#use-headings-to-convey-meaning-and-structure)
- [~] [Make link text meaningful](https://www.w3.org/WAI/tips/writing/#make-link-text-meaningful)
- [~] [Write meaningful text alternatives for images](https://www.w3.org/WAI/tips/writing/#write-meaningful-text-alternatives-for-images)
- [~] [Create transcripts and captions for multimedia](https://www.w3.org/WAI/tips/writing/#create-transcripts-and-captions-for-multimedia)
- [~] [Provide clear instructions](https://www.w3.org/WAI/tips/writing/#provide-clear-instructions)
- [~] [Keep content clear and concise](https://www.w3.org/WAI/tips/writing/#keep-content-clear-and-concise)

#### 2. Designing

<!-- 🔴 Required
Provide a list of the WCAG guidelines that the component should support.

If a checklist item is not applicable, make a line through it:
- [ ] Provide sufficient contrast between foreground and background
becomes
- [~] Provide sufficient contrast between foreground and background
-->

- [ ] [Provide sufficient contrast between foreground and background](https://www.w3.org/WAI/tips/designing/#provide-sufficient-contrast-between-foreground-and-background)
- [ ] [Don’t use color alone to convey information](https://www.w3.org/WAI/tips/designing/#dont-use-color-alone-to-convey-information)
- [ ] [Ensure that interactive elements are easy to identify](https://www.w3.org/WAI/tips/designing/#ensure-that-interactive-elements-are-easy-to-identify)
- [~] [Provide clear and consistent navigation options](https://www.w3.org/WAI/tips/designing/#provide-clear-and-consistent-navigation-options)
- [~] [Ensure that form elements include clearly associated labels](https://www.w3.org/WAI/tips/designing/#ensure-that-form-elements-include-clearly-associated-labels)
- [ ] [Provide easily identifiable feedback](https://www.w3.org/WAI/tips/designing/#provide-easily-identifiable-feedback)
- [ ] [Use headings and spacing to group related content](https://www.w3.org/WAI/tips/designing/#use-headings-and-spacing-to-group-related-content)
- [~] [Create designs for different viewport sizes](https://www.w3.org/WAI/tips/designing/#create-designs-for-different-viewport-sizes)
- [~] [Include image and media alternatives in your design](https://www.w3.org/WAI/tips/designing/#include-image-and-media-alternatives-in-your-design)
- [~] [Provide controls for content that starts automatically](https://www.w3.org/WAI/tips/designing/#provide-controls-for-content-that-starts-automatically)

#### 3. Developing

<!-- 🔴 Required
Provide a list of the WCAG guidelines that the component should support.

If a checklist item is not applicable, make a line through it:
- [ ] Associate a label with every form control
becomes
[~] Associate a label with every form control
-->

- [~] [Associate a label with every form control](https://www.w3.org/WAI/tips/developing/#associate-a-label-with-every-form-control)
- [~] [Include alternative text for images](https://www.w3.org/WAI/tips/developing/#include-alternative-text-for-images)
- [~] [Identify page language and language changes](https://www.w3.org/WAI/tips/developing/#identify-page-language-and-language-changes)
- [ ] [Use markup to convey meaning and structure](https://www.w3.org/WAI/tips/developing/#use-mark-up-to-convey-meaning-and-structure)
- [~] [Help users avoid and correct mistakes](https://www.w3.org/WAI/tips/developing/#help-users-avoid-and-correct-mistakes)
- [ ] [Reflect the reading order in the code order](https://www.w3.org/WAI/tips/developing/#reflect-the-reading-order-in-the-code-order)
- [ ] [Write code that adapts to the user’s technology](https://www.w3.org/WAI/tips/developing/#write-code-that-adapts-to-the-users-technology)
- [ ] [Provide meaning for non-standard interactive elements](https://www.w3.org/WAI/tips/developing/#provide-meaning-for-non-standard-interactive-elements)
- [ ] [Ensure that all interactive elements are keyboard accessible](https://www.w3.org/WAI/tips/developing/#ensure-that-all-interactive-elements-are-keyboard-accessible)
- [~] [Avoid CAPTCHA where possible](https://www.w3.org/WAI/tips/developing/#avoid-captcha-where-possible)

#### 4. ARIA support

Remember, [no ARIA is better than bad ARIA](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/), if you need to use ARIA, make sure you understand the [ARIA roles, states, and properties](https://www.w3.org/TR/wai-aria-1.1/#roles_states_props) and [ARIA design patterns](https://www.w3.org/TR/wai-aria-practices-1.1/).

Find the best [pattern](https://www.w3.org/WAI/ARIA/apg/patterns/) for the component you are building, and make sure you understand the [ARIA roles, states, and properties](https://www.w3.org/TR/wai-aria-1.1/#roles_states_props) that are used in the pattern.

Here is an [Index of ARIA design patterns examples](https://w3c.github.io/aria-practices/examples/).


A pratical list of ARIA examples based on the video [WAI-ARIA: le sue potenzialità e le strategie per evitare errori](https://www.youtube.com/watch?v=DAkwSvrIX9o) (in Italian):

- [ ] [Notifications](https://youtu.be/DAkwSvrIX9o?t=790)
- [ ] [Breadcrumbs](https://youtu.be/DAkwSvrIX9o?t=904)
- [ ] Modal windows [example 1](https://youtu.be/DAkwSvrIX9o?t=1068), [example 2](https://youtu.be/-ZO3QVgs-sk?t=617)
- [ ] [Opened, closed state](https://youtu.be/DAkwSvrIX9o?t=1356)
- [ ] [Dropdown menu](https://youtu.be/DAkwSvrIX9o?t=1624)
- [ ] Tabs [example 1](https://youtu.be/DAkwSvrIX9o?t=1725), [example 2](https://youtu.be/-ZO3QVgs-sk?t=428)


#### 5. Automatic behavior

- [ ] [Converting divs into accessible pseudo-buttons](https://benfrain.com/converting-divs-into-accessible-pseudo-buttons/)

---

## Web Accessibility evaluation tools list

You can find the [Web Accessibility evaluation tools list here][wael], we reported it below.

- [WCAG 2.1 Scan Tool][wcag-scan]: Get a free WCAG 2.1 A/AA compliance summary of your website from our A11Y Compliance Platform.
- [Web Accessibility][wa]: Accessibility tools for your entire development lifecycle. Need to test an app or secure site? We have tools for that. Our tools provide additional flexibility for testing sites requiring authentication and mobile apps. Download our browser extension or development tools to start your accessibility journey.
- [A11Y Color Contrast Accessibility Validator][a11y-color]: A free website compliance tool that displays the color contrast issues of a web page per WCAG Guidelines. The results display color combinations that fail the contrast checkpoints and provide specific recommendations on how to fix the issue to become compliant.
- [WAVE]: A suite of evaluation tools that helps authors make their web content more accessible to individuals with disabilities. WAVE can identify many accessibility and Web Content Accessibility Guideline (WCAG) errors, but also facilitates human evaluation of web content.

[wael]: https://www.w3.org/WAI/ER/tools/
[wave]: https://wave.webaim.org/
[wa]: https://www.webaccessibility.com/tools/
[a11y-color]: https://color.a11y.com/?wc3
[wcag-scan]: https://www.boia.org/w3c-tools-services-a11y


<!-- 🚧 DO NOT REMOVE 🚧 -->

[ci]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/pipelines
[design-tokens]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/design-tokens
[figma-web-components]: https://www.figma.com/file/evxGyMuj9309w6BZXXz4Ls/Magma-%2F-Web-Component
[figma]: https://www.figma.com/files/team/945687796790515562
[gitlab]: https://gitlab.com/
[icons]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/icons
[identity]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/identity
[react]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/react
[stencil]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/stencil
[styles]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/styles
[svg-icons]: https://gitlab.com/maggiolispa/ricerca-sviluppo-new-media/design-system/-/tree/dev/projects/svg-icons
