const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");
const { query_manager } = require("../DB/query_manager.js");
const { tokenParser } = require("../Core/Engine/Token/tokenParser.js");
const { normalizeStock } = require("../Core/Utility/StockNormalizer.js");
const { publishProcessEvent } = require("../Services/Publisher/mqPublisher.js");

const knex = query_manager;

const postops = "POSTOPS";
const virtualops = "VIRTUALOPS";
const historyLog = async (db_handle, transaction_stack, table, column) => {
  var output = [];
  var outputDeterminent = false;
  for (const item of transaction_stack) {
    const response = await db_handle.raw(
      `SELECT * FROM ${table} WHERE ${column} = ?`,
      [item]
    );
    if (response[0][0]?.ORIGIN == "activation") {
      outputDeterminent = true;
    }
    output.push({
      product: response[0][0].PRODUCT_ID,
      value: response[0][0].QUANTITY,
      origin: response[0][0]?.ORIGIN,
    });
  }
  return { output, outputDeterminent };
};

const updateProductStock = async (
  db_handle,
  product,
  value,
  operation,
  column,
  origin = null
) => {
  await db_handle.raw(
    `UPDATE product_inventory SET ${
      !origin ? column : origin === "release" ? "STORED_STOCK" : "ACTIVE_STOCK"
    } = ${
      !origin ? column : origin === "release" ? "STORED_STOCK" : "ACTIVE_STOCK"
    } ${operation} ${value} WHERE PRODUCT_ID = ?`,
    [product]
  );
};

const normalizeProducts = (token) => {
  if (!token) {
    return;
  }
  const tokens = tokenParser(token);
  var output = [];

  for (var i = 0; i < tokens.size; i++) {
    let current = tokens.getData();
    if (current.key === postops) {
      output.push({
        product: current.value,
        value: parseFloat(auxiliaryParam),
        option: "ratio",
      });
    } else if (current.key === "UP") {
      output.push({
        product: current.value,
        value: 1,
        option: "default",
      });
    } else if (current.key === "CMUP") {
      output.push({
        product: current.value,
        value: 1,
        option: "default",
      });
    }

    tokens.next();
  }
  return output;
};

const transaction_engine = async (args) => {
  const response = await knex.raw(
    queries.development.getTransactionByID,
    args.to_arr()
  );

  const transactionProduct = await knex.raw(
    "SELECT * FROM product WHERE PRODUCT_ID = ?",
    response[0][0].PRODUCT_ID
  );

  //Modify database so that negative stocks are possible because after transaction reversal, because initially stock is 0 and when u reduce it stays zero and then when u reverse it, it goes positive but it should be zero

  const activation = JSON.parse(response[0][0].ACTIVATION_STACK);
  const release = JSON.parse(response[0][0].RELEASE_STACK);
  const shipment = JSON.parse(response[0][0].SHIPMENT_STACK);
  const barcode = JSON.parse(response[0][0].BARCODE_STACK);
  const transStatus = JSON.parse(response[0][0].REVERSED);
  const activation_token = transactionProduct[0][0].ACTIVATION_TOKEN;
  const reduction_token = transactionProduct[0][0].REDUCTION_TOKEN;
  const shipment_token = transactionProduct[0][0].SHIPMENT_TOKEN;

  const activationRevertNormalizationList = normalizeProducts(activation_token);

  const reductionRevertNormalizationList = normalizeProducts(reduction_token);

  const shipmentRevertNormalizationList = normalizeProducts(shipment_token);

  if (transStatus === 1) {
    return;
  }

  try {
    await knex.transaction(async (trx) => {
      try {
        if (activation.length > 0) {
          const historyQuantities = await historyLog(
            trx,
            activation,
            "inventory_activation",
            "ACTIVATION_ID"
          );
          for (const item of historyQuantities.output) {
            await updateProductStock(
              trx,
              item.product,
              item.value,
              "-",
              "ACTIVE_STOCK"
            );
          }
          // for (const item of activation) {
          //   await trx.raw(queries.development.deleteActivationEntry, [item]);
          // }
          for (const item of activationRevertNormalizationList) {
            await normalizeStock(trx, item);
          }
        }
        if (release.length > 0) {
          const historyQuantities = await historyLog(
            trx,
            release,
            "inventory_consumption",
            "CONSUMP_ID"
          );
          for (const item of historyQuantities.output) {
            await updateProductStock(
              trx,
              item.product,
              item.value,
              "+",
              "ACTIVE_STOCK",
              item.origin
            );
          }
          // for (const item of release) {
          //   await trx.raw(queries.development.deleteConsumptionEntry, [item]);
          // }
          for (const item of historyQuantities.outputDeterminent
            ? reductionRevertNormalizationList
            : activationRevertNormalizationList) {
            await normalizeStock(trx, item);
          }
        }

        if (shipment.length > 0) {
          const historyQuantities = await historyLog(
            trx,
            shipment,
            "shipment_log",
            "SHIPMENT_ID"
          );
          for (const item of historyQuantities.output) {
            await updateProductStock(
              trx,
              item.product,
              item.value,
              "-",
              "STORED_STOCK"
            );
          }
          // for (const item of shipment) {
          //   await trx.raw(queries.development.deleteShipmentEntry, [item]);
          // }
          for (const item of shipmentRevertNormalizationList) {
            await normalizeStock(trx, item);
          }
        }

        await publishProcessEvent({
          type: "revert",
          transactionID: args.transactionID,
        });

        if (barcode.length > 0) {
          for (const item of barcode) {
            await trx.raw(queries.dashboard.transform_barcode_product, [
              "Active/Passive",
              item,
            ]);
          }
        }
        await trx.raw(
          queries.development.setTransactionReversed,
          args.to_arr()
        );
      } catch (err) {
        throw err;
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.transaction_engine = transaction_engine;

// works need to be done for this to work
