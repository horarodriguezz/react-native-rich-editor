export enum EditorChange {
  INSERT = "INSERT",

  REMOVE = "REMOVE",

  REMOVE_ALL = "REMOVE_ALL",

  SELECTION = "SELECTION",
}

export type EditorChangeType = keyof typeof EditorChange;
