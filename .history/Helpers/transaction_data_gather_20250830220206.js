const { query_manager } = require("../DB/query_manager.js");

const knex = query_manager;

const negSign = (num) => {
  return -1 * num;
};

const getStockDiffs = (beforeStock, afterStock) => {
  let output = new Map();
  for (const [key, value] of afterStock) {
    let beforeProduct = beforeStock.get(key);
    let stockDiff = negSign(beforeProduct.stock - value.stock);
    let storedStockDiff = Math.abs(beforeProduct.stored - value.stored);
    let activeStockDiff = Math.abs(beforeProduct.active - value.active);
    output.set(key, {
      stockDiff,
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

const computeNetChanges = (productMap) => {
  const result = new Map();

  for (const [productID, columns] of productMap) {
    const colSums = {
      STORED_STOCK: 0,
      ACTIVE_STOCK: 0,
    };

    for (const column of Object.keys(colSums)) {
      const operations = columns[column];

      for (const op of operations) {
        const value = op.operation === "-" ? negSign(op.value) : op.value;
        colSums[column] += value;
      }
    }

    result.set(productID, colSums);
  }

  return result;
};

const buildValidationArray = (netChanges, diffMap) => {
  const validArray = [];

  for (const [productID, expected] of netChanges) {
    const actual = diffMap.get(productID);
    const mismatchColumns = [];

    if (!actual) {
      mismatchColumns.push("STORED_STOCK", "ACTIVE_STOCK");
    } else {
      // Flip sign on expected value to match absolute diff direction
      const storedDelta = Math.abs(
        Math.abs(expected.STORED_STOCK) - actual.storedDiff
      );
      const activeDelta = Math.abs(
        Math.abs(expected.ACTIVE_STOCK) - actual.activeDiff
      );

      if (storedDelta > 0.001) {
        mismatchColumns.push("STORED_STOCK");
      }
      if (activeDelta > 0.001) {
        mismatchColumns.push("ACTIVE_STOCK");
      }
    }

    validArray.push({
      productID,
      valid: mismatchColumns.length === 0,
      column: mismatchColumns,
    });
  }

  return validArray;
};

// ---- FIX: Always return a consistent object shape ----
const changeValidator = (args) => {
  if (!args || !args.processStack || args.processStack.length < 1) {
    return { valid: [], diffMap: new Map() };
  }
  const diffMap = getStockDiffs(args.startMap, args.endMap);
  const processStackMap = processPStack(args.processStack);
  const netChanges = computeNetChanges(processStackMap);
  const valid = buildValidationArray(netChanges, diffMap);
  return { valid, diffMap };
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

const formatProductChain = async (map, db_handle, product) => {
  const productChain = [];
  // (Optional extra safety) If map isn't iterable, just return empty chain
  if (!map || typeof map[Symbol.iterator] !== "function") return productChain;

  for (const [key, value] of map) {
    if (product !== key) {
      const prod = await db_handle.raw(
        "SELECT NAME FROM product WHERE PRODUCT_ID = ?",
        [key]
      );
      productChain.push({
        product: (prod?.[0]?.[0]?.NAME || "").slice(0, 12),
        stockDiff: value.stockDiff,
      });
    }
  }
  return productChain;
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

        const validArr = changeValidator({ startMap, endMap, processStack });

        await dbHandle.raw(
          "UPDATE transaction_log SET after_stock = ? WHERE TRANSACTIONID = ?",
          [JSON.stringify(afterState), transactionID]
        );

        let packet = null;
        if (args.display_type == "reduction type" || args.display_type == "shipment type") {
          const getTrans = await dbHandle.raw(
            "SELECT * FROM transaction_log WHERE TRANSACTIONID = ?",
            [transactionID]
          );
          packet = {
            PRODUCT_ID: getTrans[0][0]?.PRODUCT_ID,
            EMPLOYEE_NAME: getTrans[0][0]?.EMPLOYEE_NAME,
            PRODUCT_NAME: getTrans[0][0]?.PRODUCT_NAME,
            QUANTITY: getTrans[0][0]?.QUANTITY,
          };
        }

        // ---- FIX: Ensure we always pass an iterable Map ----
        const diffMapForChain = (validArr && validArr.diffMap) ? validArr.diffMap : new Map();

        const formatChain = await formatProductChain(
          diffMapForChain,
          dbHandle,
          packet ? packet.PRODUCT_ID : args.PRODUCT_ID
        );

        const displayType =
          args.display_type == "reduction type"
            ? { ...args, ...packet }
            : args.display_type == "shipment type" ? { ...args, ...packet } : args

        return {
          validArr: validArr.valid,
          chain: formatChain,
          product: args.PRODUCT_ID,
          args: displayType,
        };
      } catch (err) {
        console.log(err);
        return {};
      }
    },
  };
};

exports.data_gather_handler = data_gather_handler;
