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

const data_gather_handler = async (token, args, transactionID, action) => {
//purpose to capture stock strace of product as process is executed for each product with each protocol for error detection and overall see flow of stock of a particular product
  const productDataGather = new Map();
  const productSet = productParse(token);
  try {
    for (const product of productSet) {
      const productStock = await knex.raw(
        "SELECT STOCK FROM product_inventory WHERE PRODUCT_ID = ?",
        [product]
      );
      productDataGather.set(product, productStock[0][0].STOCK);
    }
    const productData = Array.from(productDataGather.entries());
    if (action === "start") {
        
      //submit a json object corresponding to stock of every item to the transaction id to the stock before column
    } else {
        
      //submit a json object corresponding to stock of every item to the transaction id to the stock after column
    }
  } catch (err) {
    console.log(err);
    return 0;
  }
  return 1;
};


exports.data_gather_handler = data_gather_handler;