const { Controller } = require("../../../Controllers/controller.js");
const {
  transactionUnit,
} = require("../../DBLayer/Transaction/transactionUnit.js");

const controller = Controller;

const getProductTokens = async (db_handle, productID) => {
  try{
    await 
  }catch(err){
    throw new Error("Product not found")
  }
}


const main = async (_params) => {
  let db_handle;
  try {
    db_handle = await transactionUnit();




    await db_handle.rollback();
  } catch (err) {
    await db_handle.rollback();
  }
};
