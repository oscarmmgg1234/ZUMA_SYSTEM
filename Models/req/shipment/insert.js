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

class insert_shipment {
  constructor(args) {
    this.QUANTITY = args.QUANTITY;
    this.COMPANY_ID = args.COMPANY_ID;
    this.TYPE = args.TYPE;
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
    this.PRODUCT_ID = args.PRODUCT_ID;
    this.PRODUCT_NAME = args.PRODUCT_NAME;
    this.TRANSACTIONID = generateRandomID(8);
    this.process_token = args.PROCESS_TOKEN;
  }
  to_arr() {
    return [
      this.QUANTITY,
      this.COMPANY_ID,
      this.TYPE,
      this.EMPLOYEE_ID,
      this.PRODUCT_ID,
      this.TRANSACTIONID,
    ];
  }
}

const insert_shipment_model = (args, callback) => {
  const shipmentObject = args.map((arg) => {
    return new insert_shipment(arg);
  });
  return callback(shipmentObject);
};

exports.insert_shipment_model = insert_shipment_model;
