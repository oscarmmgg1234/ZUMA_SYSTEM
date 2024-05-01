const fs = require("fs");
const path = require("path");

class templates {
  constructor() {
    if (!templates.instance) {
      templates.instance = this;
    }
    this.templates = new Map();
    this._loadTemplates();
  }

  _loadTemplates() {
    fs.readdirSync("./Templates/EMPLOYEE").forEach((file) => {
      let templateName = path.basename(file, ".HTML");
      let templateContent = fs.readFileSync(
        `./Templates/EMPLOYEE/${file}`,
        "utf-8"
      );
      this.templates.set(templateName, templateContent);
    });
    fs.readdirSync("./Templates/INVENTORY").forEach((file) => {
      let templateName = path.basename(file, ".HTML");
      let templateContent = fs.readFileSync(
        `./Templates/INVENTORY/${file}`,
        "utf-8"
      );
      this.templates.set(templateName, templateContent);
    });
  }
  getTemplate(templateName) {
    try {
      return this.templates.get(templateName);
    } catch (e) {
      console.log(e);
      throw new Error("Template not found");
    }
  }
}
module.exports = new templates();
