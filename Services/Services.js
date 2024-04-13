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

  multiItemBarcodeGen = (args, callback) => {
    // Map each arg to a promise that resolves when barcode_builder completes for that arg
    const promises = args.map((arg) => {
      return new Promise((resolve, reject) => {
        req_model.barcode_build(arg, (data) => {
          barcode_gen.barcode_builder(data, (barcode) => {
            resolve(barcode); // Resolve this promise with the data
          });
        });
      });
    });
    // Wait for all promises to resolve, then return the array of results
    Promise.all(promises).then((data) => {
      let barcode_buffers = [];
      for (const barcode_arr of data) {
        for (const barcode of barcode_arr) {
          barcode_buffers.push(barcode);
        }
      }
      return callback(barcode_buffers);
    });
  };
  http_print_barcode = (args) => {
    req_model.barcode_build(args, (data) => {
      this.barcode_gen(data, (buffer_arr) => {
        const return_buffer_arr = buffer_arr.map((buffer) => {
          return { png_buffer: buffer };
        });
        //192.168.1.25:5000/print_labels
        http: try {
          fetch("http://192.168.0.153:5001/print_labels", {
            method: "POST",
            body: JSON.stringify(return_buffer_arr),
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (err) {}
      });
    });
  };
}

const init_services = () => {
  return new Services();
};

exports.init_services = init_services;
