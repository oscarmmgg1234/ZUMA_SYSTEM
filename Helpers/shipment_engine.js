const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");

const shipment_engine = (args) => {
  const newArgs = {
    quantity: args.QUANTITY,
    company_id: args.COMPANY_ID,
    type: args.TYPE,
    employee_id: args.EMPLOYEE_ID,
    product_id: args.PRODUCT_ID,
    shipment_type: args.SHIPMENT_TYPE,
    arr: args.to_arr(),
  };
  shipment_protocol.forEach((protocol, index) => {
    if (args.SHIPMENT_TYPE == index + 1) {
      protocol(newArgs);
    }
  });
};

type1_shipment = (args) => {
  //update stored quantity

  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    [args.product_id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_activation_stored, [
          result[0].STORED_STOCK + args.quantity,
          args.product_id,
        ]);
      }
    }
  );
  //insert shipment log
  db.query(queries.shipment_log.insert, args.arr, (err) => {
    console.log(err);
  });
};

const shipment_protocol = [type1_shipment];

exports.shipment_engine = shipment_engine;
