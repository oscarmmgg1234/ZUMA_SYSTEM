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

service_router.post("/getHistoryLog" , (req, res) => {
    endpoint_handler.services.get_history_log(req, res);
});

service_router.post("/api_status", (req, res) => {
    endpoint_handler.services.api_status(req, res);
});
module.exports = service_router;