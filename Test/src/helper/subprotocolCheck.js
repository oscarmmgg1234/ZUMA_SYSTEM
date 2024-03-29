const { LogHandler } = require("../../LogHandler");
const { query_manager } = require("../../../DB/query_manager");

const knex = query_manager;

const subprotocol_map = new Map([
  [1, { bottle: "f8f8d895", accessory: "70a2b315" }],
  [2, { bottle: "1b09f3dd", accessory: "d588ca27" }],
  [3, { bottle: "f8f8d895", accessory: "398bddd5" }],
  [4, { accessory: "d588ca27" }],
  [5, { bottle: "2a531d63", accessory: "55230435", shrinkLabel: "c7e573b6" }],
  [6, { bottle: "a14d05dd", accessory: "2098a61d", shrinkLabel: "40a1fbc3" }],
  [7, { bottle: "234grddd", accessory: "dr33esdg", shrinkLabel: "40a1fbc3" }],
  [8, { bottle: "fb3b898d", accessory: "ddc96cda", shrinkLabel: "40a1fbc3" }],
  [9, { accessory: "70a2b315" }],
  [10, { accessory: "398bddd5" }],
]);

const subprotocolCheck = (process_component) => {
  if (subprotocol_map.has(process_component)) {
    return subprotocol_map.get(process_component);
  }
  return null;
};

exports.subprotocolCheck = subprotocolCheck;
