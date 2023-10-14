const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");

const ml_to_gallon = 3785.41;

const activation_engine = (args) => {
  //parasite detox
  if (args.PRODUCT_ID == "0a1018a3") {
    //add product to activation log for p
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["0a1018a3"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "0a1018a3",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["fe260002"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "fe260002",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["fe260002", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["3c30ff9c", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["3c30ff9c"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "3c30ff9c",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );

    //parasite component => fe260002
    //label => 3c30ff9c
  }

  //--------------------------------------------------------------------------------------
  //Candidad
  //CANDIDAD
  if (args.PRODUCT_ID == "2f24a868") {
    //add product to activation log for p
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["2f24a868"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "2f24a868",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["5157beef"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "5157beef",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["5157beef", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["c3485a8e", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["c3485a8e"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "c3485a8e",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );

    //candidad component => 5157beef
    //label => c3485a8e
  }
  //--------------------------------------------------------------------------------------
  //pet wormwoood
  if (args.PRODUCT_ID == "c07bf5ef") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["c07bf5ef"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "c07bf5ef",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["c8b7621f"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "c8b7621f",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["c8b7621f", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["550f5426", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["550f5426"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "550f5426",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );

    //pet warmwood component => c8b7621f
    //label => 550f5426
  }
  //--------------------------------------------------------------------------------------
  //lymphatic detox
  if (args.PRODUCT_ID == "5f7dbd29") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["5f7dbd29"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "5f7dbd29",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["d5a8a96d"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "d5a8a96d",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["d5a8a96d", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["0ffb7522", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["0ffb7522"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "0ffb7522",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );
    //lymphatic detox => d5a8a96d
    //label => 0ffb7522
  }
  //--------------------------------------------------------------------------------------
  //G.I Pathogen
  if (args.PRODUCT_ID == "d5927724") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["d5927724"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "d5927724",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["d8521df4"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "d8521df4",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["d8521df4", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["cfc26c59", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["cfc26c59"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "cfc26c59",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );
    //G.I Pathogen Component => d8521df4
    //label => cfc26c59
  }
  //Happy Hormones
  if (args.PRODUCT_ID == "decad337") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["decad337"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "decad337",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["62673ff8"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "62673ff8",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["62673ff8", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["b033dcde", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["b033dcde"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "b033dcde",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );
    //component => 62673ff8
    //label => b033dcde
  }
  //--------------------------------------------------------------------------------------
  //kidney
  if (args.PRODUCT_ID == "d5c06e4f") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["d5c06e4f"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "d5c06e4f",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["93732040"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "93732040",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["93732040", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["4c518046", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["4c518046"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "4c518046",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );
    //component => 93732040
    //label => 4c518046
  }
  //--------------------------------------------------------------------------------------
  //Liver
  if (args.PRODUCT_ID == "ac7042b0") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["ac7042b0"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "ac7042b0",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["a1c326b3"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "a1c326b3",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["a1c326b3", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["07b39b33", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["07b39b33"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "07b39b33",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );
    //component => a1c326b3
    //label => 07b39b33
  }
  //--------------------------------------------------------------------------------------
  //lung
  if (args.PRODUCT_ID == "411be6dd") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["411be6dd"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "411be6dd",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["20154577"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "20154577",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["20154577", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["48f381db", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["48f381db"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "48f381db",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );
    //component => 20154577
    //label => 48f381db
  }
  //--------------------------------------------------------------------------------------
  //sibo cleanse
  if (args.PRODUCT_ID == "cc53b880") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["cc53b880"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "cc53b880",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["a303a845"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "a303a845",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["a303a845", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["79280e9d", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["79280e9d"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "79280e9d",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );
    //component => a303a845
    //label => 79280e9d
  }
  //--------------------------------------------------------------------------------------
  //Ginko
  if (args.PRODUCT_ID == "3ae608b6") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["3ae608b6"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "3ae608b6",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["ed9cb831"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "ed9cb831",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["ed9cb831", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["bcab62f3", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["bcab62f3"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "bcab62f3",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => ed9cb831
    //label =>bcab62f3
  }
  //--------------------------------------------------------------------------------------
  //Ashwagandha
  if (args.PRODUCT_ID == "4a25cbf3") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["4a25cbf3"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "4a25cbf3",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["371b3eda"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "371b3eda",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["371b3eda", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["39f48bf4", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["39f48bf4"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "39f48bf4",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => 371b3eda
    //label => 39f48bf4
  }
  //--------------------------------------------------------------------------------------
  //Astralogous
  if (args.PRODUCT_ID == "a61644bd") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["a61644bd"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "a61644bd",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["d5701a97"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "d5701a97",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["d5701a97", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["d1aa2314", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["d1aa2314"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "d1aa2314",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => d5701a97
    //label => d1aa2314
  }
  //--------------------------------------------------------------------------------------
  //eye support
  if (args.PRODUCT_ID == "55023ebc") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["55023ebc"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "55023ebc",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["d8a2c133"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "d8a2c133",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["d8a2c133", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["2576f817", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["2576f817"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "2576f817",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );
    //component => d8a2c133
    //label => 2576f817
  }
  //--------------------------------------------------------------------------------------
  //daily immunity
  if (args.PRODUCT_ID == "db1386a2") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["db1386a2"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "db1386a2",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["be867686"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "be867686",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["be867686", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["2576f817", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["2576f817"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "2576f817",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );
    //component => 75692480
    //label => be867686
  }
  //--------------------------------------------------------------------------------------
  //sleep and repair
  if (args.PRODUCT_ID == "11d0c512") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["11d0c512"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "11d0c512",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["63f64afe"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "63f64afe",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["63f64afe", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["ac168303", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["ac168303"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "ac168303",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );
    //component => 63f64afe
    //label => ac168303
  }
  //--------------------------------------------------------------------------------------
  //mold
  if (args.PRODUCT_ID == "5c70f2a3") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["5c70f2a3"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "5c70f2a3",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["3197adcd"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "3197adcd",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["3197adcd", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["bcab62f3", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["bcab62f3"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "bcab62f3",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => 3197adcd
    //label => d91b173b
  }
  //--------------------------------------------------------------------------------------
  //wait
  //plastic detox
  if (args.PRODUCT_ID == "d260a82f") {
    //component => b5a6caad
    //label => 25fbddfe
  }
  //male hormone
  if (args.PRODUCT_ID == "2e5dc067") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["2e5dc067"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "2e5dc067",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["ee234isd"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "ee234isd",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["ee234isd", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["aaefdbd2", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["aaefdbd2"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "aaefdbd2",
          ]);
        }
      }
    );

    //50ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["f8f8d895", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "f8f8d895",
          ]);
        }
      }
    );

    //50ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["70a2b315", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "70a2b315",
          ]);
        }
      }
    );
    //component => ee234isd
    //label => aaefdbd2
  }

  //night cream
  if (args.PRODUCT_ID == "fa10a9ff") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["fa10a9ff"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "fa10a9ff",
          ]);
        }
      }
    );

    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["5bc1d4e7"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "5bc1d4e7",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["5bc1d4e7", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
    //label
    db.query(
      queries.product_release.insert_product_release,
      ["0be18f24", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["0be18f24"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "0be18f24",
          ]);
        }
      }
    );
    //cream container
    db.query(
      queries.product_release.insert_product_release,
      ["fb3b898d", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "fb3b898d",
          ]);
        }
      }
    );
    //lids
    db.query(
      queries.product_release.insert_product_release,
      ["ddc96cda", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "ddc96cda",
          ]);
        }
      }
    );

    //component => 5bc1d4e7
    //labrel => 0be18f24
  }

  //day cream
  if (args.PRODUCT_ID == "8d8fb010") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["8d8fb010"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "8d8fb010",
          ]);
        }
      }
    );

    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["aa55fd37"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (50 * args.QUANTITY) / ml_to_gallon,
              "aa55fd37",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["aa55fd37", (50 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
    //label
    db.query(
      queries.product_release.insert_product_release,
      ["00177475", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["00177475"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "00177475",
          ]);
        }
      }
    );
    //cream container
    db.query(
      queries.product_release.insert_product_release,
      ["fb3b898d", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "fb3b898d",
          ]);
        }
      }
    );
    //lids
    db.query(
      queries.product_release.insert_product_release,
      ["ddc96cda", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "ddc96cda",
          ]);
        }
      }
    );

    //component => aa55fd37
    //label => 00177475
  }
  //--------------------------------------------------------------------------------------
  //urinary tract
  if (args.PRODUCT_ID == "bf198df2") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["bf198df2"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "bf198df2",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["8593edd2"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "8593edd2",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["8593edd2", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["603c2d9d", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["603c2d9d"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "603c2d9d",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => 8593edd2
    //label => 603c2d9d
  }
  //--------------------------------------------------------------------------------------
  //liver 30ml
  if (args.PRODUCT_ID == "ac7042b0") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["ac7042b0"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "ac7042b0",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["a1c326b3"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "a1c326b3",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["a1c326b3", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["0d2505fd", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["0d2505fd"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "0d2505fd",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => a1c326b3
    //label => 0d2505fd
  }
  //Candidad Cleanse 30ml
  if (args.PRODUCT_ID == "a897effe") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["a897effe"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "a897effe",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["5157beef"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "5157beef",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["5157beef", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["085214fa", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["085214fa"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "085214fa",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => 5157beef
    //label => 085214fa
  }
  //--------------------------------------------------------------------------------------
  //happy hormones 30ml
  if (args.PRODUCT_ID == "092f5ec4") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["092f5ec4"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "092f5ec4",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["62673ff8"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "62673ff8",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["62673ff8", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["108a63c6", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["108a63c6"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "108a63c6",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => 62673ff8
    //label => 108a63c6
  }
  //--------------------------------------------------------------------------------------
  //lympathic detox 30ml
  if (args.PRODUCT_ID == "5770875f") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["5770875f"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "5770875f",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["d5a8a96d"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "d5a8a96d",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["d5a8a96d", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["ac50e30e", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["ac50e30e"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "ac50e30e",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => d5a8a96d
    //label => ac50e30e
  }
  //--------------------------------------------------------------------------------------
  //sibo cleanse 30ml
  if (args.PRODUCT_ID == "4377889f") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["4377889f"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "4377889f",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["a303a845"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "a303a845",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["a303a845", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["3edde33t", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["3edde33t"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "3edde33t",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => a303a845
    //label => 3edde33t
  }
  //--------------------------------------------------------------------------------------
  //Lung 30ml
  if (args.PRODUCT_ID == "433retyt") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["433retyt"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "433retyt",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["20154577"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "20154577",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["20154577", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["4rlabrr9", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["4rlabrr9"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "4rlabrr9",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => 20154577
    //label => 4rlabrr9
  }
  //kidney 30ml
  if (args.PRODUCT_ID == "403933d3") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["403933d3"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "403933d3",
          ]);
        }
      }
    );

    //get quantity of stored base
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["93732040"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(
            queries.product_inventory.update_consumption_stored,
            [
              result[0].STORED_STOCK - (30 * args.QUANTITY) / ml_to_gallon,
              "93732040",
            ],
            (err) => {}
          );
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["93732040", (30 * args.QUANTITY) / ml_to_gallon, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["3edre233", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["3edre233"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "3edre233",
          ]);
        }
      }
    );

    //30ml bottle
    db.query(
      queries.product_release.insert_product_release,
      ["1b09f3dd", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "1b09f3dd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );
    //component => 93732040
    //label => 3edre233
  }
  //fulvic
  if (args.PRODUCT_ID == "fa5ceae5") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["fa5ceae5"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "fa5ceae5",
          ]);
        }
      }
    );
    //reduce stored quantity
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["fa5ceae5"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "fa5ceae5",
          ]);
        }
      }
    );
    //label
    db.query(
      queries.product_release.insert_product_release,
      ["2e2f02c5", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["2e2f02c5"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "2e2f02c5",
          ]);
        }
      }
    );
    //component =>
    //label =>
  }
  //magnesium
  if (args.PRODUCT_ID == "36b498f3") {
    //label => 17e37568
    //
  }

  //zeolite
  if (args.PRODUCT_ID == "79200b24") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["79200b24"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "79200b24",
          ]);
        }
      }
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["79200b24"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "79200b24",
          ]);
        }
      }
    );
    //label
    db.query(
      queries.product_release.insert_product_release,
      ["708b23bd", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["708b23bd"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "708b23bd",
          ]);
        }
      }
    );

    //30ml dropper
    db.query(
      queries.product_release.insert_product_release,
      ["d588ca27", args.QUANTITY, args.EMPLOYEE_ID],
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
            result[0].STORED_STOCK - args.QUANTITY,
            "d588ca27",
          ]);
        }
      }
    );

    //component => pumps 30ml
    //label => 708b23bd
  }
  //curcurmin
  if (args.PRODUCT_ID == "151456ac") {
    //component => 50ml dropper
    //label => 099af3bc
  }
  //guava
  if (args.PRODUCT_ID == "654826a5") {
    //label => e4bed266
  }
  //chilajit
  if (args.PRODUCT_ID == "fe646055") {
    //componet pump
    //label => 87db9afc
  }
  //agaricus
  if (args.PRODUCT_ID == "c064f810") {
    //label => 0cfb9041
    //component => 30ml dropper => base bottle is 30ml
  }
  //agaricus 30ml
  if (args.PRODUCT_ID == "cdf2013f") {
    //label => aa28b4e2
    //component => 50ml dropper + 30ml base bottle
  }
  //facemist
  if (args.PRODUCT_ID == "e32c0337") {
    //label => 84d19b24
  }
  //l-lysine
  if (args.PRODUCT_ID == "c2343944") {
    // label => 37438f5d
    //component => lg container + lg lid + 200 capusles base + shrink wrap
  }
  //l-proline
  if (args.PRODUCT_ID == "31be679b") {
    //label => 98c338e2
    //component => sm container + sm lid + 100 capsules base
  }
  //stress b
  if (args.PRODUCT_ID == "44cab451") {
    //component => lg container + lg lid
    //label => 9a729b87
  }
  //l-thenine
  if (args.PRODUCT_ID == "5ab8b9ae") {
    //label => d2046ce8
    //component => sm container + sm lid
  }
  //digestive
  if (args.PRODUCT_ID == "3209f0c5") {
    //label => 30dc9ccd
    //component => sm container + sm lid
  }
  //coezyme B
  if (args.PRODUCT_ID == "f52591c4") {
    //label => 233396d5
    //component => sm container + sm lid
  }
  //colostrum
  if (args.PRODUCT_ID == "a18b9970") {
    //label => a1d0b22c
    //component => sm container + sm lid
  }
  //arabilogalactan
  if (args.PRODUCT_ID == "412a2629") {
    //label =>c42cc28e
    //component => lg container + lg lid
  }
  //butyric
  if (args.PRODUCT_ID == "c4f32bf9") {
    //label => e06c654c
    //component => sm container + sm lid
  }
  //amino
  if (args.PRODUCT_ID == "4dc18b78") {
    //label => 4e60de7c
    //component => sm container + sm lid
  }
  //deep calm
  if (args.PRODUCT_ID == "cc085e96") {
    //label => 11e46b2c
  }
  //shampoo
  if (args.PRODUCT_ID == "5f21a6fe") {
    //add product to activation log for p
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["5f21a6fe"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "5f21a6fe",
          ]);
        }
      }
    );

    //reduce stored quantity
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["5f21a6fe"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "5f21a6fe",
          ]);
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["5f21a6fe", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["adae450c", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["adae450c"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "adae450c",
          ]);
        }
      }
    );

    //label => adae450c
  }
  //conditioner
  if (args.PRODUCT_ID == "24cc76f3") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["24cc76f3"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "24cc76f3",
          ]);
        }
      }
    );

    //reduce stored quantity
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["24cc76f3"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "24cc76f3",
          ]);
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["5f21a6fe", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["34563cc9", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["34563cc9"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "34563cc9",
          ]);
        }
      }
    );

    //label => 34563cc9
  }
  //laundry detergent
  if (args.PRODUCT_ID == "78c8da4d") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["78c8da4d"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "78c8da4d",
          ]);
        }
      }
    );
    //reduce stored quantity
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["e65b9756"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "e65b9756",
          ]);
        }
      }
    );

    //insert log for product release body wash
    db.query(
      queries.product_release.insert_product_release,
      ["e65b9756", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
    //label
    db.query(
      queries.product_release.insert_product_release,
      ["4f6d1af3", args.QUANTITY, args.EMPLOYEE_ID],
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
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "4f6d1af3",
          ]);
        }
      }
    );
    //label => 4f6d1af3
    //component => liquid_bd/ld
  }
  //body wash
  if (args.PRODUCT_ID == "e65b9756") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["e65b9756"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "e65b9756",
          ]);
        }
      }
    );
    //reduce stored quantity
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["e65b9756"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "e65b9756",
          ]);
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["e65b9756", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
    //label
    db.query(
      queries.product_release.insert_product_release,
      ["f71b260a", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["f71b260a"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "f71b260a",
          ]);
        }
      }
    );
    //label => f71b260a
    //component => liquid_bd/ld
  }
  //Pet balm
  if (args.PRODUCT_ID == "66e2f256") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["66e2f256"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "66e2f256",
          ]);
        }
      }
    );
    //reduce stored quantity
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["66e2f256"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "66e2f256",
          ]);
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["66e2f256", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
    //label
    db.query(
      queries.product_release.insert_product_release,
      ["5ae713ef", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {}
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["5ae713ef"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "5ae713ef",
          ]);
        }
      }
    );

    //label => 5ae713ef
  }
  //Pet shampoo
  if (args.PRODUCT_ID == "4d1f188e") {
    db.query(
      queries.activation_product.product_activation_liquid,
      args.to_arr()
    );
    db.query(
      queries.product_release.get_quantity_by_stored_id_active,
      ["4d1f188e"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation, [
            result[0].ACTIVE_STOCK + args.QUANTITY,
            "4d1f188e",
          ]);
        }
      }
    );

    //reduce stored quantity
    db.query(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["5f21a6fe"],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          //update product inventory base
          db.query(queries.product_inventory.update_activation_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "5f21a6fe",
          ]);
        }
      }
    );

    //insert log for product release
    db.query(
      queries.product_release.insert_product_release,
      ["5f21a6fe", args.QUANTITY, args.EMPLOYEE_ID],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    //label
    db.query(
      queries.product_release.insert_product_release,
      ["62c42a38", args.QUANTITY, args.EMPLOYEE_ID],
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
          db.query(queries.product_inventory.update_consumption_stored, [
            result[0].STORED_STOCK - args.QUANTITY,
            "62c42a38",
          ]);
        }
      }
    );
    //label => 62c42a38
    //component => shampoo
  }
  //wait
  //pet agaricus
  if (args.PRODUCT_ID == "1e0f78f0") {
    //label => e207d144
  }
  //probiotics
  if (args.PRODUCT_ID == "de711bdc") {
    //labels => 3db44238
    //component => sm container + sm lid
  }
  //probiotics sm
  if (args.PRODUCT_ID == "7041e59c") {
    //label => 39d291c8
    //component => xs container + xs lid
  }
};

exports.activation_engine = activation_engine;
