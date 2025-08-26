const { Controller } = require("../../../Controllers/controller.js");
const { dev_query_manager } = require("../../../DB/query_manager.js");
const tokenGenerator = require("../../../Core/Engine/Token/tokenGenerator");

const controller = Controller;
const _dbHandle = dev_query_manager;

async function initializeGlobalProductMap(ids, status) {
  const products = await _dbHandle.raw("SELECT * FROM product");
  return new Map(products[0].map((product) => [product.PRODUCT_ID, product]));
}

const cleanUp = async (args, _dbHandle) => {
  try {
    await _dbHandle.raw("DELETE FROM product WHERE PRODUCT_ID = ?", [
      args.generatedIDs[0],
    ]);
    if (args.createLabel === true) {
      await _dbHandle.raw("DELETE FROM product WHERE PRODUCT_ID = ?", [
        args.generatedIDs[1],
      ]);
    }
    return true;
  } catch (e) {
    return false;
  }
};

function generateRandomID(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const insertNewProduct = async (db_handle, args, tokenData) => {
  try {
    // Insert main product
    await db_handle.raw(
      "INSERT INTO product (PRODUCT_ID, NAME, DESCRIPTION, PRICE, TYPE, LOCATION, COMPANY, ACTIVATION_TOKEN, REDUCTION_TOKEN, SHIPMENT_TOKEN, UNIT_TYPE, MIN_LIMIT, ReferenceStockProduct) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        args.generatedIDs[0],
        args.name,
        args.description,
        parseFloat(args.price),
        args.type,
        args.location,
        args.company,
        tokenData.activation_token,
        tokenData.reduction_token,
        tokenData.shipment_token,
        args.unitType,
        0, // MIN_LIMIT
        args.RefProduct ? args.RefProduct : "",
      ]
    );

    // Insert label product if createLabel is true
    if (args.createLabel === true) {
      await db_handle.raw(
        "INSERT INTO product (PRODUCT_ID, NAME, DESCRIPTION, PRICE, TYPE, LOCATION, COMPANY, ACTIVATION_TOKEN, REDUCTION_TOKEN, SHIPMENT_TOKEN, UNIT_TYPE, MIN_LIMIT, ReferenceStockProduct) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          args.generatedIDs[1],
          `${args.name} Label`,
          "",
          0,
          "145",
          args.location,
          "443",
          "",
          "",
          `SH:38dh:${args.generatedIDs[1]} UP:235s:${args.generatedIDs[1]}`,
          "UNIT",
          0, // MIN_LIMIT
          args.RefProduct ? args.RefProduct : "",
        ]
      );
    }
  } catch (error) {
    throw error;
  }
};

const getProductNames = async (_productTrackerIds, _GlobalProductMap) => {
  const productNamesSet = new Set();
  for (let productID of _productTrackerIds) {
    const product = _GlobalProductMap.get(productID);
    if (product) {
      productNamesSet.add({ name: product.NAME, id: productID });
    }
  }
  return Array.from(productNamesSet);
};

const getInventory = async () => {
  const transactionUnit = await _dbHandle.transaction();
  const _inventory = await transactionUnit.raw(
    "SELECT * FROM product_inventory"
  );
  await transactionUnit.commit();
  return new Map(_inventory[0].map((product) => [product.PRODUCT_ID, product]));
};

const runInventoryCheck = async (
  args,
  _productTrackerIds,
  initInventory,
  header,
  _GlobalProductMap
) => {
  const transactionUnit = await _dbHandle.transaction();
  let _output = `${header}:\nTest quantity: 10\nSome products might have a different difference as they use formulas. Reference documentation to see if the outcome is correct.\n`;
  const _productTrackerMap = await getProductNames(
    _productTrackerIds,
    _GlobalProductMap
  );
  const inventoryCheck = await getInventory();
  for (let product of _productTrackerMap) {
    const _product = inventoryCheck.get(product.id).STOCK;
    const _initProduct = initInventory.get(product.id).STOCK;
    const _diff = _product - _initProduct;
    _output += `${product.name}\nInitial Quantity: ${_initProduct}\nCurrent Quantity: ${_product}\nDifference: ${_diff}\n`;
  }
  await transactionUnit.commit();
  return _output;
};

const disectProductIds = (args) => {
  const _tokens = args.split(" ");
  const _output = new Set();
  _tokens.forEach((token) => {
    const _token = token.split(":");
    if (_token[2]) {
      _output.add(_token[2]);
    }
  });
  return Array.from(_output);
};

const activationTest = async (
  transactionUnit,
  args,
  tokenData,
  _transactionID,
  _GlobalProductMap
) => {
  if (!tokenData) {
    return;
  }

  const initInventory = await getInventory();
  const _productTrackerIds = disectProductIds(tokenData);
  const _inputParams = {
    EMPLOYEE_ID: "000002",
    PRODUCT_ID: args.generatedIDs[0],
    PRODUCT_NAME: args.name,
    QUANTITY: 10,
    MULTIPLIER: "1",
    EMPLOYEE_NAME: "Oscar Maldonado",
    TRANSACTIONID: _transactionID,
    process_token: tokenData,
  };
  await controller.product_activation_controller.activate_product(_inputParams);
  const log = await runInventoryCheck(
    args,
    _productTrackerIds,
    initInventory,
    "Activation Test",
    _GlobalProductMap
  );
  return log;
};

const reductionTest = async (
  transactionUnit,
  args,
  tokenData,
  _transactionID,
  _GlobalProductMap
) => {
  if (!tokenData) {
    return;
  }

  const initInventory = await getInventory();
  const _productTrackerIds = disectProductIds(tokenData);
  const generatedBarcodeID = generateRandomID(8);
  await transactionUnit.raw(
    "INSERT INTO barcode_log (BarcodeID, Employee, Quantity, Status, TRANSACTIONID, PRODUCT_ID) VALUES (?,?,?,?,?,?)",
    [
      generatedBarcodeID,
      "000002",
      10,
      "ACTIVE/PASSIVE",
      _transactionID,
      args.generatedIDs[0],
    ]
  );

  const _inputParams = {
    EMPLOYEE_RESPONSIBLE: "000002",
    BARCODE_ID: generatedBarcodeID,
    TRANSACTIONID: _transactionID,
    newTransactionID: generateRandomID(8),
  };

  await controller.reduction.product_reduction(_inputParams);
  const log = await runInventoryCheck(
    args,
    _productTrackerIds,
    initInventory,
    "Reduction Test",
    _GlobalProductMap
  );
  return log;
};

const shipmentTest = async (
  transactionUnit,
  args,
  tokenData,
  _transactionID,
  _GlobalProductMap
) => {
  if (!tokenData) {
    return;
  }

  const initInventory = await getInventory();
  const _productTrackerIds = disectProductIds(tokenData);
  const _inputParams = {
    QUANTITY: 10,
    COMPANY_ID: args.company,
    TYPE: args.type,
    EMPLOYEE_ID: "000002",
    PRODUCT_ID: args.generatedIDs[0],
    PRODUCT_NAME: args.name,
    TRANSACTIONID: _transactionID,
    process_token: tokenData,
    to_arr: function () {
      return [
        this.QUANTITY,
        this.COMPANY_ID,
        this.TYPE,
        this.EMPLOYEE_ID,
        this.PRODUCT_ID,
        this.TRANSACTIONID,
      ];
    },
  };
  await controller.shipment_controller.insert_shipment(_inputParams);
  const log = await runInventoryCheck(
    args,
    _productTrackerIds,
    initInventory,
    "Shipment Test",
    _GlobalProductMap
  );
  return log;
};

const runTest = async (
  transactionUnit,
  args,
  tokenData,
  _transactionID,
  _GlobalProductMap
) => {
  let _output = "New Product Test:\n";
  const _activation = await activationTest(
    transactionUnit,
    args,
    tokenData.activation_token,
    _transactionID,
    _GlobalProductMap
  );
  const _reduction = await reductionTest(
    transactionUnit,
    args,
    tokenData.reduction_token,
    _transactionID,
    _GlobalProductMap
  );
  const _shipment = await shipmentTest(
    transactionUnit,
    args,
    tokenData.shipment_token,
    _transactionID,
    _GlobalProductMap
  );

  _output += _activation;
  _output += _reduction;
  _output += _shipment;
  return _output;
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const testToken = async (args) => {
  const tokenData = tokenGenerator({
    activationTokens: args.activationTokens,
    reductionTokens: args.reductionTokens,
    shipmentTokens: args.shipmentTokens,
  });
  const _transactionID = generateRandomID(8);

  const insertProductTransaction = await _dbHandle.transaction();
  try {
    await insertNewProduct(insertProductTransaction, args, tokenData);
    await insertProductTransaction.commit();
  } catch (error) {
    await insertProductTransaction.rollback();
    throw error;
  }

  await delay(2000);

  const testTransaction = await _dbHandle.transaction();
  try {
    const _GlobalProductMap = await initializeGlobalProductMap(
      args.generatedIDs,
      args.createLabel
    );

    const _testResult = await runTest(
      testTransaction,
      args,
      tokenData,
      _transactionID,
      _GlobalProductMap
    );

    const _result = await cleanUp(args, _dbHandle);
    if (_result) {
      await testTransaction.commit();
      return { status: true, log: _testResult };
    } else {
      throw new Error("Cleanup failed");
    }
  } catch (error) {
    await testTransaction.rollback();
    return { status: false, log: error.toString() };
  }
};

module.exports = { testToken };
