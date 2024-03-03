const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");
const { db_interface } = require("../DB/interface.js");
const { query_manager } = require("../DB/query_manager.js");
const { TransactionHandler } = require("./EngineComponents/transactionErrorHandler.js");

const transHandler = new TransactionHandler();
const knex = query_manager;
const db_api = db_interface();

const shipment_engine = (args, callback) => {
  db_api.addTransaction({ src: "shipment", args: args });
  const newArgs = {
    quantity: args.QUANTITY,
    company_id: args.COMPANY_ID,
    type: args.TYPE,
    employee_id: args.EMPLOYEE_ID,
    product_id: args.PRODUCT_ID,
    shipment_type: args.SHIPMENT_TYPE,
    arr: args.to_arr(),
    TRANSACTIONID: args.TRANSACTIONID,
  };
  setTimeout(() => {
    shipment_protocol.forEach((protocol, index) => {
      if (args.SHIPMENT_TYPE == index + 1) {
        protocol(newArgs, (status) => {
          if (status.status == false) {
            knex.raw("DELETE FROM transaction_log WHERE TRANSACTIONID = ?", [
              args.TRANSACTIONID,
            ]);
          }
          return callback(status);
        });
      }
    });
  }, 300);
  // setTimeout(() => {

  // }, 1500);
};

const type1_shipment = async (args, callback) => {
  // Update stored quantity
  try {
    await knex.transaction(async (trx) => {
      try {
        const result = await trx.raw(
          queries.product_release.get_quantity_by_stored_id_storage,
          [args.product_id]
        );
        await trx.raw(queries.product_inventory.update_activation_stored, [
          result[0][0].STORED_STOCK + args.quantity,
          args.product_id,
        ]);

        // Insert shipment log
        await trx.raw(queries.shipment_log.insert, args.arr);
      } catch (err) {
        throw err;
      }
    });
    return callback(transHandler.sucessHandler());
  } catch (err) {
    console.log(err);
    return callback(transHandler.errorHandler(err));
  }
};

const shipment_protocol = [type1_shipment];

exports.shipment_engine = shipment_engine;
