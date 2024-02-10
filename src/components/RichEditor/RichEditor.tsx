import React, { useCallback } from "react";
import { RichEditorProps } from "./types";
import {
  Button,
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputChangeEventData,
  TextInputSelectionChangeEventData,
  View,
} from "react-native";
import { styles } from "./styles";
import { Selection } from "../../models/Selection";
import { Modifier } from "../../models/Modifier";
import { InlineStyle, InlineStyleRange } from "../../models/InlineStyle";
import { EditorState } from "../../models/EditorState";
import { BlockMutability } from "../../models/Block";

const RichEditor: React.FC<RichEditorProps> = (props) => {
  const { value, onChange } = props;

  const valueRef = React.useRef(value);

  const handleChange = useCallback(
    (newState: EditorState) => {
      valueRef.current = newState;
      onChange(newState);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
      const { text } = e.nativeEvent;

      const actualText = valueRef.current.getText();
      const { collapsed } = valueRef.current.selection;

      if (text.length === 0) {
        return handleChange(EditorState.createEmpty());
      }

      if (text.length < actualText.length && collapsed) {
        return handleChange(EditorState.createFromText(text, []));
      }

      if (text.length > actualText.length && collapsed) {
        const newState = Modifier.insertText(
          valueRef.current,
          e.nativeEvent.text
        );

        return handleChange(newState);
      }

      if (!collapsed) {
        const newState = Modifier.replaceText(
          valueRef.current,
          e.nativeEvent.text
        );

        return handleChange(newState);
      }
    },
    [handleChange]
  );

  const handleSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      const { selection } = e.nativeEvent;

      const newSelection = new Selection(selection.start, selection.end);

      const newState = Modifier.updateSelection(valueRef.current, newSelection);

      handleChange(newState);
    },
    [handleChange]
  );

  const getTextChildren = useCallback(
    (text: string, ranges: InlineStyleRange[]) => {
      return <Text>{text}</Text>;
    },
    []
  );

  const handleAddBlock = () => {
    const newState = Modifier.insertBlock(
      valueRef.current,
      BlockMutability.MUTABLE,
      InlineStyle.BOLD
    );

    handleChange(newState);
  };

  console.log(value);

  return (
    <View style={styles.container}>
      <Button title='Add block' onPress={handleAddBlock} />

      <TextInput
        multiline
        autoCorrect={false}
        style={styles.hiddenInput}
        onChange={handleInputChange}
        onSelectionChange={handleSelectionChange}
      >
        <Text>
          {value.blocks.map((block, index) => (
            <Text key={index}>
              {getTextChildren(block.text, block.inlineStyleRanges)}
            </Text>
          ))}
        </Text>
      </TextInput>
    </View>
  );
};

export default RichEditor;
