/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-15 09:20:36

 temp

*/

const fetchStoredStockQuery =
  "SELECT STORED_STOCK FROM product_inventory WHERE PROUDUCT_ID = ?";
const setFetchTotalStockQuery =
  "UPDATE product_inventory SET TOTAL_STOCK = ? WHERE PRODUCT_ID = ?";

const normalizeStock = async (db_handle, args) => {
  const value = args.value;
  const product = args.product;

  // Assume 1:1 ratio if no value provided
  if (!value) return;

  if (args.option === "ratio") {
    const reciprocal = 1 / value;

    const [result] = await db_handle.raw(fetchStoredStockQuery, [product]);

    const stored_stock = result?.[0]?.STORED_STOCK;

    if (
      stored_stock === undefined ||
      stored_stock === null ||
      stored_stock < 0
    ) {
      throw new Error(
        "Stored stock not found or invalid for product: " + product
      );
    }

    const total_stock = stored_stock * reciprocal;

    await db_handle.raw(setFetchTotalStockQuery, [total_stock, product]);
  }
};

exports.normalizeStock = normalizeStock;
