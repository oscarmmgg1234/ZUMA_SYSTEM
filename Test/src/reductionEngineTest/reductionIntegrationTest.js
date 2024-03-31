const { query_manager } = require("../../../DB/query_manager");
const engines = require("../../../Helpers/helper_interface");
const { LogHandler } = require("../../LogHandler");
const { controller_interface } = require("../../../Controllers/controller");

const engine = engines.Helper();
const controller = controller_interface();
const knex = query_manager;
const Output = LogHandler("ReductionEngineIntegrationTest.log");
// Then replace all console.log and console.error in your function with logToFile
// For the first log message, call logToFile(message, false) to truncate the file
// For subsequent messages, call logToFile(message, true) to append to the file

function generateRandomID(length) {
  // Create a random ID with a specified length
  let result = "";
  // Define the characters that can be included in the ID
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    // Append a random character from the characters string
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const reductionIntegrationTest = async () => {
  //we need barcode and transaction id for reduction
  //   class parseBarcode {
  //     constructor(args) {
  //       this.EMPLOYEE_RESPONSIBLE = args.employee;
  //       const arg_arr = args.barcode.split(">");
  //       this.BARCODE_ID = arg_arr[0] ? arg_arr[0] : 0;
  //       this.TRANSACTIONID = arg_arr[1] ? arg_arr[1] : 0;
  //     }
  //   }
  // so first get all product activate then funnel transaction id and look up barcode id the pass it to reduction engine
  const date = new Date();
  const options = { timeZone: "America/Los_Angeles", hour12: false };
  const laDate = date.toLocaleString("en-US", options);
  Output.LogToFile(`Execution DateTime: ${laDate}`, false);
  Output.LogToFile("Reduction Engine Integration Test", true);
  Output.LogToFile("", true);
  Output.LogToFile("", true);
  Output.LogToFile("Starting test", true);
  Output.LogToFile("", true);
  const all_products = await knex.raw(
    "SELECT * FROM product WHERE REDUCTION_TYPE = 1 "
  );
  const all_products_map = new Map(
    all_products[0].map((x) => [x.PRODUCT_ID, { ...x }])
  );
  const activate = (data) => {
    return new Promise((resolve, reject) => {
      controller.product_activation_controller.activate_product(
        data,
        (data) => {
          if (data) {
            resolve(data);
          } else {
            reject(new Error("Activation failed"));
          }
        }
      );
    });
  };

  const reduction = (data) => {
    return new Promise((resolve, reject) => {
      engine.reduction_engine(data, (data) => {
        resolve(data);
      });
    });
  };

  for (let [key, value] of all_products_map) {
    const transaction_id = generateRandomID(12);
    const activationData = {
      EMPLOYEE_ID: "000002",
      PRODUCT_ID: key,
      PRODUCT_NAME: value.NAME,
      QUANTITY: 5,
      MULTIPLIER: 1,
      EMPLOYEE_NAME: "Oscar Maldonado",
      TRANSACTIONID: transaction_id,
    };

    const activation = await activate(activationData);
    //get barcode id

    const reductionData = {
      EMPLOYEE_RESPONSIBLE: "000002",
      BARCODE_ID: barcode[0][0].BarcodeID,
      TRANSACTIONID: transaction_id,
    };
    const barcode = await knex.raw(
      `SELECT * FROM barcode_log WHERE TRANSACTIONID = ?`,
      [transaction_id]
    );
    const reductionResult = await reduction(reductionData);

    //we want to check for reduction and depending on type then either check active or passive stock
  }
  console.log("done");
};

exports.reductionIntegrationTest = reductionIntegrationTest;
