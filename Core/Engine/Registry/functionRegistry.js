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

const knex = query_manager;

class FunctionRegistry {
  constructor() {
    if (FunctionRegistry.instance) {
      return FunctionRegistry.instance;
    }
    this.Utils = util;
    this.registry_map = new Map();
    this.liquidErrorCorrectingFactor = this.getKErrorCorrectingFactor();
    this.init();
  }

  async getKErrorCorrectingFactor() {
    //get error correction function factor (k)
    const factor = await knex
      .select("ErrorCorrectionFactor(K)")
      .from("system_config");
    console.log(factor)
    //make sure factor is between 0 and 1 as overfilling is the real world problem otherwise we proceed with default value of 1
    if (factor < 1 && factor > 0) {
      return factor;
    }
    return 1;
  }

  init() {
    //get error correction function factor (k)
    //function have a 4 letter rando id
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
      name: "Update Product Partial Stored Stock (like Agaricus) ",
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
              parseFloat(auxiliary.auxiliaryParam) *
                this.liquidErrorCorrectingFactor,
              parseFloat(auxiliary.nextAuxiliaryParam),
              auxiliary.lastAuxiliaryParam
                ? parseFloat(auxiliary.lastAuxiliaryParam) * multiplier
                : args.QUANTITY * multiplier
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
              parseFloat(auxiliary.auxiliaryParam) *
                this.liquidErrorCorrectingFactor,
              parseFloat(auxiliary.nextAuxiliaryParam),
              auxiliary.lastAuxiliaryParam
                ? parseFloat(auxiliary.lastAuxiliaryParam) * multiplier
                : args.QUANTITY * multiplier
            ),
            value,
          ]
        );
      },
    });
    this.registry_map.set("2a1k", {
      name: "Update Product Stored Stock Capsule",
      class: "UP",
      desc: "update product quantity stored capsule",
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
      class: "BC",
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
      class: "BC",
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
        await data_gather_handler(
          args.process_token,
          args,
          args.newTransactionID,
          "start",
          db_handle
        );

        await db_handle.raw(
          "UPDATE transaction_log SET BARCODE_STACK = JSON_ARRAY_APPEND(BARCODE_STACK, '$', ?) WHERE TRANSACTIONID = ?",
          [args.BARCODE_ID, args.newTransactionID]
        );
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
      class: "BC",
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
          args.to_arr()
        );
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
