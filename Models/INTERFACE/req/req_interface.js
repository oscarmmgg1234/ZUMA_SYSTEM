const shipment = require("../../req/shipment/insert");
const update_shipment = require("../../req/shipment/update");
const delete_shipment = require("../../req/shipment/delete");
const get_product_model = require("../../req/inv_activation/getProduct");
const product_activation = require("../../req/inv_activation/activation");
const getPByCompany = require("../../req/shipment/getProducts");
const barcode_gen = require("../../req/Barcode/barcode_gen");
const product_reduc = require("../../req/inv_consumption/insert");
const parseBarcode = require("../../req/Barcode/barcode_gen.js");
const product_analytics = require("../../req/Dashboard/getProductAnalytics");

class req_interface {
  productAnalytics = (args, callback) => {
    product_analytics.product_analytics(args, (data) => {
      return callback(data);
    });
  };
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
  getProductsByCompany = (args, callback) => {
    getPByCompany.getProductsByCompany(args, (data) => {
      return callback(data);
    });
  };
  barcode_build = (args, callback) => {
    barcode_gen.barcode_gen(args, (data) => {
      return callback(data);
    });
  };
  product_reduction = (args, callback) => {
    product_reduc.product_reduc(args, (data) => {
      return callback(data);
    });
  };
  barcodeParse = (args, callback) => {
    parseBarcode.parseBCode(args, (data) => {
      return callback(data);
    });
  };
}

//function that returns an instance of the class
const init_req_interface = () => {
  return new req_interface();
};

exports.req_interface = init_req_interface;
