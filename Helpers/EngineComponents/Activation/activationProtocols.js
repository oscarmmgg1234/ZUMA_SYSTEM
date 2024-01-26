const { db } = require("../../../DB/db_init.js");
const { queries } = require("../../../DB/queries.js");
const { activationEngineComponents } = require("./activationEngine.js");
const engineHelper = activationEngineComponents;

const ml_to_gallon = 3785.41;
const glycerin_in_mlperGal = 768.912;


const glycerinConsumption50ml = (productQuantity) => {
  return ((50*productQuantity / ml_to_gallon) * glycerin_in_mlperGal) / ml_to_gallon;
}
const glycerinConsumption30ml = (productQuantity) => {
  return ((30*productQuantity / ml_to_gallon) * glycerin_in_mlperGal) / ml_to_gallon;
}



const exeptions = ["78c8da4d", "4d1f188e", "cc53b880", "4377889f","db1386a2", "2f24a868", "a897effe", "5f7dbd29",
 "5770875f", "411be6dd", "433retyt", "decad337", "092f5ec4", "bf198df2", "3ae608b6", "erd123se", "d5c06e4f", "403933d3" ];

const glycerinExeption50ml = (products) => {
 products.product_components.forEach((component) => {
  if (engineHelper.productType(component.NAME) == 0) {
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
        if (engineHelper.productType(component.NAME) == 1) {
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
        if (engineHelper.productType(component.NAME) == 2) {
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
                      ((engineHelper.productMLType(args.product_name) == 1
                        ? 30
                        : 50) *
                        args.quantity) /
                        ml_to_gallon,
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
              (engineHelper.productMLType(args.product_name) == 1
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
 })
}

const glycerinExeption30ml = (products) => {
products.product_components.forEach((component) => {
  if (engineHelper.productType(component.NAME) == 0) {
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
            if (engineHelper.productType(component.NAME) == 1) {
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
            if (engineHelper.productType(component.NAME) == 2) {
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
                          ((engineHelper.productMLType(args.product_name) == 1
                            ? 30
                            : 50) *
                            args.quantity) /
                            ml_to_gallon,
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
                  (engineHelper.productMLType(args.product_name) == 1
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
})
}

let success = { status: true, message: "success" };

const Type1_Protocol = (args, exeptions) => {
  try {
    if (!exeptions.includes(args.product_id)) {
      args.product_components.forEach((component) => {
        if (engineHelper.productType(component.NAME) == 0) {
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
        if (engineHelper.productType(component.NAME) == 1) {
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
          if (engineHelper.productType(component.NAME) == 0) {
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

          if (engineHelper.productType(component.NAME) == 1) {
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
          if (engineHelper.productType(component.NAME) == 0) {
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

          if (engineHelper.productType(component.NAME) == 1) {
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
        if (engineHelper.productType(component.NAME) == 0) {
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
        if (engineHelper.productType(component.NAME) == 1) {
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
        if (engineHelper.productType(component.NAME) == 2) {
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
                      ((engineHelper.productMLType(args.product_name) == 1
                        ? 30
                        : 50) *
                        args.quantity) /
                        ml_to_gallon,
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
              (engineHelper.productMLType(args.product_name) == 1
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
    else {
      if("" == args.product_id){
        
      }
      if("" == args.product_id){

      }
      if("" == args.product_id){
        
      }
      if("" == args.product_id){
        
      }
      if("" == args.product_id){
        
      }
      if("" == args.product_id){
        
      }
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
      if (engineHelper.productType(component.NAME) == 0) {
        db.query(
          queries.activation_product.product_activation_liquid,
          [component.PRODUCT_ID, args.quantity, args.employee_id],
          (err, result) => {}
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
                  result[0].ACTIVE_STOCK +
                    (engineHelper.productMLType(component.NAME) == 0
                      ? args.quantity
                      : 0.6 * args.quantity),
                  component.PRODUCT_ID,
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
                result[0].STORED_STOCK -
                  (engineHelper.productMLType(component.NAME) == 0
                    ? args.quantity
                    : 0.6 * args.quantity),
                "c064f810",
              ]);
            }
          }
        );
      }
      if (engineHelper.productType(component.NAME) == 1) {
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
                  // result[0].STORED_STOCK - engineHelper.productMLType(args.name) == 1
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
    const amount = engineHelper.pillBaseAmount(args.product_name);
    args.product_components.forEach((component) => {
      if (engineHelper.productType(component.NAME) == 0) {
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
          [
            component.PRODUCT_ID,
            (args.quantity * amount[1]) / amount[0],
            args.employee_id,
          ],
          (err) => {}
        );
      }
      if (engineHelper.productType(component.NAME) == 1) {
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
    if (engineHelper.productType(component.NAME) == 0) {
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
    if (engineHelper.productType(component.NAME) == 1) {
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
    if (engineHelper.productType(component.NAME) == 2) {
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

exports.activationProtocols = () => {
  return [
    Type1_Protocol,
    Type2_Protocol,
    Type3_Protocol,
    Type4_Protocol,
    Type5_Protocol,
  ];
};
