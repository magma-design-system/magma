import { TypographyType } from '@type/typography';
import { textTitleRoleDictionary } from './dictionary';

export type TextAnimationType = 'none' | 'yugop';

/** The roles of a title in the design language (#1189, titles): values of `mds-text` only. */
export type TextTitleRoleType = (typeof textTitleRoleDictionary)[number];

export type TextTypographyType = TypographyType | TextTitleRoleType;
