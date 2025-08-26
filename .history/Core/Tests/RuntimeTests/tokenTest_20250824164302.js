const { Controller } = require("../../../Controllers/controller.js");
const {
  transactionUnit,
} = require("../../DBLayer/Transaction/transactionUnit.js");

const controller = Controller;

const getProductTokens = async (db_handle, productID) => {
  try {
    let tokenMap = new Map();
    const product = await db_handle.raw(
      "SELECT * from product WHERE PRODUCT_ID = ?",
      [productID]
    );
    tokenMap.set("act", {token: product[0][0].ACTIVATION_TOKEN, product_name: product[0][0].NAME, productID: product[0][0].PRODUCT_});
    tokenMap.set("red", {token: product[0][0].REDUCTION_TOKEN, product_name: product[0][0].NAME});
    tokenMap.set("ship", {
      token: product[0][0].SHIPMENT_TOKEN,
      product_name: product[0][0].NAME,
    });
    return tokenMap;
  } catch (err) {
    throw new Error("Product not found");
  }
};

const generateDefaultEngineInfo = (db_handle, productID) => {
  
  return new Map()
};

const initProcessFlows = async (db_handle) => {
  try {
    let _reduction = []
    let _activation = []
    let _shipment = []
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
    const activationPreProcess = await controller.product_activation_controller.activate_product()

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
  try {
    db_handle = await transactionUnit();
    const _tokenMap = await getProductTokens(db_handle, productID);
    await db_handle.rollback();
  } catch (err) {
    await db_handle.rollback();
  }
};
