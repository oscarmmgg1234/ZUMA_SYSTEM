const { db_interface } = require("../DB/interface");

const db_api = new db_interface();

filterProduct = async (products, inventoryMap) => {
  return new Promise((resolve) => {
    let output_product = [];
    products.forEach((product) => {
      if (inventoryMap.has(product.PRODUCT_ID)) {
        let inventory = inventoryMap.get(product.PRODUCT_ID);
        if (
          product.MIN_LIMIT !== null &&
          inventory.STORED_STOCK <= product.MIN_LIMIT
        ) {
          output_product.push({ ...product, stock: inventory });
        }
      }
    });
    resolve(output_product);
  });
};

const productAlert = async () => {
  const inventory = await db_api.inventory.getInventory();
  const products = await db_api.inventory.getProducts();
  const inventoryMap = new Map(
    inventory.map((item) => [item.PRODUCT_ID, item])
  );
  return await filterProduct(products, inventoryMap);
};

exports.productAlert = productAlert;
