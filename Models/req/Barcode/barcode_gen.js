class Barcode {
  constructor(args) {
    this.product_id = args.PRODUCT_ID;
    this.employee = args.NAME != "" ? args.NAME : "NULL";
    this.quantity = args.QUANTITY;
    this.multiplier = args.MULTIPLIER;
    this.product_name = args.PRODUCT_NAME;
    this.employee_id = args.EMPLOYEE_ID != "" ? args.EMPLOYEE_ID : "NULL";
    this.id = Math.floor(Math.random() * 1000000000);
    this.src = args.SRC;
  }
  validate() {
    return;
  }
}

class parseBarcode {
  constructor(args) {
    this.EMPLOYEE_RESPONSIBLE = args.employee;
    const arg_arr = args.barcode.split(">");
    this.EMPLOYEE_ID = arg_arr[0];
    this.PRODUCT_ID = arg_arr[1];
    this.QUANTITY = arg_arr[2];
    this.BARCODE_ID = arg_arr.length > 3 ? arg_arr[3] : null;
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
};

exports.barcode_gen = barcode_gen;
exports.parseBCode = parse_barcode;
