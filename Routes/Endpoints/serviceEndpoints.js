const express = require("express");
const service_router = express.Router();
const { endpointHandler } = require("../endpoint_handler");

const endpoint_handler = endpointHandler();

service_router.post("/delProduct", async (req, res) => {
  await endpoint_handler.services.deleteProd(req, res);
});

service_router.get("/getPastYearShipments", async (req, res) => {
  await endpoint_handler.shipment.getPastYearShipments(req, res);
});

service_router.post("/addProdProcess", async (req, res) => {
  await endpoint_handler.services.addProductProcess(req, res);
});

service_router.post("/runtimeTest", async (req, res) => {
  await endpoint_handler.services.runtimeTest(req, res);
});

service_router.get("/getFuncRegistry", (req, res) => {
  endpoint_handler.services.getFunctionRegistry(req, res);
});
service_router.post("/commitChanges", async (req, res) => {
  await endpoint_handler.services.commitChanges(req, res);
});
service_router.get("/getProductTypes", async (req, res) => {
  await endpoint_handler.services.getProductTypes(req, res);
});
service_router.get("/getIDs", async (req, res) => {
  await endpoint_handler.services.getEmployeeIDS(req, res);
});
service_router.get("/get_scanners", async (req, res) => {
  await endpoint_handler.services.getScanners(req, res);
});
service_router.post("/setScanner", async (req, res) => {
  await endpoint_handler.services.setScannerStatus(req, res);
});
service_router.get("/reductions", async (req, res) => {
  await endpoint_handler.services.getRecentReductions(req, res);
});

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

service_router.post("/revertTransaction", (req, res) => {
  endpoint_handler.dashboard.revertTransaction(req, res);
});

service_router.post("/getTransactionLog", (req, res) => {
  endpoint_handler.dashboard.getTransactionLog(req, res);
});
service_router.post("/getGlycerinGlobal", (req, res) => {
  endpoint_handler.dashboard.getGlycerinGlobal(req, res);
});
service_router.post("/setGlycerinGlobal", (req, res) => {
  endpoint_handler.dashboard.setGlycerinGlobal(req, res);
});
module.exports = service_router;
