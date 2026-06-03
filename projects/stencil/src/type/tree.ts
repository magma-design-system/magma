export const treeActionsDictionary = ['auto', 'visible'] as const;
export type TreeActions = (typeof treeActionsDictionary)[number];

export const treeAppearanceDictionary = ['depth', 'none'] as const;
export type TreeAppearance = (typeof treeAppearanceDictionary)[number];

export const treeIconDictionary = ['folder', 'chevron'] as const;
export type TreeIcon = (typeof treeIconDictionary)[number];
