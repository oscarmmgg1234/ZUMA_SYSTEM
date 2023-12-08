const { db_interface } = require("../DB/interface.js");
const { res_interface } = require("../Models/INTERFACE/res/res_interface.js");
const { Helper } = require("../Helpers/helper_interface.js");
const { init_services } = require("../Services/Services.js");

const helper = Helper();
const res = res_interface();
const db_api = db_interface();
const services = init_services();

const select_all_shipment_log = (callback) => {
  db_api.select_all_shipment_log((data) => {
    res.select_all(data, (data) => {
      return callback(data);
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
  helper.reduction_engine(args, (data) => {
    return data;
  });
};

const shipment_add = (args, callback) => {
  args.forEach((element) => {
    helper.shipment_engine(element, (data) => {});
  });
};

const print_label = (args) => {
  services.http_print_label(args);
}
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
    }
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
  };
}

exports.controller_interface = () => {
  return new controller();
};
