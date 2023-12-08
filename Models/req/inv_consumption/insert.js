class inv_consumption {
  constructor(args) {
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
    this.QUANTITY = args.QUANTITY;
    this.PRODUCT_ID = args.PRODUCT_ID;
    this.REDUCTION_TYPE = args.REDUCTION_TYPE;
  }
}

const product_reduc = (args, callback) => {
  const obj = new inv_consumption(args);
  return callback(obj);
};

exports.product_reduc = product_reduc;
