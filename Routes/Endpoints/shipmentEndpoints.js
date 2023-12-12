const express = require("express");
const shipment_router = express.Router();

const { endpointHandler } = require("../endpoint_handler");

const endpoint_handler = endpointHandler();

shipment_router.post("/shipment_insert", (req, res) => {
  endpoint_handler.shipment.insert_shipment(req, res);
});

module.exports = shipment_router;