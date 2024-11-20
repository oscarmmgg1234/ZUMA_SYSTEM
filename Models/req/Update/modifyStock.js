class modifyStock {
  constructor(args) {
    this.productID = args.PRODUCT_ID;
    this.quantity = typeof args.QUANTITY === "number" ? args.QUANTITY : 0;
    this.errorCauseType = args.errorCauseType;
    this.explanation = args.explanation;
    this.errorRangeDates = args.errorRangeDates;
    this.beforeUpdateStock = args.beforeUpdateStock;
    this.afterUpdateStock = args.afterUpdateStock;
    this.category = args.category;
  }
  to_arr() {
    return [this.productID];
  }
}

exports.modifyStock = (args, callback) => {
  return callback(new modifyStock(args));
};

//new expected input for new flow
// args = {args..., quantity, errorCauseType, explanation, errorRangeDates, beforeUpdateStock, afterUpdateStock, category, timeToDetectError}
//errorRangeDates = [start, end] datetime format obejects
//explanation = string
// beforeUpdateStock = float
// afterUpdateStock = float
//category = string
//timeToDetectError = float
//errorCauseType = "employee" or "operation"
