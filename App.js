import { StyleSheet, View } from "react-native";
import RichEditor from "./src/components/RichEditor/RichEditor";
import { EditorState } from "./src/models/EditorState";
import { useState } from "react";

export default function App() {
  const [value, setValue] = useState(EditorState.createEmpty());

  const handleChange = (value) => {
    setValue(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <RichEditor value={value} onChange={handleChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  wrapper: {
    width: "80%",
    height: 200,
    border: "1px solid black",
  },
});
