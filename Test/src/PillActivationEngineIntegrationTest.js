const { query_manager } = require("../../DB/query_manager");
const engines = require("../../Helpers/helper_interface");
const { LogHandler } = require("../LogHandler");

const engine = engines.Helper();
const knex = query_manager;
const Output = LogHandler("PillActivationEngineIntegrationTest.log");
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
  selectProducts: "SELECT * FROM product WHERE TYPE = ?",
};

const activationIntegrationTest = async (quantity, type, callback) => {
  Output.LogToFile("Pill Products Activation Engine Test", false);
  Output.LogToFile("", true);
  Output.LogToFile("", true);
  Output.LogToFile("Starting test", true);
  Output.LogToFile("", true);
  Output.LogToFile(
    `Activation Quantity for each 
 product is ${quantity}`,
    true
  );
  const products = await knex.raw(queries.selectProducts, [type]);
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
};

exports.PillActivationEngineIntegrationTest = (quantity, type, callback) => {
  activationIntegrationTest(quantity, type, callback);
};
