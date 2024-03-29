const { query_manager } = require("../../DB/query_manager");
const engines = require("../../Helpers/helper_interface");
const { LogHandler } = require("../LogHandler");

const engine = engines.Helper();
const knex = query_manager;
const Output = LogHandler("KukistaActivationEngineIntegrationTest.log")
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

const queries = {
  selectInventory: "SELECT * FROM product_inventory",
  selectProducts: "SELECT * FROM product WHERE TYPE = ? && COMPANY = ?",
};

const activationIntegrationTest = async (
  quantity,
  type,
  arg,
  company,
  callback
) => {
  Output.LogToFile(arg, false);
  Output.LogToFile("", true)
  Output.LogToFile("", true)
  Output.LogToFile("Starting test", true);
  const products = await knex.raw(queries.selectProducts, [type, company]);
  const product_map = new Map(
    products[0].map((product) => [product.PRODUCT_ID, { ...product }])
  );

  const start_inventory = await knex.raw(queries.selectInventory);
  const start_inv_map = new Map(
    start_inventory[0]
      .filter((inv) => product_map.has(inv.PRODUCT_ID)) // Use filter to keep relevant inventory items
      .map((inv) => [inv.PRODUCT_ID, inv.STOCK]) // Then map to the format expected by Map
  );

  // Transform the callback-based activation_engine function into a promise-based one
  const activateProduct = (data) => {
    return new Promise((resolve, reject) => {
      engine.activation_engine(data, (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Activation failed"));
        }
      });
    });
  };

  for (let [key, value] of product_map) {
    const data = {
      EMPLOYEE_ID: "000002",
      PRODUCT_ID: key,
      PRODUCT_NAME: value.NAME,
      QUANTITY: quantity,
      MULTIPLIER: 1,
      EMPLOYEE_NAME: "Oscar Maldonado",
      TRANSACTIONID: generateRandomID(12),
    };

    // Start the interval timer
    let counter = 0;
    const interval = setInterval(() => {
      Output.LogToFile("Waiting for activation of product " + value.NAME, true);
    }, 5000);

    try {
      // Attempt to activate the product and clear the interval on success or failure
      const status = await activateProduct(data);
      if (status.status == false) {
        throw new Error(status.message);
      }
      Output.LogToFile(
        value.NAME +
          " => { status: " +
          status.status +
          ",message: " +
          status.message + " }", true
      );

    } catch (error) {
      console.error(
        "Activation failed for product " +
          value.PRODUCT_NAME +
          ": " +
          error.message
      );
    } finally {
      // Ensure the interval is cleared regardless of success or failure
      clearInterval(interval);
    }
  }

  //code logic go here

  const end_inventory = await knex.raw(queries.selectInventory);
  const end_inv_map = new Map(
    end_inventory[0]
      .filter((inv) => product_map.has(inv.PRODUCT_ID)) // Use filter to keep relevant inventory items
      .map((inv) => [inv.PRODUCT_ID, inv.STOCK]) // Then map to the format expected by Map
  );

  return callback({ start_inv_map, end_inv_map, quantity });
};

exports.KukistaActivationIntegrationTest = activationIntegrationTest;
