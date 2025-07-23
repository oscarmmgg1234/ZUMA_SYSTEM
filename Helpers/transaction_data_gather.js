const { query_manager } = require("../DB/query_manager.js");
const { normalizeStock } = require("../Core/Utility/StockNormalizer.js");
const { tokenParser } = require("../Core/Engine/Token/tokenParser.js");
const { queries } = require("../DB/queries.js");

const knex = query_manager;
const postops = "POSTOPS";

// const normalize = (value, ratio) => {
//   return value * (1 / ratio);
// };

// const getTransStacks = async (db_handle, transactionID) => {
//   const response = await db_handle.raw(
//     queries.development.getTransactionByID,
//     transactionID
//   );

//   const activationStack = {
//     stack: "inventory_activation",
//     arr: JSON.parse(response[0][0].ACTIVATION_STACK),
//   };
//   const releaseStack = {
//     stack: "inventory_consumption",
//     arr: JSON.parse(response[0][0].RELEASE_STACK),
//   };
//   const shipmentStack = {
//     stack: "shipment_log",
//     arr: JSON.parse(response[0][0].SHIPMENT_STACK),
//   };

//   const retrieveData = async (option, trans) => {
//     const query = `SELECT * FROM ${option} WHERE TRANSACTIONID = ?`;
//     const result = await db_handle.raw(query, [trans]);
//     const output = {
//       value: result?.QUANTITY,
//       stack: option,
//     };
//     return output;
//   };
//   const stacks = [activationStack, releaseStack, shipmentStack];
//   const retrieveStack = [];
//   for (const item of stacks) {
//     if (item.stack == []) {
//       continue;
//     }
//     for (const trans of item.stack) {
//       retrieveStack.push(await retrieveData(item.stack, trans));
//     }
//   }
// };

// const trackUpdates = (token) => {
//   const tokens = tokenParser(token);
//   var output = [];

//   for (var i = 0; i < tokens.size; i++) {
//     let current = tokens.getData();
//     if (current.key === postops) {
//       output.push({
//         key: current.key,
//         product: current.value,
//         value: parseFloat(auxiliaryParam),
//         option: "ratio",
//       });
//     } else if (current.key === "UP") {
//       output.push({
//         key: current.key,
//         product: current.value,
//         value: 1,
//         option: "default",
//       });
//     } else if (current.key === "CMUP") {
//       output.push({
//         key: current.key,
//         product: current.value,
//         value: 1,
//         option: "default",
//       });
//     }

//     tokens.next();
//   }
//   return output;
// };

const normalize = (value, ratio) => {
  return value * (1 / ratio);
};

const getStockDiffs = (beforeStock, afterStock) => {
  let output = new Map();
  for (const [key, value] of afterStock) {
    let beforeProduct = beforeStock.get(key);
    let storedStockDiff = Math.abs(beforeProduct.stored - value.stored);
    let activeStockDiff = Math.abs(beforeProduct.active - value.active);
    output.set(key, {
      activeDiff: activeStockDiff,
      storedDiff: storedStockDiff,
    });
  }
  return output;
};

const processPStack = (processStack) => {
  const productMap = new Map();

  for (const item of processStack) {
    const { productID, column, ...rest } = item;

    // Initialize productID entry if not present
    if (!productMap.has(productID)) {
      productMap.set(productID, {
        STORED_STOCK: [],
        ACTIVE_STOCK: [],
      });
    }

    // Push the operation into the appropriate column array
    const columnMap = productMap.get(productID);

    if (columnMap[column]) {
      columnMap[column].push({ column, ...rest });
    } else {
      // Optional: if you want to support other column names dynamically
      columnMap[column] = [{ column, ...rest }];
    }
  }
  return productMap;
};

const negSign = (num) => {
  return -1 * num;
};

const changeValidator = (args) => {
  if (args.processStack.length < 1) {
    return;
  }
  const diffMap = getStockDiffs(args.startMap, args.endMap);
  const processStackMap = processPStack(args.processStack);
  

  console.log(processStackMap);
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
  let processStack = [];
  let startMap = null;
  let endMap = null;

  return {
    //value = {normalize: false, column: "STORED_STOCK", value: -1, productID: "23423D", operation: "-"}
    step: (value) => {
      processStack.push(value);
    },
    start: async () => {
      try {
        const beforeState = await snapshot(dbHandle, query);
        startMap = new Map(beforeState.map((item) => [item.product_id, item]));

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
        endMap = new Map(afterState.map((item) => [item.product_id, item]));

        const valid = changeValidator({ startMap, endMap, processStack });
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
