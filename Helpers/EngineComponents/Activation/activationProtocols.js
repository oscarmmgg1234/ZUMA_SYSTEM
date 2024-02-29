const { db } = require("../../../DB/db_init.js");
const { queries } = require("../../../DB/queries.js");
const { activationEngineComponents } = require("./activationEngine.js");
const { EngineProcessHandler } = require("./EngineProcessHandler.js");
const { dbTransactionExecute } = require("./EngineProcessHandler.js");

const engineProcessHandler = new EngineProcessHandler();
const engineHelper = activationEngineComponents;

const glycerinException = (args) => {
  const proc = () => {
    return new Promise((resolve, reject) => {
      args.product_components.forEach((component, index) => {
        if (engineHelper.productType(component.NAME) == 0) {
          engineProcessHandler.Activation.activation_main_proc(args, component);
        }
        if (engineHelper.productType(component.NAME) == 1) {
          engineProcessHandler.Release.release_label_proc(args, component);
        }
        if (engineHelper.productType(component.NAME) == 2) {
          engineProcessHandler.Release.release_glycerin_proc(args, component);
        }
        if (index == args.product_components.length - 1) {
          resolve();
        }
      });
    });
  };
  dbTransactionExecute(proc, (result) => {
    console.log(result);
  });
};

let success = { status: true, message: "success" };

const Type1_Protocol = (args, exceptions) => {
  const proc = () => {
    return new Promise((resolve, reject) => {
      try {
        if (!exceptions.includes(args.product_id)) {
          args.product_components.forEach((component, index) => {
            const productType = engineHelper.productType(component.NAME);
            if (productType === 0) {
              engineProcessHandler.Activation.activation_main_proc(
                args,
                component
              );

              engineProcessHandler.Release.release_base_proc(args, component);
            } else if (productType === 1) {
              engineProcessHandler.Release.release_label_proc(args, component);
            }
          });
          if (index == args.product_components.length - 1) {
            resolve();
          }
        } else {
          //laundry detergent-----------------------------------------------------
          args.product_components.forEach((component) => {
            if ("78c8da4d" == args.product_id) {
              if (engineHelper.productType(component.NAME) == 0) {
                //product protocol

                engineProcessHandler.Activation.activation_main_proc(
                  args,
                  component
                );

                ////---

                engineProcessHandler.Release.release_base_custom_product_proc(
                  args,
                  "e65b9756"
                );

                //
              }
              if (engineHelper.productType(component.NAME) == 1) {
                engineProcessHandler.Release.release_label_custom_product_proc(
                  args,
                  "4f6d1af3"
                );
                //label protocol
              }
            }

            if ("4d1f188e" == args.product_id) {
              if (engineHelper.productType(component.NAME) == 0) {
                engineProcessHandler.Activation.activation_custom_product_proc(
                  args,
                  "4d1f188e"
                );

                engineProcessHandler.Release.release_base_custom_product_proc(
                  args,
                  "5f21a6fe"
                );
              }

              if (engineHelper.productType(component.NAME) == 1) {
                engineProcessHandler.Release.release_label_custom_product_proc(
                  args,
                  "62c42a38"
                );
              }
            }
          });
          if (index == args.product_components.length - 1) {
            resolve();
          }
          //glycerinException(args); // Call glycerinException for exceptions
        }
      } catch (err) {
        console.log(err);
        success.status = false;
        success.message = `error running type 1 protocol for product ${args.product_name}`;
      }
    });
  };
  dbTransactionExecute(proc, (result) => {
    console.log(result);
  });
};

const Type2_Protocol = (args, exceptions) => {
  try {
    if (!exceptions.includes(args.product_id)) {
      args.product_components.forEach((component) => {
        const productType = engineHelper.productType(component.NAME);

        // Product Type 0: Activation Liquid
        if (productType === 0) {
          engineProcessHandler.Activation.activation_main_proc(args, component);
        }

        // Product Type 1: Product Release
        else if (productType === 1) {
          engineProcessHandler.Release.release_label_proc(args, component);
        }

        // Product Type 2: Custom Logic for Product Consumption
        else if (productType === 2) {
          db(
            queries.product_release.get_quantity_by_stored_id_storage,
            [component.PRODUCT_ID],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                db(queries.product_inventory.update_consumption_stored, [
                  result[0].STORED_STOCK -
                    (engineHelper.productMLType(args.product_name) === 1
                      ? productConsumption30ml(args.quantity)
                      : productConsumption50ml(args.quantity)),
                  component.PRODUCT_ID,
                ]);
              }
            }
          );
          db(queries.product_release.insert_product_release, [
            component.PRODUCT_ID,
            engineHelper.productMLType(args.product_name) === 1
              ? productConsumption30ml(args.quantity)
              : productConsumption50ml(args.quantity),
            args.employee_id,
            args.TRANSACTIONID,
          ]);
        }
      });
      engineProcessHandler.dbTransactionExecute();
    } else {
      // For specified exceptions, use glycerinException
      if (args.product_id == "236gh33j") {
        // pet canine
        //activate pet canine
        db(queries.activation_product.product_activation_liquid, [
          args.product_id,
          args.quantity,
          args.employee_id,
          args.TRANSACTIONID,
        ]);
        db(
          queries.product_release.get_quantity_by_stored_id_active,
          [args.product_id],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              db(queries.product_inventory.update_activation, [
                result[0].ACTIVE_STOCK + args.quantity,
                args.product_id,
              ]);
            }
          }
        );
        //label
        db(queries.product_release.insert_product_release, [
          "rdg43qgy",
          args.quantity,
          args.employee_id,
          args.TRANSACTIONID,
        ]);
        db(
          queries.product_release.get_quantity_by_stored_id_storage,
          ["rdg43qgy"],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              db(queries.product_inventory.update_consumption_stored, [
                result[0].STORED_STOCK - args.quantity,
                "rdg43qgy",
              ]);
            }
          }
        );
        //pet canine gal
        db(
          queries.product_release.get_quantity_by_stored_id_storage,
          ["c8b7621f"],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              db(queries.product_inventory.update_consumption_stored, [
                result[0].STORED_STOCK - productConsumption30ml(args.quantity),
                "c8b7621f",
              ]);
            }
          }
        );
        db(queries.product_release.insert_product_release, [
          "c8b7621f",
          productConsumption30ml(args.quantity),
          args.employee_id,
          args.TRANSACTIONID,
        ]);
      } else if (args.product_id == "342fr32e") {
        db(queries.activation_product.product_activation_liquid, [
          args.product_id,
          args.quantity,
          args.employee_id,
          args.TRANSACTIONID,
        ]);
        db(
          queries.product_release.get_quantity_by_stored_id_active,
          [args.product_id],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              db(queries.product_inventory.update_activation, [
                result[0].ACTIVE_STOCK + args.quantity,
                args.product_id,
              ]);
            }
          }
        );
        //label
        db(queries.product_release.insert_product_release, [
          "23dwsg5h",
          args.quantity,
          args.employee_id,
          args.TRANSACTIONID,
        ]);
        db(
          queries.product_release.get_quantity_by_stored_id_storage,
          ["23dwsg5h"],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              db(queries.product_inventory.update_consumption_stored, [
                result[0].STORED_STOCK - args.quantity,
                "23dwsg5h",
              ]);
            }
          }
        );
        //pet canine gal
        db(
          queries.product_release.get_quantity_by_stored_id_storage,
          ["c8b7621f"],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              db(queries.product_inventory.update_consumption_stored, [
                result[0].STORED_STOCK - productConsumption30ml(args.quantity),
                "c8b7621f",
              ]);
            }
          }
        );
        db(queries.product_release.insert_product_release, [
          "c8b7621f",
          productConsumption30ml(args.quantity),
          args.employee_id,
          args.TRANSACTIONID,
        ]);

        // pet feline
      } else {
        glycerinException(args);
      }
    }
  } catch (err) {
    console.log(err);
    // Assuming there's a mechanism to track success/failure outside this snippet
    success.status = false;
    success.message = `Error running type 2 protocol for product ${args.product_name}`;
  }
};

const Type3_Protocol = (args, exceptions) => {
  try {
    args.product_components.forEach((component) => {
      if (engineHelper.productType(component.NAME) == 0) {
        engineProcessHandler.Activation.activation_type3_proc(args, component);
        engineProcessHandler.Release.release_type3_proc(args, component);
      } else if (engineHelper.productType(component.NAME) == 1) {
        engineProcessHandler.Release.release_label_proc(args, component);
      }
    });
    setTimeout(() => {
      engineProcessHandler.dbTransactionExecute((result) => {
        console.log(result);
      });
    }, 200);
  } catch (err) {
    console.log(err);
    // Assuming there is a mechanism outside of this snippet to handle success/failure
  }
};
// Type 4 Protocol
const Type4_Protocol = (args, exceptions) => {
  const proc = async (connection) => {
    engineHelper.pillBaseAmount(args.product_name, (amount) => {
      args.product_components.forEach(async (component, index) => {
        if (engineHelper.productType(component.NAME) == 0) {
          await engineProcessHandler.Activation.activation_main_proc(
            args,
            component,
            connection
          );

          await engineProcessHandler.Release.release_pills_proc(
            args,
            component,
            amount,
            connection
          );
        } else if (engineHelper.productType(component.NAME) == 1) {
          await engineProcessHandler.Release.release_label_proc(
            args,
            component,
            connection
          );
        }
        if (index == args.product_components.length - 1) {
          console.log("resolve");
        }
      });
    });
  };

  dbTransactionExecute(proc, (result) => {
    console.log(result);
  });
};

const Type5_Protocol = (args, exceptions) => {
  const proc = () => {
    return new Promise((resolve, reject) => {
      args.product_components.forEach((component, index) => {
        const productType = engineHelper.productType(component.NAME);
        // Product Type 0: Activation Liquid
        if (productType === 0) {
          engineProcessHandler.Activation.activation_main_proc(args, component);
        }
        // Product Type 1: Label
        else if (productType === 1) {
          engineProcessHandler.Release.release_label_proc(args, component);
        }
        // Product Type 2: Custom Logic
        else if (productType === 2) {
          engineProcessHandler.Release.release_cream_proc(args, component);
        }
        if (index == args.product_components.length - 1) {
          resolve();
        }
      });
    });
  };
  dbTransactionExecute(proc, (result) => {
    console.log(result);
  });
};

exports.activationProtocols = () => {
  return [
    Type1_Protocol,
    Type2_Protocol,
    Type3_Protocol,
    Type4_Protocol,
    Type5_Protocol,
  ];
};
