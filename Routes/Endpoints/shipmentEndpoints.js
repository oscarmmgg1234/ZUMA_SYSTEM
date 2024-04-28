const express = require("express");
const shipment_router = express.Router();

const { endpointHandler } = require("../endpoint_handler");

const endpoint_handler = endpointHandler();

shipment_router.post("/shipment_insert", async (req, res) => {
  await endpoint_handler.shipment.shimpent_insert(req, res);
});

shipment_router.get("/company_info", (req, res) => {
  endpoint_handler.shipment.get_company_info(req, res);
});

shipment_router.post("/get_products_by_company", (req, res) => {
  endpoint_handler.shipment.get_products_by_company(req, res);
});

shipment_router.post("/get_shipment_by_date", (req, res) => {
  endpoint_handler.shipment.get_shipment_by_date(req, res);
});

module.exports = shipment_router;
