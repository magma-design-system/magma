import { get, set, del } from 'idb-keyval'
import { IconNameResolverFn, MdsIconSet } from '../meta/icon-set'
class IconsSetController {
  public readonly _svgPathKey = 'mdsIconSvgPath'

  private readonly _iconsSets: Map<string, MdsIconSet> = new Map()
  private readonly _svgPathUpdate = 'mdsIconSvgPathUpdate'
  private readonly cacheExp = 60 * 60 * 1000 * 24
  private readonly listeners: (() => void)[] = []

  private _svgPath: string
  private memoryCache = {}

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

  /**
   * recognize svg path pattern and set host and svgPath variable
   *
   * input path: https://www.abc.com/svg/path
   * svgPath =  https://www.abc.com/svg/path
   *
   * input path: localhost:9000/svg/path
   * svgPath = localhost:9000/svg/path
   *
   * input path: /svg/path
   * svgPath = {window.location.host}/svg/path
   *
   * input path: svg/path
   * throw error
   *
   */
  setSvgPath (svgPath: string): void {
    const reg = /^(((https?:\/\/)?[.\w]+(:\d+)?)|\/)([\w/-]+)*/
    const match = reg.exec(svgPath)
    if (!match) {throw Error(`Svg path not recognize ${svgPath}, ensure is a absolute path starting with '/' or a url`)}

    if (typeof window !== 'undefined') {
      this._svgPath = match[1] ? match[0] : window.location.origin.concat(match[0])
      window.dispatchEvent(new Event(this._svgPathUpdate))
    }
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
    if (typeof window !== 'undefined') {
      window.addEventListener(this._svgPathUpdate, () => {
        for (const listener of this.listeners) listener()
      })
    }
  }

  async fetchSvg (name: string): Promise<string> {
    try {
      if (!this._svgPath && typeof window === 'undefined') { throw Error('Cant find svgPath, ensure you set it')}
      if (!this._svgPath) {
        this.setSvgPath(window.sessionStorage.getItem(IconsSetService._svgPathKey) ?? '')
      }
      const src = this._svgPath && !name.startsWith('http') ? this._svgPath.concat(name, '.svg') : name
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
