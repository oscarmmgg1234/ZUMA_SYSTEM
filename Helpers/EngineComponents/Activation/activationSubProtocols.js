const { queries } = require("../../../DB/queries.js");

const Type1_Component_Protocol = async (args, exceptions, trx_handler) => {
  // 50ml bottle
  try {
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "f8f8d895",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);
    const result = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["f8f8d895"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result[0][0].STORED_STOCK - args.quantity,
      "f8f8d895",
    ]);

    // 50ml dropper
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "70a2b315",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);
    const result2 = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["70a2b315"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result2[0][0].STORED_STOCK - args.quantity,
      "70a2b315",
    ]);
  } catch (e) {
    throw err;
  }
};
const Type2_Component_Protocol = async (args, exceptions, trx_handler) => {
  // Insert product release for "1b09f3dd"
  try {
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "1b09f3dd",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    // Get quantity by stored ID for "1b09f3dd" and update product inventory
    const result = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["1b09f3dd"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result[0][0].STORED_STOCK - args.quantity,
      "1b09f3dd",
    ]);
    // 30ml dropper
    // Insert product release for "d588ca27"
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "d588ca27",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    // Get quantity by stored ID for "d588ca27" and update product inventory
    const result2 = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["d588ca27"]
    );
    await trx_handler.raw(
      queries.product_inventory.update_consumption_stored,
      [result2[0][0].STORED_STOCK - args.quantity, "d588ca27"]
    );
  } catch (err) {
    throw err;
  }
};

const Type3_Component_Procotol = async (args, exeptions, trx_handler) => {};

const Type4_Component_Protocol = async (args, exceptions, trx_handler) => {
  // 30ml dropper
  try {
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "d588ca27",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["d588ca27"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result[0][0].STORED_STOCK - args.quantity,
      "d588ca27",
    ]);
  } catch (e) {
    throw err;
  }
};

const Type7_Component_Protocol = async (args, exceptions, trx_handler) => {
  // lg container
  try {
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "2a531d63",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["2a531d63"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result[0][0].STORED_STOCK - args.quantity,
      "2a531d63",
    ]);

    // lg lid
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "55230435",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result2 = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["55230435"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result2[0][0].STORED_STOCK - args.quantity,
      "55230435",
    ]);

    // shrink wrap
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "c7e573b6",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result3 = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["c7e573b6"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result3[0][0].STORED_STOCK - args.quantity,
      "c7e573b6",
    ]);
  } catch (e) {
    throw err;
  }
};

const Type8_Component_Protocol = async (args, exceptions, trx_handler) => {
  // sm container
  try {
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "a14d05dd",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["a14d05dd"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result[0][0].STORED_STOCK - args.quantity,
      "a14d05dd",
    ]);

    // sm lid
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "2098a61d",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result2 = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["2098a61d"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result2[0][0].STORED_STOCK - args.quantity,
      "2098a61d",
    ]);

    // shrink sm
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "40a1fbc3",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result3 = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["40a1fbc3"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result3[0][0].STORED_STOCK - args.quantity,
      "40a1fbc3",
    ]);
  } catch (e) {
    throw err;
  }
};
const Type9_Component_Protocol = async (args, exceptions, trx_handler) => {
  // Insert product release for "234grddd"
  try {
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "234grddd",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["234grddd"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result[0][0].STORED_STOCK - args.quantity,
      "234grddd",
    ]);
    // xs lid
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "dr33esdg",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result2 = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["dr33esdg"]
    );

    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result2[0][0].STORED_STOCK - args.quantity,
      "dr33esdg",
    ]);

    // shrink sm
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "40a1fbc3",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result3 = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["40a1fbc3"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result3[0][0].STORED_STOCK - args.quantity,
      "40a1fbc3",
    ]);
  } catch (e) {
    throw err;
  }
};

const Type10_Component_Protocol = async (args, exceptions, trx_handler) => {
  // Cream container
  try {
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "fb3b898d",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["fb3b898d"]
    );

    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result[0][0].STORED_STOCK - args.quantity,
      "fb3b898d",
    ]);

    // Lids
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "ddc96cda",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result2 = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["ddc96cda"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result2[0][0].STORED_STOCK - args.quantity,
      "ddc96cda",
    ]);
  } catch (e) {
    throw err;
  }
};
const Type11_Component_Protocol = async (args, exceptions, trx_handler) => {
  // 50ml Dropper
  try {
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "70a2b315",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["70a2b315"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result[0][0].STORED_STOCK - args.quantity,
      "70a2b315",
    ]);
  } catch (e) {
    throw err;
  }
};
const Type12_Component_Protocol = async (args, exceptions, trx_handler) => {
  // 60ml Pump
  try {
    await trx_handler.raw(queries.product_release.insert_product_release, [
      "398bddd5",
      args.quantity,
      args.employee_id,
      args.TRANSACTIONID,
    ]);

    const result = await trx_handler.raw(
      queries.product_release.get_quantity_by_stored_id_storage,
      ["398bddd5"]
    );
    await trx_handler.raw(queries.product_inventory.update_consumption_stored, [
      result[0][0].STORED_STOCK - args.quantity,
      "398bddd5",
    ]);
  } catch (e) {
    throw err;
  }
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
