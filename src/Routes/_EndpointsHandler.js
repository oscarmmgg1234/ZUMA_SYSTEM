const controller = require("../Controller/_Controller");
const { get } = require("./_Endpoints");

class EndpointsHandler {
  constructor() {
    if (EndpointsHandler.instance instanceof EndpointsHandler) {
      return EndpointsHandler.instance;
    }
  }

  _RouteHandler = {
    getMetricsAll: (req, res) => {
      res.send(controller.getMetricsAll());
    },
    getMetricsByEmployee: (req, res) => {
      res.send(controller.getMetricsByEmployee(req.params.id));
    },
    getGlobalMetrics: (req, res) => {
      res.send(controller.getGlobalMetrics());
    },
    getTotalMetrics: (req, res) => {
      res.send(controller.getTotalMetrics());
    },
    getMetricHistory: async (req, res) => {
      const data = await controller.getMetricHistory();
      res.send(data);
    },
    getMetricHistoryByDate: async (req, res) => {
      const data = await controller.getMetricHistoryByDate(
        req.params.rangeStart,
        req.params.rangeEnd
      );
      res.send(data);
    },
    getMetricTotalByDate: async (req, res) => {
      const data = await controller.getMetricTotalByDate(
        req.params.rangeStart,
        req.params.rangeEnd
      );
      res.send(data);
    },
    getEmployeeMetricsByDate: async (req, res) => {
      const data = await controller.getEmployeeMetricsByDate(
        req.params.rangeStart,
        req.params.rangeEnd
      );
      res.send(data);
    },
    getGlobalMetricsByDate: async (req, res) => {
      const data = await controller.getGlobalMetricsByDate(
        req.params.rangeStart,
        req.params.rangeEnd
      );
      res.send(data);
    },
  };
}

module.exports = () => {
  return new EndpointsHandler();
};
