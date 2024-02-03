export interface Range {
  offset: number;

  length: number;
}

export type Style = keyof typeof InlineStyle;

export interface InlineStyleRange extends Range {
  styles: Style[];
}

export enum InlineStyle {
  BOLD = "BOLD",

  ITALIC = "ITALIC",

  UNDERLINE = "UNDERLINE",

  STRIKETHROUGH = "STRIKETHROUGH",

  DEFAULT = "DEFAULT",
}
