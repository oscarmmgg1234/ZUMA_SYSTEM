// const fixed_look_up = (productType, productSize) => {
//   if(productType == 122){
//     //liquid
//     if(productSize == 3 || 1){
//       //50 ml fixed num
//       return
//     }
//     if(productSize == 2 || 4) {
//       //30 ml
//       return
//     }
//     if(productSize == 9 || 10){
//       //60 ml
//       return
//     }
//     else{
//       //fulvic foir example
//       return null;
//     }

//   }
//   if(productType == 44){
//     if(productSize == 5){
//       //use subcomponenttype to get size
//       //return fixed box value
//       return
//     }
//     if(productSize == 6)
//     {
// return
//     }
//     if(productSize == 7){
//       return
//     }
//     else{
//       return null;
//       //matcha similar products will be direct quantity
//     }
//     //pills
//   }
// }

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

class product_inventory {
  constructor(args) {
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
    this.PRODUCT_ID = args.PRODUCT_ID;
    this.PRODUCT_NAME = args.PRODUCT_NAME;
    this.QUANTITY = parseInt(args.QUANTITY);
    this.MULTIPLIER = args.MULTIPLIER;
    this.EMPLOYEE_NAME = args.EMPLOYEE_NAME;
    this.TRANSACTIONID = generateRandomID(12);
  }

  // quantityHandler(){
  //   if(this.PRODUCT_FIXED == true){
  //     this.QUANTITY = fixed_look_up(this.PRODUCT_TYPE, this.PRODUCT_SUBCOMP) != null ? fixed_look_up(this.PRODUCT_TYPE, this.PRODUCT_SUBCOMP) : this.QUANTITY;
  //   }
  to_arr() {
    return [this.PRODUCT_ID, this.QUANTITY, this.EMPLOYEE_ID];
  }
}

const product_inventory_model = (args, callback) => {
  const data = new product_inventory(args);
  return callback(data);
};

exports.product_activation_model = product_inventory_model;
