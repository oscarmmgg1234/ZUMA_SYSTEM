const express = require("express");
const router = express.Router();
const { controller_interface } = require("../Controllers/controller.js");
const controller = controller_interface();
const { ErrorHandling } = require("../Error/error_handling");
const { success_handling } = require("../Error/success_handling");



router.post("/shipment_insert", (req, res) => {
  controller.shipment_controller.insert_shipment(req.req_data);
  res.send(
    new success_handling(
      { request_data: req.req_data },
      "Shipment Inserted"
    ).getSuccess()
  );
});

router.post("/shipment_select_all", (req, res) => {
  controller.shipment_controller.select_all_shipment((data) => {
    const err = new ErrorHandling(data, "Error getting shipment log");
    if (err.isValid()) {
      res.send(
        new success_handling(data, "Retrieved Shipment Log").getSuccess()
      );
    } else {
      res.send(err.getError());
    }
  });
});

router.post("/shipment_update", (req, res) => {
  controller.shipment_controller.update_shipment(req.req_data);
  res.send(
    new success_handling(
      { request_data: req.req_data },
      "Shipment Updated"
    ).getSuccess()
  );
});

router.post("/shipment_delete", (req, res) => {
  controller.shipment_controller.delete_shipment_log(req.req_data);
  res.send(
    new success_handling(
      { request_data: req.req_data },
      "Shipment Deleted"
    ).getSuccess()
  );
});

router.post("/get_activation_product_type", (req, res) => {
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
});

router.get("/get_employee_info", (req, res) => {
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
});

router.post("/activate_product", (req, res) => {
  controller.product_activation_controller.activate_product(req.req_data);
  res.send(new success_handling({}, "Product Activated").getSuccess());
});

router.get("/get_products", (req, res) => {
  controller.label_print_controller.get_products_info((data) => {
    const err = new ErrorHandling(data, "Error getting products");
    if (err.isValid()) {
      res.send(new success_handling(data, "Retrieved Products").getSuccess());
    } else {
      res.send(err.getError());
    }
  });
});

router.post("/get_products_by_company", (req, res) => {
  controller.shipment.getProductsByCompany(req.req_data, (data) => {
    const err = new ErrorHandling(data, "Error getting products by company");
    if (err.isValid()) {
      res.send(
        new success_handling(data, "Retrieved Products By Company").getSuccess()
      );
    } else {
      res.send(err.getError());
    }
  });
});

router.get("/company_info", (req, res) => {
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
});

router.post("/gen_barcode", (req, res) => {
  controller.services.barcode_gen(req.req_data, (buffer_arr) => {
    const return_buffer_arr = buffer_arr.map((buffer) => {
      return { png_buffer: buffer };
    });
    const err = new ErrorHandling(return_buffer_arr, "Generate Barcode Error");
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
});

router.post("/product_reduction", (req, res) => {
  controller.reduction.product_reduction(req.req_data, (result) => {});
  res.send(
    new success_handling(
      { request_data: req.req_data },
      "Product Reduced"
    ).getSuccess()
  );
});

router.post("/printLabel", (req, res) => {
  controller.label_print_controller.labelPrint(req);
  res.send(
    new success_handling(
      { request_data: req.req_data },
      "Label Printed"
    ).getSuccess()
  );
});

// create_barcode.barcode_builder("123456", (err, buffer_arr) => {
//   if (err) {
//     console.error("Error generating barcodes:", err);
//     return;
//   }

//   // Do something with buffer_arr;
//   res.send(buffer_arr[3]);
// });

module.exports = router;
