const {transactionUnit} = require("../Core/DBLayer/Transaction/transactionUnit");

const commitProductChanges = async (args) => {
  const db_handle = await transactionUnit();

  try {
    for (const object of args.updates) {
      await db_handle.raw(
        `UPDATE product SET ${object.field} = ? WHERE PRODUCT_ID = ?`,
        [object.value, args.PRODUCT_ID]
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
