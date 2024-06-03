
const { testToken } = require("./tokenTest");

class TestInterface {
  constructor() {
    if (TestInterface.instance) {
      return TestInterface.instance;
    }
  }

  async runTest(args) {
    return await testToken(args);
  }
}

module.exports = {TestInterface: new TestInterface()};
