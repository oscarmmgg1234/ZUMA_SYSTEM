const { LinkedList } = require("../../Utility/LinkedList");
const process = require("process");

const parser = (data) => {
  if (!data) return null;
  const list = new LinkedList();
  // Split the data by space
  const tokens = data.split(" ");
  //process each individual token then append the object to linked list
  for (let token of tokens) {
    let inputToken = token.split(":");
    const tokenObject = {
      key: inputToken[0],
      id: inputToken[1],
      value: inputToken[2] ? inputToken[2] : null,
      auxiliaryParam: inputToken[3] ? inputToken[3] : null,
      nextAuxiliaryParam: inputToken[4] ? inputToken[4] : null,
      lastAuxiliaryParam: inputToken[5] ? inputToken[5] : null,
    };
    if (process.env.NODE_ENV === "development") {
      console.log("Token object: ", tokenObject);
    }
    list.append(tokenObject);
  }
  return list;
};

exports.tokenParser = parser;
