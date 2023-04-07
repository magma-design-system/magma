import { get, set, del } from 'idb-keyval'
import { IconNameResolverFn, MdsIconSet } from '../meta/icon-set'
class IconsSetController {
  private _svgPath: string
  private _iconsSets: Map<string, MdsIconSet> = new Map()

  public readonly _svgPathKey = 'mdsIconSvgPath'

  private readonly _svgPathUpdate = 'mdsIconSvgPathUpdate'

  private readonly cacheExp = 60 * 60 * 1000 * 24

  private memoryCache = {}

  private listeners: (() => void)[] = []

  constructor () {
    this.setUpListener()
  }

  addIconSet (name: string, path: string, resolveIconName: IconNameResolverFn): boolean {
    let resolveFunction = resolveIconName

    const existingSet = this._iconsSets.get(name)

    if (!resolveFunction && existingSet && typeof existingSet.resolver === 'function') {
      resolveFunction = existingSet.resolver
    } else if (resolveFunction && typeof resolveFunction !== 'function') {
      console.error('MdsIconSvg: the third input of addIconSet should be a function that parses and returns the icons\'s filename.')
      return false
    } else if (!resolveFunction) {
      console.error(`MdsIconSvg: the set ${name} needs a resolve function for the icon names.`)
      return false
    }

    this._iconsSets.set(name, new MdsIconSet(name, path, resolveFunction))
    return true
  }

  getIconSet (iconName: string) {
    if (!iconName) return { set: null }
    return { set: this._iconsSets.get(iconName.split('/')[0]) }
  }

  setSvgPath (svgPath: string): void {
    this._svgPath = svgPath
    window.dispatchEvent(new Event(this._svgPathUpdate))
  }

  getSvgPath (): string {
    return this._svgPath
  }

  registerListener (callback: () => void): void {
    this.listeners.push(callback)
  }

  // Try to retrieve svg from cache
  private isCacheAvailable = async (url: string) => {
    try {
      const loaderItem = await get(`loader_${url}`)

      if (!loaderItem) {
        return false
      }

      const item = JSON.parse(loaderItem)

      if (Date.now() < item.expiry) {
        return item.data
      }

      del(`loader_${url}`)
      return false
    } catch (e) {
      console.error('isCacheAvailable error', e)
      return false
    }
  }

  // Set svg to cache
  private setCache = async (url: string, data: string) => {
    try {
      await set(`loader_${url}`, JSON.stringify({
        data,
        expiry: Date.now() + this.cacheExp,
      }))

    } catch (e) {
      console.error('setCache error', e)
    }
  }

  private setUpListener (): void {
    window.addEventListener(this._svgPathUpdate, () => {
      for (const listener of this.listeners) listener()
    })
  }

  async fetchSvg (src: string): Promise<string> {
    try {
      const lsCache = await this.isCacheAvailable(src)

      if (this.memoryCache[src] || lsCache) {
        return this.memoryCache[src] || lsCache
      }

      const response = await fetch(src)
      if (!response.ok) {
        throw Error(`Request for '${src}' returned ${response.status} (${response.statusText})`)
      }

      const body = await response.text()
      const bodyLower = body.toLowerCase().trim()

      if (!(bodyLower.startsWith('<svg') || bodyLower.startsWith('<?xml'))) {
        throw Error(`Resource '${src}' returned an invalid SVG file`)
      }

      this.setCache(src, body)

      this.memoryCache[src] = body

      return body
    } catch (e) {
      console.error('fetchSvg error', e)
      return ''
    }
  }
}

export const IconsSetService = new IconsSetController()
