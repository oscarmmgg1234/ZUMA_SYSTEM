/* 
============================================
Author: Oscar Maldonado
Date: 04/18/2024
Function Registry
This module is used to store the functions that will be used by the core engine.
============================================
*/

const { query_manager } = require("../../../DB/query_manager");
const { util } = require("../../Utility/Constants");
const knex = query_manager;

class FunctionRegistry {
  constructor() {
    if (FunctionRegistry.instance) {
      return FunctionRegistry.instance;
    }
    this.registry_map = new Map();
    this.init();
  }

  async init() {
    const query = "SELECT * FROM protocol_registry";
    await this.fetchAndUpdateRegistry(query);
    try {
      setInterval(() => this.fetchAndUpdateRegistry(query), 15000); // Adjusted to 30 seconds
    } catch (error) {
      console.error("Error during initialization of FunctionRegistry:", error);
    }
  }
  // deangerous way to solve the problem as it can be a security risk but there is no sesative information in program or device this hosted on, but this allow me to dynamically add functions to the registry and they work as expected with minimal back end intervention
  async fetchAndUpdateRegistry(query) {
    try {
      let registry = await knex.raw(query);
      this.registry_map.clear();
      registry[0].forEach((current) => {
        // Evaluate the protocol string to a async function
        const func = eval(`(${current.protocol})`);
        this.registry_map.set(current.id, func);
      });
      console.log(this.registry_map.size, "functions in registry.");
    } catch (error) {
      console.error("Error fetching and updating registry:", error);
    }
  }

  async getFunction(id) {
    return await this.pollFunction(id);
  }
  // Polling function to check if the function is available in case of calling function before registry class updates map and returns the function
  async pollFunction(id, attempts = 3) {
    return new Promise((resolve, reject) => {
      const attemptFetch = (remainingAttempts) => {
        if (this.registry_map.size > 0) {
          const func = this.registry_map.get(id);
          if (func) {
            resolve(func);
          } else {
            reject(new Error("Function not found."));
          }
        } else if (remainingAttempts > 0) {
          setTimeout(() => attemptFetch(remainingAttempts - 1), 200); // Wait 200ms then retry
        } else {
          reject(
            new Error("Function retrieval failed after maximum attempts.")
          );
        }
      };
      attemptFetch(attempts);
    });
  }
}

//would this function be able to call util.productConsumption in this scope?
const string = async function insertIntoReductionTableLiquid(
  db_handle,
  args,
  product_id,
  custom,
  functionConversion
) {
  await db_handle.raw(
    "INSERT INTO inventory_consumption (PRODUCT_ID, QUANTITY, EMPLOYEE_ID, TRANSACTIONID) VALUES (?, ?, ?, ?)",
    [
      product_id,
      functionConversion.productConsumption(
        args.productBottleSizeML,
        args.productQuantity,
        product_id
      ),
      args.employee_id,
      args.TRANSACTIONID,
    ]
  );
};

module.exports.FunctionRegistry = FunctionRegistry;
