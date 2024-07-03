const metrics = require("../Core/_Interface.js").metrics;

class Controller {
  constructor() {}
  getMetricsAll() {
    return metrics._getAllMetrics();
  }
  getMetricsByEmployee(employee) {
    return metrics._getEmployeeMetricsById(employee);
  }
  getGlobalMetrics() {
    return metrics._getGlobalMetrics();
  }
  getTotalMetrics() {
    return metrics._getTotalMetrics();
  }
}

module.exports = new Controller();
