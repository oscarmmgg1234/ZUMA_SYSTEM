class Activation_Product_Info {
  constructor(args) {
    this.activation_products = args.map((obj) => {
      return { PRODUCT_ID: obj.PRODUCT_ID, NAME: obj.NAME, ACTIVATION_TOKEN: obj.ACTIVATION_TOKEN };
    });
  }
}

const activation_products_data = (args, callback) => {
  const get_activation_data = new Activation_Product_Info(args);
  return callback(get_activation_data);
};

exports.activation_products_data = activation_products_data;
