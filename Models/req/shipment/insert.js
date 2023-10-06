class insert_shipment {
  constructor(args) {
    this.QUANTITY = args.QUANTITY;
    this.COMPANY_ID = args.COMPANY_ID;
    this.TYPE = args.TYPE;
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
    this.PRODUCT_ID = args.PRODUCT_ID;
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
  const data = new insert_shipment(args);
  return callback(data);
};

exports.insert_shipment_model = insert_shipment_model;
