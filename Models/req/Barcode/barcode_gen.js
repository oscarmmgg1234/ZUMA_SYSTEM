

class Barcode {
  constructor(args) {
    this.product_id = args.PRODUCT_ID;
    this.employee = args.NAME != "" ? args.NAME : "NULL";
    this.quantity = args.QUANTITY;
    this.multiplier = args.MULTIPLIER;
    this.product_name = args.PRODUCT_NAME;
  }
  validate() {
    return 
  }
}

const barcode_gen = (args, callback) => {
  
  const data = new Barcode(args);
  return callback(data);
};

exports.barcode_gen = barcode_gen;
