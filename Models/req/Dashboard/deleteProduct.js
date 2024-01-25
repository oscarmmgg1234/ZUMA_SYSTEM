class deleteProduct {
  constructor(args) {
    this.productID = args.productID;
  }
  to_arr() {
    return [this.productID];
  }
}

exports.deleteProduct = (args, callback) => {
  return callback(new deleteProduct(args));
};
