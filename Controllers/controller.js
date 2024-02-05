const { db_interface } = require("../DB/interface.js");
const { res_interface } = require("../Models/INTERFACE/res/res_interface.js");
const { Helper } = require("../Helpers/helper_interface.js");
const { init_services } = require("../Services/Services.js");

const helper = Helper();
const res = res_interface();
const db_api = db_interface();
const services = init_services();

const getTopEmployee = (callback) => {
  db_api.getTopEmployee((data) => {
    return callback(data);
  });
};

const addCompany = (args, callback) => {
  db_api.addCompany(args, (status) => {
    return callback(status);
  });
};

const deleteCompany = (args, callback) => {
  db_api.deleteCompany(args, (status) => {
    return callback(status);
  });
};

const updateTracking = (args) => {
  db_api.updateTracking(args);
};
const getCompaniesZuma = (callback) => {
  db_api.getZumaPartneredCompanies((data) => {
    return callback(data);
  });
};

const getInventory = (callback) => {
  db_api.getInventory((data) => {
    return callback(data);
  });
};

const addProduct = (args, callback) => {
  db_api.addProduct(args, (status) => {
    return callback(status);
  });
};

const deleteProduct = (args, callback) => {
  db_api.deleteProduct(args, (status) => {
    return callback(status);
  });
};
const getActivationByDate = (args, callback) => {
  db_api.getActivationByDate(args, (data) => {
    return callback(data);
  });
};

const getReductionByDate = (args, callback) => {
  db_api.getReductionByDate(args, (data) => {
    return callback(data);
  });
};

const modifyActiveStock = (args, callback) => {
  db_api.modifyStockGivenID(args, "active", (status) => {
    return callback(status);
  });
};

const modifyStoredStock = (args, callback) => {
  db_api.modifyStockGivenID(args, "stored", (status) => {
    return callback(status);
  });
};

const select_all_shipment_log = (callback) => {
  db_api.select_all_shipment_log((data) => {
    res.select_all(data, (data) => {
      return callback(data);
    });
  });
};

const getShipmentLog = (args, callback) => {
  db_api.getShipmentByDate(args, (data) => {
    return callback(data);
  });
};

const getProductAnalytics = (args, callback) => {
  db_api.get_product_stock(args, (stock) => {
    db_api.get_product_reduction_recent(args, (reduction) => {
      db_api.get_product_activation_recent(args, (activation) => {
        db_api.get_product_shipment_recent(args, (shipment) => {
          return callback({
            stock: stock,
            reduction: reduction,
            activation: activation,
            shipment: shipment,
          });
        });
      });
    });
  });
};

const insert_shipment_log = (args) => {
  db_api.insert_shipment_log(args);
};

const update_shipment_log = (args) => {
  db_api.update_shipment_log(args);
};

const delete_shipment_log = (args) => {
  db_api.delete_shipment_log(args);
};

const get_activation_product = (args, callback) => {
  db_api.get_activation_product(args, (data) => {
    return callback(data);
  });
};

const get_employee_info = (callback) => {
  db_api.get_employee_info((data) => {
    return callback(data);
  });
};

const get_product_by_id = (args, callback) => {
  db_api.get_product_by_id(args, (data) => {
    return callback(data);
  });
};

// class Barcode {
//   constructor(args) {
//     this.product_id = args.PRODUCT_ID;
//     this.employee = args.NAME != "" ? args.NAME : "NULL";
//     this.quantity = args.QUANTITY;
//     this.multiplier = args.MULTIPLIER;
//     this.product_name = args.PRODUCT_NAME;
//   }
// class product_inventory {
//   constructor(args) {
//     this.EMPLOYEE_ID = args.EMPLOYEE_ID;
//     this.PRODUCT_ID = args.PRODUCT_ID;
//     this.PRODUCT_NAME = args.PRODUCT_NAME;
//     this.QUANTITY = parseInt(args.QUANTITY);
//     this.MULTIPLIER = args.MULTIPLIER;
//     this.EMPLOYEE_NAME = args.EMPLOYEE_NAME;
//   }
//
const activate_product = (args) => {
  helper.activation_engine(args);
  // barcode generation
  services.http_print_barcode({
    PRODUCT_ID: args.PRODUCT_ID,
    NAME: args.EMPLOYEE_NAME,
    QUANTITY: args.QUANTITY,
    MULTIPLIER: args.MULTIPLIER,
    PRODUCT_NAME: args.PRODUCT_NAME,
    EMPLOYEE_ID: args.EMPLOYEE_ID,
    SRC: "Active/Passive",
  });
};

const get_products_info = (callback) => {
  db_api.get_products_info((data) => {
    return callback(data);
  });
};

const get_products_by_company = (args, callback) => {
  db_api.get_products_by_company(args, (data) => {
    return callback(data);
  });
};

const company_info = (callback) => {
  db_api.get_company_info((data) => {
    return callback(data);
  });
};

const generate_barcode = (args, callback) => {
  services.barcode_gen(args, (data) => {
    return callback(data);
  });
};

const product_reduction = (args, callback) => {
  db_api.checkBarcodeStatus([args.BARCODE_ID], (data) => {
    if (
      data[0].Status === "Active/Passive" ||
      data[0].Status === "Manually Printed"
    ) {
      helper.reduction_engine(args, (data) => {});
      return callback({ status: true, message: "Product Reduced" });
    } else {
      return callback({ status: false, message: "Product Already Reduced" });
    }
  });
};

const shipment_add = (args, callback) => {
  args.forEach((element) => {
    helper.shipment_engine(element, (data) => {});
  });
};

const get_shipment_log = (callback) => {
  db_api.get_shipment_log((data) => {
    return callback(data);
  });
};

const get_activation_log = (callback) => {
  db_api.get_activation_log((data) => {
    return callback(data);
  });
};

const get_consumption_log = (callback) => {
  db_api.get_consumption_log((data) => {
    return callback(data);
  });
};

const print_label = (args) => {
  services.http_print_label(args);
};

const getBarcodeData = (args, callback) => {
  db_api.get_barcode_data(args, (data) => {
    return callback(data);
  });
};

class controller {
  shipment_controller = {
    select_all_shipment: (callback) => {
      select_all_shipment_log((data) => {
        return callback(data);
      });
    },
    insert_shipment: (args) => {
      shipment_add(args, (data) => {});
    },
    update_shipment: (args) => {
      update_shipment_log(args);
    },
    delete_shipment_log: (args) => {
      delete_shipment_log(args);
    },
    getShipmentByDate: (args, callback) => {
      getShipmentLog(args, (data) => {
        return callback(data);
      });
    },
  };
  product_activation_controller = {
    get_activation_product: (args, callback) => {
      get_activation_product(args, (data) => {
        res.get_products(data, (data) => {
          return callback(data);
        });
      });
    },
    get_employee_info: (callback) => {
      get_employee_info((data) => {
        res.get_employee(data, (data) => {
          return callback(data);
        });
      });
    },
    activate_product: (args) => {
      activate_product(args);
    },
  };
  label_print_controller = {
    get_products_info: (callback) => {
      get_products_info((data) => {
        return callback(data);
      });
    },
    labelPrint: (args) => {
      print_label(args);
    },
  };
  shipment = {
    getProductsByCompany: (args, callback) => {
      get_products_by_company(args, (data) => {
        return callback(data);
      });
    },
    getCompanyInfo: (callback) => {
      company_info((data) => {
        return callback(data);
      });
    },
  };
  reduction = {
    product_reduction: (args, callback) => {
      product_reduction(args, (data) => {
        return callback(data);
      });
    },
  };
  services = {
    barcode_gen: (args, callback) => {
      generate_barcode(args, (data) => {
        return callback(data);
      });
    },
    getHistoryLog: (callback) => {
      get_shipment_log((data) => {
        return callback(data);
      });
    },
    getActivationLog: (callback) => {
      get_activation_log((data) => {
        return callback(data);
      });
    },
    getConsumptionLog: (callback) => {
      get_consumption_log((data) => {
        return callback(data);
      });
    },
  };
  tools = {
    get_product_by_id: (args, callback) => {
      get_product_by_id(args, (data) => {
        return callback(data);
      });
    },
    getBarcodeData: (args, callback) => {
      getBarcodeData(args, (data) => {
        return callback(data);
      });
    },
  };

  dashboard_controller = {
    getTopEmployee: (callback) => {
      getTopEmployee((data) => {
        return callback(data);
      });
    },
    addCompany: (args, callback) => {
      addCompany(args, (status) => {
        return callback(status);
      });
    },
    deleteCompany: (args, callback) => {
      deleteCompany(args, (status) => {
        return callback(status);
      });
    },
    updateTracking: (args) => {
      updateTracking(args);
    },
    getCompaniesZuma: (callback) => {
      getCompaniesZuma((data) => {
        return callback(data);
      });
    },
    getInventory: (callback) => {
      getInventory((data) => {
        return callback(data);
      });
    },
    getProductAnalytics: (args, callback) => {
      getProductAnalytics(args, (data) => {
        return callback(data);
      });
    },
    modifyActiveStock: (args, callback) => {
      modifyActiveStock(args, (status) => {
        return callback(status);
      });
    },
    modifyStoredStock: (args, callback) => {
      modifyStoredStock(args, (status) => {
        return callback(status);
      });
    },
    getActivationByDate: (args, callback) => {
      getActivationByDate(args, (data) => {
        return callback(data);
      });
    },
    getReductionByDate: (args, callback) => {
      getReductionByDate(args, (data) => {
        return callback(data);
      });
    },
    addProduct: (args, callback) => {
      addProduct(args, (status) => {
        return callback(status);
      });
    },
    deleteProduct: (args, callback) => {
      deleteProduct(args, (status) => {
        return callback(status);
      });
    },
  };
}

exports.controller_interface = () => {
  return new controller();
};
