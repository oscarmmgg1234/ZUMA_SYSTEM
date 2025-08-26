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

const generateDefaultEngineInfo = (product, args) => {
  const { _actTransID, _barcodeID, _shipTransID, _redNewTransID } = args;
  let outputMap = new Map();
  let actRoute = product.get("act");
  let shipRoute = product.get("ship");
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
  outputMap.set("act", {
    EMPLOYEE_ID: "000002",
    PRODUCT_ID: actRoute.productID,
    PRODUCT_NAME: actRoute.product_name,
    QUANTITY: _defaultQuantity,
    MULTIPLIER: _defaultMultiplier,
    EMPLOYEE_NAME: "Oscar Maldonado",
    TRANSACTIONID: _actTransID,
    process_token: actRoute.token,
    generatedBarcodeID: _barcodeID,
  });
  //   constructor(args) {
  //   this.EMPLOYEE_RESPONSIBLE = args.employee;
  //   const arg_arr = args.barcode.split(">");
  //   this.BARCODE_ID = arg_arr[0] ? arg_arr[0] : 0;
  //   this.TRANSACTIONID = arg_arr[1] ? arg_arr[1] : 0;
  //   this.newTransactionID = constants.generateRandomID(8);
  // }

  outputMap.set("red", {
    EMPLOYEE_RESPONSIBLE: "000002",
    BARCODE_ID: _barcodeID,
    TRANSACTIONID: _actTransID,
    newTransactionID: _redNewTransID,
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
    let _reductionProcessValidation;
    let _activationProcessValidation;
    let _shipmentProcessValidation;

    const activationResult =
      await controller.product_activation_controller.activate_product({
        ..._default.get("act"),
        transactionHandle: db_handle,
      });
    if (activationResult?.data.status == "success") {
      _activationProcessValidation = activationResult?.proccessValidation;
    }
    console.log(activation)
    const reductionResult = await controller.reduction.product_reduction({
      ..._default.get("red"),
      transactionHandle: db_handle,
    });
    if (reductionResult?.result.data.status == "sucess") {
      _reductionProcessValidation = reductionResult.result.proccessValidation;
    }

    const shipmentResult = await controller.shipment_controller.insert_shipment(
      [{ ..._default.get("ship"), transactionHandle: db_handle }]
    );

    //this will execute the transaction then return the validation output which will give all the deltas for this process now repeat for the next steps
  } catch (err) {
    throw new Error(err);
  }
};

const main = async (_params) => {
  let db_handle;
  const { productID } = _params;
  let _actTransID = generateRandomID(8);
  let _shipTransID = generateRandomID(8);
  let _barcodeID = generateRandomID(8);
  let _redNewTransID = generateRandomID(8);
  try {
    db_handle = await transactionUnit();
    const _productMap = await getProductTokens(db_handle, productID);
    const _CompileDefaultInfo = generateDefaultEngineInfo(_productMap, {
      _actTransID,
      _shipTransID,
      _barcodeID,
      _redNewTransID,
    });
    const _initProcess = await initProcessFlows(db_handle, _CompileDefaultInfo);
    await db_handle.rollback();
    return {hello: "oscar"}
  } catch (err) {
    await db_handle.rollback();
    return {err: err}
  }
};

exports.runtimeTest = main;
