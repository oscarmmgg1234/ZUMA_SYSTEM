const shipment = require("../../req/shipment/insert");
const update_shipment = require("../../req/shipment/update");

class req_interface {
    insert_shipment = (args,callback) => {
        shipment.insert_shipment_model(args, (data)=>{return callback(data)});
    }
    update_shipment = (args,callback) => {
        update_shipment.shipment_update_model(args, (data)=>{return callback(data)});
    }
}



//function that returns an instance of the class
const init_req_interface = () => {
    return new req_interface();
}

exports.req_interface = init_req_interface;