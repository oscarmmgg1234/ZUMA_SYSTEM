const { query } = require("express");
const { db } = require("./db_init.js");
const { queries } = require("./queries.js");

// const insertShipmentLog = (args) => {
//   var data = db.execute(queries.shipment_log.insert, args);
// };
const updateTracking = (args) => {
  db.execute(queries.dashboard.updateProductMinLimit, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const getZumaPartneredCompanies = (callback) => {
  db.execute(queries.dashboard.getCompanies, (err, result) => {
    if (err) {
      console.log(err);
    }
    return callback(result);
  });
};

const getProductInventory = (callback) => {
  db.execute(queries.dashboard.getInventory, (err, result) => {
    return callback(result);
  });
};

const addProduct = (args, callback) => {
  db.execute(queries.development.add_product, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
      return callback({ status: false, status_mes: "Error adding product" });
    }
    return callback({ status: true, status_mes: "Successfully added product" });
  });
};

const deleteProduct = (args, callback) => {
  db.execute(queries.development.delete_product, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
      return callback({ status: false, status_mes: "Error deleting product" });
    }
    db.execute(
      queries.development.delete_product_inventory,
      args.to_arr(),
      (err) => {
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
      }
    );
  });
};

const modifyStockGivenID = (args, action, callback) => {
  if (action == "active") {
    db.execute(
      queries.dashboard.get_active_stock,
      args.to_arr(),
      (err, result) => {
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
        db.execute(queries.dashboard.transform_active_product, [
          parseInt(args.quantity + result[0].ACTIVE_STOCK),
          args.productID,
        ]);
        return callback({
          status: true,
          status_mes: "Successfully modified database",
        });
      }
    );
  }
  if (action == "stored") {
    db.execute(
      queries.dashboard.get_stored_stock,
      args.to_arr(),
      (err, result) => {
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
        db.execute(queries.dashboard.transform_stored_product, [
          parseInt(args.quantity + result[0].STORED_STOCK),
          args.productID,
        ]);
        return callback({
          status: true,
          status_mes: "Successfully modified database",
        });
      }
    );
  }
};

const getActivationByDate = (args, callback) => {
  db.execute(
    queries.dashboard.activationByDate,
    args.to_arr(),
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return callback(result);
    }
  );
};

const getReductionByDate = (args, callback) => {
  db.execute(
    queries.dashboard.reductionByDate,
    args.to_arr(),
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return callback(result);
    }
  );
};

const getShipmentLog = (args, callback) => {
  db.execute(
    queries.shipment.get_shipment_log_byDate,
    [args.date],
    (err, result) => {
      return callback(result);
    }
  );
};

const getBarcodeData = (args, callback) => {
  db.execute(
    queries.tools.get_barcode_data,
    [args.BARCODE_ID],
    (err, result) => {
      return callback(result);
    }
  );
};

const getProductStock = (args, callback) => {
  db.execute(
    queries.dashboard.get_product_stock,
    [args.PRODUCT_ID],
    (err, result) => {
      return callback(result);
    }
  );
};

const getProductReductionRecent = (args, callback) => {
  db.execute(
    queries.dashboard.get_product_reduction_recent,
    [args.PRODUCT_ID],
    (err, result) => {
      return callback(result);
    }
  );
};

const getProductActivationRecent = (args, callback) => {
  db.execute(
    queries.dashboard.get_product_activation_recent,
    [args.PRODUCT_ID],
    (err, result) => {
      return callback(result);
    }
  );
};

const getProductShipmentRecent = (args, callback) => {
  db.execute(
    queries.dashboard.get_product_shipment_recent,
    [args.PRODUCT_ID],
    (err, result) => {
      return callback(result);
    }
  );
};

const getProductById = (args, callback) => {
  db.execute(queries.tools.get_product_by_id, args.to_arr(), (err, result) => {
    return callback(result);
  });
};

const insertShipmentLog = (args) => {
  db.execute(queries.shipment_log.insert, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const selectAllShipmentLog = (callback) => {
  db.execute(queries.shipment_log.select_all, (err, result) => {
    return callback(result);
  });
};

const updateShipmentLog = (args) => {
  db.execute(queries.shipment_log.update, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const deleteShipmentLog = (args) => {
  db.execute(queries.shipment_log.delete, args.to_arr(), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const getActivationProduct = (args, callback) => {
  db.execute(
    queries.activation_product.get_product_by_type,
    args.to_arr(),
    (err, result) => {
      return callback(result);
    }
  );
};

const getEmployeeInfo = (callback) => {
  db.execute(queries.activation_product.get_employee_info, (err, result) => {
    return callback(result);
  });
};

const getProductsInfo = (callback) => {
  db.execute(queries.label_print.get_products_info, (err, result) => {
    return callback(result);
  });
};

const getProductsByCompany = (args, callback) => {
  db.execute(
    queries.shipment.get_product_by_company,
    [args.COMPANY_ID],
    (err, result) => {
      return callback(result);
    }
  );
};

const get_company_info = (callback) => {
  db.execute(queries.shipment.get_company_info, (err, result) => {
    return callback(result);
  });
};

const get_shipment_log = (callback) => {
  db.execute(queries.tools.shipment_log, (err, result) => {
    return callback(result);
  });
};

const get_activation_log = (callback) => {
  db.execute(queries.tools.activation_log, (err, result) => {
    return callback(result);
  });
};

const get_consumption_log = (callback) => {
  db.execute(queries.tools.consumption_log, (err, result) => {
    return callback(result);
  });
};

class db_interface {
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
}

exports.db_interface = () => {
  return new db_interface();
};
