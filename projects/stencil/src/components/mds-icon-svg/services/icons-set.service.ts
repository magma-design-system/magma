import { IconNameResolverFn, MdsIconSet } from '../meta/icon-set'

class IconsSetController {
  private _svgPath: string
  private _iconsSets: Map<string, MdsIconSet> = new Map()

  addIconSet (name: string, path: string, resolveIconName: IconNameResolverFn): boolean {
    console.log(`addIconSet - name: ${name} | path: ${path}`)
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
    console.log(`getIconSet - iconName: ${iconName}`)
    if (!iconName) return { set: null }
    return { set: this._iconsSets.get(iconName.split('/')[0]) }
  }

  setSvgPath (svgPath: string): void {
    this._svgPath = svgPath
  }

  getSvgPath (): string {
    return this._svgPath
  }
}

export const IconsSetService = new IconsSetController()
