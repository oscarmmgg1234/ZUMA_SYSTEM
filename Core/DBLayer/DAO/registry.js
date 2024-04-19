class db_reg_handler {
  constructor() {}
  getFunction(key, id) {
    if (key == "AC") {
      return this.activation_reg.get(id);
    }
    if (key == "RD") {
      return this.reduction_reg.get(id);
    }
    if (key == "SH") {
      return this.shipment_reg.get(id);
    }
    if (key == "UP") {
      return this.update_reg.get(id);
    }
  }
  activation_reg = new Map();
  reduction_reg = new Map();
  shipment_reg = new Map();
  update_reg = new Map();
}
//id is a rando number between 1 and 99999
const db_registry = new db_reg_handler();

//activation registry db
db_registry.activation_reg.set("00321", (db_handle, args, value, custom) => {
  //Insert Row for Activation Log
  db_handle.raw(
    "INSERT INTO inventory_activation (PRODUCT_ID, QUANTITY, EMPLOYEE_ID, TRANSACTIONID) VALUES (?, ?, ?, ?)"
  );
});

exports.db_registry = db_registry;
