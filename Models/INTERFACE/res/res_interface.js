const shipment = require("../../res/shipment/select_all");
const {
  activation_products_data,
} = require("../../res/product_activation/getProduct");

const { getEmployee } = require("../../res/product_activation/getEmployee");

class res_interface {
  select_all = (args, callback) => {
    shipment.select_all_model(args, (data) => {
      return callback(data);
    });
  };
  get_products = (args, callback) => {
    activation_products_data(args, (data) => {
      return callback(data);
    });
  };
  get_employee = (args, callback) => {
    getEmployee(args, (data) => {
      return callback(data);
    });
  };
}

exports.res_interface = () => {
  return new res_interface();
};
