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
    this.registry_map = new Map();
    this.init();
  }

  async init() {
    const query = "SELECT * FROM protocol_registry";
    try {
      // Perform initial fetch
      await this.fetchAndUpdateRegistry(query);
      // Set up polling
      setInterval(() => this.fetchAndUpdateRegistry(query), 30000); // Adjusted to 30 seconds
    } catch (error) {
      console.error("Error during initialization of FunctionRegistry:", error);
    }
  }

  async fetchAndUpdateRegistry(query) {
    try {
      let registry = await knex.raw(query)[0];
      registry.forEach((current) => {
        this.registry_map.set(current.id, current.protocol);
      });
    } catch (error) {
      console.error("Error fetching and updating registry:", error);
    }
  }

  getFunction(id) {
    if (this.registry_map.size === 0) return null; // Corrected check
    return this.registry_map.get(id);
  }
}

module.exports = FunctionRegistry;
