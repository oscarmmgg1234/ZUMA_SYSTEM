const { query_manager } = require("../../DB/query_manager");

const knex = query_manager;

const handler = async (output) => {
  for (let commit of output) {
    if(!commit) continue;
    console.log("Committing token for product:", commit?.id ? commit.id : "null obeject");
    await knex.raw(
      "UPDATE product SET REDUCTION_TOKEN = ? WHERE PRODUCT_ID = ?",
      [commit.token, commit.id]
    );
  }
};

const translateAndGenerateToken = async () => {
  const products = await knex.raw("SELECT * FROM product");
  const shipmentProducts = products[0].filter(
    (product) => product.REDUCTION_TYPE > 0
  );
  const output = shipmentProducts.map((product) => {
    if (product.REDUCTION_TYPE === 1) {
      return {
        name: product.NAME,
        token: `BC:9ied BC:549d BC:93je CM:50wk:${product.PRODUCT_ID} CMUP:13g4:${product.PRODUCT_ID}`,
        id: product.PRODUCT_ID,
      };
    }
    if (product.REDUCTION_TYPE === 2) {
      return {
        name: product.NAME,
        token: `BC:9ied BC:549d BC:93je CM:50wk:${product.PRODUCT_ID} CMUP:10fj:${product.PRODUCT_ID}`,
        id: product.PRODUCT_ID,
      };
    } else {
      return null;
    }
  });
  // Remove null values from the array
  
  await handler(output);
  console.log("Translation and token generation complete for shipment");
};

module.exports = translateAndGenerateToken;
