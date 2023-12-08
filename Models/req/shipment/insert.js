class insert_shipment {
  constructor(args) {
    this.QUANTITY = args.QUANTITY;
    this.COMPANY_ID = args.COMPANY_ID;
    this.TYPE = args.TYPE;
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
    this.PRODUCT_ID = args.PRODUCT_ID;
    this.SHIPMENT_TYPE = args.SHIPMENT_TYPE;
  }
  to_arr() {
    return [
      this.QUANTITY,
      this.COMPANY_ID,
      this.TYPE,
      this.EMPLOYEE_ID,
      this.PRODUCT_ID,
    ];
  }
}

const insert_shipment_model = (args, callback) => {
  const shipmentObject = args.map((arg) => {
    return new insert_shipment(arg);
  });
  return callback(shipmentObject);
};

exports.insert_shipment_model = insert_shipment_model;
