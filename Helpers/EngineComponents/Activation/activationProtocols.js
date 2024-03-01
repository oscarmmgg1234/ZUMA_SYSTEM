const { query } = require("express");
const { db } = require("../../../DB/db_init.js");
const { queries } = require("../../../DB/queries.js");
const { query_manager } = require("../../../DB/query_manager.js");
const { activationEngineComponents } = require("./activationEngine.js");
const { EngineProcessHandler } = require("./EngineProcessHandler.js");
const { dbTransactionExecute } = require("./EngineProcessHandler.js");

const engineProcessHandler = new EngineProcessHandler();
const engineHelper = activationEngineComponents;
const knex = query_manager;

const glycerinCompsumption = (
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

const productConsumption = (
  productBottleSize = 50,
  productQuantity,
  productBaseGallon
) => {
  const productBaseGallon_toMill = productBaseGallon * 3785.41;
  return (productBottleSize * productQuantity) / productBaseGallon_toMill;
};

const glycerinException = (args) => {
  knex.transaction(async (trx) => {
    try {
      for (const component of args.product_components) {
        if (engineHelper.productType(component.NAME) == 0) {
          await trx.raw(queries.activation_product.product_activation_liquid, [
            component.PRODUCT_ID,
            args.quantity,
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          const result = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_active,
            [component.PRODUCT_ID]
          );
          await trx.raw(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.quantity,
            component.PRODUCT_ID,
          ]);
        }
        if (engineHelper.productType(component.NAME) == 1) {
          await trx.raw(queries.product_release.insert_product_release, [
            component.PRODUCT_ID,
            args.quantity,
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          const result = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_storage,
            [component.PRODUCT_ID]
          );
          await trx.raw(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.quantity,
            component.PRODUCT_ID,
          ]);
        }
        if (engineHelper.productType(component.NAME) == 2) {
          const result = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_storage,
            ["14aa3aba"]
          );
          await trx.raw(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK -
              (engineHelper.productMLType(args.product_name) == 1
                ? glycerinCompsumption(1, 26, args.quantity, 30)
                : glycerinCompsumption(1, 26, args.quantity, 50)),
            "14aa3aba",
          ]);
          await trx.raw(queries.product_release.insert_product_release, [
            "14aa3aba",
            engineHelper.productMLType(args.product_name) == 1
              ? glycerinCompsumption(1, 26, args.quantity, 30)
              : glycerinCompsumption(1, 26, args.quantity, 50),
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          //create a function for product consumption
          const result2 = await trx.raw(
            queries.get_quantity_by_stored_id_storage,
            [component.PRODUCT_ID]
          );

          await trx.raw(queries.product_inventory.update_consumption_stored, [
            result2[0].STORED_STOCK -
              (engineHelper.productMLType(args.product_name) == 1
                ? productConsumption(50, args.quantity, 1)
                : productConsumption(30, args.quantity, 1)),
            component.PRODUCT_ID,
          ]);

          await trx.raw(queries.product_release.insert_product_release, [
            component.PRODUCT_ID,
            engineHelper.productMLType(args.product_name) == 1
              ? productConsumption(50, args.quantity, 1)
              : productConsumption(30, args.quantity, 1),
            args.employee_id,
            args.TRANSACTIONID,
          ]);
        }
      }
    } catch (err) {
      console.error(err);
    }
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
  knex.transaction(async (trx) => {
    try {
      for (const component of args.product_components) {
        if (engineHelper.productType(component.NAME) == 0) {
          await trx.raw(queries.activation_product.product_activation_liquid, [
            component.PRODUCT_ID,
            args.quantity,
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          const result = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_active,
            [component.PRODUCT_ID]
          );
          await trx.raw(queries.product_inventory.update_activation, [
            result[0][0].ACTIVE_STOCK + args.quantity,
            component.PRODUCT_ID,
          ]);
          const result2 = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_storage,
            ["c064f810"]
          );
          await trx.raw(queries.product_inventory.update_activation_stored, [
            result2[0][0].STORED_STOCK -
              (engineHelper.productMLType(component.NAME) == 0
                ? args.quantity
                : 0.6 * args.quantity),
            "c064f810",
          ]);
        } else if (engineHelper.productType(component.NAME) == 1) {
          await trx.raw(queries.product_release.insert_product_release, [
            component.PRODUCT_ID,
            args.quantity,
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          const result = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_storage,
            [component.PRODUCT_ID]
          );
          await trx.raw(queries.product_inventory.update_consumption_stored, [
            result[0][0].STORED_STOCK - args.quantity,
            component.PRODUCT_ID,
          ]);
        }
      }
    } catch (err) {
      console.log(err);
      // Assuming there is a mechanism outside of this snippet to handle success/failure
    }
  });
};
// Type 4 Protocol
const Type4_Protocol = (args, exceptions) => {
  engineHelper.pillBaseAmount(args.product_name, (amount) => {
    knex.transaction(async (trx) => {
      for (const component of args.product_components) {
        if (engineHelper.productType(component.NAME) == 0) {
          await trx.raw(queries.activation_product.product_activation_liquid, [
            component.PRODUCT_ID,
            args.quantity,
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          const result = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_active,
            [component.PRODUCT_ID]
          );
          await trx.raw(queries.product_inventory.update_activation, [
            result[0][0].ACTIVE_STOCK + args.quantity,
            component.PRODUCT_ID,
          ]);
          const result2 = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_storage,
            [component.PRODUCT_ID]
          );
          await trx.raw(queries.product_inventory.update_activation_stored, [
            result2[0][0].STORED_STOCK - args.quantity * amount,
            component.PRODUCT_ID,
          ]);
          await trx.raw(queries.product_release.insert_product_release, [
            component.PRODUCT_ID,
            args.quantity * amount,
            args.employee_id,
            args.TRANSACTIONID,
          ]);
        } else if (engineHelper.productType(component.NAME) == 1) {
          await trx.raw(queries.product_release.insert_product_release, [
            component.PRODUCT_ID,
            args.quantity,
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          const result = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_storage,
            [component.PRODUCT_ID]
          );
          await trx.raw(queries.product_inventory.update_consumption_stored, [
            result[0][0].STORED_STOCK - args.quantity,
            component.PRODUCT_ID,
          ]);
        }
      }
    });
  });
};

const Type5_Protocol = (args, exceptions) => {
  knex.transaction(async (trx) => {
    for (const component of args.product_components) {
      const productType = engineHelper.productType(component.NAME);
      // Product Type 0: Activation Liquid
      if (productType === 0) {
        await trx.raw(queries.activation_product.product_activation_liquid, [
          component.PRODUCT_ID,
          args.quantity,
          args.employee_id,
          args.TRANSACTIONID,
        ]);
        const result = await trx.raw(
          queries.product_release.get_quantity_by_stored_id_active,
          [component.PRODUCT_ID]
        );
        await trx.raw(queries.product_inventory.update_activation, [
          result[0][0].ACTIVE_STOCK + args.quantity,
          component.PRODUCT_ID,
        ]);
      }
      // Product Type 1: Label
      else if (productType === 1) {
        await trx.raw(queries.product_release.insert_product_release, [
          component.PRODUCT_ID,
          args.quantity,
          args.employee_id,
          args.TRANSACTIONID,
        ]);
        const result = await trx.raw(
          queries.product_release.get_quantity_by_stored_id_storage,
          [component.PRODUCT_ID]
        );
        await trx.raw(queries.product_inventory.update_consumption_stored, [
          result[0][0].STORED_STOCK - args.quantity,
          component.PRODUCT_ID,
        ]);
      }
      // Product Type 2: Custom Logic
      else if (productType === 2) {
        const result = await trx.raw(
          queries.product_release.get_quantity_by_stored_id_storage,
          [component.PRODUCT_ID]
        );
        await trx.raw(queries.product_inventory.update_consumption_stored, [
          result[0][0].STORED_STOCK - productConsumption50ml(args.quantity),
          component.PRODUCT_ID,
        ]);
        await trx.raw(queries.product_release.insert_product_release, [
          component.PRODUCT_ID,
          productConsumption50ml(args.quantity),
          args.employee_id,
          args.TRANSACTIONID,
        ]);
      }
    }
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
