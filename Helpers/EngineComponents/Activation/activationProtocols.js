const { db } = require("../../../DB/db_init.js");
const { queries } = require("../../../DB/queries.js");
const { activationEngineComponents } = require("./activationEngine.js");
const engineHelper = activationEngineComponents;

const ml_to_gallon = 3785.41;
const glycerin_in_mlperGal = 768.912;
const productGallonGlyrcerin = ml_to_gallon + glycerin_in_mlperGal;
const glycerinBottle = 9463.53;

const glycerinConsumption50ml = (productQuantity) => {
  return (
    (((50 * productQuantity) / productGallonGlyrcerin) * glycerin_in_mlperGal) /
    glycerinBottle
  );
};
const glycerinConsumption30ml = (productQuantity) => {
  return (
    (((30 * productQuantity) / productGallonGlyrcerin) * glycerin_in_mlperGal) /
    glycerinBottle
  );
};

const productConsumption50ml = (productQuantity) => {
  return (50 * productQuantity) / ml_to_gallon;
};
const productConsumption30ml = (productQuantity) => {
  return (30 * productQuantity) / ml_to_gallon;
};

const glycerinException = (args) => {
  args.product_components.forEach((component) => {
    if (engineHelper.productType(component.NAME) == 0) {
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
    }
    if (engineHelper.productType(component.NAME) == 1) {
      db(
        queries.product_release.insert_product_release,
        [
          component.PRODUCT_ID,
          args.quantity,
          args.employee_id,
          args.TRANSACTIONID,
        ],
        (err) => {
          if (err) console.log(err);
        }
      );
      db(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            //update product inventory base
            db(queries.product_inventory.update_consumption_stored, [
              result[0].STORED_STOCK - args.quantity,
              component.PRODUCT_ID,
            ]);
          }
        }
      );
    }
    if (engineHelper.productType(component.NAME) == 2) {
      const glycerinComsump50ml = glycerinConsumption50ml(args.quantity);
      const glycerinComsump30ml = glycerinConsumption30ml(args.quantity);

      db(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
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
                    ? productConsumption30ml(args.quantity)
                    : productConsumption50ml(args.quantity)),
                component.PRODUCT_ID,
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
          component.PRODUCT_ID,
          engineHelper.productMLType(args.product_name) == 1
            ? productConsumption30ml(args.quantity)
            : productConsumption50ml(args.quantity),
          args.employee_id,
          args.TRANSACTIONID,
        ],
        (err) => {
          if (err) console.log(err);
        }
      );

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
                    ? glycerinComsump30ml
                    : glycerinComsump50ml),
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
            ? glycerinComsump30ml
            : glycerinComsump50ml,
          args.employee_id,
          args.TRANSACTIONID,
        ],
        (err) => {
          if (err) console.log(err);
        }
      );
    }
  });
};

let success = { status: true, message: "success" };

const Type1_Protocol = (args, exceptions) => {
  try {
    if (!exceptions.includes(args.product_id)) {
      args.product_components.forEach((component) => {
        const productType = engineHelper.productType(component.NAME);
        if (productType === 0) {
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
                db(queries.product_inventory.update_activation_stored, [
                  result[0].STORED_STOCK - args.quantity,
                  component.PRODUCT_ID,
                ]);
              }
            }
          );
        } else if (productType === 1) {
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
        }
      });
    } else {
      glycerinException(args); // Call glycerinException for exceptions
    }
  } catch (err) {
    console.log(err);
    success.status = false;
    success.message = `error running type 1 protocol for product ${args.product_name}`;
  }
};

const Type2_Protocol = (args, exceptions) => {
  try {
    if (!exceptions.includes(args.product_id)) {
      args.product_components.forEach((component) => {
        const productType = engineHelper.productType(component.NAME);

        // Product Type 0: Activation Liquid
        if (productType === 0) {
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
        }

        // Product Type 1: Product Release
        else if (productType === 1) {
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
      } else if (engineHelper.productType(component.NAME) == 1) {
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
            if (!err) {
              db(queries.product_inventory.update_consumption_stored, [
                result[0].STORED_STOCK - args.quantity,
                component.PRODUCT_ID,
              ]);
            }
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
    // Assuming there is a mechanism outside of this snippet to handle success/failure
    success.status = false;
    success.message = `Error running type 3 protocol for product ${args.product_name}`;
  }
};
const Type4_Protocol = (args, exceptions) => {
  try {
    engineHelper.pillBaseAmount(args.product_name, (amount) => {
      args.product_components.forEach((component) => {
        if (engineHelper.productType(component.NAME) == 0) {
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
                  result[0].ACTIVE_STOCK + args.quantity,
                  component.PRODUCT_ID,
                ]);
              }
            }
          );
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
        } else if (engineHelper.productType(component.NAME) == 1) {
          db(
            queries.product_release.get_quantity_by_stored_id_storage,
            [component.PRODUCT_ID],
            (err, result) => {
              if (!err) {
                db(queries.product_inventory.update_consumption_stored, [
                  result[0].STORED_STOCK - args.quantity,
                  component.PRODUCT_ID,
                ]);
                db(queries.product_release.insert_product_release, [
                  component.PRODUCT_ID,
                  args.quantity,
                  args.employee_id,
                  args.TRANSACTIONID,
                ]);
              }
            }
          );
        }
      });
    });
  } catch (err) {
    console.log(err);
    // Assuming there is a mechanism outside of this snippet to handle success/failure
    success.status = false;
    success.message = `Error running type 4 protocol for product ${args.product_name}`;
  }
};

const Type5_Protocol = (args, exceptions) => {
  args.product_components.forEach((component) => {
    const productType = engineHelper.productType(component.NAME);

    // Product Type 0: Activation Liquid
    if (productType === 0) {
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
              result[0].ACTIVE_STOCK + args.quantity,
              component.PRODUCT_ID,
            ]);
          } else {
            console.log(err);
          }
        }
      );
    }

    // Product Type 1: Label
    else if (productType === 1) {
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
          if (!err) {
            db(queries.product_inventory.update_consumption_stored, [
              result[0].STORED_STOCK - args.quantity,
              component.PRODUCT_ID,
            ]);
          } else {
            console.log(err);
          }
        }
      );
    }

    // Product Type 2: Custom Logic
    else if (productType === 2) {
      db(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        (err, result) => {
          if (!err) {
            db(queries.product_inventory.update_consumption_stored, [
              result[0].STORED_STOCK - productConsumption50ml(args.quantity),
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
