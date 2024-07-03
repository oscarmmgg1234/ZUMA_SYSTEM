const controller = require("../Controller/_Controller");

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
  };
}

module.exports = () => {
  return new EndpointsHandler();
};
