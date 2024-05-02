const templates = require("../../../Templates/Templates");
const { singleInputEngine } = require("../Engines/singleInputEngine");

class Controller {
  constructor() {
    if (!Controller.instance) {
      Controller.instance = this;
    }
  }
  _getTemplate(templateName) {
    return templates.getTemplate(templateName);
  }
  async generateA4PDF(data, template) {
    const templateSRC = this._getTemplate(template);
    return await singleInputEngine(data, templateSRC);
  }
  async generateA4PDFMultiple(data, template) {}
}

module.exports = new Controller();
