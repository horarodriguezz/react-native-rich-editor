import getIsInRange from "../utils/getIsInRange";
import { RichBlock } from "./Block";
import { InlineStyle, InlineStyleRange } from "./InlineStyle";
import { Selection } from "./Selection";

export class EditorState {
  public blocks: RichBlock[];

  public selection: Selection;

  constructor(blocks?: RichBlock[], selection?: Selection) {
    this.blocks = blocks ?? [RichBlock.createEmpty()];
    this.selection = selection ?? Selection.createEmpty();
  }

  public static createEmpty(): EditorState {
    return new EditorState();
  }

  public static createFromText(
    text: string,
    inlineStyleRanges: InlineStyleRange[]
  ): EditorState {
    const selection = new Selection(text.length, text.length);

    const defaultRange: InlineStyleRange = {
      offset: 0,
      length: text.length,
      styles: [InlineStyle.DEFAULT],
    };

    const firstBlock = new RichBlock(text, inlineStyleRanges ?? [defaultRange]);

    return new EditorState([firstBlock], selection);
  }

  public getFirstSelectedBlock(): RichBlock | undefined {
    const { from } = this.selection;

    return this.blocks.find((block) =>
      block.inlineStyleRanges.some((range) => getIsInRange(from - 1, range))
    );
  }

  public getSelectedBlocks(): RichBlock | RichBlock[] | undefined {
    const { from, to, collapsed } = this.selection;

    if (collapsed) {
      return this.blocks.find((block) =>
        block.inlineStyleRanges.some((range) => getIsInRange(from - 1, range))
      );
    }

    return this.blocks.filter((block) => {
      return block.inlineStyleRanges.some((range) => {
        return getIsInRange(from, range) || getIsInRange(to, range);
      });
    });
  }

  public getText(): string {
    return this.blocks.map((block) => block.text).join("");
  }
}
