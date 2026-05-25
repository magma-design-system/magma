export const progressBarSizeDictionary = ['sm', 'md', 'lg', 'xl'] as const;

export type ProgressBarSizeType = (typeof progressBarSizeDictionary)[number];
