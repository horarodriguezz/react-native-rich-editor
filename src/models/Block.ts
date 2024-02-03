import { InlineStyle, InlineStyleRange, Style } from "./InlineStyle";

export class RichBlock {
  public text: string;

  public inlineStyleRanges: InlineStyleRange[];

  public mutability: BlockMutabilityType;

  constructor(
    text: string,
    inlineStyleRanges: InlineStyleRange[],
    mutability?: BlockMutabilityType
  ) {
    this.text = text;
    this.inlineStyleRanges = inlineStyleRanges;
    this.mutability = mutability ?? BlockMutability.MUTABLE;
  }

  public static createEmpty(
    mutability?: BlockMutabilityType,
    initialStyle?: Style
  ): RichBlock {
    const defaultRange: InlineStyleRange = {
      offset: 0,
      length: 0,
      styles: [initialStyle ?? InlineStyle.DEFAULT],
    };

    return new RichBlock("", [defaultRange], mutability);
  }

  public static createFromText(
    text: string,
    mutability?: BlockMutabilityType,
    styles?: Style[]
  ): RichBlock {
    const defaultRange: InlineStyleRange = {
      offset: 0,
      length: text.length,
      styles: styles ?? [InlineStyle.DEFAULT],
    };

    return new RichBlock(text, [defaultRange], mutability);
  }
}

export type BlockMutabilityType = keyof typeof BlockMutability;

export enum BlockMutability {
  MUTABLE = "MUTABLE",

  IMMUTABLE = "IMMUTABLE",
}
