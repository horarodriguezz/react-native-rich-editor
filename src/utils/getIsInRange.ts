import { Range } from "../models/InlineStyle";

export default function getIsInRange(from: number, range: Range) {
  return from >= range.offset && from <= range.offset + range.length;
}
