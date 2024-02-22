const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");
const { db_interface } = require("../DB/interface.js");

const local_service = db_interface();
function generateRandomID(length) {
  // Create a random ID with a specified length
  let result = "";
  // Define the characters that can be included in the ID
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    // Append a random character from the characters string
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const reduction_type = (args, callback) => {
  local_service.get_product_by_id(args, (data) => {
    return callback(data[0].REDUCTION_TYPE);
  });
};

const reduction_engine = (args) => {
  local_service.setBarcodeEmployee([
    args.EMPLOYEE_RESPONSIBLE,
    args.BARCODE_ID,
  ]);
  const TRANSACTIONID = args.TRANSACTIONID;
  db(queries.tools.get_barcode_data, [args.BARCODE_ID], (err, result2) => {
    db(
      queries.development.getTransactionByID,
      [TRANSACTIONID],
      (err, result) => {
        const newTransactionID = generateRandomID(12);
        const argsReinit = {
          EMPLOYEE_ID: args.EMPLOYEE_RESPONSIBLE,
          PRODUCT_ID: result[0]?.PRODUCT_ID ?? result2[0]?.PRODUCT_ID,
          QUANTITY: result[0]?.QUANTITY ?? result2[0]?.Quantity,
          TRANSACTIONID: newTransactionID,
        };
        local_service.addTransaction({ src: "consumption", args: argsReinit });
        db(queries.development.addBarcodeInfoToTransaction, [
          args.BARCODE_ID,
          newTransactionID,
        ]);
        setTimeout(() => {
          reduction_protocol.forEach((protocol, index) => {
            reduction_type(
              result[0]?.PRODUCT_ID ?? result2[0]?.PRODUCT_ID,
              (type) => {
                if (index + 1 == type) {
                  protocol({
                    quantity: result[0]?.QUANTITY ?? result2[0]?.Quantity,
                    product_id: result[0]?.PRODUCT_ID ?? result2[0]?.PRODUCT_ID,
                    employee_id: args.EMPLOYEE_RESPONSIBLE,
                    BARCODE_ID: args.BARCODE_ID,
                    TRANSACTIONID: newTransactionID,
                    origin: "activation",
                  });
                }
              }
            );
          });
        }, 300);
      }
    );
  });
  // setTimeout(() => {
  // }, 1500);
};

const type1_reduction = (args) => {
  db(queries.product_release.barcode_status_change, [
    "Deducted",
    args.BARCODE_ID,
  ]);
  db(
    queries.product_release.insert_product_release_active,
    [
      args.product_id,
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
      args.origin,
    ],
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );

  db(
    queries.product_release.get_quantity_by_stored_id_active,
    [args.product_id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        db(queries.product_inventory.update_consumption_active, [
          parseInt(result[0].ACTIVE_STOCK) - args.quantity,
          args.product_id,
        ]);
      }
    }
  );
};

const type2_reduction = (args) => {
  db(queries.product_release.barcode_status_change, [
    "Deducted",
    args.BARCODE_ID,
  ]);

  db(
    queries.product_release.insert_product_release_active,
    [
      args.product_id,
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
      args.origin,
    ],
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    [args.product_id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        db(queries.product_inventory.update_consumption_stored, [
          parseInt(result[0].STORED_STOCK) - args.quantity,
          args.product_id,
        ]);
      }
    }
  );
};

const reduction_protocol = [type1_reduction, type2_reduction];

exports.reduction_engine = reduction_engine;
