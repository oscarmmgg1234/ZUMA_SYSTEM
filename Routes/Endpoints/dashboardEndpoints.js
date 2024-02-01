const express = require("express");
const dashboard_router = express.Router();
const { endpointHandler } = require("../endpoint_handler");

const endpoint_handler = endpointHandler();

dashboard_router.post("/get_products_dash", (req, res) => {
  endpoint_handler.dashboard.get_products(req, res);
});

dashboard_router.post("/get_product_analytics", (req, res) => {
  endpoint_handler.dashboard.get_product_analytics(req, res);
});

dashboard_router.post("/modify_active_stock", (req, res) => {
  endpoint_handler.dashboard.modifyActiveStock(req, res);
});

dashboard_router.post("/modify_stored_stock", (req, res) => {
  endpoint_handler.dashboard.modifyStoredStock(req, res);
});

dashboard_router.post("/getActivationByDate", (req, res) => {
  endpoint_handler.dashboard.getActivationByDate(req, res);
});

dashboard_router.post("/getReductionByDate", (req, res) => {
  endpoint_handler.dashboard.getReductionByDate(req, res);
});

dashboard_router.post("/deleteProduct", (req, res) => {
  endpoint_handler.dashboard.deleteProduct(req, res);
});

dashboard_router.post("/addProduct", (req, res) => {
  endpoint_handler.dashboard.addProduct(req, res);
});

dashboard_router.post("/getInventory", (req, res) => {
  endpoint_handler.dashboard.getInventory(req, res);
});

dashboard_router.post("/getPartnerCompanies", (req, res) => {
  endpoint_handler.dashboard.getCompanies(req, res);
});

dashboard_router.post("/trackProduct", (req, res) => {
  endpoint_handler.dashboard.updateTracking(req, res);
});
dashboard_router.post("/addCompany", (req, res) => {
  endpoint_handler.dashboard.addCompany(req, res);
});

dashboard_router.post("/deleteCompany", (req, res) => {
  endpoint_handler.dashboard.deleteCompany(req, res);
});

dashboard_router.post("/getTopEmployee", (req, res) => {
  endpoint_handler.dashboard.getTopEmployee(req, res);
});

module.exports = dashboard_router;
