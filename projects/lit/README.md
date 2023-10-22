# Informations about this project

This project holds the form components developed with `lit`.

### Generate

To create a new lit component, use:

```
nx run lit:generate --component=mds-component-name
```

## Storybook

To run the `storybook` instance navigate to the `wrapper` sub-directory, install dependencies via `npm i` and then run `npm run storybook`.

*BEWARE*: when running this instance of `storybook` make sure that the `node_modules` root folder is not present, because will cause conflict with the `storybook`'s configs of this sub-project.
