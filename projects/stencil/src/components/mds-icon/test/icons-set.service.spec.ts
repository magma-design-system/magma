// An in-memory IndexedDB: the spec environment has none
const mockStore = new Map<string, string>()

jest.mock('idb-keyval', () => {
  return {
    get: jest.fn((key: string) => Promise.resolve(mockStore.get(key))),
    set: jest.fn((key: string, value: string) => {
      mockStore.set(key, value)
      return Promise.resolve()
    }),
    del: jest.fn((key: string) => {
      mockStore.delete(key)
      return Promise.resolve()
    }),
  }
})

import { get } from 'idb-keyval'
import { IconsSetService } from '../services/icons-set.service'

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2Z" /></svg>'

// the key under which the service caches an icon in IndexedDB
const cacheKey = (name: string): string => `loader_${IconsSetService.getSvgPath()}${name}.svg`

describe('IconsSetService cache', () => {
  let fetchSpy: jest.SpyInstance

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve(svg),
    } as Response))
    IconsSetService.setSvgPath('/icons-set-service/')
    mockStore.clear()
    jest.mocked(get).mockClear()
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  // each test uses its own icons: the memory cache lives as long as the service

  it('serves an icon already in memory without reading IndexedDB', async () => {
    await IconsSetService.fetchSvg('memory/fetched')
    jest.mocked(get).mockClear()

    expect(await IconsSetService.fetchSvg('memory/fetched')).toBe(svg)
    expect(get).not.toHaveBeenCalled()
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('keeps in memory an icon read from IndexedDB', async () => {
    mockStore.set(cacheKey('memory/stored'), JSON.stringify({ data: svg, expiry: Date.now() + 60000 }))

    expect(await IconsSetService.fetchSvg('memory/stored')).toBe(svg)
    expect(await IconsSetService.fetchSvg('memory/stored')).toBe(svg)
    expect(get).toHaveBeenCalledTimes(1)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('IconsSetService.setSvgPath', () => {
  it.each([
    ['/svg/', '/svg/'],
    ['svg/', 'svg/'],
    [' /svg/ ', '/svg/'],
    ['/svg/?v=3#top', '/svg/'],
    ['/static/icons.v2/svg/', '/static/icons.v2/svg/'],
    ['/node_modules/@maggioli-design-system/svg-icons/dist/svg/', '/node_modules/@maggioli-design-system/svg-icons/dist/svg/'],
    ['https://cdn.example.com/svg/', 'https://cdn.example.com/svg/'],
    ['https://my-cdn.example.com/svg/', 'https://my-cdn.example.com/svg/'],
    ['https://unpkg.com/@maggioli-design-system/svg-icons@4.5.0/dist/svg/', 'https://unpkg.com/@maggioli-design-system/svg-icons@4.5.0/dist/svg/'],
    ['https://cdn.example.com/svg/?v=3#top', 'https://cdn.example.com/svg/'],
    ['localhost:9000/svg/', '//localhost:9000/svg/'],
  ])('stores %j as %j', (path, expected) => {
    IconsSetService.setSvgPath(path)

    expect(IconsSetService.getSvgPath()).toBe(expected)
  })

  it.each(['', '   ', 'http://'])('throws on %j', path => {
    expect(() => IconsSetService.setSvgPath(path)).toThrow('Svg path not recognize')
  })
})
