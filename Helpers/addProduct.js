const { query_manager } = require("../DB/query_manager");
const tokenGenerator = require("../Core/Engine/Token/tokenGenerator");
const { generateRandomID } = require("../Constants/stringRandoGeneration");
const knex = query_manager;

const insertNewProduct = async (db_handle, args) => {
  //Insert new product, this will have product generated
  try {
    let subtype = "";
    if (args.type == "122" || args.type == "44") {
      subtype = "SELLABLE";
    } else if (args.type == "33") {
      subtype = "SHIPPABLE";
    } else if (args.type == "30" || args.type == "145") {
      subtype = "COMPONENT";
    }

    await db_handle.raw(
      "INSERT INTO product (PRODUCT_ID, NAME, DESCRIPTION, PRICE, TYPE, LOCATION, COMPANY, UNIT_TYPE, MIN_LIMIT,SUBTYPE, BarcodeGeneration, poolRef) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        args.PRODUCT_ID,
        args.name,
        args.description,
        args.price,
        args.type,
        "4322",
        args.company,
        args.unitType,
        0, // MIN_LIMIT
        subtype,
        args.needBarcode,
        args.currentPoolRef,
      ]
    );

    // Insert label product if createLabel is true
    if (args.createLabel === true) {
      const rando = generateRandomID(8);
      await db_handle.raw(
        "INSERT INTO product (PRODUCT_ID, NAME, DESCRIPTION, PRICE, TYPE, LOCATION, COMPANY, ACTIVATION_TOKEN, REDUCTION_TOKEN, SHIPMENT_TOKEN, UNIT_TYPE, MIN_LIMIT, SUBTYPE, BarcodeGeneration, poolRef) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          rando,
          `${args.name} Label`,
          "",
          0,
          "145",
          "4322",
          "443",
          "",
          "",
          `SH:38dh:${rando} UP:235s:${rando}`,
          "UNIT",
          0, // MIN_LIMIT
          "COMPONENT",
          false,
          null,
        ]
      );
    }
    return { status: true, message: "Created product." };
  } catch (error) {
    return { status: false, message: "Error creating product." };
  }
};

const addProdProcess = async (args) => {
  const trans = await knex.transaction();
  try {
    const status = await insertNewProduct(trans, args);
    if (!status.status) {
      await trans.rollback();
      return status;
    }
    await trans.commit(); // IMPORTANT
    return status;
  } catch (error) {
    await trans.rollback();
    return { status: false, message: "Fatal error in creating product." };
  }
};

exports.addProdProcess = addProdProcess;
