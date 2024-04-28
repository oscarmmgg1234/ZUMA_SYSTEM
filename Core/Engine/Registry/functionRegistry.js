/* 
============================================
Author: Oscar Maldonado
Date: 04/18/2024
Function Registry
This module is used to store the functions that will be used by the core engine.
============================================
*/
const { lstat } = require("fs");
const { util } = require("../../Utility/Constants");

class FunctionRegistry {
  constructor() {
    if (FunctionRegistry.instance) {
      return FunctionRegistry.instance;
    }
    this.Utils = util;
    this.registry_map = new Map();
    this.init();
  }
  init() {
    //function have a 4 letter rando id
    this.registry_map.set("1023", {
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
      class: "UP",
      proto: async (db_handle, args, value, auxiliary) => {
        // update product quantity stored
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
    this.registry_map.set("2j3w", {
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
      class: "RD",
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
                : args.QUANTITY * multiplier
            ),
            args.EMPLOYEE_ID,
            args.TRANSACTIONID,
          ]
        );
      },
    });
    this.registry_map.set("234d", {
      class: "RD",
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
                : args.QUANTITY * multiplier
            ),
            value,
          ]
        );
      },
    });
    this.registry_map.set("2a1k", {
      class: "UP",
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
      class: "UP",
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
      class: "BC",
      proto: async (db_handle, args, value, auxiliary) => {
        // update barcode status preprocessor reduction init
        await db_handle.raw(
          "UPDATE barcode_log SET Employee = ? WHERE BarcodeID = ?",
          [args.EMPLOYEE_RESPONSIBLE, args.BARCODE_ID]
        );
      },
    });
    this.registry_map.set("549d", {
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
        await db_handle.raw(
          "UPDATE transaction_log SET BARCODE_STACK = JSON_ARRAY_APPEND(BARCODE_STACK, '$', ?) WHERE TRANSACTIONID = ?",
          [args.BARCODE_ID, args.newTransactionID]
        );
      },
    });
    this.registry_map.set("93je", {
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
  }

  getFunction(id) {
    return this.registry_map.get(id);
  }
}

const registry = new FunctionRegistry();
module.exports.FunctionRegistry = registry;
