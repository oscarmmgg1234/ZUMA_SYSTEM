const { Constants } = require("../../../Constants/Tools_Interface.js");
const constants = new Constants();

class Barcode {
  constructor(args) {
    this.product_id = args.PRODUCT_ID;
    this.employee = args.NAME != "" ? args.NAME : "NULL";
    this.quantity = args.QUANTITY;
    this.multiplier = args.MULTIPLIER;
    this.product_name = args.PRODUCT_NAME;
    this.employee_id = args.EMPLOYEE_ID != "" ? args.EMPLOYEE_ID : "NULL";
    this.id = constants.generateRandomID(8);
    this.src = args.SRC;
    this.TRANSACTIONID = args.TRANSACTIONID
      ? args.TRANSACTIONID
      : constants.generateRandomID(8);
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
    this.newTransactionID = constants.generateRandomID(8);
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
