const { asPDFName, FieldAlreadyExistsError } = require("pdf-lib");
const {
  transactionUnit,
} = require("../Core/DBLayer/Transaction/transactionUnit");

const commitProductChanges = async (args) => {
  const db_handle = await transactionUnit();
  try {
    if (args.section === "node") {
      if (!args.route) {
        console.log("❌ Missing token or route.");
        return false;
      }

      const routeMap = new Map([
        ["activation", "ACTIVATION_TOKEN"],
        ["reduction", "REDUCTION_TOKEN"],
        ["shipment", "SHIPMENT_TOKEN"]
      ]);

      const currentProduct = args.product || {}; // full product row from DB

      // 🧼 1. Remove old POSTOPS tokens
      const cleansePostops = (str = "") =>
        str
          .split(" ")
          .filter((t) => !t.startsWith("POSTOPS:"))
          .join(" ");

      let preprocessed_activation = cleansePostops(currentProduct.ACTIVATION_TOKEN);
      let preprocessed_reduction  = cleansePostops(currentProduct.REDUCTION_TOKEN);
      let preprocessed_shipment   = cleansePostops(currentProduct.SHIPMENT_TOKEN);

      // 🧩 2. Final token to inject in current route
      const finalizedToken =
        args.route === "reduction"
          ? `PREOPS:9ied PREOPS:549d PREOPS:93je ${args.newToken}`
          : args.newToken;

      // Replace token only for the active route
      if (args.route === "activation") {
        preprocessed_activation = finalizedToken;
      } else if (args.route === "reduction") {
        preprocessed_reduction = finalizedToken;
      } else if (args.route === "shipment") {
        preprocessed_shipment = finalizedToken;
      }

      // 🧪 3. Create new POSTOPS from UI data
      const postopsTokens = (args.postops || []).map((item) => {
        const value = item.ratio ?? 1;
        return `POSTOPS:2047:${item.productID}:${value}:ratio`;
      });

      // 🔗 4. Append POSTOPS to all routes
      const appendPostops = (tokens) =>
        `${tokens} ${postopsTokens.join(" ")}`.trim();

      const final_activation = appendPostops(preprocessed_activation);
      const final_reduction  = appendPostops(preprocessed_reduction);
      const final_shipment   = appendPostops(preprocessed_shipment);

  

      await db_handle.raw(
        `UPDATE product SET ACTIVATION_TOKEN = ?, REDUCTION_TOKEN = ?, SHIPMENT_TOKEN = ? WHERE PRODUCT_ID = ?`,
        [
          final_activation,
          final_reduction,
          final_shipment,
          args.product.PRODUCT_ID
        ]
      );
    }
    else{
      
      if(args.updates.length < 1){
        return false
      }
      

      for(const item of args.updates){
        const query = `UPDATE product SET ${item.field} = ? WHERE PRODUCT_ID = ?`
        await db_handle.raw(query, [item.value, args.PRODUCT_ID])
      }
    }

    await db_handle.commit();
    return true;
  } catch (error) {
    console.error("🔥 Commit Error:", error);
    await db_handle.rollback();
    return false;
  }
};

module.exports = commitProductChanges;
