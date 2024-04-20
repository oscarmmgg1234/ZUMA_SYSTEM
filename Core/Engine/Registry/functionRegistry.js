/* 
============================================
Author: Oscar Maldonado
Date: 04/18/2024
Function Registry
This module is used to store the functions that will be used by the core engine.
============================================
*/

const { query_manager } = require("../../../DB/query_manager");
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

  async fetchAndUpdateRegistry(query) {
    try {
      let registry = await knex.raw(query);
      this.registry_map.clear();
      registry[0].forEach((current) => {
        // Evaluate the protocol string to a async function
        const func = eval(`(${current.protocol})`);
        this.registry_map.set(current.id, func);
      });
    } catch (error) {
      console.error("Error fetching and updating registry:", error);
    }
  }

  async getFunction(id) {
    if (this.registry_map.size === 0) return null; // Corrected check
    return this.registry_map.get(id);
  }
}

module.exports.FunctionRegistry = FunctionRegistry;
