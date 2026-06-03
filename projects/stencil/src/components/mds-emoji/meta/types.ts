export type EmojiNames = 'mia' | 'simi';

export type SvgNode = SVGElement | SVGGElement | null;

export type SvgPart<T extends string = string> = {
  default: SvgNode;
} & Partial<Record<T, SvgNode>>;

export type SvgDictionary = {
  eyebrows?: SvgPart;
  eyes: SvgPart<'closed'>;
  gadget?: SvgPart;
  ears?: SvgPart;
  hand?: SvgPart<'think'>;
  head: SvgPart;
  mouth: SvgPart<'smile' | 'serious'>;
};
