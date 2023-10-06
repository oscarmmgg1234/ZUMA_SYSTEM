const {db_interface} = require("../DB/interface.js");
const {res_interface} = require("../Models/INTERFACE/res/res_interface.js");

const res = res_interface();
const db_api = db_interface();

const select_all_shipment_log = (callback) => {
    db_api.select_all_shipment_log((data)=>{res.select_all(data,(data)=>{return callback(data)})});
}

const insert_shipment_log = (args) => {
    db_api.insert_shipment_log(args);
}

const update_shipment_log = (args) => {
    db_api.update_shipment_log(args);
}

const delete_shipment_log = (args) => {
    db_api.delete_shipment_log(args);
}

class controller {
    select_all_shipment = (callback) => {
        select_all_shipment_log((data)=>{return callback(data)});
    }
    insert_shipment = (args) => {
        insert_shipment_log(args);
    }
    update_shipment = (args) => {
        update_shipment_log(args);
    }
    delete_shipment_log = (args) => {
        delete_shipment_log(args);
    }
}

exports.controller_interface = () => {
    return new controller();
}