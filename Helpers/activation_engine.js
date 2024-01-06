
const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");

//think about wether its worth creating exeption rules or just create a diffrent protocol for product that meets exeption rule
//think about this a bit more => maintanance, add products, remove product, tweaks to products

// error handling
let success = { status: true, message: "success" };

const ml_to_gallon = 3785.41;

//helper functions
function createProductRegex(productName) {
  // Escape special characters for regex pattern
  try {
    const escapedProductName = productName.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );
    // Create regex pattern with optional suffixes like "Label", "Gal", or "30ml"
    // Also, allow for variations like "PET_Palm Balm" and "Probiotic_Lg" where underscore may be used
    const pattern = new RegExp(
      `\\b${
        escapedProductName.includes("30ml")
          ? escapedProductName.replace("30ml", "")
          : escapedProductName
      }(?:\\s+(?:Label|Gal|30ml))?\\b`,
      "i"
    );

    return pattern; // will capture Fulvic Detox, Fulvic Detox Label, Fulvic Detox Gal, Fulvic & Detox 30ml Label, etc. and
  } catch (err) {
    console.log(err);
    success.status = false;
    success.message = "error creating regex pattern";
  }
  // Create regex pattern with optional suffixes like "Label", "Gal", or "30ml"
  // Also, allow for variations like "PET_Palm Balm" and "Probiotic_Lg" where underscore may be used
  // will capture Fulvic Detox, Fulvic Detox Label, Fulvic Detox Gal, Fulvic & Detox 30ml Label, etc. and
}

//special product exeptions //think about wether its worth creating exeption rules or just create a diffrent protocol for product that meets exeption rule
const exeptions = [];

//detergent //pet-shampoo //Zeolite
//run each protocol and if product matches exeption rule then run exeption protocol
//gets products from db to allow dynamic addition of feature products
const getProducts = (callback) => {
  try {
    db.execute(queries.activation_product.get_products, (err, result) => {
      return callback(result);
    });
  } catch (err) {
    console.log(err);
    success.status = false;
    success.message = "error getting fetching products from db";
  }
};

const product_type = (product) => {
  try {
    if (product.match(/\bLabel\b/)) {
      return 1;
    }
    if (product.match(/\bGal\b/)) {
      return 2;
    } else {
      return 0;
    }
  } catch (err) {
    console.log(err);
    success.status = false;
    success.message = "error getting product type";
  }
};

const product_ml_type = (product) => {
  try {
    if (product.match(/\b30ml\b/)) {
      return 1;
    } else {
      return 0;
    }
  } catch (err) {
    console.log(err);
    success.status = false;
    success.message = "error getting product ml type";
  }
};

const pill_base_amount = (product) => {
  if (product.match("L-Theanine")) {
    return [180, 60];
  }
  if (product.match("L-Lysine")) {
    return [200, 120];
  }
  if (product.match("L-Proline")) {
    return [100, 60];
  }
  if (product.match("Amino Acid")) {
    return [200, 50];
  }
  if (product.match("Probiotic")) {
    return [150, 60];
  }
  if (product.match("Digestive Enzyme")) {
    return [180, 60];
  }
  if (product.match("Colostrum")) {
    return [120, 60];
  }
  if (product.match("Butyric Acid")) {
    return [90, 60];
  }
  if (product.match("Arabinogalactan")) {
    return [90, 60];
  }
  if (product.match("Stress B-Complex & Vtm C")) {
    return [240, 60];
  }
  if (product.match("Coenzyme B-Complex")) {
    return [100, 60];
  }
  if (product.match("PET_Agaricus")) {
    return [60, 30];
  }
};

//foundation of activation engine
const getProductProccessInfo = (args, callback) => {
  //1st step
  const component_regex = createProductRegex(args.PRODUCT_NAME);
  //parses request object and create obj needed for protocols

  getProducts((products) => {
    const process_info = products.filter((product) => {
      return product.PRODUCT_ID === args.PRODUCT_ID;
    });

    const product_components = products.filter((product) => {
      return product.NAME.match(component_regex);
    });

    const formated_components = product_components.filter((product) => {
      if (args.PRODUCT_NAME.includes("30ml")) {
        if (
          product.NAME.includes("30ml") ||
          (product.NAME.includes("Gal") && !product.NAME.includes("Label"))
        ) {
          return product;
        }
      } else {
        if (!product.NAME.includes("30ml")) {
          return product;
        }
      }
    });
    return callback({
      quantity: args.QUANTITY * args.MULTIPLIER,
      process_type: process_info[0].PROCESS_TYPE,
      process_component: process_info[0].PROCESS_COMPONENT_TYPE,
      product_id: process_info[0].PRODUCT_ID,
      product_name: process_info[0].NAME,
      product_components: formated_components,
      employee_id: args.EMPLOYEE_ID,
    });
  });
};

//main function driver
const main_activation = (args) => {
  //main function that chooses type of activation and type component of activation
  getProductProccessInfo(
    args,
    ({
      process_type,
      process_component,
      product_id,
      product_name,
      product_components,
      quantity,
      employee_id,
    }) => {
      process_protocols.forEach((protocol, index) => {
        if (index + 1 == process_type) {
          protocol(
            {
              product_id,
              product_name,
              product_components,
              quantity,
              employee_id,
            },
            exeptions
          );
        }
      });
      if (process_component != null) {
        subprocess_protocols.forEach((protocol, index) => {
          if (index + 1 === process_component) {
            protocol({ process_component, quantity, employee_id }, exeptions);
          }
        });
      }
      if (success.status == false) {
        console.log(success.message);
      }
    }
  );
};

//process slaves
const Type1_Protocol = (args, exeptions) => {
  try {
    if (!exeptions.includes(args.product_id)) {
      args.product_components.forEach((component) => {
        if (product_type(component.NAME) == 0) {
          db.query(queries.activation_product.product_activation_liquid, [
            component.PRODUCT_ID,
            args.quantity,
            args.employee_id,
          ]);
          db.query(
            queries.product_release.get_quantity_by_stored_id_active,
            [component.PRODUCT_ID],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                //update product inventory base

                db.query(queries.product_inventory.update_activation, [
                  result[0].ACTIVE_STOCK + args.quantity,
                  component.PRODUCT_ID,
                ]);
              }
            }
          );
          //reduce stored quantity
          db.query(
            queries.product_release.get_quantity_by_stored_id_storage,
            [component.PRODUCT_ID],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                //update product inventory base
                db.query(queries.product_inventory.update_activation_stored, [
                  result[0].STORED_STOCK - args.quantity,
                  component.PRODUCT_ID,
                ]);
              }
            }
          );
        }
        if (product_type(component.NAME) == 1) {
          db.query(
            queries.product_release.insert_product_release,
            [component.PRODUCT_ID, args.quantity, args.employee_id],
            (err) => {}
          );
          db.query(
            queries.product_release.get_quantity_by_stored_id_storage,
            [component.PRODUCT_ID],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                //update product inventory base
                db.query(queries.product_inventory.update_consumption_stored, [
                  result[0].STORED_STOCK - args.quantity,
                  component.PRODUCT_ID,
                ]);
              }
            }
          );
        }
      });
    } else {
      //run custom code
      args.product_components.forEach((component) => {
        if ("78c8da4d" == args.product_id) {
          if (product_type(component.NAME) == 0) {
            //product protocol
            db.query(queries.activation_product.product_activation_liquid, [
              "78c8da4d",
              args.quantity,
              args.employee_id,
            ]);
            db.query(
              queries.product_release.get_quantity_by_stored_id_active,
              ["78c8da4d"],
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  //update product inventory base
                  db.query(queries.product_inventory.update_activation, [
                    result[0].ACTIVE_STOCK + args.quantity,
                    "78c8da4d",
                  ]);
                }
              }
            );
            ////---
            db.query(
              queries.product_release.get_quantity_by_stored_id_storage,
              ["e65b9756"],
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  //update product inventory base
                  db.query(queries.product_inventory.update_activation_stored, [
                    result[0].STORED_STOCK - args.quantity,
                    "e65b9756",
                  ]);
                }
              }
            );

            //insert log for product release body wash
            db.query(
              queries.product_release.insert_product_release,
              ["e65b9756", args.quantity, args.employee_id],
              (err) => {
                if (err) {
                  console.log(err);
                }
              }
            );
          }

          //

          if (product_type(component.NAME) == 1) {
            db.query(
              queries.product_release.insert_product_release,
              ["4f6d1af3", args.quantity, args.employee_id],
              (err) => {}
            );
            db.query(
              queries.product_release.get_quantity_by_stored_id_storage,
              ["4f6d1af3"],
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  //update product inventory base
                  db.query(
                    queries.product_inventory.update_consumption_stored,
                    [result[0].STORED_STOCK - args.quantity, "4f6d1af3"]
                  );
                }
              }
            );
            //label protocol
          }
        }

        if ("4d1f188e" == args.product_id) {
          if (product_type(component.NAME) == 0) {
            db.query(queries.activation_product.product_activation_liquid, [
              "4d1f188e",
              args.quantity,
              args.employee_id,
            ]);
            db.query(
              queries.product_release.get_quantity_by_stored_id_active,
              ["4d1f188e"],
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  //update product inventory base
                  db.query(queries.product_inventory.update_activation, [
                    result[0].ACTIVE_STOCK + args.quantity,
                    "4d1f188e",
                  ]);
                }
              }
            );
            db.query(
              queries.product_release.get_quantity_by_stored_id_storage,
              ["5f21a6fe"],
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  //update product inventory base
                  db.query(queries.product_inventory.update_activation_stored, [
                    result[0].STORED_STOCK - args.quantity,
                    "5f21a6fe",
                  ]);
                }
              }
            );

            //insert log for product release body wash
            db.query(
              queries.product_release.insert_product_release,
              ["5f21a6fe", args.quantity, args.employee_id],
              (err) => {
                if (err) {
                  console.log(err);
                }
              }
            );
          }

          if (product_type(component.NAME) == 1) {
            db.query(
              queries.product_release.insert_product_release,
              ["62c42a38", args.quantity, args.employee_id],
              (err) => {}
            );
            db.query(
              queries.product_release.get_quantity_by_stored_id_storage,
              ["62c42a38"],
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  //update product inventory base
                  db.query(
                    queries.product_inventory.update_consumption_stored,
                    [result[0].STORED_STOCK - args.quantity, "62c42a38"]
                  );
                }
              }
            );
          }
        }
      });
    }
  } catch (err) {
    console.log(err);
    success.status = false;
    success.message = `error running type 1 protocol for product ${args.product_name}`;
  }
};

const Type2_Protocol = (args, exeptions) => {
  try {
    if (!exeptions.includes(args.product_id)) {
      args.product_components.forEach((component) => {

        if (product_type(component.NAME) == 0) {
          db.query(queries.activation_product.product_activation_liquid, [
            component.PRODUCT_ID,
            args.quantity,
            args.employee_id,
          ]);
          db.query(
            queries.product_release.get_quantity_by_stored_id_active,
            [component.PRODUCT_ID],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                //update product inventory base
                db.query(queries.product_inventory.update_activation, [
                  result[0].ACTIVE_STOCK + args.quantity,
                  component.PRODUCT_ID,
                ]);
              }
            }
          );
        }
        if (product_type(component.NAME) == 1) {
          db.query(
            queries.product_release.insert_product_release,
            [component.PRODUCT_ID, args.quantity, args.employee_id],
            (err) => {
              console.log(err);
          }
          );
          db.query(
            queries.product_release.get_quantity_by_stored_id_storage,
            [component.PRODUCT_ID],
            (err, result) => {
              if (err) {
              } else {
                //update product inventory base
                db.query(queries.product_inventory.update_consumption_stored, [
                  result[0].STORED_STOCK - args.quantity,
                  component.PRODUCT_ID,
                ]);
              }
            }
          );
        }
        if (product_type(component.NAME) == 2) {
          //base
          db.query(
            queries.product_release.get_quantity_by_stored_id_storage,
            [component.PRODUCT_ID],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                //update product inventory base
                db.query(
                  queries.product_inventory.update_consumption_stored,
                  [
                    result[0].STORED_STOCK -
                      ((product_ml_type(args.product_name) == 1 ? 30 : 50) *
                        args.quantity) /
                        ml_to_gallon,
                    component.PRODUCT_ID,
                  ],
                  (err) => {

                  }
                );
              }
            }
          );

          //insert log for product release
          db.query(
            queries.product_release.insert_product_release,
            [
              component.PRODUCT_ID,
              (product_ml_type(args.product_name) == 1
                ? 30
                : 50 * args.quantity) / ml_to_gallon,
              args.employee_id,
            ],
            (err) => {
              if (err) {
              }
            }
          );
        }
      });
    }
  } catch (err) {
    console.log(err);
    success.status = false;
    success.message = `error running type 2 protocol for product ${args.product_name}`;
  }
};
const Type3_Protocol = (args, exeptions) => {
  try {
    args.product_components.forEach((component) => {
      if (product_type(component.NAME) == 0) {
        db.query(
          queries.activation_product.product_activation_liquid,
          [component.PRODUCT_ID, args.quantity, args.employee_id],
          (err, result) => {
          }
        );
        db.query(
          queries.product_release.get_quantity_by_stored_id_active,
          [component.PRODUCT_ID],
          (err, result) => {
            if (err) {
            } else {
              //update product inventory base
              // fix this 0
              db.query(
                queries.product_inventory.update_activation,
                [
                  result[0].ACTIVE_STOCK + (product_ml_type(component.NAME) == 0
                    ? args.quantity
                    : 0.6 * args.quantity),
                    component.PRODUCT_ID  ,
                ],
                (err) => {
                  if (err) console.log(err);
                }
              );
            }
          }
        );
        db.query(
          queries.product_release.get_quantity_by_stored_id_storage,
          ["c064f810"],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              //update product inventory base
              db.query(queries.product_inventory.update_activation_stored, [
                result[0].STORED_STOCK - (product_ml_type(component.NAME) == 0
                  ? args.quantity
                  : 0.6 * args.quantity),
                "c064f810",
              ]);
            }
          }
        );
      }
      if (product_type(component.NAME) == 1) {
        db.query(
          queries.product_release.insert_product_release,
          [component.PRODUCT_ID, args.quantity, args.employee_id],
          (err) => {
            if (err) console.log(err);
          }
        );
        db.query(
          queries.product_release.get_quantity_by_stored_id_storage,
          [component.PRODUCT_ID],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              //update product inventory base
              db.query(
                queries.product_inventory.update_consumption_stored,
                [
                  // result[0].STORED_STOCK - product_ml_type(args.name) == 1
                  //   ? args.quantity
                  //   : (30 / 50) * args.quantity,
                  result[0].STORED_STOCK - args.quantity,
                  component.PRODUCT_ID,
                ],
                (err) => {
                  if (err) console.log(err);
                }
              );
            }
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
    success.status = false;
    success.message = `error running type 3 protocol for product ${args.product_name}`;
  }
};
const Type4_Protocol = (args, exeptions) => {
  try {
    const amount = pill_base_amount(args.product_name);
    args.product_components.forEach((component) => {
      if (product_type(component.NAME) == 0) {
        db.query(queries.activation_product.product_activation_liquid, [
          component.PRODUCT_ID,
          args.quantity,
          args.employee_id,
        ]);
        db.query(
          queries.product_release.get_quantity_by_stored_id_active,
          [component.PRODUCT_ID],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              //update product inventory base
              db.query(queries.product_inventory.update_activation, [
                result[0].ACTIVE_STOCK + args.quantity,
                component.PRODUCT_ID,
              ]);
            }
          }
        );
        db.query(
          queries.product_release.get_quantity_by_stored_id_storage,
          [component.PRODUCT_ID],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              //update product inventory base
              db.query(queries.product_inventory.update_activation_stored, [
                result[0].STORED_STOCK -
                  (args.quantity * amount[1]) / amount[0],
                component.PRODUCT_ID,
              ]);
            }
          }
        );
        db.query(
          queries.product_release.insert_product_release,
          [component.PRODUCT_ID, (args.quantity * amount
            [1] / amount[0]), args.employee_id],
          (err) => {}
        );
      }
      if (product_type(component.NAME) == 1) {
        db.query(
          queries.product_release.get_quantity_by_stored_id_storage,
          [component.PRODUCT_ID],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              //update product inventory base
              db.query(queries.product_inventory.update_consumption_stored, [
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
    success.status = false;
    success.message = `error running type 4 protocol for product ${args.product_name}`;
  }
};
const Type5_Protocol = (args, exeptions) => {
  args.product_components.forEach((component) => {
    if (product_type(component.NAME) == 0) {
      db.query(queries.activation_product.product_activation_liquid, [
        component.PRODUCT_ID,
        args.quantity,
        args.employee_id,
      ]);
      db.query(
        queries.product_release.get_quantity_by_stored_id_active,
        [component.PRODUCT_ID],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            //update product inventory base
            db.query(queries.product_inventory.update_activation, [
              result[0].ACTIVE_STOCK + args.quantity,
              component.PRODUCT_ID,
            ]);
          }
        }
      );
    }
    if (product_type(component.NAME) == 1) {
      //label
      db.query(
        queries.product_release.insert_product_release,
        [component.PRODUCT_ID, args.quantity, args.employee_id],
        (err) => {}
      );
      db.query(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            //update product inventory base
            db.query(queries.product_inventory.update_consumption_stored, [
              result[0].STORED_STOCK - args.quantity,
              component.PRODUCT_ID,
            ]);
          }
        }
      );
    }
    if (product_type(component.NAME) == 2) {
      db.query(
        queries.product_release.get_quantity_by_stored_id_storage,
        [component.PRODUCT_ID],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            //update product inventory base
            db.query(
              queries.product_inventory.update_consumption_stored,
              [
                result[0].STORED_STOCK - (50 * args.quantity) / ml_to_gallon,
                component.PRODUCT_ID,
              ],
              (err) => {}
            );
          }
        }
      );

      //insert log for product release
      db.query(
        queries.product_release.insert_product_release,
        [
          component.PRODUCT_ID,
          (50 * args.quantity) / ml_to_gallon,
          args.employee_id,
        ],
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  });
};

const Type1_Component_Procotol = (args, exeptions) => {
  //50ml bottle
  db.query(
    queries.product_release.insert_product_release,
    ["f8f8d895", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["f8f8d895"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "f8f8d895",
        ]);
      }
    }
  );

  //50ml dropper
  db.query(
    queries.product_release.insert_product_release,
    ["70a2b315", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["70a2b315"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "70a2b315",
        ]);
      }
    }
  );
};

const Type2_Component_Procotol = (args, exeptions) => {
  db.query(
    queries.product_release.insert_product_release,
    ["1b09f3dd", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["1b09f3dd"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "1b09f3dd",
        ]);
      }
    }
  );

  //30ml dropper
  db.query(
    queries.product_release.insert_product_release,
    ["d588ca27", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["d588ca27"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "d588ca27",
        ]);
      }
    }
  );
};

const Type3_Component_Procotol = (args, exeptions) => {};

const Type4_Component_Procotol = (args, exeptions) => {
  //30ml dropper
  db.query(
    queries.product_release.insert_product_release,
    ["d588ca27", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["d588ca27"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "d588ca27",
        ]);
      }
    }
  );
};

const Type7_Component_Procotol = (args, exeptions) => {
  //lg container
  db.query(
    queries.product_release.insert_product_release,
    ["2a531d63", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["2a531d63"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "2a531d63",
        ]);
      }
    }
  );
  // lg lid
  db.query(
    queries.product_release.insert_product_release,
    ["55230435", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["55230435"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "55230435",
        ]);
      }
    }
  );
  //shrink wrap
  db.query(
    queries.product_release.insert_product_release,
    ["c7e573b6", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["c7e573b6"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "c7e573b6",
        ]);
      }
    }
  );
};

const Type8_Component_Procotol = (args, exeptions) => {
  //sm container
  db.query(
    queries.product_release.insert_product_release,
    ["a14d05dd", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["a14d05dd"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "a14d05dd",
        ]);
      }
    }
  );
  //sm lid
  db.query(
    queries.product_release.insert_product_release,
    ["2098a61d", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["2098a61d"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "2098a61d",
        ]);
      }
    }
  );
  //shrink sm
  db.query(
    queries.product_release.insert_product_release,
    ["40a1fbc3", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["40a1fbc3"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "40a1fbc3",
        ]);
      }
    }
  );
};

const Type9_Component_Procotol = (args, exeptions) => {
  db.query(
    queries.product_release.insert_product_release,
    ["234grddd", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["234grddd"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "234grddd",
        ]);
      }
    }
  );
  //xs lid
  db.query(
    queries.product_release.insert_product_release,
    ["dr33esdg", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["dr33esdg"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "dr33esdg",
        ]);
      }
    }
  );
  //shrink sm
  db.query(
    queries.product_release.insert_product_release,
    ["40a1fbc3", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["40a1fbc3"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "40a1fbc3",
        ]);
      }
    }
  );
};

const Type10_Component_Procotol = (args, exeptions) => {
  //cream container
  db.query(
    queries.product_release.insert_product_release,
    ["fb3b898d", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["fb3b898d"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "fb3b898d",
        ]);
      }
    }
  );
  //lids
  db.query(
    queries.product_release.insert_product_release,
    ["ddc96cda", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["ddc96cda"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "ddc96cda",
        ]);
      }
    }
  );
};

const Type11_Component_Procotol = (args, exeptions) => {
  //60ml Dropper
  db.query(
    queries.product_release.insert_product_release,
    ["ff6ec949", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["ff6ec949"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "ff6ec949",
        ]);
      }
    }
  );
};

const Type12_Component_Procotol = (args, exeptions) => {
  //60ml pump
  db.query(
    queries.product_release.insert_product_release,
    ["398bddd5", args.quantity, args.employee_id],
    (err) => {}
  );
  db.query(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["398bddd5"],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //update product inventory base
        db.query(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "398bddd5",
        ]);
      }
    }
  );
};

const process_protocols = [
  Type1_Protocol,
  Type2_Protocol,
  Type3_Protocol,
  Type4_Protocol,
  Type5_Protocol,
];

const subprocess_protocols = [
  Type1_Component_Procotol,
  Type2_Component_Procotol,
  Type3_Component_Procotol,
  Type4_Component_Procotol,
  Type7_Component_Procotol,
  Type8_Component_Procotol,
  Type9_Component_Procotol,
  Type10_Component_Procotol,
  Type11_Component_Procotol,
  Type12_Component_Procotol,
];

exports.activation_engine = main_activation;
