import { TextStyle } from "react-native";
import { InlineStyle } from "../models/InlineStyle";

export type InlineStyleMap = Record<InlineStyle, TextStyle>;

export const defaultStylesMap: InlineStyleMap = {
  [InlineStyle.BOLD]: {
    fontWeight: "bold",
  },
  [InlineStyle.ITALIC]: {
    fontStyle: "italic",
  },
  [InlineStyle.UNDERLINE]: {
    textDecorationLine: "underline",
  },
  [InlineStyle.STRIKETHROUGH]: {
    textDecorationLine: "line-through",
  },
  [InlineStyle.DEFAULT]: {},
};
