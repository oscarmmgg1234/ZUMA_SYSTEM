const { generateRandomID } = require("./stringRandoGeneration");

class Constants {
  constructor() {}
  generateRandomID(length) {
    return generateRandomID(length);
  }
}

exports.Constants = Constants;
