import React, { useCallback } from "react";
import { RichEditorProps } from "./types";
import {
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
import { InlineStyleRange } from "../../models/InlineStyle";
import { EditorState } from "../../models/EditorState";

const RichEditor: React.FC<RichEditorProps> = (props) => {
  const { value, onChange } = props;

  const handleInputChange = (
    e: NativeSyntheticEvent<TextInputChangeEventData>
  ) => {
    const { text } = e.nativeEvent;

    const actualText = value.getText();
    const { collapsed } = value.selection;

    if (text.length === 0) {
      return onChange(EditorState.createEmpty());
    }

    if (text.length < actualText.length && collapsed) {
      return onChange(EditorState.createFromText(text, []));
    }

    if (text.length > actualText.length && collapsed) {
      const newState = Modifier.insertText(value, e.nativeEvent.text);

      return onChange(newState);
    }

    if (!collapsed) {
      const newState = Modifier.replaceText(value, e.nativeEvent.text);

      return onChange(newState);
    }
  };

  const handleSelectionChange = (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    const { selection } = e.nativeEvent;

    const newSelection = new Selection(selection.start, selection.end);

    const newState = Modifier.updateSelection(value, newSelection);

    onChange(newState);
  };

  const getTextChildren = useCallback(
    (text: string, ranges: InlineStyleRange[]) => {
      return <Text>{text}</Text>;
    },
    []
  );

  console.log(value);

  return (
    <View style={styles.container}>
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
