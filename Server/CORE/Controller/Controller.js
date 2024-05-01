const templates = require("../../../Templates/Templates");

class Controller {
  constructor() {
    if (!Controller.instance) {
      Controller.instance = this;
    }
  }
  _getTemplate(templateName) {
    return templates.getTemplate(templateName);
  }
}

module.exports = new Controller();
