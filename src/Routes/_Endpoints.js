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

module.exports = analytics_routes;
