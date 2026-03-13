import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { COMPONENTS_DIR } from './meta'

type StencilDocumentation = {
  components: Array<{
    tag: string
    dependencies?: string[]
  }>
}

const FOUC_IMPORT_REGEX = /@import\s+["']\.\.\/\.\.\/tailwind\/fouc\.css["'];?/

function safeReadJSON<T> (path: string): T | null {
  try {
    const raw = readFileSync(path, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function updateComponentFouc (componentDirName: string) {
  const componentDir = join(COMPONENTS_DIR, componentDirName)
  const documentationPath = join(componentDir, 'documentation.json')

  if (!existsSync(documentationPath)) return

  const documentation = safeReadJSON<StencilDocumentation>(documentationPath)
  if (!documentation || !Array.isArray(documentation.components) || documentation.components.length === 0) return

  const component = documentation.components.find(c => c.tag === componentDirName) ?? documentation.components[0]
  const deps = component.dependencies ?? []

  const tagNames = deps
    .filter(dep => dep.startsWith('mds-'))
    .sort((a, b) => a.localeCompare(b))
  if (tagNames.length === 0) return

  const mainCssPath = join(componentDir, `${componentDirName}.css`)
  if (existsSync(mainCssPath)) {
    let css = readFileSync(mainCssPath, 'utf8')

    if (FOUC_IMPORT_REGEX.test(css)) {
      css = css.replace(FOUC_IMPORT_REGEX, `@import './css/${componentDirName}-fouc.css';`)
      writeFileSync(mainCssPath, css, 'utf8')
    }
  }

  const cssDir = join(componentDir, 'css')
  if (!existsSync(cssDir)) {
    mkdirSync(cssDir)
  }

  const foucFilePath = join(cssDir, `${componentDirName}-fouc.css`)

  const selectorLines = tagNames.map((tag, index) => {
    const suffix = index === tagNames.length - 1 ? '' : ','
    return `${tag}${suffix}`
  })

  const content = [
    '@import \'../../../tailwind/fouc.css\';',
    '',
    `${selectorLines.join('\n')} {`,
    '  &:not(:is([hydrated], .hydrated)) {',
    '    @apply not-hydrated;',
    '  }',
    '}',
    '',
  ].join('\n')

  writeFileSync(foucFilePath, content, 'utf8')
}

function main () {
  const entries = readdirSync(COMPONENTS_DIR, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (!entry.name.startsWith('mds-')) continue

    updateComponentFouc(entry.name)
  }
}

main()

