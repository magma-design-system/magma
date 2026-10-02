import { vi } from '@stencil/vitest';
import { del, get, set } from 'idb-keyval';
import { IconsSetService } from '../services/icons-set.service';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2Z" /></svg>';
const svgPath = '/icons-set-service/';

// the key under which the service caches an icon in IndexedDB
const cacheKey = (name: string): string => `loader_${IconsSetService.getSvgPath()}${name}.svg`;

// The IndexedDB connections opened by idb-keyval, so a test can close them the way the browser
// does after a `Clear-Site-Data: "storage"` response or when the user clears the site data.
// Patched before any test runs, so the first connection is recorded too.
const connections: IDBDatabase[] = [];
const openDatabase = indexedDB.open.bind(indexedDB);
indexedDB.open = (...args: Parameters<IDBFactory['open']>): IDBOpenDBRequest => {
  const request = openDatabase(...args);
  request.addEventListener('success', () => connections.push(request.result));
  return request;
};

// A forced close: the connection stops accepting transactions and receives a `close` event
const closeConnectionsLikeTheBrowser = (): void => {
  for (const connection of connections.splice(0)) {
    connection.close();
    connection.dispatchEvent(new Event('close'));
  }
};

describe('IconsSetService cache', () => {
  const names: string[] = [];
  // each test uses its own icons: the memory cache lives as long as the page
  const icon = (name: string): string => {
    names.push(name);
    return name;
  };

  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(svg, { status: 200 })),
    );
    IconsSetService.setSvgPath(svgPath);
  });

  afterEach(async () => {
    await Promise.all(names.splice(0).map((name) => del(cacheKey(name))));
  });

  it('serves an icon already in memory without reading IndexedDB', async () => {
    const name = icon('memory/fetched');
    await IconsSetService.fetchSvg(name);
    const read = vi.spyOn(IDBObjectStore.prototype, 'get');

    expect(await IconsSetService.fetchSvg(name)).toBe(svg);
    expect(read).not.toHaveBeenCalled();
    expect(window.fetch).toHaveBeenCalledOnce();
  });

  it('keeps in memory an icon read from IndexedDB', async () => {
    const name = icon('memory/stored');
    await set(cacheKey(name), JSON.stringify({ data: svg, expiry: Date.now() + 60_000 }));
    const read = vi.spyOn(IDBObjectStore.prototype, 'get');

    expect(await IconsSetService.fetchSvg(name)).toBe(svg);
    expect(await IconsSetService.fetchSvg(name)).toBe(svg);
    expect(read).toHaveBeenCalledOnce();
    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('reopens IndexedDB after the browser closes the connection', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const before = icon('connection/before');
    const after = icon('connection/after');

    await IconsSetService.fetchSvg(before);
    await vi.waitFor(async () => expect(await get(cacheKey(before))).toBeDefined());
    expect(connections).not.toHaveLength(0);

    closeConnectionsLikeTheBrowser();

    expect(await IconsSetService.fetchSvg(after)).toBe(svg);
    await vi.waitFor(async () => expect(await get(cacheKey(after))).toBeDefined());
    expect(consoleError).not.toHaveBeenCalled();
  });
});
