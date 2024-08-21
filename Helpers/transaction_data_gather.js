const { query_manager } = require("../DB/query_manager.js");

const knex = query_manager;

const productParse = (token) => {
  let productSet = new Set();
  const tokens = token.split(" ");
  for (const token of tokens) {
    const tokenSplit = token.split(":");
    if (tokenSplit[2]) {
      productSet.add(tokenSplit[2]);
    }
  }
  //return unique product ids for invetory capture for al main protocols(activation, reduction, shipment)
  return productSet;
};

const productQuery = (productSet) => {
  if (productSet.size === 0) {
    return;
  }
  if(productSet.size === 1){
    //one product
  }else{
    //more then one product
  }

}

const data_gather_handler = async (token, args, transactionID, action) => {
  //purpose to capture stock strace of product as process is executed for each product with each protocol for error detection and overall see flow of stock of a particular product
  const productDataGather = new Map();
  const productSet = productParse(token);
  if (productSet.size === 0) {
    return 0;
  }
  const productQuery = productQuery(productSet);
  try {
    //more efficient approach would be single query to get all stock of all products in one go
      const productStock = await knex.raw(
        productQuery
      );
      productStock[0].forEach((product) => {
      productDataGather.set(product, productStock[0][0].STOCK);
      });
    const productData = Array.from(productDataGather.entries());
    if (action === "start") {
      await knex.raw(
        "INSERT INTO transaction_log (before_stocks) WHERE TRANSACTION_ID = ? VALUES(?)",
        [transactionID, JSON.stringify(productData)]
      );

      //submit a json object corresponding to stock of every item to the transaction id to the stock before column
    } else {
      await knex.raw(
        "INSERT INTO transaction_log (after_stocks) WHERE TRANSACTION_ID = ? VALUES(?)",
        [transactionID, JSON.stringify(productData)]
      );
      //submit a json object corresponding to stock of every item to the transaction id to the stock after column
    }
  } catch (err) {
    console.log(err);
    return 0;
  }
  return 1;
};

exports.data_gather_handler = data_gather_handler;
