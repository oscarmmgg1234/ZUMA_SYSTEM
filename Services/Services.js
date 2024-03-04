const barcode_gen = require("./Barcode/barcode_builder");
const { req_interface } = require("../Models/INTERFACE/req/req_interface");
const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");

const req_model = req_interface();

class Services {
  constructor() {
    this.barcodeData = {};
  }

  barcode_gen = (args, callback) => {
    db(
      queries.tools.barcode_log,
      [
        args.id,
        args.employee_id,
        args.product_name,
        args.quantity,
        args.src === "Manually Printed" ? "Manually Printed" : "Active/Passive",
        args.TRANSACTIONID,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
        }
      }
    );

    barcode_gen.barcode_builder(args, (data) => {
      return callback(data);
    });
  };

  http_print_barcode = (args, callback) => {
    req_model.barcode_build(args, (data) => {
      callback(data.id);
      this.barcode_gen(data, (buffer_arr) => {
        const return_buffer_arr = buffer_arr.map((buffer) => {
          return { png_buffer: buffer };
        });
        try {
          fetch("http://192.168.1.25:5000/print_labels", {
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
