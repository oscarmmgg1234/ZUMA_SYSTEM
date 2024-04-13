const {Constants} = require("../../../Constants/Tools_Interface.js");
const constants = new Constants();

class product {
  constructor(args) {
    this.productID = constants.generateRandomID(8);
    this.name = args.name;
    this.desc = args.desc;
    this.price = args.price;
    this.type = args.type;
    this.location = args.location;
    this.company = args.company;
    this.processType = args.processType;
    this.processComponentType = args.processComponentType;
    this.reductionType = args.reductionType;
    this.shipmentType = args.shipmentType;
    this.unitType = args.unitType;
    this.min_limit = args.minLimit;
    this.pillRatio = args.pillRatio;
  }
  to_arr() {
    return [
      this.productID,
      this.name,
      this.desc,
      this.price,
      this.type,
      this.location,
      this.company,
      this.processType,
      this.processComponentType,
      this.reductionType,
      this.shipmentType,
      this.unitType,
      this.min_limit,
      this.pillRatio,
    ];
  }
}

exports.addProduct = (args, callback) => {
  return callback(new product(args));
};
