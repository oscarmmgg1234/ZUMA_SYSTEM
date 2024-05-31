const express = require("express");
const activation_router = express.Router();
const { endpointHandler } = require("../endpoint_handler");

const endpoint_handler = endpointHandler();

activation_router.use("/act-red-product", async (req, res) => {
  await endpoint_handler.activation.activate_release_product(req, res);
});

activation_router.get("/Activations", async (req, res) => {
  await endpoint_handler.services.getRecentActivations(req, res);
});

activation_router.post("/activate_product", async (req, res) => {
  await endpoint_handler.activation.activate_prod(req, res);
});

activation_router.post("/get_employee_info", (req, res) => {
  endpoint_handler.activation.get_employee_info(req, res);
});

activation_router.post("/get_activation_product_type", (req, res) => {
  endpoint_handler.activation.getProductByType(req, res);
});

activation_router.get("/get_employee_info", (req, res) => {
  endpoint_handler.activation.get_employee_info(req, res);
});

module.exports = activation_router;
