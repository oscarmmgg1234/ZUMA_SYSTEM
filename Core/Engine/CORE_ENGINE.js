/*
============================================
Core Engine
1.0.0 - Initial release
Author: Oscar Maldonado
Date: 04/18/2024
============================================
*/

const {
  transactionUnit,
} = require("../DBLayer/Transaction/transactionUnit.js");
const { symbolTable } = require("./Token/symbolTable");
const { FunctionRegistry } = require("./Registry/functionRegistry");
const {
  data_gather_handler,
} = require("../../Helpers/transaction_data_gather.js");

const core_engine = async (args) => {
  let db_handle = null;
  try {
    // Getting the transaction object
    db_handle = await transactionUnit();

    try {
      //for reduction the function that is charge of this is in the function registry
      //its self so we need a way to know if a reduction so will use barcode id
      //if its included in args then its a reduction
      if (!Object.keys(args).includes("BARCODE_ID")) {
        await data_gather_handler(
          args.process_token,
          args,
          args.newTransactionID ? args.newTransactionID : args.TRANSACTIONID,
          "start",
          db_handle
        );
      }
      //init token parser and retrive the symbol table
      const protocol = symbolTable(args.process_token, FunctionRegistry);
      for (let i = 0; i < protocol.size; i++) {
        let current = protocol.getData();
        //auxiliary object for custom behaivor
        const auxiliary = {
          auxiliaryParam: current.auxiliaryParam,
          nextAuxiliaryParam: current.nextAuxiliaryParam,
          lastAuxiliaryParam: current.lastAuxiliaryParam,
        };
        //execute the function
        await current.proto(db_handle, args, current.value, auxiliary);
        protocol.next();
      }

      await db_handle.commit();
      await data_gather_handler(
        args.process_token,
        args,
        args.newTransactionID ? args.newTransactionID : args.TRANSACTIONID,
        "end"
      );
      return true;
    } catch (error) {
      throw error;
    }
  } catch (error) {
    if (db_handle) {
      await db_handle.rollback();
    }
    console.error("Error during core engine execution:", error);
    return false;
  }
};

exports.core_engine = core_engine;
