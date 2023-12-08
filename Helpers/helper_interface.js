const { activation_engine } = require("./activation_engine");
const { reduction_engine } = require("./reduction_inv");
const { shipment_engine } = require("./shipment_engine");

class helper {
  activation_engine(args) {
    activation_engine(args);
  }
  reduction_engine(args) {
    reduction_engine(args);
  }
  shipment_engine(args) {
    shipment_engine(args);
  }
}

const Helper = () => {
  return new helper();
};

exports.Helper = Helper;
