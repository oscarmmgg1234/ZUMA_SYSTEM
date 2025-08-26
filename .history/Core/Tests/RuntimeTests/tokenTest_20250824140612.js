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
    tokenMap.set("act", product[0][0].ACTIVATION_TOKEN);
    tokenMap.set("red", product[0][0].REDUCTION_TOKEN);
    tokenMap.set("ship", product[0][0].SHIPMENT_TOKEN);
    return tokenMap;
  } catch (err) {
    throw new Error("Product not found");
  }
};

const main = async (_params) => {
  let db_handle;
  const {}
  try {
    db_handle = await transactionUnit();
    const _tokenMap = await getProductTokens(db_handle, _params.productID);
    await db_handle.rollback();
  } catch (err) {
    await db_handle.rollback();
  }
};
