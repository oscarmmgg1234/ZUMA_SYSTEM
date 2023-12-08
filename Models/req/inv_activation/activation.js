class product_inventory {
  constructor(args) {
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
    this.PRODUCT_ID = args.PRODUCT_ID;
    this.PRODUCT_NAME = args.PRODUCT_NAME;
    this.QUANTITY = parseInt(args.QUANTITY);
    this.MULTIPLIER = args.MULTIPLIER;
    this.EMPLOYEE_NAME = args.EMPLOYEE_NAME;
  }

  // to_arr() {
  //   return [this.PRODUCT_ID, this.QUANTITY, this.EMPLOYEE_ID];
  // }
}

const product_inventory_model = (args, callback) => {
  const data = new product_inventory(args);
  return callback(data);
};

exports.product_activation_model = product_inventory_model;
