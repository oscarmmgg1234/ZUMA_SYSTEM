// commitProductChanges.js
const {
  transactionUnit,
} = require("../Core/DBLayer/Transaction/transactionUnit");

const commitProductChanges = async (args) => {
  const db_handle = await transactionUnit();

  // helpers
  const toTokens = (s) => (s ? String(s) : "").split(/\s+/).filter(Boolean);
  const fromTokens = (arr) => (arr || []).filter(Boolean).join(" ");
  const withoutPostops = (s) =>
    toTokens(s).filter((t) => !/^POSTOPS:/i.test(t));
  const onlyVirtualops = (s) =>
    toTokens(s).filter((t) => /^VIRTUALOPS:/i.test(t));
  const dedupePreserveOrder = (arr) => {
    const seen = new Set();
    const out = [];
    for (const t of arr)
      if (!seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    return out;
  };

  try {
    if (args.section === "node") {
      if (!args.route) {
        console.log("❌ Missing route for node edit.");
        await db_handle.rollback();
        return false;
      }

      // ALWAYS resolve productId and fetch latest tokens from DB (authoritative)
      const productId =
        args.product || (args.product && args.product.PRODUCT_ID);
      if (!productId) {
        console.log("❌ Missing PRODUCT_ID for node edit.");
        await db_handle.rollback();
        return false;
      }

      const [rows] = await db_handle.raw(
        "SELECT ACTIVATION_TOKEN, REDUCTION_TOKEN, SHIPMENT_TOKEN FROM product WHERE PRODUCT_ID = ?",
        [productId]
      );
      const stored = rows?.[0] || {};

      // 1) Start from stored tokens with POSTOPS removed (we keep VIRTUALOPS)
      let activationBase = withoutPostops(stored.ACTIVATION_TOKEN);
      let reductionBase = withoutPostops(stored.REDUCTION_TOKEN);
      let shipmentBase = withoutPostops(stored.SHIPMENT_TOKEN);

      // 2) Preserve existing VIRTUALOPS from stored copy
      const activationVirt = onlyVirtualops(stored.ACTIVATION_TOKEN);
      const reductionVirt = onlyVirtualops(stored.REDUCTION_TOKEN);
      const shipmentVirt = onlyVirtualops(stored.SHIPMENT_TOKEN);

      // 3) Build replacement tokens for active route (plus PREOPS if reduction)
      const newRouteTokens = toTokens(
        args.route === "reduction"
          ? `PREOPS:9ied PREOPS:549d PREOPS:93je ${args.newToken || ""}`
          : args.newToken || ""
      );

      if (args.route === "activation") {
        activationBase = newRouteTokens.length
          ? newRouteTokens
          : activationBase;
      } else if (args.route === "reduction") {
        reductionBase = newRouteTokens.length ? newRouteTokens : reductionBase;
      } else if (args.route === "shipment") {
        shipmentBase = newRouteTokens.length ? newRouteTokens : shipmentBase;
      }

      // 4) Merge back preserved VIRTUALOPS per route (idempotent)
      activationBase = dedupePreserveOrder([
        ...activationBase,
        ...activationVirt,
      ]);
      reductionBase = dedupePreserveOrder([...reductionBase, ...reductionVirt]);
      shipmentBase = dedupePreserveOrder([...shipmentBase, ...shipmentVirt]);

      // 5) Build POSTOPS from UI and append to all routes (safe + deduped)
      const postopsTokens = Array.isArray(args.postops)
        ? args.postops
            .map((item) => {
              if (!item || !item.productID) return null;
              const value = item.ratio ?? 1;
              return `POSTOPS:2047:${item.productID}:${value}:ratio`;
            })
            .filter(Boolean)
        : [];

      const appendPostops = (tokens) =>
        dedupePreserveOrder([...tokens, ...postopsTokens]);

      const final_activation = fromTokens(appendPostops(activationBase));
      const final_reduction = fromTokens(appendPostops(reductionBase));
      const final_shipment = fromTokens(appendPostops(shipmentBase));

      await db_handle.raw(
        `UPDATE product
           SET ACTIVATION_TOKEN = ?,
               REDUCTION_TOKEN  = ?,
               SHIPMENT_TOKEN   = ?
         WHERE PRODUCT_ID = ?`,
        [final_activation, final_reduction, final_shipment, productId]
      );
    } else {
      // ===== FORM SECTION (unchanged) =====
      if (!Array.isArray(args.updates) || args.updates.length < 1) {
        await db_handle.rollback();
        return false;
      }

      const productId =
        args.PRODUCT_ID || (args.product && args.product.PRODUCT_ID);
      if (!productId) {
        console.log("❌ Missing PRODUCT_ID for form edit.");
        await db_handle.rollback();
        return false;
      }

      for (const item of args.updates) {
        const query = `UPDATE product SET ${item.field} = ? WHERE PRODUCT_ID = ?`;
        await db_handle.raw(query, [item.value, productId]);
      }
    }

    await db_handle.commit();
    return true;
  } catch (error) {
    console.error("🔥 Commit Error:", error);
    await db_handle.rollback();
    return false;
  }
};

module.exports = commitProductChanges;
