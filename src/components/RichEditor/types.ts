import { EditorState } from "../../models/EditorState";

export interface RichEditorProps {
  value: EditorState;

  onChange: (value: EditorState) => void;
}
