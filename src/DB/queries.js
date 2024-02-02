const emailservice = {
  getRecipents: "SELECT * FROM notificationreceivers",
};

const inventory = {
  getInventory: "SELECT * FROM product_inventory",
  getProducts: "SELECT * FROM product",
};

exports.quieries = {
  emailservice: emailservice,
  inventory: inventory,
};
