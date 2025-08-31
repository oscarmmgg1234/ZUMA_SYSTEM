// transaction_revert_engine.js
const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");
const { query_manager } = require("../DB/query_manager.js");
const { tokenParser } = require("../Core/Engine/Token/tokenParser.js");
const { normalizeStock } = require("../Core/Utility/StockNormalizer.js");
const { publishProcessEvent } = require("../Services/Publisher/mqPublisher.js");

const knex = query_manager;

const postops = "POSTOPS";
const virtualops = "VIRTUALOPS";

/** Normalize empty-string tokens to null for safer parsing */
const nz = (t) => (typeof t === "string" && t.trim() === "" ? null : t);

/** Handler that will handle virtual operations */
const virtualOpsHandler = async (db_handle, args) => {
  const poolID = args.poolID;
  const productID = args.productID;

  const setVirtual = `UPDATE inv_virtual_stock SET VIRTUAL_STOCK = VIRTUAL_STOCK ${
    args.isShipment ? "-" : "+"
  } ? WHERE poolID = ?`;
  const getVirtual = `SELECT * FROM inv_virtual_stock WHERE poolID = ?`;

  const pool = await db_handle.raw(getVirtual, [poolID]);
  const poolData = pool?.[0]?.[0];
  if (!poolData) throw new Error("Virtual pool not found.");

  const linkedProducts = JSON.parse(poolData.LINKED_PRODUCTS || "[]");
  const linked_product = linkedProducts.filter(
    (item) => item.productID == productID
  );
  if (linked_product.length < 1) {
    throw new Error("Product not found in linked products.");
  }

  const ratio = linked_product[0].normalizeRatio;
  const quantity = args.quantity;

  await db_handle.raw(setVirtual, [
    args.isShipment ? quantity : ratio * quantity,
    poolID,
  ]);

  const finalStock = await db_handle.raw(getVirtual, [poolID]);

  const updateProductStock = `UPDATE product_inventory SET STORED_STOCK = ? WHERE PRODUCT_ID = ?`;

  for (const item of linkedProducts) {
    await db_handle.raw(updateProductStock, [
      finalStock?.[0]?.[0]?.VIRTUAL_STOCK ?? 0,
      item.productID,
    ]);
    await normalizeStock(db_handle, {
      product: item.productID,
      value: item.normalizeRatio,
      option: "ratio",
    });
  }
};

const historyLog = async (db_handle, transaction_stack, table, column) => {
  const output = [];
  let outputDeterminent = false;

  for (const item of transaction_stack ?? []) {
    const response = await db_handle.raw(
      `SELECT * FROM ${table} WHERE ${column} = ?`,
      [item]
    );
    const row = response?.[0]?.[0];
    if (!row) continue;

    if (row?.ORIGIN === "activation") {
      outputDeterminent = true;
    }
    output.push({
      product: row.PRODUCT_ID,
      value: row.QUANTITY,
      origin: row?.ORIGIN,
    });
  }
  return { output, outputDeterminent };
};

const updateProductStock = async (
  db_handle,
  product,
  value,
  operation,
  column,
  origin = null
) => {
  // When origin === "release", adjust STORED_STOCK; else ACTIVE_STOCK
  const resolvedColumn = !origin
    ? column
    : origin === "release"
    ? "STORED_STOCK"
    : "ACTIVE_STOCK";

  await db_handle.raw(
    `UPDATE product_inventory SET ${resolvedColumn} = ${resolvedColumn} ${operation} ${value} WHERE PRODUCT_ID = ?`,
    [product]
  );
};

/**
 * Parse tokens into normalization/virtual-ops descriptors.
 * Always returns an array (possibly empty) so callers can safely iterate.
 */
const normalizeProducts = (token, transQuantity) => {
  if (!token) return [];
  const tokens = tokenParser(token);
  const output = [];

  for (let i = 0; i < tokens.size; i++) {
    const current = tokens.getData();

    if (current.key === virtualops) {
      const isPill = current.id === "4i57";
      // pill => add to virtual; shipment => subtract
      output.push({
        isVirtualOps: true,
        payload: {
          isShipment: !isPill,
          productID: current.value,
          quantity: transQuantity,
          poolID: current.auxiliaryParam,
        },
      });
    }

    if (current.key === postops) {
      output.push({
        product: current.value,
        value: parseFloat(current.auxiliaryParam),
        option: "ratio",
      });
    } else if (current.key === "UP" || current.key === "CMUP") {
      output.push({
        product: current.value,
        value: 1,
        option: "default",
      });
    }

    tokens.next();
  }
  return output;
};

const transaction_engine = async (args) => {
  const response = await knex.raw(
    queries.development.getTransactionByID,
    args.to_arr()
  );

  // this holds the item quantity for the transaction
  const transactionQuantity = response?.[0]?.[0]?.QUANTITY || 1;
  const mainProduct = response?.[0]?.[0]?.PRODUCT_ID;

  const transactionProduct = await knex.raw(
    "SELECT * FROM product WHERE PRODUCT_ID = ?",
    response?.[0]?.[0]?.PRODUCT_ID
  );

  // transactionID stacks in the transaction
  const activation = JSON.parse(response?.[0]?.[0]?.ACTIVATION_STACK || "[]");
  const release = JSON.parse(response?.[0]?.[0]?.RELEASE_STACK || "[]");
  const shipment = JSON.parse(response?.[0]?.[0]?.SHIPMENT_STACK || "[]");
  const barcode = JSON.parse(response?.[0]?.[0]?.BARCODE_STACK || "[]");
  const transStatus = JSON.parse(response?.[0]?.[0]?.REVERSED || "0");

  // Get the tokens from the product (may be empty strings/null)
  const activation_token = nz(transactionProduct?.[0]?.[0]?.ACTIVATION_TOKEN);
  const reduction_token = nz(transactionProduct?.[0]?.[0]?.REDUCTION_TOKEN);
  const shipment_token = nz(transactionProduct?.[0]?.[0]?.SHIPMENT_TOKEN);

  let ContainsVirtualFunction = false;

  const activationRevertNormalizationList = normalizeProducts(
    activation_token,
    transactionQuantity
  );
  const reductionRevertNormalizationList = normalizeProducts(
    reduction_token,
    transactionQuantity
  );
  const shipmentRevertNormalizationList = normalizeProducts(
    shipment_token,
    transactionQuantity
  );

  for (const item of activationRevertNormalizationList ?? []) {
    if (item?.isVirtualOps) ContainsVirtualFunction = true;
  }
  for (const item of reductionRevertNormalizationList ?? []) {
    if (item?.isVirtualOps) ContainsVirtualFunction = true;
  }
  for (const item of shipmentRevertNormalizationList ?? []) {
    if (item?.isVirtualOps) ContainsVirtualFunction = true;
  }

  // already reversed?
  if (transStatus === 1) return;

  try {
    await knex.transaction(async (trx) => {
      try {
        // === ACTIVATION REVERSAL ===
        if ((activation ?? []).length > 0) {
          const historyQuantities = await historyLog(
            trx,
            activation,
            "inventory_activation",
            "ACTIVATION_ID"
          );

          for (const item of historyQuantities.output ?? []) {
            await updateProductStock(
              trx,
              item.product,
              item.value,
              "-",
              "ACTIVE_STOCK"
            );
          }

          for (const item of activationRevertNormalizationList ?? []) {
            await normalizeStock(trx, item);
          }
        }

        // === RELEASE (CONSUMPTION) REVERSAL ===
        if ((release ?? []).length > 0) {
          const historyQuantities = await historyLog(
            trx,
            release,
            "inventory_consumption",
            "CONSUMP_ID"
          );

          for (const item of historyQuantities.output ?? []) {
            await updateProductStock(
              trx,
              item.product,
              item.value,
              "+",
              "ACTIVE_STOCK",
              item.origin
            );
          }

          const listForRelease = historyQuantities.outputDeterminent
            ? reductionRevertNormalizationList
            : activationRevertNormalizationList;

          for (const item of listForRelease ?? []) {
            if (
              ContainsVirtualFunction &&
              item?.payload?.productID === mainProduct
            ) {
              await virtualOpsHandler(trx, item.payload);
              continue;
            }
            await normalizeStock(trx, item);
          }
        }

        // === SHIPMENT REVERSAL ===
        if ((shipment ?? []).length > 0) {
          const historyQuantities = await historyLog(
            trx,
            shipment,
            "shipment_log",
            "SHIPMENT_ID"
          );

          for (const item of historyQuantities.output ?? []) {
            await updateProductStock(
              trx,
              item.product,
              item.value,
              "-",
              "STORED_STOCK"
            );
          }

          for (const item of shipmentRevertNormalizationList ?? []) {
            if (
              ContainsVirtualFunction &&
              item?.payload?.productID === mainProduct
            ) {
              await virtualOpsHandler(trx, item.payload);
              continue;
            }
            await normalizeStock(trx, item);
          }
        }

        // Notify
        await publishProcessEvent({
          type: "revert",
          transactionID: args.transactionID,
        });

        // transform barcodes back to active/passive
        for (const item of barcode ?? []) {
          await trx.raw(queries.dashboard.transform_barcode_product, [
            "Active/Passive",
            item,
          ]);
        }

        // mark transaction reversed
        await trx.raw(
          queries.development.setTransactionReversed,
          args.to_arr()
        );
      } catch (err) {
        throw err;
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.transaction_engine = transaction_engine;
