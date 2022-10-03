<!-- Start script-generated Magma Docs -->

# Install

Install the component via `npm` by running the following command

```bash
npm install @maggioli-design-system/{{componentName}}
```

This package works also with yarn:

```bash
yarn add @maggioli-design-system/{{componentName}}
```

# Import

Import the component in your project via `TypeScript` as follows:

```typescript
import { defineCustomElements as dce{{capitalizedComponentName}} } from '@maggioli-design-system/{{componentName}}/loader'

dce{{capitalizedComponentName}}()
```

If you need to support older browsers (i.e. IE or early version of Edge), you can wrap the `defineCustomElements` in another utility awailable in the same package:

```typescript
import { applyPolyfills as ap{{capitalizedComponentName}}, defineCustomElements as dce{{capitalizedComponentName}} } from '@maggioli-design-system/{{componentName}}/loader'

ap{{capitalizedComponentName}}().then(dce{{capitalizedComponentName}}())
```

Use alias for `defineCustomElements` method to initialize multiple web components in the same place:

```typescript
import { defineCustomElements as dceMdsComponentOne } from '@maggioli-design-system/mds-component-one/loader'
import { defineCustomElements as dceMdsComponentTwo } from '@maggioli-design-system/mds-component-two/loader'

dceMdsComponentOne()
dceMdsComponentTwo()
```

You can check how browser support works at [this page][stencil-browser-support].

# Integration

<!-- This section is useful to describe usages and configurations -->

#### How to use it in HTML

<!-- Add information about HTML usage here -->

#### How to all methods

<!-- Add information on how use the component's methods here -->

#### How to listen to events

<!-- Add information on how to listen to component's events here -->

#### How to set the configuration

<!-- Add information on how configure the component here -->

You can try it out on the component's [Storybook website][storybook]!

<!-- TODO set correct storybook link, `ui` may need to be changed into something else -->
[storybook]: https://magma.maggiolicloud.it/storybook/?path=/story/ui-{{componentNameWithNoPrefix}}--default
[stencil-browser-support]: https://stenciljs.com/docs/browser-support

<!-- End script-generated Magma Docs -->
