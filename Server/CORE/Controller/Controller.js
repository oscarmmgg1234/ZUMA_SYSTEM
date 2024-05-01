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
  async generateA4PDF(args) {}
  async generateA4PDFMultiple(args) {}
}

module.exports = new Controller();
