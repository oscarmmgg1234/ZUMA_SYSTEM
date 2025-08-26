const { Controller } = require("../../../Controllers/controller.js");
const {
  transactionUnit,
} = require("../../DBLayer/Transaction/transactionUnit.js");

const controller = Controller;

const main = async () => {
  let db_handle;
  try {
    db_handle = await transactionUnit();



    
    await db_handle.rollback();
  } catch (err) {
    await db_handle.rollback();
  }
};
