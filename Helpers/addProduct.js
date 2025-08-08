const { query_manager } = require("../DB/query_manager");
const tokenGenerator = require("../Core/Engine/Token/tokenGenerator");


const knex = query_manager;

function generateShortUUID() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const insertNewProduct = async (db_handle, args, tokenData) => {
  //Insert new product, this will have product generated
  try {
    // Insert main product
    await db_handle.raw(
      "INSERT INTO product (PRODUCT_ID, NAME, DESCRIPTION, PRICE, TYPE, LOCATION, COMPANY, UNIT_TYPE, MIN_LIMIT) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        args.productID,
        args.name,
        args.description,
        parseFloat(args.price),
        args.type,
        args.location,
        args.company,
        args.unitType,
        0, // MIN_LIMIT
      ]
    );

    // Insert label product if createLabel is true
    if (args.createLabel === true) {
      await db_handle.raw(
        "INSERT INTO product (PRODUCT_ID, NAME, DESCRIPTION, PRICE, TYPE, LOCATION, COMPANY, ACTIVATION_TOKEN, REDUCTION_TOKEN, SHIPMENT_TOKEN, UNIT_TYPE, MIN_LIMIT, ReferenceStockProduct) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          args.productLabelID,
          `${args.name} Label`,
          "",
          0,
          "145",
          args.location,
          "443",
          "",
          "",
          `SH:38dh:${args.productLabelID} UP:235s:${args.productLabelID}`,
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

const addProdProcess = async (args) => {
  const trans = await knex.transaction();
  try {
    const tokenData = tokenGenerator({
      activationTokens: args.activationTokens,
      reductionTokens: args.reductionTokens,
      shipmentTokens: args.shipmentTokens,
    });

    await insertNewProduct(trans, args, tokenData);

    trans.commit();
  } catch (error) {
    trans.rollback();
  }
};

exports.addProdProcess = addProdProcess;
