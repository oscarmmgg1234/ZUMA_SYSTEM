const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");
const { query_manager } = require("../DB/query_manager.js");

const knex = query_manager;

const transaction_engine = async (args) => {
  const response = await trx.raw(
    queries.development.getTransactionByID,
    args.to_arr()
  );
  const transaction = response[0][0];
  if (transaction.REVERSED === 1) {
    return;
  }
  try {
    await knex.transaction(async (trx) => {
      try {
        if (transaction.ACTIVATION_STACK.length > 0) {
          for (const item of transaction.ACTIVATION_STACK) {
            await trx.raw(queries.development.deleteActivationEntry, [item]);
          }
        }
        if (transaction.CONSUMPTION_STACK.length > 0) {
          for (const item of transaction.CONSUMPTION_STACK) {
            await trx.raw(queries.development.deleteConsumptionEntry, [item]);
          }
        }

        if (transaction.SHIPMENT_STACK.length > 0) {
          for (const item of transaction.SHIPMENT_STACK) {
            await trx.raw(queries.development.deleteShipmentEntry, [item]);
          }
        }

        if (transaction.BARCODE_STACK.length > 0) {
          for (const item of transaction.BARCODE_STACK) {
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
