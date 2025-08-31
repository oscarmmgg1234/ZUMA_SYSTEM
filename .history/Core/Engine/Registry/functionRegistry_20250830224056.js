/* 
============================================
Author: Oscar Maldonado
Date: 04/18/2024
Function Registry
This module is used to store the functions that will be used by the core engine.
============================================
*/
const { util } = require("../../Utility/Constants");
const {
  data_gather_handler,
} = require("../../../Helpers/transaction_data_gather.js");
const { query_manager } = require("../../../DB/query_manager.js");
const { normalizeStock } = require("../../Utility/StockNormalizer.js");
const {
  firstStageShipment,
  firstStagePill,
  secondStage,
} = require("../../Utility/virtualStockHelper.js");
const knex = query_manager;

class FunctionRegistry {
  constructor() {
    if (FunctionRegistry.instance) {
      return FunctionRegistry.instance;
    }
    this.Utils = util;
    this.registry_map = new Map();
    this.init();
  }

  async getKErrorCorrectingFactor() {
    //get error correction function factor (k)
    const factor = await knex
      .select("ErrorCorrectionFactor(K)")
      .from("system_config");
    const extract = factor[0]["ErrorCorrectionFactor(K)"];

    //make sure factor is between 0 and 1 as overfilling is the real world problem otherwise we proceed with default value of 1
    if (extract < 1 && extract > 0) {
      return extract;
    }
    return 1;
  }
  // Inside FunctionRegistry (same file), add this method:
  applyFriendlyLabels() {
    const updates = {
      // -------------------- VIRTUALOPS --------------------
      "4i57": {
        name: "New v2 • Use Pool Link: subtract capsules from Storage & auto-sync linked products",
        desc:
          "Subtracts the pill-equivalent from Storage using the pool’s ratio, then syncs totals across all linked products. " +
          "Creates a clean, single debit and normalization so your numbers add up.",
        meta_data: {
          version: "v2",
          createsReceipt: false, // your recordHandler logs a step, but not a DB 'receipt' row here
          userSummary:
            "Use this when a capsule/‘pill’ consumes from a shared pool.",
          touches: ["Storage (decrease)", "Linked products (normalized)"],
          reversible: "Yes, via the parent transaction’s records.",
        },
      },
      "20r4": {
        name: "New v2 • Shipment uses Pool Link: subtract shipped amount from Storage & auto-sync",
        desc: "For pool-linked items: subtracts the shipped quantity from Storage and syncs totals across linked products.",
        meta_data: {
          version: "v2",
          createsReceipt: false,
          userSummary:
            "Use when a shipment should reduce a pool-linked product.",
          touches: ["Storage (decrease)", "Linked products (normalized)"],
          reversible: "Yes, via the parent transaction’s records.",
        },
      },

      // -------------------- POSTOPS --------------------
      2047: {
        name: "Legacy • Recalculate totals (Normalize)",
        desc: "Recomputes totals using the given ratio, so displayed stock matches reality after operations.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Run after changes if totals need to be refreshed.",
          touches: ["Totals only (recalc)"],
          reversible: "Not applicable (recalculation).",
        },
      },

      // -------------------- ACTIVATION (AC) --------------------
      1023: {
        name: "Legacy • Create Activation Receipt (record only)",
        desc: "Writes an activation receipt (no stock movement). This is the paper trail that makes reversals possible.",
        meta_data: {
          version: "legacy",
          createsReceipt: true,
          userSummary: "Use when you need a receipt for an activation.",
          touches: ["No stock movement"],
          reversible: "Yes (receipt exists).",
        },
      },
      "290W": {
        name: "New v2 • Activate items (receipt + move to Active)",
        desc: "Creates an activation receipt and increases Active stock. Use when an item becomes available to use/sell.",
        meta_data: {
          version: "v2",
          createsReceipt: true,
          userSummary: "One-click activation with a receipt.",
          touches: ["Active (increase)"],
          reversible: "Yes (receipt exists).",
        },
      },

      // -------------------- REDUCTION (RD) --------------------
      "29ew": {
        name: "New v2 • Reduce item (receipt + subtract from Storage)",
        desc: "Creates a reduction receipt and subtracts from Storage. Best for simple ‘use one, subtract one’ flows.",
        meta_data: {
          version: "v2",
          createsReceipt: true,
          userSummary: "Simple reduction with a receipt.",
          touches: ["Storage (decrease)"],
          reversible: "Yes (receipt exists).",
        },
      },
      "29wp": {
        name: "New v2 • Reduce capsules (receipt + pill-equivalent from Storage)",
        desc: "Creates a reduction receipt and subtracts the capsule-equivalent (using your pill ratio) from Storage.",
        meta_data: {
          version: "v2",
          createsReceipt: true,
          userSummary: "Pill/capsule reduction with a receipt.",
          touches: ["Storage (decrease by pill ratio)"],
          reversible: "Yes (receipt exists).",
        },
      },
      "10fd": {
        name: "Legacy • Create Reduction Receipt (record only)",
        desc: "Writes a reduction receipt (no stock movement). Use if you only need the paper trail.",
        meta_data: {
          version: "legacy",
          createsReceipt: true,
          userSummary: "Receipt only—no stock moves.",
          touches: ["No stock movement"],
          reversible: "Yes (receipt exists).",
        },
      },
      "739e": {
        name: "Legacy • Create Partial Reduction Receipt (e.g., ‘Agaricus’ style)",
        desc: "Writes a receipt for partial reductions of the same product at different amounts.",
        meta_data: {
          version: "legacy",
          createsReceipt: true,
          userSummary: "Receipt for partial reductions.",
          touches: ["No stock movement"],
          reversible: "Yes (receipt exists).",
        },
      },
      "2js2": {
        name: "Legacy • Create Liquid Reduction Receipt",
        desc: "Writes a reduction receipt for liquid products based on container/bottle settings.",
        meta_data: {
          version: "legacy",
          createsReceipt: true,
          userSummary: "Liquid: receipt only.",
          touches: ["No stock movement"],
          reversible: "Yes (receipt exists).",
        },
      },
      "234d": {
        name: "Legacy • Create Capsule Reduction Receipt",
        desc: "Writes a reduction receipt for capsule products (supports pill ratio).",
        meta_data: {
          version: "legacy",
          createsReceipt: true,
          userSummary: "Capsule: receipt only.",
          touches: ["No stock movement"],
          reversible: "Yes (receipt exists).",
        },
      },

      // -------------------- UPDATE (UP) --------------------
      "23hs": {
        name: "Legacy • Subtract from Storage (update only)",
        desc: "Subtracts from Storage and logs the change for your report. No receipt row is created.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Storage down—no receipt.",
          touches: ["Storage (decrease)"],
          reversible: "Via overall transaction, not this call alone.",
        },
      },
      "38hw": {
        name: "Legacy • Subtract from Storage (partial, update only)",
        desc: "Subtracts a partial amount from Storage (e.g., custom partials) and logs the change.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Partial storage down—no receipt.",
          touches: ["Storage (decrease, partial)"],
          reversible: "Via overall transaction.",
        },
      },
      "235s": {
        name: "Legacy • Add to Storage (update only)",
        desc: "Adds to Storage and logs the change. No receipt row is created.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Storage up—no receipt.",
          touches: ["Storage (increase)"],
          reversible: "Via overall transaction.",
        },
      },
      "2j3w": {
        name: "Legacy • Add to Active (update only)",
        desc: "Increases Active stock and logs the change. No receipt row is created.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Active up—no receipt.",
          touches: ["Active (increase)"],
          reversible: "Via overall transaction.",
        },
      },
      "2j2h": {
        name: "Legacy • Subtract Liquid from Storage (update only)",
        desc: "Subtracts a computed liquid amount from Storage (based on bottle/gallon settings) and logs the change.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Liquid storage down—no receipt.",
          touches: ["Storage (decrease, liquid)"],
          reversible: "Via overall transaction.",
        },
      },
      "2a1k": {
        name: "Legacy • Subtract Capsules from Storage + Normalize (update only)",
        desc: "Subtracts capsule-equivalent from Storage using your pill ratio and normalizes totals. Logs the change.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Capsule storage down + normalize—no receipt.",
          touches: ["Storage (decrease by pill ratio)", "Totals (normalized)"],
          reversible: "Via overall transaction.",
        },
      },
      "2q3e": {
        name: "Legacy • Subtract Glycerin from Storage (update only)",
        desc: "Subtracts computed glycerin from Storage based on your ratios and logs the change.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Glycerin storage down—no receipt.",
          touches: ["Storage (decrease, glycerin)"],
          reversible: "Via overall transaction.",
        },
      },

      // -------------------- PREOPS (setup / logging helpers) --------------------
      "9ied": {
        name: "Legacy • Barcode Prep: assign employee",
        desc: "Pre-assigns the responsible employee to the scanned barcode before the reduction flow starts.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Prep step: tag barcode with employee.",
          touches: ["Barcode log (employee)"],
          reversible: "Not needed (prep metadata).",
        },
      },
      "549d": {
        name: "Legacy • Start a Transaction (open the receipt & before-snapshot)",
        desc: "Creates the transaction shell and captures the ‘before’ stock snapshot so the receipt can be closed later.",
        meta_data: {
          version: "legacy",
          createsReceipt: true,
          userSummary: "Opens the transaction & takes the ‘before’ picture.",
          touches: ["Transaction log", "Before snapshot"],
          reversible: "Yes—this is the start of the receipt.",
        },
      },
      "93je": {
        name: "Legacy • Barcode Finalize: mark as ‘Deducted’",
        desc: "After a reduction, marks the barcode as ‘Deducted’ in the system.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Close out the barcode as used.",
          touches: ["Barcode log (status)"],
          reversible: "Administrative toggle.",
        },
      },

      // -------------------- CM / CMUP (composite barcode flows) --------------------
      "50wk": {
        name: "Legacy • Create Consumption Receipt (barcode helper)",
        desc: "Writes a consumption record tied to the barcode. This is the receipt row used by the composite flows.",
        meta_data: {
          version: "legacy",
          createsReceipt: true,
          userSummary: "Receipt row for barcode reductions.",
          touches: ["Consumption log (receipt)"],
          reversible: "Yes (receipt exists).",
        },
      },
      "34fk": {
        name: "New v2 • Reduce Active with Receipt (barcode)",
        desc: "Creates a consumption receipt and subtracts from Active. Use when items are consumed from Active stock.",
        meta_data: {
          version: "v2",
          createsReceipt: true,
          userSummary: "Active down with a receipt (barcode).",
          touches: ["Active (decrease)"],
          reversible: "Yes (receipt exists).",
        },
      },
      "2j2k": {
        // NOTE: Implementation subtracts ACTIVE via 13g4, even though legacy name says "stored".
        name: "New v2 • Reduce Active with Receipt (barcode) — legacy name mentions ‘stored’",
        desc:
          "Creates a consumption receipt and subtracts from Active stock. (Legacy label refers to ‘stored’, " +
          "but this flow subtracts Active in practice.)",
        meta_data: {
          version: "v2",
          createsReceipt: true,
          userSummary: "Active down with a receipt (barcode).",
          touches: ["Active (decrease)"],
          reversible: "Yes (receipt exists).",
        },
      },
      "10fj": {
        name: "Legacy • Subtract from Storage (barcode, update only)",
        desc: "Subtracts the barcode’s quantity from Storage and logs the change. No separate receipt is written here.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Storage down (barcode) — no receipt.",
          touches: ["Storage (decrease)"],
          reversible: "Via overall transaction.",
        },
      },
      "13g4": {
        name: "Legacy • Subtract from Active (barcode, update only)",
        desc: "Subtracts the barcode’s quantity from Active and logs the change. No separate receipt is written here.",
        meta_data: {
          version: "legacy",
          createsReceipt: false,
          userSummary: "Active down (barcode) — no receipt.",
          touches: ["Active (decrease)"],
          reversible: "Via overall transaction.",
        },
      },

      // -------------------- SHIPMENT (SH) --------------------
      "38dh": {
        name: "Legacy • Create Shipment Receipt (record only)",
        desc: "Writes a shipment record (no stock movement). Use if you only need to record the shipment event.",
        meta_data: {
          version: "legacy",
          createsReceipt: true,
          userSummary: "Shipment: receipt only.",
          touches: ["Shipment log"],
          reversible: "Yes (receipt exists).",
        },
      },
      "23ij": {
        name: "New v2 • Receive Shipment (receipt + add to Storage)",
        desc: "Creates a shipment receipt and increases Storage. Use when stock physically arrives.",
        meta_data: {
          version: "v2",
          createsReceipt: true,
          userSummary: "Storage up with a shipment receipt.",
          touches: ["Storage (increase)"],
          reversible: "Yes (receipt exists).",
        },
      },
    };

    for (const [id, patch] of Object.entries(updates)) {
      const fn = this.registry_map.get(id);
      if (!fn) continue;
      this.registry_map.set(id, {
        ...fn,
        name: patch.name ?? fn.name,
        desc: patch.desc ?? fn.desc,
        meta_data: { ...(fn.meta_data || {}), ...(patch.meta_data || {}) },
      });
    }
  }

  init() {
    //get error correction function factor (k)
    //function have a 4 letter rando id
    this.registry_map.set("4i57", {
      name: "UPDATE pill stock and normalize stock for all products",
      desc: "This will iterate through the product list then actualize stored-stock and sync the product-stock",
      meta_data: {},
      class: "VIRTUALOPS",
      // inside registry map for "4i57"
      proto: async (db_handle, args, value, auxiliary) => {
        const firstStageStatus = await firstStagePill(
          db_handle,
          args,
          value,
          auxiliary
        );
        if (!firstStageStatus) throw new Error("Cannot complete the operation");

        const pool = await db_handle.raw(
          "SELECT * FROM inv_virtual_stock WHERE poolID = ?",
          [auxiliary.auxiliaryParam]
        );
        const product = JSON.parse(pool[0][0].LINKED_PRODUCTS).filter(
          (item) => item.productID == value
        );

        // ✅ Fix typo + strong numeric coercion
        const multiplier =
          args.MULTIPLIER != null ? Number(args.MULTIPLIER) : 1;
        const qty = Number(args.QUANTITY) * multiplier;
        const ratio = Number(product?.[0]?.normalizeRatio ?? 1);
        const delta = ratio * qty; // e.g. 0.5 * 100 => 50

        // Log exactly one STORED_STOCK change
        args.recordHandler.step({
          normalize: true,
          column: "STORED_STOCK",
          value: delta,
          productID: value,
          operation: "-", // one debit
          ratio: auxiliary.auxiliaryParam,
          args: args,
          source: "VIRTUALOPS:4i57", // optional: provenance for debugging
        });

        return await secondStage(db_handle, firstStageStatus);
      },
    });
    this.registry_map.set("20r4", {
      name: "Update virtual stock",
      desc: "This will allow you to update the virtual stock",
      meta_data: {},
      class: "VIRTUALOPS",
      proto: async (db_handle, args, value, auxiliary) => {
        //normal update
        //then perform second stage
        const firstStageStatus = await firstStageShipment(
          db_handle,
          args,
          value,
          auxiliary
        );
        if (firstStageStatus) {
          args.recordHandler.step({
            normalize: true,
            column: "STORED_STOCK",
            value: args.QUANTITY,
            productID: value,
            operation: "-",
            ratio: auxiliary.auxiliaryParam,
            args: args,
          });
          return await secondStage(db_handle, firstStageStatus);
        } else {
          throw new Error("Cannot complete the opertion");
        }
      },
    });

    this.registry_map.set("2047", {
      name: "Post Macro Stock Normalizer",
      desc: "This post-macro will normalize total stock for products",
      meta_data: {
        mainParams: 3,
        optionalParams: 0,
        optionalDesc: [
          {
            desc: "This is the normalizing category action option",
          },
        ],
      },
      class: "POSTOPS",
      proto: async (db_handle, args, value, auxiliary) => {
        await normalizeStock(db_handle, {
          product: value,
          value: parseFloat(auxiliary.auxiliaryParam),
          option: auxiliary.nextAuxiliaryParam,
        });
      },
    });

    this.registry_map.set("1023", {
      name: "Insert Activation Record",
      desc: "Insert new activation record into the database(needed for the activation process)",
      meta_data: {
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "Set custom number to be muliplied by multiplier bypasses quantity",
          },
        ],
      },
      class: "AC",
      proto: async (db_handle, args, value, auxiliary) => {
        //insert new record into activation table
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        await db_handle.raw(
          "INSERT INTO inventory_activation (PRODUCT_ID, QUANTITY, EMPLOYEE_ID, TRANSACTIONID) VALUES (?, ?, ?, ?)",
          [
            value,
            auxiliary.auxiliaryParam
              ? parseFloat(auxiliary.auxiliaryParam) * multiplier
              : args.QUANTITY * multiplier,
            args.EMPLOYEE_ID,
            args.TRANSACTIONID,
          ]
        );
      },
    });
    this.registry_map.set("290W", {
      name: "Activate Product on 1 on 1 basis",
      desc: "Activate product -> option to completely activate without aditional steps",
      meta_data: {
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "Set custom number to be muliplied by multiplier bypasses quantity",
          },
        ],
      },
      class: "AC",
      proto: async (db_handle, args, value, auxiliary) => {
        //insert activation record
        await this.getFunction("1023").proto(db_handle, args, value, auxiliary);
        //update product stored stock subtract
        await this.getFunction("2j3w").proto(db_handle, args, value, auxiliary);
      },
    });
    this.registry_map.set("29ew", {
      name: "Reduce Product in 1 on 1 basis",
      desc: "Reduce product -> option to completely reduce without aditional steps",
      meta_data: {
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "Set custom number to be muliplied by multiplier bypasses quantity",
          },
        ],
      },
      class: "RD",
      proto: async (db_handle, args, value, auxiliary) => {
        //insert reduction record
        await this.getFunction("10fd").proto(db_handle, args, value, auxiliary);
        //update product stored stock subtract
        await this.getFunction("23hs").proto(db_handle, args, value, auxiliary);
      },
    });
    this.registry_map.set("29wp", {
      name: "Reduce Pill Product with Record",
      desc: "Reduce product -> option to completely reduce without aditional steps",
      meta_data: {
        normalizationRequired: true,
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "Set Pill Ratio for pill conversion",
          },
        ],
      },
      class: "RD",
      proto: async (db_handle, args, value, auxiliary) => {
        //insert reduction record
        await this.getFunction("234d").proto(db_handle, args, value, auxiliary);
        //update porduct stored stock subtract
        await this.getFunction("2a1k").proto(db_handle, args, value, auxiliary);
      },
    });

    this.registry_map.set("10fd", {
      name: "Insert Reduction Record",
      desc: "Insert reduction record into consumption table (needed for the reduction process)",
      meta_data: {
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "Set custom number to be muliplied by multiplier bypasses quantity",
          },
        ],
      },
      class: "RD",
      proto: async (db_handle, args, value, auxiliary) => {
        //insert new record into consumption table
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        await db_handle.raw(
          "INSERT INTO inventory_consumption (PRODUCT_ID, QUANTITY, EMPLOYEE_ID, TRANSACTIONID) VALUES (?, ?, ?, ?)",
          [
            value,
            auxiliary.auxiliaryParam
              ? parseFloat(auxiliary.auxiliaryParam) * multiplier
              : args.QUANTITY * multiplier,
            args.EMPLOYEE_ID,
            args.TRANSACTIONID,
          ]
        );
      },
    });
    this.registry_map.set("23hs", {
      name: "Update Product Stored Stock Subtract",
      desc: "Update product quantity stored stock subtract (updates values in db)",
      meta_data: {
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "Set custom number to be muliplied by multiplier bypasses quantity",
          },
        ],
      },
      class: "UP",
      proto: async (db_handle, args, value, auxiliary) => {
        // update product quantity stored subtract
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        await db_handle.raw(
          "UPDATE product_inventory SET STORED_STOCK = STORED_STOCK - ? WHERE PRODUCT_ID = ?",
          [
            auxiliary.auxiliaryParam
              ? parseFloat(auxiliary.auxiliaryParam) * multiplier
              : args.QUANTITY * multiplier,
            value,
          ]
        );
        //tracker
        //value = {normalize: false, column: "STORED_STOCK", value: -1, productID: "23423D"}

        args.recordHandler.step({
          normalize: false,
          column: "STORED_STOCK",
          value: args.QUANTITY * multiplier,
          productID: value,
          operation: "-",
          args: args,
        });
        await normalizeStock(db_handle, {
          product: value,
          value: 1,
          option: "default",
        });
      },
    });
    this.registry_map.set("739e", {
      name: "Update Partial Consumption Record (liek Agaricus)",
      desc: "insert new record into consumption table partial consumption of same products with diffrent quantities (like agaricus)",
      meta_data: {
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "Set a custom value that mulitplies this custom# * quantity by ipad * multiplier",
          },
        ],
      },
      class: "RD",
      proto: async (db_handle, args, value, auxiliary) => {
        //insert new record into consumption table partial consumption of same products with diffrent quantities
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        await db_handle.raw(
          "INSERT INTO inventory_consumption (PRODUCT_ID, QUANTITY, EMPLOYEE_ID, TRANSACTIONID) VALUES (?, ?, ?, ?)",
          [
            value,
            auxiliary.auxiliaryParam
              ? parseFloat(auxiliary.auxiliaryParam) *
                args.QUANTITY *
                multiplier
              : args.QUANTITY * multiplier,
            args.EMPLOYEE_ID,
            args.TRANSACTIONID,
          ]
        );
      },
    });
    this.registry_map.set("38hw", {
      name: "Update Product Partial Stored Stock (like Agaricus)",
      desc: "update product quantity of product stored by either full amount or partial of that specified amount example agaricus",
      meta_data: {
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "Set a custom value that mulitplies this custom# * quantity by ipad * multiplier",
          },
        ],
      },
      class: "UP",
      proto: async (db_handle, args, value, auxiliary) => {
        // update product quantity of product stored by either full amount or partial of that specified amount example agaricus
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        await db_handle.raw(
          "UPDATE product_inventory SET STORED_STOCK = STORED_STOCK - ? WHERE PRODUCT_ID = ?",
          [
            auxiliary.auxiliaryParam
              ? parseFloat(auxiliary.auxiliaryParam) *
                args.QUANTITY *
                multiplier
              : args.QUANTITY * multiplier,
            value,
          ]
        );
        args.recordHandler.step({
          normalize: false,
          column: "STORED_STOCK",
          value: args.QUANTITY * multiplier,
          productID: value,
          operation: "-",
          args: args,
        });
        await normalizeStock(db_handle, {
          product: value,
          value: 1,
          option: "default",
        });
      },
    });
    this.registry_map.set("235s", {
      name: "Update Product Stored Stock Add",
      desc: "Update product quantity stored stock add (updates values in db)",
      meta_data: {
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "Set custom quantity fr everytime this product gets sent to api",
          },
        ],
      },
      class: "UP",
      proto: async (db_handle, args, value, auxiliary) => {
        // update product quantity stored add
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        await db_handle.raw(
          "UPDATE product_inventory SET STORED_STOCK = STORED_STOCK + ? WHERE PRODUCT_ID = ?",
          [
            auxiliary.auxiliaryParam
              ? parseFloat(auxiliary.auxiliaryParam) * multiplier
              : args.QUANTITY * multiplier,
            value,
          ]
        );
        args.recordHandler.step({
          normalize: false,
          column: "STORED_STOCK",
          value: args.QUANTITY * multiplier,
          productID: value,
          operation: "+",
          args: args,
        });
        await normalizeStock(db_handle, {
          product: value,
          value: 1,
          option: "default",
        });
      },
    });
    this.registry_map.set("2j3w", {
      name: "Update Product Active Stock Add",
      desc: "update product quantity active",
      meta_data: {
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "1. Set custom quantity for every product activation, ignores activated quantity",
          },
        ],
      },
      class: "UP",
      proto: async (db_handle, args, value, auxiliary) => {
        // update product quantity active
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        await db_handle.raw(
          "UPDATE product_inventory SET ACTIVE_STOCK = ACTIVE_STOCK + ? WHERE PRODUCT_ID = ?",
          [
            auxiliary.auxiliaryParam
              ? parseFloat(auxiliary.auxiliaryParam) * multiplier
              : args.QUANTITY * multiplier,
            value,
          ]
        );
        args.recordHandler.step({
          normalize: false,
          column: "ACTIVE_STOCK",
          value: args.QUANTITY * multiplier,
          productID: value,
          operation: "+",
          args: args,
        });
        await normalizeStock(db_handle, {
          product: value,
          value: 1,
          option: "default",
        });
      },
    });
    this.registry_map.set("2js2", {
      name: "Insert Record for Liquid product into Activation Table",
      class: "RD",
      desc: "Insert a liquid product into the activation table",
      meta_data: {
        mainParams: 1,
        optionalParams: 3,
        optionalDesc: [
          {
            desc: "The product base gallon(should be one gallon but depends on how they come",
          },
          { desc: "The product bottle size in milliliters" },
          { desc: "The product quantity" },
        ],
      },
      proto: async (db_handle, args, value, auxiliary) => {
        //insert a liquid product into the consumption table
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        await db_handle.raw(
          "INSERT INTO inventory_consumption (PRODUCT_ID, QUANTITY, EMPLOYEE_ID, TRANSACTIONID) VALUES (?, ?, ?, ?)",
          [
            value,
            this.Utils.productConsumption(
              parseFloat(auxiliary.auxiliaryParam),
              parseFloat(auxiliary.nextAuxiliaryParam),
              auxiliary.lastAuxiliaryParam
                ? parseFloat(auxiliary.lastAuxiliaryParam) * multiplier
                : args.QUANTITY *
                    (await this.getKErrorCorrectingFactor()) *
                    multiplier
            ),
            args.EMPLOYEE_ID,
            args.TRANSACTIONID,
          ]
        );
      },
    });
    this.registry_map.set("234d", {
      name: "Insert Record for Capsule product into Consumption Table",
      class: "RD",
      desc: "Insert a capsule product into the consumption table",
      meta_data: {
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "Set pill ratio for pill",
          },
        ],
      },
      proto: async (db_handle, args, value, auxiliary) => {
        // insert a capsule product into the consumption table auxilary param is the quantity of the product, next auxilary param for the consumption ratio
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        await db_handle.raw(
          "INSERT INTO inventory_consumption (PRODUCT_ID, QUANTITY, EMPLOYEE_ID, TRANSACTIONID) VALUES (?, ?, ?, ?)",
          [
            value,
            auxiliary.auxiliaryParam
              ? parseFloat(auxiliary.auxiliaryParam) *
                args.QUANTITY *
                multiplier
              : args.QUANTITY * multiplier,
            args.EMPLOYEE_ID,
            args.TRANSACTIONID,
          ]
        );
      },
    });
    this.registry_map.set("2j2h", {
      name: "Update Product Stored Stock Liquid",
      desc: "update product quantity stored liquid",
      meta_data: {
        mainParams: 1,
        optionalParams: 3,
        optionalDesc: [
          {
            desc: "The product base gallon(should be one gallon but depends on how they come",
          },
          { desc: "The product bottle size in milliliters" },
          { desc: "The product quantity" },
        ],
      },
      class: "UP",
      proto: async (db_handle, args, value, auxiliary) => {
        // update product quantity stored liquid
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        await db_handle.raw(
          "UPDATE product_inventory SET STORED_STOCK = STORED_STOCK - ? WHERE PRODUCT_ID = ?",
          [
            this.Utils.productConsumption(
              parseFloat(auxiliary.auxiliaryParam),
              parseFloat(auxiliary.nextAuxiliaryParam),
              auxiliary.lastAuxiliaryParam
                ? parseFloat(auxiliary.lastAuxiliaryParam) * multiplier
                : args.QUANTITY *
                    (await this.getKErrorCorrectingFactor()) *
                    multiplier
            ),
            value,
          ]
        );
        args.recordHandler.step({
          normalize: false,
          column: "STORED_STOCK",
          value: args.QUANTITY * multiplier,
          productID: value,
          operation: "-",
          args: args,
        });
        await normalizeStock(db_handle, {
          product: value,
          value: 1,
          option: "default",
        });
      },
    });
    this.registry_map.set("2a1k", {
      name: "Update Product Stored Stock Capsule",
      class: "UP",
      desc: "update product quantity stored capsule",
      meta_data: {
        normalizationRequired: true,
        mainParams: 1,
        optionalParams: 1,
        optionalDesc: [
          {
            desc: "Set pill ratio for pill",
          },
        ],
      },
      proto: async (db_handle, args, value, auxiliary) => {
        // update product quantity stored capsule
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        await db_handle.raw(
          "UPDATE product_inventory SET STORED_STOCK = STORED_STOCK - ? WHERE PRODUCT_ID = ?",
          [
            auxiliary.auxiliaryParam
              ? parseFloat(auxiliary.auxiliaryParam) *
                args.QUANTITY *
                multiplier
              : args.QUANTITY * multiplier,
            value,
          ]
        );
        args.recordHandler.step({
          normalize: true,
          column: "STORED_STOCK",
          value:
            parseFloat(auxiliary.auxiliaryParam) * (args.QUANTITY * multiplier),
          productID: value,
          operation: "-",
          ratio: auxiliary.auxiliaryParam,
          args: args,
        });
      },
    });
    this.registry_map.set("2q3e", {
      name: "Update Glycering Stored Stock",
      class: "UP",
      desc: "update glycerin stored stock",
      meta_data: {
        mainParams: 1,
        optionalParams: 3,
        optionalDesc: [
          {
            desc: "Set glycerin ratio for product",
          },
          { desc: "Set glycerin ratio for product" },
          { desc: "Set glycerin ratio in oz for product (typically 26)" },
        ],
      },
      proto: async (db_handle, args, value, auxiliary) => {
        // update product quantity active glycerin
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        const glycerinConsump = await this.Utils.glycerinCompsumption(
          db_handle,
          args.QUANTITY * multiplier,
          parseFloat(auxiliary.auxiliaryParam),
          parseFloat(auxiliary.nextAuxiliaryParam)
        );
        await db_handle.raw(
          "UPDATE product_inventory SET STORED_STOCK = STORED_STOCK - ? WHERE PRODUCT_ID = ?",
          [glycerinConsump, value]
        );
        args.recordHandler.step({
          normalize: false,
          column: "STORED_STOCK",
          value: args.QUANTITY * multiplier,
          productID: value,
          operation: "-",
          args: args,
        });
        await normalizeStock(db_handle, {
          product: value,
          value: 1,
          option: "default",
        });
      },
    });
    this.registry_map.set("2tyu", {
      name: "Insert Glycerin Consumption Record",
      desc: "insert glycerin consumption record",
      meta_data: {
        mainParams: 1,
        optionalParams: 3,
        optionalDesc: [
          {
            desc: "Set glycerin ratio for product",
          },
          { desc: "Set glycerin ratio for product" },
          { desc: "Set glycerin ratio in oz for product (typically 26)" },
        ],
      },
      class: "RD",
      // insert into consumption table glycerin
      proto: async (db_handle, args, value, auxiliary) => {
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        const glycerinConsump = await this.Utils.glycerinCompsumption(
          db_handle,
          args.QUANTITY * multiplier,
          parseFloat(auxiliary.auxiliaryParam),
          parseFloat(auxiliary.nextAuxiliaryParam)
        );
        await db_handle.raw(
          "INSERT INTO inventory_consumption (PRODUCT_ID, QUANTITY, EMPLOYEE_ID, TRANSACTIONID) VALUES (?, ?, ?, ?)",
          [value, glycerinConsump, args.EMPLOYEE_ID, args.TRANSACTIONID]
        );
      },
    });
    this.registry_map.set("9ied", {
      name: "Update Barcode Status Preprocessor",
      class: "PREOPS",
      desc: "update barcode status preprocessor",
      meta_data: {
        mainParams: 1,
        optionalParams: 0,
        optionalDesc: [],
      },
      proto: async (db_handle, args, value, auxiliary) => {
        // update barcode status preprocessor reduction init
        await db_handle.raw(
          "UPDATE barcode_log SET Employee = ? WHERE BarcodeID = ?",
          [args.EMPLOYEE_RESPONSIBLE, args.BARCODE_ID]
        );
      },
    });
    this.registry_map.set("549d", {
      name: "Insert transaction into log preprocessor",
      desc: "insert transaction into log",
      meta_data: {
        mainParams: 1,
        optionalParams: 0,
        optionalDesc: [],
      },
      class: "PREOPS",
      proto: async (db_handle, args, value, auxiliary) => {
        // Reduction init process - preprocessor

        const barcodeData = await db_handle.raw(
          "SELECT * FROM barcode_log WHERE BarcodeID = ?",
          [args.BARCODE_ID]
        );
        await db_handle.raw(
          "INSERT INTO transaction_log (TRANSACTIONID, ACTIVATION_STACK, RELEASE_STACK,BARCODE_STACK, SHIPMENT_STACK, REVERSED, ACTION, EMPLOYEE_ID, PRODUCT_ID, QUANTITY) VALUES (?,?,?,?,?,?,?,?,?,?)",
          [
            args.newTransactionID,
            JSON.stringify([]),
            JSON.stringify([]),
            JSON.stringify([]),
            JSON.stringify([]),
            0,
            "consumption",
            args.EMPLOYEE_RESPONSIBLE,
            barcodeData[0][0].PRODUCT_ID,
            barcodeData[0][0].Quantity,
          ]
        );
        //gather data for product stock
        const record = args.recordHandler(
          args.process_token,
          { ...args, display_type: "reduction type" },
          args.newTransactionID,
          "start",
          db_handle
        );
        await record.start();
        await db_handle.raw(
          "UPDATE transaction_log SET BARCODE_STACK = JSON_ARRAY_APPEND(BARCODE_STACK, '$', ?) WHERE TRANSACTIONID = ?",
          [args.BARCODE_ID, args.newTransactionID]
        );
        return { from: "preops - 549d", desc: "record", proto: record };
      },
    });
    this.registry_map.set("93je", {
      name: "Update Barcode Status Postprocessor",
      desc: "update barcode status post processor reduction init preprocessor",
      meta_data: {
        mainParams: 1,
        optionalParams: 0,
        optionalDesc: [],
      },
      class: "PREOPS",
      proto: async (db_handle, args, value, auxiliary) => {
        // update barcode status post processor reduction init preprocessor
        await db_handle.raw(
          "UPDATE barcode_log SET Status = ? WHERE BarcodeID = ?",
          ["Deducted", args.BARCODE_ID]
        );
      },
    });
    this.registry_map.set("50wk", {
      name: "Insert Consumption Record",
      desc: "Insert consumption record",
      meta_data: {
        mainParams: 1,
        optionalParams: 0,
        optionalDesc: [],
      },

      class: "CM",
      proto: async (db_handle, args, value, auxiliary) => {
        // consumption reduction row addition
        const barcodeData = await db_handle.raw(
          "SELECT * FROM barcode_log WHERE BarcodeID = ?",
          [args.BARCODE_ID]
        );
        await db_handle.raw(
          "INSERT INTO inventory_consumption (PRODUCT_ID, QUANTITY, EMPLOYEE_ID, TRANSACTIONID, ORIGIN) VALUES (?, ?, ?, ?, ?)",
          [
            value,
            barcodeData[0][0].Quantity,
            args.EMPLOYEE_RESPONSIBLE,
            args.newTransactionID,
            "activation",
          ]
        );
      },
    });

    this.registry_map.set("34fk", {
      name: "Reduce product active Stock with record",
      desc: "Reduce product active stock with record",
      meta_data: {
        mainParams: 1,
        optionalParams: 0,
        optionalDesc: [],
      },
      class: "CM",
      proto: async (db_handle, args, value, auxiliary) => {
        // reduce product stored stock with record
        await this.getFunction("50wk").proto(db_handle, args, value, auxiliary);
        // update product stored stock subtract
        await this.getFunction("13g4").proto(db_handle, args, value, auxiliary);
      },
    });

    this.registry_map.set("2j2k", {
      name: "Reduce product stored stock with record",
      desc: "Reduce product stored stock with record",
      meta_data: {
        mainParams: 1,
        optionalParams: 0,
        optionalDesc: [],
      },
      class: "CM",
      proto: async (db_handle, args, value, auxiliary) => {
        // reduce product stored stock with record
        await this.getFunction("50wk").proto(db_handle, args, value, auxiliary);
        // update product stored stock subtract
        await this.getFunction("13g4").proto(db_handle, args, value, auxiliary);
      },
    });

    this.registry_map.set("10fj", {
      name: "Update Product Stored Stock Subtract",
      desc: "Update product quantity stored stock subtract",
      meta_data: {
        mainParams: 1,
        optionalParams: 0,
        optionalDesc: [],
      },
      class: "CMUP",
      proto: async (db_handle, args, value, auxiliary) => {
        // update product quantity stored
        const barcodeData = await db_handle.raw(
          "SELECT * FROM barcode_log WHERE BarcodeID = ?",
          [args.BARCODE_ID]
        );
        await db_handle.raw(
          "UPDATE product_inventory SET STORED_STOCK = STORED_STOCK - ? WHERE PRODUCT_ID = ?",
          [barcodeData[0][0].Quantity, value]
        );
        args.recordHandler.step({
          normalize: false,
          column: "STORED_STOCK",
          value: barcodeData[0][0].Quantity,
          productID: value,
          operation: "-",
          args: args,
        });
        await normalizeStock(db_handle, {
          product: value,
          value: 1,
          option: "default",
        });
      },
    });
    this.registry_map.set("13g4", {
      name: "Update Product Active Stock Subtract",
      desc: "Update product quantity active stock subtract",
      meta_data: {
        mainParams: 1,
        optionalParams: 0,
        optionalDesc: [],
      },
      class: "CMUP",
      proto: async (db_handle, args, value, auxiliary) => {
        // update product quantity active
        const barcodeData = await db_handle.raw(
          "SELECT * FROM barcode_log WHERE BarcodeID = ?",
          [args.BARCODE_ID]
        );
        await db_handle.raw(
          "UPDATE product_inventory SET ACTIVE_STOCK = ACTIVE_STOCK - ? WHERE PRODUCT_ID = ?",
          [barcodeData[0][0].Quantity, value]
        );
        args.recordHandler.step({
          normalize: false,
          column: "ACTIVE_STOCK",
          value: barcodeData[0][0].Quantity,
          productID: value,
          operation: "-",
          args: args,
        });
        await normalizeStock(db_handle, {
          product: value,
          value: 1,
          option: "default",
        });
      },
    });
    this.registry_map.set("38dh", {
      name: "Update Product Stored Stock Add Shipment",
      desc: "Update product quantity stored stock add shipment",
      meta_data: {
        mainParams: 1,
        optionalParams: 0,
        optionalDesc: [],
      },
      class: "SH",
      proto: async (db_handle, args, value, auxiliary) => {
        //insert into shipment log
        await db_handle.raw(
          "INSERT INTO shipment_log ( QUANTITY, COMPANY_ID, TYPE, EMPLOYEE_ID, PRODUCT_ID, TRANSACTIONID) VALUES ( ?, ?, ?, ?, ?, ?)",
          [
            args.QUANTITY,
            args.COMPANY_ID,
            args.TYPE,
            args.EMPLOYEE_ID,
            args.PRODUCT_ID,
            args.TRANSACTIONID,
          ]
        );
      },
    });
    this.registry_map.set("23ij", {
      name: "Insert Shipment with record and update",
      desc: "Insert Shipment with record and update",
      meta_data: {
        mainParams: 1,
        optionalParams: 0,
        optionalDesc: [],
      },
      class: "SH",
      proto: async (db_handle, args, value, auxiliary) => {
        // update product quantity active stock add shipment
        await this.getFunction("38dh").proto(db_handle, args, value, auxiliary);
        // update product quantity stored stock add shipment
        await this.getFunction("235s").proto(db_handle, args, value, auxiliary);
      },
    });

    this.a
  }

  _getRegistry() {
    const registryArray = [];
    for (let [key, value] of this.registry_map.entries()) {
      registryArray.push({
        id: key,
        name: value.name,
        desc: value.desc,
        meta_data: value.meta_data,
        class: value.class,
      });
    }
    return registryArray;
  }

  _getRegistryMap() {
    return this.registry_map;
  }

  getFunction(id) {
    return this.registry_map.get(id);
  }
}

const registry = new FunctionRegistry();
module.exports.FunctionRegistry = registry;
