const { db } = require("../../../DB/db_init.js");
const { queries } = require("../../../DB/queries.js");
const { activationEngineComponents } = require("./activationEngine.js");
const engineHelper = activationEngineComponents;

const Type1_Component_Protocol = (args, exceptions) => {
  // 50ml bottle
  db(queries.product_release.insert_product_release, [
    "f8f8d895",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);
  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["f8f8d895"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "f8f8d895",
        ]);
      } else {
        console.log(err);
      }
    }
  );

  // 50ml dropper
  db(queries.product_release.insert_product_release, [
    "70a2b315",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);
  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["70a2b315"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "70a2b315",
        ]);
      } else {
        console.log(err);
      }
    }
  );
};
const Type2_Component_Protocol = (args, exceptions) => {
  // Insert product release for "1b09f3dd"
  db(queries.product_release.insert_product_release, [
    "1b09f3dd",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  // Get quantity by stored ID for "1b09f3dd" and update product inventory
  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["1b09f3dd"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "1b09f3dd",
        ]);
      } else {
        console.log(err);
      }
    }
  );

  // 30ml dropper
  // Insert product release for "d588ca27"
  db(queries.product_release.insert_product_release, [
    "d588ca27",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  // Get quantity by stored ID for "d588ca27" and update product inventory
  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["d588ca27"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "d588ca27",
        ]);
      } else {
        console.log(err);
      }
    }
  );
};

const Type3_Component_Procotol = (args, exeptions) => {};

const Type4_Component_Protocol = (args, exceptions) => {
  // 30ml dropper
  db(queries.product_release.insert_product_release, [
    "d588ca27",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["d588ca27"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "d588ca27",
        ]);
      } else {
        console.log(err);
      }
    }
  );
};

const Type7_Component_Protocol = (args, exceptions) => {
  // lg container
  db(queries.product_release.insert_product_release, [
    "2a531d63",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["2a531d63"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "2a531d63",
        ]);
      } else {
        console.log(err);
      }
    }
  );

  // lg lid
  db(queries.product_release.insert_product_release, [
    "55230435",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["55230435"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "55230435",
        ]);
      } else {
        console.log(err);
      }
    }
  );

  // shrink wrap
  db(queries.product_release.insert_product_release, [
    "c7e573b6",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["c7e573b6"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "c7e573b6",
        ]);
      } else {
        console.log(err);
      }
    }
  );
};

const Type8_Component_Protocol = (args, exceptions) => {
  // sm container
  db(queries.product_release.insert_product_release, [
    "a14d05dd",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["a14d05dd"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "a14d05dd",
        ]);
      } else {
        console.log(err);
      }
    }
  );

  // sm lid
  db(queries.product_release.insert_product_release, [
    "2098a61d",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["2098a61d"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "2098a61d",
        ]);
      } else {
        console.log(err);
      }
    }
  );

  // shrink sm
  db(queries.product_release.insert_product_release, [
    "40a1fbc3",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["40a1fbc3"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "40a1fbc3",
        ]);
      } else {
        console.log(err);
      }
    }
  );
};
const Type9_Component_Protocol = (args, exceptions) => {
  // Insert product release for "234grddd"
  db(queries.product_release.insert_product_release, [
    "234grddd",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["234grddd"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "234grddd",
        ]);
      } else {
        console.log(err);
      }
    }
  );

  // xs lid
  db(queries.product_release.insert_product_release, [
    "dr33esdg",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["dr33esdg"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "dr33esdg",
        ]);
      } else {
        console.log(err);
      }
    }
  );

  // shrink sm
  db(queries.product_release.insert_product_release, [
    "40a1fbc3",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["40a1fbc3"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "40a1fbc3",
        ]);
      } else {
        console.log(err);
      }
    }
  );
};

const Type10_Component_Protocol = (args, exceptions) => {
  // Cream container
  db(queries.product_release.insert_product_release, [
    "fb3b898d",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["fb3b898d"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "fb3b898d",
        ]);
      } else {
        console.log(err);
      }
    }
  );

  // Lids
  db(queries.product_release.insert_product_release, [
    "ddc96cda",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["ddc96cda"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "ddc96cda",
        ]);
      } else {
        console.log(err);
      }
    }
  );
};
const Type11_Component_Protocol = (args, exceptions) => {
  // 50ml Dropper
  db(queries.product_release.insert_product_release, [
    "70a2b315",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["70a2b315"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "70a2b315",
        ]);
      } else {
        console.log(err);
      }
    }
  );
};
const Type12_Component_Protocol = (args, exceptions) => {
  // 60ml Pump
  db(queries.product_release.insert_product_release, [
    "398bddd5",
    args.quantity,
    args.employee_id,
    args.TRANSACTIONID,
  ]);

  db(
    queries.product_release.get_quantity_by_stored_id_storage,
    ["398bddd5"],
    (err, result) => {
      if (!err) {
        db(queries.product_inventory.update_consumption_stored, [
          result[0].STORED_STOCK - args.quantity,
          "398bddd5",
        ]);
      } else {
        console.log(err);
      }
    }
  );
};

exports.activationSubProtocols = () => {
  return [
    Type1_Component_Protocol,
    Type2_Component_Protocol,
    Type3_Component_Procotol,
    Type4_Component_Protocol,
    Type7_Component_Protocol,
    Type8_Component_Protocol,
    Type9_Component_Protocol,
    Type10_Component_Protocol,
    Type11_Component_Protocol,
    Type12_Component_Protocol,
  ];
};
