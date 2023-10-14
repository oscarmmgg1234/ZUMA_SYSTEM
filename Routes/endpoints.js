const express = require("express");
const router = express.Router();
const { controller_interface } = require("../Controllers/controller.js");
const controller = controller_interface();

router.get("/shipment_insert", (req, res) => {
  controller.shipment_controller.insert_shipment(req.req_data);
  res.send(res.status(200).send("shipment updated"));
});

router.post("/shipment_select_all", (req, res) => {
  controller.shipment_controller.select_all_shipment((data) => {
    res.send(data);
  });
});

router.post("/shipment_update", (req, res) => {
  controller.shipment_controller.update_shipment(req.req_data);
  res.send(res.status(200).send("shipment updated"));
});

router.post("/shipment_delete", (req, res) => {
  controller.shipment_controller.delete_shipment_log(req.req_data);
  res.send(res.status(200).send("shipment deleted"));
});

router.post("/get_activation_product", (req, res) => {
  controller.product_activation_controller.get_activation_product(
    req.req_data,
    (data) => {
      res.send(data);
    }
  );
});

router.get("/get_employee_info", (req, res) => {
  controller.product_activation_controller.get_employee_info((data) => {
    res.send(data);
  });
});

router.post("/activate_product", (req, res) => {
  controller.product_activation_controller.activate_product(req.req_data);
  res.send(res.status(200).send("product activated"));
});

module.exports = router;
