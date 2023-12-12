

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

class parseBarcode {
  
  constructor(args) {
        const arg_arr = args.barcode.split(">");
        this.EMPLOYEE_ID = arg_arr[0];
        this.PRODUCT_ID = arg_arr[1];
        this.QUANTITY = arg_arr[2];
  }
  to_arr() {
    return [this.PRODUCT_ID];
  }
}



const barcode_gen = (args, callback) => {
  
  const data = new Barcode(args);
  return callback(data);
};

const parse_barcode = (args, callback) => {
  const data = new parseBarcode(args);
  return callback(data);
}

exports.barcode_gen = barcode_gen;
exports.parseBCode = parse_barcode;
