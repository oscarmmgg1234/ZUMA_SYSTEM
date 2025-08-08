/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-15 09:20:36

 temp

*/

const fetchStoredStockQuery =
  "SELECT * FROM product_inventory WHERE PRODUCT_ID = ?";
const setTotalStockQuery =
  "UPDATE product_inventory SET STOCK = ? WHERE PRODUCT_ID = ?";

const normalizeStock = async (db_handle, args) => {

  console.log(args);
  const value = args.value;
  const product = args.product;

  // Assume 1:1 ratio if no value provided
  if (!value) return;

  if (args.option === "ratio") {
    const reciprocal = 1 / value;

    const [result] = await db_handle.raw(fetchStoredStockQuery, [product]);

    const stored_stock = result?.[0]?.STORED_STOCK;
    const active_stock = result?.[0]?.ACTIVE_STOCK;

    if (
      stored_stock === undefined ||
      stored_stock === null ||
      stored_stock < 0 ||
      active_stock === undefined ||
      active_stock == null ||
      active_stock < 0
    ) {
      throw new Error(
        "Stored stock not found or invalid for product: " + product
      );
    }

    const total_stock = stored_stock * reciprocal + active_stock;
    await db_handle.raw(setTotalStockQuery, [total_stock, product]);
  } else if (args.option == "default") {
    const [result] = await db_handle.raw(fetchStoredStockQuery, [product]);
    const stored_stock = result?.[0]?.STORED_STOCK;
    const active_stock = result?.[0]?.ACTIVE_STOCK;
    if (
      stored_stock === undefined ||
      stored_stock === null ||
      active_stock === undefined ||
      active_stock == null
    ) {
      throw new Error(
        "Stored stock not found or invalid for product: " + product
      );
    }

    const total_stock = stored_stock + active_stock;
    await db_handle.raw(setTotalStockQuery, [total_stock, product]);
  }
};

exports.normalizeStock = normalizeStock;
