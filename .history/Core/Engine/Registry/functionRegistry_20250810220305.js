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

  init() {
    //get error correction function factor (k)
    //function have a 4 letter rando id
    this.registry_map.set("4i57", {
      name: "UPDATE pill stock and normalize stock for all products",
      desc: "This will iterate through the product list then actualize stored-stock and sync the product-stock",
      meta_data: {},
      class: "VIRTUALOPS",
      proto: async (db_handle, args, value, auxiliary) => {
        //this will be use to perform that calcualtion same a pill reduction

        //so when product linked the token will be added to the product tokens, so the product link function will add the token
        //editing the token will not touch these functions becase they are VIRTUALOPS think about this a bit more
        //then test this feature
        //add validator step in here
        //consider not allowing the product
        //when dealing with stored since its virtual u might want to add types to registry functions
        //if user linked then those type get nullified for that ype of value
        //then work on 
        //class:funcid:productID:poolID
        if (!poolID) {
          return;
        }
        const multiplier = args.MULTIPLIER ? parseFloat(args.MULTIPLIER) : 1;
        const poolID = auxiliary.auxiliaryParam;
        const mainProductID = value;

        const pool = await db_handle.raw(
          "SELECT * from inv_virtual_stock WHERE poolID = ?",
          [poolID]
        );

        const poolData = JSON.parse(pool[0][0]);
        const linked_products = poolData.LINKED_PRODUCTS;
        const mainProductProcess = linked_products.filter(
          (item) => item.productID == mainProductID
        );

        if (mainProductProcess.length < 1) {
          return;
        }

        await db_handle.raw(
          "UPDATE inv_virtual_stock SET STORED_STOCK = STORED_STOCK - ? WHERE poolID = ?",
          [
            auxiliary.nextAuxiliaryParam
              ? mainProductProcess[0].normalizeRatio *
                args.QUANTITY *
                multiplier
              : args.QUANTITY * multiplier,
            poolID,
          ]
        );

        const sharedStock = await db_handle.raw(
          "SELECT * from inv_virtual_stock WHERE poolID = ?",
          [poolID]
        );

        const shared_stock = sharedStock[0][0].STOCK;

        if (linked_products.length < 1) {
          return;
        }

        const checkProductExist = "SELECT * from product WHERE PRODUCT_ID = ?";
        const sanitizedLinkedProducts = [];
        for (const item of linked_products) {
          const exist = await db_handle.raw(checkProductExist, [
            item.productID,
          ]);
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
      },
    });
    this.registry_map.set("20r4", {
      name: "Update virtual stock",
      desc: "This will allow you to update the virtual stock",
      meta_data: {},
      class: "VIRTUALOPS",
      proto: async (db_handle, args, value, auxiliary) => {},
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
        await this.getFunction("10fj").proto(db_handle, args, value, auxiliary);
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
        await normalizeStock({
          value: 1,
          product: value,
          option: "default",
        });
      },
    });
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
