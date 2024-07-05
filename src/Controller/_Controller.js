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
  async getMetricHistoryByDate(rangeStart, rangeEnd) {
    return await metrics.getDBMETRICSByDate(rangeStart, rangeEnd);
  }
  async getMetricTotalByDate(rangeStart, rangeEnd) {
    return await metrics.getDBMETRICSTOTALbyDate(rangeStart, rangeEnd);
  }
  async getEmployeeMetricsByDate(rangeStart, rangeEnd) {
    return await metrics.getDBMETRICSEMPLOYEEbyDate(rangeStart, rangeEnd);
  }
  async getGlobalMetricsByDate(rangeStart, rangeEnd) {
    return await metrics.getDBMETRICSGLOBALbyDate(rangeStart, rangeEnd);
  }
}

module.exports = new Controller();
