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
const {
  publishProcessEvent,
} = require("../../Services/Publisher/mqPublisher.js");
const { _tokenPreCheck } = require("../Utility/tokenPreCheck.js");

const core_engine = async (args) => {
  let db_handle = null;
  let processValid = null;
  try {
    // Getting the transaction object
    db_handle = args.transactawait transactionUnit();
    let recordHandler = null;

    try {
      //for reduction the function that is charge of this is in the function registry
      //its self so we need a way to know if a reduction so will use barcode id
      //if its included in args then its a reduction

      //token pre check - remove any null refrencing productid  handles
      const mutableToken = await _tokenPreCheck(
        db_handle,
        args.process_token,
        args.PRODUCT_ID
      );
      
      if (!Object.keys(args).includes("BARCODE_ID")) {
        recordHandler = data_gather_handler(
          args.process_token,
          {
            ...args,
            display_type:
              args.src !== "shipment" ? "activation type" : "shipment type",
          },
          args.newTransactionID ? args.newTransactionID : args.TRANSACTIONID,
          "start",
          db_handle
        );
        await recordHandler.start();
      }
      //init token parser and retrive the symbol table
      const protocol = symbolTable(mutableToken, FunctionRegistry);
      var coreResults = [];
      for (let i = 0; i < protocol.size; i++) {
        let current = protocol.getData();
        //auxiliary object for custom behaivor
        const auxiliary = {
          auxiliaryParam: current.auxiliaryParam,
          nextAuxiliaryParam: current.nextAuxiliaryParam,
          lastAuxiliaryParam: current.lastAuxiliaryParam,
        };
        //execute the function
        const dataCapture = recordHandler ? recordHandler : data_gather_handler;
        const exec = await current.proto(
          db_handle,
          { ...args, recordHandler: dataCapture },
          current.value,
          auxiliary
        );
        if (exec) {
          coreResults.push(exec);
          if (exec?.desc == "record") {
            recordHandler = exec.proto;
          }
        }
        protocol.next();
      }
      const record = coreResults.find((item) => item?.desc === "record");
      if (record) {
        processValid = await record.proto.done();
      } else {
        processValid = await recordHandler.done();
      }

      if (processValid) {
        const multiplier = args?.MULTIPLIER
          ? parseFloat(args.MULTIPLIER)
          : null;
        const event = {
          productChain: processValid.chain,
          info: multiplier
            ? { ...processValid.args, QUANTITY: multiplier * args.QUANTITY }
            : { ...processValid.args, QUANTITY: args.QUANTITY },
        };
        publishProcessEvent(event);
      }

      await db_handle.commit();
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
