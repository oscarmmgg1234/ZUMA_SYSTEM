/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-08-11 10:11:22

 temp

*/
const { normalizeStock } = require("./StockNormalizer");

exports.firstStageNormal = async (db_handle, args, value, auxiliary) => {
  const poolID = auxiliary.auxiliaryParam;
  const mainProductID = value;
  if (!poolID) {
    return false;
  }
  const pool = await db_handle.raw(
    "SELECT * from inv_virtual_stock WHERE poolID = ?",
    [poolID]
  );
  const poolData = pool[0][0];
  const linked_products = JSON.parse(poolData.LINKED_PRODUCTS);
  const mainProductProcess = linked_products.filter(
    (item) => item.productID == mainProductID
  );
  if (mainProductProcess.length < 1) {
    return false;
  }
  await db_handle.raw(
    "UPDATE inv_virtual_stock SET VIRTUAL_STOCK = VIRTUAL_STOCK + ? WHERE poolID = ?",
    [args.QUANTITY, poolID]
  );
    const sharedStock = await db_handle.raw(
      "SELECT * from inv_virtual_stock WHERE poolID = ?",
      [poolID]
    );

    return {
      stock: sharedStock[0][0].VIRTUAL_STOCK,
      linked_products,
      poolID,
      mainProductID,
    };
};

exports.firstStagePill = async (db_handle, args, value, auxiliary) => {
  //update virtual stock
  const poolID = auxiliary.auxiliaryParam;
  if (!poolID) {
    return false;
  }
  const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;

  const mainProductID = value;

  const pool = await db_handle.raw(
    "SELECT * from inv_virtual_stock WHERE poolID = ?",
    [poolID]
  );

  const poolData = pool[0][0];
  const linked_products = JSON.parse(poolData.LINKED_PRODUCTS);
  const mainProductProcess = linked_products.filter(
    (item) => item.productID == mainProductID
  );

  if (mainProductProcess.length < 1) {
    return false;
  }

  await db_handle.raw(
    "UPDATE inv_virtual_stock SET VIRTUAL+STOCK = STOCK - ? WHERE poolID = ?",
    [
      auxiliary.nextAuxiliaryParam
        ? mainProductProcess[0].normalizeRatio * args.QUANTITY * multiplier
        : args.QUANTITY * multiplier,
      poolID,
    ]
  );

  const sharedStock = await db_handle.raw(
    "SELECT * from inv_virtual_stock WHERE poolID = ?",
    [poolID]
  );

  return {
    stock: sharedStock[0][0].VIRTUAL_STOCK,
    linked_products,
    poolID,
    mainProductID,
  };
};

exports.secondStage = async (db_handle, args) => {
  //checks if product exist
  //then updates stored stock for all products
  //then normalize the stock of every product
  const poolID = args.poolID;
  const shared_stock = args.stock;
  const linked_products = args.linked_products;
  if (linked_products.length < 1) {
    return;
  }

  const checkProductExist = "SELECT * from product WHERE PRODUCT_ID = ?";
  const sanitizedLinkedProducts = [];
  for (const item of linked_products) {
    const exist = await db_handle.raw(checkProductExist, [item.productID]);
    if (exist[0].length > 0) {
      sanitizedLinkedProducts.push(item);
    }
  }
  //sanitize and then update the linked product to remove any products frontend in aciddently somehow pushed undefined products
  await db_handle(
    "UPDATE inv_virtual_stock SET LINKED_PRODUCTS = ? WHERE poolID = ?",
    [JSON.stringify(sanitizedLinkedProducts), poolID]
  );

  for (const linkedProduct of sanitizedLinkedProducts) {
    const product_id = linkedProduct.productID;
    await db_handle.raw(
      "UPDATE product_inventory SET STORED_STOCK = ? where PRODUCT_ID = ?",
      [shared_stock, product_id]
    );
    await normalizeStock(db_handle, {
      product: product_id,
      value: linkedProduct.normalizeRatio,
      option: "ratio",
    });
  }
  return true;
};
