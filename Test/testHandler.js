const { LogHandler } = require("./LogHandler");
const {
  KukistaActivationIntegrationTest,
} = require("./src/activationEngineTest/KukistaIntegrationTest");
const {
  PillActivationEngineIntegrationTest,
} = require("./src/activationEngineTest/PillIntegrationTest");
const {
  OmicaActivationEngineIntegrationTest,
} = require("./src/activationEngineTest/OmicaIntegrationTest");
class Test {
  constructor() {
    this.internal_state = false;
  }

  kukistaProductTest(quantity, type, arg, company, callback) {
    KukistaActivationIntegrationTest(quantity, type, arg, company, (data) => {
      return callback(data);
    });
  }
  pillProductTest(quantity, type, callback) {
    PillActivationEngineIntegrationTest(quantity, type, (data) => {
      return callback(data);
    });
  }
  omicaProductTest(quantity, company, callback) {
    OmicaActivationEngineIntegrationTest(quantity, company, (data) => {
      return callback(data);
    });
  }

  SetInternalStateTestHandler(status) {
    this.internal_state = status;
  }

  runTest() {
    if (this.internal_state == true) {
      this.kukistaProductTest(
        100,
        "122",
        "Kukista Product Activation Engine Test",
        "199",
        (data) => {
          const output = LogHandler(
            "KukistaActivationEngineIntegrationTest.log"
          );
          if (data == false) {
            console.log("test is inactive");
            return;
          }
          for (let [key, value] of data.start_inv_map) {
            if (data.end_inv_map.get(key) != value + data.quantity) {
              output.LogToFile(
                `Inventory for product ${key} did not update correctly. Expected: ${
                  value + data.quantity
                }, Actual: ${data.end_inv_map.get(key)}`,
                true
              );
            }
          }
          output.LogToFile("", true);
          output.LogToFile("", true);
          output.LogToFile("Test completed successfully", true);
        }
      );
      //----------------------------------------------------
      this.pillProductTest(100, "44", (data) => {});
      //----------------------------------------------------
      this.omicaProductTest(100, "888", (data) => {});
    } else {
      console.log("testing is inactive => production mode");
    }
  }
}

exports.TestHandler = () => {
  return new Test();
};
