const shipment = require("../../res/shipment/select_all");



class res_interface{
    select_all = (args,callback) => {
        shipment.select_all_model(args,(data)=>{return callback(data)});
    }
}

exports.res_interface = () => {
    return new res_interface();
}