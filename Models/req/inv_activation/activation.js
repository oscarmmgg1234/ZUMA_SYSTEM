class product_inventory {
  constructor(args) {
    this.PRODUCT_ID = args.PRODUCT_ID;
    this.QUANTITY = args.QUANTITY;
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
  }
  to_arr() {
    return [this.PRODUCT_ID, this.QUANTITY, this.EMPLOYEE_ID];
  }
}

const product_inventory_model = (args, callback) => {
  const data = new product_inventory(args);
  return callback(data);
};

exports.product_activation_model = product_inventory_model;
