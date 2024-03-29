const { query_manager } = require("../../DB/query_manager");
const engines = require("../../Helpers/helper_interface");
const { LogHandler } = require("../LogHandler");
const { subprotocolCheck } = require("./helper/subprotocolCheck");

const engine = engines.Helper();
const knex = query_manager;
const Output = LogHandler("OmicaActivationEngineIntegrationTest.log");
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
function createProductRegex(productName) {
  // Escape special characters for regex pattern
  try {
    const escapedProductName = productName.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );
    // Create regex pattern with optional suffixes like "Label", "Gal", or "30ml"
    // Also, allow for variations like "PET_Palm Balm" and "Probiotic_Lg" where underscore may be used
    const pattern = new RegExp(
      `\\b${
        escapedProductName.includes("30ml")
          ? escapedProductName.replace("30ml", "")
          : escapedProductName
      }(?:\\s+(?:Label|Gal|30ml))?\\b`,
      "i"
    );

    return pattern; // will capture Fulvic Detox, Fulvic Detox Label, Fulvic Detox Gal, Fulvic & Detox 30ml Label, etc. and
  } catch (err) {
    console.log(err);
  }
}
const queries = {
  selectInventory: "SELECT * FROM product_inventory",
  selectProducts: "SELECT * FROM product WHERE COMPANY = ?",
};

const activationIntegrationTest = async (quantity, company, callback) => {
  const products = await knex.raw(queries.selectProducts, [company]);
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
      PRODUCT_ID: key,
      PRODUCT_NAME: value.NAME,
      QUANTITY: quantity,
      COMPANY: company,
      PRODUCT_TYPE: value.TYPE,
      STOCK: start_inv_map.get(key),
      ...subprotocolCheck(value.PROCESS_COMPONENT),
    };

    try {
      const result = await activateProduct(data);
      Output.logToFile(result, true);
    } catch (err) {
      Output.logToFile(err, true);
    }
  }
};

exports.OmicaActivationEngineIntegrationTest = activationIntegrationTest;
