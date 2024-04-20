const { LinkedList } = require("../../Utility/LinkedList");

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
      value: inputToken[2],
      custom: inputToken[3] ? inputToken[3] : null,
    };
    console.log("Token object: ", tokenObject);
    list.append(tokenObject);
  }
  return list;
};

exports.tokenParser = parser;
