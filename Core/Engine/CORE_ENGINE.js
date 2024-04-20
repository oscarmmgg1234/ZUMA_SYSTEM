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


const core_engine = async (args, registry) => {
  //console.log(protocol);
  setInterval(async () => {
    const protocol = await symbolTable(args, registry);
    for (let i = 0; i < protocol.size; i++) {
      let current = protocol.getData();
      const val = await current.proto();
      console.log(val);
      protocol.next();
    }
  }, 1000);
  // let db_handle = null;
  // try {
  //   // Getting the transaction object
  //   db_handle = await transactionUnit();
  //   try {
  //     //linked list of function references
  //     const protocol = symbolTable(args.process_token);
  //     for (let i = 0; i < protocol.size; i++) {
  //       let current = protocol.getData();
  //       //process
  //       /*
  //       db_handle: transaction object
  //       args: req object for any need of the function
  //       current.value: can be the id of product to be referenced by the function
  //       current.custom: any additional data needed by the function
  //     */
  //       await current.proto(db_handle, args, current.value, current.custom);
  //       protocol.next();
  //     }
  //     // Placeholder for database operations
  //     // Example: await db_handle.raw('YOUR SQL QUERY HERE');

  //     // If operations are successful, commit the transaction
  //     await db_handle.commit();
  //   } catch (error) {
  //     throw error;
  //   }
  // } catch (error) {
  //   // On error, check if db_handle exists and rollback
  //   if (db_handle) {
  //     await db_handle.rollback();
  //   }
  //   console.error("Transaction failed:", error);
  // }
};

exports.core_engine = core_engine;
