const express = require("express");
const dashboard_router = express.Router();
const { endpointHandler } = require("../endpoint_handler");

const endpoint_handler = endpointHandler();

dashboard_router.post("/")
dashboard_router.post("/manageCompanies", async (req, res) => {
  await endpoint_handler.services.manageCompanies(req, res);
});
dashboard_router.post("/updateProductCompany", async (req, res) => {
  await endpoint_handler.services.updateProductCompany(req, res);
});
dashboard_router.get("/getCompaniesWithProducts", async (req, res) => {
  await endpoint_handler.services.getCompanyWithProducts(req, res);
});

dashboard_router.post("/tokenPreCheck", async (req, res) => {
  await endpoint_handler.dashboard.tokenPreCheck(req, res);
});
dashboard_router.post("/getProductHistory", async (req, res) => {
  await endpoint_handler.dashboard.getProductHistoryByDate(req, res);
});

dashboard_router.post("/genPdfSpecific", async (req, res) => {
  await endpoint_handler.services.genPDFSpecific(req, res);
});
dashboard_router.post("/gen_inv_pdf_by_company", async (req, res) => {
  await endpoint_handler.services.get_inventory_by_company_pdf(req, res);
});
dashboard_router.post("/gen_inv_pdf_A4", async (req, res) => {
  await endpoint_handler.services.gen_inventory_pdf(req, res);
});

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

dashboard_router.post("/deleteProduct", async (req, res) => {
  await endpoint_handler.dashboard.deleteProduct(req, res);
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

dashboard_router.post("/getProductByID", async (req, res) => {
  await endpoint_handler.dashboard.getProductByID(req, res);
});
dashboard_router.get("/getVirtualStockPools", async (req, res) => {
  await endpoint_handler.dashboard.getVirtualStockPools(req, res);
});

dashboard_router.post("/createVirtualPool", async (req, res) => {
  await endpoint_handler.dashboard.createVirtualPool(req, res);
});
dashboard_router.post("/virtualStockProductAdd", async (req, res) => {
  await endpoint_handler.dashboard.virtualStockProductAdd(req, res);
});
dashboard_router.post("/virtualStockProductRemove", async (req, res) => {
  await endpoint_handler.dashboard.virtualStockProductRemove(req, res);
});
dashboard_router.post("/apiUpdateVirtualPoolRefs", async (req, res) => {
  await endpoint_handler.dashboard.API_updateVirtualPoolRefs(req, res);
});

dashboard_router.post("/apiUpdateVirtualStock", async (req, res) => {
  await endpoint_handler.dashboard.API_updateVirtualStock(req, res);
});

dashboard_router.post("/apiUpdateVirtualPoolName", async (req, res) => {
  console.log(req.body);
  await endpoint_handler.dashboard.API_updateVirtualPoolName(req, res);
});

dashboard_router.post("/apiRemoveVirtualPool", async (req, res) => {
  await endpoint_handler.dashboard.API_removeVirtualPool(req, res);
});

dashboard_router.post("/apiCreateVirtualStockPool", async (req, res) => {
  await endpoint_handler.dashboard.API_createVirtualStockPool(req, res);
});
module.exports = dashboard_router;
