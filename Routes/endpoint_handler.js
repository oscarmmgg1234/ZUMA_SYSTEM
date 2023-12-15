// const { ErrorHandling } = require("../Error/error_handling");
// const { success_handling } = require("../Error/success_handling");
const express = require("express");
const { controller_interface } = require("../Controllers/controller.js");
const controller = controller_interface();
const { ErrorHandling } = require("../Error/error_handling");
const { success_handling } = require("../Error/success_handling");

class http_handler {
  constructor() {
    this.init = true;
  }

  shipment = {
    shimpent_insert: (req, res) => {
      controller.shipment_controller.insert_shipment(req.req_data);
      res.send(
        new success_handling(
          { request_data: req.req_data },
          "Shipment Inserted"
        ).getSuccess()
      );
    },
    get_company_info: (req, res) => {
      controller.shipment.getCompanyInfo((data) => {
        const err = new ErrorHandling(data, "Error getting company info");
        if (err.isValid()) {
          res.send(
            new success_handling(data, "Retrieved Company Info").getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
    get_products_by_company: (req, res) => {
      controller.shipment.getProductsByCompany(req.req_data, (data) => {
        const err = new ErrorHandling(
          data,
          "Error getting products by company"
        );
        if (err.isValid()) {
          res.send(
            new success_handling(
              data,
              "Retrieved Products By Company"
            ).getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
  };

  activation = {
    activate_prod: (req, res) => {
      controller.product_activation_controller.activate_product(req.req_data);
      res.send(new success_handling({}, "Product Activated").getSuccess());
    },
    get_employee_info: (req, res) => {
      controller.product_activation_controller.get_employee_info((data) => {
        const err = new ErrorHandling(data, "Error getting employee info");
        if (err.isValid()) {
          res.send(
            new success_handling(data, "Retrieved Employee Info").getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },

    get_product_by_type: (req, res) => {
      controller.product_activation_controller.get_activation_product(
        req.req_data,
        (data) => {
          const err = new ErrorHandling(
            data,
            "Error getting activation product",
            "activation_products"
          );
          if (err.isValid()) {
            res.send(
              new success_handling(
                data,
                "Retrieved Activation Product"
              ).getSuccess()
            );
          } else {
            res.send(err.getError());
          }
        }
      );
    },
    get_employee_info: (req, res) => {
      controller.product_activation_controller.get_employee_info((data) => {
        const err = new ErrorHandling(data, "Error getting employee info");
        if (err.isValid()) {
          res.send(
            new success_handling(data, "Retrieved Employee Info").getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
  };

  reduction = {
    release_product: (req, res) => {
      controller.reduction.product_reduction(req.req_data, (result) => {});
      res.send(
        new success_handling(
          { request_data: req.req_data },
          "Product Reduced"
        ).getSuccess()
      );
    },
  };

  services = {
    print_label: (req, res) => {
      controller.label_print_controller.labelPrint(req);
      res.send(
        new success_handling(
          { request_data: req.req_data },
          "Label Printed"
        ).getSuccess()
      );
    },
    barcode_gen: (req, res) => {
      controller.services.barcode_gen(req.req_data, (buffer_arr) => {
        const return_buffer_arr = buffer_arr.map((buffer) => {
          return { png_buffer: buffer };
        });
        const err = new ErrorHandling(
          return_buffer_arr,
          "Generate Barcode Error"
        );
        if (err.isValid()) {
          fetch("http://192.168.1.25:5000/print_labels", {
            method: "POST",
            body: JSON.stringify(return_buffer_arr),
            headers: {
              "Content-Type": "application/json",
            },
          });
          res.send(
            new success_handling(
              "Barcode Generated",
              "generating barcode process"
            ).getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
    api_status: (req, res) => {
      res.send({ status: true });
    },
  };
}

exports.endpointHandler = () => {
  return new http_handler();
};
