![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Maggioli Design System Web-Component

## To generate a new web-component:

```
nx run stencil:generate
```

## To build a web-component:

```
nx run stencil:build --skip-nx-cache
```

## To generate an independent `package.json`, needed to publish the new web-component

```
nx run stencil:generate.package
```

## To publish the new web-component

### Build Stencil first

```
npx nx run stencil:build
```

### Isolate component

```
npx nx run stencil:isolate-component --skip-nx-cache
```

And follow script instructions

### Build and publish isolated component

```
cd .build/component-name
npm run build
npm publish --access public
```

---

## Tests

All tests paths are from this project `design-system/projects/stencil/` path.

### Regression tests

To run regression tests you'll need to have Docker installed on your local machine, this will ensure to run the same Chrome render between local machines with different operative systems.

#### Create references

First, if you don't have a reference images `.loki/reference` path, you need to run:

```
nx run stencil:test.regression.reference
```

Then you should see images inside `.loki/reference`, these images will be used to check differences after your changes.

You should do it AFTER a `git pull` and BEFORE starting to work:

```
git pull
nx run stencil:test.regression.reference
```

#### Make changes to the code and then run regression tests

When you have the reference images and you have worked

```
nx run stencil:test.regression.review
```

##### Clean to remove all image references

If for some reason you need to clean loki image cache:

```
nx run stencil:test.regression.clean
```

---


### Updating package version

```
nx run stencil:update.version {major | minor | patch} {component | all}
```

Assuming we have a `mds-foo` to default version `1.0.0`, if you run:

```
nx run stencil:update.version major mds-foo
```

Will become:

```json
{
  "name": "@maggioli-design-system/mds-foo",
  "version": "2.0.0"
}
```

Assuming we have a `mds-foo` to default version `1.0.0`, if you run:

```
nx run stencil:update.version minor mds-foo
```

Will become:

```json
{
  "name": "@maggioli-design-system/mds-foo",
  "version": "1.1.0"
}
```

Assuming we have a `mds-foo` to default version `1.0.0`, if you run:

```
nx run stencil:update.version patch mds-foo
```

Will become:

```json
{
  "name": "@maggioli-design-system/mds-foo",
  "version": "1.0.1"
}
```

### Update component dependencies

```
nx run stencil:update.dependencies {component | all}
```

Assuming we have a `mds-foo` to default version `1.0.0`, with two dependencies to be updated to `mds-dep-1@1.3.1` and `mds-dep-2@1.1.2`, if you run:

```
nx run stencil:update.dependencies mds-foo
```

Old dependencies:

```json
{
  "name": "@maggioli-design-system/mds-foo",
  "version": "1.0.0",
  "dependencies": {
    "@maggioli-design-system/mds-dep-1": "^1.2.0",
    "@maggioli-design-system/mds-dep-2": "^1.0.0"
  }
}
```

Will be updated to:

```json
{
  "name": "@maggioli-design-system/mds-foo",
  "version": "1.0.0",
  "dependencies": {
    "@maggioli-design-system/mds-dep-1": "^1.3.1",
    "@maggioli-design-system/mds-dep-2": "^1.1.2"
  }
}
```
