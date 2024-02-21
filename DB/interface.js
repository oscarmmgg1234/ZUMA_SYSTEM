const { db } = require("./db_init.js");
const { queries } = require("./queries.js");

// const insertShipmentLog = (args) => {
//   var data = db.execute(queries.shipment_log.insert, args);
// };

function getTransactionLog(callback) {
  db(queries.development.getTransactionLog, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
}

const addTransaction = (args) => {
  db(
    queries.development.addProductTransaction,
    [
      args.args.TRANSACTIONID,
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      0,
      args.src,
      args.args.EMPLOYEE_ID,
      args.args.PRODUCT_ID,
      args.args.QUANTITY,
    ],
    (err) => {
      if (err) {
      }
    }
  );
};

const setBarcodeEmployee = (args) => {
  db(queries.product_release.set_barcode_employee, args, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

checkBarcodeStatus = (args, callback) => {
  db(
    queries.product_release.checkBarcodeStatus,
    [args.BARCODE_ID],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return callback(result);
    }
  );
};

const getTopConsumpEmployee = (callback) => {
  db(queries.dashboard.getCompany, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const addCompany = (args, callback) => {
  db(queries.dashboard.addCompany, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
      return callback({ status: false, status_mes: "Error adding company" });
    }
    return callback({ status: true, status_mes: "Successfully added company" });
  });
};

const deleteCompany = (args, callback) => {
  db(queries.dashboard.deleteCompany, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
      return callback({ status: false, status_mes: "Error deleting company" });
    }
    return callback({
      status: true,
      status_mes: "Successfully deleted company",
    });
  });
};

const updateTracking = (args) => {
  db(queries.dashboard.updateProductMinLimit, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const getZumaPartneredCompanies = (callback) => {
  db(queries.dashboard.getCompanies, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const getProductInventory = (callback) => {
  db(queries.dashboard.getInventory, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const addProduct = (args, callback) => {
  db(queries.development.add_product, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
      return callback({ status: false, status_mes: "Error adding product" });
    }
    return callback({ status: true, status_mes: "Successfully added product" });
  });
};

const deleteProduct = (args, callback) => {
  db(queries.development.delete_product, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
      return callback({ status: false, status_mes: "Error deleting product" });
    }
    db(queries.development.delete_product_inventory, args.to_arr(), (err) => {
      if (err) {
        console.log(err);
        return callback({
          status: false,
          status_mes: "Error deleting product",
        });
      }
      return callback({
        status: true,
        status_mes: "Successfully deleted product",
      });
    });
  });
};

const modifyStockGivenID = (args, action, callback) => {
  if (action == "active") {
    db(queries.dashboard.get_active_stock, args.to_arr(), (err, result) => {
      if (err) {
        console.log(err);
        return callback({
          status: false,
          status_mes: "Error modifying database",
        });
      }
      if (result.length == 0) {
        return callback({
          status: false,
          status_mes: "Error modifying database",
        });
      }
      db(queries.dashboard.transform_active_product, [
        parseInt(args.quantity + result[0].ACTIVE_STOCK),
        args.productID,
      ]);
      return callback({
        status: true,
        status_mes: "Successfully modified database",
      });
    });
  }
  if (action == "stored") {
    db(queries.dashboard.get_stored_stock, args.to_arr(), (err, result) => {
      if (err) {
        console.log(err);
        return callback({
          status: false,
          status_mes: "Error modifying database",
        });
      }
      if (result.length == 0) {
        return callback({
          status: false,
          status_mes: "Error modifying database",
        });
      }
      db(queries.dashboard.transform_stored_product, [
        parseInt(args.quantity + result[0].STORED_STOCK),
        args.productID,
      ]);
      return callback({
        status: true,
        status_mes: "Successfully modified database",
      });
    });
  }
};

const getActivationByDate = (args, callback) => {
  db(queries.dashboard.activationByDate, args.to_arr(), (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const getReductionByDate = (args, callback) => {
  db(queries.dashboard.reductionByDate, args.to_arr(), (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const getShipmentLog = (args, callback) => {
  db(queries.shipment.get_shipment_log_byDate, args.to_arr(), (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const getBarcodeData = (args, callback) => {
  db(queries.tools.get_barcode_data, [args.BARCODE_ID], (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const getProductStock = (args, callback) => {
  db(queries.dashboard.get_product_stock, [args.PRODUCT_ID], (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const getProductReductionRecent = (args, callback) => {
  db(
    queries.dashboard.get_product_reduction_recent,
    [args.PRODUCT_ID],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return callback(result);
    }
  );
};

const getProductActivationRecent = (args, callback) => {
  db(
    queries.dashboard.get_product_activation_recent,
    [args.PRODUCT_ID],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return callback(result);
    }
  );
};

const getProductShipmentRecent = (args, callback) => {
  db(
    queries.dashboard.get_product_shipment_recent,
    [args.PRODUCT_ID],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return callback(result);
    }
  );
};

const getProductById = (args, callback) => {
  db(queries.tools.get_product_by_id, [args], (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const insertShipmentLog = (args) => {
  db(queries.shipment_log.insert, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const selectAllShipmentLog = (callback) => {
  db(queries.shipment_log.select_all, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const updateShipmentLog = (args) => {
  db(queries.shipment_log.update, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const deleteShipmentLog = (args) => {
  db(queries.shipment_log.delete, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const getActivationProduct = (args, callback) => {
  db(
    queries.activation_product.get_product_by_type,
    args.to_arr(),
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return callback(result);
    }
  );
};

const getEmployeeInfo = (callback) => {
  db(queries.activation_product.get_employee_info, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const getEmployeeInfoByID = (args, callback) => {
  db(queries.tools.get_employee_info, [args], (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const getProductsInfo = (callback) => {
  db(queries.label_print.get_products_info, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const getProductsByCompany = (args, callback) => {
  db(
    queries.shipment.get_product_by_company,
    [args.COMPANY_ID],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return callback(result);
    }
  );
};

const get_company_info = (callback) => {
  db(queries.shipment.get_company_info, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const get_shipment_log = (callback) => {
  db(queries.tools.shipment_log, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const get_activation_log = (callback) => {
  db(queries.tools.activation_log, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const get_consumption_log = (callback) => {
  db(queries.tools.consumption_log, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

class db_interface {
  getTransactionLog = (callback) => {
    getTransactionLog((data) => {
      return callback(data);
    });
  };
  addTransaction = (args) => {
    addTransaction(args);
  };
  setBarcodeEmployee = (args) => {
    setBarcodeEmployee(args);
  };

  checkBarcodeStatus = (args, callback) => {
    checkBarcodeStatus(args, (data) => {
      return callback(data);
    });
  };
  getTopEmployee = (callback) => {
    getTopConsumpEmployee((data) => {
      return callback(data);
    });
  };
  addCompany = (args, callback) => {
    addCompany(args, (status) => {
      return callback(status);
    });
  };
  deleteCompany = (args, callback) => {
    deleteCompany(args, (status) => {
      return callback(status);
    });
  };
  updateTracking = (args) => {
    updateTracking(args);
  };
  getShipmentByDate = (args, callback) => {
    getShipmentLog(args, (data) => {
      return callback(data);
    });
  };
  get_shipment_log = (callback) => {
    get_shipment_log((data) => {
      return callback(data);
    });
  };
  get_activation_log = (callback) => {
    get_activation_log((data) => {
      return callback(data);
    });
  };
  get_consumption_log = (callback) => {
    get_consumption_log((data) => {
      return callback(data);
    });
  };
  insert_shipment_log = (args, callback) => {
    return insertShipmentLog(args, (data) => {
      return callback(data);
    });
  };
  select_all_shipment_log = (callback) => {
    return selectAllShipmentLog((data) => {
      return callback(data);
    });
  };
  update_shipment_log = (args) => {
    updateShipmentLog(args);
  };
  delete_shipment_log = (args) => {
    deleteShipmentLog(args);
  };
  get_activation_product = (args, callback) => {
    getActivationProduct(args, (data) => {
      return callback(data);
    });
  };
  get_employee_info = (callback) => {
    getEmployeeInfo((data) => {
      return callback(data);
    });
  };
  get_products_info = (callback) => {
    getProductsInfo((data) => {
      return callback(data);
    });
  };
  get_products_by_company = (args, callback) => {
    getProductsByCompany(args, (data) => {
      return callback(data);
    });
  };
  get_company_info = (callback) => {
    get_company_info((data) => {
      return callback(data);
    });
  };
  get_product_by_id = (args, callback) => {
    getProductById(args, (data) => {
      return callback(data);
    });
  };
  get_product_stock = (args, callback) => {
    getProductStock(args, (data) => {
      return callback(data);
    });
  };
  get_product_reduction_recent = (args, callback) => {
    getProductReductionRecent(args, (data) => {
      return callback(data);
    });
  };
  get_product_activation_recent = (args, callback) => {
    getProductActivationRecent(args, (data) => {
      return callback(data);
    });
  };
  get_product_shipment_recent = (args, callback) => {
    getProductShipmentRecent(args, (data) => {
      return callback(data);
    });
  };
  get_barcode_data = (args, callback) => {
    getBarcodeData(args, (data) => {
      return callback(data);
    });
  };
  modifyStockGivenID = (args, action, callback) => {
    modifyStockGivenID(args, action, (status) => {
      return callback(status);
    });
  };
  getActivationByDate = (args, callback) => {
    getActivationByDate(args, (data) => {
      return callback(data);
    });
  };
  getReductionByDate = (args, callback) => {
    getReductionByDate(args, (data) => {
      return callback(data);
    });
  };
  addProduct = (args, callback) => {
    addProduct(args, (status) => {
      return callback(status);
    });
  };
  deleteProduct = (args, callback) => {
    deleteProduct(args, (status) => {
      return callback(status);
    });
  };
  getInventory = (callback) => {
    getProductInventory((data) => {
      return callback(data);
    });
  };
  getZumaPartneredCompanies = (callback) => {
    getZumaPartneredCompanies((data) => {
      return callback(data);
    });
  };
  getEmployeeInfoByID = (args, callback) => {
    getEmployeeInfoByID(args, (data) => {
      return callback(data);
    });
  };
}

exports.db_interface = () => {
  return new db_interface();
};
