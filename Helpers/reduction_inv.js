const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");
const { db_interface } = require("../DB/interface.js");

const local_service = db_interface();

const reduction_type = (args, callback) => {
  local_service.get_product_by_id(args, (data) => {
    return callback(data[0].REDUCTION_TYPE);
  });
};

const reduction_engine = (args) => {
  reduction_protocol.forEach((protocol, index) => {
    reduction_type(args, (type) => {
      if (index + 1 == type) {
        protocol({
          quantity: args.QUANTITY,
          product_id: args.PRODUCT_ID,
          employee_id: args.EMPLOYEE_RESPONSIBLE,
          BARCODE_ID: args.BARCODE_ID,
        });
      }
    });
  });
};

const type1_reduction = (args) => {
  db.query(queries.product_release.barcode_status_change, [
    "Deducted",
    args.BARCODE_ID == null ? 0 : args.BARCODE_ID,
  ]);
  //product realase
  db.query(
    queries.product_release.insert_product_release,
    [args.product_id, args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_active,
    [args.product_id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_active, [
          parseInt(result[0].ACTIVE_STOCK) - args.quantity,
          args.product_id,
        ]);
      }
    }
  );
};

const type2_reduction = (args) => {
  db.query(queries.product_release.barcode_status_change, [
    "Deducted",
    args.BARCODE_ID == null ? 0 : args.BARCODE_ID,
  ]);
  db.query(
    queries.product_release.insert_product_release,
    [args.product_id, args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    [args.product_id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          parseInt(result[0].STORED_STOCK) - args.quantity,
          args.product_id,
        ]);
      }
    }
  );
};

const reduction_protocol = [type1_reduction, type2_reduction];

exports.reduction_engine = reduction_engine;
