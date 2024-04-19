const { query_manager } = require("../../../DB/query_manager.js");
const knex = query_manager;

const transactionUnit = async () => {
  return await knex.transaction();
};

exports.transactionUnit = transactionUnit;
