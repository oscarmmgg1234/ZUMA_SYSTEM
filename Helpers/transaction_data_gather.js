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
    return "";
  }
  if (productSet.size === 1) {
    return `SELECT * FROM product_inventory WHERE product_id = ${
      productSet.values().next().value
    }`;
    //one product
  } else {
    let query = "SELECT * FROM product_inventory WHERE product_id IN (";
    for (const product of productSet) {
      query += `${product},`;
    }
    query = query.slice(0, -1);
    query += ")";
    return query;
    //more then one product
  }
};

const data_gather_handler = async (token, args, transactionID, action) => {
  //purpose to capture stock strace of product as process is executed for each product with each protocol for error detection and overall see flow of stock of a particular product
  const query = productQuery(productParse(token));
  if (!query) {
    return 1;
  }
  try {
    //more efficient approach would be single query to get all stock of all products in one go
    const productStock = await knex.raw(query);
    const db_object = productStock[0].map((product) => {
      return {
        product_id: product.PRODUCT_ID,
        stock: product.STOCK,
      };
    });

    if (action === "start") {
      await knex.raw(
        "UPDATE transaction_log SET before_stocks = ? WHERE transaction_id = ?",
        [JSON.stringify(db_object), transactionID]
      );

      //submit a json object corresponding to stock of every item to the transaction id to the stock before column
    } else {
      await knex.raw(
        "UPDATE transaction_log SET after_stocks = ? WHERE transaction_id = ?",
        [JSON.stringify(db_object), transactionID]
      );
      //submit a json object corresponding to stock of every item to the transaction id to the stock after column
    }
  } catch (err) {
    console.log(err);
    return 1;
  }
  return 0;
};

exports.data_gather_handler = data_gather_handler;
