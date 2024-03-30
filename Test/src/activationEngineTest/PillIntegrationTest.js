const { query_manager } = require("../../../DB/query_manager");
const engines = require("../../../Helpers/helper_interface");
const { LogHandler } = require("../../LogHandler");
const { subprotocolCheck } = require("../helper/subprotocolCheck");

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
  selectProducts: "SELECT * FROM product WHERE TYPE = ?",
};

const activationIntegrationTest = async (quantity, type, callback) => {
  const date = new Date();
  const options = { timeZone: "America/Los_Angeles", hour12: false };
  const laDate = date.toLocaleString("en-US", options);
  Output.LogToFile(`Execution DateTime: ${laDate}`, false);
  Output.LogToFile("Pill Products Activation Engine Test", true);
  Output.LogToFile("", true);
  Output.LogToFile("", true);
  Output.LogToFile("Starting test", true);
  Output.LogToFile("", true);
  Output.LogToFile(`Activation Quantity for each product is ${quantity}`, true);
  const all_products = await knex.raw("SELECT * FROM product");
  const all_products_map = new Map(
    all_products[0].map((product) => [product.PRODUCT_ID, { ...product }])
  );

  const products = await knex.raw(queries.selectProducts, [type]);
  const product_map = new Map(
    products[0].map((product) => [product.PRODUCT_ID, { ...product }])
  );

  const start_inventory = await knex.raw(queries.selectInventory);
  const start_inv_map = new Map(
    start_inventory[0]
      .filter((inv) => product_map.has(inv.PRODUCT_ID)) // Use filter to keep relevant inventory items
      .map((inv) => [
        inv.PRODUCT_ID,
        { STORED: inv.STORED_STOCK, ACTIVE: inv.ACTIVE_STOCK },
      ]) // Then map to the format expected by Map
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
  let counter = 1;
  for (let [key, value] of product_map) {
    const subcomponents = subprotocolCheck(value.PROCESS_COMPONENT_TYPE);
    const subcomponentarr_start = [];
    if (subcomponents != null) {
      for (const [key, value] of Object.entries(subcomponents)) {
        const subcomponent_start = await knex.raw(
          "SELECT STOCK FROM product_inventory WHERE PRODUCT_ID = ?",
          [value]
        );
        subcomponentarr_start.push({
          product: key,
          stock: subcomponent_start[0][0].STOCK,
        });
      }
    }
    const pillreduct_start = start_inv_map.get(key).STORED;
    const pillreduct_active_start = start_inv_map.get(key).ACTIVE;
    const product_regex = createProductRegex(value.NAME);
    const components = all_products[0].filter((product) =>
      product.NAME.match(product_regex)
    );
    const target_component = components.filter((product) => {
      if (value.NAME.includes("30ml")) {
        if (product.NAME.includes("30ml")) {
          return product;
        }
        if (product.NAME.includes("Gal") && !product.NAME.includes("Label")) {
          return product;
        }
        if (value.NAME == product.NAME) {
          return product;
        }
      }
      if (value.NAME.includes("Sm")) {
        if (product.NAME.includes("Sm")) {
          return product;
        }
      }

      if (!value.NAME.includes("30ml")) {
        if (!product.NAME.includes("30ml")) {
          if (product.NAME.includes("Gal")) {
            return product;
          }
          if (product.NAME.includes("Label") && !product.NAME.includes("Sm")) {
            return product;
          }
          if (value.NAME == product.NAME) {
            return product;
          }
        }
      }
    });
    const refined_components = target_component.filter(
      (product) =>
        product.NAME.match(/\bGal\b/) || product.NAME.match(/\bLabel\b/)
    );
    let component_start = [];
    for (let component of refined_components) {
      const product_start = await knex.raw(
        "SELECT STOCK FROM product_inventory WHERE PRODUCT_ID = ?",
        [component.PRODUCT_ID]
      );
      const product = component.NAME.match(/\bGal\b/) ? "Gal" : "Label";
      component_start.push({
        product: product,
        stock: product_start[0][0].STOCK,
      });
    }
    const data = {
      EMPLOYEE_ID: "000002",
      PRODUCT_ID: key,
      PRODUCT_NAME: value.NAME,
      QUANTITY: quantity,
      MULTIPLIER: 1,
      EMPLOYEE_NAME: "Oscar Maldonado",
      TRANSACTIONID: generateRandomID(12),
    };
    try {
      const status = await activateProduct(data);
      let component_end = [];
      for (let component of refined_components) {
        const product_end = await knex.raw(
          "SELECT STOCK FROM product_inventory WHERE PRODUCT_ID = ?",
          [component.PRODUCT_ID]
        );
        const product = component.NAME.match(/\bGal\b/) ? "Gal" : "Label";
        component_end.push({
          product: product,
          stock: product_end[0][0].STOCK,
        });
      }
      const subcomponentarr_end = [];
      if (subcomponents != null) {
        for (const [key, value] of Object.entries(subcomponents)) {
          const subcomponent_end = await knex.raw(
            "SELECT STOCK FROM product_inventory WHERE PRODUCT_ID = ?",
            [value]
          );
          subcomponentarr_end.push({
            product: key,
            stock: subcomponent_end[0][0].STOCK,
          });
        }
      }
      Output.LogToFile("", true);
      Output.LogToFile("Product at test: " + value.NAME, true);
      Output.LogToFile(
        value.NAME +
          " => { status: " +
          status.status +
          ",message: " +
          status.message +
          " }",
        true
      );
      const end_inventory = await knex.raw(queries.selectInventory);
      const end_inv_map = new Map(
        end_inventory[0]
          .filter((inv) => product_map.has(inv.PRODUCT_ID)) // Use filter to keep relevant inventory items
          .map((inv) => [
            inv.PRODUCT_ID,
            { STORED: inv.STORED_STOCK, ACTIVE: inv.ACTIVE_STOCK },
          ]) // Then map to the format expected by Map
      );
      const pillreduct_end = end_inv_map.get(key).STORED;
      const pillreduct_active_end = end_inv_map.get(key).ACTIVE;
      const stored_stock_diff = Math.abs(pillreduct_start - pillreduct_end);

      const getRatio = (product) => {
        const ratio = all_products_map.get(product).PILL_Ratio;
        const result = ratio * quantity;
        return result == 0 ? quantity : result;
      };
      Output.LogToFile(
        `Active Stock ${
          value.NAME
        }, start: ${pillreduct_active_start}, end: ${pillreduct_active_end}, diff: ${Math.abs(
          Math.abs(pillreduct_active_end) - Math.abs(pillreduct_active_start)
        )}, expected: ${quantity}, result: ${
          Math.abs(pillreduct_active_end - pillreduct_active_start) == quantity
            ? "Pass"
            : "Fail"
        }`,
        true
      );
      Output.LogToFile(
        `Stored Stock: ${
          value.NAME
        }, start: ${pillreduct_start}, end: ${pillreduct_end}, diff: ${stored_stock_diff}, expected: ${getRatio(
          key
        )}, result: ${
          stored_stock_diff - getRatio(key) < 0.1 ? "Pass" : "Fail"
        }`,
        true
      );
      for (let product of component_start) {
        const end_product = component_end.filter(
          (end) => end.product == product.product
        )[0];

        Output.LogToFile(
          `${product.product} ${value.NAME} => { start: ${
            product.stock
          }, end: ${end_product.stock} }, diffrence ${Math.abs(
            Math.abs(end_product.stock) - Math.abs(product.stock)
          )}, ${
            product.product.match(/\bGal\b/)
              ? Math.abs(
                  Math.abs(end_product.stock) - Math.abs(product.stock)
                ) -
                  product_calculated_consump <=
                0.1
                ? "Pass"
                : "Fail"
              : Math.abs(end_product.stock - product.stock) == quantity
              ? "Pass"
              : "Fail"
          }`,
          true
        );
      }
      if (subcomponents != null) {
        for (let product of subcomponentarr_start) {
          const end_product = subcomponentarr_end.filter(
            (end) => end.product == product.product
          )[0];
          Output.LogToFile(
            `${product.product} ${value.NAME} => { start: ${
              product.stock
            }, end: ${end_product.stock} }, diffrence ${Math.abs(
              Math.abs(end_product.stock) - Math.abs(product.stock)
            )}, ${
              Math.abs(end_product.stock - product.stock) == quantity
                ? "Pass"
                : "Fail"
            }`,
            true
          );
        }
      }
      Output.LogToFile(`Pill product ${counter}/${product_map.size}`, true);
      Output.LogToFile("", true);
      Output.LogToFile(
        "-----------------------------------------------------------------------------------",
        true
      );
      counter++;
    } catch (err) {
      console.log(err);
      Output.LogToFile(
        `Product: ${value.NAME} - Quantity: ${quantity} - Result: Activation failed`,
        true
      );
    }
  }
  Output.LogToFile("", true);
  Output.LogToFile("", true);
  Output.LogToFile("Test completed successfully", true);
};

exports.PillActivationEngineIntegrationTest = (quantity, type, callback) => {
  activationIntegrationTest(quantity, type, callback);
};
