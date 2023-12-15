const express = require("express");
const reduction_router = express.Router();
const { endpointHandler } = require("../endpoint_handler");

const endpoint_handler = endpointHandler();

const baseurl = "/inventory/api/reduction";

reduction_router.post(`${baseurl}/product_reduction`, (req, res) => {
    endpoint_handler.reduction.release_product(req, res);
});

module.exports = reduction_router;