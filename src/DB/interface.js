const { get } = require("https");
const { db } = require("./db_init.js");
const { quieries } = require("./queries.js");

const getRecipents = async () => {
  return new Promise((resolve, reject) => {
    db.query(quieries.emailservice.getRecipents, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const getProducts = async () => {
  return new Promise((resolve, reject) => {
    db.query(quieries.inventory.getProducts, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const getInventory = async () => {
  return new Promise((resolve, reject) => {
    db.query(quieries.inventory.getInventory, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

class db_interface {
  emailservice = {
    getRecipents: (callback) =>
      getRecipents((results) => {
        return callback(results);
      }),
  };
  inventory = {
    getProducts: (callback) =>
      getProducts((results) => {
        return callback(results);
      }),
    getInventory: (callback) =>
      getInventory((results) => {
        return callback(results);
      }),
  };
}

exports.db_interface = db_interface;
