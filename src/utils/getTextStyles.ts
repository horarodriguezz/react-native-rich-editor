import { defaultStylesMap } from "../constants/stylesMap";
import { Style } from "../models/InlineStyle";

export default function getTextStyles(styles: Style[]) {
  return styles.map((style) => defaultStylesMap[style]);
}
