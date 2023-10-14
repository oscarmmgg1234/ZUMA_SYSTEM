const express = require("express");
const router = express.Router();
const { req_interface } = require("../Models/INTERFACE/req/req_interface");

const req_model = req_interface();

router.use("/shipment_insert", (req, res, next) => {
  req_model.insert_shipment(req.body, (data) => {
    req.req_data = data;
  });
  next();
});

router.use("/shipment_update", (req, res, next) => {
  req_model.update_shipment(req.body, (data) => {
    req.req_data = data;
  });
  next();
});

router.use("/shipment_delete", (req, res, next) => {
  req_model.delete_shipment(req.body, (data) => {
    req.req_data = data;
  });
  next();
});

router.use("/get_activation_product", (req, res, next) => {
  req_model.get_activation_product(req.body, (data) => {
    req.req_data = data;
  });
  next();
});

router.use("/activate_product", (req, res, next) => {
  req_model.activation(req.body, (data) => {
    req.req_data = data;
  });
  next();
});

module.exports = router;
