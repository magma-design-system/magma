# Install

Install the component via `npm` by running the following command

```bash
npm install @maggioli-design-system/{{componentName}}
```

# Import

Import the component in your project via `typescript` like the following

```typescript
import { defineCustomElements as dce{{capitalizedComponentName}} } from '@maggioli-design-system/{{componentName}}/loader'

dce{{capitalizedComponentName}}()
```

If you need to support older browsers (i.e. IE or early version of Edge), you can wrap the `defineCustomElements` in another utility awailable in the same package

```typescript
import { applyPolyfills as ap{{capitalizedComponentName}}, defineCustomElements as dce{{capitalizedComponentName}} } from '@maggioli-design-system/{{componentName}}/loader'

ap{{capitalizedComponentName}}().then(dce{{capitalizedComponentName}}())
```

You can check browser support at [this page](https://stenciljs.com/docs/browser-support).

# How To

<!--  -->

## Use in HTML

<!-- Add information about HTML usage here -->

## Call methods

<!-- Add information on how use the component's methods here -->

## Listen to events

<!-- Add information on how to listen to component's events here -->

## Configuration

<!-- Add information on how configure the component here -->

You can try it out on the component's playground [site](https://magma.maggiolicloud.it/storybook/?path=/story/ui-author--default)!
