/*
  Author: Oscar Maldonado
  Email:  oscarmmgg1234@gmail.com
  Creation Date: 2025-08-14 09:44:12

  Module: Virtual Stock Pool Admin

  ── ExamplePacket (inputs this module expects) ──────────────────────────────
  {
    "poolID": "32e4d01f-9b57-400f-a0ae-4120416806ec",
    "poolName": "Probiotic Reservoir A",
    "initStock": 120,                   // number
    "productID": "A03E1DD4",
    "normalizeRatio": 1                 // number (defaults to 1)
  }
  ───────────────────────────────────────────────────────────────────────────
*/

"use strict";

/* ===========================
   Internal helpers (not exported)
   =========================== */

const ok = (message, data = null) => ({ success: true, message, data });
const fail = (message, err = null) => ({ success: false, message, err });

const safeJson = (value, fallback = []) => {
  try {
    const v = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
};

const removeProductPoolRefs = async (db, args) => {
  try {
    const { poolID } = args;
    const poolRes = await getPool(db, poolID);
    if (!poolRes.success) return poolRes;

    const links = poolRes.data.LINKED_PRODUCTS || [];
    const sql = "UPDATE product SET poolRef = ? WHERE PRODUCT_ID = ?";

    for (const p of links) {
      await db.raw(sql, [null, p.productID]);
    }
    return ok("Pool references removed successfully.");
  } catch (error) {
    return fail("No linked products found or error occurred.", error.message);
  }
};

/** Get a pool row with parsed LINKED_PRODUCTS */
const getPool = async (db, poolID) => {
  try {
    const sql = "SELECT * FROM inv_virtual_stock WHERE poolID = ?";
    const res = await db.raw(sql, [poolID]);
    const rows = res?.[0] ?? [];
    if (rows.length === 0) return fail("Pool not found");

    const row = rows[0];
    const parsedLinked = safeJson(row.LINKED_PRODUCTS, []);
    return ok("Pool data retrieved", { ...row, LINKED_PRODUCTS: parsedLinked });
  } catch (error) {
    return fail("Error fetching pool data: " + error.message, error.message);
  }
};

/**
 * Update a single product's poolRef (can set to null to detach)
 * @param db
 * @param productID  string
 * @param poolRef    string|null
 */
const updateProductRef = async (db, productID, poolRef) => {
  try {
    const sql = "UPDATE product SET poolRef = ? WHERE PRODUCT_ID = ?";
    const res = await db.raw(sql, [poolRef ?? null, productID]);
    // Optional: check affectedRows if your driver exposes it
    return ok("Product reference updated successfully.", res?.[0] ?? null);
  } catch (error) {
    return fail(
      "Error updating product reference: " + error.message,
      error.message
    );
  }
};

/* ===========================
   Public API (exported)
   =========================== */

/**
 * Create a new virtual stock pool.
 * args = { poolID, poolName, initStock }
 */
exports._createVirtualStockPool = async (db, args) => {
  try {
    const { poolID, poolName, initStock = 0 } = args;
    const sql = `
      INSERT INTO inv_virtual_stock (poolID, VIRTUAL_STOCK, LINKED_PRODUCTS, PRODUCT_ID, name)
      VALUES (?,?,?,?,?)
    `;
    const res = await db.raw(sql, [
      poolID,
      Number(initStock) || 0,
      "[]",
      null,
      poolName,
    ]);
    return ok("Virtual stock pool created successfully.", res?.[0] ?? null);
  } catch (error) {
    return fail(
      "Error creating virtual stock pool: " + error.message,
      error.message
    );
  }
};

/**
 * Rename a pool.
 */
exports._updatePoolName = async (db, poolID, newName) => {
  try {
    const sql = "UPDATE inv_virtual_stock SET name = ? WHERE poolID = ?";
    const res = await db.raw(sql, [newName, poolID]);
    return ok("Pool name updated successfully.", res?.[0] ?? null);
  } catch (error) {
    return fail("Error updating pool name: " + error.message, error.message);
  }
};

/**
 * Set a pool's virtual stock to an absolute value.
 */
exports._updateVirtualStock = async (db, poolID, newStock) => {
  try {
    const sql =
      "UPDATE inv_virtual_stock SET VIRTUAL_STOCK = ? WHERE poolID = ?";
    const res = await db.raw(sql, [Number(newStock) || 0, poolID]);
    return ok("Virtual stock updated successfully.", res?.[0] ?? null);
  } catch (error) {
    return fail(
      "Error updating virtual stock: " + error.message,
      error.message
    );
  }
};

/**
 * Add a product link to a pool with a ratio.
 * args = { poolID, productID, normalizeRatio }
 */
exports._addLinkedProductToPool = async (db, args) => {
  try {
    const { poolID, productID, normalizeRatio = 1 } = args;

    const poolRes = await getPool(db, poolID);
    if (!poolRes.success) return poolRes;

    const links = poolRes.data.LINKED_PRODUCTS || [];

    // Prevent duplicates
    const already = links.some((p) => p.productID === productID);
    if (already)
      return ok("Product already linked to pool.", { poolID, productID });

    const newLinks = [
      ...links,
      { productID, normalizeRatio: Number(normalizeRatio) || 1 },
    ];

    const updSql =
      "UPDATE inv_virtual_stock SET LINKED_PRODUCTS = ? WHERE poolID = ?";
    await db.raw(updSql, [JSON.stringify(newLinks), poolID]);

    // Set product.poolRef = poolID
    const refRes = await updateProductRef(db, productID, poolID);
    if (!refRes.success) return refRes;

    return ok("Product added to linked products successfully.", {
      poolID,
      productID,
    });
  } catch (error) {
    return fail("Error adding linked product: " + error.message, error.message);
  }
};

/**
 * Remove a product link from a pool.
 * args = { poolID, productID }
 */
exports._removeLinkedProductFromPool = async (db, args) => {
  try {
    const { poolID, productID } = args;

    const poolRes = await getPool(db, poolID);
    if (!poolRes.success) return poolRes;

    const links = poolRes.data.LINKED_PRODUCTS || [];
    const newLinks = links.filter((p) => p.productID !== productID);

    const updSql =
      "UPDATE inv_virtual_stock SET LINKED_PRODUCTS = ? WHERE poolID = ?";
    await db.raw(updSql, [JSON.stringify(newLinks), poolID]);

    // Clear product.poolRef
    const refRes = await updateProductRef(db, productID, null);
    if (!refRes.success) return refRes;

    return ok("Product removed from linked products successfully.", {
      poolID,
      productID,
    });
  } catch (error) {
    return fail(
      "Error removing linked product: " + error.message,
      error.message
    );
  }
};

/**
 * Extract linked products from a pool.
 * args = { poolID }
 */
exports._extractLinkedProducts = async (db, args) => {
  try {
    const { poolID } = args;
    const poolRes = await getPool(db, poolID);
    if (!poolRes.success) return fail(poolRes.message);
    return ok("Linked products retrieved.", poolRes.data.LINKED_PRODUCTS);
  } catch (error) {
    return fail(
      "Error extracting linked products: " + error.message,
      error.message
    );
  }
};

/**
 * Remove poolRef from all products currently linked to a pool.
 * args = { poolID }
 */

exports._removeVirtualPool = async (db, poolID) => {
  try {
    await db.raw("DELETE FROM inv_virtual_stock WHERE poolID = ?", [poolID]);
    const removeRefs = await removeProductPoolRefs(db, { poolID });
    if (!removeRefs.success) {
      return fail(removeRefs.message, removeRefs.err);
    }
    return ok("Virtual pool removed successfully.");
  } catch (error) {
    return fail("Error removing virtual pool: " + error.message, error.message);
  }
};
