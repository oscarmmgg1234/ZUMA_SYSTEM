const { query_manager } = require("../DB/query_manager");
const tokenGenerator = require("../Core/Engine/Token/tokenGenerator");

const knex = query_manager;

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
