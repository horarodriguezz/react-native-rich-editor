import getIsInRange from "../utils/getIsInRange";
import getTextDifference from "../utils/getTextDifference";
import { BlockMutabilityType, RichBlock } from "./Block";
import { EditorState } from "./EditorState";
import { Style } from "./InlineStyle";
import { Selection } from "./Selection";

export class Modifier {
  public static updateSelection(
    editorState: EditorState,
    selection: Selection
  ): EditorState {
    return new EditorState(editorState.blocks, selection);
  }

  public static insertText(
    editorState: EditorState,
    text: string
  ): EditorState {
    /**
     * 1. Obtain the text insertion.
     */
    const { from } = editorState.selection;

    const oldText = editorState.getText();

    const addedText = getTextDifference(oldText, text);

    /**
     * 2. Find the selected block.
     */
    const selectedBlock = editorState.getSelectedBlocks() as
      | RichBlock
      | undefined;

    if (!selectedBlock) {
      return editorState;
    }

    /**
     * 3. Update text and ranges.
     */
    const newBlockText =
      selectedBlock.text.slice(0, from) +
      addedText +
      selectedBlock.text.slice(from);

    const newRanges = this.updateRanges(selectedBlock, from, newBlockText);

    const newBlock = new RichBlock(newBlockText, newRanges);

    const newBlocks = editorState.blocks.map((block) => {
      if (block === selectedBlock) {
        return newBlock;
      }

      return block;
    });

    return new EditorState(newBlocks, editorState.selection);
  }

  public static replaceText(editorState: EditorState, text: string) {
    /**
     * 1. Obtain the text insertion.
     */
    const { from, to } = editorState.selection;

    const oldText = editorState.getText();

    const addedText = getTextDifference(oldText, text);

    console.log("added", addedText.split(""));

    const selectionRange = to - from;

    /**
     * 2. Find the selected block.
     */
    const firstSelectedBlock = editorState.getFirstSelectedBlock();

    console.log("selected", firstSelectedBlock);

    console.log("total", selectionRange);

    console.log("from", from);

    const overflowsFirstBlock =
      firstSelectedBlock &&
      firstSelectedBlock.text.length - from < selectionRange;

    /**
     * 2.1. If the selection overflows the first block, then we update only the first block.
     * */
    if (!overflowsFirstBlock && firstSelectedBlock) {
      const replacedText = firstSelectedBlock.text.slice(from, to);

      console.log("replaced", replacedText.length);

      const newBlockText =
        firstSelectedBlock.text.slice(0, from) +
        addedText +
        firstSelectedBlock.text.slice(to);

      const newRanges = this.updateRanges(
        firstSelectedBlock,
        from,
        newBlockText
      );

      const newBlock = new RichBlock(newBlockText, newRanges);

      const newBlocks = editorState.blocks.map((block) => {
        if (block === firstSelectedBlock) {
          return newBlock;
        }

        return block;
      });

      return new EditorState(newBlocks, editorState.selection);
    }

    /**
     * 2.2. If the selection does not overflow the first block, then we update the first block and the next blocks.
     */

    let currentOffset = 0;
    let replacedTextLength = 0;
    let currentFrom = from - currentOffset;

    const newBlocks = editorState.blocks.map((block) => {
      const blockText = block.text;
      const blockLength = blockText.length;

      if (
        blockLength + currentOffset < from ||
        replacedTextLength >= addedText.length
      ) {
        currentOffset += block.text.length;
        return block;
      }

      if (addedText.length - replacedTextLength >= blockLength) {
        const newText = addedText.slice(
          replacedTextLength,
          addedText.length - currentFrom
        );

        const newBlockText = blockText.slice(0, currentFrom) + newText;
        const newBlockRanges = this.updateRanges(
          block,
          currentFrom,
          newBlockText
        );

        replacedTextLength += newText.length;
        currentFrom += newText.length;

        return new RichBlock(newBlockText, newBlockRanges);
      }

      const newText = addedText.slice(replacedTextLength);
      const newBlockText = newText + blockText.slice(newText.length);
      const newBlockRanges = this.updateRanges(
        block,
        currentFrom,
        newBlockText
      );

      replacedTextLength += newText.length;
      currentFrom += newText.length;

      return new RichBlock(newBlockText, newBlockRanges);
    });

    return new EditorState(newBlocks, editorState.selection);
  }

  public static insertBlock(
    editorState: EditorState,
    mutability: BlockMutabilityType,
    initialStyle?: Style
  ): EditorState {
    const { selection, blocks } = editorState;

    const text = editorState.getText();
    let newBlock = RichBlock.createEmpty(mutability, initialStyle);

    let newBlocks = [...blocks];

    if (selection.collapsed && text.length === 0) {
      newBlocks = [newBlock];
    }

    if (selection.collapsed && text.length === selection.from) {
      newBlocks = [...blocks, newBlock];
    }

    if (selection.collapsed && text.length > selection.from) {
      const firstBlock = editorState.getFirstSelectedBlock();

      if (!firstBlock) {
        return editorState;
      }

      const newBlockText = firstBlock.text.slice(
        selection.from - 1,
        selection.from
      );
      const firstBlockText = firstBlock.text.slice(0, selection.from - 1);
      const secondBlockText = firstBlock.text.slice(selection.from - 1);

      newBlock = RichBlock.createFromText(
        newBlockText,
        mutability,
        initialStyle ? [initialStyle] : undefined
      );

      const firstBlockRanges = this.updateRanges(
        firstBlock,
        selection.from,
        firstBlockText
      );

      const secondBlockRanges = this.updateRanges(
        firstBlock,
        selection.from,
        secondBlockText
      );

      const newFirstBlock = new RichBlock(firstBlockText, firstBlockRanges);
      const newSecondBlock = new RichBlock(secondBlockText, secondBlockRanges);

      newBlocks = [
        ...blocks.slice(0, blocks.indexOf(firstBlock)),
        newFirstBlock,
        newBlock,
        newSecondBlock,
        ...blocks.slice(blocks.indexOf(firstBlock) + 1),
      ];
    }

    return new EditorState(newBlocks, editorState.selection);
  }

  private static updateRanges(block: RichBlock, from: number, newText: string) {
    const newRanges = block.inlineStyleRanges.map((range) => {
      const isInRange = getIsInRange(from - 1, range);

      const lengthDifference = newText.length - block.text.length;

      if (isInRange)
        return {
          ...range,
          length: range.length + lengthDifference,
        };

      if (range.offset > from)
        return {
          ...range,
          offset: range.offset + lengthDifference,
        };

      return range;
    });

    return newRanges;
  }
}
