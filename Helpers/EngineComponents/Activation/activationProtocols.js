const { queries } = require("../../../DB/queries.js");
const { query_manager } = require("../../../DB/query_manager.js");
const { activationEngineComponents } = require("./activationEngine.js");
const { TransactionHandler } = require("../transactionErrorHandler.js");

const transHandler = new TransactionHandler();
const engineHelper = activationEngineComponents;
const knex = query_manager;

const subProtocolHandler = async (
  args,
  exceptions,
  subProtocol,
  subprocess_comp_id,
  trx
) => {
  if (subprocess_comp_id != null) {
    for (var i = 0; i < subProtocol.length; i++) {
      if (i + 1 == subprocess_comp_id) {
        await subProtocol[i](
          {
            process_component: subprocess_comp_id,
            quantity: args.quantity,
            employee_id: args.employee_id,
            TRANSACTIONID: args.TRANSACTIONID,
          },
          exceptions,
          trx
        );
      }
    }
  }
};

const glycerinCompsumption = async (
  glycerinBottleAmountGALLONS,
  productGlycerinAmountOZ,
  productQuantity,
  productBottleSize = 50,
  product_id
) => {
  const glycerinBottleSize = await knex.raw(
    "SELECT GlycerinGallonUnitConstant FROM system_config WHERE system_config.Index = 1"
  );
  const glycerinRatioOZ = await knex.raw(
    "SELECT GLYCERIN_RATIO_OZ FROM product WHERE product.ID = ?",
    [product_id]
  );

  const glycerinBottleAmountGALLONS_toMill =
    glycerinBottleSize[0][0].GlycerinGallonUnitConstant * 3785.41;
  const productGlycerinAmountOZ_toMill =
    glycerinRatioOZ[0][0].GLYCERIN_RATIO_OZ * 29.5735;
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

const glycerinException = async (
  args,
  exceptions,
  subProtocol,
  subprocess_comp_id,
  callback
) => {
  try {
    await knex.transaction(async (trx) => {
      try {
        for (const component of args.product_components) {
          if (engineHelper.productType(component.NAME) == 0) {
            await trx.raw(
              queries.activation_product.product_activation_liquid,
              [
                component.PRODUCT_ID,
                args.quantity,
                args.employee_id,
                args.TRANSACTIONID,
              ]
            );
            const result = await trx.raw(
              queries.product_release.get_quantity_by_stored_id_active,
              [component.PRODUCT_ID]
            );
            await trx.raw(queries.product_inventory.update_activation, [
              result[0][0].ACTIVE_STOCK + args.quantity,
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
              result[0][0].STORED_STOCK - args.quantity,
              component.PRODUCT_ID,
            ]);
          }
          if (engineHelper.productType(component.NAME) == 2) {
            const result = await trx.raw(
              queries.product_release.get_quantity_by_stored_id_storage,
              ["14aa3aba"]
            );

            await trx.raw(queries.product_inventory.update_consumption_stored, [
              result[0][0].STORED_STOCK -
                (engineHelper.productMLType(args.product_name) == 1
                  ? await glycerinCompsumption(
                      1,
                      26,
                      args.quantity,
                      30,
                      args.product_id
                    )
                  : await glycerinCompsumption(
                      1,
                      26,
                      args.quantity,
                      50,
                      args.product_id
                    )),
              "14aa3aba",
            ]);

            await trx.raw(queries.product_release.insert_product_release, [
              "14aa3aba",
              engineHelper.productMLType(args.product_name) == 1
                ? await glycerinCompsumption(
                    1,
                    26,
                    args.quantity,
                    30,
                    args.product_id
                  )
                : await glycerinCompsumption(
                    1,
                    26,
                    args.quantity,
                    50,
                    args.product_id
                  ),
              args.employee_id,
              args.TRANSACTIONID,
            ]);

            //create a function for product consumption
            const result2 = await trx.raw(
              queries.product_release.get_quantity_by_stored_id_storage,
              [component.PRODUCT_ID]
            );
            //cannot execute product consumption function
            await trx.raw(queries.product_inventory.update_consumption_stored, [
              result2[0][0].STORED_STOCK -
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
        await subProtocolHandler(
          args,
          exceptions,
          subProtocol,
          subprocess_comp_id,
          trx
        );
      } catch (err) {
        throw err;
      }
    });
    return callback(transHandler.sucessHandler());
  } catch (err) {
    return callback(transHandler.errorHandler(err));
  }
};

const Type1_Protocol = async (
  args,
  exceptions,
  subProtocol,
  subprocess_comp_id,
  callback
) => {
  try {
    if (!exceptions.includes(args.product_id)) {
      await knex.transaction(async (trx) => {
        try {
          for (const component of args.product_components) {
            const productType = engineHelper.productType(component.NAME);
            if (productType === 0) {
              await trx.raw(
                queries.activation_product.product_activation_liquid,
                [
                  component.PRODUCT_ID,
                  args.quantity,
                  args.employee_id,
                  args.TRANSACTIONID,
                ]
              );
              const result = await trx.raw(
                queries.product_release.get_quantity_by_stored_id_active,
                [component.PRODUCT_ID]
              );
              await trx.raw(queries.product_inventory.update_activation, [
                result[0][0].ACTIVE_STOCK + args.quantity,
                component.PRODUCT_ID,
              ]);

              await trx.raw(queries.product_release.insert_product_release, [
                component.PRODUCT_ID,
                args.quantity,
                args.employee_id,
                args.TRANSACTIONID,
              ]);
              const result2 = await trx.raw(
                queries.product_release.get_quantity_by_stored_id_storage,
                [component.PRODUCT_ID]
              );
              await trx.raw(
                queries.product_inventory.update_consumption_stored,
                [
                  result2[0][0].STORED_STOCK - args.quantity,
                  component.PRODUCT_ID,
                ]
              );
            } else if (productType === 1) {
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
              await trx.raw(
                queries.product_inventory.update_consumption_stored,
                [
                  result[0][0].STORED_STOCK - args.quantity,
                  component.PRODUCT_ID,
                ]
              );
            }
          }
          await subProtocolHandler(
            args,
            exceptions,
            subProtocol,
            subprocess_comp_id,
            trx
          );
        } catch (err) {
          throw err;
        }
      });
      return callback(transHandler.sucessHandler());
    } else {
      //laundry detergent-----------------------------------------------------
      await knex.transaction(async (trx) => {
        try {
          for (const component of args.product_components) {
            if ("78c8da4d" == args.product_id) {
              if (engineHelper.productType(component.NAME) == 0) {
                await trx.raw(
                  queries.activation_product.product_activation_liquid,
                  [
                    component.PRODUCT_ID,
                    args.quantity,
                    args.employee_id,
                    args.TRANSACTIONID,
                  ]
                );
                const result = await trx.raw(
                  queries.product_release.get_quantity_by_stored_id_active,
                  [component.PRODUCT_ID]
                );
                await trx.raw(queries.product_inventory.update_activation, [
                  result[0][0].ACTIVE_STOCK + args.quantity,
                  component.PRODUCT_ID,
                ]);

                await trx.raw(queries.product_release.insert_product_release, [
                  "e65b9756",
                  args.quantity,
                  args.employee_id,
                  args.TRANSACTIONID,
                ]);
                const result2 = await trx.raw(
                  queries.product_release.get_quantity_by_stored_id_storage,
                  ["e65b9756"]
                );
                await trx.raw(
                  queries.product_inventory.update_consumption_stored,
                  [result2[0][0].STORED_STOCK - args.quantity, "e65b9756"]
                );
              }
              if (engineHelper.productType(component.NAME) == 1) {
                await trx.raw(queries.product_release.insert_product_release, [
                  "4f6d1af3",
                  args.quantity,
                  args.employee_id,
                  args.TRANSACTIONID,
                ]);
                const result = await trx.raw(
                  queries.product_release.get_quantity_by_stored_id_storage,
                  ["4f6d1af3"]
                );
                await trx.raw(
                  queries.product_inventory.update_consumption_stored,
                  [result[0][0].STORED_STOCK - args.quantity, "4f6d1af3"]
                );
              }
              await subProtocolHandler(
                args,
                exceptions,
                subProtocol,
                subprocess_comp_id,
                trx
              );
            }

            if ("4d1f188e" == args.product_id) {
              if (engineHelper.productType(component.NAME) == 0) {
                await trx.raw(
                  queries.activation_product.product_activation_liquid,
                  [
                    "4d1f188e",
                    args.quantity,
                    args.employee_id,
                    args.TRANSACTIONID,
                  ]
                );
                const result = await trx.raw(
                  queries.product_release.get_quantity_by_stored_id_active,
                  ["4d1f188e"]
                );
                await trx.raw(queries.product_inventory.update_activation, [
                  result[0][0].ACTIVE_STOCK + args.quantity,
                  "4d1f188e",
                ]);

                await trx.raw(queries.product_release.insert_product_release, [
                  "5f21a6fe",
                  args.quantity,
                  args.employee_id,
                  args.TRANSACTIONID,
                ]);
                const result2 = await trx.raw(
                  queries.product_release.get_quantity_by_stored_id_storage,
                  ["5f21a6fe"]
                );
                await trx.raw(
                  queries.product_inventory.update_consumption_stored,
                  [result2[0][0].STORED_STOCK - args.quantity, "5f21a6fe"]
                );
              }

              if (engineHelper.productType(component.NAME) == 1) {
                await trx.raw(queries.product_release.insert_product_release, [
                  "62c42a38",
                  args.quantity,
                  args.employee_id,
                  args.TRANSACTIONID,
                ]);
                const result = await trx.raw(
                  queries.product_release.get_quantity_by_stored_id_storage,
                  ["62c42a38"]
                );
                await trx.raw(
                  queries.product_inventory.update_consumption_stored,
                  [result[0][0].STORED_STOCK - args.quantity, "62c42a38"]
                );
              }
              await subProtocolHandler(
                args,
                exceptions,
                subProtocol,
                subprocess_comp_id,
                trx
              );
            }
          }
        } catch (err) {
          throw err;
        }
      });
      return callback(transHandler.sucessHandler());
    }
  } catch (err) {
    return callback(transHandler.errorHandler(err));
  }
};

const Type2_Protocol = async (
  args,
  exceptions,
  subProtocol,
  subprocess_comp_id,
  callback
) => {
  try {
    if (!exceptions.includes(args.product_id)) {
      await knex.transaction(async (trx) => {
        try {
          for (const component of args.product_components) {
            const productType = engineHelper.productType(component.NAME);

            // Product Type 0: Activation Liquid
            if (productType === 0) {
              await trx.raw(
                queries.activation_product.product_activation_liquid,
                [
                  component.PRODUCT_ID,
                  args.quantity,
                  args.employee_id,
                  args.TRANSACTIONID,
                ]
              );
              const result = await trx.raw(
                queries.product_release.get_quantity_by_stored_id_active,
                [component.PRODUCT_ID]
              );
              await trx.raw(queries.product_inventory.update_activation, [
                result[0][0].ACTIVE_STOCK + args.quantity,
                component.PRODUCT_ID,
              ]);
            }

            // Product Type 1: Product Release
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
              await trx.raw(
                queries.product_inventory.update_consumption_stored,
                [
                  result[0][0].STORED_STOCK - args.quantity,
                  component.PRODUCT_ID,
                ]
              );
            }

            // Product Type 2: Custom Logic for Product Consumption
            else if (productType === 2) {
              const result = await trx.raw(
                queries.product_release.get_quantity_by_stored_id_storage,
                [component.PRODUCT_ID]
              );
              await trx.raw(
                queries.product_inventory.update_consumption_stored,
                [
                  result[0][0].STORED_STOCK -
                    (engineHelper.productMLType(args.product_name) === 1
                      ? productConsumption(30, args.quantity, 1)
                      : productConsumption(50, args.quantity, 1)),
                  component.PRODUCT_ID,
                ]
              );
              await trx.raw(queries.product_release.insert_product_release, [
                component.PRODUCT_ID,
                engineHelper.productMLType(args.product_name) === 1
                  ? productConsumption(30, args.quantity, 1)
                  : productConsumption(50, args.quantity, 1),
                args.employee_id,
                args.TRANSACTIONID,
              ]);
            }
          }
          await subProtocolHandler(
            args,
            exceptions,
            subProtocol,
            subprocess_comp_id,
            trx
          );
        } catch (err) {
          throw err;
        }
      });

      return callback(transHandler.sucessHandler());
    } else {
      // For specified exceptions, use glycerinException
      if (args.product_id == "236gh33j") {
        // pet canine
        //activate pet canine
        await trx.transaction(async (trx) => {
          await trx.raw(queries.activation_product.product_activation_liquid, [
            args.product_id,
            args.quantity,
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          const result = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_active,
            [args.product_id]
          );

          await trx.raw(queries.product_inventory.update_activation, [
            result[0][0].ACTIVE_STOCK + args.quantity,
            args.product_id,
          ]);
          //label
          await trx.raw(queries.product_release.insert_product_release, [
            "rdg43qgy",
            args.quantity,
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          const result2 = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_storage,
            ["rdg43qgy"]
          );
          await trx.raw(queries.product_inventory.update_consumption_stored, [
            result2[0][0].STORED_STOCK - args.quantity,
            "rdg43qgy",
          ]);

          //pet canine gal
          const result3 = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_storage,
            ["c8b7621f"]
          );
          await trx.raw(queries.product_inventory.update_consumption_stored, [
            result3[0][0].STORED_STOCK -
              productConsumption(30, args.quantity, 1),
            "c8b7621f",
          ]);
          await trx.raw(queries.product_release.insert_product_release, [
            "c8b7621f",
            productConsumption(30, args.quantity, 1),
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          await subProtocolHandler(
            args,
            exceptions,
            subProtocol,
            subprocess_comp_id,
            trx
          );
        });
      } else if (args.product_id == "342fr32e") {
        await trx.transaction(async (trx) => {
          await trx.raw(queries.activation_product.product_activation_liquid, [
            args.product_id,
            args.quantity,
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          const result = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_active,
            [args.product_id]
          );
          await trx.raw(queries.product_inventory.update_activation, [
            result[0][0].ACTIVE_STOCK + args.quantity,
            args.product_id,
          ]);
          //label
          await trx.raw(queries.product_release.insert_product_release, [
            "23dwsg5h",
            args.quantity,
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          const result2 = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_storage,
            ["23dwsg5h"]
          );
          await trx.raw(queries.product_inventory.update_consumption_stored, [
            result2[0][0].STORED_STOCK - args.quantity,
            "23dwsg5h",
          ]);
          //pet canine gal
          const result3 = await trx.raw(
            queries.product_release.get_quantity_by_stored_id_storage,
            ["c8b7621f"]
          );
          await trx.raw(queries.product_inventory.update_consumption_stored, [
            result3[0][0].STORED_STOCK -
              productConsumption(30, args.quantity, 1),
            "c8b7621f",
          ]);
          await trx.raw(queries.product_release.insert_product_release, [
            "c8b7621f",
            productConsumption(30, args.quantity, 1),
            args.employee_id,
            args.TRANSACTIONID,
          ]);
          await subProtocolHandler(
            args,
            exceptions,
            subProtocol,
            subprocess_comp_id,
            trx
          );
        });
        return callback(transHandler.sucessHandler());
        // pet feline
      } else {
        await glycerinException(
          args,
          exceptions,
          subProtocol,
          subprocess_comp_id,
          (status) => {
            return callback(status);
          }
        );
      }
    }
  } catch (err) {
    console.log(err);
    return callback(transHandler.errorHandler(err));
  }
};

const Type3_Protocol = async (
  args,
  exceptions,
  subProtocol,
  subprocess_comp_id,
  callback
) => {
  try {
    await knex.transaction(async (trx) => {
      try {
        for (const component of args.product_components) {
          if (engineHelper.productType(component.NAME) == 0) {
            await trx.raw(
              queries.activation_product.product_activation_liquid,
              [
                component.PRODUCT_ID,
                args.quantity,
                args.employee_id,
                args.TRANSACTIONID,
              ]
            );
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
            await trx.raw(queries.product_release.insert_product_release, [
              "c064f810",
              engineHelper.productMLType(component.NAME) == 0
                ? args.quantity
                : 0.6 * args.quantity,
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
        await subProtocolHandler(
          args,
          exceptions,
          subProtocol,
          subprocess_comp_id,
          trx
        );
        return callback(transHandler.sucessHandler());
      } catch (err) {
        throw err;
      }
    });
  } catch (err) {
    return callback(transHandler.errorHandler(err));
  }
};
// Type 4 Protocol
const Type4_Protocol = async (
  args,
  exceptions,
  subProtocol,
  subprocess_comp_id,
  callback
) => {
  const amount = await engineHelper.pillBaseAmount(args.product_name);
  try {
    await knex.transaction(async (trx) => {
      try {
        // const processComponents = await engineProcessHandler.processComponents(trx);
        //can i inject this instance of trx into a seperate array in the application
        // inject subcomponent process into this to create a single transaction(db)

        for (const component of args.product_components) {
          if (engineHelper.productType(component.NAME) == 0) {
            await trx.raw(
              queries.activation_product.product_activation_liquid,
              [
                component.PRODUCT_ID,
                args.quantity,
                args.employee_id,
                args.TRANSACTIONID,
              ]
            );
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
        await subProtocolHandler(
          args,
          exceptions,
          subProtocol,
          subprocess_comp_id,
          trx
        );
      } catch (err) {
        throw err;
      }
    });
    return callback(transHandler.sucessHandler());
  } catch (err) {
    return callback(transHandler.errorHandler(err));
  }
};

const Type5_Protocol = async (
  args,
  exceptions,
  subProtocol,
  subprocess_comp_id,
  callback
) => {
  try {
    await knex.transaction(async (trx) => {
      try {
        for (const component of args.product_components) {
          const productType = engineHelper.productType(component.NAME);
          // Product Type 0: Activation Liquid
          if (productType === 0) {
            await trx.raw(
              queries.activation_product.product_activation_liquid,
              [
                component.PRODUCT_ID,
                args.quantity,
                args.employee_id,
                args.TRANSACTIONID,
              ]
            );
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
        await subProtocolHandler(
          args,
          exceptions,
          subProtocol,
          subprocess_comp_id,
          trx
        );
      } catch (err) {
        throw err;
      }
    });
    return callback(transHandler.sucessHandler());
  } catch (err) {
    return callback(transHandler.errorHandler(err));
  }
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
