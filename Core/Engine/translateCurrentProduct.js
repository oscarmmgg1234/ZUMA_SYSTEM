const { query_manager } = require("../../DB/query_manager");

const knex = query_manager;

const handler = async (output) => {
  for (let commit of output) {
    if (!commit) continue;
    console.log(
      "Committing token for product:",
      commit?.id ? commit.id : "null obeject"
    );
    await knex.raw(
      "UPDATE product SET ACTIVATION_TOKEN = ? WHERE PRODUCT_ID = ?",
      [commit.token, commit.id]
    );
  }
};

const translateAndGenerateToken = async () => {
  const products = await knex.raw("SELECT * FROM product");
  const shipmentProducts = products[0].filter(
    (product) => product.TYPE == "44" || product.TYPE == "122"
  );
  console.log("Shipment products:", shipmentProducts.length);
  const output = shipmentProducts.map((product) => {
    if (product.PROCESS_TYPE == 1) {
      return {
        name: product.NAME,
        token: `AC:1023:${product.PRODUCT_ID} RD:10fd:${product.PRODUCT_ID} UP:23hs:${product.PRODUCT_ID} UP:2j3w:${product.PRODUCT_ID}`,
        id: product.PRODUCT_ID,
      };
    } else {
      return null;
    }
  });
  // Remove null values from the array

  //await handler(output);
  console.log("Translation and token generation complete for shipment");
};

module.exports = translateAndGenerateToken;

