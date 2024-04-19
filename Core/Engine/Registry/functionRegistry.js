/* 
============================================
Author: Oscar Maldonado
Date: 04/18/2024
Function Registry
This module is used to store the functions that will be used by the core engine.
============================================
*/

const { db_registry } = require("../DBLayer/DAO/registry");

class FunctionRegistry {
  constructor() {}
  getFunction(key, id) {
    if (key == "AC") {
      return this.activation_reg.get(id);
    }
    if (key == "RD") {
      return this.reduction_reg.get(id);
    }
    if (key == "SH") {
      return this.shipment_reg.get(id);
    }
    if (key == "UP") {
      return this.update_reg.get(id);
    }
  }
  activation_reg = new Map();
  reduction_reg = new Map();
  shipment_reg = new Map();
  update_reg = new Map();
}

const registry = new FunctionRegistry();
//activation registry
registry.activation_reg.set("00321", (db_handle, args, value, custom) => {
  //Insert Row for Activation Log
  db_registry.getFunction("AC", "00321")(db_handle, args, value, custom);
});

exports.FunctionRegistry = FunctionRegistry;
