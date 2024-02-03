import getIsInRange from "../utils/getIsInRange";
import getTextDifference from "../utils/getTextDifference";
import { BlockMutabilityType, RichBlock } from "./Block";
import { EditorChange } from "./ChangeType";
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

    const newRanges = selectedBlock.inlineStyleRanges.map((range) => {
      const isInRange = getIsInRange(from - 1, range);

      if (isInRange)
        return { ...range, length: range.length + addedText.length };

      if (range.offset > from)
        return { ...range, offset: range.offset + addedText.length };

      return range;
    });

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

      const newRanges = firstSelectedBlock.inlineStyleRanges.map((range) => {
        const isInRange = getIsInRange(from - 1, range);

        if (isInRange)
          return {
            ...range,
            length: range.length + addedText.length - replacedText.length,
          };

        if (range.offset > from)
          return {
            ...range,
            offset: range.offset + addedText.length - replacedText.length,
          };

        return range;
      });

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

        replacedTextLength += newText.length;
        currentFrom += newText.length;

        return new RichBlock(newBlockText, block.inlineStyleRanges);
      }

      const newText = addedText.slice(replacedTextLength);
      const newBlockText = newText + blockText.slice(newText.length);

      replacedTextLength += newText.length;
      currentFrom += newText.length;

      return new RichBlock(newBlockText, block.inlineStyleRanges);
    });

    return new EditorState(newBlocks, editorState.selection);
  }
}
