const {
  transactionUnit,
} = require("../Core/DBLayer/Transaction/transactionUnit");

const commitProductChanges = async (args) => {
  const db_handle = await transactionUnit();

  try {
    for (const object of args.updates) {
      await db_handle.raw(
        `UPDATE product SET ${object.field} = ? WHERE PRODUCT_ID = ?`,
        [object.value, args.PRODUCT_ID]
      );
    }
    if (args.tokenChanged) {
      const preprocessed_reduction = "BC:9ied BC:549d BC:93je " + args.REDUCTION_TOKEN;
      await db_handle.raw(
        `UPDATE product SET ACTIVATION_TOKEN = ? and REDUCTION_TOKEN = ? and SHIPMENT_TOKEN = ? WHERE PRODUCT_ID = ?`,
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
