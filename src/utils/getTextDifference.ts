/**
 * gets the difference between two strings letter by letter
 */
export default function getTextDifference(
  oldText: string,
  newText: string
): string {
  let difference = "";

  for (let i = 0; i < newText.length; i++) {
    if (oldText[i] !== newText[i]) {
      difference = newText[i];
      break;
    }
  }

  return difference;
}
