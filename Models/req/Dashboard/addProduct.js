function generateRandomString(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

class product {
  constructor(args) {
    this.productID = generateRandomString(8);
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
    ];
  }
}

exports.addProduct = (args, callback) => {
  return callback(new product(args));
};
