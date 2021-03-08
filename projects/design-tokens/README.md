# Design Tokens

This project generates the Design Tokens for the whole Design System.

To install che project as dependency:

```
npm install --save @maggioli-design-system/design-tokens
```

---

### CSS tokens configuration

| Property            | Expects          | Value                                   | Description                                   | Example                                      |
|---------------------|------------------|-----------------------------------------|-----------------------------------------------|----------------------------------------------|
| palette.format      | Array of strings | `['rgb-channels']`                      | Exports rgb channels color format             | Output: `--rgb-brand-maggioli-c-01:3,45,82;` |
| palette.format      | Array of strings | `['hex']`                               | Exports hex color format                      | Output: `--hex-brand-maggioli-c-01:#032d52;` |
| palette.scaffold    | Array of strings | `['background-color:background-color']` | Sets an alias to scaffolding color properties | `['bg:background-color']`                    |
| palette.colors      | Array of strings | `['brand.maggioli']`                    | Colors from `colors.json` should be built     |                                              |
| scaffold.properties | Array of strings | `['border-radius:border-radius']`       | Sets an alias to scaffolding properties       | `['br:border-radius']`                       |
