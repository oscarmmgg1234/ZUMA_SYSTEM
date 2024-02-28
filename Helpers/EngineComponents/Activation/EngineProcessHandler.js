const { db } = require("../../../DB/db_init.js");
const { queries } = require("../../../DB/queries.js");
const { activationEngineComponents } = require("./activationEngine.js");
const engineHelper = activationEngineComponents;

class EngineProcessHandler {
  constructor() {
    this.queries_to_execute = new Array();
  }

  clearQueries = () => {
    this.queries_to_execute = new Array();
  };
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

  dbTransactionExecute = (callback) => {
    db("BEGIN");
    this.queries_to_execute.forEach((query) => {
      query();
    });
    db("COMMIT", (err) => {
      if (err) {
        db("ROLLBACK");
        this.clearQueries();
        return callback({
          status: false,
          message: "Error executing queries...Rolling back",
        });
      }
      this.clearQueries();
      return callback({
        status: true,
        message: "Queries executed successfully",
      });
    });
  };

  addQuery = (query) => {
    this.queries_to_execute.push(query);
  };

  Activation = {
    activation_kukista_proc: (args, component) => {},
    activation_type3_proc: (args, component) => {
      db(queries.activation_product.product_activation_liquid, [
        component.PRODUCT_ID,
        args.quantity,
        args.employee_id,
        args.TRANSACTIONID,
      ]);
      db(
        queries.product_release.get_quantity_by_stored_id_active,
        [component.PRODUCT_ID],
        (err, result) => {
          if (!err) {
            db(queries.product_inventory.update_activation, [
              result[0].ACTIVE_STOCK +
                (engineHelper.productMLType(component.NAME) == 0
                  ? args.quantity
                  : 0.6 * args.quantity),
              component.PRODUCT_ID,
            ]);
          }
        }
      );
    },
    activation_main_proc: (args, component) => {
      db(queries.activation_product.product_activation_liquid, [
        component.PRODUCT_ID,
        args.quantity,
        args.employee_id,
        args.TRANSACTIONID,
      ]);
      db(
        queries.product_release.get_quantity_by_stored_id_active,
        [component.PRODUCT_ID],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            db(queries.product_inventory.update_activation, [
              result[0].ACTIVE_STOCK + args.quantity,
              component.PRODUCT_ID,
            ]);
          }
        }
      );
    },
    activation_custom_product_proc: (args, product_id) => {
      db(queries.activation_product.product_activation_liquid, [
        product_id,
        args.quantity,
        args.employee_id,
        args.TRANSACTIONID,
      ]);
      db(
        queries.product_release.get_quantity_by_stored_id_active,
        [product_id],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            db(queries.product_inventory.update_activation, [
              result[0].ACTIVE_STOCK + args.quantity,
              product_id,
            ]);
          }
        }
      );
    },
  };

  Release = {
    release_cream_proc: (args, component) => {
      db(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        (err, result) => {
          if (!err) {
            db(queries.product_inventory.update_consumption_stored, [
              result[0].STORED_STOCK -
                this.productConsumption(50, args.quantity, 1),
              component.PRODUCT_ID,
            ]);
          } else {
            console.log(err);
          }
        }
      );

      db(queries.product_release.insert_product_release, [
        component.PRODUCT_ID,
        productConsumption50ml(args.quantity),
        args.employee_id,
        args.TRANSACTIONID,
      ]);
    },
    release_type3_proc: (args, component) => {
      db(
        queries.product_release.get_quantity_by_stored_id_storage,
        ["c064f810"],
        (err, result) => {
          if (!err) {
            db(queries.product_inventory.update_activation_stored, [
              result[0].STORED_STOCK -
                (engineHelper.productMLType(component.NAME) == 0
                  ? args.quantity
                  : 0.6 * args.quantity),
              "c064f810",
            ]);
          }
        }
      );
    },
    release_base_proc: (args, component) => {
      db(queries.product_release.insert_product_release, [
        component.PRODUCT_ID,
        args.quantity,
        args.employee_id,
        args.TRANSACTIONID,
      ]);
      db(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            db(queries.product_inventory.update_consumption_stored, [
              result[0].STORED_STOCK - args.quantity,
              component.PRODUCT_ID,
            ]);
          }
        }
      );
    },
    release_base_custom_product_proc: (args, product_id) => {
      db(queries.product_release.insert_product_release, [
        product_id,
        args.quantity,
        args.employee_id,
        args.TRANSACTIONID,
      ]);
      db(
        queries.product_release.get_quantity_by_stored_id_storage,
        [product_id],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            db(queries.product_inventory.update_consumption_stored, [
              result[0].STORED_STOCK - args.quantity,
              product_id,
            ]);
          }
        }
      );
    },

    release_label_proc: (args, component) => {
      db(queries.product_release.insert_product_release, [
        component.PRODUCT_ID,
        args.quantity,
        args.employee_id,
        args.TRANSACTIONID,
      ]);
      db(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            db(queries.product_inventory.update_consumption_stored, [
              result[0].STORED_STOCK - args.quantity,
              component.PRODUCT_ID,
            ]);
          }
        }
      );
    },
    release_label_custom_product_proc: (args, product_id) => {
      db(queries.product_release.insert_product_release, [
        product_id,
        args.quantity,
        args.employee_id,
        args.TRANSACTIONID,
      ]);
      db(
        queries.product_release.get_quantity_by_stored_id_storage,
        [product_id],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            db(queries.product_inventory.update_consumption_stored, [
              result[0].STORED_STOCK - args.quantity,
              product_id,
            ]);
          }
        }
      );
    },
    release_pills_proc: (args, component, amount) => {
      db(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        (err, result) => {
          if (!err) {
            db(queries.product_inventory.update_activation_stored, [
              result[0].STORED_STOCK - args.quantity * amount,
              component.PRODUCT_ID,
            ]);
          }
        }
      );
      db(queries.product_release.insert_product_release, [
        component.PRODUCT_ID,
        args.quantity * amount,
        args.employee_id,
        args.TRANSACTIONID,
      ]);
    },
    release_glycerin_proc: (args, component) => {
      db(
        queries.product_release.get_quantity_by_stored_id_storage,
        ["14aa3aba"],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            //update product inventory base
            db(
              queries.product_inventory.update_consumption_stored,
              [
                result[0].STORED_STOCK -
                  (engineHelper.productMLType(args.product_name) == 1
                    ? this.glycerinCompsumption(1, 26, args.quantity, 30)
                    : this.glycerinCompsumption(1, 26, args.quantity, 50)),
                "14aa3aba",
              ],
              (err) => {
                if (err) console.log(err);
              }
            );
          }
        }
      );

      db(
        queries.product_release.insert_product_release,
        [
          "14aa3aba",
          engineHelper.productMLType(args.product_name) == 1
            ? this.glycerinCompsumption(1, 26, args.quantity, 30)
            : this.glycerinCompsumption(1, 26, args.quantity, 50),
          args.employee_id,
          args.TRANSACTIONID,
        ],
        (err) => {
          if (err) console.log(err);
        }
      );
    },
  };
}

exports.EngineProcessHandler = EngineProcessHandler;
