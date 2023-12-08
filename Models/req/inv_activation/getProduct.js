class getProduct {
  constructor(args) {
    this.TYPE = args.TYPE;
  }
  to_arr() {
    return [this.TYPE];
  }
}

const get_product_model = (args, callback) => {
  const data = new getProduct(args);
  return callback(data);
};

exports.get_product_model = get_product_model;
