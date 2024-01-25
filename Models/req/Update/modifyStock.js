class modifyStock {
  constructor(args) {
    this.productID = args.PRODUCT_ID;
    this.quantity = typeof args.QUANTITY === "number" ? args.QUANTITY : 0;
  }
  to_arr() {
    return [this.productID];
  }
}

exports.modifyStock = (args, callback) => {
  return callback(new modifyStock(args));
};
