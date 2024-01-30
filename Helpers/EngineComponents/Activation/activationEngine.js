const { db } = require("../../../DB/db_init.js");
const { queries } = require("../../../DB/queries.js");

const pill_base_amount = (product, callback) => {
  db.execute(queries.activation_product.get_products, (err, result) => {
    if (err) {
      console.log(err);
    }
    result.forEach((item) => {
      if (item.PILL_Ratio != null && product.match(item.NAME)) {
        return callback(item.PILL_Ratio);
      }
    });
  });
};

//product component regex
//helper functions
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
    success.status = false;
    success.message = "error creating regex pattern";
  }
}

const product_type = (product) => {
  try {
    if (product.match(/\bLabel\b/)) {
      return 1;
    }
    if (product.match(/\bGal\b/)) {
      return 2;
    } else {
      return 0;
    }
  } catch (err) {
    console.log(err);
    success.status = false;
    success.message = "error getting product type";
  }
};

const product_ml_type = (product) => {
  try {
    if (product.match(/\b30ml\b/)) {
      return 1;
    } else {
      return 0;
    }
  } catch (err) {
    console.log(err);
    success.status = false;
    success.message = "error getting product ml type";
  }
};

exports.activationEngineComponents = {
  createRegex: (productName) => createProductRegex(productName),
  productType: (product) => product_type(product),
  productMLType: (product) => product_ml_type(product),
  pillBaseAmount: (product, callback) => pill_base_amount(product, callback),
};
