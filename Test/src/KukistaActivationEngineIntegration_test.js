const { query_manager } = require("../../DB/query_manager");
const engines = require("../../Helpers/helper_interface");
const { LogHandler } = require("../LogHandler");

const engine = engines.Helper();
const knex = query_manager;
const Output = LogHandler("KukistaActivationEngineIntegrationTest.log");
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
const glycerinCompsumption = async (
  glycerinBottleAmountGALLONS,
  productGlycerinAmountOZ,
  productQuantity,
  productBottleSize = 50,
  product_id
) => {
  const glycerinBottleSize = await knex.raw(
    "SELECT GlycerinGallonUnitConstant FROM system_config WHERE system_config.Index = 1"
  );
  const glycerinRatioOZ = await knex.raw(
    "SELECT GLYCERIN_RATIO_OZ FROM product WHERE PRODUCT_ID = ?",
    [product_id]
  );

  const glycerinBottleAmountGALLONS_toMill =
    glycerinBottleSize[0][0].GlycerinGallonUnitConstant * 3785.41;
  const productGlycerinAmountOZ_toMill =
    glycerinRatioOZ[0][0].GLYCERIN_RATIO_OZ * 29.5735;
  const totalMillInMixture =
    glycerinBottleAmountGALLONS_toMill + productGlycerinAmountOZ_toMill;

  return (
    (((productBottleSize * productQuantity) / totalMillInMixture) *
      productGlycerinAmountOZ_toMill) /
    glycerinBottleAmountGALLONS_toMill
  );
};
const productConsumption = (
  productBottleSize = 50,
  productQuantity,
  productBaseGallon
) => {
  const productBaseGallon_toMill = productBaseGallon * 3785.41;
  return (productBottleSize * productQuantity) / productBaseGallon_toMill;
};

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
  Output.LogToFile("", true);
  Output.LogToFile("", true);
  Output.LogToFile("Starting test", true);
  Output.LogToFile("", true);
  Output.LogToFile(`Activation Quantity for each product is ${quantity}`, true);
  Output.LogToFile("", true);
  const all_products = await knex.raw("SELECT * FROM product");
  const products = await knex.raw(queries.selectProducts, [type, company]);
  const product_map = new Map(
    products[0].map((product) => [product.PRODUCT_ID, { ...product }])
  );
  const glycerinProducts = products[0].filter(
    (product) =>
      product.GLYCERIN_RATIO_OZ != null || product.GLYCERIN_RATIO_OZ != 0
  );
  const calculateGlycerinUsage = async () => {
    let output = 0;
    for (let product of glycerinProducts) {
      output += await glycerinCompsumption(
        1,
        26,
        quantity,
        product.NAME.includes("30ml") ? 30 : 50,
        product.PRODUCT_ID
      );
    }
    return output;
  };
  const GlycerinTotalConsumption = await calculateGlycerinUsage();
  const start_inventory = await knex.raw(queries.selectInventory);
  const start_inv_map = new Map(
    start_inventory[0]
      .filter((inv) => product_map.has(inv.PRODUCT_ID)) // Use filter to keep relevant inventory items
      .map((inv) => [inv.PRODUCT_ID, inv.STOCK]) // Then map to the format expected by Map
  );
  const GlycerinConsumptionStart = start_inventory[0].filter(
    (inv) => inv.PRODUCT_ID == "14aa3aba"
  )[0].STOCK;

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

    // Start the interval timer
    const interval = setInterval(() => {
      Output.LogToFile("Waiting for activation of product " + value.NAME, true);
    }, 5000);

    try {
      // Attempt to activate the product and clear the interval on success or failure
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
      if (status.status == false) {
        throw new Error(status.message);
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
      const product_calculated_consump =
        value.GLYCERIN_RATIO_OZ != null && value.GLYCERIN_RATIO_OZ != 0
          ? productConsumption(
              value.NAME.includes("30ml") ? 30 : 50,
              quantity,
              1.203
            )
          : productConsumption(
              value.NAME.includes("30ml") ? 30 : 50,
              quantity,
              1
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
      Output.LogToFile(`Kukista Product ${counter}/${product_map.size}`, true);
      Output.LogToFile("", true);
      Output.LogToFile("-----------------------------------------------------------------------------------", true);
      counter++;
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
  const GlycerinConsumptionEnd = end_inventory[0].filter(
    (inv) => inv.PRODUCT_ID == "14aa3aba"
  )[0].STOCK;
  const GlycerinConsumption = Math.abs(
    GlycerinConsumptionEnd - GlycerinConsumptionStart
  );
  Output.LogToFile(
    `Glycerin Consumption: ${GlycerinConsumption} oz, Expected: ${GlycerinTotalConsumption} oz, Difference: ${Math.abs(
      GlycerinTotalConsumption - GlycerinConsumption
    )} oz, ${
      Math.abs(GlycerinTotalConsumption - GlycerinConsumption) <= 0.3
        ? "Pass"
        : "Fail"
    }`,
    true
  );

  return callback({ start_inv_map, end_inv_map, quantity });
};

exports.KukistaActivationIntegrationTest = activationIntegrationTest;
