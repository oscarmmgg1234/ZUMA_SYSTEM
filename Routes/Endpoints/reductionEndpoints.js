const express = require("express");
const reduction_router = express.Router();
const { endpointHandler } = require("../endpoint_handler");

const endpoint_handler = endpointHandler();



reduction_router.post("/product_reduction", (req, res) => {
    endpoint_handler.reduction.release_product(req, res);
});

module.exports = reduction_router;