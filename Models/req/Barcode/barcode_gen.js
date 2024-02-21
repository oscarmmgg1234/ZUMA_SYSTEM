function generateRandomID(length) {
  // Create a random ID with a specified length
  let result = "";
  // Define the characters that can be included in the ID
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    // Append a random character from the characters string
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

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
    this.TRANSACTIONID = args.TRANSACTIONID
      ? args.TRANSACTIONID
      : generateRandomID(12);
  }
  validate() {
    return;
  }
}

class parseBarcode {
  constructor(args) {
    this.EMPLOYEE_RESPONSIBLE = args.employee;
    const arg_arr = args.barcode.split(">");
    this.BARCODE_ID = arg_arr[0] ? arg_arr[0] : 0;
    this.TRANSACTIONID = arg_arr[1] ? arg_arr[1] : 0;
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
