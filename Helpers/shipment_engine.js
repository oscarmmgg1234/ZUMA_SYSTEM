const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");
const { db_interface } = require("../DB/interface.js");
const { query_manager } = require("../DB/query_manager.js");
const {
  TransactionHandler,
} = require("./EngineComponents/transactionErrorHandler.js");

const transHandler = new TransactionHandler();
const knex = query_manager;
const db_api = db_interface();

const shipment_engine = async (args, callback) => {
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
  setTimeout(async () => {
    for (var i = 0; i < shipment_protocol.length; i++) {
      if (args.SHIPMENT_TYPE == i + 1) {
        await shipment_protocol[i](newArgs, async (status) => {
          if (status.status == false) {
            await knex.raw(
              "DELETE FROM transaction_log WHERE TRANSACTIONID = ?",
              [args.TRANSACTIONID]
            );
          }
          return callback(status);
        });
      }
    }
  }, 300);
  // setTimeout(() => {

  // }, 1500);
};
const MAX_RETRIES = 3; // Maximum number of retries
const RETRY_DELAY = 1000; // Delay between retries in milliseconds

const type1_shipment = async (args, callback, retries = MAX_RETRIES) => {
  try {
    await knex.transaction(async (trx) => {
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
    });
    return callback(transHandler.sucessHandler());
  } catch (err) {
    console.log("Transaction error:", err);
    if (err.code === "ER_LOCK_DEADLOCK" && retries > 0) {
      console.log(
        `Deadlock detected. Retrying transaction... Retries left: ${retries}`
      );
      setTimeout(
        () => type1_shipment(args, callback, retries - 1),
        RETRY_DELAY
      );
    } else {
      return callback(transHandler.errorHandler(err));
    }
  }
};

const shipment_protocol = [type1_shipment];

exports.shipment_engine = shipment_engine;
