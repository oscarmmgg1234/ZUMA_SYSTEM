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

class Company {
  constructor(args) {
    this.companyID = generateRandomString(4);
    this.name = args.name;
    this.address = args.address;
    this.type = args.type;
    this.phone = args.phone;
  }
  to_arr() {
    return [this.companyID, this.name, this.address, this.type, this.phone];
  }
}

exports.addCompany = (args, callback) => {
  return callback(new Company(args));
};
