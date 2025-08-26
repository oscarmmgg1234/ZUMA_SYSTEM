const { Controller } = require("../../../Controllers/controller.js");
const {
  transactionUnit,
} = require("../../DBLayer/Transaction/transactionUnit.js");
const {
  generateRandomID,
} = require("../../../Constants/stringRandoGeneration.js");
const controller = Controller;

const _defaultQuantity = 100;
const _defaultMultiplier = "1";
let _actTransID = null;
let _shipTransID = null;

const getProductTokens = async (db_handle, productID) => {
  try {
    let tokenMap = new Map();
    const product = await db_handle.raw(
      "SELECT * from product WHERE PRODUCT_ID = ?",
      [productID]
    );
    tokenMap.set("act", {
      token: product[0][0].ACTIVATION_TOKEN,
      product_name: product[0][0].NAME,
      productID: product[0][0].PRODUCT_ID,
      info: product[0][0],
    });
    tokenMap.set("red", {
      token: product[0][0].REDUCTION_TOKEN,
      product_name: product[0][0].NAME,
      productID: product[0][0].PRODUCT_ID,
      info: product[0][0],
    });
    tokenMap.set("ship", {
      token: product[0][0].SHIPMENT_TOKEN,
      product_name: product[0][0].NAME,
      productID: product[0][0].PRODUCT_ID,
      info: product[0][0],
    });
    return tokenMap;
  } catch (err) {
    throw new Error("Product not found");
  }
};

const generateDefaultEngineInfo = (product) => {
  let outputMap = new Map();
  let actRoute = product.get("act");
  let shipRoute = product.get("ship");
  outputMap.set("act", {
    EMPLOYEE_ID: "000002",
    PRODUCT_ID: actRoute.productID,
    PRODUCT_NAME: actRoute.product_name,
    QUANTITY: _defaultQuantity,
    MULTIPLIER: _defaultMultiplier,
    EMPLOYEE_NAME: "Oscar Maldonado",
    TRANSACTIONID: _transID,
    process_token: actRoute.token,
  });

  //   constructor(args) {
  //   this.QUANTITY = args.QUANTITY;
  //   this.COMPANY_ID = args.COMPANY_ID;
  //   this.TYPE = args.TYPE;
  //   this.EMPLOYEE_ID = args.EMPLOYEE_ID;
  //   this.PRODUCT_ID = args.PRODUCT_ID;
  //   this.PRODUCT_NAME = args.PRODUCT_NAME;
  //   this.TRANSACTIONID = generateRandomID(8);
  //   this.BarcodeGeneration = args.BarcodeGeneration;
  //   this.process_token = args.PROCESS_TOKEN;
  //   this.src = "shipment"
  // }
  outputMap.set("ship", {
    QUANTITY: _defaultQuantity,
    COMPANY_ID: shipRoute.info.COMPANY,
    TYPE: shipRoute.info.TYPE,
    EMPLOYEE_ID: "000002",
    PRODUCT_ID: shipRoute.productID,
    PRODUCT_NAME: shipRoute.product_name,
    TRANSACTIONID: _shipTransID,
    BarcodeGeneration: shipRoute.info.BarcodeGeneration,
    process_token: shipRoute.token,
    src: "shipment",
  });
  return outputMap;
};

const initProcessFlows = async (db_handle, _default) => {
  try {
    let _reduction = [];
    let _activation = [];
    let _shipment = [];
    // class product_inventory {
    //   constructor(args) {
    //     this.EMPLOYEE_ID = args.EMPLOYEE_ID;
    //     this.PRODUCT_ID = args.PRODUCT_ID;
    //     this.PRODUCT_NAME = args.PRODUCT_NAME;
    //     this.QUANTITY = parseInt(args.QUANTITY);
    //     this.MULTIPLIER = args.MULTIPLIER;
    //     this.EMPLOYEE_NAME = args.EMPLOYEE_NAME;
    //     this.TRANSACTIONID = constants.generateRandomID(8);
    //     this.process_token = args.PROCESS_TOKEN;
    //   }
    const activationPreProcess =
      await controller.product_activation_controller.activate_product({});
  } catch (err) {
    throw new Error(err);
  }
};

const engineTestHandler = async (db_handle, args) => {
  try {
    await controller.reduction.product_reduction();
  } catch (err) {
    throw new Error("Core Engine execution failed");
  }
};

const main = async (_params) => {
  let db_handle;
  const { productID } = _params;
  _actTransID = generateRandomID(8);
  _shipTransID = generateRandomID(8);
  try {
    db_handle = await transactionUnit();
    const _productMap = await getProductTokens(db_handle, productID);
    const _CompileDefaultInfo = generateDefaultEngineInfo(_productMap);
    const _initProcess = await 
    await db_handle.rollback();
  } catch (err) {
    await db_handle.rollback();
  }
};
