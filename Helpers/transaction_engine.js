const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");
const { query_manager } = require("../DB/query_manager.js");

const knex = query_manager;

const transaction_engine = async (args) => {
  const response = await knex.raw(
    queries.development.getTransactionByID,
    args.to_arr()
  );

  const activation = JSON.parse(response[0][0].ACTIVATION_STACK);
  const release = JSON.parse(response[0][0].RELEASE_STACK);
  const shipment = JSON.parse(response[0][0].SHIPMENT_STACK);
  const barcode = JSON.parse(response[0][0].BARCODE_STACK);
  const transStatus = JSON.parse(response[0][0].REVERSED);

  if (transStatus === 1) {
    return;
  }

  try {
    await knex.transaction(async (trx) => {
      try {
        if (activation.length > 0) {
          for (const item of activation) {
            await trx.raw(queries.development.deleteActivationEntry, [item]);
          }
        }
        if (release.length > 0) {
          for (const item of release) {
            await trx.raw(queries.development.deleteConsumptionEntry, [item]);
          }
        }

        if (shipment.length > 0) {
          for (const item of shipment) {
            await trx.raw(queries.development.deleteShipmentEntry, [item]);
          }
        }

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
