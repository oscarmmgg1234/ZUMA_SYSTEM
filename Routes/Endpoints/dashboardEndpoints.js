const express = require("express");
const dashboard_router = express.Router();
const { endpointHandler } = require("../endpoint_handler");

const endpoint_handler = endpointHandler();

dashboard_router.post("/get_products_dash", (req, res) => {
  endpoint_handler.dashboard.get_products(req, res);
});


module.exports = dashboard_router;