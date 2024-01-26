const express = require("express");
const service_router = express.Router();
const { endpointHandler } = require("../endpoint_handler");

const endpoint_handler = endpointHandler();

service_router.post("/gen_barcode", (req, res) => {
  endpoint_handler.services.barcode_gen(req, res);
});

service_router.post("/printLabel", (req, res) => {
  endpoint_handler.services.print_label(req, res);
});

service_router.post("/getShipmentLog", (req, res) => {
  endpoint_handler.services.getHistoryLog(req, res);
});

service_router.post("/getActivationLog", (req, res) => {
  endpoint_handler.services.getActivationLog(req, res);
});

service_router.post("/getReductionLog", (req, res) => {
  endpoint_handler.services.getReductionLog(req, res);
});

service_router.post("/api_status", (req, res) => {
  endpoint_handler.services.api_status(req, res);
});

service_router.get("/get_products", (req, res) => {
  endpoint_handler.services.getProducts(req, res);
});

service_router.post("/get_barcode_data", (req, res) => {
  endpoint_handler.services.get_barcode_data(req, res);
});

module.exports = service_router;
