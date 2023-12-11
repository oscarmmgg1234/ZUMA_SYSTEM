const { db } = require("./db_init.js");
const { queries } = require("./queries.js");

// const insertShipmentLog = (args) => {
//   var data = db.execute(queries.shipment_log.insert, args);
// };

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
class db_interface {
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
}

exports.db_interface = () => {
  return new db_interface();
};
