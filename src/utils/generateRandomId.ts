import _ from "lodash";

export const generateRandomId = (length: number): string => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const randomChars = _.sampleSize(characters, length);

  return randomChars.join("");
};
