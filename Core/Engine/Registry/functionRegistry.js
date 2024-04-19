class FunctionRegistry {
  constructor() {}
  getFunction(key, id) {
    if (key == "AC") {
      return this.activation_reg.get(id);
    }
    if (key == "RD") {
      return this.reduction_reg.get(id);
    }
    if (key == "SH") {
      return this.shipment_reg.get(id);
    }
    if (key == "UP") {
      return this.update_reg.get(id);
    }
  }
  activation_reg = new Map();
  reduction_reg = new Map();
  shipment_reg = new Map();
  update_reg = new Map();
}

exports.FunctionRegistry = FunctionRegistry;