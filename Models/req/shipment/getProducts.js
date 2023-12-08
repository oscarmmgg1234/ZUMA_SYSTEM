class getProducts {
  constructor(args) {
    this.COMPANY_ID = args.COMPANY_ID;
  }
}

const get_products = (args, callback) => {
  const data = new getProducts(args);
  return callback(data);
};

exports.getProductsByCompany = get_products;
