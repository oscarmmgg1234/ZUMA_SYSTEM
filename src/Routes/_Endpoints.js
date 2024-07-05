const express = require("express");
const analytics_routes = express.Router();
const RouteHandler = require("./_EndpointsHandler")();

analytics_routes.get("/metrics/all", (req, res) => {
  RouteHandler._RouteHandler.getMetricsAll(req, res);
});

analytics_routes.get("/metrics/employee/:id", (req, res) => {
  RouteHandler._RouteHandler.getMetricsByEmployee(req, res);
});

analytics_routes.get("/metrics/global", (req, res) => {
  RouteHandler._RouteHandler.getGlobalMetrics(req, res);
});

analytics_routes.get("/metrics/total", (req, res) => {
  RouteHandler._RouteHandler.getTotalMetrics(req, res);
});
analytics_routes.get("/metrics/history", async (req, res) => {
  await RouteHandler._RouteHandler.getMetricHistory(req, res);
});
analytics_routes.get(
  "/metrics/history/:rangeStart/:rangeEnd",
  async (req, res) => {
    await RouteHandler._RouteHandler.getMetricHistoryByDate(req, res);
  }
);
analytics_routes.get(
  "/metrics/employee/:rangeStart/:rangeEnd",
  async (req, res) => {
    await RouteHandler._RouteHandler.getEmployeeMetricsByDate(req, res);
  }
);
analytics_routes.get(
  "/metrics/global/:rangeStart/:rangeEnd",
  async (req, res) => {
    await RouteHandler._RouteHandler.getGlobalMetricsByDate(req, res);
  }
);
analytics_routes.get(
  "/metrics/total/:rangeStart/:rangeEnd",
  async (req, res) => {
    await RouteHandler._RouteHandler.getMetricTotalByDate(req, res);
  }
);

module.exports = analytics_routes;
