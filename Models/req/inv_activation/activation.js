
const fixed_look_up = (productType, productSize) => {
  if(productType == 122){
    //liquid 
    if(productSize == 3 || 1){
      //50 ml fixed num  
    }
    if(productSize == 2 || 4) {
      //30 ml
    }
    if(productSize == 9 || 10){
      //60 ml
    }
    else{
      //fulvic foir example
      return null;
    }
    
  }
  if(productType == 44){
    if(productSize == 5){
      //use subcomponenttype to get size
      //return fixed box value
    }
    if(productSize == 6)
    {

    }
    if(productSize == 7){
      
    }
    else{
      return null;
      //matcha similar products will be direct quantity
    }
    //pills
  }
}


class product_inventory {
  constructor(args) {
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
    this.PRODUCT_ID = args.PRODUCT_ID;
    this.PRODUCT_NAME = args.PRODUCT_NAME;
    this.QUANTITY = parseInt(args.QUANTITY);
    this.MULTIPLIER = args.MULTIPLIER;
    this.EMPLOYEE_NAME = args.EMPLOYEE_NAME;
    this.PRODUCT_TYPE  = args.PRODUCT_TYPE;
    this.PRODUCT_FIXED = args.PRODUCT_FIXED;
    this.quantityHandler();
  }

  quantityHandler(){
    if(this.PRODUCT_FIXED == true){
      this.QUANTITY = fixed_look_up(this.PRODUCT_TYPE, this.PRODUCT_SUBCOMP) != null ? fixed_look_up(this.PRODUCT_TYPE, this.PRODUCT_SUBCOMP) : this.QUANTITY;
    }
  }

  // to_arr() {
  //   return [this.PRODUCT_ID, this.QUANTITY, this.EMPLOYEE_ID];
  // }
}

const product_inventory_model = (args, callback) => {
  const data = new product_inventory(args);
  return callback(data);
};

exports.product_activation_model = product_inventory_model;
