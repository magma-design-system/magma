// @vitest-environment jsdom
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { expect, test } from 'vitest'

import { IT } from '../src/i18n-it.js'
import { LANGUAGE_KEY, langOf, plural, startLanguage, translator } from '../src/i18n.js'

// The languages of the studio (#1336, i18n.ts): the language it starts in, the translator, and
// the Italian catalogue held to the sources, so a text added in English never ships without its
// Italian and an Italian text no source uses does not linger.

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '../src')

test('the studio starts in the language the person chose, else the one of the browser', () => {
  const page = document.implementation.createHTMLDocument('')
  const storage = window.localStorage
  storage.clear()
  // nothing chosen: Italian on a browser in Italian, English on any other
  expect(startLanguage(page, storage, 'it-IT')).toBe('it')
  expect(page.documentElement.lang).toBe('it')
  expect(startLanguage(page, storage, 'de-DE')).toBe('en')
  // the choice of the person wins over the browser
  storage.setItem(LANGUAGE_KEY, 'en')
  expect(startLanguage(page, storage, 'it-IT')).toBe('en')
  // a language the studio has no texts for, stored by another page of the origin, is dropped
  storage.setItem(LANGUAGE_KEY, 'es')
  expect(startLanguage(page, storage, 'it')).toBe('it')
  expect(storage.getItem(LANGUAGE_KEY)).toBeNull()
  storage.clear()
})

test('a text is translated by its English, then its placeholders filled; a count picks its form', () => {
  expect(langOf('it-CH')).toBe('it')
  expect(langOf('en')).toBe('en')
  expect(langOf('')).toBe('en')
  const it = translator('it')
  const en = translator('en')
  expect(it('Colors')).toBe('Colori')
  expect(en('Colors')).toBe('Colors')
  expect(it('for Magma v{version}', { version: '2.12.0' })).toBe('per Magma v2.12.0')
  // a text with no Italian stays English (the test below keeps none)
  expect(it('No such text')).toBe('No such text')
  expect(plural(en, 1, '{count} pair', '{count} pairs')).toBe('1 pair')
  expect(plural(en, 0, '{count} pair', '{count} pairs')).toBe('0 pairs')
})

/** The modules of the studio, parsed. */
const sources = readdirSync(src)
  .filter((name) => /\.tsx?$/.test(name) && !name.startsWith('i18n'))
  .map((name) => ({
    name,
    file: ts.createSourceFile(name, readFileSync(join(src, name), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX),
  }))

/** The texts an argument may be: a literal, or either branch of a condition. */
const literals = (node?: ts.Node): string[] => {
  if (!node) return []
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [node.text]
  if (ts.isParenthesizedExpression(node)) return literals(node.expression)
  if (ts.isConditionalExpression(node)) return [...literals(node.whenTrue), ...literals(node.whenFalse)]
  return []
}

const visit = (node: ts.Node, see: (node: ts.Node) => void) => {
  see(node)
  ts.forEachChild(node, (child) => visit(child, see))
}

/** Every text the sources hand to t(), msg() and plural(), with where it is. */
const used = new Map<string, string>()
for (const { name, file } of sources) {
  visit(file, (node) => {
    if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression)) return
    const callee = node.expression.text
    const texts =
      callee === 't' || callee === 'msg'
        ? literals(node.arguments[0])
        : callee === 'plural'
          ? [...literals(node.arguments[2]), ...literals(node.arguments[3])]
          : []
    for (const text of texts) used.set(text, `${name}:${file.getLineAndCharacterOfPosition(node.getStart()).line + 1}`)
  })
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()

test('every text of the studio has its Italian, with the same placeholders', () => {
  const missing = [...used].filter(([text]) => !(text in IT)).map(([text, at]) => `${at} ${JSON.stringify(text)}`)
  expect(missing).toEqual([])
  const differ = [...used.keys()]
    .filter((text) => text in IT && placeholders(text).join() !== placeholders(IT[text]).join())
  expect(differ).toEqual([])
})

test('every Italian text is used by a source', () => {
  expect(Object.keys(IT).filter((text) => !used.has(text))).toEqual([])
})

/**
 * The modules still in English while the branch of #1336 translates them one at a time: the two
 * tests below skip them. The last commit of the branch empties it and takes it away.
 */
const PENDING = new Set([
  'app.tsx', 'batch.tsx', 'config-menu.tsx', 'contrast.tsx', 'diff.tsx', 'groups.tsx', 'magma.tsx',
  'palette-side.tsx', 'scales.tsx', 'start.tsx', 'surfaces.tsx', 'themes.tsx', 'verdict.tsx',
])

/**
 * The attributes whose value people read or hear: written in English, they are a text left out of
 * the catalogue.
 */
const WORDED = new Set(['label', 'title', 'aria-label', 'headline', 'description', 'placeholder', 'alt', 'message'])
/** Texts that are no English: names, units, symbols. */
const NOT_ENGLISH = new Set(['Magma Studio', 'Lc', 'APCA', 'WCAG', 'DTCG', 'JSON', 'CSS', 'GIMP', 'Figma'])
const worded = (text: string) => /[A-Za-z]{2,}/.test(text) && !NOT_ENGLISH.has(text.trim())

test('no text of the interface is written outside the catalogue', () => {
  const found: string[] = []
  for (const { name, file } of sources) {
    if (PENDING.has(name)) continue
    visit(file, (node) => {
      const at = () => `${name}:${file.getLineAndCharacterOfPosition(node.getStart()).line + 1}`
      if (ts.isJsxText(node) && worded(node.text)) found.push(`${at()} ${JSON.stringify(node.text.trim())}`)
      if (ts.isJsxAttribute(node) && WORDED.has(node.name.getText())) {
        const value = node.initializer && ts.isStringLiteral(node.initializer) ? node.initializer.text : undefined
        if (value !== undefined && worded(value)) found.push(`${at()} ${node.name.getText()}=${JSON.stringify(value)}`)
      }
    })
  }
  expect(found).toEqual([])
})

/**
 * mds-button, mds-badge, mds-input-switch and mds-input-range copy the text of their slot into
 * their `label` once (readSlottedLabel, textContent), so a text in the slot would stay in the
 * language they loaded in: the text goes in `label`.
 */
const COPY_THEIR_SLOT = new Set(['mds-button', 'mds-badge', 'mds-input-switch', 'mds-input-range'])

test('no component that copies its slot once holds a translated text in it', () => {
  const found: string[] = []
  for (const { name, file } of sources) {
    if (PENDING.has(name)) continue
    visit(file, (node) => {
      if (!ts.isJsxElement(node) || !COPY_THEIR_SLOT.has(node.openingElement.tagName.getText())) return
      const text = node.children.some(
        (child) =>
          (ts.isJsxText(child) && child.text.trim() !== '') ||
          (ts.isJsxExpression(child) && !!child.expression && !ts.isJsxElement(child.expression) && !ts.isBinaryExpression(child.expression)),
      )
      if (text) found.push(`${name}:${file.getLineAndCharacterOfPosition(node.getStart()).line + 1} <${node.openingElement.tagName.getText()}>`)
    })
  }
  expect(found).toEqual([])
})
