

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

  const pill_base_amount = (product) => {
    if (product.match("L-Theanine")) {
      return [180, 60];
    }
    if (product.match("L-Lysine")) {
      return [200, 120];
    }
    if (product.match("L-Proline")) {
      return [100, 60];
    }
    if (product.match("Amino Acid")) {
      return [200, 50];
    }
    if (product.match("Probiotic")) {
      return [150, 60];
    }
    if (product.match("Digestive Enzyme")) {
      return [180, 60];
    }
    if (product.match("Colostrum")) {
      return [120, 60];
    }
    if (product.match("Butyric Acid")) {
      return [90, 60];
    }
    if (product.match("Arabinogalactan")) {
      return [90, 60];
    }
    if (product.match("Stress B-Complex & Vtm C")) {
      return [240, 60];
    }
    if (product.match("Coenzyme B-Complex")) {
      return [100, 60];
    }
    if (product.match("PET_Agaricus")) {
      return [60, 30];
    }
  };



exports.activationEngineComponents = {
    createRegex: (productName) => createProductRegex(productName),
    productType: (product) => product_type(product),
    productMLType: (product) => product_ml_type(product),
    pillBaseAmount: (product) => pill_base_amount(product),


}