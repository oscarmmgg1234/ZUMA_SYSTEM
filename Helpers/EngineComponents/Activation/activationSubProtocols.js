const { db } = require("../../../DB/db_init.js");
const { queries } = require("../../../DB/queries.js");
const { activationEngineComponents } = require("./activationEngine.js");
const engineHelper = activationEngineComponents;

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
  //50ml Dropper
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

exports.activationSubProtocols = () => {
  return [
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
};
