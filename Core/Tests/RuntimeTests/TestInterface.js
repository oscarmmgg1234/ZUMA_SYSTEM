const { testToken } = require("./tokenTest");
const {addProdProcess} = require("../../../Helpers/addProduct");

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
    return await testToken(args);
  }
}

module.exports = { TestInterface: new TestInterface() };
