import { migrateLegacyPreferenceStorage } from '@common/preference';

/** A Storage with only what the migration touches. */
const storageWith = (entries: Record<string, string>): Storage => {
  const data = new Map(Object.entries(entries));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    clear: () => data.clear(),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  };
};

const dump = (storage: Storage): Record<string, string> =>
  Object.fromEntries(
    Array.from({ length: storage.length }, (_, index) => {
      const key = storage.key(index)!;
      return [key, storage.getItem(key)!];
    }),
  );

describe('migrateLegacyPreferenceStorage', () => {
  it('moves a v1 mode and a v1 theme name to their v2 keys', () => {
    const storage = storageWith({
      mdsPrefTheme: 'dark',
      mdsPrefThemeName: 'business',
      mdsPrefThemeScheme: 'all',
    });

    migrateLegacyPreferenceStorage(storage);

    // mdsPrefTheme swaps meaning: from the mode to the theme name
    expect(dump(storage)).toEqual({
      mdsPrefMode: 'dark',
      mdsPrefTheme: 'business',
      mdsPrefThemeScheme: 'all',
    });
  });

  it('moves a v1 mode alone, leaving no theme name behind', () => {
    const storage = storageWith({ mdsPrefTheme: 'system' });

    migrateLegacyPreferenceStorage(storage);

    expect(dump(storage)).toEqual({ mdsPrefMode: 'system' });
  });

  it('leaves v2 storage alone, so running it again changes nothing', () => {
    const v2 = { mdsPrefMode: 'light', mdsPrefTheme: 'editorial' };
    const storage = storageWith(v2);

    migrateLegacyPreferenceStorage(storage);
    migrateLegacyPreferenceStorage(storage);

    expect(dump(storage)).toEqual(v2);
  });

  it('lets a v2 value outrank the v1 one it would replace', () => {
    const storage = storageWith({
      mdsPrefMode: 'light',
      mdsPrefTheme: 'dark',
      mdsPrefThemeName: 'business',
    });

    migrateLegacyPreferenceStorage(storage);

    expect(dump(storage)).toEqual({ mdsPrefMode: 'light', mdsPrefTheme: 'business' });
  });

  // magma 3 removed `default`, the old name of `business` a magma 2 page stored (#1334)
  it('reads a stored default, the magma 2 name of business, as business', () => {
    const storage = storageWith({ mdsPrefMode: 'dark', mdsPrefTheme: 'default' });

    migrateLegacyPreferenceStorage(storage);

    expect(dump(storage)).toEqual({ mdsPrefMode: 'dark', mdsPrefTheme: 'business' });
  });

  it('carries a v1 default over to business too', () => {
    const storage = storageWith({ mdsPrefThemeName: 'default' });

    migrateLegacyPreferenceStorage(storage);

    expect(dump(storage)).toEqual({ mdsPrefTheme: 'business' });
  });

  it('leaves cool and warm alone, which a product may name a theme of its own', () => {
    const storage = storageWith({ mdsPrefTheme: 'cool' });

    migrateLegacyPreferenceStorage(storage);

    expect(dump(storage)).toEqual({ mdsPrefTheme: 'cool' });
  });
});
