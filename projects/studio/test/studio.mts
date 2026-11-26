import { h, type ComponentChild } from 'preact'

import { useConfigMenu, type ConfigAction } from '../src/app/config-menu.js'
import { createStudio, StudioContext, type StudioOptions, type StudioState } from '../src/state/studio.js'
import { checkSource } from '../src/state/work.js'

// The state of the studio for the tests of its pages (#1400): the work is the state's, and a page
// reads it from the StudioContext the shell provides.

/** A state as the shell makes it: kept in the storage of jsdom, its source checked. */
export function startStudio (options?: StudioOptions): StudioState {
  const studio = createStudio(options)
  void checkSource(studio)
  return studio
}

/** A page drawn inside a studio, as the shell draws it. */
export const inStudio = (studio: StudioState, ...pages: ComponentChild[]) =>
  h(StudioContext.Provider, { value: studio }, ...pages)

/**
 * The actions of the Config menu as the bar draws them, handed to `take` at each draw, and the
 * picker of Import config: the menu beside a page, without the rest of the bar.
 */
export function ConfigMenu ({ take }: { take: (actions: ConfigAction[]) => void }) {
  const { actions, input } = useConfigMenu(() => undefined)
  take(actions)
  return input
}
