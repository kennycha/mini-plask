import { lastIndexOf } from "lodash";

const getSplittedFileName = (name: string) => {
  const lastDotIndex = lastIndexOf(name.split(""), ".");
  return [name.substring(0, lastDotIndex), name.substring(lastDotIndex + 1)];
};

export default getSplittedFileName;
