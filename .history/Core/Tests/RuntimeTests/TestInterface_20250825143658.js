
const { addProdProcess } = require("../../../Helpers/addProduct");

const {runtimeTest} = require("./tokenTest")

class TestInterface {
  constructor() {
    if (TestInterface.instance) {
      return TestInterface.instance;
    }
  }

  async runAddProduct(args) {
    return await addProdProcess(args);
  }
  async runTest(args) {
    return await runtimeTest(args);
  }
}

module.exports = { TestInterface: new TestInterface() };
