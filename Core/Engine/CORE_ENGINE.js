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

const core_engine = async (args) => {
  let db_handle = null;
  try {
    // Getting the transaction object
    db_handle = await transactionUnit();
    //linked list of function references
    const protocol= symbolTable(args.process_token);
    for (let i = 0; i < protocol.size; i++) {
      let current = protocol.getData();
      //process
      await current.proto(db_handle, args, current.value, current.custom);
      protocol.next();
    }
    // Placeholder for database operations
    // Example: await db_handle.raw('YOUR SQL QUERY HERE');

    // If operations are successful, commit the transaction
    await db_handle.commit();
  } catch (error) {
    // On error, check if db_handle exists and rollback
    if (db_handle) {
      await db_handle.rollback();
    }
    console.error("Transaction failed:", error);
  }
};

exports.core_engine = core_engine;
