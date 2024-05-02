const controller = require("../../Server/CORE/Controller/Controller");

class routesHandler {
  constructor() {
    if (!routesHandler.instance) {
      routesHandler.instance = this;
    }
  }
  async generatePDFA4(req, res) {
    res.setHeader("Content-Type", "application/pdf");
    const { data, template } = req.body;
    const pdf = await controller.generateA4PDF(data, template);
    res.send(Buffer.from(pdf, "base64")); // Convert from base64 if it's in base64 format
  }
}

module.exports = new routesHandler();
