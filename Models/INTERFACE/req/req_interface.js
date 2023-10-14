const shipment = require("../../req/shipment/insert");
const update_shipment = require("../../req/shipment/update");
const delete_shipment = require("../../req/shipment/delete");
const get_product_model = require("../../req/inv_activation/getProduct");
const product_activation = require("../../req/inv_activation/activation");

class req_interface {
  insert_shipment = (args, callback) => {
    shipment.insert_shipment_model(args, (data) => {
      return callback(data);
    });
  };
  update_shipment = (args, callback) => {
    update_shipment.shipment_update_model(args, (data) => {
      return callback(data);
    });
  };
  delete_shipment = (args, callback) => {
    delete_shipment.delete_shipment_model(args, (data) => {
      return callback(data);
    });
  };
  get_activation_product = (args, callback) => {
    get_product_model.get_product_model(args, (data) => {
      return callback(data);
    });
  };
  activation = (args, callback) => {
    product_activation.product_activation_model(args, (data) => {
      return callback(data);
    });
  };
}

//function that returns an instance of the class
const init_req_interface = () => {
  return new req_interface();
};

exports.req_interface = init_req_interface;
