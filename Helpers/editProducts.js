const {
  transactionUnit,
} = require("../Core/DBLayer/Transaction/transactionUnit");

const commitProductChanges = async (args) => {
  console.log("in commiting function")
  console.log(args.POSTOPS[0].arr.length)
  const db_handle = await transactionUnit();
  try {
    //object filed is a vulnarable field, it must be sanitized or can be checked with product list to avoid any sql injection
    for (const object of args.updates) {
      await db_handle.raw(
        `UPDATE product SET ${object.field} = ? WHERE PRODUCT_ID = ?`,
        [object.value, args.PRODUCT_ID]
      );
    }
    let postops = new Map();
    let postisvalid = false;
    for(const item of args.POSTOPS){
      if(item.arr.length === 0){
        continue;
      }
      for(const arr of item.arr){
      postops.set(arr.product.id,arr.param1 !== "" ? parseFloat(arr.param1) : 1 )
      }
    }
    if(postops.size > 0){
      postisvalid = true;
    }

    const getPOSTTOKEN = () => {
      if(!postisvalid){
        return;
      }
      
      let token = ""
      for(const [key, value] of postops){
        let tokenSchema = ` POSTOPS:2047:${key}:${value}:ratio`
        token = token + tokenSchema;
      }
      return token;
    }

    if (args.tokenChanged || postisvalid) {
      console.log(postisvalid)
      //preprocess tokens for init of reduction
      //This process must happen for any given reduction, its a pre-requisite
      const preprocessed_reduction =
        "PREOPS:9ied PREOPS:549d PREOPS:93je " + args.REDUCTION_TOKEN + (postisvalid ? getPOSTTOKEN() : "")
      const preprocessed_activation = args.ACTIVATION_TOKEN + (postisvalid ? getPOSTTOKEN() : "")
      const preprocessed_shipment = args.SHIPMENT_TOKEN + (postisvalid ? getPOSTTOKEN() : "")
      await db_handle.raw(
        `UPDATE product SET ACTIVATION_TOKEN = ?, REDUCTION_TOKEN = ?, SHIPMENT_TOKEN = ? WHERE PRODUCT_ID = ?`,
        [
          preprocessed_activation,
          preprocessed_reduction,
          preprocessed_shipment,
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
