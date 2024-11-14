const {
  transactionUnit,
} = require("../Core/DBLayer/Transaction/transactionUnit");

const commitProductChanges = async (args) => {
  const db_handle = await transactionUnit();
  try {
    //object filed is a vulnarable field, it must be sanitized or can be checked with product list to avoid any sql injection
    for (const object of args.updates) {
      await db_handle.raw(
        `UPDATE product SET ${object.field} = ? WHERE PRODUCT_ID = ?`,
        [object.value, args.PRODUCT_ID]
      );
    }
    if (args.tokenChanged) {
      //preprocess tokens for init of reduction
      //This process must happen for any given reduction, its a pre-requisite
      const preprocessed_reduction =
        "BC:9ied BC:549d BC:93je " + args.REDUCTION_TOKEN;
      await db_handle.raw(
        `UPDATE product SET ACTIVATION_TOKEN = ?, REDUCTION_TOKEN = ?, SHIPMENT_TOKEN = ? WHERE PRODUCT_ID = ?`,
        [
          args.ACTIVATION_TOKEN,
          preprocessed_reduction,
          args.SHIPMENT_TOKEN,
          args.PRODUCT_ID,
        ]
      );
    }
    await db_handle.commit();
    return true;
  } catch (error) {
    await db_handle.rollback();
    return false;
  }
};

module.exports = commitProductChanges;
