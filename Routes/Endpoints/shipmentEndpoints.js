const express = require("express");
const shipment_router = express.Router();

const { endpointHandler } = require("../endpoint_handler");

const endpoint_handler = endpointHandler();

const baseurl = "/inventory/api/shipment";

shipment_router.post(`${baseurl}/shipment_insert`, (req, res) => {
  endpoint_handler.shipment.insert_shipment(req, res);
});

module.exports = shipment_router;