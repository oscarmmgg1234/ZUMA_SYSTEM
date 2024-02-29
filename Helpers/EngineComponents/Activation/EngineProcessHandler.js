const { db } = require("../../../DB/db_init.js");
const { db_async } = require("../../../DB/db_init.js");
const { db_pool } = require("../../../DB/db_init.js");
const { queries } = require("../../../DB/queries.js");
const { activationEngineComponents } = require("./activationEngine.js");
const engineHelper = activationEngineComponents;

class EngineProcessHandler {
  constructor() {}

  //calculate the amount of glycerin used for the product amount
  glycerinCompsumption = (
    glycerinBottleAmountGALLONS,
    productGlycerinAmountOZ,
    productQuantity,
    productBottleSize = 50
  ) => {
    const glycerinBottleAmountGALLONS_toMill =
      glycerinBottleAmountGALLONS * 3785.41;
    const productGlycerinAmountOZ_toMill = productGlycerinAmountOZ * 29.5735;
    const totalMillInMixture =
      glycerinBottleAmountGALLONS_toMill + productGlycerinAmountOZ_toMill;
    return (
      (((productBottleSize * productQuantity) / totalMillInMixture) *
        productGlycerinAmountOZ_toMill) /
      glycerinBottleAmountGALLONS_toMill
    );
  };
  //calculate the amount of product base gallon used for the product amount
  productConsumption = (
    productBottleSize = 50,
    productQuantity,
    productBaseGallon
  ) => {
    const productBaseGallon_toMill = productBaseGallon * 3785.41;
    return (productBottleSize * productQuantity) / productBaseGallon_toMill;
  };

  Activation = {
    activation_kukista_proc: async (args, component, connection) => {},
    activation_type3_proc: async (args, component, connection) => {
      await db_async(
        queries.activation_product.product_activation_liquid,
        [
          component.PRODUCT_ID,
          args.quantity,
          args.employee_id,
          args.TRANSACTIONID,
        ],
        connection
      );
      const result = await db_async(
        queries.product_release.get_quantity_by_stored_id_active,
        [component.PRODUCT_ID],
        connection
      );

      await db_async(
        queries.product_inventory.update_activation,
        [
          result[0].ACTIVE_STOCK +
            (engineHelper.productMLType(component.NAME) == 0
              ? args.quantity
              : 0.6 * args.quantity),
          component.PRODUCT_ID,
        ],
        connection
      );
    },
    activation_main_proc: async (args, component, connection) => {
      await db_async(
        queries.activation_product.product_activation_liquid,
        [
          component.PRODUCT_ID,
          args.quantity,
          args.employee_id,
          args.TRANSACTIONID,
        ],
        connection
      );
      const result = await db_async(
        queries.product_release.get_quantity_by_stored_id_active,
        [component.PRODUCT_ID],
        connection
      );
      await db_async(
        queries.product_inventory.update_activation,
        [result[0].ACTIVE_STOCK + args.quantity, component.PRODUCT_ID],
        connection
      );
    },
    activation_custom_product_proc: async (args, product_id, connection) => {
      await db_async(
        queries.activation_product.product_activation_liquid,
        [product_id, args.quantity, args.employee_id, args.TRANSACTIONID],
        connection
      );
      const result = await db_async(
        queries.product_release.get_quantity_by_stored_id_active,
        [product_id],
        connection
      );
      await db_async(
        queries.product_inventory.update_activation,
        [result[0].ACTIVE_STOCK + args.quantity, product_id],
        connection
      );
    },
  };

  Release = {
    release_cream_proc: async (args, component, connection) => {
      const result = await db_async(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        connection
      );
      await db_async(
        queries.product_inventory.update_consumption_stored,
        [
          result[0].STORED_STOCK -
            this.productConsumption(50, args.quantity, 1),
          component.PRODUCT_ID,
        ],
        connection
      );

      await db_async(
        queries.product_release.insert_product_release,
        [
          component.PRODUCT_ID,
          productConsumption50ml(args.quantity),
          args.employee_id,
          args.TRANSACTIONID,
        ],
        connection
      );
    },
    release_type3_proc: async (args, component, connection) => {
      const result = await db_async(
        queries.product_release.get_quantity_by_stored_id_storage,
        ["c064f810"],
        connection
      );
      await db_async(
        queries.product_inventory.update_activation_stored,
        [
          result[0].STORED_STOCK -
            (engineHelper.productMLType(component.NAME) == 0
              ? args.quantity
              : 0.6 * args.quantity),
          "c064f810",
        ],
        connection
      );
    },
    release_base_proc: async (args, component, connection) => {
      await db_async(
        queries.product_release.insert_product_release,
        [
          component.PRODUCT_ID,
          args.quantity,
          args.employee_id,
          args.TRANSACTIONID,
        ],
        connection
      );
      const result = await db_async(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        connection
      );
      await db_async(
        queries.product_inventory.update_consumption_stored,
        [result[0].STORED_STOCK - args.quantity, component.PRODUCT_ID],
        connection
      );
    },
    release_base_custom_product_proc: async (args, product_id, connection) => {
      await db_async(queries.product_release.insert_product_release, [
        product_id,
        args.quantity,
        args.employee_id,
        args.TRANSACTIONID,
      ]);
      const result = await db_async(
        queries.product_release.get_quantity_by_stored_id_storage,
        [product_id],
        connection
      );
      await db_async(
        queries.product_inventory.update_consumption_stored,
        [result[0].STORED_STOCK - args.quantity, product_id],
        connection
      );
    },

    release_label_proc: async (args, component, connection) => {
      await db_async(
        queries.product_release.insert_product_release,
        [
          component.PRODUCT_ID,
          args.quantity,
          args.employee_id,
          args.TRANSACTIONID,
        ],
        connection
      );
      const result = await db_async(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        connection
      );
      console.log(result);
      await db_async(
        queries.product_inventory.update_consumption_stored,
        [result[0].STORED_STOCK - args.quantity, component.PRODUCT_ID],
        connection
      );
    },
    release_label_custom_product_proc: async (args, product_id, connection) => {
      await db_async(
        queries.product_release.insert_product_release,
        [product_id, args.quantity, args.employee_id, args.TRANSACTIONID],
        connection
      );
      const result = db_async(
        queries.product_release.get_quantity_by_stored_id_storage,
        [product_id],
        connection
      );
      await db_async(
        queries.product_inventory.update_consumption_stored,
        [result[0].STORED_STOCK - args.quantity, product_id],
        connection
      );
    },
    release_pills_proc: async (args, component, amount, connection) => {
      const result = await db_async(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        connection
      );
      await db_async(
        queries.product_inventory.update_activation_stored,
        [result[0].STORED_STOCK - args.quantity * amount, component.PRODUCT_ID],
        connection
      );
      await db_async(
        queries.product_release.insert_product_release,
        [
          component.PRODUCT_ID,
          args.quantity * amount,
          args.employee_id,
          args.TRANSACTIONID,
        ],
        connection
      );
    },
    release_glycerin_proc: async (args, component, connection) => {
      const result = await db_async(
        queries.product_release.get_quantity_by_stored_id_storage,
        ["14aa3aba"],
        connection
      );
      await db_async(
        queries.product_inventory.update_consumption_stored,
        [
          result[0].STORED_STOCK -
            (engineHelper.productMLType(args.product_name) == 1
              ? this.glycerinCompsumption(1, 26, args.quantity, 30)
              : this.glycerinCompsumption(1, 26, args.quantity, 50)),
          "14aa3aba",
        ],
        connection
      );

      await db_async(
        queries.product_release.insert_product_release,
        [
          "14aa3aba",
          engineHelper.productMLType(args.product_name) == 1
            ? this.glycerinCompsumption(1, 26, args.quantity, 30)
            : this.glycerinCompsumption(1, 26, args.quantity, 50),
          args.employee_id,
          args.TRANSACTIONID,
        ],
        connection
      );
    },
  };
}





const dbTransactionExecute = async (args, callback) => {
  db_pool.getConnection(async (err, connection) => {
    try {
      
      connection.beginTransaction();
      await args(connection).then((result) => {
        connection.commit();
      });
      callback({ status: true, message: "commit was a success" });
    } catch (error) {
      console.log("hit");
      connection.rollback();
      callback({
        status: false,
        message: "Transaction failed, rolled back.",
      });
    } finally {
      connection.release();
    }
  });
};


exports.dbTransactionExecute = dbTransactionExecute;

exports.EngineProcessHandler = EngineProcessHandler;
