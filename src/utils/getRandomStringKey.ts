import { v4 as uuidv4 } from "uuid";

const getRandomStringKey = () => {
  return uuidv4();
};

export default getRandomStringKey;
