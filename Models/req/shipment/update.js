class shipment_update {
  constructor(args) {
    this.SHIPMENT_ID = args.SHIPMENT_ID;
    this.QUANTITY = args.QUANTITY;
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
  }
  to_arr() {
    return [this.QUANTITY, this.EMPLOYEE_ID, this.SHIPMENT_ID];
  }
}

const shipment_update_model = (args, callback) => {
  const data = new shipment_update(args);
  return callback(data);
};

exports.shipment_update_model = shipment_update_model;
