const barcode_gen = require("./Barcode/barcode_builder");
const { req_interface } = require("../Models/INTERFACE/req/req_interface");

const req_model = req_interface();

class Services {
  constructor() {
    this.barcodeData = {};
  }
  barcode_gen = (args, callback) => {
    barcode_gen.barcode_builder(args, (data) => {
      return callback(data);
    });
  };

  http_print_barcode = (args) => {
    req_model.barcode_build(args, (data) => {
      this.barcode_gen(data, (buffer_arr) => {
        const return_buffer_arr = buffer_arr.map((buffer) => {
          return { png_buffer: buffer };
        });
        fetch("http://192.168.1.25:5000/print_labels", {
          method: "POST",
          body: JSON.stringify(return_buffer_arr),
          headers: {
            "Content-Type": "application/json",
          },
        });
      });
    });
  };
}

const init_services = () => {
  return new Services();
};

exports.init_services = init_services;
