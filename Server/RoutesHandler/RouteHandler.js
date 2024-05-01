const controller = require("../../Server/CORE/Controller/Controller");

class routesHandler {
  constructor() {
    if (!routesHandler.instance) {
      routesHandler.instance = this;
    }
  }
}

module.exports = new routesHandler();
