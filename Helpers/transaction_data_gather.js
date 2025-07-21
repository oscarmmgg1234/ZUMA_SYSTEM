const { query_manager } = require("../DB/query_manager.js");
const { normalizeStock } = require("../Core/Utility/StockNormalizer.js");
const { tokenParser } = require("../Core/Engine/Token/tokenParser.js");

const knex = query_manager;

const normalize = (value, ratio) => {
  return value * (1 / ratio);
};

const trackUpdates = (token) => {
  const tokens = tokenParser(token);
  var output = [];

  for (var i = 0; i < tokens.size; i++) {
    let current = tokens.getData();
    if (current.key === postops) {
      output.push({
        key: current.key,
        product: current.value,
        value: parseFloat(auxiliaryParam),
        option: "ratio",
      });
    } else if (current.key === "UP") {
      output.push({
        key: current.key,
        product: current.value,
        value: 1,
        option: "default",
      });
    } else if (current.key === "CMUP") {
      output.push({
        key: current.key,
        product: current.value,
        value: 1,
        option: "default",
      });
    }

    tokens.next();
  }
  return output;
};

const productParse = (token) => {
  let productSet = new Set();
  const tokens = token.split(" ");
  for (const token of tokens) {
    const tokenSplit = token.split(":");
    if (tokenSplit[2]) {
      productSet.add(tokenSplit[2]);
    }
  }
  return productSet;
};

const productQuery = (productSet) => {
  if (productSet.size === 0) return "";
  if (productSet.size === 1) {
    return `SELECT * FROM product_inventory WHERE product_id = '${
      Array.from(productSet)[0]
    }'`;
  }
  const ids = Array.from(productSet)
    .map((id) => `'${id}'`)
    .join(",");
  return `SELECT * FROM product_inventory WHERE product_id IN (${ids})`;
};

const snapshot = async (dbHandle, query) => {
  const productStock = await dbHandle.raw(query);
  return productStock[0].map((product) => ({
    product_id: product.PRODUCT_ID,
    product_name: product.PRODUCT_NAME,
    stock: product.STOCK,
    stored: product.STORED_STOCK,
    active: product.ACTIVE_STOCK,
  }));
};

const data_gather_handler = (
  token,
  args,
  transactionID,
  action,
  dbHandle = knex
) => {
  const query = productQuery(productParse(token));
  if (!query) return { start: async () => 1, done: async () => 1 };

  return {
    start: async () => {
      try {
        const beforeState = await snapshot(dbHandle, query);
        await dbHandle.raw(
          "UPDATE transaction_log SET before_stock = ? WHERE TRANSACTIONID = ?",
          [JSON.stringify(beforeState), transactionID]
        );
        return 0;
      } catch (err) {
        console.log(err);
        return 1;
      }
    },

    done: async () => {
      try {
        const afterState = await snapshot(dbHandle, query);
        await dbHandle.raw(
          "UPDATE transaction_log SET after_stock = ? WHERE TRANSACTIONID = ?",
          [JSON.stringify(afterState), transactionID]
        );
        return 0;
      } catch (err) {
        console.log(err);
        return 1;
      }
    },
  };
};

exports.data_gather_handler = data_gather_handler;
