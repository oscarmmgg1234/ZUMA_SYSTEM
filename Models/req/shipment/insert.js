function generateShortString(length) {
  const characters = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

class insert_shipment {
  constructor(args) {
    this.SHIPMENT_ID = generateShortString(6);
    this.QUANTITY = args.QUANTITY;
    this.SHIPMENT_DATE = new Date();
    this.COMPANY_ID = args.COMPANY_ID;
    this.TYPE = args.TYPE;
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
    this.PRODUCT_ID = args.PRODUCT_ID;
  }
  to_arr() {
    return [
      this.SHIPMENT_ID,
      this.QUANTITY,
      this.SHIPMENT_DATE,
      this.COMPANY_ID,
      this.TYPE,
      this.EMPLOYEE_ID,
      this.PRODUCT_ID,
    ];
  }
}

const insert_shipment_model = (args, callback) => {
  const data = new insert_shipment(args);
  return callback(data);
};

exports.insert_shipment_model = insert_shipment_model;
