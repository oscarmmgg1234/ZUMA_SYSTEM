const { query_manager } = require("../../../DB/query_manager");
const engines = require("../../../Helpers/helper_interface");
const { LogHandler } = require("../../LogHandler");
const { controller_interface } = require("../../../Controllers/controller");

const engine = engines.Helper();
const controller = controller_interface();
const knex = query_manager;
const Output = LogHandler("ReductionType1EngineIntegrationTest.log");
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
  Output.LogToFile("Test Performed by: Oscar Maldonado", false);
  Output.LogToFile(`Execution DateTime: ${laDate}`, true);
  Output.LogToFile(
    "Reduction Engine Integration Test For Reduction Type 1 Products",
    true
  );
  Output.LogToFile("", true);
  Output.LogToFile("", true);
  Output.LogToFile("Starting test", true);
  Output.LogToFile("", true);
  const all_products = await knex.raw(
    "SELECT * FROM product WHERE REDUCTION_TYPE = 1"
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
            resolve(data.status);
          } else {
            reject(new Error("Activation failed"));
          }
        }
      );
    });
  };

  const reduction = (data) => {
    return new Promise((resolve, reject) => {
      controller.reduction.product_reduction(data, (data) => {
        setTimeout(() => {
          if (data) {
            resolve(data);
          } else {
            reject(new Error("Reduction failed"));
          }
        }, 500);
      });
    });
  };
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const waitForStatusUpdate = async (
    transactionId,
    expectedStatus,
    timeout = 10000
  ) => {
    const startTime = Date.now();
    while (true) {
      const [result] = await knex.raw(
        "SELECT Status FROM barcode_log WHERE TRANSACTIONID = ?",
        [transactionId]
      );
      if (result[0].Status === expectedStatus) {
        return true; // Status updated
      }
      if (Date.now() - startTime > timeout) {
        return "Active/Passive";
      }
      await delay(200); // Wait for 200ms before checking again
    }
  };
  const get_inv_count = async (product_id) => {
    return await knex.raw(
      "SELECT * FROM product_inventory WHERE PRODUCT_ID = ?",
      [product_id]
    );
  };
  const transaction_id_arr = [];
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
    transaction_id_arr.push(transaction_id);
    const activation = await activate(activationData);
  }
  Output.LogToFile("", true);
  Output.LogToFile(
    "Prerequisite Product Activation complete...initiating Product Reduction",
    true
  );
  Output.LogToFile("", true);
  const barcodes_start = [];
  for (let i = 0; i < transaction_id_arr.length; i++) {
    const barcode = await knex.raw(
      "SELECT * FROM barcode_log WHERE TRANSACTIONID = ?",
      [transaction_id_arr[i]]
    );
    barcodes_start.push(barcode[0][0]);
  }
  const barcodes_start_map = new Map(
    barcodes_start.map((x) => [x.TRANSACTIONID, x.Status])
  );

  for (let i = 0; i < transaction_id_arr.length; i++) {
    const product_name = await knex.raw(
      "SELECT * FROM transaction_log WHERE TRANSACTIONID = ?",
      [transaction_id_arr[i]]
    );
    const init_inv_product = await get_inv_count(product_name[0][0].PRODUCT_ID);
    const initial_inv_count = init_inv_product[0][0].ACTIVE_STOCK;
    const barcode = await knex.raw(
      "SELECT * FROM barcode_log WHERE TRANSACTIONID = ?",
      [transaction_id_arr[i]]
    );
    const bardata = barcode[0][0]?.BarcodeID;
    if (!bardata) {
      console.log(
        "No barcode found for transaction id: ",
        transaction_id_arr[i]
      );
      continue;
    }
    const reductionData = {
      EMPLOYEE_RESPONSIBLE: "000002",
      BARCODE_ID: bardata,
      TRANSACTIONID: transaction_id_arr[i],
    };
    const reduct = await reduction(reductionData);

    // Instead of await delay(2000);
    const statusUpdated = await waitForStatusUpdate(
      transaction_id_arr[i],
      "Deducted"
    );
    const final_inv_product = await get_inv_count(
      product_name[0][0].PRODUCT_ID
    );
    const final_inv_count = final_inv_product[0][0].ACTIVE_STOCK;

    Output.LogToFile(``, true);
    Output.LogToFile(
      `Product at test: ${product_name[0][0].PRODUCT_NAME}  Trans ID: ${transaction_id_arr[i]}`,
      true
    );
    Output.LogToFile(
      `The Active Stock start: ${initial_inv_count}, end: ${final_inv_count}, expected diffrence: ${
        product_name[0][0].QUANTITY
      }, ${
        Math.abs(final_inv_count - initial_inv_count) ==
        product_name[0][0].QUANTITY
          ? "Pass"
          : "Fail"
      } `,
      true
    );
    Output.LogToFile(
      `Barcode status check for product reduction, Start: ${barcodes_start_map.get(
        transaction_id_arr[i]
      )}, End: ${
        statusUpdated ? "Deducted" : "Active/Passive"
      }, Expected: Deducted, ${statusUpdated}`,
      true
    );
  }
  Output.LogToFile("", true);
  Output.LogToFile("Test Complete", true);
  Output.LogToFile("", true);
  Output.LogToFile("", true);
};

exports.reductionIntegrationTest = reductionIntegrationTest;
