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

class inv_consumption {
  constructor(args) {
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
    this.QUANTITY = args.QUANTITY;
    this.PRODUCT_ID = args.PRODUCT_ID;
    this.REDUCTION_TYPE = args.REDUCTION_TYPE;
    this.TRANSACTIONID = generateRandomID(8);
  }
}

const product_reduc = (args, callback) => {
  const obj = new inv_consumption(args);
  return callback(obj);
};

exports.product_reduc = product_reduc;
